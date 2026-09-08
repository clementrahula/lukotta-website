# architect, in this project

<!-- covers: none -->

The role itself is shared: `~/.claude/agents/architect.md`, from the workflow repository.
This file is the part that is only true here, and it wins where the two disagree.

Plans go at the repository root.

What failure costs here is **trust and reach**: this is where somebody decides whether to install the application, so a broken or wrong page costs a user before they ever run anything.

The constraints: static output published to GitHub Pages, a Cloudflare Worker in `worker/` serving the markdown twins at request time - a separate deployment, not the site itself - and content that must stay true to what the application actually does. A claim here that the product does not honour is worse than a broken link.

**Skills:** `cloudflare:workers-best-practices` when the design touches request-time
behaviour, and `cloudflare:web-perf` when it touches what a visitor waits for. A Worker's
limits are platform facts that change on the vendor's schedule, so they are read rather
than recalled.
