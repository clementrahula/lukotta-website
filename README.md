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

Two faces, and which one a reader gets depends on the machine they are on.

`-apple-system` comes first, so a Mac, iPhone or iPad renders in **SF Pro**: the
real thing, already installed, nothing downloaded and nothing licensed.

Everyone else — Windows, Android, Linux, ChromeOS — gets **Inter**, served from
this origin under the SIL Open Font License. Inter is the closest widely
licensed face to SF Pro in proportion and x-height, so the tracking the
stylesheet sets holds on both. Without it a Linux reader falls to DejaVu Sans,
which is wider and taller-waisted, and every heading comes out of shape.

The cost of that is close to nothing. A browser fetches a web font only when it
needs one to draw something, so a Mac downloads no font at all, and
`unicode-range` splits Inter into seven subsets so a page takes only the script
it is written in. The seven total 224 kB; an English page uses 48 kB of them.
Both paths are verified — on macOS the page declares seven faces and loads zero.

Inter carries Latin, Greek, Cyrillic and Vietnamese, which is thirty of the
thirty-seven languages. Arabic, Hebrew, Devanagari, Thai, Chinese, Japanese and
Korean it does not, and no web font carries all of those at a size worth
sending — Noto CJK alone runs to several megabytes per language. Those seven
fall through to named system faces (Segoe UI, Nirmala UI, Leelawadee UI,
Microsoft YaHei, Yu Gothic, Malgun Gothic, Noto Sans), every one of which ships
with the operating system it belongs to.

## Deploying

[DEPLOYMENT.md](DEPLOYMENT.md).

## Keeping it true

The page repeats claims the application's own documentation makes. When the
application changes what it supports, what it requires, or what it collects,
`content/en.json` changes in the same breath as `README.md`, `SPECS.md` and
`PRIVACY.md` in the application's repository — and then every translation is due
again.
