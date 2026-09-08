# auditor, in this project

<!-- covers: none -->

The role itself is shared and lives outside this repository, at `~/.claude/agents/auditor.md`.
If you have cloned this project that file will not be there, and nothing here depends
on it: what follows is a description of THIS repository's commands, paths and hazards,
which is useful on its own. Where both exist, this file wins.

The gates are `npm run check` and, as the deploy workflow runs them,
`node scripts/build.mjs --strict`, `node scripts/check.mjs --strict`,
`node scripts/check-slugs.mjs` and `node scripts/lint-translations.mjs`.

`scripts/build.mjs` WRITES the built site, and `npm run check` runs it first, so the
gate is mutating - run it in a clone. `scripts/indexnow.mjs` notifies an external search
service and must never be run during an audit.
