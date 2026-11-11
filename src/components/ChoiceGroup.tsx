import type { KeyboardEvent } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { countClick } from '../analytics/counters';
import { ru } from '../content/ru';
import { useGameStore } from '../game/store';
import { AssetImage } from './AssetImage';
import styles from './controls.module.css';

export interface ChoiceOption<T extends string> {
  id: T;
  name: string;
  text: string;
  assetId: string;
}

export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  columns,
  disabled = false,
}: {
  label: string;
  options: readonly ChoiceOption<T>[];
  value: T | null;
  onChange: (id: T) => void;
  columns: 2 | 3;
  disabled?: boolean;
}) {
  const screen = useGameStore((state) => state.screen);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const key = event.key;
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
    event.preventDefault();
    if (disabled || options.length === 0) return;
    const current =
      value == null
        ? 0
        : Math.max(
            0,
            options.findIndex((option) => option.id === value),
          );
    let next = current;
    if (key === 'ArrowDown' || key === 'ArrowRight') next = (current + 1) % options.length;
    if (key === 'ArrowUp' || key === 'ArrowLeft')
      next = (current - 1 + options.length) % options.length;
    if (key === 'Home') next = 0;
    if (key === 'End') next = options.length - 1;
    const option = options[next];
    if (!option) return;
    countClick(option.name, screen);
    onChange(option.id);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-choice="${option.id}"]`)?.focus();
  }

  return (
    <div
      className={styles.list}
      role="radiogroup"
      aria-label={label}
      data-columns={columns}
      onKeyDown={onKeyDown}
    >
      {options.map((option, index) => {
        const checked = value === option.id;
        const tabIndex = value == null ? (index === 0 ? 0 : -1) : checked ? 0 : -1;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            data-choice={option.id}
            className={styles.choice}
            aria-checked={checked}
            aria-disabled={disabled || undefined}
            tabIndex={tabIndex}
            onClick={() => {
              if (!disabled) {
                countClick(option.name, screen);
                onChange(option.id);
              }
            }}
          >
            <Card
              size="sm"
              className="!w-full !flex-row !items-center !gap-3 !overflow-visible !rounded-none !bg-transparent !py-0 !text-inherit !shadow-none !ring-0 md:!flex-col md:!items-stretch"
            >
              <AssetImage id={option.assetId} alt="" />
              <CardHeader className="!px-0 !py-0">
                <CardTitle className={styles.name}>{option.name}</CardTitle>
                <CardDescription className={styles.desc}>{option.text}</CardDescription>
              </CardHeader>
            </Card>
            {checked ? (
              <span className={styles.mark} aria-hidden="true">
                ✓
              </span>
            ) : null}
            {checked ? <span className="sr-only">{ru.service.selected}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
