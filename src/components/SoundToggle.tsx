import { useState } from 'react';
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

function isAudible(audio: HTMLAudioElement) {
  return !audio.paused && audio.currentTime > 0 && !audio.ended;
}

function resume(audio: HTMLAudioElement) {
  if (isAudible(audio)) return;
  if (!audio.paused) audio.pause();
  void audio.play().catch(() => undefined);
}

function startIfWanted() {
  const audio = themeElement();
  if (!audio || !soundWanted()) return;
  resume(audio);
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-sound]')) return;
      startIfWanted();
    },
    true,
  );
}

export function SoundToggle() {
  const [on, setOn] = useState(soundWanted);

  return (
    <button
      type="button"
      data-sound
      className={styles.sound}
      aria-pressed={on}
      aria-label={on ? ru.service.soundOn : ru.service.soundOff}
      onClick={() => {
        const audio = themeElement();
        if (on && audio && !isAudible(audio)) {
          resume(audio);
          return;
        }
        const next = !on;
        try {
          sessionStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
        } catch {
          // private mode
        }
        if (audio) {
          if (next) resume(audio);
          else audio.pause();
        }
        setOn(next);
      }}
    >
      {ru.service.sound}
    </button>
  );
}
