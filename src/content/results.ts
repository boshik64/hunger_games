import type { CharacteristicId, ItemId, StrategyId } from '../game/types';

export interface ResultEntry {
  characteristic: CharacteristicId;
  explanation: string;
}

export const RESULTS: Record<`${ItemId}:${StrategyId}`, ResultEntry> = {
  'flask:careful': {
    characteristic: 'survivor',
    explanation: 'Ты выбрал долгий путь. Запас воды помог сохранить силы и добраться до укрытия.',
  },
  'flask:risk': {
    characteristic: 'daredevil',
    explanation: 'Ты рискнул и преодолел овраг. В укрытии запас воды помог восстановить силы.',
  },
  'rope:careful': {
    characteristic: 'tactician',
    explanation:
      'Ты пошёл через лес и использовал верёвку, чтобы спуститься по крутому склону к укрытию.',
  },
  'rope:risk': {
    characteristic: 'daredevil',
    explanation: 'Ты выбрал короткий путь. Верёвка помогла преодолеть овраг и уйти от тумана.',
  },
  'medkit:careful': {
    characteristic: 'strategist',
    explanation:
      'Ты выбрал обход и вовремя обработал царапины от колючих ветвей. Подготовка оправдалась.',
  },
  'medkit:risk': {
    characteristic: 'survivor',
    explanation: 'Переход через овраг обернулся ушибом, но аптечка помогла продолжить путь.',
  },
};

export function resolveResult(item: ItemId, strategy: StrategyId): ResultEntry {
  return RESULTS[`${item}:${strategy}`];
}
