import { allowEvent } from './dedupe';
import type { AnalyticsEvent, AnalyticsParams } from './events';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track(
  name: AnalyticsEvent,
  params: AnalyticsParams = {},
  sessionId = 'page',
): void {
  if (typeof window === 'undefined') return;
  const attempt = params.attempt ?? 1;
  if (!allowEvent(name, sessionId, attempt)) return;
  const payload = { event: name, ...params };
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
  if (import.meta.env.VITE_ANALYTICS_DEBUG === 'true' && import.meta.env.MODE !== 'test') {
    console.table(payload);
  }
}
