#!/usr/bin/env node
/* SPDX-License-Identifier: GPL-3.0-or-later
   Copyright (C) 2026 Clement Rahula

   Tell IndexNow which pages changed.

     node scripts/indexnow.mjs [--dry-run]

   Google and Bing both find the sitemap on their own, eventually. IndexNow is
   how a site says "this changed, now" rather than waiting to be asked: Bing,
   Yandex, Seznam and Naver share one submission, and Google does not
   participate at all -- so this is in addition to Search Console, never
   instead of it.

   Ownership is proved by a key file at the site root, which the build writes
   from the same string it sends here. The key is not a secret; being publicly
   readable is the mechanism.

   The URLs come from the sitemap the build has just written rather than from a
   list kept here, because a list kept here would be a second place to add a
   language to, and the one nobody remembers.

   A failure is reported and does not fail the build. Nothing about the site is
   wrong if a search engine was busy, and a deploy that rolls back because a
   third party returned 500 is worse than one that says so and carries on. */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(readFileSync(join(ROOT, "site.config.json"), "utf8"));
const dryRun = process.argv.includes("--dry-run");

const ENDPOINT = "https://api.indexnow.org/IndexNow";

if (!cfg.indexNowKey) {
  console.log("  no indexNowKey in site.config.json; nothing to submit");
  process.exit(0);
}

const sitemap = join(ROOT, "public", "sitemap.xml");
if (!existsSync(sitemap)) {
  console.error("error: no public/sitemap.xml — run the build first");
  process.exit(1);
}

/* Only <loc>, not the hreflang alternates beside it: every alternate is some
   other entry's own <loc>, and submitting each page once per language it has
   an alternate for would send the same 37 pages 37 times. */
const urls = [...readFileSync(sitemap, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].trim())
  .filter(Boolean);

const host = new URL(cfg.domain).host;
const foreign = urls.filter((u) => new URL(u).host !== host);
if (foreign.length) {
  console.error(`error: ${foreign.length} sitemap URLs are not on ${host}`);
  console.error(`       IndexNow rejects a submission naming another host: ${foreign[0]}`);
  process.exit(1);
}

if (!urls.length) {
  console.error("error: the sitemap declares no URLs");
  process.exit(1);
}

const body = {
  host,
  key: cfg.indexNowKey,
  keyLocation: `${cfg.domain}/${cfg.indexNowKey}.txt`,
  urlList: urls,
};

console.log(`  ${urls.length} URLs on ${host}`);
console.log(`  key at ${body.keyLocation}`);

if (dryRun) {
  console.log("  --dry-run: not submitted");
  process.exit(0);
}

/* 200 accepted; 202 accepted but the key has not been checked yet, which is
   normal on a first submission. Both are success. */
try {
  const reply = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const said = (await reply.text()).trim();
  if (reply.status === 200 || reply.status === 202) {
    console.log(`  submitted, ${reply.status}${said ? ` — ${said}` : ""}`);
  } else {
    /* Named, because the codes mean particular things: 403 is a key that does
       not match the file, 422 a URL that is not on this host, 429 too often. */
    console.error(`  IndexNow answered ${reply.status}${said ? ` — ${said}` : ""}`);
    console.error("  403 = the key file does not match; 422 = a URL is off-host;"
      + " 429 = submitted too often");
  }
} catch (e) {
  console.error(`  IndexNow could not be reached: ${e.message}`);
}
