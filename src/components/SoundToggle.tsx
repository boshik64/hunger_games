import { useEffect, useRef, useState } from 'react';
import { themeAudioUrl } from '../config';
import { ru } from '../content/ru';
import styles from '../app/shell.module.css';

const STORAGE_KEY = 'kg:sound';

let theme: HTMLAudioElement | null = null;

function themeElement() {
  if (!theme) {
    theme = new Audio(themeAudioUrl);
    theme.loop = true;
    theme.preload = 'auto';
  }
  return theme;
}

export function SoundToggle() {
  const [on, setOn] = useState(() => sessionStorage.getItem(STORAGE_KEY) !== 'off');
  const wantRef = useRef(on);

  useEffect(() => {
    wantRef.current = on;
    const audio = themeElement();
    if (!on) {
      audio.pause();
      return;
    }
    if (audio.paused) void audio.play().catch(() => undefined);
  }, [on]);

  useEffect(() => {
    const unlock = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-sound]')) return;
      const audio = themeElement();
      if (!wantRef.current || !audio.paused) return;
      void audio.play().catch(() => undefined);
    };
    window.addEventListener('pointerdown', unlock);
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  return (
    <button
      type="button"
      data-sound
      className={styles.sound}
      aria-pressed={on}
      aria-label={on ? ru.service.soundOn : ru.service.soundOff}
      onClick={() => {
        const next = !on;
        sessionStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
        setOn(next);
      }}
    >
      {ru.service.sound}
    </button>
  );
}
