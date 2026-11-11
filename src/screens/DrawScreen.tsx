import { useEffect, useState } from 'react';
import { AssetImage } from '../components/AssetImage';
import { ActionButton, TicketLink } from '../components/ActionButton';
import { ScreenFrame } from '../components/ScreenFrame';
import { getDistrict } from '../content/districts';
import { ru } from '../content/ru';
import { useGameStore } from '../game/store';
import styles from '../app/shell.module.css';

export function DrawScreen() {
  const drawn = useGameStore((state) => state.drawn);
  const isDrawing = useGameStore((state) => state.isDrawing);
  const districtId = useGameStore((state) => state.district);
  const startDraw = useGameStore((state) => state.startDraw);
  const finishDraw = useGameStore((state) => state.finishDraw);
  const prepare = useGameStore((state) => state.prepare);
  const [rolling, setRolling] = useState<number | null>(null);
  const district = districtId == null ? undefined : getDistrict(districtId);

  useEffect(() => {
    if (!isDrawing) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      finishDraw();
      return;
    }
    const spin = () => setRolling(1 + Math.floor(Math.random() * 12));
    const first = window.setTimeout(spin, 0);
    const interval = window.setInterval(spin, 90);
    const timeout = window.setTimeout(() => finishDraw(), 1600);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [isDrawing, finishDraw]);

  return (
    <ScreenFrame
      title={drawn ? '' : ru.draw.title}
      actions={
        <>
          <ActionButton
            variant="primary"
            disabled={isDrawing}
            onClick={drawn ? prepare : startDraw}
          >
            {drawn ? ru.draw.prepare : ru.draw.action}
          </ActionButton>
          <TicketLink />
        </>
      }
    >
      {drawn && district ? (
        <>
          <p className={styles.districtNumber}>{district.id}</p>
          <AssetImage id={district.symbolAssetId} alt="" className={styles.symbol} />
          <p className={styles.tagline}>{district.tagline}</p>
        </>
      ) : (
        <>
          {isDrawing && rolling != null ? <p className={styles.roll}>{rolling}</p> : null}
          <p className={styles.lede}>{ru.draw.subtitle}</p>
          <p className={styles.note}>{ru.draw.caption}</p>
        </>
      )}
    </ScreenFrame>
  );
}
