const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../dist");
const types = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".ttf": "font/ttf",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
};
http
  .createServer((req, res) => {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    let file = path.resolve(root, "." + pathname);
    if (!file.startsWith(root + path.sep)) file = path.join(root, "index.html");
    if (!fs.existsSync(file) || !fs.statSync(file).isFile())
      file = path.join(root, "index.html");
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(4173, "127.0.0.1");
