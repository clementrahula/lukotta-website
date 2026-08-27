#!/usr/bin/env node
/* Builds public/ from site.config.json, content/<lang>.json and src/.
   public/ is generated output and is not committed. */

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { renderPage, renderTaskPage, FORMATS, REQUIREMENTS } from "../src/page.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const CONTENT = join(ROOT, "content");
const OUT = join(ROOT, "public");

const cfg = JSON.parse(readFileSync(join(ROOT, "site.config.json"), "utf8"));
const strict = process.argv.includes("--strict");

/* Reads a WebP's dimensions, so the <img> carries real width and height
   attributes and the page does not shift while it loads. WebP stores them
   differently in each of its three chunk types. */
function webpSize(file) {
  const b = readFileSync(file);
  if (b.length < 30 || b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error(`${file} is not a WebP.`);
  }
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return {
      width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)),
      height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)),
    };
  }
  if (chunk === "VP8L") {
    const n = b.readUInt32LE(21);
    return { width: 1 + (n & 0x3fff), height: 1 + ((n >> 14) & 0x3fff) };
  }
  if (chunk === "VP8 ") {
    return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  throw new Error(`${file}: unrecognised WebP chunk ${chunk}`);
}

const warnings = [];
const warn = (m) => { warnings.push(m); };

/* ------------------------------------------------------------- content -- */

/* Translation files store each string as {en, <code>}, so one file can be
   reviewed without opening another. en.json stores plain strings. */
/* Strings that replace the standard translation on one language's page.
   They have no English original. */
function loadLocalOnly(code) {
  const file = join(CONTENT, `${code}.json`);
  if (!existsSync(file)) return {};
  const local = JSON.parse(readFileSync(file, "utf8")).localOnly || {};
  const out = {};
  for (const [key, value] of Object.entries(local)) {
    if (!key.startsWith("$") && typeof value === "string" && value) out[key] = value;
  }
  return out;
}

function loadStrings(code) {
  const file = join(CONTENT, `${code}.json`);
  if (!existsSync(file)) return null;
  const data = JSON.parse(readFileSync(file, "utf8"));
  const out = {};
  for (const [key, value] of Object.entries(data.strings || {})) {
    if (typeof value === "string") out[key] = value;
    /* An absent slot is not a translation. Leaving it empty sends it through
       the translator's own fallback, which records the miss, so this file and
       check.mjs count the same keys as done. */
    else if (value && typeof value === "object") out[key] = value[code] || "";
  }
  return out;
}

const english = loadStrings("en");
if (!english) throw new Error("content/en.json is missing. Every page is built from it.");

const requested = new Set();

function translator(code, strings, localOnly) {
  const missing = new Set();
  const t = (key) => {
    requested.add(key);
    /* localOnly takes precedence over the translation. */
    let value = (localOnly && localOnly[key]) || strings[key];
    if (value === undefined || value === "") {
      missing.add(key);
      value = english[key];
    }
    if (value === undefined) throw new Error(`No string for "${key}", not even in English.`);
    return value
      .replace(/\{version\}/g, cfg.appVersion)
      .replace(/\{year\}/g, String(new Date().getUTCFullYear()));
    /* {author} is left unsubstituted; page.mjs renders it as a link. */
  };
  t.missing = missing;
  return t;
}

/* ---------------------------------------------------------------- build -- */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

/* Static files that every page shares. Their names carry a digest of their
   own contents, so a page always loads the stylesheet and the script it was
   built against. A cache can then hold them as long as it likes: a changed
   file is a different name, never a stale hit under the old one. */
function fingerprint(sourceName, extension) {
  const body = readFileSync(join(SRC, sourceName));
  const digest = createHash("sha256").update(body).digest("hex").slice(0, 10);
  const name = `${sourceName.replace(extension, "")}.${digest}${extension}`;
  writeFileSync(join(OUT, name), body);
  return name;
}
const CSS = fingerprint("styles.css", ".css");
const JS = fingerprint("script.js", ".js");
/* Only the two marks are loaded by a page. The other files in
   src/assets/brand are sources for the generated icons and are not published. */
