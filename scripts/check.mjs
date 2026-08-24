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

/* Which languages actually got built. */
const pages = cfg.languages
  .map((l) => ({ lang: l, file: l.path ? join(OUT, l.path, "index.html") : join(OUT, "index.html") }))
  .filter((p) => existsSync(p.file));

if (!pages.length) err("No pages were built.");

const titles = new Map();
const descriptions = new Map();

const attr = (html, re) => { const m = html.match(re); return m ? m[1] : null; };

for (const { lang, file } of pages) {
  const html = readFileSync(file, "utf8");
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
  if (title) {
    if (titles.has(title)) err(`${where}: duplicate <title>, same as ${titles.get(title)}. Every language needs its own.`);
    else titles.set(title, where);
  }
  if (desc) {
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
  for (const l of pages.map((p) => p.lang)) {
    if (!codes.has(l.code)) err(`${where}: no hreflang entry for "${l.code}" — the cluster must be complete on every page.`);
  }
  if (!codes.has("x-default")) err(`${where}: no hreflang="x-default"`);
  if (!codes.has(lang.code)) err(`${where}: no self-referencing hreflang`);
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
  if (lds.length < 3) err(`${where}: expected three JSON-LD blocks, found ${lds.length}`);
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

/* --- sitemap --- */
const sitemapPath = join(OUT, "sitemap.xml");
if (!existsSync(sitemapPath)) err("no sitemap.xml");
else {
  const xml = readFileSync(sitemapPath, "utf8");
  for (const { lang } of pages) {
    const loc = lang.path ? `${cfg.domain}/${lang.path}/` : `${cfg.domain}/`;
    if (!xml.includes(`<loc>${loc}</loc>`)) err(`sitemap.xml does not list ${loc}`);
  }
  const locs = [...xml.matchAll(/<loc>/g)].length;
  if (locs !== pages.length) err(`sitemap.xml has ${locs} URLs but ${pages.length} pages were built`);
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

/* --------------------------------------------------------------- report -- */

console.log(`\n  Checked ${pages.length} page(s) in public/\n`);
for (const w of warns) console.log(`  warning  ${w}`);
for (const e of errors) console.log(`  ERROR    ${e}`);
console.log(
  `\n  ${errors.length} error(s), ${warns.length} warning(s)\n`
);
process.exit(errors.length ? 1 : 0);
