# Ассеты

Фото и постеры — из папки `film_media/` (материалы прокатчика). Символы дистриктов, иконки предметов, наборный логотип «КАРО» и наборный титр фильма нарисованы в проекте: в поставке не было гербов, иконок снаряжения и отдельного файла логотипа сети.

| id | файл | источник |
|---|---|---|
| scene.draw | public/assets/final/scene-draw.webp | SOLSTICE_PayoffDueling_Tributes_DigitalPoster_1280x1920.jpg |
| scene.item | public/assets/final/scene-item.webp | SOLSTICE_UNIT_250924_01842R_CropC.jpg |
| scene.strategy, path.forest | public/assets/final/scene-strategy.webp, path-forest.webp | SOLSTICE_UNIT_250916_00315RC.jpg |
| path.ravine | public/assets/final/path-ravine.webp | Solstice_Final Trailer Grab_00004RC.jpg |
| scene.result | public/assets/final/scene-result.webp | SOLSTICE_CHAR_HAYMITCH_1280x1920 (2).jpg |
| card.bg | public/assets/final/card-bg.webp | постер трибутов, кроп на карточку |
| og.cover | public/og-cover.jpg | SOLSTICE_PayoffDueling_1920x1080_01.jpg, 1200×630 |
| district.symbol.1–12 | public/assets/final/district-N.svg | оригинальные печати, `scripts/gen-marks.mjs` |
| item.flask, item.rope, item.medkit | public/assets/final/item-*.svg | оригинальные иконки |
| wordmark.film | public/assets/final/wordmark.svg | наборный титр названия |
| logo.karo | public/assets/final/logo-karo.svg | наборное «КАРО», пока нет официального SVG |

Подписи дистриктов в `src/content/districts.ts` по-прежнему временные (`isPlaceholder: true`): роскошь, камнеобработка и оборона, технологии, рыболовство, энергетика, транспорт, лесозаготовка, текстиль, зерно, скотоводство, сельское хозяйство, угледобыча.

Замена слоя: положить файл, поправить `src` и размеры в `src/assets/manifest.ts`, запустить `pnpm run check:assets`.
