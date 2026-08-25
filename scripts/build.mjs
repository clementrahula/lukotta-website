#!/usr/bin/env node
/* Builds public/ from site.config.json, content/<lang>.json and src/.
   Run: node scripts/build.mjs   —   the output directory is disposable. */

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderPage } from "../src/page.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const CONTENT = join(ROOT, "content");
const OUT = join(ROOT, "public");

const cfg = JSON.parse(readFileSync(join(ROOT, "site.config.json"), "utf8"));
const strict = process.argv.includes("--strict");

/* The intrinsic size of a screenshot is read from the file rather than assumed,
   so whatever pair is dropped in gets correct width/height attributes and the
   layout does not shift while it loads. */
function pngSize(file) {
  const b = readFileSync(file);
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) {
    throw new Error(`${file} is not a PNG.`);
  }
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

const warnings = [];
const warn = (m) => { warnings.push(m); };

/* ------------------------------------------------------------- content -- */

/* A translation file stores each string as {en, <code>} so the file is complete
   on its own — a reviewer needs nothing else to judge it. English stores plain
   strings, because there is nothing to compare it with. */
/* Strings belonging to one language alone, with no English original. */
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
    else if (value && typeof value === "object") out[key] = value[code] ?? value.en;
  }
  return out;
}

const english = loadStrings("en");
if (!english) throw new Error("content/en.json is missing — it is the source every page is built from.");

const requested = new Set();

function translator(code, strings) {
  const missing = new Set();
  const t = (key) => {
    requested.add(key);
    let value = strings[key];
    if (value === undefined || value === "") {
      missing.add(key);
      value = english[key];
    }
    if (value === undefined) throw new Error(`No string for "${key}", not even in English.`);
    return value
      .replace(/\{version\}/g, cfg.appVersion)
      .replace(/\{year\}/g, String(new Date().getUTCFullYear()));
    /* {author} is deliberately left in place: the page turns it into a link. */
  };
  t.missing = missing;
  return t;
}

/* ---------------------------------------------------------------- build -- */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

/* Static files that every page shares. */
cpSync(join(SRC, "styles.css"), join(OUT, "styles.css"));
cpSync(join(SRC, "script.js"), join(OUT, "script.js"));
cpSync(join(SRC, "assets", "brand"), join(OUT, "assets", "brand"), { recursive: true });
if (existsSync(join(SRC, "assets", "icons"))) {
  cpSync(join(SRC, "assets", "icons"), join(OUT, "assets"), { recursive: true });
}
cpSync(join(SRC, "assets", "fonts"), join(OUT, "assets", "fonts"), { recursive: true });

/* Screenshots: one light and one dark per language. A language without its own
   pair falls back to the placeholder, and the build says which did. */
const SHOTS = join(SRC, "assets", "screenshots");
const FALLBACK = join(SHOTS, "_placeholder");
const usingPlaceholder = [];

function resolveShots(code) {
  const own = join(SHOTS, code);
  const hasOwn = ["light", "dark"].every((v) => existsSync(join(own, `${v}.png`)));
  if (!hasOwn) {
    usingPlaceholder.push(code);
    if (!existsSync(join(FALLBACK, "light.png"))) {
      throw new Error(`No screenshots for "${code}" and no placeholder at ${FALLBACK}`);
    }
  }
  const from = hasOwn ? own : FALLBACK;
  const to = join(OUT, "assets", "screenshots", code);
  mkdirSync(to, { recursive: true });
  for (const v of ["light", "dark"]) cpSync(join(from, `${v}.png`), join(to, `${v}.png`));

  const light = pngSize(join(from, "light.png"));
  const dark = pngSize(join(from, "dark.png"));
  if (light.width !== dark.width || light.height !== dark.height) {
    warn(`${code}: light and dark screenshots differ in size (${light.width}x${light.height} vs ${dark.width}x${dark.height}); the page will shift when the appearance changes.`);
  }
  return light;
}

/* Every language that has a content file gets a full page: named in the
   hreflang cluster, listed in the sitemap, reachable from the menu, and
   matched by the language chooser. Whether its strings are translated yet is
   a separate question from whether the site works.

   Completeness is still measured, because publishing thirty-seven copies of
   the English page would be duplicate content. That is a release condition,
   not a build one: `node scripts/check.mjs --strict` refuses to pass until
   every language is finished, and the deploy workflow runs it. */
const buildable = cfg.languages.filter(
  (l) => l.code === cfg.defaultLang || existsSync(join(CONTENT, `${l.code}.json`))
);

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

/* One alternate per page, plus the region codes it also serves. es-419 and
   es-MX are Spanish readers in Latin America; they get the Spanish page rather
   than falling through to English. No extra page is created. */
