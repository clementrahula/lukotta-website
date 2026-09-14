# Deployment

## Publishing

- Artefacts: `public/`, built by `scripts/build.mjs`, and the markdown negotiator Worker in `worker/`.
- Channel: https://lukotta.com/, from GitHub Pages behind the Cloudflare zone.
- A push to `main` runs the Deploy workflow. There is no other release step.

| order | step |
| --- | --- |
| 1 | `build.mjs --strict`, `lint-translations.mjs`, `check.mjs --strict`, `check-slugs.mjs`; any failure stops the deploy |
| 2 | `public/` published to GitHub Pages |
| 3 | `indexnow.mjs`, `continue-on-error` |
| 4 | `npx --yes wrangler@4.127.0 deploy --config worker/wrangler.toml` |
| 5 | Cloudflare cache purge, everything |
| 6 | routes set to fail open, read back |
| 7 | assets taken off the worker, read back |
| 8 | `Accept: text/markdown` request to https://lukotta.com/ must return markdown with `Vary: Accept` |

Verify from outside:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://lukotta.com/
curl -sS -H 'Accept: text/markdown' https://lukotta.com/ | head -3   # markdown, not HTML: the Worker is bound
```

Roll back: re-run an earlier successful Deploy from the Actions tab. The site is rebuilt from that commit; there is no state to restore.

## Cloudflare zone

- The domain is proxied. SSL/TLS mode Full; Flexible produces a redirect loop.
- HTML is not cached at the edge. The stylesheet and script carry a content digest, so a change renames them.
- Replacing an image under its own name needs a manual purge.
- Two cache rules, both a year at the edge (the deploy purges everything on every push):

| files | browser cache | reason |
| --- | --- | --- |
| the digest pair | a year | a change renames them |
| `/assets/` | a day | a browser cache cannot be purged; screenshots are replaced under their own names |

- `www` redirects to the apex in a redirect rule, not at the origin: redirect rules run before workers, so no worker invocation and no round trip to GitHub.

### Zone settings

| setting | value | reason |
| --- | --- | --- |
| Hotlink Protection | off | on, it answered `/assets/og.png` and `/favicon.ico` with 403 to any other site's `Referer`, blocking sharing |
| Browser Integrity Check | off | can challenge an agent on a datacenter address |
| Security Level | essentially off | same |
| Rocket Loader | off | one extra request to defer an already-deferred script |
| Email Obfuscation | off | no `mailto:` in the markup |
| Server-Side Excludes | off | no `<!--sse-->` in the markup |
| Minimum TLS | 1.2 | 1.0 and 1.1 are dead |
| HSTS | on, six months | `includeSubdomains` off: `autoconfig.lukotta.com` is fetched by mail clients. Raise the age before adding it |

### Bot Management

- `ai_bots_protection`, `crawler_protection`, `ai_training`, `ai_search`, `ai_user`: all disabled.
- Bot Fight Mode off.
- Managed `robots.txt` off, so Cloudflare does not write a content-signal policy over `public/robots.txt`.
- Turning any of them on silently retires the markdown negotiator, `llms.txt` and the task pages. Check them before concluding an agent cannot read the site.

## The markdown negotiator

- `worker/` serves a page's markdown twin to a caller asking for `text/markdown` and passes everything else through. Config: `worker/wrangler.toml`, script `lukotta-markdown`.
- Routed at `lukotta.com/*` and `www.lukotta.com/*`: it sees every request the zone serves.
- Deployed after the pages: it fetches the twin from the origin.
- Workers free plan: 100,000 invocations a day.
- Workers runtime limits and caching behaviour are Cloudflare platform facts that change on its schedule and are not visible from the build.
- `worker/negotiation.test.mjs` covers the pure decisions: what the caller asked for, which file is the twin, whether a path is a twin at its own address, which address a twin calls canonical.

The deploy sets three things wrangler cannot express:

| what | detail |
| --- | --- |
| routes fail open | Cloudflare creates them fail closed: once the daily allowance runs out, every request gets an error page until midnight UTC. Open bypasses the worker: an agent gets HTML, a 404 under `/de/` comes back in English. Nothing the worker does is a security check. |
| assets not routed through it | a page view is about fourteen invocations. Exclusion routes for `/assets/*` and the two fingerprinted root files by exact name take thirteen off; names are read from `public/` and routes from older digests removed. `robots.txt`, `sitemap.xml`, `llms.txt`, `favicon.ico` and `site.webmanifest` are excluded by name. |
| both read back | the job fails if a route is still closed or an exclusion is missing |

The worker is never deployed by hand. A bare `wrangler deploy` recreates the routes failing closed and skips the `Keep the routes failing open` step (wrangler cannot set it: workers-sdk#2078), leaving `lukotta.com/*` serving error pages once the daily allowance runs out.

## Secrets

| secret | what stops without it |
| --- | --- |
| `CF_WORKERS_TOKEN` | the negotiator; the step fails the deploy rather than skipping |
| `CF_ACCOUNT_ID` | the same |
| `CF_ZONE_ID` | the cache purge, and the route settings |
| `CF_API_TOKEN` | the cache purge |

- `CF_WORKERS_TOKEN`: Workers Scripts: Edit, Workers Routes: Edit.
- `CF_API_TOKEN`: Zone → Cache Purge.
- Two tokens: different job, different rotation.

## IndexNow

- Runs after the Pages deploy: it fetches the key from the live site, and the pages must exist when the engines arrive.
- Submits every `<loc>` in the sitemap on every deploy, not only changed ones: Bing, Yandex, Seznam, Naver.
- Allowed to fail without failing the deploy.
- Google does not take part; it has the sitemap from `robots.txt` and Search Console.

## Search visibility

- Before changing Cloudflare, search visibility, page weight, `worker/`, `_headers`, `robots.txt` or anything wrangler: read `~/Repos/seo-tools/CHECKLIST.md` (the private seo-tools repository).
- It holds: edge settings that silently block AI crawlers, Security Center advisories that would put that blocking back, what GitHub Pages refuses to serve, how PageSpeed and the Bing API mislead, and each property's last measured readings.
- It is private because it holds the credentials and the site list. What the engines currently hold, and the tooling that asks them, live there too.
