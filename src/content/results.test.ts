import { describe, expect, it } from 'vitest';
import { RESULTS, resolveResult } from './results';
import type { ItemId, StrategyId } from '../game/types';

const CASES: Array<{
  item: ItemId;
  strategy: StrategyId;
  characteristic: 'strategist' | 'daredevil' | 'tactician' | 'survivor';
  explanation: string;
}> = [
  {
    item: 'flask',
    strategy: 'careful',
    characteristic: 'survivor',
    explanation: 'Ты выбрал долгий путь. Запас воды помог сохранить силы и добраться до укрытия.',
  },
  {
    item: 'flask',
    strategy: 'risk',
    characteristic: 'daredevil',
    explanation: 'Ты рискнул и преодолел овраг. В укрытии запас воды помог восстановить силы.',
  },
  {
    item: 'rope',
    strategy: 'careful',
    characteristic: 'tactician',
    explanation:
      'Ты пошёл через лес и использовал верёвку, чтобы спуститься по крутому склону к укрытию.',
  },
  {
    item: 'rope',
    strategy: 'risk',
    characteristic: 'daredevil',
    explanation: 'Ты выбрал короткий путь. Верёвка помогла преодолеть овраг и уйти от тумана.',
  },
  {
    item: 'medkit',
    strategy: 'careful',
    characteristic: 'strategist',
    explanation:
      'Ты выбрал обход и вовремя обработал царапины от колючих ветвей. Подготовка оправдалась.',
  },
  {
    item: 'medkit',
    strategy: 'risk',
    characteristic: 'survivor',
    explanation: 'Переход через овраг обернулся ушибом, но аптечка помогла продолжить путь.',
  },
];

describe('RESULTS', () => {
  it('covers exactly the six combinations', () => {
    expect(Object.keys(RESULTS).sort()).toEqual([
      'flask:careful',
      'flask:risk',
      'medkit:careful',
      'medkit:risk',
      'rope:careful',
      'rope:risk',
    ]);
  });

  it.each(CASES)(
    '$item + $strategy → $characteristic',
    ({ item, strategy, characteristic, explanation }) => {
      expect(resolveResult(item, strategy)).toEqual({ characteristic, explanation });
    },
  );

  it('returns the same output for the same input, 100 times', () => {
    for (const entry of CASES) {
      const first = resolveResult(entry.item, entry.strategy);
      for (let i = 0; i < 100; i += 1) {
        expect(resolveResult(entry.item, entry.strategy)).toEqual(first);
      }
    }
  });
});