mkdirSync(join(OUT, "assets", "brand"), { recursive: true });
for (const mark of ["lukotta-mark-light.png", "lukotta-mark-dark.png"]) {
  cpSync(join(SRC, "assets", "brand", mark), join(OUT, "assets", "brand", mark));
}
if (existsSync(join(SRC, "assets", "icons"))) {
  cpSync(join(SRC, "assets", "icons"), join(OUT, "assets"), { recursive: true });
  /* Tools that ask for /favicon.ico by habit rather than reading the markup. */
  const ico = join(SRC, "assets", "icons", "favicon.ico");
  if (existsSync(ico)) cpSync(ico, join(OUT, "favicon.ico"));
}
cpSync(join(SRC, "assets", "fonts"), join(OUT, "assets", "fonts"), { recursive: true });

/* One light and one dark screenshot per language. A language without its own
   pair falls back to English, and the build reports which languages did. */
const SHOTS = join(SRC, "assets", "screenshots");
const usingFallback = [];

function resolveShots(code) {
  const own = join(SHOTS, code);
  const hasOwn = ["light", "dark"].every((v) => existsSync(join(own, `${v}.webp`)));
  if (!hasOwn) {
    usingFallback.push(code);
    if (!existsSync(join(SHOTS, cfg.defaultLang, "light.webp"))) {
      throw new Error(`No screenshots for "${code}" and none for ${cfg.defaultLang} to fall back to.`);
    }
  }
  const from = hasOwn ? own : join(SHOTS, cfg.defaultLang);
  const to = join(OUT, "assets", "screenshots", code);
  mkdirSync(to, { recursive: true });
  for (const v of ["light", "dark"]) cpSync(join(from, `${v}.webp`), join(to, `${v}.webp`));

  const light = webpSize(join(from, "light.webp"));
  const dark = webpSize(join(from, "dark.webp"));
  if (light.width !== dark.width || light.height !== dark.height) {
    warn(`${code}: light and dark screenshots differ in size (${light.width}x${light.height} vs ${dark.width}x${dark.height}); the page shifts when the appearance changes.`);
  }
  return light;
}

/* Every language with a content file is built and fully wired: hreflang,
   sitemap, language menu, language chooser. Translation state does not affect
   this.

   Completeness is measured only to gate release. Publishing 37 copies of the
   English page would be duplicate content, so check.mjs --strict fails until
   every language is translated. The deploy workflow runs it. */
const buildable = cfg.languages.filter(
  (l) => l.code === cfg.defaultLang || existsSync(join(CONTENT, `${l.code}.json`))
);

/* A translation carries the English it was made from. When the English moves
   on, the translation is still answering the old sentence: the page reads
   fluently and says the wrong thing, which is worse than an obvious gap. */
for (const lang of cfg.languages) {
  if (lang.code === cfg.defaultLang) continue;
  const file = join(CONTENT, `${lang.code}.json`);
  if (!existsSync(file)) continue;
  const mine = JSON.parse(readFileSync(file, "utf8")).strings || {};
  const stale = Object.entries(english).filter(([key, en]) => {
    const pair = mine[key];
    return pair && typeof pair === "object" && pair[lang.code] && typeof pair.en === "string" && pair.en !== en;
  }).map(([key]) => key);
  if (stale.length) {
    warn(`${lang.code}: ${stale.length} translation(s) made from English that has since changed: ${stale.slice(0, 4).join(", ")}${stale.length > 4 ? "…" : ""}`);
  }
}

const totalKeys = Object.keys(english).length;
const completeness = new Map();
for (const lang of buildable) {
  if (lang.code === cfg.defaultLang) { completeness.set(lang.code, 1); continue; }
  const strings = loadStrings(lang.code) || {};
  const done = Object.keys(english).filter((k) => strings[k]).length;
  completeness.set(lang.code, totalKeys ? done / totalKeys : 0);
}

const noPage = cfg.languages.filter((l) => !buildable.includes(l)).map((l) => l.code);
const partial = buildable.filter((l) => completeness.get(l.code) !== 1).map((l) => l.code);

/* One alternate per page, plus the region codes listed in alsoServes.
   es-419 and es-MX resolve to the Spanish page. No extra pages are built. */
const alternates = [
  ...buildable.flatMap((l) => {
    const href = l.path ? `${cfg.domain}/${l.path}/` : `${cfg.domain}/`;
    return [l.code, ...(l.alsoServes || [])].map((code) => ({ code, href }));
  }),
  { code: "x-default", href: `${cfg.domain}/` },
];

