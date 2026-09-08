# researcher, in this project

<!-- covers: none -->

The role itself is shared and lives outside this repository, at `~/.claude/agents/researcher.md`.
If you have cloned this project that file will not be there, and nothing here depends
on it: what follows is a description of THIS repository's commands, paths and hazards,
which is useful on its own. Where both exist, this file wins.

What is shipped is a public marketing and download site for a macOS application.

Research goes at the repository root.

There is no dependency policy. What is worth establishing from primary sources is anything about Cloudflare Workers' runtime limits and caching behaviour, because the site's request-time behaviour depends on them and they are not visible from the build.
