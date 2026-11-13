import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
export function startServer({
  directory = fileURLToPath(new URL("../dist/", import.meta.url)),
  port = Number(process.env.PORT || 4173),
  liveReload = false,
} = {}) {
  const root = path.resolve(directory);
  const version = (body) => createHash("sha256").update(body).digest("hex");
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".pdf": "application/pdf",
  };
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      if (liveReload && pathname === "/__dev/version") {
        const html = await readFile(path.join(root, "index.html"));
        res.writeHead(200, { "Content-Type": "text/plain", "Cache-Control": "no-store" });
        res.end(version(html));
        return;
      }
      let target = path.resolve(root, "." + pathname);
      if (target !== root && !target.startsWith(root + path.sep)) {
        res.writeHead(403).end();
        return;
      }
      if ((await stat(target)).isDirectory()) target = path.join(target, "index.html");
      let body = await readFile(target);
      if (liveReload && path.basename(target) === "index.html") {
        const reload = `<script>(()=>{const current=${JSON.stringify(version(body))};setInterval(async()=>{try{const r=await fetch('/__dev/version',{cache:'no-store'});if(r.ok&&(await r.text())!==current)location.reload();}catch{}},1000);})();</script>`;
        body = Buffer.from(body.toString("utf8").replace("</body>", `${reload}</body>`));
      }
      res.writeHead(200, {
        "Content-Type": types[path.extname(target)] || "application/octet-stream",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(body);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
    }
  });
  server.listen(port, "127.0.0.1", () =>
    console.log(`Local: http://127.0.0.1:${server.address().port}`),
  );
  return server;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = startServer();
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close());
}
