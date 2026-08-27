# Drafts

Written, reviewed, and not yet part of the site. Nothing here is built,
published or linked. `scripts/build.mjs` does not read this directory.

## task-pages.en.json

Four pages, English only, aimed at the searches the landing page cannot answer
on its own: opening a BitLocker drive, reading a Linux drive, writing to NTFS,
and opening a virtual machine disk.

The landing page is one document trying to be about all four subjects at once,
which is why it competes badly for any of them. A page that is about one thing,
in the words somebody would actually type, competes for that thing.

Each page is written in the same order, so a reader who knows nothing can start
at the top: what the thing is, what happens when you plug it into a Mac, why
macOS behaves that way, what Lukotta does about it, then the particulars, then
the download.

The file also carries the two sets of links back:

- `linkFromFormatsTable` maps a format's name in the table on the landing page
  to the page it should link to. `exFAT, FAT` and `IMG, DMG` are deliberately
  absent: macOS opens those itself, so there is nothing to send anybody to.
- `linkFromFaq` maps each page to the line that would follow the FAQ answer
  already asking that question.

## What shipping this needs

Not done, and deliberately so. It touches the renderer that produces the 37
published pages, which is not something to change in passing.

1. **A second template.** `renderPage` in `src/page.mjs` is one 450-line
   function that assumes one page per language. The header, the footer and the
   `__CSP__` placeholder have to come out of it before a second kind of page
   can reuse them.
2. **A nested loop in the build.** `scripts/build.mjs` walks languages and
   writes `<lang>/index.html`. Task pages need `<lang>/<slug>/index.html`, and
   only for languages that have a translated file, so a language without one
   is simply absent rather than half English.
3. **Sitemap and hreflang.** Both are currently computed once per language.
   They become per language *and* per page, and the alternates for a task page
   must name only the languages that have that page.
4. **The links, conditionally.** A link may only appear on a language's landing
   page if that language has the page it points at.
5. **Styling in `src/styles.css`, not inline.** The policy this build emits is
   `style-src 'self'`, so an inline `<style>` is dropped without a word. Two
   rules are needed: an underline for the links, matching `.plain`, and

       .format-link:hover code { color: var(--amber-ink); }

   which exists because `tbody tr:not(.group) th code` pins the colour at a
   specificity the obvious rule loses to.
6. **`scripts/check.mjs`.** It asserts one page per built language. It has to
   learn about these or it will fail on them.

## Translation

English first, on purpose. Four pages come to roughly 140 strings a language,
or about 5,000 across the 36 translations, which is three times the Sparkle job
and prose rather than labels. If these are ever translated, they go through the
audit in `scripts/notes-audit.py` in the application's repository, the same way
release notes do.
