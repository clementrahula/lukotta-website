#!/usr/bin/env node
/* Builds public/ from site.config.json, content/<lang>.json and src/.
   Run: node scripts/build.mjs   —   the output directory is disposable. */

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync } from "node:fs";
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

function translator(code, strings) {
  const missing = new Set();
  const t = (key) => {
    let value = strings[key];
    if (value === undefined || value === "") {
      missing.add(key);
      value = english[key];
    }
    if (value === undefined) throw new Error(`No string for "${key}", not even in English.`);
    return value
      .replace(/\{version\}/g, cfg.appVersion)
      .replace(/\{year\}/g, String(new Date().getUTCFullYear()))
      .replace(/\{author\}/g, cfg.authorName);
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

/* A language is only advertised once it has a page. Naming a language in
   hreflang before its page exists points search engines at a 404, and Search
   Console reports the whole cluster as broken. */
const buildable = cfg.languages.filter(
  (l) => l.code === cfg.defaultLang || existsSync(join(CONTENT, `${l.code}.json`))
);
const untranslated = cfg.languages
  .filter((l) => !buildable.includes(l))
  .map((l) => l.code);

/* Every page links to every other, so the alternate set is computed once. */
const alternates = [
  ...buildable.map((l) => ({
    code: l.code,
    href: l.path ? `${cfg.domain}/${l.path}/` : `${cfg.domain}/`,
  })),
  { code: "x-default", href: `${cfg.domain}/` },
];

const built = [];

for (const lang of buildable) {
  const strings = loadStrings(lang.code);
  const t = translator(lang.code, strings || english);
  const canonical = lang.path ? `${cfg.domain}/${lang.path}/` : `${cfg.domain}/`;
  const assetPrefix = lang.path ? "../" : "./";

  const shotSize = resolveShots(lang.code);

  const html = renderPage({ lang, cfg, t, alternates, canonical, assetPrefix, shotSize, buildable });

  const dir = lang.path ? join(OUT, lang.path) : OUT;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf8");

  if (t.missing.size) {
    warn(`${lang.code}: ${t.missing.size} string(s) fell back to English — ${[...t.missing].slice(0, 5).join(", ")}${t.missing.size > 5 ? ", …" : ""}`);
  }
  built.push(lang.code);
}

/* ---------------------------------------------------------- sitemap etc -- */

const builtLangs = cfg.languages.filter((l) => built.includes(l.code));

const urlEntries = builtLangs
  .map((l) => {
    const loc = l.path ? `${cfg.domain}/${l.path}/` : `${cfg.domain}/`;
    const links = builtLangs
      .map((a) => {
        const href = a.path ? `${cfg.domain}/${a.path}/` : `${cfg.domain}/`;
        return `    <xhtml:link rel="alternate" hreflang="${a.code}" href="${href}"/>`;
      })
      .join("\n");
    return `  <url>
    <loc>${loc}</loc>
${links}
    <xhtml:link rel="alternate" hreflang="x-default" href="${cfg.domain}/"/>
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

/* --------------------------------------------------------------- report -- */

const pages = built.length;
console.log(`\n  Lukotta website — built ${pages} page${pages === 1 ? "" : "s"} into public/\n`);
console.log(`  languages built     ${built.join(" ")}`);
if (untranslated.length) {
  console.log(`  awaiting translation  ${untranslated.length}: ${untranslated.join(" ")}`);
}
if (usingPlaceholder.length) {
  console.log(`  placeholder shots   ${usingPlaceholder.length}: ${usingPlaceholder.join(" ")}`);
}
for (const w of warnings) console.log(`  warning             ${w}`);
console.log("");

if (strict && (warnings.length || untranslated.length)) {
  console.error("  --strict: refusing to pass with warnings or untranslated languages.\n");
  process.exit(1);
}
