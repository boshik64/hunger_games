const KEY = 'kg:stats:v1';
const LIMIT = 1000;

interface StatsFile {
  counts: Record<string, number>;
  events: Array<{ name: string; screen: string; at: string }>;
}

function empty(): StatsFile {
  return { counts: {}, events: [] };
}

export function countClick(name: string, screen: string): void {
  if (typeof window === 'undefined') return;
  const at = new Date().toISOString();
  let data = empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) data = { ...empty(), ...JSON.parse(raw) };
  } catch {
    data = empty();
  }
  data.counts[name] = (data.counts[name] ?? 0) + 1;
  data.events.push({ name, screen, at });
  if (data.events.length > LIMIT) data.events.splice(0, data.events.length - LIMIT);
  localStorage.setItem(KEY, JSON.stringify(data));
  void fetch('/api/stats', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, screen, at }),
    keepalive: true,
  }).catch(() => undefined);
}
