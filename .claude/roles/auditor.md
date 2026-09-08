# auditor, in this project

<!-- covers: none -->

The role itself is shared: `~/.claude/agents/auditor.md`, from the workflow repository.
This file is the part that is only true here, and it wins where the two disagree.

The gates are `npm run check` and, as the deploy workflow runs them,
`node scripts/build.mjs --strict`, `node scripts/check.mjs --strict`,
`node scripts/check-slugs.mjs` and `node scripts/lint-translations.mjs`.

`scripts/build.mjs` WRITES the built site, and `npm run check` runs it first, so the
gate is mutating - run it in a clone. `scripts/indexnow.mjs` notifies an external search
service and must never be run during an audit.
