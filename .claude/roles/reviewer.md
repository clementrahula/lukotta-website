# reviewer, in this project

<!-- covers: none -->

The role itself is shared: `~/.claude/agents/reviewer.md`, from the workflow repository.
This file is the part that is only true here, and it wins where the two disagree.

The gate is `npm run check` - `scripts/build.mjs`, then `scripts/check.mjs`, then
`scripts/check-slugs.mjs`. There are two workflows, not one: `check.yml` runs on a change
and also runs `node worker/negotiation.test.mjs`, which `npm run check` does not;
`deploy.yml` runs the three scripts with `--strict` plus `scripts/lint-translations.mjs`.

So the local gate is a subset twice over. Run the strict form and the worker test before
judging a change, or say which of them did not run.

The request host is **github**. There are no release notes: the site is deployed, not
released.

The site is a Cloudflare Worker in `worker/`. A change there is a change to what is
served, not to what is built.
