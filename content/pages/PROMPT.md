# Reviewing the Lukotta website translations

You are reviewing the translations of a website into thirty-six languages.

The site describes Lukotta, a free and open-source macOS application that opens
BitLocker, NTFS, LUKS, Linux and virtual-machine disks which macOS itself
cannot read. It is one landing page plus four pages about one task each.

Your review is advice, not a verdict. Every suggestion will be weighed against
the English source, against the application's own shipped translations, and
against a second judgement, and some will be rejected. That is the expected
outcome, not a failure. Argue your case; do not assume it.

## What you have

| File | What it holds |
| --- | --- |
| `<code>.json` | One language, complete on its own. See below. |
| `GLOSSARY.md` | Words that are not free to translate, and why. |
| `WHAT-TURNED-UP.md` | Known disagreements inside the existing translations. Read this early. |
| `TERMINOLOGY-FROM-THE-APP.json` | How the application itself translates the key terms. |
| `README.md` | How a language file is shaped. |
| `INDEX.md` | The list of languages. |

Each `<code>.json` holds two things:

- **`strings`** — the landing page. 100 strings, each with its key, the English,
  the translation, the purpose of its section, any note constraining it, and the
  placeholders it must keep. **This has been reviewed once before.**
- **`taskPages.units`** — the four task pages. 115 units, each with an
  identifier, what that unit is, the English, and the translation. **This is
  new and has never been reviewed.** Weight your effort accordingly.

## The four task pages

One page each on: opening a BitLocker drive (`bitlocker`), reading a Linux
drive (`linux`), writing to an NTFS drive (`ntfs`), and opening a virtual
machine's disk file (`disk-images`). Identifiers say which page and where in
it, so `bitlocker.s2.p0` is enough to locate a finding.

Somebody arrives at one of these from a search, having just plugged in a drive
that their Mac offered to erase. Each page answers in the same order: what the
thing is, what the Mac does with it, why it does that, what Lukotta does about
it, then the particulars. That order is the reason the pages work. A
translation that keeps every sentence but rearranges them has broken the page.

## What to look for, in order of how much it matters

1. **Meaning that has drifted.** The translation says something the English
   does not, or fails to say something it does. The English is canonical.
2. **Claims that changed strength.** These pages make precise statements about
   what the software does and does not do: what is written, what is only read,
   what is unsupported, where a password goes. A translation that softens,
   sharpens or hedges one of these is a factual error, not a stylistic one.
3. **Names that should not have been translated.** BitLocker, NTFS, LUKS, ext4,
   btrfs, XFS, exFAT, APFS, FileVault, qcow2, VMDK, VDI, VHD, VHDX, OVA, TPM,
   VMware, VirtualBox, Hyper-V, QEMU, UTM, macOS, Windows, Linux, Apple. These
   stay in Latin script in every language. Watch for languages that decline
   foreign nouns: a name bent into a local case is no longer the word anyone
   searches for. Polish is the sharp case — the pages put the name in
   apposition (`z systemem Linux`, not `z Linuksem`) to avoid respelling it.
   Say if that reads stiff.
4. **Names of things on the reader's own screen.** Finder, File, Get Info,
   Format, Locations, Shut down. These must read as that language's macOS and
   Windows write them, because the reader is looking at their own machine.
   **In the seven languages macOS is not offered in — Estonian, Latvian,
   Lithuanian, Albanian, Slovenian, Bulgarian, Filipino — they stay in
   English**, because that is what the reader's Mac actually shows. In those
   languages one sentence legitimately mixes the two: an English **File** menu
   holding a menu item in the reader's language, because Lukotta itself is
   translated.
5. **Disagreement with the landing page, or with the application.** The same
   person reads all three, often on the same afternoon. Where a task page calls
   a drive one thing and the landing page another, that is a finding even when
   both words are correct — say which should win. Check
   `TERMINOLOGY-FROM-THE-APP.json`.
