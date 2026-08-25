#!/usr/bin/env node
/* Bundles every translation for review, each file complete on its own.

   A reviewer gets one file per language. Every string in it carries the key,
   the English it came from, the translation, what the section is for, and any
   note constraining that particular string — so nothing has to be looked up
   anywhere else, and no other file has to be open at the same time.

   Usage:  node scripts/export-translations.mjs [code ...]
           node scripts/export-translations.mjs            (all of them)
*/

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const OUT = join(ROOT, "export");

const cfg = JSON.parse(readFileSync(join(ROOT, "site.config.json"), "utf8"));
const english = JSON.parse(readFileSync(join(CONTENT, "en.json"), "utf8")).strings;
const keys = JSON.parse(readFileSync(join(CONTENT, "KEYS.json"), "utf8"));

const asked = process.argv.slice(2);
const langs = cfg.languages.filter(
  (l) => l.code !== cfg.defaultLang && (!asked.length || asked.includes(l.code))
);

const sectionOf = (key) => key.split(".")[0];
const PLACEHOLDER = /\{[a-z]+\}/g;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const summary = [];

for (const lang of langs) {
  const file = join(CONTENT, `${lang.code}.json`);
  if (!existsSync(file)) continue;
  const mine = JSON.parse(readFileSync(file, "utf8")).strings || {};

  const strings = Object.entries(english).map(([key, en]) => {
    const pair = mine[key];
    const translation = pair && typeof pair === "object" ? pair[lang.code] || "" : "";
    const entry = {
      key,
      section: keys.sections[sectionOf(key)] || undefined,
      note: keys.notes[key] || undefined,
      placeholders: (en.match(PLACEHOLDER) || []).length ? en.match(PLACEHOLDER) : undefined,
      en,
      [lang.code]: translation,
    };
    for (const k of Object.keys(entry)) if (entry[k] === undefined) delete entry[k];
    return entry;
  });

  const done = strings.filter((s) => s[lang.code]).length;

  writeFileSync(
    join(OUT, `${lang.code}.json`),
    JSON.stringify(
      {
        language: {
          code: lang.code,
          name: lang.name,
          native: lang.native,
          direction: lang.dir,
          alsoServes: lang.alsoServes,
        },
        translated: `${done} of ${strings.length}`,
        howToRead:
          "One entry per string. 'en' is the canonical English and is always right where the two disagree. " +
          `'${lang.code}' is the translation to judge. 'section' says where on the page the string appears and what it is for, ` +
          "'note' constrains that particular string, and 'placeholders' lists the tokens that must appear in the translation " +
          "exactly as they appear in the English. Rules that apply to every string are in GLOSSARY.md.",
        strings,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  summary.push({ code: lang.code, name: lang.name, native: lang.native, dir: lang.dir, done, total: strings.length });
}

for (const doc of ["GLOSSARY.md", "README.md"]) {
  if (existsSync(join(CONTENT, doc))) cpSync(join(CONTENT, doc), join(OUT, doc));
}

const rows = summary
  .map((s) => `| ${s.code} | ${s.name} | ${s.native} | ${s.dir} | ${s.done}/${s.total} |`)
  .join("\n");

writeFileSync(
  join(OUT, "INDEX.md"),
  `# Lukotta website — translations for review

Everything the website says, in every language it says it in. Each file is
complete on its own: the English, the translation, and the context for every
string. Nothing here refers to the repository or to the site.

Read \`GLOSSARY.md\` first — it lists the words that are not free to translate
and why. \`README.md\` describes how a language file is shaped and the rules a
translation is judged by.

| Code | Language | Native name | Direction | Translated |
| --- | --- | --- | --- | --- |
${rows}

Arabic and Hebrew are written right to left; the page turns round on its own
and nothing in the text needs to change for it.

Report a problem by naming the key, what is wrong, and what it should be.
`,
  "utf8"
);

console.log(`\n  Exported ${summary.length} language(s) to export/\n`);
for (const s of summary) {
  const bar = s.done === s.total ? "complete" : `${s.done}/${s.total}`;
  console.log(`  ${s.code.padEnd(8)} ${s.name.padEnd(24)} ${bar}`);
}
console.log(`\n  Also: GLOSSARY.md, README.md, INDEX.md`);
console.log(`  Zip it with:  cd export && zip -r ../lukotta-translations.zip .\n`);
