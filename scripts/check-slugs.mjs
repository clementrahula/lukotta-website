#!/usr/bin/env node
/* A slug is an address somebody may already have.

   Every task page and site page carries a slug per language, and the build
   turns it into a directory: content/pages/de.json's bitlocker slug becomes
   https://lukotta.com/de/<slug>/. Change one and the old address stops
   existing. GitHub Pages serves static files and cannot redirect, so there is
   nowhere to send the reader, the search engine that indexed it, or the agent
   that wrote it down; and nothing in the build notices, because the new
   address is perfectly valid.

   A re-translation is the likely way it happens. pages-translate.mjs and
   delta-translate.mjs rewrite a language's file wholesale, slug included, so a
   second pass over one language can move four published URLs without anybody
   typing a URL at all.

   This makes that impossible to do quietly. content/slugs.json is a lockfile
   of every published address. The check compares it against the content and
   fails if they differ, so moving an address means regenerating the lockfile
   in the same commit, where the diff says exactly which addresses moved and
   the commit message can say why.

     node scripts/check-slugs.mjs            check
     node scripts/check-slugs.mjs --write    write the lockfile
*/

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const LOCK = join(CONTENT, "slugs.json");
const cfg = JSON.parse(readFileSync(join(ROOT, "site.config.json"), "utf8"));

/* The address as the reader sees it, so the lockfile reads like a list of
   URLs rather than a list of identifiers. */
function collect() {
  const out = {};
  for (const lang of cfg.languages) {
    const prefix = lang.code === cfg.defaultLang ? "" : `${lang.code.toLowerCase()}/`;
    for (const set of ["pages", "site"]) {
      const file = join(CONTENT, set, `${lang.code}.json`);
      if (!existsSync(file)) continue;
      const data = JSON.parse(readFileSync(file, "utf8"));
      for (const key of data.order || []) {
        const slug = data.pages?.[key]?.slug;
        if (slug) out[`${lang.code}:${set}:${key}`] = `/${prefix}${slug}/`;
      }
    }
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

const now = collect();

if (process.argv.includes("--write")) {
  writeFileSync(LOCK, JSON.stringify(now, null, 2) + "\n", "utf8");
  console.log(`\n  ${Object.keys(now).length} addresses written to content/slugs.json\n`);
  process.exit(0);
}

if (!existsSync(LOCK)) {
  console.error("\n  content/slugs.json is missing. Create it with:\n");
  console.error("    node scripts/check-slugs.mjs --write\n");
  process.exit(1);
}

const was = JSON.parse(readFileSync(LOCK, "utf8"));
const moved = [], added = [], gone = [];
for (const [id, url] of Object.entries(now)) {
  if (!(id in was)) added.push([id, url]);
  else if (was[id] !== url) moved.push([id, was[id], url]);
}
for (const id of Object.keys(was)) if (!(id in now)) gone.push([id, was[id]]);

/* A new page is not a problem: nothing was published at its address before.
   A page that stopped existing, and a page that changed address, both retire
   a URL that may be indexed or written down somewhere. */
for (const [id, url] of added) console.log(`  new      ${id}\n           ${url}`);
for (const [id, url] of gone) console.log(`  removed  ${id}\n           ${url}`);
for (const [id, before, after] of moved) console.log(`  moved    ${id}\n           ${before}\n        -> ${after}`);

if (!moved.length && !gone.length) {
  if (added.length) {
    console.error(`\n  ${added.length} new address(es). Record them with:\n`);
    console.error("    node scripts/check-slugs.mjs --write\n");
    process.exit(1);
  }
  console.log(`\n  ${Object.keys(now).length} published addresses, all unchanged\n`);
  process.exit(0);
}

console.error(`\n  ${moved.length} address(es) moved and ${gone.length} removed.`);
console.error("  Nothing serves the old ones: GitHub Pages cannot redirect, so each");
console.error("  becomes a 404 for anyone who saved it or indexed it.");
console.error("\n  If that is intended, record it in the same commit with:\n");
console.error("    node scripts/check-slugs.mjs --write\n");
process.exit(1);