6. **Prose that no native speaker would write.** The landing page is labels and
   short claims; the task pages are paragraphs read start to finish. A sentence
   that is accurate and graceless is a finding here in a way it is not there.
7. **The reader is assumed to know very little.** The English deliberately
   explains what a filesystem is, what BitLocker is, what a recovery key looks
   like. Do not assume more of the reader than it does, and do not assume less:
   a translation that tightens those explanations because they seem obvious has
   lost the audience the page was written for.
8. **The search strings.** `meta.*` on the landing page, and `.title` and
   `.description` on each task page, are written for search rather than
   translated. Judge them by whether somebody in this language, whose Mac will
   not open a drive, would type those words. A title should stay at or under
   about 55 characters and a description between 70 and 160, since search
   results cut them off.

## Two things that are settled

**Read `WHAT-TURNED-UP.md` before you start.** It lists twenty-six
disagreements already found inside the existing translations, and says which
way the task pages went in each. You do not need to report those again — only
say so if you think the choice was wrong.

**Addresses.** Each task page carries its own `.slug`. It is lowercase a-z, 0-9
and single hyphens in every language, including those that do not use the Latin
alphabet. That is not a preference: the slug becomes a directory name on the
build machine as well as a sitemap line and a URL submitted to IndexNow, and
macOS normalises directory names differently from the way those files carry
them. Judge a slug by whether it is what somebody in this language would type
into a search box, and say so if it is not.

**The sample.** The 48-digit recovery key and the indented paragraph holding it
must survive unchanged. It is a thing the reader holds beside the screen and
compares digit by digit.

Arabic and Hebrew are written right to left; the page turns round on its own
and nothing in the text needs to change for it. Hebrew carries right-to-left
marks and non-breaking hyphens around Latin names — leave those in place.

## What not to do

- **Do not rewrite what is already correct.** If a translation is accurate and
  natural, leave it alone, even if you would have phrased it differently.
- **Do not raise the register.** The English is deliberately plain and makes no
  marketing claims. A more impressive translation is a worse one.
- **Do not translate the format names** back into the local script to be
  helpful.
- **Do not silently improve.** Every change is a numbered finding with a reason.

## How to answer

One block per finding. Nothing else — no preamble, no summary of how well the
translations read, no closing remarks.

```
FINDING <n>
language:   <code>
where:      landing | task-pages
key:        <the key, or the task-page identifier>
severity:   error | wrong-register | unnatural | terminology | seo | question
current:    <the translation as it stands>
proposed:   <your replacement, or — if you are only raising a question>
because:    <why the current text is wrong. Name the rule it breaks, the
             meaning it loses, or the thing a native speaker would object to.
             If your case rests on how a word is used in this language, say how
             it is used. One or two sentences.>
confidence: high | medium | low
```

Rules for findings:

- **`because` decides whether the change is made.** "More natural" or "reads
  better" is not a reason and will be rejected. Say *what* is wrong.
- Use **`severity: question`** when something looks off but you are not sure — a
  term you do not know the settled form of, a claim you cannot check. A
  well-aimed question is more useful than a confident guess.
- Use **`confidence: low`** freely. It costs nothing and it is read.
- If you are unsure whether something is an error or your own preference, say so
  inside `because`. Do not resolve the doubt in your own favour.
- If a language has no findings at all, write `<code>: no findings` on one line.
  If only one half is clean, write `<code> landing: no findings` or
  `<code> pages: no findings`.

## Do this in as many runs as it takes

Thirty-six languages at 215 units each is far more than fits in one run, and a
model that sets out to do it all at once tends to go quiet somewhere in the
middle and produce nothing usable at all.

So work in runs:

- **One language per run** is the right size. Finish it properly.
- **Write the file at the end of every run**, before you run out of room. Name
  them `findings-<code>.md`. A run that ends without writing its file is a run
  that never happened.
- **End every file with `## Where this run stopped`**, naming what is done and
  what is not, so the next run knows where to begin.

Partial work written down beats complete work that never arrives.
