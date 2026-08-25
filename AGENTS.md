# Working on the Lukotta website

Everything not obvious from the files. [README.md](README.md) is the short
version; this is the rest.

## What this is

One page, built into `public/` for every language in `site.config.json`. There
is no framework and nothing to install — the build is Node and the standard
library. `public/` is generated and is not committed.

```
site.config.json     the domain, the version, and every language
content/             everything the page says, one file per language
src/page.mjs         the markup, including the whole of the <head>
src/styles.css       the visual system, light and dark
src/script.js        appearance, the screenshot swap, the language menu, the platform notice
scripts/build.mjs    builds public/ from the above
scripts/check.mjs    checks what was built; --strict is the release gate
```

## The commands

```bash
npm start                              # build and serve at localhost:4321
npm run check                          # build, then check
node scripts/new-language.mjs --all    # after any change to content/en.json
node scripts/lint-translations.mjs     # placeholders, names, lengths
node scripts/export-translations.mjs   # a bundle for an outside reviewer
```

**Run `new-language.mjs --all` after every change to the English.** It appends
new keys to all thirty-six languages, drops removed ones, and leaves existing
translations and `localOnly` blocks alone. Nothing else keeps them in step.

## Rules the build enforces

`scripts/check.mjs` fails on a wrong canonical, an incomplete `hreflang`
cluster, a duplicate title between two translated pages, a local reference that
is not in `public/`, an `<img>` without alt text, a page without exactly one
`<h1>`, JSON-LD that does not parse, a `lang` or `dir` that disagrees with the
configuration, and a sitemap that does not match the pages.

`--strict` additionally refuses while any language still carries English text.
That is the condition for publishing at all: thirty-seven copies of one page is
duplicate content. The deploy workflow runs it.

## Things that will bite

**A string in one language only.** A language file may carry a `localOnly`
block. Those strings *replace* the translation of the key they name, on that
language's page alone. Finnish uses one, in the name section. The translator
consults `localOnly` before `strings`, so the markup knows nothing about it.

**Screenshots.** Two per language at
`src/assets/screenshots/<code>/{light,dark}.webp`, the pair the same size as
each other. They are lossless WebP converted from 1160x1264 PNG captures with
`cwebp -lossless`, and are shown at 720px, which is 1.6x density. The build
reads their real dimensions from the WebP header, writes them onto the `<img>`,
and caps the frame at the image's own width. A language without its own pair
falls back to English, and the build reports which languages did.

Both appearances are in the page at once and cross-fade on the appearance
switch, so a page loads roughly 150 kB of screenshot.

**The macOS window frame stays.** `.shot` and `.shot-bar` draw it at the
measurements macOS uses: a 28pt title bar, 12pt buttons 8pt apart, 20pt in from
the leading edge, a 10pt corner. Do not remove it when the layout changes.

**Names that are not translated.** BitLocker, NTFS, LUKS, ext4, qcow2, VMDK,
macOS, Apple Silicon and the rest stay in Latin script in every language, and
undeclined — a name bent into a local case is no longer the word anyone
searches for. `content/GLOSSARY.md` is the list. Finder is *not* on it: Apple
translates it in some languages, and Chinese macOS calls it 访达.

**Where the application disagrees, it wins.** Its translations are a larger,
shipped body of text, and the same person reads both. `export-translations.mjs`
pulls a terminology reference out of them.

**Contrast.** `--ink-3`, the focus ring and `--control-edge` were all set by
measurement, not by eye. Changing them means re-checking 4.5:1 for text and
3:1 for focus rings and control borders, in both themes.

**Only two brand files ship.** `assets/brand/lukotta-mark-{light,dark}.png`.
The rest of `src/assets/brand/` are the originals the favicons and the
shared-card image in `src/assets/icons/` were generated from, with `sips`. Keep
them; do not publish them.

## No co-authorship

Commit messages carry no `Co-Authored-By` trailer. The trailer had built up in
the history once and was removed by rewriting it; `.githooks/commit-msg` strips
it from every message so it cannot return by hand or from a tool default.

`core.hooksPath` is local configuration and is not versioned, so a fresh clone
has to enable the hook once:

```bash
git config core.hooksPath .githooks
```

## What is under which licence

Two, because the repository holds two different kinds of thing.

**The code** — `scripts/`, `src/page.mjs`, `src/script.js`, `src/styles.css`,
the workflows, `site.config.json` — is **GPL-3.0-or-later**, the same as the
application. See [LICENSE.txt](LICENSE.txt).

**The words** — everything in `content/`, which is the English copy and its
thirty-six translations — are **CC BY-SA 4.0**. See
[LICENSE-CONTENT.txt](LICENSE-CONTENT.txt). Creative Commons is the tool built
for prose; the GPL is not, and its idea of source does not map onto a sentence.
Share-alike keeps the copyleft.

