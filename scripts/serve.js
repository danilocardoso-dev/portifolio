const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const port = Number(process.argv[2]) || 4173;
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

http.createServer((request, response) => {
  const pathname = decodeURIComponent(request.url.split("?")[0]);
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
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(data);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`Portfolio local: http://127.0.0.1:${port}`);
});
