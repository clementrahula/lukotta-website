#!/usr/bin/env node
/* Builds public/ from site.config.json, content/<lang>.json and src/.
   public/ is generated output and is not committed. */

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
    else if (value && typeof value === "object") out[key] = value[code] ?? value.en;
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

/* Static files that every page shares. */
cpSync(join(SRC, "styles.css"), join(OUT, "styles.css"));
cpSync(join(SRC, "script.js"), join(OUT, "script.js"));
/* Only the two marks are loaded by a page. The other files in
   src/assets/brand are sources for the generated icons and are not published. */
mkdirSync(join(OUT, "assets", "brand"), { recursive: true });
for (const mark of ["lukotta-mark-light.png", "lukotta-mark-dark.png"]) {
  cpSync(join(SRC, "assets", "brand", mark), join(OUT, "assets", "brand", mark));
}
if (existsSync(join(SRC, "assets", "icons"))) {
  cpSync(join(SRC, "assets", "icons"), join(OUT, "assets"), { recursive: true });
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

const built = [];

for (const lang of buildable) {
  const strings = loadStrings(lang.code);
  const localOnly = loadLocalOnly(lang.code);
  const t = translator(lang.code, strings || english, localOnly);
  const canonical = lang.path ? `${cfg.domain}/${lang.path}/` : `${cfg.domain}/`;
  const assetPrefix = lang.path ? "../" : "./";

  const shotSize = resolveShots(lang.code);

  const html = renderPage({ lang, cfg, t, alternates, canonical, assetPrefix, shotSize, buildable, indexable: buildable });

  const dir = lang.path ? join(OUT, lang.path) : OUT;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf8");

  if (t.missing.size && completeness.get(lang.code) !== 0) {
    warn(`${lang.code}: ${t.missing.size} of ${totalKeys} strings fell back to English: ${[...t.missing].slice(0, 4).join(", ")}${t.missing.size > 4 ? ", …" : ""}`);
  }
  built.push(lang.code);
}

/* ---------------------------------------------------------- sitemap etc -- */

const builtLangs = buildable.filter((l) => built.includes(l.code));

/* The sitemap must declare the same alternates as the pages, region aliases
   included. Google discards an hreflang cluster whose signals disagree. */
const urlEntries = builtLangs
  .map((l) => {
    const loc = l.path ? `${cfg.domain}/${l.path}/` : `${cfg.domain}/`;
    const links = alternates
      .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.code}" href="${a.href}"/>`)
      .join("\n");

    /* From the content file's mtime, not the build time, so lastmod reflects
       when this language last changed. */
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
