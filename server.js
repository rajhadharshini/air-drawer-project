const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function resolveFilePath(requestUrl) {
  const cleanedUrl = (requestUrl || '/').split('?')[0];
  const relativePath = cleanedUrl === '/' ? '/index.html' : cleanedUrl;

  try {
    const safePath = decodeURIComponent(relativePath);
    const absolutePath = path.join(__dirname, safePath);

    if (!absolutePath.startsWith(__dirname)) {
      return null;
    }

    return absolutePath;
  } catch (error) {
    return null;
  }
}

const server = http.createServer((req, res) => {
  const filePath = resolveFilePath(req.url);

  if (!filePath) {
    res.statusCode = 403;
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end(`File not found: ${req.url}`);
      return;
    }

    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      res.statusCode = 500;
      res.end('Internal Server Error');
    });
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('\n==================================================');
  console.log('🚀 Air Drawer Server is running!');
  console.log(`👉 Open in your browser: http://localhost:${PORT}`);
  console.log('==================================================\n');
});
