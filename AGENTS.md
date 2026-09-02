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
content/slugs.json   every published address, so none moves unnoticed
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

`check-slugs.mjs` refuses a published address that moved. Every slug becomes a
URL, GitHub Pages cannot redirect, and `pages-translate.mjs apply` rewrites a
language's file wholesale — so a second pass over one language could retire
four indexed addresses without anybody typing a URL. `content/slugs.json` is a
lockfile of all 222 addresses; moving one means regenerating it in the same
commit, where the diff says which moved.

```bash
npm run slugs        # after a deliberate address change
```

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

## About and Contact

The two pages in `content/site/` are rendered by the guide machinery, but they
are not guides and must not read like them. Neither carries a `lead`, and both
keep their headings down to what a reader would actually look for: About is
*Why it exists* and *Who created and maintains it*, Contact is *Bugs, suggestions and
translations* and *Security problems*, with the response-time caveat above
both. What they had before was a one-paragraph subsection per idea, which read
as a brochure rather than as one person writing.

So `lead` is optional wherever a page is rendered or translated -- `page.mjs`,
`taskMarkdown` in `build.mjs`, `delta-translate.mjs` and
`export-translations.mjs` all skip it when it is absent. The four guides still
have one. A page with no `lead` is a valid shape, not a page that lost
something.

The About page credits `anylinuxfs`, which Lukotta is built on. It is in
`verbatim.mjs` and in `GLOSSARY.md`, lowercase, and a translation that respells
it is a finding.

## The early-development notice

`how.warning.*` closes the How It Works section on the landing page, in the
same `.aside` box the formats section ends with. It sat above the formats table
first, and read there as a caveat about the formats rather than about the
application, which is the opposite of what it is for. It also goes into
`llms.txt` and every `index.md`, under How it works in both.

## Assets

Two screenshots per language at
`src/assets/screenshots/<code>/{light,dark}.webp`, the pair the same size as
each other. Lossless WebP from 1160x1264 captures, `cwebp -lossless`, shown at
720px. The build reads their dimensions from the WebP header and writes them
onto the `<img>`. A language without its own pair falls back to English, and the
build reports which. Both appearances are in the page at once and cross-fade, so
a page carries about 150 kB of screenshot.

Both appearances are `<img>` elements in the page at once, and which one is
visible is not known until `prefers-color-scheme` is evaluated in the reader's
browser. So neither carries `fetchpriority`. Both used to, which told the
browser that two images were each the most important one on the page when only
ever one of them is drawn, and it put 75 kB of invisible screenshot ahead of
the stylesheet and the font in the queue. Setting the attribute on one of them
instead only inverts the problem for whoever reads in the other appearance.

The priority is expressed in the `<head>` instead, as two `rel="preload"` links
carrying the same media query the appearance does. The browser fetches only the
one it is going to paint, and the other arrives in its own time and still
cross-fades. Removing the preloads does not break the page; it puts the largest
paint back behind the preload scanner.

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

The two inline scripts carry `data-cfasync="false"`. Rocket Loader is off, so
nothing reads that attribute today. It stays because Rocket Loader is a toggle
in a dashboard: the day somebody turns it back on is the day the first script
stops resolving the appearance before the first paint, and the second stops
being in place before `script.js` reads it.

`build.mjs` hashes every inline script and writes the hashes into the content
policy in the `<head>`. Adding or editing an inline script changes its hash
automatically. An inline style attribute would need the policy widened, so there
are none.

Cloudflare injects one inline script of its own, `__CF$cv$params`, and the
policy blocks it. Its values are generated per request, so no hash can ever
cover it, and the console records a violation on every page load. It is left
that way on purpose: the script is bot telemetry, nothing on the page depends
on it, and both ways of silencing the error are worse than the error. Widening
the policy with `unsafe-inline` gives up what the policy is for, and stripping
the tag means running the HTML through a rewriter in the worker, on every page,
to delete something that is already inert. Turning Rocket Loader off did not
remove it; it is injected independently of anything the zone settings control.

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
`build.mjs --strict`, `lint-translations.mjs`, `check.mjs --strict` and
`check-slugs.mjs` before publishing, so a failure of any of them stops the
deploy.

Cloudflare proxies the domain, SSL/TLS mode Full. HTML is not cached at the
edge; the stylesheet and script carry a digest of their contents, so a change
gives them a new name and no cache can serve the old one. Replacing an image
under its own name is the one case that needs a manual purge.

Two cache rules hold the static files. Both take a year at the edge, which is
safe because the deploy purges everything on every push. They differ in what
they tell a browser, and the difference is the whole point: the digest pair get
a year, because a change to either gives it a new name, and `/assets/` gets a
day, because a browser cache cannot be purged and the screenshots are replaced
under their own names. `www` redirects to the apex in a redirect rule rather
than at the origin — redirect rules run before workers, so it costs neither a
worker invocation nor a round trip to GitHub.

### The zone settings that are set the way they are

Cloudflare's defaults assume a site with something to defend. This one is
static, public, and served by GitHub Pages, and the settings say so.

