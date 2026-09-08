# implementer, in this project

<!-- covers: none -->

The role itself is shared and lives outside this repository, at `~/.claude/agents/implementer.md`.
If you have cloned this project that file will not be there, and nothing here depends
on it: what follows is a description of THIS repository's commands, paths and hazards,
which is useful on its own. Where both exist, this file wins.

The gate is `npm run check` - `scripts/build.mjs`, `scripts/check.mjs`, `scripts/check-slugs.mjs`, all bare. Both workflows run more than that and the same four as each other: `build.mjs --strict`, `lint-translations.mjs`, `check.mjs --strict`, and `check-slugs.mjs` **bare** - that script reads only `--write` and takes no `--strict`. `check.yml` then adds `worker/negotiation.test.mjs`; `deploy.yml` adds a plain `build.mjs` and `indexnow.mjs`.

The site is **static output on GitHub Pages** - `deploy.yml` uploads `public/` as a Pages artifact. The Cloudflare Worker in `worker/` is not the site: it serves the markdown twins at request time. A change under `worker/` is invisible to the build, which is why it has its own test.

Errors surface in the build output and the browser console. There are no release notes: the site is deployed, not released.

**Skills:** `cloudflare:workers-best-practices` before changing anything under `worker/`.
The worker's config is `worker/wrangler.toml`, not at the repository root.

**Do not deploy the worker by hand.** The Deploy workflow already does it -
`npx wrangler@4.127.0 deploy --config worker/wrangler.toml` - and the step immediately
after it, `Keep the routes failing open`, repairs what that deploy breaks: Cloudflare
recreates the routes failing CLOSED, and wrangler has no way to say otherwise
(workers-sdk#2078). A bare `wrangler deploy` run locally does the first half and not the
second, which leaves `lukotta.com/*` serving error pages once the daily invocation
allowance runs out. Push to `main` and let the workflow ship both.
