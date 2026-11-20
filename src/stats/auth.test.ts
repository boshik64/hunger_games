import { afterEach, describe, expect, it } from 'vitest';
// @ts-expect-error the handler is JavaScript and has no declaration
import { handleStatsRequest } from '../../scripts/stats.mjs';

const env = (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process
  .env;
const previous = env.STATS_PASSWORD;

afterEach(() => {
  if (previous == null) delete env.STATS_PASSWORD;
  else env.STATS_PASSWORD = previous;
});

function response() {
  const headers: Record<string, string> = {};
  return {
    statusCode: 0,
    headers,
    body: '',
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
    },
    end(payload?: string) {
      this.body = payload ?? '';
    },
  };
}

function request(
  method: string,
  url: string,
  body?: unknown,
  headers: Record<string, string> = {},
) {
  const listeners: Record<string, Array<(chunk?: Uint8Array) => void>> = {};
  const req = {
    method,
    url,
    headers,
    socket: { remoteAddress: '203.0.113.10' },
    on(event: string, callback: (chunk?: Uint8Array) => void) {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(callback);
    },
  };
  queueMicrotask(() => {
    if (body !== undefined) {
      const bytes = new TextEncoder().encode(JSON.stringify(body));
      for (const callback of listeners.data ?? []) callback(bytes);
    }
    for (const callback of listeners.end ?? []) callback();
  });
  return req;
}

async function call(
  method: string,
  url: string,
  body?: unknown,
  headers: Record<string, string> = {},
) {
  const res = response();
  await handleStatsRequest(request(method, url, body, headers), res);
  return {
    status: res.statusCode,
    headers: res.headers,
    json: res.body ? (JSON.parse(res.body) as Record<string, unknown>) : null,
  };
}

function cookieOf(header: string | undefined) {
  const match = header?.match(/kg_stats=([^;]+)/);
  return match?.[1] ?? '';
}

describe('stats auth', () => {
  it('hides the dashboard until the password and captcha match', async () => {
    env.STATS_PASSWORD = 'open-the-gate';
    const ip = { 'x-forwarded-for': '198.51.100.20' };

    const closed = await call('GET', '/api/stats', undefined, ip);
    expect(closed.status).toBe(401);

    const openClick = await call('POST', '/api/stats', { name: '' }, ip);
    expect(openClick.status).toBe(400);

    const captcha = await call('GET', '/api/stats/captcha', undefined, ip);
    expect(captcha.status).toBe(200);

    const wrong = await call(
      'POST',
      '/api/stats/session',
      {
        password: 'open-the-gate',
        captchaId: captcha.json?.id,
        captchaAnswer: '0',
      },
      ip,
    );
    expect(wrong.status).toBe(400);
    expect(wrong.json).toMatchObject({ error: 'bad_captcha' });

    const next = await call('GET', '/api/stats/captcha', undefined, ip);
    const [left, right] = String(next.json?.challenge)
      .split(' + ')
      .map((part) => Number(part));
    const denied = await call(
      'POST',
      '/api/stats/session',
      {
        password: 'nope',
        captchaId: next.json?.id,
        captchaAnswer: String(left + right),
      },
      { 'x-forwarded-for': '198.51.100.21' },
    );
    expect(denied.status).toBe(401);
    expect(denied.json).toMatchObject({ error: 'bad_password' });

    const fresh = await call('GET', '/api/stats/captcha', undefined, ip);
    const [a, b] = String(fresh.json?.challenge)
      .split(' + ')
      .map((part) => Number(part));
    const allowed = await call(
      'POST',
      '/api/stats/session',
      {
        password: 'open-the-gate',
        captchaId: fresh.json?.id,
        captchaAnswer: String(a + b),
      },
      { 'x-forwarded-for': '198.51.100.22' },
    );
    expect(allowed.status).toBe(200);
    const token = cookieOf(allowed.headers['set-cookie']);
    expect(token).not.toBe('');

    const opened = await call('GET', '/api/stats', undefined, { cookie: `kg_stats=${token}` });
    expect(opened.status).toBe(200);
    expect(opened.json).toHaveProperty('clicks');
    expect(opened.json).toHaveProperty('participants');

    const gone = await call('DELETE', '/api/stats/session', undefined, {
      cookie: `kg_stats=${token}`,
    });
    expect(gone.status).toBe(200);
    const again = await call('GET', '/api/stats', undefined, { cookie: `kg_stats=${token}` });
    expect(again.status).toBe(401);
  });

  it('refuses entry when the server password is empty', async () => {
    env.STATS_PASSWORD = '';
    const captcha = await call('GET', '/api/stats/captcha');
    const [a, b] = String(captcha.json?.challenge)
      .split(' + ')
      .map((part) => Number(part));
    const result = await call(
      'POST',
      '/api/stats/session',
      {
        password: 'anything',
        captchaId: captcha.json?.id,
        captchaAnswer: String(a + b),
      },
      { 'x-forwarded-for': '198.51.100.30' },
    );
    expect(result.status).toBe(503);
    expect(result.json).toMatchObject({ error: 'unconfigured' });
  });
});
