import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ru } from '../content/ru';
import {
  fetchStatsCaptcha,
  loadStats,
  loginStats,
  logoutStats,
  type StatsAuthError,
  type StatsCaptcha,
  type StatsDashboard,
} from '../stats/api';
import { downloadStatsReport } from '../stats/reportPdf';
import styles from './stats.module.css';

const clock = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'Europe/Moscow',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return clock.format(date);
}

function screenName(screen: string) {
  if (screen in ru.stats.screens) return ru.stats.screens[screen as keyof typeof ru.stats.screens];
  return screen;
}

export function StatsScreen() {
  const [captcha, setCaptcha] = useState<StatsCaptcha | null>(null);
  const [password, setPassword] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<StatsAuthError | null>(null);
  const [busy, setBusy] = useState(false);
  const [dashboard, setDashboard] = useState<StatsDashboard | null>(null);
  const [ready, setReady] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);

  const refreshCaptcha = async () => {
    const next = await fetchStatsCaptcha();
    setCaptcha(next);
    setAnswer('');
    if (!next) setError('network');
  };

  useEffect(() => {
    let cancelled = false;
    void loadStats().then((result) => {
      if (cancelled) return;
      if (result && result !== 'network') {
        setDashboard(result);
        setReady(true);
        return;
      }
      if (result === 'network') setError('network');
      setReady(true);
      void fetchStatsCaptcha().then((next) => {
        if (cancelled) return;
        setCaptcha(next);
        if (!next) setError('network');
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || !captcha) return;
    setBusy(true);
    setError(null);
    const result = await loginStats({
      password,
      captchaId: captcha.id,
      captchaAnswer: answer,
    });
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
      if (result.error !== 'locked' && result.error !== 'unconfigured') void refreshCaptcha();
      return;
    }
    const data = await loadStats();
    setBusy(false);
    setPassword('');
    setAnswer('');
    if (!data || data === 'network') {
      setError('network');
      void refreshCaptcha();
      return;
    }
    setDashboard(data);
  };

  const counts = Object.entries(dashboard?.clicks.counts ?? {}).sort((a, b) => b[1] - a[1]);
  const total = counts.reduce((sum, [, value]) => sum + value, 0);
  const max = counts[0]?.[1] ?? 1;
  const events = [...(dashboard?.clicks.events ?? [])].reverse();
  const participants = [...(dashboard?.participants ?? [])].reverse();

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
        <Link className={styles.back} to="/">
          {ru.stats.back}
        </Link>
        {dashboard ? (
          <div className={styles.tools}>
            <button
              type="button"
              className={styles.download}
              disabled={exporting}
              aria-busy={exporting || undefined}
              onClick={() => {
                setExporting(true);
                setExportError(false);
                void downloadStatsReport(dashboard)
                  .catch(() => setExportError(true))
                  .finally(() => setExporting(false));
              }}
            >
              {exporting ? ru.stats.exporting : ru.stats.exportPdf}
            </button>
            <button
              type="button"
              className={styles.logout}
              onClick={() => {
                void logoutStats();
                setDashboard(null);
                setExportError(false);
                setError(null);
                void refreshCaptcha();
              }}
            >
              {ru.stats.logout}
            </button>
          </div>
        ) : null}
      </header>
      <main className={styles.main}>
        {dashboard ? (
          <>
            <div className={styles.head}>
              <h1 className={styles.title}>{ru.stats.title}</h1>
              <p className={styles.lead}>{ru.stats.lead}</p>
              {exportError ? <p className={styles.error}>{ru.stats.exportFailed}</p> : null}
            </div>
            <ul className={styles.totals}>
              <li className={styles.total}>
                <span>{ru.stats.totalClicks}</span>
                <strong>{total}</strong>
              </li>
              <li className={styles.total}>
                <span>{ru.stats.actions}</span>
                <strong>{counts.length}</strong>
              </li>
              <li className={styles.total}>
                <span>{ru.stats.participants}</span>
                <strong>{participants.length}</strong>
              </li>
            </ul>
            {events.length < total ? (
              <p className={styles.note}>{ru.stats.journalNote(events.length, total)}</p>
            ) : null}
            <div className={styles.columns}>
              <section className={styles.panel} aria-labelledby="click-title">
                <h2 id="click-title" className={styles.panelTitle}>
                  {ru.stats.clicksTitle}
                </h2>
                {counts.length === 0 ? (
                  <p className={styles.empty}>{ru.stats.emptyClicks}</p>
                ) : (
                  <ol className={styles.ranks}>
                    {counts.map(([name, value]) => (
                      <li key={name} className={styles.rank}>
                        <span className={styles.rankName}>{name}</span>
                        <span className={styles.rankCount}>{value}</span>
                        <div className={styles.bar} aria-hidden="true">
                          <span style={{ width: `${Math.max(4, Math.round((value / max) * 100))}%` }} />
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
              <section className={styles.panel} aria-labelledby="people-title">
                <h2 id="people-title" className={styles.panelTitle}>
                  {ru.stats.participantsTitle}
                </h2>
                {participants.length === 0 ? (
                  <p className={styles.empty}>{ru.stats.emptyParticipants}</p>
                ) : (
                  <div className={styles.scroll}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>{ru.stats.columns.code}</th>
                          <th>{ru.stats.columns.when}</th>
                          <th>{ru.stats.columns.agent}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((entry) => (
                          <tr key={`${entry.code}-${entry.at}`}>
                            <td className={styles.code}>{entry.code}</td>
                            <td className={styles.when}>{formatWhen(entry.at)}</td>
                            <td className={styles.agent}>{entry.ua}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
            <section className={`${styles.panel} ${styles.wide}`} aria-labelledby="recent-title">
              <h2 id="recent-title" className={styles.panelTitle}>
                {ru.stats.recentTitle}
              </h2>
              {events.length === 0 ? (
                <p className={styles.empty}>{ru.stats.emptyClicks}</p>
              ) : (
                <div className={styles.scroll}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>{ru.stats.columns.when}</th>
                        <th>{ru.stats.columns.screen}</th>
                        <th>{ru.stats.columns.action}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((entry, index) => (
                        <tr key={`${entry.at}-${entry.name}-${index}`}>
                          <td className={styles.when}>{formatWhen(entry.at)}</td>
                          <td>{screenName(entry.screen)}</td>
                          <td>{entry.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className={styles.gate}>
            <h1 className={styles.title}>{ru.stats.title}</h1>
            <p className={styles.lead}>{ru.stats.lead}</p>
            {ready ? (
              <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
                <label className={styles.field}>
                  <span>{ru.stats.password}</span>
                  <input
                    type="password"
                    value={password}
                    autoComplete="current-password"
                    onChange={(event) => setPassword(event.target.value)}
                    aria-invalid={error === 'bad_password' || undefined}
                  />
                </label>
                <label className={styles.field}>
                  <span>{ru.stats.captchaLabel}</span>
                  <span className={styles.captchaRow}>
                    <span className={styles.challenge}>
                      {captcha ? ru.stats.captchaHint(captcha.challenge) : ru.stats.captchaWait}
                    </span>
                    <button
                      type="button"
                      className={styles.refresh}
                      onClick={() => void refreshCaptcha()}
                    >
                      {ru.stats.captchaRefresh}
                    </button>
                  </span>
                  <input
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    inputMode="numeric"
                    autoComplete="off"
                    aria-invalid={error === 'bad_captcha' || undefined}
                  />
                </label>
                {error ? (
                  <p className={styles.error} role="alert">
                    {ru.stats.errors[error]}
                  </p>
                ) : null}
                <button type="submit" className={styles.submit} disabled={busy || !captcha}>
                  {busy ? ru.stats.submitting : ru.stats.submit}
                </button>
              </form>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
