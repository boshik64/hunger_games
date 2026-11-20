import { describe, expect, it } from 'vitest';
import { encodeJpegPdf, wrapLines } from './reportPdf';

function ascii(bytes: Uint8Array, needle: string) {
  const encoded = new TextEncoder().encode(needle);
  outer: for (let index = 0; index <= bytes.length - encoded.length; index += 1) {
    for (let offset = 0; offset < encoded.length; offset += 1) {
      if (bytes[index + offset] !== encoded[offset]) continue outer;
    }
    return index;
  }
  return -1;
}

describe('stats pdf report', () => {
  it('wraps words onto the next line', () => {
    const lines = wrapLines('Вытянуть жребий ещё раз', 12, (value) => value.length);
    expect(lines).toEqual(['Вытянуть', 'жребий ещё', 'раз']);
  });

  it('splits a token that is wider than the column', () => {
    const lines = wrapLines('ABCDEFGHIJ', 4, (value) => value.length);
    expect(lines).toEqual(['ABCD', 'EFGH', 'IJ']);
  });

  it('writes one pdf page per jpeg', () => {
    const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]);
    const pdf = encodeJpegPdf([
      { width: 4, height: 6, jpeg },
      { width: 4, height: 6, jpeg },
    ]);
    expect(String.fromCharCode(...pdf.slice(0, 5))).toBe('%PDF-');
    expect(ascii(pdf, '/Count 2')).toBeGreaterThan(0);
    expect(ascii(pdf, '/Filter /DCTDecode')).toBeGreaterThan(0);
    const start = ascii(pdf, 'startxref\n');
    expect(start).toBeGreaterThan(0);
    const digits = new TextDecoder().decode(pdf.slice(start + 'startxref\n'.length, start + 40));
    const offset = Number(digits.split('\n')[0]);
    expect(new TextDecoder().decode(pdf.slice(offset, offset + 4))).toBe('xref');
  });
});