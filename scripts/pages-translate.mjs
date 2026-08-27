#!/usr/bin/env node
/* Translating the task pages, one language at a time.

     node scripts/pages-translate.mjs brief <code>    what to translate
     node scripts/pages-translate.mjs apply <code>    put the answer back
     node scripts/pages-translate.mjs check [code..]  judge what is there

   The four task pages are long prose rather than interface labels, and there
   are thirty-six languages of them. Translating that much in one sitting is how
   the last few languages end up worse than the first: the words settle, then
   quietly shift. So the work is done a language at a time, and the parts that
   must not shift are checked by this file rather than remembered.

   Three things hold a language still:

     The structure is never retyped. `brief` writes out every translatable unit
     under an identifier; `apply` reads the identifiers back and rebuilds the
     page around them from the English. A paragraph cannot go missing, land in
     the wrong section, or arrive without its heading, because none of that is
     written by hand.

     The language's own words come with it. Each brief carries that language's
     hundred landing-page strings, already translated and already reviewed. The
     task pages say the same things at greater length, to the same reader, and
     they must say them in the same words. This is the part a fresh sitting
     would otherwise get wrong.

     The names are checked, not trusted. A term the glossary keeps in Latin
     script has to survive into the translation. `check` says so when one does
     not, which is what catches a name that has been helpfully translated. */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const PAGES = join(CONTENT, "pages");
const WORK = join(ROOT, "dist", "pages-work");

const cfg = JSON.parse(readFileSync(join(ROOT, "site.config.json"), "utf8"));
const en = JSON.parse(readFileSync(join(PAGES, "en.json"), "utf8"));

/* Names that stay in Latin script in every language, from the landing page's
   own linter so the two cannot disagree, plus the ones only these pages use. */
const VERBATIM = [
  "Lukotta", "macOS", "BitLocker", "NTFS", "LUKS", "LVM", "APFS", "FileVault",
  "ext2", "ext3", "ext4", "btrfs", "XFS", "exFAT",
  "qcow2", "VMDK", "VDI", "VHDX", "VHD", "OVA", "TPM",
  "VMware", "VirtualBox", "Hyper-V", "QEMU", "UTM", "Windows", "Linux", "Apple",
];

/* The recovery key is an example of a thing the reader will hold beside the
   screen and compare digit by digit. It is not language. */
const SAMPLE = "123456-789012-345678-901234-567890-123456-789012-345678";

/* ------------------------------------------------------------ the units -- */

/* Every translatable string, under an identifier that says where it belongs.
   The identifier is the contract between `brief` and `apply`: the same list in
   the same order, derived from the English both times, so neither end has an
   opinion about the shape of a page. */
function units() {
  const out = [
    { id: "ui.free", en: en.ui.free,
      what: "The line under the download heading at the foot of every task page." },
  ];
  for (const [key, label] of Object.entries(en.linkFromFaq)) {
    out.push({ id: `faq.${key}`, en: label,
      what: `The link at the end of an answer in the FAQ on the landing page, leading to the ${key} page. It must not repeat the question it sits under.` });
  }
  for (const key of en.order) {
    const p = en.pages[key];
    out.push(
      { id: `${key}.title`, en: p.title,
        what: "The page's heading, its browser tab, and the first line of its search result. Under about 55 characters." },
      { id: `${key}.description`, en: p.description,
        what: "The second line of the search result. Never on the page. Written for somebody typing their problem into a search engine. Between 70 and 160 characters." },
      { id: `${key}.slug`, en: p.slug, slug: true,
        what: "The address. See the note on addresses in the brief." },
      { id: `${key}.lead`, en: p.lead,
        what: "The opening paragraph, in larger type under the heading." },
    );
    p.sections.forEach((s, i) => {
      if (s.heading) out.push({ id: `${key}.s${i}.heading`, en: s.heading,
        what: "A section heading." });
      (s.paragraphs || []).forEach((t, j) => out.push({ id: `${key}.s${i}.p${j}`, en: t,
        what: "A paragraph." }));
      (s.list || []).forEach((t, j) => out.push({ id: `${key}.s${i}.l${j}`, en: t,
        what: s.listKind === "steps" ? "One numbered step. It is an instruction; write it as one." : "One item in a list." }));
    });
  }
  return out;
}

/* Rebuild a whole language file from the English shape and a flat map of
   identifiers. Nothing here reads the translation's structure, because the
   translation has none: it is a hundred and some strings under known names. */
