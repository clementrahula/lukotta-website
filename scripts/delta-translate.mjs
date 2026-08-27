#!/usr/bin/env node
/* The agent-readiness work added two things in English: sixteen strings for the
   404 and two pages, About and Contact. This applies a translation of both for
   one language and refuses anything that would ship broken.

     node scripts/delta-translate.mjs show <code>     what is missing
     node scripts/delta-translate.mjs apply <code>    put dist/delta/<code>.json in

   Same discipline as the guides: the structure of a page is rebuilt from the
   English rather than retyped, so a paragraph cannot land in the wrong section,
   and the names that stay in Latin script are checked rather than trusted. */

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const cfg = JSON.parse(readFileSync(join(ROOT, "site.config.json"), "utf8"));
const english = JSON.parse(readFileSync(join(CONTENT, "en.json"), "utf8")).strings;
const enSite = JSON.parse(readFileSync(join(CONTENT, "site", "en.json"), "utf8"));
const WORK = join(ROOT, "dist", "delta");

const NOT_FOUND = Object.keys(english).filter((k) => k.startsWith("notFound."));

/* Names that stay in Latin script whatever the surrounding language. */
/* Finder is deliberately absent: Apple translates it in some languages, and
   Chinese macOS calls it 访达. GLOSSARY.md covers it as an apple-term. */
const VERBATIM = ["Lukotta", "macOS", "BitLocker", "NTFS", "LUKS", "APFS", "exFAT",
  "ext2", "ext3", "ext4", "btrfs", "XFS", "qcow2", "VMDK", "VDI", "VHDX", "VHD",
  "Windows", "Linux", "GNU General Public License", "SECURITY.md",
  "llms.txt", "github.com", "rahula.dev"];
const survives = (term, text) =>
  new RegExp(`(^|[^A-Za-z0-9])${term.replace(/[.\/]/g, "\\$&")}`, "i").test(text);

/* Every translatable unit of a site page, under an identifier that says where
   it belongs. Derived from the English both when writing the sheet and when
   reading it back, so neither end has an opinion about a page's shape. */
function siteUnits() {
  const out = [];
  for (const key of enSite.order) {
    const p = enSite.pages[key];
    out.push({ id: `${key}.slug`, en: p.slug, slug: true },
             { id: `${key}.title`, en: p.title },
             { id: `${key}.description`, en: p.description },
             { id: `${key}.lead`, en: p.lead });
    p.sections.forEach((s, i) => {
      if (s.heading) out.push({ id: `${key}.s${i}.heading`, en: s.heading });
      (s.paragraphs || []).forEach((t, j) => out.push({ id: `${key}.s${i}.p${j}`, en: t }));
    });
  }
  return out;
}

const [cmd, code] = process.argv.slice(2);
const lang = cfg.languages.find((l) => l.code === code);
if (!cmd || (cmd !== "export" && !lang)) {
  console.error("usage: delta-translate.mjs show|apply <code>  |  export");
  process.exit(1);
}

if (cmd === "show") {
  mkdirSync(WORK, { recursive: true });
  const out = { $language: `${lang.name} (${lang.native})`, notFound: {}, sitePages: {} };
  for (const k of NOT_FOUND) out.notFound[k] = english[k];
  for (const u of siteUnits()) out.sitePages[u.id] = u.en;
  writeFileSync(join(WORK, `${code}.json`), JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`  ${join(WORK, `${code}.json`)}`);
  console.log(`  ${NOT_FOUND.length} strings for the 404, ${siteUnits().length} for About and Contact`);
  process.exit(0);
}

