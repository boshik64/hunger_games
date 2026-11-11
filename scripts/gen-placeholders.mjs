import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dir = path.join(root, 'public', 'assets', 'placeholders');

const districts = [
  [1, '#742525', 'предметы роскоши'],
  [2, '#71451e', 'камнеобработка и оборона'],
  [3, '#5c541f', 'технологии'],
  [4, '#446222', 'рыболовство'],
  [5, '#21632a', 'энергетика'],
  [6, '#22624b', 'транспорт'],
  [7, '#225a62', 'лесозаготовка'],
  [8, '#254d74', 'текстиль'],
  [9, '#2a277c', 'зерно'],
  [10, '#4d2871', 'скотоводство'],
  [11, '#732663', 'сельское хозяйство'],
  [12, '#742542', 'угледобыча'],
];

function esc(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function plate({ w, h, lines, accent = '#d4894a', mark = '', top = false }) {
  const wide = w > h * 1.3;
  const size0 = top ? 48 : Math.round(wide ? Math.min(w * 0.046, h * 0.18) : w * 0.072);
  const size1 = top ? 34 : Math.round(size0 * 0.72);
  const pad = Math.max(8, Math.round(Math.min(w, h) * 0.05));
  const text = lines
    .map((line, index) => {
      const size = index === 0 ? size0 : size1;
      const fill = index === 0 ? '#f4efe6' : '#d9cbb8';
      const y = top
        ? 150 + index * size * 1.25
        : Math.round(h * (mark ? 0.64 : 0.52) + index * size * 1.35);
      return `<text x="${w / 2}" y="${y}" text-anchor="middle" fill="${fill}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${index === 0 ? 700 : 500}">${esc(line)}</text>`;
    })
    .join('\n');
  const hero = mark
    ? `<text x="${w / 2}" y="${Math.round(h * 0.44)}" text-anchor="middle" fill="${accent}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(h * 0.24)}" font-weight="700">${esc(mark)}</text>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
  <rect width="${w}" height="${h}" fill="#1a1613"/>
  <rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" fill="#241c17" stroke="${accent}" stroke-width="${Math.max(3, Math.round(Math.min(w, h) * 0.012))}" rx="${Math.round(pad * 0.7)}"/>
  ${top ? '' : `<text x="${w / 2}" y="${Math.round(h * (mark ? 0.16 : 0.28))}" text-anchor="middle" fill="#c4a36a" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(wide ? Math.min(w * 0.03, h * 0.12) : w * 0.042)}" font-weight="700" letter-spacing="2">ПЛЕЙСХОЛДЕР</text>`}
  ${hero}
  ${text}
</svg>
`;
}

const files = [
  [
    'scene-draw.svg',
    plate({
      w: 1200,
      h: 720,
      lines: ['Фон жеребьёвки', 'Рассвет над ареной и чаша с именами'],
    }),
  ],
  [
    'scene-item.svg',
    plate({
      w: 1200,
      h: 640,
      lines: ['Фон выбора снаряжения', 'Стол с предметами перед выходом на арену'],
    }),
  ],
  [
    'scene-strategy.svg',
    plate({
      w: 1200,
      h: 640,
      lines: ['Фон развилки', 'Туман над ареной, овраг слева и лес справа'],
    }),
  ],
  [
    'scene-result.svg',
    plate({
      w: 1200,
      h: 720,
      lines: ['Фон результата', 'Рассвет после испытания, арена позади'],
    }),
  ],
  [
    'path-ravine.svg',
    plate({
      w: 800,
      h: 480,
      accent: '#8a5a3a',
      lines: ['Короткий путь', 'Овраг, через который нужно перепрыгнуть'],
    }),
  ],
  [
    'path-forest.svg',
    plate({
      w: 800,
      h: 480,
      accent: '#3e6a45',
      lines: ['Длинный путь', 'Лес без опасного прыжка'],
    }),
  ],
  [
    'item-flask.svg',
    plate({
      w: 800,
      h: 420,
      lines: ['Иконка предмета', 'Фляга с водой'],
    }),
  ],
  [
    'item-rope.svg',
    plate({
      w: 800,
      h: 420,
      lines: ['Иконка предмета', 'Моток верёвки'],
    }),
  ],
  [
    'item-medkit.svg',
    plate({
      w: 800,
      h: 420,
      lines: ['Иконка предмета', 'Походная аптечка'],
    }),
  ],
  [
    'logo-karo.svg',
    plate({
      w: 800,
      h: 320,
      lines: ['Логотип КАРО', 'Сеть кинотеатров'],
    }),
  ],
  [
    'wordmark.svg',
    plate({
      w: 800,
      h: 320,
      lines: ['Название фильма', 'Голодные игры: Рассвет жатвы'],
    }),
  ],
  [
    'card-bg.svg',
    plate({
      w: 1080,
      h: 1920,
      top: true,
      lines: ['Плейсхолдер фона карточки', 'Тематическое оформление для сторис'],
    }),
  ],
  ...districts.map(([id, accent, tagline]) => [
    `district-${id}.svg`,
    plate({
      w: 512,
      h: 512,
      accent,
      mark: String(id),
      lines: ['Символ дистрикта', tagline],
    }),
  ]),
];

await mkdir(dir, { recursive: true });
await Promise.all(files.map(([name, svg]) => writeFile(path.join(dir, name), svg)));
await writeFile(
  path.join(root, 'public', 'og-cover.svg'),
  plate({
    w: 1200,
    h: 630,
    lines: ['Обложка для соцсетей', 'Голодные игры: Рассвет жатвы, 1200×630'],
  }),
);
console.log(`wrote ${files.length + 1} placeholders`);
