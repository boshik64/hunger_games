import { randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readStore } from './raffle.mjs';

const root = join(dirname(dirname(fileURLToPath(import.meta.url))));
const file = join(root, 'data', 'clicks.json');
const LIMIT = 1000;
const COOKIE = 'kg_stats';
const SESSION_MS = 12 * 60 * 60 * 1000;
const CAPTCHA_TTL_MS = 5 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;

const sessions = new Map();
const challenges = new Map();
const failures = new Map();
let envLoaded = false;

function empty() {
  return { counts: {}, events: [] };
}

function ensureEnv() {
  if (envLoaded) return;
  envLoaded = true;
  let text = '';
  try {
    text = readFileSync(join(root, '.env'), 'utf8');
  } catch {
    return;
  }
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}

export function readClicks() {
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    return {
      counts: data?.counts && typeof data.counts === 'object' ? data.counts : {},
      events: Array.isArray(data?.events) ? data.events : [],
    };
  } catch {
    return empty();
  }
}

function writeClicks(data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function readParticipants() {
  return readStore()
    .entries.filter((entry) => entry && typeof entry.code === 'string')
    .map((entry) => ({
      code: entry.code,
      at: String(entry.at ?? ''),
      ua: String(entry.ua ?? ''),
    }));
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(body == null ? '' : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function prune(map, now = Date.now()) {
  for (const [key, entry] of map) {
    const expires = typeof entry === 'number' ? entry : entry.expiresAt ?? entry.until;
    if (expires <= now) map.delete(key);
  }
}

export function createStatsCaptcha() {
  prune(challenges);
  const a = 2 + Math.floor(Math.random() * 8);
  const b = 1 + Math.floor(Math.random() * 9);
  const id = randomBytes(8).toString('hex');
  challenges.set(id, { answer: String(a + b), expiresAt: Date.now() + CAPTCHA_TTL_MS });
  return { id, challenge: `${a} + ${b}` };
}

function consumeCaptcha(id, answer) {
  prune(challenges);
  const entry = challenges.get(String(id ?? ''));
  if (!entry) return false;
  challenges.delete(String(id));
  return String(answer ?? '').trim() === entry.answer;
}

function passwordStatus(input) {
  const expected = process.env.STATS_PASSWORD ?? '';
  if (!expected) return 'unconfigured';
  const given = Buffer.from(String(input ?? ''));
  const want = Buffer.from(expected);
  if (given.length !== want.length) {
    timingSafeEqual(want, want);
    return 'bad_password';
  }
  return timingSafeEqual(given, want) ? 'ok' : 'bad_password';
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] ?? '')
    .split(',')[0]
    .trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

function locked(ip) {
  const entry = failures.get(ip);
  if (!entry) return false;
  if (entry.until <= Date.now()) {
    failures.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function registerFailure(ip) {
  const now = Date.now();
  const current = failures.get(ip);
  const entry = !current || current.until <= now ? { count: 0, until: now + LOCK_MS } : current;
  entry.count += 1;
  entry.until = now + LOCK_MS;
  failures.set(ip, entry);
}

function readCookie(req) {
  const header = String(req.headers.cookie ?? '');
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() !== COOKIE) continue;
    return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return '';
}

function authed(req) {
  prune(sessions);
  const token = readCookie(req);
  if (!token) return false;
  const expires = sessions.get(token);
  if (!expires || expires <= Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function cookie(token, maxAge, req) {
  const secure = req.headers['x-forwarded-proto'] === 'https';
  const parts = [`${COOKIE}=${token}`, 'HttpOnly', 'SameSite=Lax', 'Path=/', `Max-Age=${maxAge}`];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function dashboard() {
  return { clicks: readClicks(), participants: readParticipants() };
}

async function login(req, res) {
  const ip = clientIp(req);
  if (locked(ip)) {
    sendJson(res, 429, { ok: false, error: 'locked' });
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    sendJson(res, 400, { ok: false, error: 'invalid_json' });
    return;
  }

  if (!consumeCaptcha(body.captchaId, body.captchaAnswer)) {
    registerFailure(ip);
    sendJson(res, 400, { ok: false, error: 'bad_captcha' });
    return;
  }

  const status = passwordStatus(body.password);
  if (status !== 'ok') {
    if (status === 'bad_password') registerFailure(ip);
    sendJson(res, status === 'unconfigured' ? 503 : 401, { ok: false, error: status });
    return;
  }

  failures.delete(ip);
  prune(sessions);
  const token = randomBytes(24).toString('hex');
  sessions.set(token, Date.now() + SESSION_MS);
  res.setHeader('set-cookie', cookie(token, SESSION_MS / 1000, req));
  sendJson(res, 200, { ok: true });
}

/** Handles /api/stats*. Returns true if the request was for this route. */
export async function handleStatsRequest(req, res) {
  ensureEnv();
  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (path !== '/api/stats' && !path.startsWith('/api/stats/')) return false;

  if (path === '/api/stats/captcha' && req.method === 'GET') {
    sendJson(res, 200, createStatsCaptcha());
    return true;
  }

  if (path === '/api/stats/session' && req.method === 'POST') {
    await login(req, res);
    return true;
  }

  if (path === '/api/stats/session' && req.method === 'DELETE') {
    const token = readCookie(req);
    if (token) sessions.delete(token);
    res.setHeader('set-cookie', cookie('', 0, req));
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (path === '/api/stats' && req.method === 'GET') {
    if (!authed(req)) {
      sendJson(res, 401, { ok: false, error: 'unauthorized' });
      return true;
    }
    sendJson(res, 200, dashboard());
    return true;
  }

  if (path === '/api/stats' && req.method === 'POST') {
    let event;
    try {
      event = await readBody(req);
    } catch {
      sendJson(res, 400, null);
      return true;
    }
    const name = String(event.name ?? '');
    if (!name) {
      sendJson(res, 400, null);
      return true;
    }
    const data = readClicks();
    data.counts[name] = (data.counts[name] ?? 0) + 1;
    data.events.push({
      name,
      screen: String(event.screen ?? ''),
      at: String(event.at ?? new Date().toISOString()),
    });
    if (data.events.length > LIMIT) data.events.splice(0, data.events.length - LIMIT);
    writeClicks(data);
    sendJson(res, 200, { ok: true });
    return true;
  }

  sendJson(res, 405, null);
  return true;
}
