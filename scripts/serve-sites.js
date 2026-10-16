const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'dist');
const port = Number(process.argv[2]) || 4174;
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(request.url.split('?')[0]); }
  catch { response.writeHead(400); response.end('Bad request'); return; }

  if (pathname === '/index.html') {
    response.writeHead(308, { Location: '/' });
    response.end();
    return;
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const filePath = path.resolve(root, relativePath);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403);
    response.end();
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(root, '404.html'), (notFoundError, notFoundPage) => {
        response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        response.end(request.method === 'HEAD' ? undefined : notFoundError ? 'Not found' : notFoundPage);
      });
      return;
    }

    response.writeHead(pathname === '/404.html' ? 404 : 200, {
      'Cache-Control': 'no-store',
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
    });
    response.end(request.method === 'HEAD' ? undefined : data);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Sites preview: http://127.0.0.1:${port}`);
});
