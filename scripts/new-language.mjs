#!/usr/bin/env node
/* Creates content/<code>.json with every key from the English, each paired
   with the English source and an empty slot for the translation.

   Re-running over an existing file is safe and is the intended use: existing
   translations are kept, new English keys are appended empty, and removed keys
   are dropped. Run after every change to content/en.json.

   Usage:  node scripts/new-language.mjs de
           node scripts/new-language.mjs --all     (every language)
*/

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const cfg = JSON.parse(readFileSync(join(ROOT, "site.config.json"), "utf8"));
const english = JSON.parse(readFileSync(join(CONTENT, "en.json"), "utf8"));

const args = process.argv.slice(2);
if (!args.length) {
  console.error("Usage: node scripts/new-language.mjs <code> | --all");
  process.exit(1);
}

const wanted = args.includes("--all")
  ? cfg.languages.filter((l) => l.code !== cfg.defaultLang)
  : args.map((code) => {
      const lang = cfg.languages.find((l) => l.code === code);
      if (!lang) {
        console.error(`"${code}" is not in site.config.json.`);
        process.exit(1);
      }
      return lang;
    });

if (!wanted.length) {
  console.log("\n  Nothing to do.\n");
  process.exit(0);
}

for (const lang of wanted) {
  const file = join(CONTENT, `${lang.code}.json`);
  const prior = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
  const existing = prior.strings || {};
  /* localOnly holds strings with no English original. They sit outside
     `strings` and must survive a resync. */
  const localOnly = prior.localOnly;

  const strings = {};
  for (const [key, en] of Object.entries(english.strings)) {
    const prior = existing[key];
    /* A hand-edited file may hold a bare string where the pair belongs. It is
       still someone's translation, so it is carried into the slot. */
    const kept = typeof prior === "string" ? prior
      : (prior && typeof prior === "object" ? prior[lang.code] || "" : "");
    strings[key] = { en, [lang.code]: kept };
  }

  writeFileSync(
    file,
    JSON.stringify(
      Object.assign(
        { language: { code: lang.code, name: lang.name, native: lang.native, dir: lang.dir } },
        localOnly ? { localOnly } : {},
        { strings }
      ),
      null,
      2
    ) + "\n",
    "utf8"
  );

  const done = Object.values(strings).filter((v) => v[lang.code]).length;
  const total = Object.keys(strings).length;

  /* Report what moved, so a change to the English is visible now rather than
     later as a page that fell back. */
  const priorKeys = Object.keys(existing);
  const added = Object.keys(strings).filter((k) => !priorKeys.includes(k)).length;
  const dropped = priorKeys.filter((k) => !(k in strings)).length;
  const moved = [added ? `+${added}` : "", dropped ? `-${dropped}` : ""].filter(Boolean).join(" ");

  console.log(
    `  ${lang.code.padEnd(8)} ${String(done).padStart(3)}/${total} translated` +
    (moved ? `   ${moved} key(s)` : "") +
    (done === total ? "   complete" : "")
  );
}
console.log("");
