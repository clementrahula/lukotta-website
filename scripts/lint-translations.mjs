#!/usr/bin/env node
/* Checks translations against the English: placeholders, lengths, and the
   things that quietly break a page rather than merely reading oddly.

   Usage:  node scripts/lint-translations.mjs [code ...]
*/

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const cfg = JSON.parse(readFileSync(join(ROOT, "site.config.json"), "utf8"));
const english = JSON.parse(readFileSync(join(CONTENT, "en.json"), "utf8")).strings;

const PLACEHOLDER = /\{[a-z]+\}/g;

/* Names that stay in Latin script whatever the surrounding language. If the
   English names one and the translation does not, something was translated
   that should not have been. */
const VERBATIM = [
  "Lukotta", "macOS", "Finder", "BitLocker", "NTFS", "LUKS", "LVM",
  "ext2", "ext3", "ext4", "btrfs", "XFS", "exFAT", "FAT",
  "qcow2", "VMDK", "VDI", "VHDX", "VHD", "IMG", "DMG", "OVA",
  "VMware", "VirtualBox", "Hyper-V", "QEMU", "UTM", "Windows", "Linux",
  "Apple Silicon", "Sequoia", "GitHub",
];

const asked = process.argv.slice(2);
const langs = cfg.languages.filter(
  (l) => l.code !== cfg.defaultLang && (!asked.length || asked.includes(l.code))
);

let errors = 0, warns = 0, checked = 0;
const say = (kind, lang, msg) => {
  if (kind === "ERROR") errors++; else warns++;
  console.log(`  ${kind.padEnd(7)} ${lang.padEnd(8)} ${msg}`);
};

for (const lang of langs) {
  const file = join(CONTENT, `${lang.code}.json`);
  if (!existsSync(file)) { say("ERROR", lang.code, "no content file"); continue; }
  const data = JSON.parse(readFileSync(file, "utf8"));
  const mine = data.strings || {};

  if (data.language?.dir !== lang.dir) {
    say("ERROR", lang.code, `direction is "${data.language?.dir}", expected "${lang.dir}"`);
  }

  const done = Object.keys(english).filter((k) => mine[k] && mine[k][lang.code]).length;
  if (done === 0) continue;                       /* untouched placeholder file */
  checked++;

  for (const [key, en] of Object.entries(english)) {
    const pair = mine[key];
    if (!pair) { say("ERROR", lang.code, `${key} is missing`); continue; }
    const got = pair[lang.code];
    if (!got) { say("ERROR", lang.code, `${key} is not translated`); continue; }

    /* Placeholders must survive exactly. A missing one leaves a literal
       {version} on the page; an invented one leaves a token nothing replaces. */
    const want = (en.match(PLACEHOLDER) || []).sort();
    const have = (got.match(PLACEHOLDER) || []).sort();
    if (want.join() !== have.join()) {
      say("ERROR", lang.code, `${key}: placeholders ${JSON.stringify(want)} became ${JSON.stringify(have)}`);
    }

    for (const term of VERBATIM) {
      if (en.includes(term) && !got.includes(term)) {
        say("WARN", lang.code, `${key}: the English says "${term}" and the translation does not`);
      }
    }

    if (en !== got && /^[\x20-\x7E]*$/.test(got) && lang.dir === "rtl") {
      say("WARN", lang.code, `${key}: reads as plain ASCII in a right-to-left language`);
    }
  }

  const title = mine["meta.title"]?.[lang.code] || "";
  const desc = mine["meta.description"]?.[lang.code] || "";
  if (title.length > 60) say("WARN", lang.code, `meta.title is ${title.length} characters; search results cut it at about 60`);
  if (desc && (desc.length < 70 || desc.length > 165)) {
    say("WARN", lang.code, `meta.description is ${desc.length} characters; 70–165 shows in full`);
  }

  const same = Object.entries(english).filter(([k, en]) => mine[k]?.[lang.code] === en).map(([k]) => k);
  const expected = new Set(["formats.yes", "formats.no", "faq.title", "features.title", "nav.features", "nav.download", "footer.copyright", "story.signature", "footer.source", "footer.contact"]);
  const unexpected = same.filter((k) => !expected.has(k));
  if (unexpected.length > 3) {
    say("WARN", lang.code, `${unexpected.length} strings are identical to the English: ${unexpected.slice(0, 4).join(", ")}…`);
  }
}

console.log(`\n  ${checked} language(s) with content checked — ${errors} error(s), ${warns} warning(s)\n`);
process.exit(errors ? 1 : 0);
