export type StatsAuthError =
  | 'bad_captcha'
  | 'bad_password'
  | 'locked'
  | 'unconfigured'
  | 'network'
  | 'invalid_json';

export interface StatsCaptcha {
  id: string;
  challenge: string;
}

export interface StatsDashboard {
  clicks: {
    counts: Record<string, number>;
    events: Array<{ name: string; screen: string; at: string }>;
  };
  participants: Array<{ code: string; at: string; ua: string }>;
}

async function readJson(response: Response): Promise<Record<string, unknown> | null> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return null;
  return (await response.json().catch(() => null)) as Record<string, unknown> | null;
}

export async function fetchStatsCaptcha(): Promise<StatsCaptcha | null> {
  try {
    const response = await fetch('/api/stats/captcha', { headers: { accept: 'application/json' } });
    const data = await readJson(response);
    if (!response.ok || !data || typeof data.id !== 'string' || typeof data.challenge !== 'string') {
      return null;
    }
    return { id: data.id, challenge: data.challenge };
  } catch {
    return null;
  }
}

export async function loginStats(input: {
  password: string;
  captchaId: string;
  captchaAnswer: string;
}): Promise<{ ok: true } | { ok: false; error: StatsAuthError }> {
  try {
    const response = await fetch('/api/stats/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await readJson(response);
    if (!data) return { ok: false, error: 'network' };
    if (response.ok && data.ok === true) return { ok: true };
    const error = data.error;
    if (
      error === 'bad_captcha' ||
      error === 'bad_password' ||
      error === 'locked' ||
      error === 'unconfigured' ||
      error === 'invalid_json'
    ) {
      return { ok: false, error };
    }
    return { ok: false, error: 'network' };
  } catch {
    return { ok: false, error: 'network' };
  }
}

export async function loadStats(): Promise<StatsDashboard | null | 'network'> {
  try {
    const response = await fetch('/api/stats', { headers: { accept: 'application/json' } });
    if (response.status === 401) return null;
    const data = await readJson(response);
    if (!response.ok || !data || !data.clicks || !Array.isArray(data.participants)) return 'network';
    const clicks = data.clicks as StatsDashboard['clicks'];
    return {
      clicks: {
        counts: clicks.counts ?? {},
        events: Array.isArray(clicks.events) ? clicks.events : [],
      },
      participants: data.participants as StatsDashboard['participants'],
    };
  } catch {
    return 'network';
  }
}

export async function logoutStats(): Promise<void> {
  try {
    await fetch('/api/stats/session', { method: 'DELETE' });
  } catch {
    // The form still returns even if the cookie clear did not reach the server.
  }
}
