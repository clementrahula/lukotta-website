#!/usr/bin/env node
/* Checks the built site. Anything that breaks a page or damages search
   placement is an error; anything else worth seeing is a warning. */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public");
const cfg = JSON.parse(readFileSync(join(ROOT, "site.config.json"), "utf8"));
const CONTENT = join(ROOT, "content");
const strict = process.argv.includes("--strict");

/* How much of each language is translated. This gates release only:
   --strict fails while any language is unfinished. */
function completenessOf(code) {
  if (code === cfg.defaultLang) return 1;
  const file = join(CONTENT, `${code}.json`);
  if (!existsSync(file)) return 0;
  const en = JSON.parse(readFileSync(join(CONTENT, `${cfg.defaultLang}.json`), "utf8")).strings;
  const mine = JSON.parse(readFileSync(file, "utf8")).strings || {};
  const keys = Object.keys(en);
  if (!keys.length) return 1;
  const done = keys.filter((k) => {
    const v = mine[k];
    return v && typeof v === "object" ? Boolean(v[code]) : Boolean(v);
  }).length;
  return done / keys.length;
}

const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

if (!existsSync(OUT)) {
  console.error("public/ does not exist. Run node scripts/build.mjs first.");
  process.exit(1);
}

/* Every built page. An untranslated page carries the English text, so it is
   exempt from the duplicate-title check below. */
const pages = cfg.languages
  .map((l) => ({ lang: l, file: l.path ? join(OUT, l.path, "index.html") : join(OUT, "index.html") }))
  .filter((p) => existsSync(p.file))
  .map((p) => ({
    ...p,
    html: readFileSync(p.file, "utf8"),
    translated: completenessOf(p.lang.code) === 1,
  }));

const indexed = pages;

if (!pages.length) err("No pages were built.");

const titles = new Map();
const descriptions = new Map();

const attr = (html, re) => { const m = html.match(re); return m ? m[1] : null; };

