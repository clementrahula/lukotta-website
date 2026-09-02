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
function qualityOf(part) {
  const [type, ...params] = part.trim().split(";");
  const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
  const value = q ? Number(q.slice(2)) : 1;
  return { type: type.trim().toLowerCase(), q: Number.isFinite(value) ? value : 0 };
}

/* Markdown only when the caller actually prefers it.
   
   Reading "does text/markdown appear at all" was wrong for a header like
   "text/html, text/markdown;q=0.5", which says html first and markdown as a
   fallback: that caller got markdown. q=0 is a refusal, and Accept: * / * is
   every client that did not think about it, browsers included, so neither
   counts as asking. */
function wantsMarkdown(accept) {
  if (!accept) return false;
  const parts = accept.split(",").map(qualityOf);
  const md = parts.find((p) => p.type === "text/markdown");
  if (!md || md.q <= 0) return false;
  const html = parts.find((p) => p.type === "text/html");
  return !html || md.q >= html.q;
}

/* /foo/ -> /foo/index.md, / -> /index.md. A path with an extension is a file
   the build wrote deliberately, not a page, so it is left alone. */
function twinFor(pathname) {
  /* Assets are files the build wrote deliberately and have no twin. Bailing
     here rather than after a fetch keeps the stylesheet, the script, the fonts
     and the screenshots off this code path entirely -- which matters because
     the route covers the whole zone and every request to it is a worker
     invocation counted against the account's daily allowance. */
  if (pathname.startsWith("/assets/")) return null;
  if (/\.[a-z0-9]+$/i.test(pathname)) return null;
  return pathname.endsWith("/") ? `${pathname}index.md` : `${pathname}/index.md`;
}

/* The twins are fetchable at their own addresses as well as through
   negotiation, and at that address nothing marks them. A negotiated response
   carries X-Robots-Tag already, but Googlebot never negotiates: it sends no
   markdown Accept, so the only way it can ever meet a twin is by following a
   bare .md URL out of somebody's transcript. Each one is a thin copy of a page
   that is already indexed at its own address. */
function isMarkdownFile(pathname) {
  return /\.md$/i.test(pathname);
}

/* One address per page. The header used to echo whatever was asked for, so
   /?utm_source=x declared itself canonical with the campaign parameter still
   on it, and a request to www declared the www address rather than the apex
   the rest of the site canonicalises to. */
function canonicalFor(url) {
  const host = url.hostname.replace(/^www\./i, "");
  return `${url.protocol}//${host}${url.pathname}`;
}

/* The language directories, so a 404 under one can be answered in that
   language. Written by the build into worker/languages.js rather than kept by
   hand here, because a list of languages maintained in two places is a list
   that disagrees with itself. */
import { LANGUAGE_PATHS } from "./languages.js";

/* GitHub Pages serves one 404 page, the one at the root, whatever the address
   was. The build writes a translated one into every language directory and
   they were unreachable: somebody who mistyped an address under /de/ got the
   English page. This is the only place that can put that right, because it is
   the only thing between the reader and a static host. */
async function localisedNotFound(request, url) {
  const prefix = url.pathname.split("/")[1];
  if (!LANGUAGE_PATHS.includes(prefix)) return null;
  const page = await fetch(new URL(`/${prefix}/404.html`, url).toString(), {
    cf: { cacheEverything: true },
  });
  if (!page.ok) return null;
  /* The status is the origin's, not this page's: a 404 body served as 200
     teaches an agent that every address on the site exists. */
  return new Response(page.body, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
      "Vary": "Accept, Accept-Encoding",
    },
  });
}

/* The 404 as markdown, for a caller that asked for markdown and mistyped an
   address. Without it the fallback was the origin's HTML 404: a full document,
   in English whatever the language directory, handed to something that had
   just said it wanted markdown. The build writes 404.md beside every 404.html
   from the same links, so the two cannot drift. */