function rebuild(code, got) {
  const missing = [];
  /* Not trimmed. A sample is marked by the spaces in front of it, and this is
     the second place that quietly ate them. */
  const take = (id) => {
    const v = got[id] ?? "";
    if (!v.trim()) missing.push(id);
    return v;
  };
  const out = {
    $comment: en.$comment,
    language: { code, name: langOf(code).name, native: langOf(code).native, dir: langOf(code).dir },
    ui: { free: take("ui.free") },
    order: [...en.order],
    pages: {},
    linkFromFormatsTable: { ...en.linkFromFormatsTable },
    linkFromFaq: {},
    faqAnswerFor: { ...en.faqAnswerFor },
  };
  for (const key of Object.keys(en.linkFromFaq)) out.linkFromFaq[key] = take(`faq.${key}`);
  for (const key of en.order) {
    const p = en.pages[key];
    out.pages[key] = {
      slug: take(`${key}.slug`),
      title: take(`${key}.title`),
      description: take(`${key}.description`),
      lead: take(`${key}.lead`),
      sections: p.sections.map((s, i) => {
        const sec = {};
        if (s.heading) sec.heading = take(`${key}.s${i}.heading`);
        if (s.paragraphs) sec.paragraphs = s.paragraphs.map((_, j) => take(`${key}.s${i}.p${j}`));
        if (s.list) sec.list = s.list.map((_, j) => take(`${key}.s${i}.l${j}`));
        if (s.listKind) sec.listKind = s.listKind;
        return sec;
      }),
    };
  }
  return { out, missing };
}

/* Pull one string out of a built language file by its identifier. The checker
   and the brief both go through here, so neither can develop its own idea of
   where a string lives. */
function read(data, id) {
  if (id === "ui.free") return data.ui?.free;
  if (id.startsWith("faq.")) return data.linkFromFaq?.[id.slice(4)];
  const key = id.slice(0, id.indexOf("."));
  const rest = id.slice(key.length + 1);
  const p = data.pages?.[key];
  if (!p) return undefined;
  if (["slug", "title", "description", "lead"].includes(rest)) return p[rest];
  const sec = p.sections?.[Number(rest.match(/^s(\d+)/)[1])];
  if (rest.includes(".heading")) return sec?.heading;
  if (rest.includes(".p")) return sec?.paragraphs?.[Number(rest.match(/\.p(\d+)/)[1])];
  return sec?.list?.[Number(rest.match(/\.l(\d+)/)[1])];
}

const langOf = (code) => cfg.languages.find((l) => l.code === code);

/* ----------------------------------------------------------- the checks -- */

/* A name has survived if it is still there in Latin script. Only the start of
   the word is anchored: Estonian writes "BitLockeriga" and Finnish
   "BitLockerilla", and a name carrying a case ending is still the name. What
   this is looking for is the name replaced by a local spelling of it. */
const survives = (term, text) =>
  new RegExp(`(^|[^A-Za-z0-9])${term.replace(/[-]/g, "\\-")}`, "i").test(text);

function judge(code, data) {
  const notes = [];
  const err = (m) => notes.push(["ERROR", m]);
  const warn = (m) => notes.push(["warn", m]);
  const lang = langOf(code);

  /* The English carries no language block: it is the source, not a translation
     of anything, and the build reads its direction from the configuration. */
  if (code !== cfg.defaultLang && data.language?.dir !== lang.dir)
    err(`language.dir is "${data.language?.dir}", expected "${lang.dir}"`);

  const slugs = new Set();
  for (const u of units()) {
    let got = read(data, u.id);
    if (got === undefined && !data.pages?.[u.id.slice(0, u.id.indexOf("."))]
        && !u.id.startsWith("faq.") && u.id !== "ui.free") {
      err(`${u.id.slice(0, u.id.indexOf("."))}: the page is missing`);
      continue;
    }
    got = got ?? "";
    if (!got.trim()) { err(`${u.id} is empty`); continue; }

    if (u.slug) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(got))
        err(`${u.id}: "${got}" is not a usable address (lowercase a-z, 0-9 and single hyphens)`);
      if (slugs.has(got)) err(`${u.id}: "${got}" is used by another page in this language`);
      slugs.add(got);
      if (got.length > 65) warn(`${u.id}: ${got.length} characters, longer than is read`);
      continue;
    }

    for (const term of VERBATIM) {
      if (survives(term, u.en) && !survives(term, got))
        err(`${u.id}: "${term}" is in the English and not in the translation`);
    }
    if (u.en.includes(SAMPLE) && !got.includes(SAMPLE))
      err(`${u.id}: the example recovery key has been altered`);
    if (u.en.startsWith("    ") && !got.startsWith("    "))
      err(`${u.id}: the indent marking this as a sample has been lost`);

    /* Paragraph breaks carry the shape of the prose. A paragraph that arrives
       as one block where the English had two reads as a wall. */
    const enBreaks = (u.en.match(/\n\n/g) || []).length;
    const gotBreaks = (got.match(/\n\n/g) || []).length;
    if (enBreaks !== gotBreaks)
      err(`${u.id}: ${gotBreaks} paragraph breaks where the English has ${enBreaks}`);

    if (code !== "en" && got === u.en && u.en.split(/\s+/).length > 3)
      warn(`${u.id}: identical to the English`);

    if (u.id.endsWith(".description") && (got.length < 70 || got.length > 160))
      warn(`${u.id}: ${got.length} characters, wanted between 70 and 160`);
    if (u.id.endsWith(".title") && got.length > 55)
      warn(`${u.id}: ${got.length} characters, longer than a search result shows`);
  }
  return notes;
}

