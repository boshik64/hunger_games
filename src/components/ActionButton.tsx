import type { ReactNode } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from 'cn';
import { ticketsUrl } from '../config';
import { ru } from '../content/ru';
import { track } from '../analytics/analytics';
import { countClick } from '../analytics/counters';
import { eventParams } from '../analytics/params';
import { useGameStore } from '../game/store';
import styles from './controls.module.css';

const variants = {
  primary: 'default',
  secondary: 'outline',
  ghost: 'ghost',
} as const;

const base =
  '!h-[52px] !w-full !rounded-full !px-5 !font-[family-name:var(--font-display)] !text-[0.82rem] !font-medium !tracking-[0.18em] !uppercase !shadow-none !transition-[background-color,color,border-color] !duration-300 aria-disabled:!opacity-40';

const looks = {
  primary: `${base} !border !border-white/30 !bg-[rgba(120,92,140,0.72)] !text-white hover:!bg-[rgba(154,118,176,0.88)]`,
  secondary: `${base} !border !border-white/25 !bg-[rgba(120,92,140,0.34)] !text-white hover:!bg-[rgba(120,92,140,0.55)]`,
  ghost: `${base} !h-11 !border !border-white/20 !bg-transparent !text-[#d6b9cd] hover:!bg-[rgba(120,92,140,0.34)] hover:!text-white`,
};

export function ActionButton({
  children,
  onClick,
  variant,
  disabled = false,
  busy = false,
  className,
}: {
  children: string;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  busy?: boolean;
  className?: string;
}) {
  const screen = useGameStore((state) => state.screen);
  const blocked = disabled || busy;
  return (
    <Button
      type="button"
      variant={variants[variant]}
      size="lg"
      className={cn(looks[variant], className)}
      aria-disabled={blocked || undefined}
      aria-busy={busy || undefined}
      onClick={() => {
        if (!blocked) {
          countClick(children, screen);
          onClick();
        }
      }}
    >
      {children}
    </Button>
  );
}

export function TicketLink({
  locked = false,
  variant = 'secondary',
}: {
  locked?: boolean;
  variant?: 'primary' | 'secondary';
}) {
  const screen = useGameStore((state) => state.screen);
  return (
    <a
      className={cn(
        buttonVariants({ variant: 'outline', size: 'lg' }),
        looks[variant],
        styles.ticket,
        '!overflow-visible',
      )}
      href={ticketsUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={locked || undefined}
      onClick={(event) => {
        if (locked) {
          event.preventDefault();
          return;
        }
        countClick(ru.tickets, screen);
        if (screen === 'draw' || screen === 'result') {
          track('ticket_cta_click', { ...eventParams(useGameStore.getState()), screen });
        }
      }}
    >
      <span className={styles.karoSticker} aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}assets/karo-logo.svg`} alt="" />
        <span
          className={styles.karoShine}
          style={{
            maskImage: `url(${import.meta.env.BASE_URL}assets/karo-logo.svg)`,
            WebkitMaskImage: `url(${import.meta.env.BASE_URL}assets/karo-logo.svg)`,
          }}
        />
      </span>
      {ru.tickets}
    </a>
  );
}

export function ShareLink({ href, children }: { href: string; children: string }) {
  const screen = useGameStore((state) => state.screen);
  return (
    <a
      className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), looks.ghost, '!h-11 !px-3 !text-[0.72rem] !tracking-[0.06em]')}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        countClick(children, screen);
        track('share_click', eventParams(useGameStore.getState()));
      }}
    >
      {children}
    </a>
  );
}

export function ShareSheet({
  siteUrl,
  onDownload,
  onCopy,
  onClose,
  children,
}: {
  siteUrl: string;
  onDownload: () => void;
  onCopy: () => void;
  onClose: () => void;
  children?: ReactNode;
}) {
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="gap-3 rounded-none border-[#e0c0d8]/30 bg-[#120c14] pb-6 text-[#f7f5f3]"
      >
        <SheetHeader>
          <SheetTitle className="font-[family-name:var(--font-display)] tracking-[0.16em] text-[#e0c0d8] uppercase">
            {ru.result.share}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-4">
          <ActionButton variant="secondary" onClick={onDownload}>
            {ru.download}
          </ActionButton>
          <ActionButton variant="secondary" onClick={onCopy}>
            {ru.share.copyLink}
          </ActionButton>
          <input
            className={styles.linkField}
            readOnly
            value={siteUrl}
            onFocus={(event) => event.currentTarget.select()}
          />
          {children}
          <ActionButton variant="ghost" onClick={onClose}>
            {ru.service.close}
          </ActionButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Toast({ text }: { text: string }) {
  return (
    <p className={styles.toast} role="status">
      {text}
    </p>
  );
}