const alternates = [
  ...buildable.flatMap((l) => {
    const href = l.path ? `${cfg.domain}/${l.path}/` : `${cfg.domain}/`;
    return [l.code, ...(l.alsoServes || [])].map((code) => ({ code, href }));
  }),
  { code: "x-default", href: `${cfg.domain}/` },
];

const built = [];

for (const lang of buildable) {
  const strings = loadStrings(lang.code);
  const t = translator(lang.code, strings || english);
  const localOnly = loadLocalOnly(lang.code);
  const canonical = lang.path ? `${cfg.domain}/${lang.path}/` : `${cfg.domain}/`;
  const assetPrefix = lang.path ? "../" : "./";

  const shotSize = resolveShots(lang.code);

  const html = renderPage({ lang, cfg, t, alternates, canonical, assetPrefix, shotSize, buildable, indexable: buildable, localOnly });

  const dir = lang.path ? join(OUT, lang.path) : OUT;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf8");

  if (t.missing.size && completeness.get(lang.code) !== 0) {
    warn(`${lang.code}: ${t.missing.size} of ${totalKeys} strings fell back to English — ${[...t.missing].slice(0, 4).join(", ")}${t.missing.size > 4 ? ", …" : ""}`);
  }
  built.push(lang.code);
}

/* ---------------------------------------------------------- sitemap etc -- */

const builtLangs = buildable.filter((l) => built.includes(l.code));

/* The sitemap has to name exactly the same set of alternates as the pages do,
   region aliases included. Two different answers to the same question is worse
   than one imperfect answer: Google discards a cluster whose signals disagree. */
const urlEntries = builtLangs
  .map((l) => {
    const loc = l.path ? `${cfg.domain}/${l.path}/` : `${cfg.domain}/`;
    const links = alternates
      .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.code}" href="${a.href}"/>`)
      .join("\n");

    /* When this language's text last changed, not when the site was last
       built — a date that moves for every language at once tells a crawler
       nothing. */
    const file = join(CONTENT, `${l.code}.json`);
    const stamp = existsSync(file) ? statSync(file).mtime : new Date();
    const lastmod = stamp.toISOString().slice(0, 10);

    return `  <url>
    <loc>${loc}</loc>
${links}
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${l.path ? "0.8" : "1.0"}</priority>
  </url>`;
  })
  .join("\n");

writeFileSync(
  join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>
`,
  "utf8"
);

writeFileSync(
  join(OUT, "robots.txt"),
  `User-agent: *
Allow: /

Sitemap: ${cfg.domain}/sitemap.xml
`,
  "utf8"
);

writeFileSync(
  join(OUT, "site.webmanifest"),
  JSON.stringify(
    {
      name: "Lukotta",
      short_name: "Lukotta",
      description: english["meta.ogDescription"],
      start_url: "/",
      display: "browser",
      background_color: "#FBF9F5",
      theme_color: "#FBF9F5",
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

/* GitHub Pages: without this it runs the output through Jekyll, which drops
   any directory whose name begins with an underscore. */
writeFileSync(join(OUT, ".nojekyll"), "", "utf8");
writeFileSync(join(OUT, "CNAME"), `${new URL(cfg.domain).hostname}\n`, "utf8");

/* A 404 that at least carries the brand and a way back. */
writeFileSync(
  join(OUT, "404.html"),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found — Lukotta</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="/styles.css">
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

/* A key in the content that no page ever asks for is dead weight: it ships to
   every translator and can never appear. Better to hear about it here. */
for (const key of Object.keys(english)) {
  if (!requested.has(key)) warn(`content/en.json has "${key}", which the page never renders. Remove it, or use it.`);
}

/* --------------------------------------------------------------- report -- */

const pages = built.length;
console.log(`\n  Lukotta website — built ${pages} page${pages === 1 ? "" : "s"} into public/\n`);
console.log(`  pages               ${built.length}`);
if (partial.length) {
  console.log(`  awaiting translation  ${partial.length}: ${partial.join(" ")}`);
}
if (noPage.length) {
  console.log(`  no content file     ${noPage.length}: ${noPage.join(" ")}`);
}
if (usingPlaceholder.length) {
  console.log(`  placeholder shots   ${usingPlaceholder.length}: ${usingPlaceholder.join(" ")}`);
}
for (const w of warnings) console.log(`  warning             ${w}`);
console.log("");

if (strict && (warnings.length || partial.length || noPage.length)) {
  console.error("  --strict: refusing to pass with warnings or untranslated languages.\n");
  process.exit(1);
}