for (const { lang, file, html, translated } of pages) {
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
  /* Compare translated pages only. An untranslated page carries the English
     text, so including it would report a duplicate against whichever language
     happened to be listed first. */
  if (translated && title) {
    if (titles.has(title)) err(`${where}: duplicate <title>, same as ${titles.get(title)}. Two translated pages cannot share one.`);
    else titles.set(title, where);
  }
  if (translated && desc) {
    if (descriptions.has(desc)) err(`${where}: duplicate description, same as ${descriptions.get(desc)}.`);
    else descriptions.set(desc, where);
  }

  /* --- canonical --- */
  const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/);
  const expected = lang.path ? `${cfg.domain}/${lang.path}/` : `${cfg.domain}/`;
  if (canonical !== expected) err(`${where}: canonical is "${canonical}", expected "${expected}"`);

  /* --- hreflang: every page declares every page, including itself --- */
  const found = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
    .map((m) => ({ code: m[1], href: m[2] }));
  const codes = new Set(found.map((f) => f.code));
  for (const l of indexed.map((p) => p.lang)) {
    if (!codes.has(l.code)) err(`${where}: no hreflang entry for "${l.code}". The cluster must be complete on every page.`);
    for (const alias of l.alsoServes || []) {
      if (!codes.has(alias)) err(`${where}: no hreflang entry for region "${alias}", which "${l.code}" is meant to serve.`);
    }
  }
  if (!codes.has("x-default")) err(`${where}: no hreflang="x-default"`);
  if (!codes.has(lang.code)) err(`${where}: no self-referencing hreflang`);

  /* A duplicate region code makes Google discard the whole cluster. */
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
    try { JSON.parse(body); } catch (e) { err(`${where}: JSON-LD does not parse. ${e.message}`); }
  }

  /* --- exactly one h1, and alt text on every image --- */
  const h1s = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1s !== 1) err(`${where}: ${h1s} <h1> elements, expected exactly one`);
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(tag)) err(`${where}: an <img> has no alt attribute`);
  }

  /* --- every local href and src must exist in public/ --- */
  const refs = [...html.matchAll(/(?:href|src|srcset)="(\.\.?\/[^"]+|\/[^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    const base = ref.startsWith("/") ? OUT : dirname(file);
    const target = resolvePath(base, ref.replace(/^\//, ""));
    if (!existsSync(target)) err(`${where}: references "${ref}", which is not in public/`);
  }
}

/* --- url() targets in the stylesheet, which no page references directly --- */
/* The stylesheet carries a digest in its name, so it is found rather than
   named. Exactly one must exist: two would mean a stale build left behind. */
const sheets = existsSync(OUT) ? readdirSync(OUT).filter((f) => /^styles\.[0-9a-f]+\.css$/.test(f)) : [];
if (sheets.length !== 1) err(`expected one fingerprinted stylesheet in public/, found ${sheets.length}`);
const cssPath = join(OUT, sheets[0] ?? "styles.css");
if (!existsSync(cssPath)) err("the built stylesheet is missing");
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

/* --- contrast, measured from the built stylesheet rather than from intent --- */
if (existsSync(cssPath)) {
  const css = readFileSync(cssPath, "utf8");
  const darkAt = css.indexOf(':root[data-theme="dark"]');
  const blocks = {
    light: css.slice(css.indexOf(":root {"), darkAt < 0 ? undefined : darkAt),
    dark: darkAt < 0 ? "" : css.slice(darkAt),
  };
  const token = (block, name) => {
    const m = blocks[block].match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
    return m ? m[1] : null;
  };
  const luminance = (hex) =>
    hex.slice(1).match(/../g)
      .map((pair) => { const v = parseInt(pair, 16) / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
      .reduce((sum, v, i) => sum + [0.2126, 0.7152, 0.0722][i] * v, 0);
  const ratio = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  /* WCAG 2.2: 4.5:1 for text under 24px, 3:1 for UI boundaries and large text. */
  const pairs = [
    ["body text", "ink", "paper", 4.5],
    ["secondary text", "ink-2", "paper", 4.5],
    ["muted text", "ink-3", "paper", 4.5],
    ["muted text on a raised panel", "ink-3", "paper-2", 4.5],
    ["link", "amber-ink", "paper", 4.5],
    ["button label", "on-amber", "amber", 4.5],
    ["focus ring", "amber-ink", "paper", 3],
    ["control edge", "control-edge", "paper", 3],
    /* Indicators that carry meaning: the FAQ chevron, the current-language
       marker, and the icon inside the appearance switch. WCAG 1.4.11. */
    ["state indicator", "amber-ink", "paper-2", 3],
    ["switch icon", "ink-2", "paper-2", 3],
  ];
  for (const theme of ["light", "dark"]) {
    if (!blocks[theme]) { err(`styles.css has no ${theme} theme block; contrast cannot be checked.`); continue; }
    for (const [label, fg, bg, need] of pairs) {
      const a = token(theme, fg);
      const b = token(theme, bg);
      if (!a || !b) { err(`styles.css: ${theme} theme is missing --${a ? bg : fg}, so ${label} contrast cannot be checked.`); continue; }
      const got = ratio(a, b);
      if (got < need) {
        err(`contrast: ${theme} ${label} is ${got.toFixed(2)}:1 (${a} on ${b}), below the ${need}:1 WCAG 2.2 AA minimum.`);
      }
    }
  }
}

/* --- every page must load the assets this build actually wrote --- */
const scripts = existsSync(OUT) ? readdirSync(OUT).filter((f) => /^script\.[0-9a-f]+\.js$/.test(f)) : [];
if (scripts.length !== 1) err(`expected one fingerprinted script in public/, found ${scripts.length}`);
if (sheets.length === 1 && scripts.length === 1) {
  for (const { lang, html } of pages) {
    if (!html.includes(sheets[0])) err(`${lang.code}: does not load ${sheets[0]}`);
    if (!html.includes(scripts[0])) err(`${lang.code}: does not load ${scripts[0]}`);
  }
  const notFound = join(OUT, "404.html");
  if (existsSync(notFound) && !readFileSync(notFound, "utf8").includes(sheets[0])) {
    err(`404.html does not load ${sheets[0]}`);
  }
}

/* --- the dark appearance is declared twice; the declarations must agree --- */
if (existsSync(cssPath)) {
  const css = readFileSync(cssPath, "utf8");
  const grab = (start) => {
    const at = css.indexOf(start);
    if (at < 0) return null;
    const body = css.slice(at + start.length, css.indexOf("}", at + start.length));
    const map = new Map();
    for (const m of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) map.set(m[1], m[2].trim());
    return map;
  };
  const bySystem = grab(':root:not([data-theme="dark"]) {') ?? grab(':root:not([data-theme="light"]) {');
  const byChoice = grab(':root[data-theme="dark"] {');
  if (!bySystem) err('styles.css: no prefers-color-scheme dark block. Readers without JavaScript would get the light page on a dark system.');
  else if (!byChoice) err('styles.css: no [data-theme="dark"] block.');
  else {
    for (const [name, value] of byChoice) {
      if (!bySystem.has(name)) err(`styles.css: --${name} is set for [data-theme="dark"] but not for a dark system; the two dark paths have drifted.`);
      else if (bySystem.get(name) !== value) err(`styles.css: --${name} is "${value}" by choice but "${bySystem.get(name)}" by system; the two dark paths have drifted.`);
    }
    for (const name of bySystem.keys()) {
      if (!byChoice.has(name)) err(`styles.css: --${name} is set for a dark system but not for [data-theme="dark"]; the two dark paths have drifted.`);
    }
  }
}

/* --- llms.txt states the same facts the pages do --- */
const llmsPath = join(OUT, "llms.txt");
if (existsSync(llmsPath)) {
  const llms = readFileSync(llmsPath, "utf8");
  /* Every format named in the table must be named here too, or a reader and an
     assistant are being told different things about the same application. */
  const englishPage = pages.find((p) => p.lang.code === cfg.defaultLang);
  if (englishPage) {
    const named = [...englishPage.html.matchAll(/<th scope="row"><code>([^<]+)<\/code>/g)].map((m) => m[1].trim());
    if (!named.length) err("could not read the formats table; the llms.txt cross-check did not run.");
    for (const name of named) {
      if (!llms.includes(name)) err(`llms.txt does not name "${name}", which the formats table does.`);
    }
  }
  if (!llms.includes(cfg.appVersion)) err(`llms.txt does not state version ${cfg.appVersion}.`);
  /* The questions are the most quotable thing on the page, so the summary must
     carry them, and carry the same wording. */
  const english = JSON.parse(readFileSync(join(CONTENT, `${cfg.defaultLang}.json`), "utf8")).strings;
  const englishOf = (v) => (typeof v === "string" ? v : v?.[cfg.defaultLang] ?? v?.en);
  /* Every part of every answer, including the second and later paragraphs
     that only some questions have. */
  for (const key of Object.keys(english)) {
    if (!/^faq\.\d+\.(q|a\d*)$/.test(key)) continue;
    const text = englishOf(english[key]);
    if (text && !llms.includes(text)) err(`llms.txt does not carry ${key} as the page states it.`);
  }
  for (const key of ["features.title", "formats.not.title", "hero.subtitle", "how.lead", "footer.gpl"]) {
    const text = englishOf(english[key]);
    if (text && !llms.includes(text)) err(`llms.txt does not carry ${key} as the page states it.`);
  }
  for (const p of pages) {
    const url = `${cfg.domain}/${p.lang.path ? p.lang.path + "/" : ""}`;
    if (!llms.includes(url)) err(`llms.txt does not link ${url}`);
  }
}

/* The task pages the build should have written, taken from the content files
   rather than from the output, so a page that failed to build is noticed. */
const taskPages = [];
for (const lang of cfg.languages) {
  const file = join(ROOT, "content", "pages", `${lang.code}.json`);
  if (!existsSync(file)) continue;
  const data = JSON.parse(readFileSync(file, "utf8"));
  for (const key of data.order) {
    const slug = data.pages[key].slug;
    const dir = lang.path ? `${lang.path}/${slug}` : slug;
    taskPages.push({ code: lang.code, key, slug, dir, loc: `${cfg.domain}/${dir}/` });
  }
}

/* --- robots.txt must not shut out what the site is trying to reach --- */
const robotsPath = join(OUT, "robots.txt");
if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, "utf8");
  if (/^\s*Disallow:\s*\/\s*$/m.test(robots)) err("robots.txt disallows the whole site.");
  if (!robots.includes(`Sitemap: ${cfg.domain}/sitemap.xml`)) err("robots.txt does not point at the sitemap.");
  for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "OAI-SearchBot"]) {
    if (!robots.includes(`User-agent: ${bot}`)) warn(`robots.txt does not name ${bot}.`);
  }
}

