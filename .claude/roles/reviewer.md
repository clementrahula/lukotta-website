# reviewer, in this project

<!-- covers: none -->

The role itself is shared: `~/.claude/agents/reviewer.md`, from the workflow repository.
This file is the part that is only true here, and it wins where the two disagree.

The gate is `npm run check` - `scripts/build.mjs`, then `scripts/check.mjs`, then
`scripts/check-slugs.mjs`. The deploy workflow runs the same three with `--strict`, plus
`scripts/lint-translations.mjs`. Run the strict form before judging a change: the
difference between the two is the difference between local and CI.

The request host is **github**. There is no changelog.

The site is a Cloudflare Worker in `worker/`. A change there is a change to what is
served, not to what is built.
