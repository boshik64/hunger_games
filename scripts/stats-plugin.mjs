import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const file = join(dirname(dirname(fileURLToPath(import.meta.url))), 'data', 'clicks.json');

function read() {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return { counts: {}, events: [] };
  }
}

export default function statsPlugin() {
  return {
    name: 'click-stats',
    configureServer(server) {
      server.middlewares.use('/api/stats', (req, res) => {
        if (req.method === 'GET') {
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify(read()));
          return;
        }
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
          const data = read();
          const event = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
          const name = String(event.name ?? '');
          if (!name) {
            res.statusCode = 400;
            res.end();
            return;
          }
          data.counts[name] = (data.counts[name] ?? 0) + 1;
          data.events.push({
            name,
            screen: String(event.screen ?? ''),
            at: String(event.at ?? new Date().toISOString()),
          });
          if (data.events.length > 1000) data.events.splice(0, data.events.length - 1000);
          mkdirSync(dirname(file), { recursive: true });
          writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
        });
      });
    },
  };
}
