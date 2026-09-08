# implementer, in this project

<!-- covers: none -->

The role itself is shared: `~/.claude/agents/implementer.md`, from the workflow repository.
This file is the part that is only true here, and it wins where the two disagree.

The gate is `npm run check` - `scripts/build.mjs`, `scripts/check.mjs`, `scripts/check-slugs.mjs`, all bare. Both workflows run more than that and the same four as each other: `build.mjs --strict`, `lint-translations.mjs`, `check.mjs --strict`, and `check-slugs.mjs` **bare** - that script reads only `--write` and takes no `--strict`. `check.yml` then adds `worker/negotiation.test.mjs`; `deploy.yml` adds a plain `build.mjs` and `indexnow.mjs`.

The site is **static output on GitHub Pages** - `deploy.yml` uploads `public/` as a Pages artifact. The Cloudflare Worker in `worker/` is not the site: it serves the markdown twins at request time. A change under `worker/` is invisible to the build, which is why it has its own test.

Errors surface in the build output and the browser console. There are no release notes: the site is deployed, not released.

**Skills:** `cloudflare:workers-best-practices` before changing anything under `worker/`,
and `cloudflare:wrangler` before deploying it. The worker's config is `worker/wrangler.toml`,
not at the repository root, and it is a separate deployment from the site: the site goes to
GitHub Pages through the deploy workflow, the worker goes to Cloudflare through wrangler.
One command does not do both.
