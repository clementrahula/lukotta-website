# reviewer, in this project

<!-- covers: none -->

The role itself is shared: `~/.claude/agents/reviewer.md`, from the workflow repository.
This file is the part that is only true here, and it wins where the two disagree.

The gate is `npm run check` locally - `scripts/build.mjs`, `scripts/check.mjs`,
`scripts/check-slugs.mjs`, all bare.

Both workflows run more than that, and the same four as each other: `build.mjs --strict`,
`lint-translations.mjs`, `check.mjs --strict`, and `check-slugs.mjs` **bare** - that last
script takes no `--strict` and never has. `check.yml` then adds
`worker/negotiation.test.mjs`; `deploy.yml` instead adds a plain `build.mjs` and
`indexnow.mjs`, which notifies an external search service.

So the local gate is a subset: it misses both `--strict` forms, the translations lint and
the worker test. Run those or say which did not run.

The request host is **github**. There are no release notes: the site is deployed, not
released.

The site is a Cloudflare Worker in `worker/`. A change there is a change to what is
served, not to what is built.
