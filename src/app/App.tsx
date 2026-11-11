import { useEffect, useSyncExternalStore } from 'react';
import { track } from '../analytics/analytics';
import { eventParams } from '../analytics/params';
import { useGameStore } from '../game/store';
import styles from './shell.module.css';
import { ScreenRouter } from './ScreenRouter';

function useHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) =>
      useGameStore.persist.onFinishHydration(() => {
        onStoreChange();
      }),
    () => useGameStore.persist.hasHydrated(),
    () => false,
  );
}

export function App() {
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    const state = useGameStore.getState();
    track('landing_view', eventParams(state), state.sessionId);
  }, [hydrated]);

  if (!hydrated) return <div className={styles.boot} />;
  return <ScreenRouter />;
}
