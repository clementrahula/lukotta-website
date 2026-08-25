#!/usr/bin/env node
/* Local preview server for public/. Not used in deployment. */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const PORT = Number(process.env.PORT) || 4321;

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json", ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8", ".png": "image/png", ".webp": "image/webp",
  ".svg": "image/svg+xml", ".ico": "image/x-icon",
};

/* Answers as GitHub Pages does, so a check here means something. A missing
   path is a real 404, and a directory without the trailing slash redirects
   rather than being served in place. */
createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const pathname = decodeURIComponent(url.pathname);
  let path = join(OUT, pathname);

  let info = null;
  try { info = await stat(path); } catch { /* nothing there */ }

  if (info?.isDirectory()) {
    if (!pathname.endsWith("/")) {
      res.writeHead(301, { location: pathname + "/" + url.search });
      res.end();
      return;
    }
    path = join(path, "index.html");
  }

  try {
    const body = await readFile(path);
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    res.end(await readFile(join(OUT, "404.html")).catch(() => "Not found"));
  }
}).listen(PORT, () => console.log(`  lukotta.com preview → http://localhost:${PORT}`));
