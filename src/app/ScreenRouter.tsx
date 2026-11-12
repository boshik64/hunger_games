import { useEffect, useState } from 'react';
import { DrawScreen } from '../screens/DrawScreen';
import { ItemScreen } from '../screens/ItemScreen';
import { OutfitScreen } from '../screens/OutfitScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { ScoreScreen } from '../screens/ScoreScreen';
import { SkillScreen } from '../screens/SkillScreen';
import { StrategyScreen } from '../screens/StrategyScreen';
import { useGameStore } from '../game/store';
import type { Screen } from '../game/types';
import { DistrictSpin } from './DistrictSpin';
import { VisualScreenProvider } from './visualScreen';

const ORDER: Screen[] = ['draw', 'outfit', 'skill', 'score', 'item', 'strategy', 'result'];

function holdsPreviousStep(previous: Screen, next: Screen) {
  const from = ORDER.indexOf(previous);
  const to = ORDER.indexOf(next);
  return from >= 0 && to === from + 1;
}

export function ScreenRouter() {
  const screen = useGameStore((state) => state.screen);
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const endTransition = useGameStore((state) => state.endTransition);
  const sealTick = useGameStore((state) => state.sealTick);
  const sealDistrict = useGameStore((state) => state.sealDistrict);
  const [tracked, setTracked] = useState(screen);
  const [held, setHeld] = useState<Screen | null>(null);

  if (screen !== tracked) {
    const previous = tracked;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTracked(screen);
    setHeld(holdsPreviousStep(previous, screen) && !reduce ? previous : null);
  }

  useEffect(() => {
    if (!isTransitioning) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => endTransition(), reduce ? 0 : 900);
    return () => window.clearTimeout(timeout);
  }, [isTransitioning, endTransition]);

  useEffect(() => {
    if (!held) return;
    const timeout = window.setTimeout(() => setHeld(null), 900);
    return () => window.clearTimeout(timeout);
  }, [held, sealTick]);

  const visible = held ?? screen;
  const step =
    visible === 'outfit' ? (
      <OutfitScreen />
    ) : visible === 'skill' ? (
      <SkillScreen />
    ) : visible === 'score' ? (
      <ScoreScreen />
    ) : visible === 'item' ? (
      <ItemScreen />
    ) : visible === 'strategy' ? (
      <StrategyScreen />
    ) : visible === 'result' ? (
      <ResultScreen />
    ) : (
      <DrawScreen />
    );

  return (
    <VisualScreenProvider screen={visible}>
      {step}
      {sealTick > 0 && sealDistrict != null ? (
        <DistrictSpin key={sealTick} district={sealDistrict} />
      ) : null}
    </VisualScreenProvider>
  );
}
