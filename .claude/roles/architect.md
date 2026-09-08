# architect, in this project

<!-- covers: none -->

The role itself is shared: `~/.claude/agents/architect.md`, from the workflow repository.
This file is the part that is only true here, and it wins where the two disagree.

Plans go at the repository root.

What failure costs here is **trust and reach**: this is where somebody decides whether to install the application, so a broken or wrong page costs a user before they ever run anything.

The constraints: static output only, a Cloudflare Worker in `worker/` for request-time behaviour, and content that must stay true to what the application actually does - a claim here that the product does not honour is worse than a broken link.
