const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.argv[2]) || 4173;
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".png": "image/png",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(request.url.split("?")[0]); }
  catch { response.writeHead(400); response.end("Bad request"); return; }
  if (pathname === "/index.html") {
    response.writeHead(308, { Location: "/" + (request.url.includes("?") ? request.url.slice(request.url.indexOf("?")) : "") });
    response.end();
    return;
  }
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  const filePath = path.resolve(root, relativePath);
  const isInsideRoot = filePath === root || filePath.startsWith(`${root}${path.sep}`);

  if (!isInsideRoot) {
    response.writeHead(403);
    response.end();
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(root, "404.html"), (notFoundError, notFoundPage) => {
        response.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "no-store" });
        response.end(request.method === "HEAD" ? undefined : notFoundError ? "Not found" : notFoundPage);
      });
      return;
    }

    response.writeHead(pathname === "/404.html" ? 404 : 200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(request.method === "HEAD" ? undefined : data);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`Portfolio local: http://127.0.0.1:${port}`);
});
