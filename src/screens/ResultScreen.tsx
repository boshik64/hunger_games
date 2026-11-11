import { useEffect, useState } from 'react';
import { ActionButton, ShareLink, TicketLink } from '../components/ActionButton';
import { AssetImage } from '../components/AssetImage';
import { ScreenFrame } from '../components/ScreenFrame';
import { track } from '../analytics/analytics';
import { countClick } from '../analytics/counters';
import { eventParams } from '../analytics/params';
import { renderCard, type PreparedCard } from '../card/renderCard';
import { siteUrl } from '../config';
import { getDistrict } from '../content/districts';
import { ru } from '../content/ru';
import { selectCharacteristic, selectResult } from '../game/selectors';
import { useGameStore } from '../game/store';
import { ogImageUrl, sharePageUrl, telegramShareUrl, vkShareUrl } from '../share/links';
import styles from '../app/shell.module.css';

function downloadCard(card: PreparedCard) {
  const link = document.createElement('a');
  link.href = card.objectUrl;
  link.download = card.file.name;
  link.click();
}

export function ResultScreen() {
  const districtId = useGameStore((state) => state.district);
  const item = useGameStore((state) => state.item);
  const strategy = useGameStore((state) => state.strategy);
  const attempt = useGameStore((state) => state.attempt);
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const replay = useGameStore((state) => state.replay);
  const district = districtId == null ? undefined : getDistrict(districtId);
  const result = selectResult(item, strategy);
  const characteristic = result ? selectCharacteristic(result.characteristic) : null;

  const [card, setCard] = useState<PreparedCard | null>(null);
  const [error, setError] = useState(false);
  const [attemptKey, setAttemptKey] = useState(0);
  const [cardOpen, setCardOpen] = useState(false);

  useEffect(() => {
    if (!district || !item || !result || !characteristic) return;
    let cancelled = false;
    let objectUrl = '';
    const timeout = window.setTimeout(() => {
      if (!cancelled) setError(true);
    }, 8000);

    renderCard({
      district: district.id,
      districtTitle: district.title,
      tagline: district.tagline,
      accent: district.accent,
      itemId: item,
      itemName: ru.item.options[item].name,
      characteristicName: characteristic.name,
      phrase: characteristic.phrase,
      explanation: result.explanation,
      filmTitle: ru.filmTitle,
      fileSlug: result.characteristic,
    })
      .then((prepared) => {
        if (cancelled) {
          URL.revokeObjectURL(prepared.objectUrl);
          return;
        }
        window.clearTimeout(timeout);
        objectUrl = prepared.objectUrl;
        setCard(prepared);
        setError(false);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [district, item, result, characteristic, attempt, attemptKey]);

  useEffect(() => {
    if (!cardOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCardOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cardOpen]);

  const shareText =
    district && characteristic
      ? `${characteristic.name}, ${district.title}. ${ru.share.text}`
      : ru.share.text;

  return (
    <ScreenFrame
      title={ru.result.title}
      actions={
        <>
          <TicketLink locked={isTransitioning} variant="primary" />
          <div className={styles.pair}>
            <ShareLink href={telegramShareUrl(shareText, sharePageUrl(siteUrl))}>
              {ru.share.telegram}
            </ShareLink>
            <ShareLink href={vkShareUrl(shareText, sharePageUrl(siteUrl), ogImageUrl(siteUrl))}>
              {ru.share.vk}
            </ShareLink>
          </div>
          <ActionButton
            variant="ghost"
            busy={!card && !error}
            disabled={isTransitioning || !card}
            className="!h-11"
            onClick={() => {
              if (!card) return;
              downloadCard(card);
              track('card_download', eventParams(useGameStore.getState()));
            }}
          >
            {ru.download}
          </ActionButton>
          <ActionButton
            variant="ghost"
            disabled={isTransitioning}
            className="!h-10 !border-0 !bg-transparent"
            onClick={replay}
          >
            {ru.result.replay}
          </ActionButton>
        </>
      }
    >
      <div className={styles.story}>
        <div className={styles.cardSlot}>
          {card ? (
            <button
              type="button"
              className={styles.cardButton}
              onClick={() => {
                countClick(ru.service.openCard, 'result');
                setCardOpen(true);
              }}
            >
              <img
                className={styles.cardPreview}
                src={card.objectUrl}
                alt={
                  district && characteristic
                    ? `${ru.result.title}. ${district.title}. ${characteristic.name}`
                    : ru.result.title
                }
              />
              <span className={styles.cardHint}>{ru.service.openCard}</span>
            </button>
          ) : (
            <div className={styles.skeleton} aria-busy="true" />
          )}
        </div>
        {district ? <p className={styles.tagline}>{district.tagline}</p> : null}
        {characteristic ? <p className={styles.characteristic}>{characteristic.name}</p> : null}
        {characteristic ? <p className={styles.phrase}>{characteristic.phrase}</p> : null}
        {result ? <p className={styles.explanation}>{result.explanation}</p> : null}
        {item ? (
          <div className={styles.chip}>
            <AssetImage id={`item.${item}`} alt="" />
            <span>{ru.item.options[item].name}</span>
          </div>
        ) : null}
        {error ? (
          <div className={styles.error}>
            <p>{ru.share.error}</p>
            <ActionButton
              variant="secondary"
              onClick={() => {
                setError(false);
                setCard(null);
                setAttemptKey((value) => value + 1);
              }}
            >
              {ru.share.retry}
            </ActionButton>
          </div>
        ) : null}
        <div className={styles.meta}>
          <AssetImage id="logo.karo" alt="" className={styles.logo} />
          <p className={styles.bridge}>{ru.result.bridge}</p>
        </div>
      </div>
      {cardOpen && card ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={ru.service.openCard}
          onClick={() => setCardOpen(false)}
        >
          <img
            src={card.objectUrl}
            alt={
              district && characteristic
                ? `${ru.result.title}. ${district.title}. ${characteristic.name}`
                : ru.result.title
            }
            onClick={(event) => event.stopPropagation()}
          />
          <button type="button" className={styles.lightboxClose} onClick={() => setCardOpen(false)}>
            {ru.service.close}
          </button>
        </div>
      ) : null}
    </ScreenFrame>
  );
}
