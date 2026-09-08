# implementer, in this project

<!-- covers: none -->

The role itself is shared: `~/.claude/agents/implementer.md`, from the workflow repository.
This file is the part that is only true here, and it wins where the two disagree.

The gate is `npm run check` - `scripts/build.mjs`, then `scripts/check.mjs`, then `scripts/check-slugs.mjs`. The deploy workflow runs the same three with `--strict` plus `scripts/lint-translations.mjs`; run the strict form before calling anything done.

The site is a Cloudflare Worker in `worker/`. A change there changes what is served, not what is built, and the build passing says nothing about it.

Errors surface in the build output and the browser console. There are no release notes: the site is deployed, not released.

**Skills:** `cloudflare:workers-best-practices` before changing anything under `worker/`,
and `cloudflare:wrangler` before deploying it. The worker's config is `worker/wrangler.toml`,
not at the repository root, and it is a separate deployment from the site: the site goes to
GitHub Pages through the deploy workflow, the worker goes to Cloudflare through wrangler.
One command does not do both.
