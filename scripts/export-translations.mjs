#!/usr/bin/env node
/* Bundles every translation for review, one file per language. Each string
   carries its key, the English source, the translation, the purpose of its
   section, any note constraining it, and its required placeholders, so a file
   can be reviewed without opening another.

   Usage:  node scripts/export-translations.mjs [code ...]
           node scripts/export-translations.mjs            (all)
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

/* The four task pages, which are long prose rather than interface labels and
   live one file per language. They are carried in the same export as the
   landing page because the same person reads both, and because a reviewer
   judging whether this language calls a drive the right thing needs to see
   every place it says it. */
const PAGES = join(CONTENT, "pages");
const enPages = JSON.parse(readFileSync(join(PAGES, "en.json"), "utf8"));

function pageUnits(page, key) {
  const out = [
    { id: `${key}.title`, is: "The page heading, its browser tab, and the first line of its search result.", en: page.title },
    { id: `${key}.description`, is: "The second line of the search result. Never appears on the page. Written for somebody typing their problem into a search engine, so judge it by whether those are the words they would type.", en: page.description },
    { id: `${key}.slug`, is: "The address. Lowercase a-z, 0-9 and single hyphens, in every language: it becomes a directory name on the build machine as well as a URL, and macOS normalises directory names differently from the way the sitemap carries them.", en: page.slug },
    { id: `${key}.lead`, is: "The opening paragraph, in larger type under the heading.", en: page.lead },
  ];
  page.sections.forEach((sec, i) => {
    if (sec.heading) out.push({ id: `${key}.s${i}.heading`, is: "A section heading.", en: sec.heading });
    (sec.paragraphs || []).forEach((t, j) =>
      out.push({ id: `${key}.s${i}.p${j}`, is: t.startsWith("    ") ? "A sample shown in a box. Not language: it must survive unchanged." : "A paragraph.", en: t }));
    (sec.list || []).forEach((t, j) =>
      out.push({ id: `${key}.s${i}.l${j}`, is: sec.listKind === "steps" ? "One numbered step, written as an instruction." : "One item in a list.", en: t }));
  });
  return out;
}

/* Pull one string back out of a built language file by its identifier. */
function fromPages(data, id) {
  const key = id.slice(0, id.indexOf("."));
  const rest = id.slice(key.length + 1);
  const page = data?.pages?.[key];
  if (!page) return "";
  if (["slug", "title", "description", "lead"].includes(rest)) return page[rest] || "";
  const sec = page.sections?.[Number(rest.match(/^s(\d+)/)[1])];
  if (rest.includes(".heading")) return sec?.heading || "";
  if (rest.includes(".p")) return sec?.paragraphs?.[Number(rest.match(/\.p(\d+)/)[1])] || "";
  return sec?.list?.[Number(rest.match(/\.l(\d+)/)[1])] || "";
}

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
  const parsed = JSON.parse(readFileSync(file, "utf8"));
  const mine = parsed.strings || {};
  const localOnly = parsed.localOnly;

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

  /* The four pages in this language, beside the English, unit by unit. A
     language without a file simply has none, which is the honest state: the
     build gives it no task pages either. */
  const pagesFile = join(PAGES, `${lang.code}.json`);
  let taskPages = null;
  if (existsSync(pagesFile)) {
    const mine = JSON.parse(readFileSync(pagesFile, "utf8"));
    const units = [];
    for (const key of enPages.order) {
      for (const u of pageUnits(enPages.pages[key], key)) {
        units.push({ id: u.id, is: u.is, en: u.en, [lang.code]: fromPages(mine, u.id) });
      }
    }
    units.unshift({
      id: "ui.free", is: "The line under the download heading at the foot of every task page.",
      en: enPages.ui.free, [lang.code]: mine.ui?.free || "",
    });
    for (const [key, label] of Object.entries(enPages.linkFromFaq)) {
      units.push({
        id: `faq.${key}`,
        is: `The link at the end of an answer in the FAQ on the landing page, leading to the ${key} page. It must not repeat the question it sits under.`,
        en: label, [lang.code]: mine.linkFromFaq?.[key] || "",
      });
    }
    taskPages = {
      $note:
        "Four pages about one subject each, linked from the formats table and the FAQ. These are prose, not interface " +
        "labels: judge them as writing as well as translation. The identifier says which page and where in it, so a " +
        "finding needs nothing but the identifier. Product and format names stay in Latin script; names of things on " +
        "the reader's own screen must read as that language's macOS writes them, and where macOS is not offered in " +
        "this language they stay in English, because that is what the reader's Mac shows.",
      units,
    };
  }

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
        localOnly: localOnly
          ? {
              $note:
                "Strings that exist in this language and no other. They have no English original; judge them as " +
                "writing rather than as translation. They appear on no other language's page.",
              ...localOnly,
            }
          : undefined,
        howToRead:
          "One entry per string. 'en' is the canonical English and is always right where the two disagree. " +
          `'${lang.code}' is the translation to judge. 'section' says where on the page the string appears and what it is for, ` +
          "'note' constrains that particular string, and 'placeholders' lists the tokens that must appear in the translation " +
          "exactly as they appear in the English. Rules that apply to every string are in GLOSSARY.md.",
        strings,
        taskPages: taskPages || undefined,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  summary.push({
    code: lang.code, name: lang.name, native: lang.native, dir: lang.dir,
    done, total: strings.length, pages: taskPages ? taskPages.units.length : 0,
  });
}

