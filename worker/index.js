/* SPDX-License-Identifier: GPL-3.0-or-later
   Copyright (C) 2026 Clement Rahula

   Serves markdown to agents that ask for it.

   The site is static, published to GitHub Pages, with Cloudflare in front. A
   static host cannot look at a request header and answer differently, so this
   sits at the edge and does the one thing that needs deciding per request: if
   the caller said it wants text/markdown, give it the markdown twin the build
   wrote beside the HTML.

   Everything else passes through untouched. A worker in front of a whole zone
   is a good place to break a site, so the rule is narrow on purpose: only GET
   and HEAD, only requests that actually asked for markdown, only paths that
   look like a page, and only when the twin turns out to exist. Anything that
   does not match every one of those is the origin's response, unmodified.

   Vary: Accept is the part that is easy to forget and expensive to omit. Two
   different bodies now live at one URL, so a cache that does not know the
   response depends on the request's Accept header will hand the HTML to an
   agent that asked for markdown, or the markdown to a browser, depending on
   which one it happened to store first. */

/* q=0 is a refusal, not a preference: "text/markdown;q=0" means do not send it.
   Accept: * / * is every client that did not think about it, browsers included,
   so it does not count as asking. */
function wantsMarkdown(accept) {
  if (!accept) return false;
  for (const part of accept.split(",")) {
    const [type, ...params] = part.trim().split(";");
    if (type.trim().toLowerCase() !== "text/markdown") continue;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    return !q || Number(q.slice(2)) > 0;
  }
  return false;
}

/* /foo/ -> /foo/index.md, / -> /index.md. A path with an extension is a file
   the build wrote deliberately, not a page, so it is left alone. */
function twinFor(pathname) {
  if (/\.[a-z0-9]+$/i.test(pathname)) return null;
  return pathname.endsWith("/") ? `${pathname}index.md` : `${pathname}/index.md`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const asked = wantsMarkdown(request.headers.get("Accept"));

    if ((method !== "GET" && method !== "HEAD") || !asked) {
      const passed = await fetch(request);
      return withVary(passed);
    }

    const twin = twinFor(url.pathname);
    if (!twin) return withVary(await fetch(request));

    const md = await fetch(new URL(twin, url).toString(), {
      headers: { "User-Agent": request.headers.get("User-Agent") || "" },
      cf: { cacheEverything: true },
    });

    /* No twin, or the origin had something to say about it: answer the original
       request rather than handing back a 404 for a page that exists in HTML. */
    if (!md.ok) return withVary(await fetch(request));

    const body = method === "HEAD" ? null : md.body;
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": md.headers.get("Cache-Control") || "public, max-age=3600",
        "Vary": "Accept, Accept-Encoding",
        "X-Content-Type-Options": "nosniff",
        "Link": `<${url.href}>; rel="canonical"`,
      },
    });
  },
};

/* Every response from this zone carries it, not just the markdown ones. A cache
   deciding what to do with the HTML has to know that Accept mattered, or it
   will serve that HTML to the next caller who asked for markdown. */
function withVary(response) {
  const out = new Response(response.body, response);
  const existing = out.headers.get("Vary") || "";
  const parts = new Set(
    existing.split(",").map((p) => p.trim()).filter(Boolean).map((p) => p.toLowerCase())
  );
  parts.add("accept");
  parts.add("accept-encoding");
  out.headers.set("Vary", [...parts].map((p) =>
    p === "accept" ? "Accept" : p === "accept-encoding" ? "Accept-Encoding" : p).join(", "));
  return out;
}
