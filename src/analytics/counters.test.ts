import { beforeEach, describe, expect, it, vi } from 'vitest';
import { countClick } from './counters';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('ok')));
});

describe('click counters', () => {
  it('adds every click to the local log', () => {
    countClick('Вытянуть жребий', 'draw');
    countClick('Вытянуть жребий', 'draw');
    countClick('Фляга', 'item');
    const saved = JSON.parse(localStorage.getItem('kg:stats:v1') ?? '{}') as {
      counts: Record<string, number>;
      events: Array<{ name: string; screen: string }>;
    };
    expect(saved.counts['Вытянуть жребий']).toBe(2);
    expect(saved.counts['Фляга']).toBe(1);
    expect(saved.events.map((event) => event.screen)).toEqual(['draw', 'draw', 'item']);
  });
});
