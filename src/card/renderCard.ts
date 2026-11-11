import { FONT_BODY, FONT_DISPLAY, FONT_GLYPH_SAMPLE } from '../assets/fonts';
import { getAsset } from '../assets/manifest';
import type { ItemId } from '../game/types';

const WIDTH = 1080;
const HEIGHT = 1920;

export interface CardSnapshot {
  district: number;
  districtTitle: string;
  tagline: string;
  accent: string;
  itemId: ItemId;
  itemName: string;
  characteristicName: string;
  phrase: string;
  explanation: string;
  filmTitle: string;
  fileSlug: string;
}

export interface PreparedCard {
  blob: Blob;
  file: File;
  objectUrl: string;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = wrap(ctx, text, maxWidth);
  for (const line of lines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += lineHeight;
  }
  return y;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      try {
        const data = canvas.toDataURL('image/png');
        const binary = atob(data.split(',')[1] ?? '');
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
          bytes[index] = binary.charCodeAt(index);
        }
        resolve(new Blob([bytes], { type: 'image/png' }));
      } catch (error) {
        reject(error);
      }
    }, 'image/png');
  });
}

export async function renderCard(snapshot: CardSnapshot): Promise<PreparedCard> {
  await Promise.all([
    document.fonts.load(`700 72px "${FONT_DISPLAY}"`, FONT_GLYPH_SAMPLE),
    document.fonts.load(`600 48px "${FONT_DISPLAY}"`, FONT_GLYPH_SAMPLE),
    document.fonts.load(`400 36px "${FONT_BODY}"`, FONT_GLYPH_SAMPLE),
    document.fonts.ready,
  ]);

  const symbolId = `district.symbol.${snapshot.district}`;
  const [background, symbol, itemIcon, wordmark] = await Promise.all([
    loadImage(getAsset('card.bg').src),
    loadImage(getAsset(symbolId).src),
    loadImage(getAsset(`item.${snapshot.itemId}`).src),
    loadImage(getAsset('wordmark.film').src),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable');

  ctx.fillStyle = '#1a1613';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  if (background) {
    const scale = Math.max(WIDTH / background.width, HEIGHT / background.height);
    const drawnWidth = background.width * scale;
    const drawnHeight = background.height * scale;
    ctx.drawImage(
      background,
      (WIDTH - drawnWidth) / 2,
      (HEIGHT - drawnHeight) / 2,
      drawnWidth,
      drawnHeight,
    );
  }

  const shade = ctx.createLinearGradient(0, 860, 0, HEIGHT);
  shade.addColorStop(0, 'rgba(12, 10, 8, 0)');
  shade.addColorStop(0.22, 'rgba(12, 10, 8, 0.9)');
  shade.addColorStop(0.48, 'rgba(12, 10, 8, 0.97)');
  shade.addColorStop(1, '#0c0a08');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 860, WIDTH, HEIGHT - 860);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  if (wordmark) {
    const logoWidth = 780;
    const logoHeight = Math.round((logoWidth * wordmark.height) / wordmark.width);
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 8;
    ctx.drawImage(wordmark, (WIDTH - logoWidth) / 2, 64, logoWidth, logoHeight);
    ctx.restore();
  } else {
    ctx.fillStyle = '#f4efe6';
    ctx.font = `700 52px "${FONT_DISPLAY}", sans-serif`;
    drawCentered(ctx, snapshot.filmTitle, 150, 920, 62);
  }

  let y = 1020;

  ctx.fillStyle = snapshot.accent;
  ctx.font = `600 40px "${FONT_DISPLAY}", sans-serif`;
  y = drawCentered(ctx, snapshot.districtTitle, y + 12, 900, 48);

  if (symbol) {
    const size = 132;
    ctx.drawImage(symbol, (WIDTH - size) / 2, y, size, size);
    y += size + 28;
  }

  ctx.fillStyle = '#d9cbb8';
  ctx.font = `400 30px "${FONT_BODY}", sans-serif`;
  y = drawCentered(ctx, snapshot.tagline, y, 860, 40);

  ctx.fillStyle = '#f4efe6';
  ctx.font = `700 68px "${FONT_DISPLAY}", sans-serif`;
  y = drawCentered(ctx, snapshot.characteristicName, y + 18, 900, 78);

  ctx.fillStyle = '#f4efe6';
  ctx.font = `400 34px "${FONT_BODY}", sans-serif`;
  y = drawCentered(ctx, snapshot.phrase, y + 6, 880, 46);
  y = drawCentered(ctx, snapshot.explanation, y + 8, 880, 46);

  if (itemIcon) {
    const size = 88;
    ctx.drawImage(itemIcon, WIDTH / 2 - 180, y + 8, size, size);
  }
  ctx.fillStyle = '#f4efe6';
  ctx.font = `600 36px "${FONT_DISPLAY}", sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(snapshot.itemName, WIDTH / 2 - 76, y + 64);
  ctx.textAlign = 'center';

  const blob = await canvasToBlob(canvas);
  const filename = `hunger-games-d${snapshot.district}-${snapshot.fileSlug}.png`;
  const file = new File([blob], filename, { type: 'image/png', lastModified: Date.now() });
  return { blob, file, objectUrl: URL.createObjectURL(blob) };
}
