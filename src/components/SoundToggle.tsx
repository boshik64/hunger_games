import { useEffect, useRef, useState } from 'react';
import { themeAudioUrl } from '../config';
import { ru } from '../content/ru';
import styles from '../app/shell.module.css';

const STORAGE_KEY = 'kg:sound';

let theme: HTMLAudioElement | null = null;

function themeElement() {
  if (!theme && typeof Audio !== 'undefined') {
    theme = new Audio(themeAudioUrl);
    theme.loop = true;
    theme.preload = 'auto';
  }
  return theme;
}

function soundWanted() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

if (typeof window !== 'undefined') {
  const audio = themeElement();
  if (audio && soundWanted()) void audio.play().catch(() => undefined);
  window.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('[data-sound]')) return;
    const playing = themeElement();
    if (!playing || !soundWanted() || !playing.paused) return;
    void playing.play().catch(() => undefined);
  });
}

export function SoundToggle() {
  const [on, setOn] = useState(soundWanted);
  const wantRef = useRef(on);

  useEffect(() => {
    wantRef.current = on;
    const audio = themeElement();
    if (!audio) return;
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
      if (!audio || !wantRef.current || !audio.paused) return;
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