for (const doc of ["GLOSSARY.md", "README.md", "REVIEW-PROMPT.md"]) {
  if (existsSync(join(CONTENT, doc))) cpSync(join(CONTENT, doc), join(OUT, doc));
}

/* Written while the task pages were, and about the landing page rather than
   about them. It goes in the pack because several of its entries explain why a
   task page and the landing page say different things. */
if (existsSync(join(PAGES, "NOTES.md"))) {
  cpSync(join(PAGES, "NOTES.md"), join(OUT, "WHAT-TURNED-UP.md"));
}

/* The task pages are prose, and the existing prompt is written for interface
   strings. This is the part that is different about them. It is generated
   rather than kept beside the other documents so it cannot drift from the
   shape of the files it describes. */
writeFileSync(
  join(OUT, "REVIEW-PROMPT-TASK-PAGES.md"),
  `# Reviewing the four task pages

Beside the landing page, each language file carries a \`taskPages\` block: four
pages of prose, ${enPages.order.length * 25}-odd strings, under identifiers that say which page and
where in it. Read \`REVIEW-PROMPT.md\` first — everything in it still applies —
and then this, which is about what is different.

## What these pages are

Four pages, one for each thing a Mac will not do on its own: open a BitLocker
drive, read a Linux drive, write to an NTFS drive, open a virtual machine's
disk file. Somebody arrives from a search having just plugged in a drive their
Mac offered to erase.

Each page answers in the same order: what the thing is, what the Mac does with
it, why it does that, what Lukotta does about it, then the particulars. That
order is the reason they work. A translation that keeps every sentence but
rearranges them has broken the page.

## What is different from the landing page

**They are prose.** The landing page is labels and short claims. These are
paragraphs somebody reads start to finish. A sentence that is accurate and
graceless is a finding here in a way it is not there. Say what a native speaker
would have written.

**The reader is assumed to know less.** The English deliberately explains what
a filesystem is, what BitLocker is, what a recovery key looks like. Do not
assume more of the reader than it does, and do not assume less: a translation
that tightens the explanations because they seem obvious has lost the audience
the page was written for.

**They must agree with the landing page.** The same person reads both. Where a
task page calls a drive one thing and the landing page another, that is a
finding even when both words are correct — say which one should win.
\`WHAT-TURNED-UP.md\` lists the places where the landing page already disagrees
with itself, and which way the task pages went. Those are known; you do not
need to report them again unless you think the choice was wrong.

**Names on the reader's screen.** Finder, File, Get Info, Format, Locations.
These must read as that language's macOS writes them. In the seven languages
macOS is not offered in — Estonian, Latvian, Lithuanian, Albanian, Slovenian,
Bulgarian and Filipino — they stay in English, because that is what the
reader's own Mac shows. In those languages one sentence legitimately mixes the
two: an English **File** menu holding a menu item in the reader's language,
because Lukotta itself is translated.

**The addresses.** Each page carries its own slug. It is lowercase a-z, 0-9 and
single hyphens in every language, including the ones that do not use the Latin
alphabet, and \`WHAT-TURNED-UP.md\` explains why. Judge it by whether it is what
somebody in this language would type into a search box. Say so if it is not.

**The sample.** The 48-digit recovery key and the paragraph it sits in must
survive unchanged. It is a thing the reader holds beside the screen and
compares digit by digit.

## How to answer

Exactly as in \`REVIEW-PROMPT.md\`, with the identifier in place of the key:

\`\`\`
FINDING <n>
language:   <code>
key:        bitlocker.s2.p0
severity:   error | wrong-register | unnatural | terminology | seo | question
current:    <the translation as it stands>
proposed:   <your replacement, or — if you are only raising a question>
because:    <what is wrong. Not "reads better".>
confidence: high | medium | low
\`\`\`

Work through the languages one at a time. If a language's task pages have no
findings, write \`<code> pages: no findings\` on one line.
`,
  "utf8"
);

