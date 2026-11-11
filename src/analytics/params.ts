import { resolveResult } from '../content/results';
import type { GameState } from '../game/types';
import type { AnalyticsParams } from './events';

export function eventParams(
  state: Pick<GameState, 'district' | 'item' | 'strategy' | 'attempt'>,
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
  };
}
