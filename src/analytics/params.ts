import { resolveResult } from '../content/results';
import type { GameState } from '../game/types';
import type { AnalyticsParams } from './events';

export function eventParams(
  state: Pick<GameState, 'district' | 'item' | 'strategy' | 'attempt'> &
    Partial<Pick<GameState, 'outfit' | 'skill' | 'score'>>,
): AnalyticsParams {
  const result =
    state.item && state.strategy
      ? resolveResult(state.item, state.strategy).characteristic
      : null;
  return {
    district: state.district,
    item: state.item,
    strategy: state.strategy,
    result,
    attempt: state.attempt,
    outfit: state.outfit,
    skill: state.skill,
    score: state.score,
  };
}
