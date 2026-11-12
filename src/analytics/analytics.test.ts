import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryStorage } from '../game/persistence';
import { createGameStore } from '../game/store';
import { resetDedupe } from './dedupe';
import { track } from './analytics';

beforeEach(() => {
  resetDedupe();
  window.dataLayer = [];
});

async function play(sessionId: string) {
  const storage = createMemoryStorage();
  const useStore = createGameStore({
    storage,
    rng: () => 0,
    sessionId,
  });
  await useStore.persist.rehydrate();
  const state = useStore.getState();
  state.startDraw();
  state.finishDraw();
  state.prepare();
  state.selectOutfit('wedding');
  state.confirmOutfit();
  state.openSkill();
  state.selectSkill('bullseye');
  state.confirmSkill();
  state.revealScore();
  state.acceptGift();
  state.selectItem('flask');
  state.confirmItem();
  state.selectStrategy('risk');
  state.confirmStrategy();
  return { useStore, storage };
}

function names(): string[] {
  return (window.dataLayer ?? []).map((entry) => String(entry.event));
}

describe('analytics', () => {
  it('sends the play path once, ignores a reload, and throttles a double tap', async () => {
    const { storage } = await play('analytics-session');
    expect(names()).toEqual([
      'draw_start',
      'district_assigned',
      'outfit_selected',
      'skill_selected',
      'sponsor_score_shown',
      'item_selected',
      'strategy_selected',
      'game_completed',
    ]);

    const reloaded = createGameStore({
      storage,
      rng: () => 0,
      sessionId: 'analytics-session',
    });
    await reloaded.persist.rehydrate();
    expect(reloaded.getState().screen).toBe('result');
    expect(names()).toEqual([
      'draw_start',
      'district_assigned',
      'outfit_selected',
      'skill_selected',
      'sponsor_score_shown',
      'item_selected',
      'strategy_selected',
      'game_completed',
    ]);

    track('share_click', { attempt: 1 });
    track('share_click', { attempt: 1 });
    expect(names().filter((name) => name === 'share_click')).toEqual(['share_click']);
  });

  it('sends landing_view once per page load', () => {
    track('landing_view', { attempt: 1 });
    track('landing_view', { attempt: 1 });
    expect(names()).toEqual(['landing_view']);
  });

  it('keeps a replay on a new attempt', async () => {
    const { useStore } = await play('analytics-replay');
    useStore.getState().endTransition();
    useStore.getState().replay();
    useStore.getState().startDraw();
    useStore.getState().finishDraw();
    useStore.getState().prepare();
    useStore.getState().selectOutfit('fire');
    useStore.getState().confirmOutfit();
    useStore.getState().openSkill();
    useStore.getState().selectSkill('bullseye');
    useStore.getState().confirmSkill();
    useStore.getState().revealScore();
    useStore.getState().acceptGift();
    useStore.getState().selectItem('rope');
    useStore.getState().confirmItem();
    useStore.getState().selectStrategy('careful');
    useStore.getState().confirmStrategy();
    expect(names()).toEqual([
      'draw_start',
      'district_assigned',
      'outfit_selected',
      'skill_selected',
      'sponsor_score_shown',
      'item_selected',
      'strategy_selected',
      'game_completed',
      'replay_click',
      'draw_start',
      'district_assigned',
      'outfit_selected',
      'skill_selected',
      'sponsor_score_shown',
      'item_selected',
      'strategy_selected',
      'game_completed',
    ]);
    const completed = (window.dataLayer ?? []).filter((entry) => entry.event === 'game_completed');
    expect(completed.map((entry) => entry.attempt)).toEqual([1, 2]);
    expect(completed[0]?.result).toBe('daredevil');
    expect(completed[1]?.result).toBe('tactician');
  });
});
