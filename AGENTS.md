# Working on the Lukotta website

## Layout

One page, built into `public/` for every language in `site.config.json`. No
framework and nothing to install: the build is Node and the standard library.
`public/` is generated and is not committed.

```
site.config.json     domain, version, download address, brew command, languages
content/             everything the page says, one file per language
content/GLOSSARY.md  terms that are not free to translate
src/page.mjs         the markup, including the whole of the <head>
src/styles.css       the visual system, light and dark
src/script.js        appearance, language menu, platform notice, copy button
scripts/build.mjs    builds public/
scripts/check.mjs    checks what was built
```

## Commands

```bash
npm start                              # build and serve at localhost:4321
npm run check                          # build, then check
node scripts/new-language.mjs --all    # after any change to content/en.json
node scripts/lint-translations.mjs     # placeholders, names, staleness, lengths
node scripts/export-translations.mjs   # a bundle for an outside reviewer
```

Run `new-language.mjs --all` after every change to the English. It appends new
keys to all thirty-six languages, drops removed ones, and leaves existing
translations and `localOnly` blocks alone. Nothing else keeps them in step.

## What the build refuses

`check.mjs` fails on a wrong canonical, an incomplete `hreflang` cluster, a
duplicate title between two translated pages, a local reference that is not in
`public/`, an `<img>` without alt text, a page without exactly one `<h1>`,
JSON-LD that does not parse, a `lang` or `dir` that disagrees with the
configuration, a sitemap that does not match the pages, a contrast ratio below
4.5:1 for text or 3:1 for indicators in either theme, the two dark declarations
drifting apart, more or fewer than one fingerprinted stylesheet and script, and
an `llms.txt` that no longer states what the pages state.

`--strict` also refuses while any language carries English text, and when a
configured language built no page. Both `build.mjs --strict` and
`check.mjs --strict` run in the deploy workflow.

## Translations

**The English beside a translation is not a copy of the current English.** It is
the sentence that was translated, kept as written. Change `content/en.json` and
every language still holding the old sentence is reported: the build warns,
`--strict` refuses, and `lint-translations.mjs` prints the old and the new under
each other. Clear it by editing the pair as a unit, translation and `en`
together. Never bring `en` forward on its own.

A language file may carry a `localOnly` block. Those strings replace the
translation of the key they name, on that language's page alone. Finnish uses
one, in the name section. The translator consults `localOnly` before `strings`.

Product and format names stay in Latin script in every language: BitLocker,
NTFS, LUKS, ext4, qcow2, VMDK, macOS, Apple Silicon and the rest.
`content/GLOSSARY.md` is the list. A local case ending is acceptable where the
letters of the name survive it, which is how the corpus already reads
(`Finderu`, `Macilla`, `BitLockeria`). Finder is not on the list: Apple
translates it in some languages, and Chinese macOS calls it 访达.

Where the application's own translations disagree with the site, they win.
`export-translations.mjs` pulls a terminology reference out of them.

## Assets

Two screenshots per language at
`src/assets/screenshots/<code>/{light,dark}.webp`, the pair the same size as
each other. Lossless WebP from 1160x1264 captures, `cwebp -lossless`, shown at
720px. The build reads their dimensions from the WebP header and writes them
onto the `<img>`. A language without its own pair falls back to English, and the
build reports which. Both appearances are in the page at once and cross-fade, so
a page carries about 150 kB of screenshot.

The macOS window frame is drawn by `.shot` and `.shot-bar` at the measurements
macOS uses: a 28pt title bar, 12pt buttons 8pt apart, 20pt in from the leading
edge, a 10pt corner. It stays when the layout changes.

Only `assets/brand/lukotta-mark-{light,dark}.png` ship. The rest of
`src/assets/brand/` are the originals the favicons and the shared-card image in
`src/assets/icons/` were generated from with `sips`. Keep them, do not publish
them.

## Styles

`--ink-3`, `--amber-ink`, `--control-edge` and the focus ring were set by
measurement. Changing any of them means re-checking the ratios, which
`check.mjs` does.

The dark appearance is declared twice, once under
`@media (prefers-color-scheme: dark)` for a reader whose JavaScript never ran
and once under `[data-theme="dark"]` for a reader who chose. Everything that
differs between appearances goes through a token so the rule is written once.
`check.mjs` compares the two declarations.

## Scripts on the page

The two inline scripts carry `data-cfasync="false"`. Cloudflare's Rocket Loader
is on, and without that attribute it rewrites their type and runs them through
its own loader: the first has to resolve the appearance before the first paint,
and the second has to be in place before `script.js` reads it.

`build.mjs` hashes every inline script and writes the hashes into the content
policy in the `<head>`. Adding or editing an inline script changes its hash
automatically. An inline style attribute would need the policy widened, so there
are none.

## Commits

No `Co-Authored-By` trailer. `.githooks/commit-msg` strips it.
`core.hooksPath` is local configuration, so a fresh clone enables it once:

```bash
git config core.hooksPath .githooks
```

`main` is protected against force pushes and deletion. Direct pushes are
allowed.

## Deployment

A push to `main` builds and publishes to GitHub Pages. The workflow runs
`build.mjs --strict`, `lint-translations.mjs` and `check.mjs --strict` before
publishing, so a failure of any of them stops the deploy.

Cloudflare proxies the domain, SSL/TLS mode Full. HTML is not cached at the
edge; the stylesheet and script carry a digest of their contents, so a change
gives them a new name and no cache can serve the old one. Replacing an image
under its own name is the one case that needs a manual purge.

`CF_ZONE_ID` and `CF_API_TOKEN` are optional repository secrets. When set, the
deploy purges the Cloudflare cache; when not, it says so and the deploy still
counts as done.

To roll back, re-run an earlier successful Deploy from the Actions tab. The site
is rebuilt from that commit and there is no state to restore.

## Licences

The code, meaning `scripts/`, `src/`, the workflows and `site.config.json`, is
GPL-3.0-or-later. See [LICENSE.txt](LICENSE.txt).

The words, meaning everything in `content/`, are CC BY-SA 4.0. See
[LICENSE-CONTENT.txt](LICENSE-CONTENT.txt).

The name Lukotta, the logo, the mark and the icons generated from them are
trademarks and are under neither.

The two typefaces are under the SIL Open Font License. See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
