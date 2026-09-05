// Serves the static export in `out/` — the artifact this project actually ships.
// `next start` refuses to run against an `output: "export"` build, so verification has to
// be pointed at the exported files rather than at a Next server.
// Temporary — deleted after the run.
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve("out");
const PORT = Number(process.argv[2] ?? 3100);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

/** `/contact` resolves to contact.html, `/` to index.html — the export's own layout. */
function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const candidates =
    clean === "/"
      ? ["index.html"]
      : [clean.slice(1), `${clean.slice(1)}.html`, path.join(clean.slice(1), "index.html")];
  for (const candidate of candidates) {
    const full = path.join(ROOT, candidate);
    if (!full.startsWith(ROOT)) continue;
    if (existsSync(full) && statSync(full).isFile()) return full;
  }
  return null;
}

createServer((req, res) => {
  const file = resolve(req.url);
  if (!file) {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    createReadStream(path.join(ROOT, "404.html")).pipe(res);
    return;
  }
  res.writeHead(200, {
    "content-type": TYPES[path.extname(file)] ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(res);
}).listen(PORT, "127.0.0.1", () => {
  process.stdout.write(`serving out/ on http://127.0.0.1:${PORT}\n`);
});
