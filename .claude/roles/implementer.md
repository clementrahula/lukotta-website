# implementer, in this project

<!-- covers: none -->

The role itself is shared: `~/.claude/agents/implementer.md`, from the workflow repository.
This file is the part that is only true here, and it wins where the two disagree.

The gate is `npm run check` - `scripts/build.mjs`, then `scripts/check.mjs`, then `scripts/check-slugs.mjs`. The deploy workflow runs the same three with `--strict` plus `scripts/lint-translations.mjs`; run the strict form before calling anything done.

The site is a Cloudflare Worker in `worker/`. A change there changes what is served, not what is built, and the build passing says nothing about it.

Errors surface in the build output and the browser console. There are no release notes: the site is deployed, not released.

**Skills:** `cloudflare:workers-best-practices` before changing anything under `worker/`,
and `cloudflare:wrangler` before running a deploy. There is no `wrangler.toml` here and
wrangler is still what deploys - the absence of a config file is not the absence of the
tool, and `scripts/deploy-worker.sh` records why: `wrangler deploy` rewrites the worker's
routes and Cloudflare recreates them failing CLOSED, so a deploy that looks routine can
take the whole zone down until midnight UTC.
