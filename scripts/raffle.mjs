import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

const root = join(dirname(dirname(fileURLToPath(import.meta.url))));
export const raffleFile = join(root, 'raffle-participants.json');

const CAPTCHA_TTL_MS = 5 * 60 * 1000;
const challenges = new Map();

function pruneChallenges(now = Date.now()) {
  for (const [id, entry] of challenges) {
    if (entry.expiresAt <= now) challenges.delete(id);
  }
}

export function normalizeCode(raw) {
  return String(raw ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function isValidCode(code) {
  return /^[A-Z0-9]{7}$/.test(code);
}

function emptyStore() {
  return { entries: [] };
}

export function readStore() {
  try {
    const data = JSON.parse(readFileSync(raffleFile, 'utf8'));
    if (!data || !Array.isArray(data.entries)) return emptyStore();
    return { entries: data.entries };
  } catch {
    return emptyStore();
  }
}

function writeStore(data) {
  mkdirSync(dirname(raffleFile), { recursive: true });
  writeFileSync(raffleFile, `${JSON.stringify(data, null, 2)}\n`);
}

export function createCaptcha() {
  pruneChallenges();
  const a = 2 + Math.floor(Math.random() * 8);
  const b = 1 + Math.floor(Math.random() * 9);
  const id = randomBytes(8).toString('hex');
  challenges.set(id, {
    answer: String(a + b),
    expiresAt: Date.now() + CAPTCHA_TTL_MS,
  });
  return { id, challenge: `${a} + ${b}` };
}

function consumeCaptcha(id, answer) {
  pruneChallenges();
  const entry = challenges.get(String(id ?? ''));
  if (!entry) return false;
  challenges.delete(String(id));
  return String(answer ?? '').trim() === entry.answer;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8') || '{}';
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

/**
 * Handles /api/raffle and /api/raffle/captcha. Returns true if handled.
 */
export async function handleRaffleRequest(req, res) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (path === '/api/raffle/captcha' && req.method === 'GET') {
    sendJson(res, 200, createCaptcha());
    return true;
  }

  if (path === '/api/raffle' && req.method === 'POST') {
    let body;
    try {
      body = await readBody(req);
    } catch {
      sendJson(res, 400, { ok: false, error: 'invalid_json' });
      return true;
    }

    if (!consumeCaptcha(body.captchaId, body.captchaAnswer)) {
      sendJson(res, 400, { ok: false, error: 'bad_captcha' });
      return true;
    }

    const code = normalizeCode(body.code);
    if (!isValidCode(code)) {
      sendJson(res, 400, { ok: false, error: 'bad_code' });
      return true;
    }

    const store = readStore();
    if (store.entries.some((entry) => entry.code === code)) {
      sendJson(res, 409, { ok: false, error: 'duplicate' });
      return true;
    }

    store.entries.push({
      code,
      at: new Date().toISOString(),
      ua: String(req.headers['user-agent'] ?? '').slice(0, 240),
    });
    writeStore(store);
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (path === '/api/raffle' || path.startsWith('/api/raffle/')) {
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    return true;
  }

  return false;
}