/* ------------------------------------------------------------- commands -- */

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === "brief") {
  const code = rest[0];
  const lang = langOf(code);
  if (!lang) { console.error(`no such language: ${code}`); process.exit(1); }
  mkdirSync(WORK, { recursive: true });

  const site = JSON.parse(readFileSync(join(CONTENT, `${code}.json`), "utf8")).strings;
  const glossary = readFileSync(join(CONTENT, "GLOSSARY.md"), "utf8");
  const list = units();

  const md = [];
  md.push(`# ${lang.name} (${lang.native}) — the four task pages`, "");
  md.push(`Reading direction: ${lang.dir}. ${list.length} strings.`, "");
  md.push(`## What these pages are`, "",
    "Four pages, one for each thing a Mac will not do on its own: open a",
    "BitLocker drive, read a Linux drive, write to an NTFS drive, open a virtual",
    "machine's disk file. Somebody arrives from a search having just plugged in a",
    "drive their Mac offered to erase. Each page answers in the same order: what",
    "the thing is, what the Mac does with it, why it does that, what Lukotta does",
    "about it, then the particulars. The English is deliberately plain and",
    "explains what a filesystem is. Do not assume more of the reader than it",
    "does, and do not assume less.", "");
  md.push(`## The words this language already uses`, "",
    "These are the site's own strings in this language, already translated and",
    "already reviewed. The task pages are the same claims at greater length, to",
    "the same reader. Where one of them has settled on a word for drive, unlock,",
    "passphrase, read-only or Finder, use that word. Disagreeing with them is the",
    "single most likely way these pages go wrong.", "");
  for (const [k, v] of Object.entries(site)) {
    const t = (v && typeof v === "object" ? v[code] : v) || "";
    if (t) md.push(`- \`${k}\`  \n  en: ${v.en ?? v}  \n  ${code}: ${t}`);
  }
  md.push("", "## The addresses", "",
    "Each page carries its own address, in this language. It is lowercase a-z,",
    "0-9 and single hyphens: no accents and no other script. That is not a",
    "preference. The address becomes a folder on the build machine, a line in the",
    "sitemap and a URL submitted to IndexNow, and macOS stores folder names in a",
    "different Unicode normalisation from the one those files would carry, so a",
    "non-ASCII address quietly stops matching itself.", "",
    "So write what somebody searching in this language would actually type, with",
    "the accents removed, rather than a transliteration of the English. Where the",
    "language searches for these things in English anyway, which is common for",
    "BitLocker and NTFS, the address may keep the English word.", "");
  md.push("## The glossary", "", glossary, "");
  md.push("## The strings", "");
  for (const u of list) {
    md.push(`### \`${u.id}\``, "", u.what, "",
      "```", u.en, "```", "");
  }
  writeFileSync(join(WORK, `${code}.md`), md.join("\n"), "utf8");

  /* If the language has been done before, the sheet comes back filled in, so a
     second pass is a correction rather than a fresh translation. */
  const have = existsSync(join(PAGES, `${code}.json`))
    ? JSON.parse(readFileSync(join(PAGES, `${code}.json`), "utf8")) : null;
  const starter = {};
  for (const u of list) starter[u.id] = have ? (read(have, u.id) ?? "") : "";
  writeFileSync(join(WORK, `${code}.json`), JSON.stringify(starter, null, 2) + "\n", "utf8");

  const filled = Object.values(starter).filter(Boolean).length;
  console.log(`  ${join(WORK, `${code}.md`)}`);
  console.log(`  ${join(WORK, `${code}.json`)}  ${filled} of ${list.length} filled in`);

} else if (cmd === "vocab") {
  /* The part of the brief that matters most, on its own. These are the keys
     whose English says the same things the task pages say at greater length:
     what a Mac does with a BitLocker drive, what read-only means, what the
     recovery key is called. Translating a task page without them in view is how
     one page ends up calling a drive one thing and the next page another. */
  const code = rest[0];
  const site = JSON.parse(readFileSync(join(CONTENT, `${code}.json`), "utf8")).strings;
  const WANTED = [
    "meta.title", "meta.description", "hero.title", "hero.subtitle",
    "how.lead", "how.1.title", "how.1.body", "how.2.title", "how.2.body",
    "how.3.title", "how.3.body",
    "features.title", "features.lead", "features.body", "features.body2",
    "formats.bitlocker.note", "formats.luks.note", "formats.lvm.note",
    "formats.ntfs.note", "formats.linuxfs.note", "formats.exfat.note",
    "formats.qcow2.note", "formats.vmdk.note", "formats.vmdkStream.note",
    "formats.vdi.note", "formats.vhd.note", "formats.vhdx.note",
    "formats.not.1", "formats.not.2", "formats.not.3", "formats.not.5",
    "faq.2.q", "faq.2.a", "faq.3.q", "faq.3.a", "faq.4.q", "faq.4.a",
    "faq.5.q", "faq.5.a", "faq.1.a", "hero.download", "hero.meta",
  ];
  for (const k of WANTED) {
    const v = site[k];
    if (!v) continue;
    const t = (typeof v === "object" ? v[code] : v) || "";
    if (t) console.log(`${k}\n  en  ${v.en ?? v}\n  ${code}  ${t}\n`);
  }

  /* And the application's own words for the same things. The reader opens the
     page and then the application, often within the minute; a page that calls a
     menu item something the menu does not call it is a broken instruction, not
     a wording preference. */
  const APP = join(ROOT, "..", "lukotta", "translations", `${code}.json`);
  if (existsSync(APP)) {
    const shipped = JSON.parse(readFileSync(APP, "utf8")).strings || {};
    console.log("--- the application's own words ---");
    for (const [term, got] of Object.entries(shipped)) {
      if (/^(Open|Unlock|Eject|Passphrase|Locked|Read-only|Read-Only|Open Read-Only|Open Disk Image|Open Drive|Recovery key|Password or recovery key|Locations?|Disk [Ii]mage|Drive|Volume)\b/.test(term)
          && term.length < 46 && typeof got === "string") {
        console.log(`  ${term}  ->  ${got}`);
      }
    }
  }

} else if (cmd === "apply") {
  const code = rest[0];
  if (!langOf(code)) { console.error(`no such language: ${code}`); process.exit(1); }
  const src = join(WORK, `${code}.json`);
  if (!existsSync(src)) { console.error(`no ${src} — run brief first`); process.exit(1); }
  const got = JSON.parse(readFileSync(src, "utf8"));

  const known = new Set(units().map((u) => u.id));
  const extra = Object.keys(got).filter((k) => !known.has(k));
  if (extra.length) {
    console.error(`  ${extra.length} identifiers that do not exist:`);
    for (const k of extra.slice(0, 10)) console.error(`    ${k}`);
    process.exit(1);
  }

  const { out, missing } = rebuild(code, got);
  if (missing.length) {
    console.error(`  ${missing.length} strings still empty:`);
    for (const k of missing.slice(0, 10)) console.error(`    ${k}`);
    process.exit(1);
  }

  const notes = judge(code, out);
  for (const [kind, m] of notes) console.log(`  ${kind.padEnd(5)} ${m}`);
  if (notes.some(([k]) => k === "ERROR")) { console.error("\n  not written"); process.exit(1); }

  writeFileSync(join(PAGES, `${code}.json`), JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`  content/pages/${code}.json written`);

} else if (cmd === "check") {
  const codes = rest.length ? rest
    : cfg.languages.map((l) => l.code).filter((c) => existsSync(join(PAGES, `${c}.json`)));
  let errors = 0, warns = 0;
  for (const code of codes) {
    const file = join(PAGES, `${code}.json`);
    if (!existsSync(file)) { console.log(`  ERROR ${code}  no file`); errors++; continue; }
    const notes = judge(code, JSON.parse(readFileSync(file, "utf8")));
    for (const [kind, m] of notes) {
      console.log(`  ${kind.padEnd(5)} ${code.padEnd(8)} ${m}`);
      if (kind === "ERROR") errors++; else warns++;
    }
  }
  const missing = cfg.languages.filter((l) => !existsSync(join(PAGES, `${l.code}.json`)));
  console.log(`\n  ${codes.length} translated, ${missing.length} still to do`);
  if (missing.length) console.log(`  ${missing.map((l) => l.code).join(" ")}`);
  console.log(`  ${errors} errors, ${warns} warnings\n`);
  process.exit(errors ? 1 : 0);

} else {
  console.error("usage: pages-translate.mjs brief|vocab|apply|check [code ...]");
  process.exit(1);
}
