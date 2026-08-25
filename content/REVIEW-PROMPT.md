# Reviewing the Lukotta website translations

You are reviewing the translations of a website into thirty-six languages. The
site is one page describing Lukotta, a free and open-source macOS application
that opens BitLocker, NTFS, LUKS, Linux and virtual-machine disks which macOS
itself cannot read.

Your review is advice, not a verdict. Every suggestion you make will be weighed
against the English source, against the application's own shipped translations,
and against a second judgement, and some of your suggestions will be rejected.
That is the expected outcome, not a failure. Argue your case; do not assume it.

## What you have

| File | What it holds |
| --- | --- |
| `<code>.json` | One language. Every string with its key, the English, the translation, the purpose of the section it appears in, any note constraining that particular string, and the placeholders it must keep. |
| `GLOSSARY.md` | Words that are not free to translate, and why. |
| `README.md` | How a language file is shaped and the rules a translation is judged by. |
| `TERMINOLOGY-FROM-THE-APP.json` | How the application itself translates its key terms, from its shipped translations. |
| `INDEX.md` | The list of languages. |

Each `<code>.json` is self-contained. Nothing has to be looked up elsewhere.

## What to look for, in order of how much it matters

1. **Meaning that has drifted.** The translation says something the English does
   not, or fails to say something the English does. The English is canonical:
   where the two disagree, the translation is wrong.
2. **Claims that changed strength.** This site makes precise statements about
   what the software does and does not do — what is written, what is only read,
   what is not supported, where a password goes. A translation that softens,
   sharpens or hedges one of these is a factual error, not a stylistic one.
3. **Placeholders.** `{version}`, `{year}`, `{author}`, `{copyleft}`, `{lukko}`
   and `{tta}` must appear exactly as in the English. A missing one puts a
   literal token on the page.
4. **Names that should not have been translated.** BitLocker, NTFS, LUKS, ext4,
   btrfs, XFS, qcow2, VMDK, VDI, VHD, VHDX, macOS, Apple Silicon and the rest
   stay in Latin script in every language. Watch for languages that decline
   foreign nouns: a name bent into a local case is no longer the word anyone
   searches for.
5. **Apple's own words.** Finder, Locations, Keychain and similar name things
   the reader is looking at on their own Mac. They must match what macOS calls
   them in that language — including the cases where Apple keeps the English.
6. **Disagreement with the application.** Check `TERMINOLOGY-FROM-THE-APP.json`.
   The same person reads the website and then the application; they should not
   use different words for the same thing.
7. **Unnatural language.** Phrasing that is correct but that no native speaker
   would write. Say what a native speaker would write instead.
8. **The `meta.*` strings.** These are search results, and they were written for
   search rather than translated. Judge them by whether somebody in this
   language, whose Mac will not open a drive, would type those words. Say so if
   a different phrasing would be searched more. `meta.title` must stay at or
   under 60 characters and `meta.description` between 70 and 165.

## What not to do

- **Do not rewrite what is already correct.** If a translation is accurate and
  natural, leave it alone, even if you would have phrased it differently.
- **Do not raise the register.** The English is deliberately plain and makes no
  marketing claims. A more impressive translation is a worse one.
- **Do not translate the format names** back into the local script to be helpful.
- **Do not silently improve.** Every change is a numbered finding with a reason.

## How to answer

One block per finding. Nothing else — no preamble, no summary of how well the
translations read, no closing remarks.

```
FINDING <n>
language:   <code>
key:        <the key>
severity:   error | wrong-register | unnatural | terminology | seo | question
current:    <the translation as it stands>
proposed:   <your replacement, or — if you are only raising a question>
because:    <why the current text is wrong. Name the rule it breaks, the meaning
             it loses, or the thing a native speaker would object to. If your
             case rests on how a word is used in this language, say how it is
             used. One or two sentences.>
confidence: high | medium | low
```

Rules for findings:

- **`because` decides whether the change is made.** "More natural" or "reads
  better" is not a reason and will be rejected. Say *what* is wrong.
- Use **`severity: question`** when something looks off but you are not sure —
  a term you do not know the settled form of, a claim you cannot check. A
  well-aimed question is more useful than a confident guess.
- Use **`confidence: low`** freely. It costs nothing and it is read.
- If a language has no findings, write `<code>: no findings` on one line.
- If you are unsure whether something is an error or your own preference, say
  so inside `because`. Do not resolve the doubt in your own favour.

Work through the languages one at a time.
