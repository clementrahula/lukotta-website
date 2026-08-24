#!/usr/bin/env node
/* Local preview of public/. Not used in deployment. */
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
  ".svg": "image/svg+xml",
};

createServer(async (req, res) => {
  let path = join(OUT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  try {
    if ((await stat(path)).isDirectory()) path = join(path, "index.html");
  } catch { path = join(OUT, "404.html"); }
  try {
    const body = await readFile(path);
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    res.end(await readFile(join(OUT, "404.html")).catch(() => "Not found"));
  }
}).listen(PORT, () => console.log(`  lukotta.com preview → http://localhost:${PORT}`));
