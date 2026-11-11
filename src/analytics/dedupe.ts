import { CLICK_EVENTS, STEP_EVENTS, type AnalyticsEvent } from './events';

const steps = new Set<string>(STEP_EVENTS);
const clicks = new Set<string>(CLICK_EVENTS);
const sent = new Set<string>();
const lastClick = new Map<string, number>();
let landingSent = false;

export function resetDedupe(): void {
  sent.clear();
  lastClick.clear();
  landingSent = false;
}

export function allowEvent(
  name: AnalyticsEvent,
  sessionId: string,
  attempt: number,
  now = Date.now(),
): boolean {
  if (name === 'landing_view') {
    if (landingSent) return false;
    landingSent = true;
    return true;
  }
  if (steps.has(name)) {
    const key = `${sessionId}:${attempt}:${name}`;
    if (sent.has(key)) return false;
    sent.add(key);
    return true;
  }
  if (clicks.has(name)) {
    const previous = lastClick.get(name) ?? 0;
    if (now - previous < 500) return false;
    lastClick.set(name, now);
    return true;
  }
  return true;
}