/* How the application translates the same terms. The site and the
   application are read by the same person, so both should agree. */
const APP = join(ROOT, "..", "lukotta", "translations");
const APP_TERMS = [
  "Open", "Unlock", "Eject", "Passphrase", "Password or recovery key",
  "Disk Image", "Open Disk Image…", "Open Drive…", "Open Read-Only",
  "Opening read-only", "Locked", "Location", "Full Disk Access",
  "Administrator password", "Licence", "Language", "Dark", "Light",
  "Appearance", "How it works", "Open encrypted drives on macOS",
  "Handing the drive to Finder", "GNU General Public License",
];

if (existsSync(APP)) {
  const byLanguage = {};
  for (const lang of langs) {
    const file = join(APP, `${lang.code}.json`);
    if (!existsSync(file)) continue;
    const shipped = JSON.parse(readFileSync(file, "utf8")).strings || {};
    const terms = {};
    for (const term of APP_TERMS) if (shipped[term]) terms[term] = shipped[term];
    if (Object.keys(terms).length) {
      byLanguage[lang.code] = { language: lang.name, native: lang.native, terms };
    }
  }
  writeFileSync(
    join(OUT, "TERMINOLOGY-FROM-THE-APP.json"),
    JSON.stringify(
      {
        $comment:
          "How the Lukotta application itself translates these terms, taken from its own shipped " +
          "translations. The website should agree with the application: the same person reads both, " +
          "often on the same afternoon. This is a reference, not a list of required substitutions: " +
          "the website is prose and the application is interface, so the grammar around a term differs.",
        languages: byLanguage,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );
  console.log(`  Terminology from the application: ${Object.keys(byLanguage).length} languages`);
} else {
  console.log("  (the application's translations were not found; no terminology reference)");
}

const rows = summary
  .map((s) => `| ${s.code} | ${s.name} | ${s.native} | ${s.dir} | ${s.done}/${s.total} |`)
  .join("\n");

writeFileSync(
  join(OUT, "INDEX.md"),
  `# Lukotta website: translations for review

Everything the website says, in every language it says it in. Each file is
complete on its own: the English, the translation, and the context for every
string. Nothing here refers to the repository or to the site.

Read \`GLOSSARY.md\` first. It lists the words that are not free to translate
and why. \`README.md\` describes how a language file is shaped and the rules a
translation is judged by.

Each language file holds two things. \`strings\` is the landing page, as before.
\`taskPages\` is four pages of prose about one subject each — opening a BitLocker
drive, reading a Linux drive, writing to an NTFS drive, opening a virtual
machine's disk file — which are new and have not been reviewed before.
\`REVIEW-PROMPT-TASK-PAGES.md\` says what is different about judging them.

\`WHAT-TURNED-UP.md\` lists the disagreements inside the existing translations
that surfaced while those pages were written. Nothing there was changed.

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
  const pages = s.pages ? `  + ${s.pages} on the task pages` : "  (no task pages)";
  console.log(`  ${s.code.padEnd(8)} ${s.name.padEnd(24)} ${bar}${pages}`);
}
console.log(`\n  Also: GLOSSARY.md, README.md, INDEX.md`);
console.log(`  Zip it with:  cd export && zip -r ../lukotta-translations.zip .\n`);
