import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { cn } from 'cn';
import { countClick } from '../analytics/counters';
import { AssetImage } from '../components/AssetImage';
import { SoundToggle } from '../components/SoundToggle';
import { ru } from '../content/ru';
import { submitRaffle, type RaffleError } from '../raffle/api';
import { createLocalCaptcha } from '../raffle/captcha';
import { isValidCode, normalizeCode } from '../raffle/code';
import styles from './reward.module.css';

const submitLook =
  '!h-[52px] !w-full !rounded-full !px-5 !font-[family-name:var(--font-display)] !text-[0.82rem] !font-medium !tracking-[0.18em] !uppercase !shadow-none !border !border-white/30 !bg-[rgba(120,92,140,0.72)] !text-white hover:!bg-[rgba(154,118,176,0.88)] disabled:!opacity-40';

type Status = 'idle' | 'submitting' | 'success';

export function RewardScreen() {
  const [code, setCode] = useState('');
  const [captcha, setCaptcha] = useState(() => createLocalCaptcha());
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<RaffleError | null>(null);

  const refreshCaptcha = () => {
    setCaptcha(createLocalCaptcha());
    setCaptchaAnswer('');
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'submitting' || status === 'success') return;
    countClick(ru.reward.submit, 'reward');

    const normalized = normalizeCode(code);
    if (!isValidCode(normalized)) {
      setError('bad_code');
      return;
    }
    if (!captchaAnswer.trim()) {
      setError('bad_captcha');
      return;
    }

    setStatus('submitting');
    setError(null);
    const result = await submitRaffle({
      code: normalized,
      captchaA: captcha.a,
      captchaB: captcha.b,
      captchaAnswer,
    });
    if (result.ok) {
      setStatus('success');
      setCode('');
      setCaptchaAnswer('');
      return;
    }
    setStatus('idle');
    setError(result.error);
    refreshCaptcha();
  };

  return (
    <div className={styles.page}>
      <video
        className={styles.bgVideo}
        src={`${import.meta.env.BASE_URL}video/draw.mp4?v=2`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
      />
      <div className={styles.scrim} aria-hidden="true" />
      <header className={styles.header}>
        <Link
          className={styles.back}
          to="/"
          onClick={() => countClick(ru.reward.backToGame, 'reward')}
        >
          {ru.reward.backToGame}
        </Link>
        <SoundToggle screen="reward" />
      </header>
      <main className={styles.main}>
        <h1 className={styles.title}>{ru.reward.title}</h1>
        <p className={styles.dates}>{ru.reward.dates}</p>
        <p className={styles.lead}>{ru.reward.lead}</p>
        <p className={styles.hint}>{ru.reward.prompt}</p>

        <section className={styles.section} aria-labelledby="super-title">
          <h2 id="super-title" className={styles.sectionTitle}>
            {ru.reward.superTitle}
          </h2>
          <ul className={styles.supers}>
            {ru.reward.supers.map((item) => (
              <li key={item.name} className={styles.superItem}>
                <AssetImage id={item.icon} alt="" className={styles.prizeIcon} />
                <span className={styles.prizeName}>{item.name}</span>
              </li>
            ))}
          </ul>
        </section>

        {status === 'success' ? (
          <p className={styles.success} role="status">
            {ru.reward.success}
          </p>
        ) : (
          <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
            <label className={styles.field}>
              <span>{ru.reward.codeLabel}</span>
              <input
                value={code}
                onChange={(event) => {
                  setCode(normalizeCode(event.target.value).slice(0, 7));
                }}
                maxLength={7}
                autoComplete="off"
                spellCheck={false}
                inputMode="text"
                placeholder={ru.reward.codePlaceholder}
                aria-invalid={error === 'bad_code' || undefined}
              />
            </label>

            <label className={styles.field}>
              <span>{ru.reward.captchaLabel}</span>
              <span className={styles.captchaRow}>
                <span className={styles.challenge}>{ru.reward.captchaHint(captcha.challenge)}</span>
                <button
                  type="button"
                  className={styles.refresh}
                  onClick={() => {
                    countClick(ru.reward.captchaRefresh, 'reward');
                    refreshCaptcha();
                  }}
                >
                  {ru.reward.captchaRefresh}
                </button>
              </span>
              <input
                value={captchaAnswer}
                onChange={(event) => setCaptchaAnswer(event.target.value)}
                inputMode="numeric"
                autoComplete="off"
                aria-invalid={error === 'bad_captcha' || undefined}
              />
            </label>

            {error ? (
              <p className={styles.error} role="alert">
                {ru.reward.errors[error]}
              </p>
            ) : null}

            <button
              type="submit"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), submitLook)}
              disabled={status === 'submitting'}
              aria-busy={status === 'submitting' || undefined}
            >
              {status === 'submitting' ? ru.reward.submitting : ru.reward.submit}
            </button>
          </form>
        )}
      </main>
      <footer className={styles.footer}>{ru.footer}</footer>
    </div>
  );
}