| setting | value | why |
| --- | --- | --- |
| Hotlink Protection | off | on, it answered `/assets/og.png` and `/favicon.ico` with 403 to any request carrying another site's `Referer`. It blocked the sharing this site wants. The mark is a trademark, not a 403. |
| Browser Integrity Check | off | it can challenge an agent on a datacenter address. Nothing here is worth turning a reader away for. |
| Security Level | essentially off | the same reason. |
| Rocket Loader | off | one extra request to defer one already-deferred script. |
| Email Obfuscation | off | no `mailto:` in the markup. |
| Server-Side Excludes | off | no `<!--sse-->` in the markup. |
| Minimum TLS | 1.2 | 1.0 and 1.1 are dead. |
| HSTS | on, six months | `includeSubdomains` is deliberately off: `autoconfig.lukotta.com` is fetched by mail clients, not browsers, and there is no reason to make that a one-way door. Raise the age before adding them. |

Nothing in Bot Management blocks AI crawlers, and none of it should: every one
of `ai_bots_protection`, `crawler_protection`, `ai_training`, `ai_search` and
`ai_user` is disabled, Bot Fight Mode is off, and the managed `robots.txt` is
off so Cloudflare does not write a content-signal policy over the top of
`public/robots.txt`. Turning any of them on retires the markdown negotiator,
`llms.txt` and the task pages in one click, silently. Check them before
concluding an agent cannot read the site.

### The markdown negotiator

`worker/` is a Cloudflare Worker that serves a page's markdown twin to a caller
that asked for `text/markdown`, and passes everything else through. It is
routed at `lukotta.com/*` and `www.lukotta.com/*`, so it sees every request the
zone serves, and the deploy sets three things about those routes that wrangler
cannot express and nobody should have to remember:

- **The routes fail open.** Cloudflare creates them fail *closed*, which means
  that once the account's daily invocation allowance runs out every request
  gets an error page until midnight UTC. Failing open bypasses the worker and
  lets the origin serve: an agent gets HTML instead of markdown and a 404 under
  `/de/` comes back in English, and that is all. Nothing the worker does is a
  security check, so there is no reading where an error page is better.
- **The assets are not routed through it.** Every request is an invocation,
  cached or not, and a page view pulls about fourteen files. Routes with no
  worker on them — `/assets/*`, and the two fingerprinted root files by exact
  name — take thirteen of those off it. The digests change, so the workflow
  reads the names out of `public/` and removes routes left by an older one.
  `robots.txt`, `sitemap.xml`, `llms.txt`, `favicon.ico` and `site.webmanifest`
  come off it too, named in the workflow because their names never change. A
  crawler asks for those before it asks for a page, and for the first two far
  more often than for any page. None of them is a page or a twin, so none of
  them needs what the worker does.
- **It verifies both by reading the routes back**, and fails the job if a route
  is still closed.

`worker/negotiation.test.mjs` covers the pure decisions — what the caller
asked for, which file is the twin, whether a path is a twin at its own address,
and which address a twin calls canonical.

### Secrets

| secret | what stops without it |
| --- | --- |
| `CF_WORKERS_TOKEN` | the negotiator. The step fails the deploy rather than skipping. |
| `CF_ACCOUNT_ID` | the same. |
| `CF_ZONE_ID` | the cache purge, and the route settings above. |
| `CF_API_TOKEN` | the cache purge. |

`CF_WORKERS_TOKEN` needs Workers Scripts: Edit and Workers Routes: Edit;
`CF_API_TOKEN` needs Zone → Cache Purge. Deliberately two tokens: different
job, different rotation.

To roll back, re-run an earlier successful Deploy from the Actions tab. The site
is rebuilt from that commit and there is no state to restore.

## Search visibility

**Before changing anything about Cloudflare, search visibility or page weight,
read `CHECKLIST.md` in the seo-tools repository.** It is the list of things
that are invisible until looked for -- edge settings that silently block AI
crawlers, Security Center advisories that would put that blocking back, what
GitHub Pages refuses to serve, and how PageSpeed and the Bing API mislead. It
also holds the readings each property was last measured at. That repository is
private and holds the credentials and the site list, which is why the detail is
there and not here.


`indexnow.mjs` submits every `<loc>` in the sitemap -- all of them, not the ones
that changed -- on every deploy, so Bing, Yandex, Seznam and Naver are told
about every page each time the site ships. Google does not take part; it has the
sitemap from `robots.txt` and Search Console.

What the engines currently hold, and the tooling that asks them, live outside
this repository: they cover every property rather than this one, and they name
things that do not belong in a public repository.

## Licences

The code, meaning `scripts/`, `src/`, the workflows and `site.config.json`, is
GPL-3.0-or-later. See [LICENSE.txt](LICENSE.txt).

The words, meaning everything in `content/`, are CC BY-SA 4.0. See
[LICENSE-CONTENT.txt](LICENSE-CONTENT.txt).

The name Lukotta, the logo, the mark and the icons generated from them are
trademarks and are under neither.

The two typefaces are under the SIL Open Font License. See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
