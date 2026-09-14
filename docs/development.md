# Development

## Layout

One page per language in `site.config.json` (37), built into `public/`. `public/` is generated and not committed. No framework and no dependencies: Node 20 or later (CI uses 22) and its standard library.

```
site.config.json     domain, version, download address, brew command, languages
content/             everything the page says, one file per language
content/GLOSSARY.md  terms that are not free to translate
content/slugs.json   every published address, so none moves unnoticed
src/page.mjs         the markup, including the whole of the <head>
src/styles.css       the visual system, light and dark
src/script.js        appearance, language menu, platform notice, copy button
scripts/build.mjs    builds public/
scripts/check.mjs    checks what was built
worker/              the markdown negotiator, a separate Cloudflare deployment
```

## Commands

```bash
npm start                              # build and serve at localhost:4321
npm run check                          # build, then check
npm run slugs                          # rewrite content/slugs.json after a deliberate address change
node scripts/new-language.mjs --all    # after any change to content/en.json
node scripts/lint-translations.mjs     # placeholders, names, staleness, lengths
node scripts/export-translations.mjs   # a bundle for an outside reviewer
node worker/negotiation.test.mjs       # the worker's pure decisions
```

- `scripts/build.mjs` writes `public/`; `npm run check` runs it first.
- `scripts/indexnow.mjs` (`npm run indexnow`) submits to Bing, Yandex, Seznam and Naver. The Deploy workflow runs it.
- Build errors surface in the build output; page errors in the browser console.
- The page is checked at phone width and desktop width.

## Gate

| where | runs |
| --- | --- |
| `npm run check` | `build.mjs`, `check.mjs`, `check-slugs.mjs`, all bare |
| `check.yml`, every push and pull request | `build.mjs --strict`, `lint-translations.mjs`, `check.mjs --strict`, `check-slugs.mjs`, `worker/negotiation.test.mjs` |
| `deploy.yml`, every push to `main` | `build.mjs --strict`, `lint-translations.mjs`, `check.mjs --strict`, `check-slugs.mjs`; then `build.mjs` and `indexnow.mjs` |

- `check-slugs.mjs` reads only `--write`; it has no `--strict`.
- `npm run check` misses both `--strict` forms, the translations lint and the worker test. A push to `main` publishes, so those run locally before it.
- A change under `worker/` is invisible to the build; only `check.yml` runs its test.
- No release notes: the site is deployed, not released.

## What the build refuses

`check.mjs` fails on:

- a wrong canonical
- an incomplete `hreflang` cluster
- a duplicate title between two translated pages
- a local reference not in `public/`
- an `<img>` without alt text
- a page without exactly one `<h1>`
- JSON-LD that does not parse
- a `lang` or `dir` that disagrees with the configuration
- a sitemap that does not match the pages
- contrast below 4.5:1 for text or 3:1 for indicators, in either theme
- the two dark declarations drifting apart
- more or fewer than one fingerprinted stylesheet and one fingerprinted script
- an `llms.txt` that no longer states what the pages state

`--strict` also refuses:

- any language carrying English text
- a configured language that built no page
- missing content files, English screenshot fallbacks, mismatched screenshot pairs, unused keys (`build.mjs`)

## Published addresses

- `check-slugs.mjs` refuses a published address that moved.
- Every slug is a URL. GitHub Pages cannot redirect, so a moved address 404s for everyone who had it.
- `pages-translate.mjs apply` rewrites a language's file wholesale; a second pass over one language can retire indexed addresses without anyone typing a URL.
- `content/slugs.json` is the lockfile of all 222 addresses. Moving one means `npm run slugs` in the same commit, where the diff shows which moved.

## Commits

- No `Co-Authored-By` trailer; `.githooks/commit-msg` strips it.
- `core.hooksPath` is local configuration. A fresh clone runs once: `git config core.hooksPath .githooks`
- `main` is protected against force pushes and deletion. Direct pushes are allowed.
- Pull requests are on GitHub.
