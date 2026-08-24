#!/usr/bin/env node
/* Creates content/<code>.json with every key from the English, each one paired
   with the English it is to be translated from and an empty slot beside it.
   The file is complete on its own, which is what a reviewer needs.

   Usage:  node scripts/new-language.mjs de
           node scripts/new-language.mjs --all     (every language still missing)
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
  ? cfg.languages.filter((l) => l.code !== "en" && !existsSync(join(CONTENT, `${l.code}.json`)))
  : args.map((code) => {
      const lang = cfg.languages.find((l) => l.code === code);
      if (!lang) {
        console.error(`"${code}" is not in site.config.json.`);
        process.exit(1);
      }
      return lang;
    });

if (!wanted.length) {
  console.log("\n  Every language already has a file.\n");
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
  console.log(`  ${lang.code.padEnd(8)} ${done}/${Object.keys(strings).length} translated  →  content/${lang.code}.json`);
}
console.log("");