**The brand** — the name Lukotta, the logo, the mark, and the icons generated
from them — is under neither. They are trademarks, and
[TRADEMARKS.txt](https://github.com/clementrahula/lukotta/blob/main/TRADEMARKS.txt)
in the application's repository says what is permitted.

The two typefaces the site carries are under the SIL Open Font License; see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Going live

The repository is private, so Pages will not serve it — GitHub publishes a
private repository only on a paid plan. The deploy workflow is therefore
manual, and its push trigger is commented out.

1. **Make the repository public.**
2. **Uncomment the push trigger** in `.github/workflows/deploy.yml`.
   `configure-pages` runs with `enablement: true`, so the first run turns Pages
   on and sets the source to GitHub Actions by itself.
3. **Set the custom domain** to `lukotta.com` in Settings → Pages. The build
   already writes `public/CNAME`, so it should stick on the first deploy. Leave
   **Enforce HTTPS** on once the certificate is issued.
4. **Point Cloudflare at Pages.**

   | Type | Name | Content |
   | --- | --- | --- |
   | `A` | `lukotta.com` | `185.199.108.153` |
   | `A` | `lukotta.com` | `185.199.109.153` |
   | `A` | `lukotta.com` | `185.199.110.153` |
   | `A` | `lukotta.com` | `185.199.111.153` |
   | `AAAA` | `lukotta.com` | `2606:50c0:8000::153` |
   | `AAAA` | `lukotta.com` | `2606:50c0:8001::153` |
   | `AAAA` | `lukotta.com` | `2606:50c0:8002::153` |
   | `AAAA` | `lukotta.com` | `2606:50c0:8003::153` |
   | `CNAME` | `www` | `clementrahula.github.io` |

   These are the origin addresses. Keep the AAAA records: Cloudflare reaches
   the origin over either family, and if the proxy is ever switched off they
   are what an IPv6-only reader resolves.

   **The proxy stays on, orange from the first record.** What cannot be on
   from the first minute is *Full (strict)*, and that is what used to force
   the grey-cloud dance. Full (strict) checks that the origin presents a
   certificate valid for `lukotta.com`. GitHub has no such certificate until
   it issues one, and it issues one by answering a challenge that Full
   (strict) is busy rejecting. The proxy was never the problem; starting at
   the strictest setting was.

   So start one notch down and move up:

   | Stage | SSL/TLS mode | Why |
   | --- | --- | --- |
   | Setting the domain | **Full** | Encrypts Cloudflare to GitHub, and tolerates GitHub still serving its `*.github.io` certificate. Never *Flexible*: that sends plain HTTP to GitHub, which answers with a redirect loop. |
   | Certificate issued | **Full (strict)** | GitHub now holds a certificate for the domain, so the origin can be verified. Turn on **Enforce HTTPS** in Settings → Pages at the same time. |

   While the certificate is being issued, keep the challenge path out of the
   way of anything that could answer it instead of GitHub:

   - **Always Use HTTPS: off** until the certificate exists, or add a
     configuration rule exempting `/.well-known/acme-challenge/*`. Let's
     Encrypt follows redirects, but there is no reason to add a hop that
     depends on the leg you are still trying to establish.
   - **Cache: bypass** on `/.well-known/acme-challenge/*`, so a cached 404
     from an earlier attempt cannot outlive it.

   Issuance usually lands within minutes. GitHub's own documentation suggests
   turning a proxy off for it, so this is the setup the rest of the world runs
   rather than the one the vendor blesses. If Pages still reports the
   certificate as pending after a day, grey-cloud the two records for the few
   minutes it takes, then turn the proxy straight back on — as a way out of a
   stuck state, not as the plan.

5. **Add the response headers GitHub Pages cannot send.**

   The pages already set what a page can set for itself: the content policy,
   with a hash for each inline script, and `Referrer-Policy` through
   `<meta name="referrer">`. Three cannot be expressed in markup at all —
   `frame-ancestors` is ignored in a `<meta>`, and the other two are headers
   or nothing — so they come from the proxy the site sits behind anyway.

   | Header | Value |
   | --- | --- |
   | `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
   | `X-Content-Type-Options` | `nosniff` |
   | `Content-Security-Policy` | `frame-ancestors 'none'` |

   By hand: Rules → Transform Rules → Modify Response Header → Add rule, for
   `lukotta.com/*`, set each of the three.

   Or in one call, with a token holding *Zone → Config Rules → Edit* on this
   zone (zone id is on the Cloudflare overview page):

   ```bash
   curl -sS -X PUT \
     "https://api.cloudflare.com/client/v4/zones/$CF_ZONE/rulesets/phases/http_response_headers_transform/entrypoint" \
     -H "Authorization: Bearer $CF_TOKEN" \
     -H "Content-Type: application/json" \
     --data @- <<'JSON'
   {
     "rules": [
       {
         "action": "rewrite",
         "description": "Headers GitHub Pages cannot send",
         "expression": "true",
         "action_parameters": {
           "headers": {
             "Strict-Transport-Security": { "operation": "set", "value": "max-age=31536000; includeSubDomains" },
             "X-Content-Type-Options": { "operation": "set", "value": "nosniff" },
             "Content-Security-Policy": { "operation": "set", "value": "frame-ancestors 'none'" }
           }
         }
       }
     ]
   }
   JSON
   ```

   Add HSTS only once the certificate is issued and HTTPS answers. A browser
   that has seen the header refuses plain HTTP for a year and there is no way
   to reach back and tell it otherwise, so it is the one header worth adding
   last. Confirm all three afterwards with `curl -sI https://lukotta.com`.

6. **Check the live site.**

   ```bash
   curl -sI https://lukotta.com | head -1
   curl -s https://lukotta.com/sitemap.xml | head -20
   ```

7. **Submit the sitemap** in Google Search Console and Bing Webmaster Tools.
   Search Console reports the `hreflang` cluster under International Targeting;
   it should list every language with no return-tag errors.

To roll back, re-run an earlier successful Deploy from the Actions tab. The
site is rebuilt from that commit; there is no state to restore.
