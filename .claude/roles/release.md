# release, in this project

This project's half of the `release` brief. The role itself lives outside this
repository; if you have cloned this project it will not be here, and nothing below
depends on it - what follows describes THIS repository and stands on its own.

```
artefacts:            the contents of public/, built by scripts/build.mjs, and
                      the markdown-negotiator Worker in worker/
channel:              https://lukotta.com/ and https://www.lukotta.com/, served
                      from GitHub Pages behind the Cloudflare zone; the Worker
                      runs on lukotta.com/* and www.lukotta.com/*
publish:              push to main. The Deploy workflow builds public/, publishes
                      it to Pages, submits the changed addresses to IndexNow, and
                      deploys the Worker. There is no separate manual step.
verify from outside:  curl -sS -o /dev/null -w '%{http_code}\n' https://lukotta.com/
                      curl -sS -H 'Accept: text/markdown' https://lukotta.com/ | head -3
                      The second is what proves the Worker is still bound: it
                      must come back as markdown, not HTML.
gate:                 npm run check   (build, check.mjs, check-slugs.mjs; all bare)
                      Both workflows add --strict to build.mjs and check.mjs only -
                      check-slugs.mjs takes no --strict - plus lint-translations.mjs.
                      worker/negotiation.test.mjs runs in check.yml, not deploy.yml.
```

## Publishing is a push, and that is the whole of it

There is no release command here. The Deploy workflow runs on every push to
`main`, and everything below the build - Pages, IndexNow, the Worker - happens
inside it. So the release decision is the merge decision, and the gate that
matters is the one that runs before the merge.

`--strict` is the difference between the local gate and the CI one: run
`node scripts/build.mjs --strict` and `node scripts/check.mjs --strict` locally
before pushing, or the first time you see the strict result will be after it has
published.

## Two things that are easy to publish wrong

- **A published address that moved.** `check-slugs.mjs` refuses one, and it is
  a hard refusal for a reason: every slug becomes a URL, GitHub Pages cannot
  redirect, and a moved address is a page that silently 404s for everyone who
  had the old one. `content/slugs.json` is the record of every published
  address.
- **The SSL mode.** Cloudflare set to Flexible produces a redirect loop on the
  live site. The records and the required mode are in AGENTS.md; check there
  before changing anything in the zone.

IndexNow runs after the deploy, never before: it fetches the key from the live
site to verify it, and tells the engines to come and read pages that have to be
there when they arrive. It is allowed to fail without failing the deploy -
nothing about the site is wrong because a search engine was busy.

**Skills:** `cloudflare:wrangler` only to read what the Deploy workflow is doing, never to
run a deploy from here. The `publish:` block above is right: one push ships both, and there
is no separate manual step. A hand-run `wrangler deploy` skips the `Keep the routes failing
open` step that follows it in CI, and Cloudflare recreates the routes failing closed - so
the manual shortcut is the one action that can take the whole zone down.
