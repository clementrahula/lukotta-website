# The website's translations

This folder is everything the website says, in every language it says it in.
It is self-contained on purpose: zip this folder and it can be reviewed with no
access to the repository, the website or the application.

## What is here

| File | What it holds |
| --- | --- |
| `en.json` | The canonical English. Every other file is a translation of it. |
| `<code>.json` | One language. Each string carries the English beside it. |
| `KEYS.json` | What every key is: where it appears, what it is for, and anything that constrains it. |
| `GLOSSARY.md` | Words that are not free to translate, and why. |

## How a language file is shaped

English holds plain strings, because there is nothing to compare it against:

```json
{
  "language": { "code": "en", "name": "English", "native": "English", "dir": "ltr" },
  "strings": {
    "hero.title": "Open BitLocker, Linux and virtual machine disks on macOS."
  }
}
```

Every other language pairs each string with the English it came from, so one
file is enough to judge one language:

```json
{
  "language": { "code": "de", "name": "German", "native": "Deutsch", "dir": "ltr" },
  "strings": {
    "hero.title": {
      "en": "Open BitLocker, Linux and virtual machine disks on macOS.",
      "de": "BitLocker-, Linux- und Virtuelle-Maschinen-Laufwerke unter macOS öffnen."
    }
  }
}
```

The key is the same in every file. A key that is missing, or whose value is an
empty string, falls back to the English when the site is built — and the build
says so rather than passing quietly.

## A string in one language only

Beside `strings`, a language file may carry a `localOnly` block. These are
strings that exist in that language and nowhere else — an aside that only lands
for somebody reading in that language. They have no English original, so there
is nothing to judge them against for meaning; judge them as writing. They never
appear on another language's page, they do not count towards the number of
strings translated, and running `new-language.mjs` again leaves them untouched.

Finnish carries one, in the section about the name.

## The rules a translation is judged by

1. **English is canonical.** Where a translation and the English disagree about
   meaning, the English is right. It has been read line by line; assume every
   word in it is deliberate.
2. **Placeholders survive.** `{version}`, `{year}` and `{author}` must all be
   present and spelled the same.
3. **Apple's words for Apple's things.** Finder, System Settings, Full Disk
   Access and the rest belong to macOS, and the reader is looking at their own
   Mac. See `GLOSSARY.md`.
4. **Format names are never translated**, in any script. See `GLOSSARY.md`.
5. **The tone is plain.** The English makes no promises it cannot keep, uses no
   marketing superlatives, and says what the application does and does not do.
   A translation that sells harder than the English is wrong.
6. **The `meta.*` strings are written for search, not translated.** They are
   how somebody in this language finds the site at all. Write what a person
   would actually type into a search engine when their Mac will not open a
   drive — which is rarely a word-for-word rendering of the English. Keep
   BitLocker, NTFS, LUKS, macOS and Mac in Latin script, because that is how
   they are searched for in every language. `meta.title` must stay at or under
   60 characters and `meta.description` between 70 and 165, since search
   results cut them off; say less rather than run over.
7. **Arabic and Hebrew read right to left.** `language.dir` is `"rtl"` for those
   two. The page turns round on its own; nothing in the text needs to change for
   it.

## Reporting a problem

Say which key, what is wrong, and what it should be. A key is enough to find it —
nothing in this folder needs line numbers.
