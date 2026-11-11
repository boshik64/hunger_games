import '../styles/fonts.css';

export const FONT_DISPLAY = 'Oswald';
export const FONT_BODY = 'Inter';

/** Cyrillic sample plus guillemets and em dash. Canvas must load these glyphs, not Latin only. */
export const FONT_GLYPH_SAMPLE =
  'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789«»—';

export interface FontFaceSpec {
  family: string;
  weight: 400 | 500 | 600 | 700;
  descriptor: string;
}

export const CARD_FONTS: readonly FontFaceSpec[] = [
  { family: FONT_DISPLAY, weight: 500, descriptor: '500 32px Oswald' },
  { family: FONT_DISPLAY, weight: 600, descriptor: '600 64px Oswald' },
  { family: FONT_DISPLAY, weight: 700, descriptor: '700 72px Oswald' },
  { family: FONT_BODY, weight: 400, descriptor: '400 32px Inter' },
  { family: FONT_BODY, weight: 500, descriptor: '500 32px Inter' },
  { family: FONT_BODY, weight: 600, descriptor: '600 32px Inter' },
];
