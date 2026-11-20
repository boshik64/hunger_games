import { FONT_BODY, FONT_DISPLAY, FONT_GLYPH_SAMPLE } from '../assets/fonts';
import { ru } from '../content/ru';
import type { StatsDashboard } from './api';

const W = 1240;
const H = 1754;
const M = 72;
const BOTTOM = 78;
const CONTENT_W = W - M * 2;

const ink = '#1c1218';
const muted = '#6d5a68';
const accent = '#785c8c';
const paper = '#f7f5f3';
const track = '#eadfe6';

const clock = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'Europe/Moscow',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const dayStamp = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Moscow',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function wrapLines(
  text: string,
  maxWidth: number,
  measure: (value: string) => number,
): string[] {
  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [''];
  const lines: string[] = [];
  let line = '';

  function take(word: string) {
    if (measure(word) <= maxWidth) {
      line = word;
      return;
    }
    let chunk = '';
    for (const char of word) {
      if (chunk && measure(chunk + char) > maxWidth) {
        lines.push(chunk);
        chunk = char;
      } else {
        chunk += char;
      }
    }
    line = chunk;
  }

  for (const word of tokens) {
    if (!line) {
      take(word);
      continue;
    }
    const next = `${line} ${word}`;
    if (measure(next) <= maxWidth) {
      line = next;
      continue;
    }
    lines.push(line);
    line = '';
    take(word);
  }
  if (line) lines.push(line);
  return lines.length > 0 ? lines : [''];
}

function ellipsis(ctx: CanvasRenderingContext2D, value: string, maxWidth: number): string {
  if (ctx.measureText(value).width <= maxWidth) return value;
  let next = value;
  while (next.length > 1 && ctx.measureText(`${next}…`).width > maxWidth) next = next.slice(0, -1);
  return `${next}…`;
}

class Sheets {
  readonly pages: HTMLCanvasElement[] = [];
  private ctx!: CanvasRenderingContext2D;
  private y = 0;
  private repeat: (() => void) | null = null;

  get pen() {
    return this.ctx;
  }

  get cursor() {
    return this.y;
  }

  set cursor(value: number) {
    this.y = value;
  }

  begin() {
    this.add(false);
  }

  ensure(height: number) {
    if (this.y + height <= H - BOTTOM) return;
    this.add(true);
  }

  continueWith(repeat: (() => void) | null) {
    this.repeat = repeat;
  }

  private add(continued: boolean) {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, W, 14);
    this.pages.push(canvas);
    this.ctx = ctx;
    this.y = 48;
    if (continued && this.repeat) this.repeat();
  }
}

function heading(sheets: Sheets, title: string) {
  sheets.continueWith(null);
  sheets.ensure(52);
  const ctx = sheets.pen;
  ctx.font = `500 20px ${FONT_DISPLAY}`;
  ctx.fillStyle = accent;
  ctx.textBaseline = 'top';
  ctx.fillText(title.toUpperCase(), M, sheets.cursor);
  sheets.cursor += 30;
  ctx.fillStyle = track;
  ctx.fillRect(M, sheets.cursor, CONTENT_W, 2);
  sheets.cursor += 18;
  sheets.continueWith(() => {
    const pen = sheets.pen;
    const top = sheets.cursor;
    pen.font = `500 20px ${FONT_DISPLAY}`;
    pen.fillStyle = accent;
    pen.textBaseline = 'top';
    pen.fillText(title.toUpperCase(), M, top);
    pen.fillStyle = track;
    pen.fillRect(M, top + 28, CONTENT_W, 2);
    sheets.cursor = top + 46;
  });
}

function drawCover(sheets: Sheets, total: number, actions: number, people: number) {
  const ctx = sheets.pen;
  ctx.font = `500 18px ${FONT_DISPLAY}`;
  ctx.fillStyle = accent;
  ctx.textBaseline = 'top';
  ctx.fillText(ru.filmTitle.toUpperCase(), M, sheets.cursor);
  sheets.cursor += 36;
  ctx.font = `600 64px ${FONT_DISPLAY}`;
  ctx.fillStyle = ink;
  ctx.fillText(ru.stats.title.toUpperCase(), M, sheets.cursor);
  sheets.cursor += 78;
  ctx.font = `400 22px ${FONT_BODY}`;
  ctx.fillStyle = muted;
  ctx.fillText(ru.stats.lead, M, sheets.cursor);
  sheets.cursor += 34;
  ctx.fillText(ru.stats.generatedAt(clock.format(new Date())), M, sheets.cursor);
  sheets.cursor += 36;

  const gap = 18;
  const boxW = (CONTENT_W - gap * 2) / 3;
  const boxH = 118;
  const stats = [
    [ru.stats.totalClicks, String(total)],
    [ru.stats.actions, String(actions)],
    [ru.stats.participants, String(people)],
  ] as const;
  stats.forEach(([label, value], index) => {
    const x = M + index * (boxW + gap);
    ctx.strokeStyle = '#e0c0d8';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, sheets.cursor, boxW, boxH);
    ctx.font = `500 16px ${FONT_DISPLAY}`;
    ctx.fillStyle = accent;
    ctx.fillText(label.toUpperCase(), x + 18, sheets.cursor + 18);
    ctx.font = `600 48px ${FONT_DISPLAY}`;
    ctx.fillStyle = ink;
    ctx.fillText(value, x + 18, sheets.cursor + 48);
  });
  sheets.cursor += boxH + 28;
}

