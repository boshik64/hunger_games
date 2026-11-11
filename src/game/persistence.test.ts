import { describe, expect, it } from 'vitest';
import { parsePersisted, serializePersisted, type PersistedSlice } from './persistence';

const base: PersistedSlice = {
  screen: 'draw',
  district: null,
  drawn: false,
  item: null,
  strategy: null,
  attempt: 1,
  completedAttempts: [],
  activeTimeMs: 0,
  sessionId: 'session-1',
};

describe('parsePersisted', () => {
  it('round-trips a valid slice', () => {
    const saved = serializePersisted({ ...base, screen: 'item', district: 4, drawn: true });
    expect(parsePersisted(saved)).toEqual({
      ...base,
      screen: 'item',
      district: 4,
      drawn: true,
    });
  });

  it('reveals a district that was saved mid-draw', () => {
    const saved = serializePersisted({ ...base, district: 7, drawn: false, activeTimeMs: 40 });
    expect(parsePersisted(saved)).toMatchObject({ district: 7, drawn: true, activeTimeMs: 40 });
  });

  it('sends a broken result back to the item screen', () => {
    expect(
      parsePersisted(serializePersisted({ ...base, screen: 'result', district: 3, drawn: true })),
    ).toMatchObject({ screen: 'item', district: 3 });

    expect(
      parsePersisted(
        serializePersisted({
          ...base,
          screen: 'result',
          district: 3,
          drawn: true,
          item: 'flask',
        }),
      ),
    ).toMatchObject({ screen: 'item', item: 'flask' });
  });

  it('sends a strategy without an item back to the item screen', () => {
    expect(
      parsePersisted(
        serializePersisted({
          ...base,
          screen: 'strategy',
          district: 2,
          drawn: true,
          strategy: 'risk',
        }),
      ),
    ).toMatchObject({ screen: 'item', strategy: 'risk' });
  });

  it('drops an incompatible or broken payload', () => {
    expect(parsePersisted(null)).toBeNull();
    expect(parsePersisted('not-json')).toBeNull();
    expect(
      parsePersisted(JSON.stringify({ ...JSON.parse(serializePersisted(base)), v: 2 })),
    ).toBeNull();
    expect(parsePersisted(serializePersisted({ ...base, district: 13 }))).toBeNull();
    expect(parsePersisted(JSON.stringify({ v: 1 }))).toBeNull();
  });
});