/* Every inline script is hashed, so the policy names exactly the ones this
   build wrote and nothing else may run. A static host cannot send headers;
   frame-ancestors and HSTS are Cloudflare's, and AGENTS.md states them. */
function withPolicy(html) {
  const hashes = [];
  for (const m of html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    hashes.push(`'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`);
  }
  const policy = [
    "default-src 'none'",
    `script-src 'self' ${hashes.join(" ")}`,
    "style-src 'self'",
    "img-src 'self'",
    "font-src 'self'",
    "manifest-src 'self'",
    "form-action 'none'",
    "base-uri 'none'",
  ].join("; ");
  if (!html.includes("__CSP__")) throw new Error("page.mjs no longer carries the __CSP__ placeholder.");
  return html.replace("__CSP__", policy);
}

/* Pages about one subject each. One file per language; a language without one
   has no task pages and no links to them, rather than a half-English set. */
function loadTaskPages(code) {
  const file = join(ROOT, "content", "pages", `${code}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}

const taskPagesBuilt = [];

const built = [];

for (const lang of buildable) {
  const strings = loadStrings(lang.code);
  const localOnly = loadLocalOnly(lang.code);
  const t = translator(lang.code, strings || english, localOnly);
  const canonical = lang.path ? `${cfg.domain}/${lang.path}/` : `${cfg.domain}/`;
  const assetPrefix = lang.path ? "../" : "./";

  const shotSize = resolveShots(lang.code);
  /* styles.css shows the frame at 720px. A narrower capture would be stretched. */
  if (shotSize.width < 720) warn(`${lang.code}: screenshot is ${shotSize.width}px wide; the frame displays it at 720px.`);

  const taskPages = loadTaskPages(lang.code);
  const html = withPolicy(renderPage({ lang, cfg, t, alternates, canonical, assetPrefix, shotSize, buildable, indexable: buildable, assets: { css: CSS, js: JS }, taskPages }));

  const dir = lang.path ? join(OUT, lang.path) : OUT;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf8");

  if (taskPages) {
    const taskPrefix = lang.path ? "../../" : "../";
    for (const key of taskPages.order) {
      const page = { ...taskPages.pages[key], free: taskPages.ui.free };
      /* The address comes from this language's own file, so a translation can
         carry a slug in its own words rather than an English one. */
      const slug = page.slug;
      const taskCanonical = `${cfg.domain}/${lang.path ? `${lang.path}/` : ""}${slug}/`;
      const taskHtml = withPolicy(renderTaskPage({
        page, slug, lang, cfg, t, buildable, canonical: taskCanonical,
        assetPrefix: taskPrefix, assets: { css: CSS, js: JS },
        home: lang.path ? `../../${lang.path}/` : "../",
      }));
      const taskDir = join(dir, slug);
      mkdirSync(taskDir, { recursive: true });
      writeFileSync(join(taskDir, "index.html"), taskHtml, "utf8");
      taskPagesBuilt.push({ code: lang.code, slug, title: page.title, description: page.description });
    }
  }

  if (t.missing.size && completeness.get(lang.code) !== 0) {
    warn(`${lang.code}: ${t.missing.size} of ${totalKeys} strings fell back to English: ${[...t.missing].slice(0, 4).join(", ")}${t.missing.size > 4 ? ", …" : ""}`);
  }
  built.push(lang.code);
}

/* ---------------------------------------------------------- sitemap etc -- */

/* The commit date of the last change to a file, falling back to its mtime
   outside a git checkout, or in a shallow clone with no history for the path.
   The workflows check out with fetch-depth: 0 so the history is there. */
const stampCache = new Map();
function lastChanged(file) {
  if (stampCache.has(file)) return stampCache.get(file);
  let iso = "";
  if (existsSync(file)) {
    try {
      iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", file],
        { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
        .trim().slice(0, 10);
    } catch { /* no git, or no checkout */ }
    if (!iso) iso = statSync(file).mtime.toISOString().slice(0, 10);
  }
  if (!iso) iso = new Date().toISOString().slice(0, 10);
  stampCache.set(file, iso);
  return iso;
}

const builtLangs = buildable.filter((l) => built.includes(l.code));

/* The sitemap must declare the same alternates as the pages, region aliases
   included. Google discards an hreflang cluster whose signals disagree. */
const urlEntries = builtLangs
  .map((l) => {
    const loc = l.path ? `${cfg.domain}/${l.path}/` : `${cfg.domain}/`;
    const links = alternates
      .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.code}" href="${a.href}"/>`)
      .join("\n");

    /* When this page last changed, which is later than its translation file
       alone. The version number comes from the configuration and the format
       names from the template, and both are printed on every page, so a
       release or a new format changes all thirty-seven without touching a
       single content file. Taking the latest of the four keeps the field
       honest in both directions: it does not sit still through a change a
       reader can see, and it does not move for a deploy that changed nothing.
       (Mtime cannot be used here: a fresh CI checkout gives every file the
       same one, which would stamp all 37 URLs with the deploy date.) */
    const lastmod = [
      join(CONTENT, `${l.code}.json`),
      join(CONTENT, `${cfg.defaultLang}.json`),   /* English shows through wherever a string is untranslated */
      join(SRC, "page.mjs"),                      /* structure, and the format names, which are never translated */
      join(ROOT, "site.config.json"),             /* the version, printed under the download button */
    ].map(lastChanged).sort().at(-1);

    return `  <url>
    <loc>${loc}</loc>
${links}
    <lastmod>${lastmod}</lastmod>
    <priority>${l.path ? "0.8" : "1.0"}</priority>
  </url>`;
  })
  .join("\n");

