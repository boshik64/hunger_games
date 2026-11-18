# Hunger Games — контекст для агента

Промолендинг-мини-игра сети КАРО к фильму **«Голодные игры: Рассвет жатвы»**. Статический SPA без бэкенда и регистрации. Цель гостя: дистрикт → парад → навык → оценка спонсоров → предмет → стратегия → результат + шаринг карточки + CTA «Выбрать сеанс».

Исходный бриф: `CURSOR_PROMPT_Hunger_Games_Landing.md` (часть пунктов устарела — ориентируйся на этот файл и `docs/`). Решения по неоднозначностям: `docs/DECISIONS.md`. Ассеты: `docs/ASSETS.md`. Чеклист: `docs/QA.md`.

## Стек

- Vite 7 + React 18 + TypeScript (strict)
- Zustand + `persist` в `sessionStorage` (`kg:v1`)
- Tailwind 4 + shadcn/ui (radix-nova) + CSS-токены (`src/styles/`)
- Vitest; ESLint + Prettier
- pnpm; `base: './'` (деплой в подкаталог)

## Команды

```bash
pnpm dev
pnpm build          # tsc --noEmit && vite build
pnpm test
pnpm run typecheck
pnpm run lint
pnpm run ci         # typecheck + lint + test
pnpm run check:assets
```

Env (см. `.env.example`): `VITE_SITE_URL`, `VITE_TICKETS_URL`, `VITE_ANALYTICS_ID`, `VITE_ANALYTICS_DEBUG`.

## Поток экранов

Порядок жёсткий (не URL-роуты — только `state.screen`):

`draw → outfit → skill → score → item → strategy → result`

| Экран | Выбор | Ключевые действия стора |
|---|---|---|
| draw | дистрикт 1..12 (RNG) | `startDraw` → `finishDraw` → `prepare` |
| outfit | wedding / fire / suit | `selectOutfit` → `confirmOutfit` → `openSkill` |
| skill | 3 из 6 навыков | `selectSkill` → `confirmSkill` → `revealScore` |
| score | оценка 8..12 | `acceptGift` |
| item | flask / rope / medkit | `selectItem` → `confirmItem` |
| strategy | risk / careful | `selectStrategy` → `confirmStrategy` |
| result | шаринг / билеты / replay | `replay` сбрасывает всё, включая дистрикт |

Характеристика результата **не** в сторе: только `resolveResult(item, strategy)` из `src/content/results.ts` (6 комбинаций → strategist / daredevil / tactician / survivor).

Не персистятся: `isDrawing`, `isTransitioning`, `pending*`, `seal*`. Гидрация ручная (`skipHydration`).

## Структура `src/`

```
app/         App, ScreenRouter, DistrictSpin, visualScreen
screens/     Draw, Outfit, Skill, Score, Item, Strategy, Result
components/  UI (shadcn), ChoiceGroup, ScreenFrame, ActionButton…
content/     ru.ts (все тексты), results.ts, districts.ts
game/        store, types, persistence, random, selectors
card/        renderCard (canvas 1080×1920)
analytics/   dataLayer + dedupe + activeTime + counters
assets/      manifest.ts, fonts.ts
share/       links
styles/      tokens, global, fonts, motion
```

## Жёсткие правила

1. **Видимый текст только из `src/content/ru.ts`.** Дословные объяснения шести комбинаций — в `results.ts`. Не править копирайт «на глаз».
2. **Ассеты только через `src/assets/manifest.ts`.** Замена слоя = файл + манифест + `pnpm run check:assets`. Подписи дистриктов пока плейсхолдеры (`isPlaceholder: true`).
3. **Нет бэкенда.** Состояние — сессия браузера. Клики также пишутся в `data/clicks.json` (dev plugin) и `localStorage` `kg:stats:v1`.
4. **Mobile-first**, шаг в один экран без внутренней прокрутки кадра. Учитывать `prefers-reduced-motion`.
5. Клик по карточке **не** меняет экран — только confirm-кнопка. Пока `isDrawing || isTransitioning` — guards в сторе блокируют действия.
6. CTA «Выбрать сеанс» → `VITE_TICKETS_URL` (`src/config.ts`). Не блокировать во время жеребьёвки.
7. Аналитика в `dataLayer`: события в `src/analytics/events.ts`. Не дублировать шаги в одной попытке и тапы < 500 мс. Восстановление сессии события не шлёт.
8. Случайность: `crypto.getRandomValues` + rejection sampling, фолбэк `Math.random` (`game/random.ts`).
9. Не коммитить `.env`, `film_media/`, секреты. Исходники прокатчика лежат в `film_media/` (в `.gitignore`).

## Дизайн-заметки

- Цвета титров с постера: сирень `#e0c0d8`, белый `#f7f5f3`.
- Фоны экранов — кадры прокатчика в `public/assets/final/`.
- Гербы дистриктов, иконки предметов, наборное «КАРО» — оригинальные SVG проекта.
- Футер: `12+ · Голодные игры: Рассвет жатвы` (+ дистрибьютор в решениях: АТМОСФЕРА КИНО).
- Карточка гостя без адреса сайта; шаринг через `navigator.share` или fallback «скачать / скопировать».

## При спорных правках

1. Сверься с `docs/DECISIONS.md` и текущим кодом стора/роутера.
2. Если ТЗ/бриф расходятся с кодом — код и `DECISIONS.md` важнее устаревших разделов промпта (там ещё «4 экрана» и «без Tailwind»).
3. Новое неоднозначное решение — одна строка в `docs/DECISIONS.md`, без расползания scope.