if (cmd === "export") {
  /* The review pack for this delta only. The task pages went out in their own
     pack already; sending the whole site again would make a reviewer hunt for
     what changed, which is how the new material gets the least attention. */
  const OUT = join(ROOT, "export-delta");
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const summary = [];
  for (const l of cfg.languages) {
    if (l.code === cfg.defaultLang) continue;
    const sitePath = join(CONTENT, "site", `${l.code}.json`);
    if (!existsSync(sitePath)) continue;
    const site = JSON.parse(readFileSync(sitePath, "utf8"));
    const strings = JSON.parse(readFileSync(join(CONTENT, `${l.code}.json`), "utf8")).strings;

    const rows = [];
    for (const k of NOT_FOUND) {
      rows.push({ id: k, where: "The 404 page", en: english[k],
                  [l.code]: strings[k]?.[l.code] || "" });
    }
    for (const u of siteUnits()) {
      const key = u.id.slice(0, u.id.indexOf("."));
      const rest = u.id.slice(key.length + 1);
      const page = site.pages[key];
      let got = "";
      if (["slug", "title", "description", "lead"].includes(rest)) got = page[rest];
      else {
        const sec = page.sections[Number(rest.match(/^s(\d+)/)[1])];
        got = rest.includes(".heading") ? sec.heading
            : sec.paragraphs[Number(rest.match(/\.p(\d+)/)[1])];
      }
      rows.push({
        id: u.id,
        where: `The ${key} page`,
        note: u.slug ? "The address. Lowercase a-z, 0-9 and single hyphens." : undefined,
        en: u.en, [l.code]: got || "",
      });
    }
    for (const r of rows) if (r.note === undefined) delete r.note;

    writeFileSync(join(OUT, `${l.code}.json`), JSON.stringify({
      language: { code: l.code, name: l.name, native: l.native, direction: l.dir },
      whatThisIs:
        "Everything added to the site after the last review pack: the 404 page and two new pages, " +
        "About and Contact. 51 strings. The landing page and the four guides are not here; they " +
        "went out already and are unchanged.",
      strings: rows,
    }, null, 2) + "\n", "utf8");
    summary.push(`| ${l.code} | ${l.name} | ${l.native} | ${l.dir} | ${rows.length} |`);
  }

  for (const doc of ["GLOSSARY.md", "README.md"]) {
    if (existsSync(join(CONTENT, doc))) cpSync(join(CONTENT, doc), join(OUT, doc));
  }
  cpSync(join(CONTENT, "site", "PROMPT.md"), join(OUT, "PROMPT.md"));
  writeFileSync(join(OUT, "INDEX.md"),
`# Lukotta: the pages added since the last pack

An agent readiness audit scored the site 79 out of 100 and a second report said
why: an agent asked what lukotta.com is for could not answer from the site. Two
of the gaps it named were a 404 that told an agent nothing about where to go
next, and the absence of an About and a Contact page, which is what an agent
looks for when deciding whether software from an unknown name can be
recommended.

This pack is those three pages, in every language. 51 strings each. The landing
page and the four guides are not here: they went out in the previous pack and
have not changed.

| Code | Language | Native | Direction | Strings |
| --- | --- | --- | --- | --- |
${summary.join("\n")}

Read \`PROMPT.md\` first, then \`GLOSSARY.md\`.
`, "utf8");

  console.log(`  export-delta/: ${summary.length} languages`);
  process.exit(0);
}

if (cmd !== "apply") { console.error("unknown command"); process.exit(1); }

const src = join(WORK, `${code}.json`);
if (!existsSync(src)) { console.error(`no ${src}`); process.exit(1); }
const got = JSON.parse(readFileSync(src, "utf8"));

const problems = [];
const note = (m) => problems.push(m);

/* --- the 404 strings join the language's own table ------------------------- */
const langFile = join(CONTENT, `${code}.json`);
const langData = JSON.parse(readFileSync(langFile, "utf8"));
for (const k of NOT_FOUND) {
  const v = (got.notFound?.[k] ?? "").trim();
  if (!v) { note(`${k} is empty`); continue; }
  for (const term of VERBATIM) {
    if (survives(term, english[k]) && !survives(term, v)) note(`${k}: "${term}" went missing`);
  }
  langData.strings[k] = { en: english[k], [code]: v };
}

/* --- About and Contact are rebuilt around the English shape ---------------- */
const site = {
  $comment: enSite.$comment,
  language: { code, name: lang.name, native: lang.native, dir: lang.dir },
  order: [...enSite.order],
  pages: {},
};
const take = (id) => {
  const v = (got.sitePages?.[id] ?? "").trim();
  if (!v) note(`${id} is empty`);
  return v;
};
for (const key of enSite.order) {
  const p = enSite.pages[key];
  const slug = take(`${key}.slug`);
  if (slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
    note(`${key}.slug: "${slug}" is not a usable address`);
  site.pages[key] = {
    slug, title: take(`${key}.title`),
    description: take(`${key}.description`), lead: take(`${key}.lead`),
    sections: p.sections.map((s, i) => {
      const out = {};
      if (s.heading) out.heading = take(`${key}.s${i}.heading`);
      if (s.paragraphs) out.paragraphs = s.paragraphs.map((_, j) => take(`${key}.s${i}.p${j}`));
      return out;
    }),
  };
}
for (const u of siteUnits()) {
  if (u.slug) continue;
  const v = (got.sitePages?.[u.id] ?? "").trim();
  if (!v) continue;
  for (const term of VERBATIM) {
    if (survives(term, u.en) && !survives(term, v)) note(`${u.id}: "${term}" went missing`);
  }
  /* [text](url) is how a paragraph carries a link. Losing the target loses the
     link; losing the brackets turns it into literal punctuation on the page. */
  const enLinks = [...u.en.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((m) => m[2]);
  const gotLinks = [...v.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((m) => m[2]);
  if (enLinks.join() !== gotLinks.join())
    note(`${u.id}: link targets differ (${enLinks.join(" ") || "none"} -> ${gotLinks.join(" ") || "none"})`);
  const d = u.id.endsWith(".description") ? v.length : 0;
  if (d && (d < 70 || d > 160)) note(`${u.id}: ${d} characters, wanted 70 to 160`);
}

if (problems.length) {
  for (const m of problems) console.error(`  ${m}`);
  console.error(`\n  ${problems.length} problem(s); nothing written`);
  process.exit(1);
}

writeFileSync(langFile, JSON.stringify(langData, null, 2) + "\n", "utf8");
writeFileSync(join(CONTENT, "site", `${code}.json`), JSON.stringify(site, null, 2) + "\n", "utf8");
console.log(`  content/${code}.json and content/site/${code}.json written`);
