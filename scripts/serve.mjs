import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleRaffleRequest } from './raffle.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const dist = join(root, 'dist');
const port = Number(process.env.PORT || 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
};

function safeJoin(base, requestPath) {
  const cleaned = normalize(decodeURIComponent(requestPath).split('?')[0]).replace(/^(\.\.[/\\])+/, '');
  const full = join(base, cleaned);
  if (!full.startsWith(base)) return null;
  return full;
}

function sendFile(res, filePath) {
  const type = types[extname(filePath)] ?? 'application/octet-stream';
  res.statusCode = 200;
  res.setHeader('content-type', type);
  res.end(readFileSync(filePath));
}

const server = createServer(async (req, res) => {
  if (await handleRaffleRequest(req, res)) return;

  const url = new URL(req.url ?? '/', `http://localhost:${port}`);
  let filePath = safeJoin(dist, url.pathname);
  if (!filePath) {
    res.statusCode = 400;
    res.end('Bad request');
    return;
  }

  try {
    const stats = statSync(filePath);
    if (stats.isDirectory()) filePath = join(filePath, 'index.html');
    sendFile(res, filePath);
    return;
  } catch {
    // SPA fallback for /reward and deep links
  }

  try {
    sendFile(res, join(dist, 'index.html'));
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Serving dist + raffle API on http://localhost:${port}`);
});