/* --- IndexNow --- */
/* The key file proves the site is ours. Its name and its contents must be the
   same string: if they drift, submissions are accepted and then quietly
   ignored, which looks exactly like working. */
if (cfg.indexNowKey) {
  const keyFile = join(OUT, `${cfg.indexNowKey}.txt`);
  if (!existsSync(keyFile)) err(`no ${cfg.indexNowKey}.txt — IndexNow cannot verify the site.`);
  else if (readFileSync(keyFile, "utf8").trim() !== cfg.indexNowKey) {
    err("the IndexNow key file does not contain its own name.");
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
  /* The sitemap and the pages must declare the same alternates. Google
     discards a cluster whose signals disagree. */
  for (const { lang, html } of pages) {
    const loc = lang.path ? `${cfg.domain}/${lang.path}/` : `${cfg.domain}/`;
    const block = xml.split("<url>").find((b) => b.includes(`<loc>${loc}</loc>`));
    if (!block) continue;
    const inSitemap = new Set([...block.matchAll(/hreflang="([^"]+)"/g)].map((m) => m[1]));
    const inPage = new Set(
      [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map((m) => m[1])
    );
    for (const code of inPage) {
      if (!inSitemap.has(code)) err(`sitemap: ${loc} omits hreflang "${code}", which the page declares`);
    }
    for (const code of inSitemap) {
      if (!inPage.has(code)) err(`sitemap: ${loc} declares hreflang "${code}", which the page does not`);
    }
  }

  /* About and Contact exist once each, in English, and are listed with no
     alternates. They are counted here so that adding a page and forgetting the
     sitemap still fails, which is the whole point of this check. */
  const sitePages = ["about", "contact"].filter((slug) =>
    existsSync(join(OUT, slug, "index.html")));
  for (const slug of sitePages) {
    const loc = `${cfg.domain}/${slug}/`;
    if (!xml.includes(`<loc>${loc}</loc>`)) err(`sitemap.xml does not list ${loc}`);
  }

  const locs = [...xml.matchAll(/<loc>/g)].length;
  const expected = indexed.length + taskPages.length + sitePages.length;
  if (locs !== expected) {
    err(`sitemap.xml has ${locs} URLs but ${indexed.length} landing pages, ${taskPages.length} task pages and ${sitePages.length} site pages were built`);
  }
  /* Every task page must be in the sitemap under the slug its own language
     gave it. A page reachable only through a link is a page nobody submits. */
  for (const { loc } of taskPages) {
    if (!xml.includes(`<loc>${loc}</loc>`)) err(`sitemap.xml does not list ${loc}`);
  }
}

/* --- task pages --- */
/* Each must exist, carry its own title and description, name itself canonical,
   and link back to the landing page it belongs to. */
for (const { code, slug, loc, dir } of taskPages) {
  const file = join(OUT, dir, "index.html");
  if (!existsSync(file)) { err(`no page at ${dir}/`); continue; }
  const html = readFileSync(file, "utf8");
  if (!html.includes(`<link rel="canonical" href="${loc}">`)) err(`${dir}/ does not name ${loc} as its canonical address.`);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || "";
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "";
  if (title.length < 20 || title.length > 70) warn(`${dir}/ title is ${title.length} characters.`);
  if (desc.length < 70 || desc.length > 160) warn(`${dir}/ description is ${desc.length} characters.`);
  /* No breadcrumb check. The trail was one step, "Lukotta", above a heading
     that already said where the reader was, and the header says it too. A
     BreadcrumbList describing a trail the page does not show is a claim to a
     search engine that the page does not back up, so both went together. */
  if (!html.includes('"@type": "TechArticle"')) err(`${dir}/ carries no article markup.`);
  if (!html.includes("__CSP__") === false) err(`${dir}/ still carries the __CSP__ placeholder.`);
  if (!html.includes('<html lang="' + code + '"')) err(`${dir}/ does not declare lang="${code}".`);
}

/* Titles and descriptions have to be unique, or the pages compete with each
   other for the same result. */
for (const field of ["title", "description"]) {
  const seen = new Map();
  for (const { dir } of taskPages) {
    const html = readFileSync(join(OUT, dir, "index.html"), "utf8");
    const v = field === "title"
      ? html.match(/<title>([^<]*)<\/title>/)?.[1]
      : html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    if (seen.has(v)) err(`${dir}/ and ${seen.get(v)}/ share the same ${field}.`);
    seen.set(v, dir);
  }
}

/* --- the files GitHub Pages needs --- */
for (const f of ["robots.txt", "llms.txt", "CNAME", ".nojekyll", "404.html", "site.webmanifest"]) {
  if (!existsSync(join(OUT, f))) err(`public/${f} is missing`);
}
const cname = existsSync(join(OUT, "CNAME")) ? readFileSync(join(OUT, "CNAME"), "utf8").trim() : "";
if (cname !== new URL(cfg.domain).hostname) err(`CNAME says "${cname}", expected "${new URL(cfg.domain).hostname}"`);

/* --- untranslated languages warn; --strict turns that into a failure --- */
const missing = cfg.languages.filter((l) => !pages.some((p) => p.lang.code === l.code));
if (missing.length) {
  /* A deleted content file drops a language from the build while leaving the
     pages, hreflang cluster and sitemap mutually consistent, so nothing else
     here objects. Under --strict a configured language must exist. */
  const list = missing.map((l) => l.code).join(" ");
  if (strict) err(`${missing.length} configured language(s) built no page: ${list}. Remove them from site.config.json or restore their content files.`);
  else warn(`${missing.length} language(s) have no page yet: ${list}`);
}
const untranslated = pages.filter((p) => !p.translated).map((p) => p.lang.code);
if (untranslated.length) {
  warn(`${untranslated.length} language(s) still carry the English text: ${untranslated.join(" ")}`);
  warn("Publishing them as they are would put the same page at thirty-seven addresses. --strict refuses to pass until they are translated.");
}

/* --------------------------------------------------------------- report -- */

console.log(`\n  Checked ${pages.length} page(s) in public/\n`);
for (const w of warns) console.log(`  warning  ${w}`);
for (const e of errors) console.log(`  ERROR    ${e}`);
console.log(`\n  ${errors.length} error(s), ${warns.length} warning(s)\n`);

if (strict && untranslated.length) {
  console.error(`  --strict: ${untranslated.length} language(s) are not translated. The site is not fit to publish.\n`);
  process.exit(1);
}
process.exit(errors.length ? 1 : 0);
