import { useEffect, useRef, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { AssetImage } from './AssetImage';
import { SoundToggle } from './SoundToggle';
import { ru } from '../content/ru';
import { getDistrict } from '../content/districts';
import { selectProgressLabel, selectStep } from '../game/selectors';
import { useGameStore } from '../game/store';
import styles from '../app/shell.module.css';

const SCENES = {
  draw: 'scene.draw',
  item: 'scene.item',
  strategy: 'scene.strategy',
  result: 'scene.result',
} as const;

export function ScreenFrame({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  const screen = useGameStore((state) => state.screen);
  const districtId = useGameStore((state) => state.district);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const district = districtId == null ? undefined : getDistrict(districtId);
  const step = selectStep(screen);

  useEffect(() => {
    titleRef.current?.focus();
  }, [screen]);

  return (
    <section className={styles.screen} data-screen={screen}>
      <AssetImage id={SCENES[screen]} alt="" className={styles.backdrop} />
      <div className={styles.scrim} />
      <div className={styles.column}>
        <header className={styles.header}>
          <div className={styles.progress}>
            <div className={styles.ticks} aria-hidden="true">
              {[1, 2, 3, 4].map((mark) => (
                <span key={mark} data-on={mark <= step} />
              ))}
            </div>
            <p className={styles.step}>{selectProgressLabel(screen)}</p>
          </div>
          <div className={styles.tools}>
            <SoundToggle />
            {district ? (
              <Badge
                variant="outline"
                style={{ borderRadius: 999 }}
                className="!h-9 !gap-2 !border-white/25 !bg-[rgba(120,92,140,0.4)] !px-3 !text-[0.72rem] !tracking-[0.14em] !text-white !uppercase"
              >
                <AssetImage id={district.symbolAssetId} alt="" className="size-7" />
                <span>{district.title}</span>
              </Badge>
            ) : null}
          </div>
        </header>
        <div className={styles.body}>
          <AssetImage id="wordmark.film" alt={ru.filmTitle} className={styles.brand} />
          <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
            {title}
          </h1>
          {children}
        </div>
        <div className={styles.actions}>
          {actions}
          <footer className={styles.footer}>{ru.footer}</footer>
        </div>
        <p className="sr-only" aria-live="polite">
          {selectProgressLabel(screen)}
        </p>
      </div>
    </section>
  );
}
