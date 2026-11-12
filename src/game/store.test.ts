import { describe, expect, it } from 'vitest';
import { createMemoryStorage, STORAGE_KEY, serializePersisted } from './persistence';
import { selectProgressLabel, selectResult, selectStep } from './selectors';
import { createGameStore } from './store';

async function setup(raw?: string) {
  const storage = createMemoryStorage();
  if (raw) storage.setItem(STORAGE_KEY, raw);
  const useStore = createGameStore({
    storage,
    rng: () => 0,
    sessionId: 'session-1',
  });
  await useStore.persist.rehydrate();
  return { useStore, storage };
}

describe('game store', () => {
  it('draws once, then moves through both choices to the result', async () => {
    const { useStore } = await setup();

    expect(useStore.getState().prepare()).toBeUndefined();
    expect(useStore.getState().screen).toBe('draw');

    useStore.getState().startDraw();
    expect(useStore.getState().district).toBe(1);
    expect(useStore.getState().isDrawing).toBe(true);
    expect(useStore.getState().drawn).toBe(false);

    useStore.getState().startDraw();
    useStore.getState().prepare();
    expect(useStore.getState().isDrawing).toBe(true);
    expect(useStore.getState().screen).toBe('draw');

    useStore.getState().finishDraw();
    expect(useStore.getState().drawn).toBe(true);
    expect(useStore.getState().isDrawing).toBe(false);
    useStore.getState().finishDraw();
    useStore.getState().startDraw();
    expect(useStore.getState().isDrawing).toBe(false);

    useStore.getState().prepare();
    expect(useStore.getState().screen).toBe('outfit');
    useStore.getState().selectOutfit('wedding');
    useStore.getState().confirmOutfit();
    expect(useStore.getState().outfit).toBe('wedding');
    useStore.getState().openSkill();
    expect(useStore.getState().screen).toBe('skill');
    expect(useStore.getState().offeredSkills).toEqual(['bullseye', 'vanish', 'mockingjay']);
    useStore.getState().selectSkill('bullseye');
    useStore.getState().confirmSkill();
    expect(useStore.getState().score).toBe(8);
    useStore.getState().revealScore();
    expect(useStore.getState().screen).toBe('score');
    useStore.getState().acceptGift();
    expect(useStore.getState().screen).toBe('item');
    useStore.getState().confirmItem();
    expect(useStore.getState().screen).toBe('item');
    expect(useStore.getState().item).toBeNull();

    useStore.getState().selectItem('rope');
    useStore.getState().selectItem('flask');
    expect(useStore.getState().screen).toBe('item');
    expect(useStore.getState().item).toBeNull();
    expect(useStore.getState().pendingItem).toBe('flask');

    useStore.getState().confirmItem();
    expect(useStore.getState().screen).toBe('strategy');
    expect(useStore.getState().item).toBe('flask');
    expect(useStore.getState().pendingItem).toBeNull();

    useStore.getState().confirmStrategy();
    expect(useStore.getState().screen).toBe('strategy');
    useStore.getState().selectStrategy('careful');
    useStore.getState().selectStrategy('risk');
    expect(useStore.getState().strategy).toBeNull();

    useStore.getState().confirmStrategy();
    expect(useStore.getState().screen).toBe('result');
    expect(useStore.getState().strategy).toBe('risk');
    expect(useStore.getState().isTransitioning).toBe(true);
    expect(useStore.getState().completedAttempts).toEqual([1]);
    expect(
      selectResult(useStore.getState().item, useStore.getState().strategy)?.characteristic,
    ).toBe('daredevil');

    useStore.getState().selectStrategy('careful');
    useStore.getState().replay();
    expect(useStore.getState().strategy).toBe('risk');
    expect(useStore.getState().screen).toBe('result');

    useStore.getState().endTransition();
    expect(useStore.getState().isTransitioning).toBe(false);

    useStore.getState().addActiveTime(250);
    useStore.getState().addActiveTime(0);
    useStore.getState().addActiveTime(Number.NaN);
    expect(useStore.getState().activeTimeMs).toBe(250);

    useStore.getState().replay();
    expect(useStore.getState().screen).toBe('draw');
    expect(useStore.getState().attempt).toBe(2);
    expect(useStore.getState().district).toBeNull();
    expect(useStore.getState().drawn).toBe(false);
    expect(useStore.getState().outfit).toBeNull();
    expect(useStore.getState().skill).toBeNull();
    expect(useStore.getState().score).toBeNull();
    expect(useStore.getState().item).toBeNull();
    expect(useStore.getState().strategy).toBeNull();
    expect(useStore.getState().activeTimeMs).toBe(0);
    expect(useStore.getState().completedAttempts).toEqual([1]);
    expect(selectStep('item')).toBe(5);
    expect(selectProgressLabel('result')).toBe('Шаг 7 из 7');
  });

  it('does not persist the draw animation or an unconfirmed card', async () => {
    const { useStore, storage } = await setup();
    useStore.getState().startDraw();
    useStore.getState().finishDraw();
    useStore.getState().prepare();
    useStore.getState().selectOutfit('suit');
    useStore.getState().confirmOutfit();
    useStore.getState().openSkill();
    useStore.getState().selectSkill('bullseye');
    useStore.getState().confirmSkill();
    useStore.getState().revealScore();
    useStore.getState().acceptGift();
    useStore.getState().selectItem('medkit');

    const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as Record<string, unknown>;
    expect(saved.district).toBe(1);
    expect(saved.screen).toBe('item');
    expect(saved.outfit).toBe('suit');
    expect(saved.skill).toBe('bullseye');
    expect(saved.score).toBe(8);
    expect(saved.item).toBeNull();
    expect(saved).not.toHaveProperty('pendingItem');
    expect(saved).not.toHaveProperty('isDrawing');
    expect(saved).not.toHaveProperty('isTransitioning');
  });

  it('restores a mid-draw reload as an already revealed district', async () => {
    const raw = serializePersisted({
      screen: 'draw',
      district: 9,
      drawn: false,
      outfit: null,
      offeredSkills: [],
      skill: null,
      score: null,
      item: null,
      strategy: null,
      attempt: 2,
      completedAttempts: [1],
      activeTimeMs: 80,
      sessionId: 'session-9',
    });
    const { useStore } = await setup(raw);
    expect(useStore.getState().district).toBe(9);
    expect(useStore.getState().drawn).toBe(true);
    expect(useStore.getState().isDrawing).toBe(false);
    expect(useStore.getState().attempt).toBe(2);
    expect(useStore.getState().sessionId).toBe('session-9');
    expect(useStore.getState().pendingItem).toBeNull();
  });

  it('drops a payload from another schema and starts over', async () => {
    const { useStore, storage } = await setup(JSON.stringify({ v: 0, screen: 'result' }));
    expect(useStore.getState().screen).toBe('draw');
    expect(useStore.getState().district).toBeNull();
    expect(useStore.getState().sessionId).toBe('session-1');
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });
});
