import { createContext, useContext, type ReactNode } from 'react';
import type { Screen } from '../game/types';
import { useGameStore } from '../game/store';

const VisualScreenContext = createContext<Screen | null>(null);

export function VisualScreenProvider({
  screen,
  children,
}: {
  screen: Screen;
  children: ReactNode;
}) {
  return <VisualScreenContext.Provider value={screen}>{children}</VisualScreenContext.Provider>;
}

export function useVisualScreen(): Screen {
  const stored = useGameStore((state) => state.screen);
  return useContext(VisualScreenContext) ?? stored;
}
