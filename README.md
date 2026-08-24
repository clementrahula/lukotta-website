# Lukotta website

The public website for [Lukotta](https://github.com/clementrahula/lukotta), at
[lukotta.com](https://lukotta.com). One page, in thirty-seven languages.

## What is here

```text
site.config.json        The domain, the version, and every language the site is built in
content/                Everything the page says, one file per language
  en.json               The canonical English. Every other file is a translation of it
  KEYS.json             What each key is for
  GLOSSARY.md           Words that are not free to translate
src/
  page.mjs              The markup, including the whole of the <head>
  styles.css            The visual system, light and dark
  script.js             Appearance, the screenshot swap, and the language menu
  assets/
    brand/              The logo and mark, from the application's repository
    fonts/              Inter, subset, for readers not on an Apple platform
    icons/              Favicons, touch icon and the shared-card image
    screenshots/        One light and one dark image per language
scripts/
  build.mjs             Builds public/ from the above
  check.mjs             Checks what was built
  new-language.mjs      Scaffolds a language file
  serve.mjs             Local preview
public/                 Generated. Not committed, not edited by hand
```

## Working on it

```bash
npm start
```

That builds the site and serves it at <http://localhost:4321>. There are no
dependencies to install — everything runs on Node alone.

```bash
npm run build     # write public/
npm run check     # build, then check the result
```

`check` is what decides whether a change is publishable. It fails on a missing
canonical, an incomplete `hreflang` set, a duplicate title, a broken local link,
an image with no alt text, JSON-LD that does not parse, or a page whose `lang`
and `dir` do not match what the configuration says.

## Adding a language

Add it to `languages` in `site.config.json`, then:

```bash
node scripts/new-language.mjs <code>
```

That writes `content/<code>.json` with every key, the English beside each one and
an empty slot to fill. A key left empty falls back to the English, and the build
says which ones did.

## Screenshots

Two per language: `src/assets/screenshots/<code>/light.png` and `dark.png`.
The pair must be the same size as each other, or the page shifts when the reader
changes appearance; the build says so if they are not.

Images are used exactly as given. The build reads each one's real dimensions,
writes them onto the `<img>` so the page does not shift while it loads, and caps
the frame at the image's own width — so a screenshot is never stretched past its
pixels. The frame stops growing at 940 px, which is the widest the layout wants.
Capture at twice the size you want it shown for a sharp result on a retina
display.

A language with no folder of its own falls back to
`src/assets/screenshots/_placeholder/`, and the build lists every language that
did. The placeholder in the repository now is a test render of the *unbranded*
build, which says **Drive Unlocker** rather than **Lukotta** — it is there to
prove the mechanism, and every language needs a real pair before the site is
published.

## Appearance

Two appearances, light and dark. Until the reader picks one the page follows
whatever their machine is set to, and keeps following it if they change it;
picking one stores the choice and stops the page following along. It is resolved
in the `<head>` before the first paint, so the page never flashes the wrong one.

The screenshot follows. Its `<picture>` carries a dark `<source>` with a
`prefers-color-scheme` query, so the correct image loads with no JavaScript at
all; choosing light or dark by hand rewrites that query rather than the `src`,
which swaps the image without downloading the other one.

Colours come from the brand assets: the light lockup sits on a warm off-white
(`#FBF9F5`), the dark one on a cool near-black (`#16181E`), and the mark itself
is slate (`#474B55`).

## Type

Three families, each doing one job.

**IBM Plex Sans** sets the headings. It is an engineering typeface, which is
what this page is trying to be, and it covers Latin, Greek, Cyrillic and
Vietnamese — thirty of the thirty-seven languages. The other seven fall to their
own system face at the same size and weight.

**IBM Plex Mono** sets format names, section numbers and the specification line.
Every one of those is ASCII, so it needs the Latin subset alone.

**SF Pro** sets running text, through `-apple-system`, so a Mac uses the face it
already has. **Inter** stands behind it for readers on Windows, Android, Linux
and ChromeOS, where the alternative is DejaVu Sans and headings come out of
shape.

A browser fetches a web font only when it needs one to draw with, and
`unicode-range` splits every face by script, so a page takes only what it is
written in. Plex and Inter are both under the SIL Open Font License; see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and `src/assets/fonts/`.

## Colour

Taken from the application and the brand, not from a palette.

| | | |
| --- | --- | --- |
| paper | `#FBF8F2` | the warm ground the light logo lockup sits on |
| ink | `#1F2127` | the near-black of the dark lockup |
| amber | `#FF8D28` | the exact orange the app draws drive icons and Locked badges in |

Amber is too bright to carry text on paper, so it fills and marks, and a
darkened `#9A4E05` does the talking wherever a link has to be read. On a button
it is the other way round: amber fills and the dark ink reads on top of it.

## The page

One page, five parts, in this order:

1. **Hero** — the claim, the download, the screenshot.
2. **01 What it does** — in prose, then seven short extras.
3. **02 What it supports** — one table: encryption, filesystems and disk images,
   each with a Read and a Write column. This is the centrepiece, and it links to
   `SPECS.md` for the full detail.
4. **03 How it works** — the Linux virtual machine, three steps, and the
   permissions it asks for.
5. **Download** — the call to action and the requirements.

There are no cards, no shadows and no gradients; a hairline is what separates
one thing from another. Everything is set from the left.

## Deploying

[DEPLOYMENT.md](DEPLOYMENT.md).

## Keeping it true

The page repeats claims the application's own documentation makes. When the
application changes what it supports, what it requires, or what it collects,
`content/en.json` changes in the same breath as `README.md`, `SPECS.md` and
`PRIVACY.md` in the application's repository — and then every translation is due
again.
