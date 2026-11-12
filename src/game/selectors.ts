import { ru } from '../content/ru';
import { resolveResult, type ResultEntry } from '../content/results';
import type { CharacteristicId, ItemId, Screen, StrategyId } from './types';

export function selectResult(item: ItemId | null, strategy: StrategyId | null): ResultEntry | null {
  if (item == null || strategy == null) return null;
  return resolveResult(item, strategy);
}

export function selectCharacteristic(id: CharacteristicId) {
  return ru.characteristics[id];
}

export function selectStep(screen: Screen): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  switch (screen) {
    case 'draw':
      return 1;
    case 'outfit':
      return 2;
    case 'skill':
      return 3;
    case 'score':
      return 4;
    case 'item':
      return 5;
    case 'strategy':
      return 6;
    case 'result':
      return 7;
  }
}

export function selectProgressLabel(screen: Screen): string {
  return ru.service.progressStep(selectStep(screen));
}
