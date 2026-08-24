#!/usr/bin/env node
/* Checks the built site. Anything that would quietly damage search placement or
   break a page is an error; anything worth a second look is a warning.
   Run: node scripts/check.mjs */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public");
const cfg = JSON.parse(readFileSync(join(ROOT, "site.config.json"), "utf8"));

const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

if (!existsSync(OUT)) {
  console.error("public/ does not exist — run node scripts/build.mjs first.");
  process.exit(1);
}

/* Which languages got built, and which of those may be indexed. A page that
   carries noindex is an unfinished translation: it is word for word the English
   page, so it must not compete with it, and the rules below treat it that
   way — it is exempt from the duplicate-title check and absent from hreflang. */
const pages = cfg.languages
  .map((l) => ({ lang: l, file: l.path ? join(OUT, l.path, "index.html") : join(OUT, "index.html") }))
  .filter((p) => existsSync(p.file))
  .map((p) => {
    const html = readFileSync(p.file, "utf8");
    return { ...p, html, indexable: !/<meta name="robots" content="noindex/.test(html) };
  });

const indexed = pages.filter((p) => p.indexable);
if (!indexed.length) err("No page is indexable — every one carries noindex.");

if (!pages.length) err("No pages were built.");

const titles = new Map();
const descriptions = new Map();

const attr = (html, re) => { const m = html.match(re); return m ? m[1] : null; };

for (const { lang, file, html, indexable } of pages) {
  const where = lang.code;

  /* --- the document itself --- */
  const htmlLang = attr(html, /<html lang="([^"]+)"/);
  const htmlDir = attr(html, /<html lang="[^"]+" dir="([^"]+)"/);
  if (htmlLang !== lang.code) err(`${where}: <html lang> is "${htmlLang}", expected "${lang.code}"`);
  if (htmlDir !== lang.dir) err(`${where}: <html dir> is "${htmlDir}", expected "${lang.dir}"`);

  /* --- title and description --- */
  const title = attr(html, /<title>([^<]*)<\/title>/);
  const desc = attr(html, /<meta name="description" content="([^"]*)"/);
  if (!title) err(`${where}: no <title>`);
  if (!desc) err(`${where}: no meta description`);
  if (title && title.length > 65) warn(`${where}: title is ${title.length} characters; Google truncates around 60.`);
  if (desc && (desc.length < 70 || desc.length > 165)) {
    warn(`${where}: description is ${desc.length} characters; 70–165 shows in full.`);
  }
  if (indexable && title) {
    if (titles.has(title)) err(`${where}: duplicate <title>, same as ${titles.get(title)}. Two indexable pages cannot share one.`);
    else titles.set(title, where);
  }
  if (indexable && desc) {
    if (descriptions.has(desc)) err(`${where}: duplicate description, same as ${descriptions.get(desc)}.`);
    else descriptions.set(desc, where);
  }

  /* --- canonical --- */
  const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/);
  const expected = lang.path ? `${cfg.domain}/${lang.path}/` : `${cfg.domain}/`;
  if (canonical !== expected) err(`${where}: canonical is "${canonical}", expected "${expected}"`);

  /* --- hreflang: every page must name every page, and itself --- */
  const found = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
    .map((m) => ({ code: m[1], href: m[2] }));
  const codes = new Set(found.map((f) => f.code));
  for (const l of indexed.map((p) => p.lang)) {
    if (!codes.has(l.code)) err(`${where}: no hreflang entry for "${l.code}" — the cluster must be complete on every page.`);
    for (const alias of l.alsoServes || []) {
      if (!codes.has(alias)) err(`${where}: no hreflang entry for region "${alias}", which "${l.code}" is meant to serve.`);
    }
  }
  if (!codes.has("x-default")) err(`${where}: no hreflang="x-default"`);
  if (indexable && !codes.has(lang.code)) err(`${where}: no self-referencing hreflang`);
  if (!indexable && codes.has(lang.code)) {
    err(`${where}: carries noindex but is still named in its own hreflang cluster.`);
  }

  /* Duplicate region codes would make Google discard the whole cluster. */
  const seenCodes = new Set();
  for (const f of found) {
    if (seenCodes.has(f.code)) err(`${where}: hreflang "${f.code}" appears more than once.`);
    seenCodes.add(f.code);
  }
  for (const f of found) {
    if (!f.href.startsWith("https://")) err(`${where}: hreflang "${f.code}" is not an absolute https URL`);
    if (!f.href.endsWith("/")) warn(`${where}: hreflang "${f.code}" does not end in a slash`);
  }

  /* --- Open Graph --- */
  if (!/property="og:title"/.test(html)) err(`${where}: no og:title`);
  if (!/property="og:image"/.test(html)) err(`${where}: no og:image`);
  const ogLocale = attr(html, /<meta property="og:locale" content="([^"]+)"/);
  if (ogLocale !== lang.ogLocale) err(`${where}: og:locale is "${ogLocale}", expected "${lang.ogLocale}"`);

  /* --- structured data --- */
  const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (lds.length < 2) err(`${where}: expected at least two JSON-LD blocks, found ${lds.length}`);
  for (const [, body] of lds) {
    try { JSON.parse(body); } catch (e) { err(`${where}: JSON-LD does not parse — ${e.message}`); }
  }

  /* --- one h1, and every image described --- */
  const h1s = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1s !== 1) err(`${where}: ${h1s} <h1> elements, expected exactly one`);
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(tag)) err(`${where}: an <img> has no alt attribute`);
  }

  /* --- every local reference must exist on disk --- */
  const refs = [...html.matchAll(/(?:href|src|srcset)="(\.\.?\/[^"]+|\/[^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    const base = ref.startsWith("/") ? OUT : dirname(file);
    const target = resolvePath(base, ref.replace(/^\//, ""));
    if (!existsSync(target)) err(`${where}: references "${ref}", which is not in public/`);
  }
}

/* --- the stylesheet's own references, which no page names directly --- */
const cssPath = join(OUT, "styles.css");
if (!existsSync(cssPath)) err("public/styles.css is missing");
else {
  const css = readFileSync(cssPath, "utf8");
  const urls = [...css.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]);
  for (const u of urls) {
    if (/^(data:|https?:)/.test(u)) continue;
    if (!existsSync(resolvePath(OUT, u))) err(`styles.css references "${u}", which is not in public/`);
  }
  const faces = [...css.matchAll(/@font-face/g)].length;
  const withRange = [...css.matchAll(/unicode-range:/g)].length;
  if (faces && faces !== withRange) {
    warn(`${faces} @font-face rules but ${withRange} unicode-range declarations; a face without one is downloaded by every page whatever its language.`);
  }
  if (faces && !/font-display:\s*swap/.test(css)) {
    warn("a web font is declared without font-display: swap, so text stays invisible while it loads.");
  }
}

/* --- sitemap --- */
const sitemapPath = join(OUT, "sitemap.xml");
if (!existsSync(sitemapPath)) err("no sitemap.xml");
else {
  const xml = readFileSync(sitemapPath, "utf8");
  for (const { lang } of indexed) {
    const loc = lang.path ? `${cfg.domain}/${lang.path}/` : `${cfg.domain}/`;
    if (!xml.includes(`<loc>${loc}</loc>`)) err(`sitemap.xml does not list ${loc}`);
  }
  for (const { lang, indexable } of pages) {
    if (indexable) continue;
    const loc = lang.path ? `${cfg.domain}/${lang.path}/` : `${cfg.domain}/`;
    if (xml.includes(`<loc>${loc}</loc>`)) err(`sitemap.xml lists ${loc}, which carries noindex`);
  }
  const locs = [...xml.matchAll(/<loc>/g)].length;
  if (locs !== indexed.length) err(`sitemap.xml has ${locs} URLs but ${indexed.length} pages may be indexed`);
}

/* --- the files GitHub Pages needs --- */
for (const f of ["robots.txt", "CNAME", ".nojekyll", "404.html", "site.webmanifest"]) {
  if (!existsSync(join(OUT, f))) err(`public/${f} is missing`);
}
const cname = existsSync(join(OUT, "CNAME")) ? readFileSync(join(OUT, "CNAME"), "utf8").trim() : "";
if (cname !== new URL(cfg.domain).hostname) err(`CNAME says "${cname}", expected "${new URL(cfg.domain).hostname}"`);

/* --- untranslated languages are a warning, not a failure --- */
const missing = cfg.languages.filter((l) => !pages.some((p) => p.lang.code === l.code));
if (missing.length) warn(`${missing.length} language(s) have no page yet: ${missing.map((l) => l.code).join(" ")}`);
const held = pages.filter((p) => !p.indexable).map((p) => p.lang.code);
if (held.length) warn(`${held.length} page(s) built but held back from search until translated: ${held.join(" ")}`);

/* --------------------------------------------------------------- report -- */

console.log(`\n  Checked ${pages.length} page(s) in public/, ${indexed.length} of them indexable\n`);
for (const w of warns) console.log(`  warning  ${w}`);
for (const e of errors) console.log(`  ERROR    ${e}`);
console.log(
  `\n  ${errors.length} error(s), ${warns.length} warning(s)\n`
);
process.exit(errors.length ? 1 : 0);
