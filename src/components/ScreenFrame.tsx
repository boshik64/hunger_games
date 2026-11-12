import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { AssetImage } from './AssetImage';
import { SoundToggle } from './SoundToggle';
import { ru } from '../content/ru';
import { getDistrict } from '../content/districts';
import { selectProgressLabel, selectStep } from '../game/selectors';
import { useGameStore } from '../game/store';
import { useVisualScreen } from '../app/visualScreen';
import styles from '../app/shell.module.css';

type CrestPhase = 'on' | 'leave' | 'gone';

type Box = { left: number; top: number; width: number; height: number };

export function ScreenFrame({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  const screen = useVisualScreen();
  const isDrawing = useGameStore((state) => state.isDrawing);
  const drawn = useGameStore((state) => state.drawn);
  const districtId = useGameStore((state) => state.district);
  const item = useGameStore((state) => state.item);
  const district = districtId == null ? undefined : getDistrict(districtId);
  const step = selectStep(screen);
  const [crestPhase, setCrestPhase] = useState<CrestPhase>(() =>
    useGameStore.getState().drawn || useGameStore.getState().isDrawing ? 'gone' : 'on',
  );
  const [flightBox, setFlightBox] = useState<Box | null>(null);
  const phaseRef = useRef<CrestPhase>(crestPhase);
  const copyRef = useRef<HTMLDivElement>(null);
  const flightRef = useRef<HTMLDivElement>(null);
  const flipFrom = useRef<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (screen !== 'draw') return;
    if (!isDrawing && !drawn) {
      phaseRef.current = 'on';
      setCrestPhase('on');
      setFlightBox(null);
      const copy = copyRef.current;
      if (copy) {
        copy.style.transition = '';
        copy.style.transform = '';
      }
      return;
    }
    if (phaseRef.current !== 'on') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const flight = flightRef.current;
    const copy = copyRef.current;
    if (reduce || !flight || !copy) {
      phaseRef.current = 'gone';
      setCrestPhase('gone');
      return;
    }

    const flightRect = flight.getBoundingClientRect();
    const copyRect = copy.getBoundingClientRect();
    flipFrom.current = { left: copyRect.left, top: copyRect.top };
    phaseRef.current = 'leave';
    setFlightBox({
      left: flightRect.left,
      top: flightRect.top,
      width: flightRect.width,
      height: flightRect.height,
    });
    setCrestPhase('leave');
  }, [screen, isDrawing, drawn]);

  useLayoutEffect(() => {
    if (crestPhase !== 'leave' || !flipFrom.current || !copyRef.current) return;
    const copy = copyRef.current;
    const from = flipFrom.current;
    const to = copy.getBoundingClientRect();
    copy.style.transition = 'none';
    copy.style.transform = `translate(${from.left - to.left}px, ${from.top - to.top}px)`;
    const frame = requestAnimationFrame(() => {
      copy.style.transition = 'transform 780ms cubic-bezier(0.16, 0.84, 0.3, 1)';
      copy.style.transform = 'translate(0, 0)';
    });
    const timer = window.setTimeout(() => {
      flipFrom.current = null;
      copy.style.transition = '';
      copy.style.transform = '';
      phaseRef.current = 'gone';
      setCrestPhase('gone');
      setFlightBox(null);
    }, 820);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [crestPhase]);

  return (
    <section className={styles.screen} data-screen={screen}>
      <div className={styles.scrim} />
      <div className={styles.column}>
        <header className={styles.header}>
          <div className={styles.progress}>
            <div className={styles.ticks} aria-hidden="true">
              {[1, 2, 3, 4, 5, 6, 7].map((mark) => (
                <span key={mark} data-on={mark <= step} />
              ))}
            </div>
            <p className={styles.step}>{selectProgressLabel(screen)}</p>
          </div>
          <div className={styles.tools}>
            <SoundToggle />
            {district && screen !== 'draw' ? (
              <Badge
                variant="outline"
                style={{ borderRadius: 999 }}
                className={`${styles.districtBadge} !gap-2 !overflow-hidden !border-white/25 !bg-[rgba(120,92,140,0.55)] !pl-1.5 !pr-4 !tracking-[0.12em] !text-white !uppercase`}
              >
                <AssetImage id={district.symbolAssetId} alt="" className={styles.badgeIcon} />
                {item && (screen === 'strategy' || screen === 'result') ? (
                  <AssetImage id={`item.${item}`} alt="" className={styles.badgeIcon} />
                ) : null}
                <span>{district.title}</span>
              </Badge>
            ) : null}
          </div>
        </header>
        <div className={styles.body} data-crest={screen === 'draw' ? crestPhase : undefined}>
          {screen === 'draw' && !drawn ? (
            <AssetImage id="wordmark.film" alt={ru.filmTitle} className={styles.brand} />
          ) : null}
          {screen === 'draw' && crestPhase !== 'gone' ? (
            <div className={styles.crest}>
              <div
                ref={flightRef}
                className={styles.crestFrame}
                data-fly={crestPhase === 'leave' ? 'leave' : undefined}
                style={
                  crestPhase === 'leave' && flightBox
                    ? {
                        position: 'fixed',
                        zIndex: 5,
                        left: flightBox.left,
                        top: flightBox.top,
                        width: flightBox.width,
                        height: flightBox.height,
                        margin: 0,
                        pointerEvents: 'none',
                      }
                    : undefined
                }
              >
                <img src={`${import.meta.env.BASE_URL}assets/crest.webp?v=6`} alt="" draggable={false} />
              </div>
            </div>
          ) : null}
          <div className={styles.copy} ref={copyRef}>
            <h1 className={styles.title}>{title}</h1>
            {children}
          </div>
        </div>
        <div className={styles.actions}>{actions}</div>
        <p className="sr-only" aria-live="polite">
          {selectProgressLabel(screen)}
        </p>
      </div>
    </section>
  );
}
