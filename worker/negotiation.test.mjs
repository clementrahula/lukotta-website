/* The two decisions the worker makes per request, tested without deploying it.
   Both are pure functions of a header and a path, which is the whole reason
   they are written as pure functions: a worker sitting in front of an entire
   zone should not need a deploy to find out whether it answers a browser
   correctly. Run with: node worker/negotiation.test.mjs */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "index.js"), "utf8");
const { wantsMarkdown, twinFor } = await import(
  "data:text/javascript," +
    encodeURIComponent(
      src.slice(0, src.indexOf("export default")) +
        "\nexport { wantsMarkdown, twinFor };"
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

console.log("\n  Which file is the twin?\n");
is(twinFor("/"), "/index.md", "the root");
is(twinFor("/open-bitlocker-drive-on-mac/"), "/open-bitlocker-drive-on-mac/index.md", "a task page");
is(twinFor("/de/"), "/de/index.md", "a language root");
is(twinFor("/de"), "/de/index.md", "and the same without the trailing slash");
is(twinFor("/sitemap.xml"), null, "a file the build wrote deliberately is left alone");
is(twinFor("/llms.txt"), null, "llms.txt is already markdown and is left alone");
is(twinFor("/styles.abc123.css"), null, "an asset is left alone");

console.log(failed ? `\n  ${failed} failed\n` : "\n  All passed\n");
process.exit(failed ? 1 : 0);
