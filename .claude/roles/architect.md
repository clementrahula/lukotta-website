# architect, in this project

<!-- covers: none -->

The role itself is shared and lives outside this repository, at `~/.claude/agents/architect.md`.
If you have cloned this project that file will not be there, and nothing here depends
on it: what follows is a description of THIS repository's commands, paths and hazards,
which is useful on its own. Where both exist, this file wins.

Plans go at the repository root.

What failure costs here is **trust and reach**: this is where somebody decides whether to install the application, so a broken or wrong page costs a user before they ever run anything.

The constraints: static output published to GitHub Pages, a Cloudflare Worker in `worker/` serving the markdown twins at request time - a separate deployment, not the site itself - and content that must stay true to what the application actually does. A claim here that the product does not honour is worse than a broken link.

**Skills:** `cloudflare:workers-best-practices` when the design touches request-time
behaviour, and `cloudflare:web-perf` when it touches what a visitor waits for. A Worker's
limits are platform facts that change on the vendor's schedule, so they are read rather
than recalled.
