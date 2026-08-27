/* The decisions the worker makes per request, tested without deploying it.
   Each is a pure function of a header or a URL, which is the whole reason they
   are written as pure functions: a worker sitting in front of an entire zone
   should not need a deploy to find out whether it answers a browser correctly.
   Run with: node worker/negotiation.test.mjs */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "index.js"), "utf8");
/* The worker's own imports are stripped: this evaluates the module as a data
   URL, where a relative import has nothing to resolve against, and the
   functions under test do not use them. */
const body = src
  .slice(0, src.indexOf("export default"))
  .replace(/^import .*$/gm, "");

const { wantsMarkdown, twinFor, isMarkdownFile, canonicalFor } = await import(
  "data:text/javascript," +
    encodeURIComponent(
      body + "\nexport { wantsMarkdown, twinFor, isMarkdownFile, canonicalFor };"
    )
);

let failed = 0;
const is = (got, want, label) => {
  const ok = got === want;
  if (!ok) failed++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${label}`);
  if (!ok) console.log(`        wanted ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
};

console.log("\n  Does the caller want markdown?\n");
is(wantsMarkdown("text/markdown"), true, "text/markdown");
is(wantsMarkdown("text/markdown, text/html;q=0.9"), true, "markdown preferred over html");
is(wantsMarkdown("text/html,application/xhtml+xml,*/*;q=0.8"), false, "a browser does not");
is(wantsMarkdown("*/*"), false, "and neither does a client that did not think about it");
is(wantsMarkdown(null), false, "no Accept header at all");
is(wantsMarkdown("TEXT/MARKDOWN"), true, "the header is case-insensitive");
is(wantsMarkdown("text/markdown;q=0"), false, "q=0 is a refusal, not a preference");
is(wantsMarkdown("text/markdown;charset=utf-8"), true, "a charset parameter is not a q value");
is(wantsMarkdown("text/plain"), false, "plain text is not markdown");
is(wantsMarkdown("text/html, text/markdown;q=0.5"), false,
   "a caller preferring html over markdown gets html");
is(wantsMarkdown("text/markdown;q=0.9, text/html;q=0.8"), true,
   "and one preferring markdown gets markdown");
is(wantsMarkdown("text/markdown, text/html"), true,
   "equal preference goes to markdown, since asking for it at all is deliberate");

console.log("\n  Which file is the twin?\n");
is(twinFor("/"), "/index.md", "the root");
is(twinFor("/open-bitlocker-drive-on-mac/"), "/open-bitlocker-drive-on-mac/index.md", "a task page");
is(twinFor("/de/"), "/de/index.md", "a language root");
is(twinFor("/de"), "/de/index.md", "and the same without the trailing slash");
is(twinFor("/sitemap.xml"), null, "a file the build wrote deliberately is left alone");
is(twinFor("/llms.txt"), null, "llms.txt is already markdown and is left alone");
is(twinFor("/styles.abc123.css"), null, "an asset is left alone");
is(twinFor("/assets/og.png"), null, "and so is everything under /assets/");
is(twinFor("/assets/fonts/inter-latin.woff2"), null, "however deep it sits");

console.log("\n  Is this a twin fetched at its own address?\n");
is(isMarkdownFile("/index.md"), true, "the root twin");
is(isMarkdownFile("/de/ueber/index.md"), true, "a twin under a language");
is(isMarkdownFile("/INDEX.MD"), true, "whatever the case");
is(isMarkdownFile("/de/"), false, "a page is not");
is(isMarkdownFile("/llms.txt"), false, "and neither is llms.txt");
is(isMarkdownFile("/notes.md.html"), false, "nor a path that merely contains .md");

console.log("\n  Which address does a twin call canonical?\n");
const c = (href) => canonicalFor(new URL(href));
is(c("https://lukotta.com/de/"), "https://lukotta.com/de/", "a page is its own canonical");
is(c("https://lukotta.com/?utm_source=x"), "https://lukotta.com/",
   "a campaign parameter is not part of the address");
is(c("https://www.lukotta.com/de/"), "https://lukotta.com/de/",
   "www points at the apex, which is what the pages canonicalise to");
is(c("https://www.lukotta.com/?a=1#b"), "https://lukotta.com/",
   "query and fragment both go");

console.log(failed ? `\n  ${failed} failed\n` : "\n  All passed\n");
process.exit(failed ? 1 : 0);
