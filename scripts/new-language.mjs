#!/usr/bin/env node
/* Creates content/<code>.json with every key from the English, each one paired
   with the English it is to be translated from and an empty slot beside it.
   The file is complete on its own, which is what a reviewer needs.

   Re-running it over a language that already has a file is safe and is the
   point: existing translations are kept, keys added to the English since last
   time are appended empty, and keys removed from the English are dropped. Run
   it after every change to content/en.json.

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
  const existing = existsSync(file)
    ? JSON.parse(readFileSync(file, "utf8")).strings || {}
    : {};

  const strings = {};
  for (const [key, en] of Object.entries(english.strings)) {
    const prior = existing[key];
    const kept = typeof prior === "object" && prior ? prior[lang.code] || "" : "";
    strings[key] = { en, [lang.code]: kept };
  }

  writeFileSync(
    file,
    JSON.stringify(
      {
        language: { code: lang.code, name: lang.name, native: lang.native, dir: lang.dir },
        strings,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  const done = Object.values(strings).filter((v) => v[lang.code]).length;
  const total = Object.keys(strings).length;

  /* Say what moved, so a change to the English is visible here rather than
     surfacing later as a page that quietly fell back. */
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