function drawCounts(sheets: Sheets, counts: Array<[string, number]>) {
  heading(sheets, ru.stats.clicksTitle);
  if (counts.length === 0) {
    sheets.ensure(32);
    sheets.pen.font = `400 20px ${FONT_BODY}`;
    sheets.pen.fillStyle = ink;
    sheets.pen.fillText(ru.stats.emptyClicks, M, sheets.cursor);
    sheets.cursor += 36;
    return;
  }
  const max = counts[0]?.[1] ?? 1;
  for (const [name, value] of counts) {
    sheets.ensure(52);
    const ctx = sheets.pen;
    const y = sheets.cursor;
    const figure = String(value);
    ctx.font = `500 22px ${FONT_DISPLAY}`;
    ctx.textBaseline = 'top';
    const figureW = ctx.measureText(figure).width;
    ctx.font = `400 22px ${FONT_BODY}`;
    ctx.fillStyle = ink;
    ctx.fillText(ellipsis(ctx, name, CONTENT_W - figureW - 20), M, y);
    ctx.font = `500 22px ${FONT_DISPLAY}`;
    ctx.fillStyle = accent;
    ctx.fillText(figure, W - M - figureW, y);
    ctx.fillStyle = track;
    ctx.fillRect(M, y + 30, CONTENT_W, 8);
    ctx.fillStyle = accent;
    const width = Math.max(8, Math.round((value / max) * CONTENT_W));
    ctx.fillRect(M, y + 30, width, 8);
    sheets.cursor = y + 52;
  }
  sheets.cursor += 12;
}

function stampPages(pages: HTMLCanvasElement[]) {
  pages.forEach((canvas, index) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = `400 16px ${FONT_BODY}`;
    ctx.fillStyle = muted;
    ctx.textBaseline = 'top';
    ctx.fillText(ru.filmTitle, M, H - 48);
    const label = ru.stats.pageOf(index + 1, pages.length);
    const width = ctx.measureText(label).width;
    ctx.fillText(label, W - M - width, H - 48);
  });
}

function drawReport(data: StatsDashboard): HTMLCanvasElement[] {
  const counts = Object.entries(data.clicks.counts).sort((a, b) => b[1] - a[1]);
  const total = counts.reduce((sum, [, value]) => sum + value, 0);
  const sheets = new Sheets();
  sheets.begin();
  drawCover(sheets, total, counts.length, data.participants.length);
  drawCounts(sheets, counts);
  stampPages(sheets.pages);
  return sheets.pages;
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('jpeg'));
          return;
        }
        void blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer)), reject);
      },
      'image/jpeg',
      0.86,
    );
  });
}

const encoder = new TextEncoder();

function concat(parts: Uint8Array[]): Uint8Array {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function encodeJpegPdf(
  pages: Array<{ width: number; height: number; jpeg: Uint8Array }>,
): Uint8Array {
  const parts: Uint8Array[] = [];
  let cursor = 0;
  const offsets = [0];

  function add(bytes: Uint8Array) {
    parts.push(bytes);
    cursor += bytes.length;
  }
  function text(value: string) {
    add(encoder.encode(value));
  }
  function write(objectId: number, chunks: Array<string | Uint8Array>) {
    offsets[objectId] = cursor;
    text(`${objectId} 0 obj\n`);
    for (const chunk of chunks) {
      if (typeof chunk === 'string') text(chunk);
      else add(chunk);
    }
    text('\nendobj\n');
  }

  text('%PDF-1.4\n');
  add(Uint8Array.from([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  let id = 3;
  const metas = pages.map((page, index) => {
    const pageId = id++;
    const contentId = id++;
    const imageId = id++;
    return { page, index, pageId, contentId, imageId };
  });

  write(1, ['<< /Type /Catalog /Pages 2 0 R >>']);
  write(2, [
    `<< /Type /Pages /Count ${pages.length} /Kids [${metas.map((meta) => `${meta.pageId} 0 R`).join(' ')}] >>`,
  ]);

  for (const meta of metas) {
    const content = `q\n595.28 0 0 841.89 0 0 cm\n/Im${meta.index} Do\nQ`;
    write(meta.pageId, [
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im${meta.index} ${meta.imageId} 0 R >> >> /Contents ${meta.contentId} 0 R >>`,
    ]);
    write(meta.contentId, [`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`]);
    write(meta.imageId, [
      `<< /Type /XObject /Subtype /Image /Width ${meta.page.width} /Height ${meta.page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${meta.page.jpeg.length} >>\nstream\n`,
      meta.page.jpeg,
      '\nendstream',
    ]);
  }

  const xrefAt = cursor;
  text(`xref\n0 ${offsets.length}\n`);
  text('0000000000 65535 f \n');
  for (let index = 1; index < offsets.length; index += 1) {
    text(`${String(offsets[index]).padStart(10, '0')} 00000 n \n`);
  }
  text(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`);
  return concat(parts);
}

async function loadReportFonts() {
  await Promise.all([
    document.fonts.load(`600 64px "${FONT_DISPLAY}"`, FONT_GLYPH_SAMPLE),
    document.fonts.load(`500 22px "${FONT_DISPLAY}"`, FONT_GLYPH_SAMPLE),
    document.fonts.load(`400 22px "${FONT_BODY}"`, FONT_GLYPH_SAMPLE),
    document.fonts.load(`500 18px "${FONT_BODY}"`, FONT_GLYPH_SAMPLE),
    document.fonts.ready,
  ]);
}

export async function downloadStatsReport(data: StatsDashboard): Promise<void> {
  await loadReportFonts();
  const canvases = drawReport(data);
  const jpegs = await Promise.all(canvases.map(canvasToJpeg));
  const pdf = encodeJpegPdf(
    jpegs.map((jpeg, index) => ({
      width: canvases[index]?.width ?? W,
      height: canvases[index]?.height ?? H,
      jpeg,
    })),
  );
  const blob = new Blob([Uint8Array.from(pdf)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stamp = dayStamp.format(new Date());
  link.href = url;
  link.download = `metriki-${stamp}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
