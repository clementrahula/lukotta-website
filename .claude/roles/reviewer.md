# reviewer, in this project

<!-- covers: none -->

The role itself is shared and lives outside this repository, at `~/.claude/agents/reviewer.md`.
If you have cloned this project that file will not be there, and nothing here depends
on it: what follows is a description of THIS repository's commands, paths and hazards,
which is useful on its own. Where both exist, this file wins.

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

The site is static output on GitHub Pages. The Cloudflare Worker in `worker/` serves the markdown twins and is a separate deployment; a change there is invisible to the build, and only `check.yml` runs its test.