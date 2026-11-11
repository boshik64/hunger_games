import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import type { ItemId, StrategyId } from './types';
import type { GameState, GameStore } from './types';
import { track } from '../analytics/analytics';
import { eventParams } from '../analytics/params';
import { drawDistrict, type Uint32Source } from './random';
import {
  STORAGE_KEY,
  PERSIST_VERSION,
  createMemoryStorage,
  createSessionId,
  parsePersisted,
  serializePersisted,
  type PersistedSlice,
} from './persistence';

export interface CreateGameStoreOptions {
  storage?: Storage;
  rng?: Uint32Source;
  sessionId?: string;
}

function createInitialState(sessionId: string): GameState {
  return {
    screen: 'draw',
    district: null,
    drawn: false,
    isDrawing: false,
    item: null,
    strategy: null,
    pendingItem: null,
    pendingStrategy: null,
    isTransitioning: false,
    sealDistrict: null,
    sealTick: 0,
    attempt: 1,
    completedAttempts: [],
    activeTimeMs: 0,
    sessionId,
  };
}

function pickPersisted(state: GameState): PersistedSlice {
  return {
    screen: state.screen,
    district: state.district,
    drawn: state.drawn,
    item: state.item,
    strategy: state.strategy,
    attempt: state.attempt,
    completedAttempts: state.completedAttempts,
    activeTimeMs: state.activeTimeMs,
    sessionId: state.sessionId,
  };
}

function createPersistStorage(backing: Storage): PersistStorage<PersistedSlice> {
  return {
    getItem: (name) => {
      const raw = backing.getItem(name);
      if (!raw) return null;
      const state = parsePersisted(raw);
      if (!state) {
        backing.removeItem(name);
        return null;
      }
      const value: StorageValue<PersistedSlice> = { state, version: PERSIST_VERSION };
      return value;
    },
    setItem: (name, value) => {
      backing.setItem(name, serializePersisted(value.state));
    },
    removeItem: (name) => {
      backing.removeItem(name);
    },
  };
}

function blocked(state: GameState): boolean {
  return state.isDrawing || state.isTransitioning;
}

function seal(state: GameState) {
  return {
    sealDistrict: state.district,
    sealTick: state.sealTick + 1,
  };
}

export function createGameStore(options: CreateGameStoreOptions = {}) {
  const backing =
    options.storage ??
    (typeof sessionStorage === 'undefined' ? createMemoryStorage() : sessionStorage);
  const sessionId = options.sessionId ?? createSessionId();

  return create<GameStore>()(
    persist(
      (set, get) => ({
        ...createInitialState(sessionId),

        startDraw: () => {
          const state = get();
          if (blocked(state) || state.screen !== 'draw' || state.drawn) return;
          const district = options.rng ? drawDistrict(options.rng) : drawDistrict();
          set({ isDrawing: true, district });
          const next = get();
          track('draw_start', eventParams(next), next.sessionId);
        },

        finishDraw: () => {
          const state = get();
          if (!state.isDrawing) return;
          set({ isDrawing: false, drawn: true });
          const next = get();
          track('district_assigned', eventParams(next), next.sessionId);
        },

        prepare: () => {
          const state = get();
          if (blocked(state) || state.screen !== 'draw' || !state.drawn) return;
          set({ screen: 'item', ...seal(state) });
        },

        selectItem: (item: ItemId) => {
          const state = get();
          if (blocked(state) || state.screen !== 'item') return;
          set({ pendingItem: item });
        },

        confirmItem: () => {
          const state = get();
          if (blocked(state) || state.screen !== 'item' || state.pendingItem == null) return;
          set({
            item: state.pendingItem,
            screen: 'strategy',
            pendingItem: null,
            ...seal(state),
          });
          const next = get();
          track('item_selected', eventParams(next), next.sessionId);
        },

        selectStrategy: (strategy: StrategyId) => {
          const state = get();
          if (blocked(state) || state.screen !== 'strategy') return;
          set({ pendingStrategy: strategy });
        },

        confirmStrategy: () => {
          const state = get();
          if (blocked(state) || state.screen !== 'strategy' || state.pendingStrategy == null) {
            return;
          }
          const completedAttempts = state.completedAttempts.includes(state.attempt)
            ? state.completedAttempts
            : [...state.completedAttempts, state.attempt];
          set({
            isTransitioning: true,
            strategy: state.pendingStrategy,
            screen: 'result',
            pendingStrategy: null,
            completedAttempts,
            ...seal(state),
          });
          const next = get();
          const payload = { ...eventParams(next), active_time_ms: next.activeTimeMs };
          track('strategy_selected', payload, next.sessionId);
          track('game_completed', payload, next.sessionId);
        },

        endTransition: () => {
          if (!get().isTransitioning) return;
          set({ isTransitioning: false });
        },

        replay: () => {
          const state = get();
          if (blocked(state) || state.screen !== 'result') return;
          track('replay_click', eventParams(state), state.sessionId);
          set({
            screen: 'draw',
            district: null,
            drawn: false,
            isDrawing: false,
            attempt: state.attempt + 1,
            item: null,
            strategy: null,
            pendingItem: null,
            pendingStrategy: null,
            activeTimeMs: 0,
            ...seal(state),
          });
        },

        addActiveTime: (ms: number) => {
          if (!Number.isFinite(ms) || ms <= 0) return;
          set({ activeTimeMs: get().activeTimeMs + ms });
        },
      }),
      {
        name: STORAGE_KEY,
        storage: createPersistStorage(backing),
        version: PERSIST_VERSION,
        skipHydration: true,
        partialize: (state) => pickPersisted(state),
        merge: (persisted, current) => {
          const slice = persisted as PersistedSlice | undefined;
          return {
            ...current,
            ...(slice ?? {}),
            isDrawing: false,
            isTransitioning: false,
            pendingItem: null,
            pendingStrategy: null,
          };
        },
      },
    ),
  );
}

export const useGameStore = createGameStore();
