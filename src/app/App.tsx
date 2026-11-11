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

  return (
    <div className={styles.stage}>
      <video
        className={styles.stageVideo}
        src={`${import.meta.env.BASE_URL}video/draw.mp4?v=2`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
      />
      {hydrated ? <ScreenRouter /> : <div className={styles.boot} />}
    </div>
  );
}
