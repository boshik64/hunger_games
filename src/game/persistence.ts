import type { ItemId, Screen, StrategyId } from './types';

export const STORAGE_KEY = 'kg:v1';
export const PERSIST_VERSION = 1;

export interface PersistedSlice {
  screen: Screen;
  district: number | null;
  drawn: boolean;
  item: ItemId | null;
  strategy: StrategyId | null;
  attempt: number;
  completedAttempts: number[];
  activeTimeMs: number;
  sessionId: string;
}

interface PersistedRecord extends PersistedSlice {
  v: 1;
}

export function createSessionId(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

export function createMemoryStorage(initial?: Record<string, string>): Storage {
  const map = new Map<string, string>(Object.entries(initial ?? {}));
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isScreen(value: unknown): value is Screen {
  return value === 'draw' || value === 'item' || value === 'strategy' || value === 'result';
}

function isItem(value: unknown): value is ItemId {
  return value === 'flask' || value === 'rope' || value === 'medkit';
}

function isStrategy(value: unknown): value is StrategyId {
  return value === 'risk' || value === 'careful';
}

function isDistrict(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 12)
  );
}

function isAttemptList(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => typeof entry === 'number' && Number.isInteger(entry) && entry >= 1)
  );
}

function recover(slice: PersistedSlice): PersistedSlice {
  const next: PersistedSlice = {
    ...slice,
    completedAttempts: slice.completedAttempts.slice(),
  };

  // Reload in the middle of the draw: the district was already chosen.
  if (next.district != null) next.drawn = true;

  if (next.drawn && next.district == null) {
    next.drawn = false;
    next.screen = 'draw';
  }

  if (next.screen !== 'draw' && next.district == null) {
    next.screen = 'draw';
    next.drawn = false;
  }

  if (next.screen === 'result' && (next.item == null || next.strategy == null)) {
    next.screen = 'item';
  }

  if (next.screen === 'strategy' && next.item == null) {
    next.screen = 'item';
  }

  if (!next.drawn && next.screen !== 'draw') {
    next.screen = 'draw';
  }

  return next;
}

/** Returns null when the payload is missing or the schema does not match. */
export function parsePersisted(raw: string | null): PersistedSlice | null {
  if (raw == null) return null;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(data) || data.v !== PERSIST_VERSION) return null;
  if (!isScreen(data.screen) || !isDistrict(data.district) || typeof data.drawn !== 'boolean') {
    return null;
  }
  if (!(data.item === null || isItem(data.item))) return null;
  if (!(data.strategy === null || isStrategy(data.strategy))) return null;
  if (typeof data.attempt !== 'number' || !Number.isInteger(data.attempt) || data.attempt < 1) {
    return null;
  }
  if (!isAttemptList(data.completedAttempts)) return null;
  if (
    typeof data.activeTimeMs !== 'number' ||
    !Number.isFinite(data.activeTimeMs) ||
    data.activeTimeMs < 0
  ) {
    return null;
  }
  if (typeof data.sessionId !== 'string' || data.sessionId.length < 8) return null;

  return recover({
    screen: data.screen,
    district: data.district,
    drawn: data.drawn,
    item: data.item,
    strategy: data.strategy,
    attempt: data.attempt,
    completedAttempts: data.completedAttempts.slice(),
    activeTimeMs: data.activeTimeMs,
    sessionId: data.sessionId,
  });
}

export function serializePersisted(slice: PersistedSlice): string {
  const record: PersistedRecord = {
    v: PERSIST_VERSION,
    screen: slice.screen,
    district: slice.district,
    drawn: slice.drawn,
    item: slice.item,
    strategy: slice.strategy,
    attempt: slice.attempt,
    completedAttempts: slice.completedAttempts.slice(),
    activeTimeMs: slice.activeTimeMs,
    sessionId: slice.sessionId,
  };
  return JSON.stringify(record);
}