async function markdownNotFound(request, url, method) {
  const prefix = url.pathname.split("/")[1];
  const where = LANGUAGE_PATHS.includes(prefix) ? `/${prefix}/404.md` : "/404.md";
  const page = await fetch(new URL(where, url).toString(), { cf: { cacheEverything: true } });
  if (!page.ok) return null;
  return new Response(method === "HEAD" ? null : page.body, {
    status: 404,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "no-cache",
      "Vary": "Accept, Accept-Encoding",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}

/* RFC 9116 puts security.txt at /.well-known/security.txt, and GitHub Pages does
   not serve a path beginning with a dot -- /.nojekyll answers 404 on this site,
   so the whole directory is unreachable. The build writes /security.txt instead
   and this maps the canonical address onto it. A redirect would satisfy the RFC
   too, but serving it at the address it claims as canonical is the honest
   version and costs one fetch either way. */
const SECURITY_TXT = "/.well-known/security.txt";

export default {
  async fetch(request, env, ctx) {
    /* A worker in front of a whole zone that throws returns a Cloudflare error
       page to a real visitor, for every request, on every page. Nothing here is
       important enough to be worth that: if anything at all goes wrong, hand
       the request to the origin and let the site serve HTML as it did before
       this file existed. */
    try {
      return await negotiate(request);
    } catch {
      return fetch(request);
    }
  },
};

async function negotiate(request) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const asked = wantsMarkdown(request.headers.get("Accept"));

    if (url.pathname === SECURITY_TXT && (method === "GET" || method === "HEAD")) {
      const file = await fetch(new URL("/security.txt", url).toString(), {
        cf: { cacheEverything: true },
      });
      if (file.ok) {
        return withVary(new Response(method === "HEAD" ? null : file.body, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": file.headers.get("Cache-Control") || "public, max-age=3600",
          },
        }));
      }
      /* Fall through to the origin, which will 404 honestly. */
    }

    if ((method !== "GET" && method !== "HEAD") || !asked) {
      const passed = await fetch(request);
      if (passed.status === 404 && method === "GET") {
        const localised = await localisedNotFound(request, url);
        if (localised) return withVary(localised);
      }
      return withVary(passed, url);
    }

    const twin = twinFor(url.pathname);
    if (!twin) return withVary(await fetch(request), url);

    const md = await fetch(new URL(twin, url).toString(), {
      headers: { "User-Agent": request.headers.get("User-Agent") || "" },
      cf: { cacheEverything: true },
    });

    /* No twin, or the origin had something to say about it: answer the original
       request rather than handing back a 404 for a page that exists in HTML.
       Unless the address does not exist at all, in which case the caller gets
       the markdown 404 rather than an HTML document it did not ask for. */
    if (!md.ok) {
      const passed = await fetch(request);
      if (passed.status === 404) {
        const answer = await markdownNotFound(request, url, method);
        if (answer) return answer;
      }
      return withVary(passed, url);
    }

    const body = method === "HEAD" ? null : md.body;
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": md.headers.get("Cache-Control") || "public, max-age=3600",
        "Vary": "Accept, Accept-Encoding",
        "X-Content-Type-Options": "nosniff",
        "Link": `<${canonicalFor(url)}>; rel="canonical"`,
        /* The twins are a machine-readable copy of a page that is already
           indexed at its own address. Letting them be indexed separately is
           thin duplicate content. */
        "X-Robots-Tag": "noindex",
      },
    });
}

/* Every response from this zone carries it, not just the markdown ones. A cache
   deciding what to do with the HTML has to know that Accept mattered, or it
   will serve that HTML to the next caller who asked for markdown. */
function withVary(response, url) {
  const out = new Response(response.body, response);
  if (url && isMarkdownFile(url.pathname) && !out.headers.has("X-Robots-Tag")) {
    out.headers.set("X-Robots-Tag", "noindex");
  }
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
