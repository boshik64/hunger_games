import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dir = join(root, 'public/assets/final');
mkdirSync(dir, { recursive: true });

const accents = [
  '#e7b2b2',
  '#e2c09a',
  '#e6d48a',
  '#b7d7a8',
  '#9ed7b4',
  '#9fd4c4',
  '#a9d4dc',
  '#b7cbe4',
  '#c5c3ef',
  '#d7b6ea',
  '#e7b4d8',
  '#e7b4c0',
];

const glyphs = [
  '<polygon points="256,118 312,190 256,262 200,190" fill="none" stroke="ACCENT" stroke-width="14" stroke-linejoin="round"/>',
  '<path d="M256 112l78 32v62c0 54-34 86-78 104-44-18-78-50-78-104v-62z" fill="none" stroke="ACCENT" stroke-width="14" stroke-linejoin="round"/>',
  '<rect x="196" y="150" width="120" height="84" rx="10" fill="none" stroke="ACCENT" stroke-width="14"/><path d="M220 150v-22M256 150v-22M292 150v-22M220 234v22M256 234v22M292 234v22" stroke="ACCENT" stroke-width="10" stroke-linecap="round"/>',
  '<path d="M176 214c28-44 52-44 80 0s52 44 80 0" fill="none" stroke="ACCENT" stroke-width="14" stroke-linecap="round"/><path d="M196 168c16-28 28-28 44 0" fill="none" stroke="ACCENT" stroke-width="10" stroke-linecap="round"/>',
  '<polygon points="278,112 214,214 250,214 234,292 310,186 270,186" fill="ACCENT"/>',
  '<circle cx="214" cy="214" r="28" fill="none" stroke="ACCENT" stroke-width="14"/><circle cx="310" cy="214" r="28" fill="none" stroke="ACCENT" stroke-width="14"/><path d="M186 168h152" stroke="ACCENT" stroke-width="14" stroke-linecap="round"/>',
  '<path d="M256 118l62 108H194z" fill="none" stroke="ACCENT" stroke-width="14" stroke-linejoin="round"/><path d="M256 214v62" stroke="ACCENT" stroke-width="14" stroke-linecap="round"/>',
  '<path d="M196 150h120M196 190h120M196 230h120M216 134v112M256 134v112M296 134v112" stroke="ACCENT" stroke-width="10" stroke-linecap="round"/>',
  '<path d="M256 118v150M256 150c-28-8-48-28-48-28M256 174c28-8 48-28 48-28M256 198c-24-6-40-22-40-22M256 220c24-6 40-22 40-22" fill="none" stroke="ACCENT" stroke-width="12" stroke-linecap="round"/>',
  '<path d="M196 236c40-8 70-40 88-92 28 36 36 78 20 118-28 8-68 4-108-26z" fill="none" stroke="ACCENT" stroke-width="14" stroke-linejoin="round"/>',
  '<path d="M286 128c-70 10-110 70-96 128 48-6 92-40 96-128z" fill="none" stroke="ACCENT" stroke-width="14" stroke-linejoin="round"/><path d="M214 250c28-20 52-52 72-122" stroke="ACCENT" stroke-width="12" stroke-linecap="round"/>',
  '<path d="M196 214l92-92 22 22-92 92H196zM300 140l28 28" fill="none" stroke="ACCENT" stroke-width="14" stroke-linejoin="round" stroke-linecap="round"/>',
];

for (let index = 0; index < 12; index += 1) {
  const accent = accents[index];
  const id = index + 1;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <circle cx="256" cy="256" r="228" fill="#14110e" stroke="${accent}" stroke-width="16"/>
  <circle cx="256" cy="256" r="188" fill="none" stroke="${accent}" stroke-width="2" opacity="0.55"/>
  ${glyphs[index].replaceAll('ACCENT', accent)}
  <text x="256" y="392" text-anchor="middle" fill="${accent}" font-family="Oswald, Arial Narrow, sans-serif" font-size="54" font-weight="600">${id}</text>
</svg>
`;
  writeFileSync(join(dir, `district-${id}.svg`), svg);
}

const items = {
  flask: '<path d="M112 46h32M118 46c6 28 8 40 8 58 0 10-8 18-18 22v78a28 28 0 0 0 56 0v-78c-10-4-18-12-18-22 0-18 2-30 8-58" fill="none" stroke="#e2a15c" stroke-width="10" stroke-linecap="round"/><path d="M118 150h52" stroke="#e2a15c" stroke-width="10" stroke-linecap="round"/>',
  rope: '<path d="M78 128c28-36 72-36 100 0s72 36 100 0" fill="none" stroke="#e2a15c" stroke-width="12" stroke-linecap="round"/><path d="M78 168c28-36 72-36 100 0s72 36 100 0" fill="none" stroke="#e2a15c" stroke-width="12" stroke-linecap="round"/><circle cx="78" cy="148" r="10" fill="#e2a15c"/><circle cx="178" cy="148" r="10" fill="#e2a15c"/>',
  medkit:
    '<rect x="58" y="64" width="140" height="128" rx="18" fill="none" stroke="#e2a15c" stroke-width="10"/><path d="M108 64v-16a20 20 0 0 1 40 0v16" fill="none" stroke="#e2a15c" stroke-width="10"/><path d="M128 100v56M100 128h56" stroke="#e2a15c" stroke-width="12" stroke-linecap="round"/>',
};

for (const [name, body] of Object.entries(items)) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="36" fill="#1c1916"/>
  ${body}
</svg>
`;
  writeFileSync(join(dir, `item-${name}.svg`), svg);
}

writeFileSync(
  join(dir, 'wordmark.svg'),
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 220">
  <text x="450" y="92" text-anchor="middle" fill="#f4efe6" font-family="Oswald, Arial Narrow, sans-serif" font-size="68" font-weight="600" letter-spacing="3">ГОЛОДНЫЕ ИГРЫ</text>
  <text x="450" y="168" text-anchor="middle" fill="#d4894a" font-family="Oswald, Arial Narrow, sans-serif" font-size="46" font-weight="500" letter-spacing="8">РАССВЕТ ЖАТВЫ</text>
</svg>
`,
);

writeFileSync(
  join(dir, 'logo-karo.svg'),
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 160">
  <text x="320" y="112" text-anchor="middle" fill="#f4efe6" font-family="Oswald, Arial Narrow, sans-serif" font-size="92" font-weight="600" letter-spacing="16">КАРО</text>
</svg>
`,
);