/* The task pages, listed after the landing pages. Each names only itself:
   hreflang describes the same page in another language, and until these are
   translated there is no other language to point at. */
const taskEntries = taskPagesBuilt.map(({ code, slug }) => {
  const lang = cfg.languages.find((l) => l.code === code);
  const loc = `${cfg.domain}/${lang.path ? `${lang.path}/` : ""}${slug}/`;
  return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
}).join("\n");

writeFileSync(
  join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
${taskEntries}
</urlset>
`,
  "utf8"
);

/* llms.txt, a proposed convention for handing an assistant a plain summary of
   a site rather than making it infer one from markup. Adoption is not settled;
   it is written because it costs nothing and states the facts in one place. */
/* "writing is experimental" only says anything about a format that can be
   written to at all. */
/* llms.txt, a proposed convention for handing an assistant a plain summary of
   a site rather than making it infer one from markup. Adoption is not settled;
   it is written because it costs nothing and states the facts in one place.
   Every claim below is taken from the content the pages are built from, so
   there is nothing here that can drift away from what a reader is shown. */
const readWrite = (r) =>
  r.write ? (r.experimental ? "read and write, writing experimental" : "read and write") : "read only";
const formatLines = FORMATS.map((g) => {
  const rows = g.rows.map((r) => `${r.name} (${readWrite(r)})`);
  return `- ${english[g.group]}: ${rows.join("; ")}`;
}).join("\n");

const notOpened = [1, 2, 3, 4, 5]
  .map((n) => english[`formats.not.${n}`])
  .filter(Boolean)
  .map((line) => `- ${line}`)
  .join("\n");

/* An answer may run to more than one paragraph, as faq.1 does: a, then a2 and
   onward. Collect whatever is there rather than assuming one. */
const answerOf = (n) => {
  const parts = [english[`faq.${n}.a`]];
  for (let i = 2; english[`faq.${n}.a${i}`]; i++) parts.push(english[`faq.${n}.a${i}`]);
  return parts.filter(Boolean).join("\n\n");
};
const questions = [1, 2, 3, 4, 5, 6]
  .map((n) => [english[`faq.${n}.q`], answerOf(n)])
  .filter(([q, a]) => q && a)
  .map(([q, a]) => `### ${q}\n\n${a}`)
  .join("\n\n");

writeFileSync(
  join(OUT, "llms.txt"),
  `# Lukotta

> ${english["meta.description"]}

${english["hero.subtitle"]}

Lukotta is a macOS application, version ${cfg.appVersion}. It needs ${REQUIREMENTS}. ${english["footer.gpl"]}

## How it works

${english["how.lead"]}

## ${english["features.title"]}

${formatLines}

## ${english["formats.not.title"]}

${notOpened}

## ${english["faq.title"]}

${questions}

## Pages

${cfg.languages
  .filter((l) => built.includes(l.code))
  .map((l) => {
    const label = l.name === l.native ? l.name : `${l.name} (${l.native})`;
    const url = `${cfg.domain}/${l.path ? l.path + "/" : ""}`;
    return `- [${label}](${url})${l.code === cfg.defaultLang ? ": the same page, and the canonical one" : ""}`;
  })
  .join("\n")}

## Pages about one task

${taskPagesBuilt.filter((x) => x.code === cfg.defaultLang).map(({ slug, title, description }) =>
  `- [${title}](${cfg.domain}/${slug}/): ${description}`).join("\n")}

## Source and policies

- [Application source and releases](${cfg.githubRepo}): issues, releases and the code
- [Privacy policy](${cfg.githubRepo}/blob/main/PRIVACY.md): what the application does and does not collect
- [Security policy](${cfg.githubRepo}/blob/main/SECURITY.md): how to report a vulnerability privately
- [Licence](${cfg.githubRepo}/blob/main/LICENSE.txt): GNU General Public License, version 3 or later
`,
  "utf8"
);

writeFileSync(
  join(OUT, "robots.txt"),
  /* The wildcard already allows everything. These are named anyway: a crawler
     that finds its own name stops at that group and never reads the wildcard,
     so each group has to be complete on its own, and naming them states the
     intent rather than leaving it to be inferred. Note that a block applied at
     the CDN happens before any of this is read. */
  `User-agent: *
Allow: /

${[
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended",
  "Bingbot", "CCBot", "Amazonbot", "Meta-ExternalAgent",
  "DuckAssistBot", "YouBot", "cohere-ai",
].map((bot) => `User-agent: ${bot}\nAllow: /\n`).join("\n")}
Sitemap: ${cfg.domain}/sitemap.xml
`,
  "utf8"
);

/* IndexNow proves the site is ours by fetching this file and comparing it with
   the key we send. The name and the contents must be the same string, so both
   come from one place in site.config.json -- written by hand they drift, and a
   drifted key fails silently: submissions are accepted and then ignored.

   It is not a secret. Being publicly readable is the whole mechanism. */
if (cfg.indexNowKey) {
  writeFileSync(join(OUT, `${cfg.indexNowKey}.txt`), cfg.indexNowKey, "utf8");
}

writeFileSync(
  join(OUT, "site.webmanifest"),
  JSON.stringify(
    {
      name: "Lukotta",
      short_name: "Lukotta",
      description: english["meta.ogDescription"],
      start_url: "/",
      display: "browser",
      background_color: "#FBF8F2",
      theme_color: "#FBF8F2",
      icons: [
        { src: "/assets/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2
  ),
  "utf8"
);

/* Without this, GitHub Pages runs the output through Jekyll, which drops
   directories whose names begin with an underscore. */
writeFileSync(join(OUT, ".nojekyll"), "", "utf8");
writeFileSync(join(OUT, "CNAME"), `${new URL(cfg.domain).hostname}\n`, "utf8");

/* 404 page. */
writeFileSync(
  join(OUT, "404.html"),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found — Lukotta</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="/${CSS}">
<link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png">
<script>(function(){try{var c=localStorage.getItem("lukotta-theme")||"auto";var d=c==="dark"||(c==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})();</script>
</head>
<body>
<section class="hero"><div class="wrap"><div class="hero-inner">
<h1>Page not found</h1>
<p class="hero-sub">That address does not exist on lukotta.com.</p>
<div class="hero-actions"><a class="btn btn-primary" href="/">Go to the home page</a></div>
</div></div></section>
</body>
</html>
`,
  "utf8"
);

/* A key no page renders is still sent to every translator. Report it. */
for (const key of Object.keys(english)) {
  if (!requested.has(key)) warn(`content/en.json has "${key}", which no page renders.`);
}

/* --------------------------------------------------------------- report -- */

const pages = built.length;
console.log(`\n  Built ${pages} page${pages === 1 ? "" : "s"} into public/\n`);
console.log(`  pages               ${built.length}`);
if (partial.length) {
  console.log(`  awaiting translation  ${partial.length}: ${partial.join(" ")}`);
}
if (noPage.length) {
  console.log(`  no content file     ${noPage.length}: ${noPage.join(" ")}`);
}
if (usingFallback.length) {
  console.log(`  english screenshots ${usingFallback.length}: ${usingFallback.join(" ")}`);
}
for (const w of warnings) console.log(`  warning             ${w}`);
console.log("");

if (strict && (warnings.length || partial.length || noPage.length)) {
  console.error("  --strict: warnings or untranslated languages present.\n");
  process.exit(1);
}
