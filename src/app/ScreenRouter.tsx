import { useEffect } from 'react';
import { DrawScreen } from '../screens/DrawScreen';
import { ItemScreen } from '../screens/ItemScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { StrategyScreen } from '../screens/StrategyScreen';
import { useGameStore } from '../game/store';
import { DistrictSpin } from './DistrictSpin';

export function ScreenRouter() {
  const screen = useGameStore((state) => state.screen);
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const endTransition = useGameStore((state) => state.endTransition);
  const sealTick = useGameStore((state) => state.sealTick);
  const sealDistrict = useGameStore((state) => state.sealDistrict);

  useEffect(() => {
    if (!isTransitioning) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => endTransition(), reduce ? 0 : 900);
    return () => window.clearTimeout(timeout);
  }, [isTransitioning, endTransition]);

  const step =
    screen === 'item' ? (
      <ItemScreen />
    ) : screen === 'strategy' ? (
      <StrategyScreen />
    ) : screen === 'result' ? (
      <ResultScreen />
    ) : (
      <DrawScreen />
    );

  return (
    <>
      {step}
      {sealTick > 0 && sealDistrict != null ? (
        <DistrictSpin key={sealTick} district={sealDistrict} />
      ) : null}
    </>
  );
}
