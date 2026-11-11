import { useEffect, useState } from 'react';
import { ActionButton, ShareLink, TicketLink } from '../components/ActionButton';
import { ScreenFrame } from '../components/ScreenFrame';
import { countClick } from '../analytics/counters';
import { renderCard, type PreparedCard } from '../card/renderCard';
import { siteUrl } from '../config';
import { getDistrict } from '../content/districts';
import { ru } from '../content/ru';
import { selectCharacteristic, selectResult } from '../game/selectors';
import { useGameStore } from '../game/store';
import { ogImageUrl, sharePageUrl, telegramShareUrl, vkShareUrl } from '../share/links';
import styles from '../app/shell.module.css';

export function ResultScreen() {
  const districtId = useGameStore((state) => state.district);
  const item = useGameStore((state) => state.item);
  const strategy = useGameStore((state) => state.strategy);
  const attempt = useGameStore((state) => state.attempt);
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const district = districtId == null ? undefined : getDistrict(districtId);
  const result = selectResult(item, strategy);
  const characteristic = result ? selectCharacteristic(result.characteristic) : null;

  const [card, setCard] = useState<PreparedCard | null>(null);
  const [error, setError] = useState(false);
  const [attemptKey, setAttemptKey] = useState(0);
  const [cardOpen, setCardOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

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
    if (!cardOpen && !shareOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setCardOpen(false);
      setShareOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cardOpen, shareOpen]);

  const shareText =
    district && characteristic
      ? `${characteristic.name}, ${district.title}. ${ru.share.text}`
      : ru.share.text;

  const page = sharePageUrl(siteUrl);
  const image = ogImageUrl(siteUrl);

  return (
    <ScreenFrame
      title=""
      actions={
        <>
          <ActionButton variant="secondary" onClick={() => setShareOpen(true)}>
            {ru.service.share}
          </ActionButton>
          <TicketLink locked={isTransitioning} variant="primary" />
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
            </button>
          ) : (
            <div className={styles.skeleton} aria-busy="true" />
          )}
        </div>
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
      {shareOpen ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={ru.service.share}
          onClick={() => setShareOpen(false)}
        >
          <div className={styles.sharePop} onClick={(event) => event.stopPropagation()}>
            <p>{ru.service.share}</p>
            <ShareLink href={telegramShareUrl(shareText, page)}>{ru.share.telegram}</ShareLink>
            <ShareLink href={vkShareUrl(shareText, page, image)}>{ru.share.vk}</ShareLink>
            <button type="button" className={styles.lightboxClose} onClick={() => setShareOpen(false)}>
              {ru.service.close}
            </button>
          </div>
        </div>
      ) : null}
    </ScreenFrame>
  );
}
