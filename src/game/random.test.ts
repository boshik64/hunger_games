import { describe, expect, it } from 'vitest';
import { REJECTION_LIMIT, drawDistrict, type Uint32Source } from './random';

function mulberry32(seed: number): Uint32Source {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) >>> 0;
  };
}

describe('drawDistrict', () => {
  it('maps the first twelve residues onto districts 1..12', () => {
    for (let value = 0; value < 12; value += 1) {
      expect(drawDistrict(() => value)).toBe(value + 1);
    }
  });

  it('rejects the biased tail and uses the next value', () => {
    const tail = [REJECTION_LIMIT, REJECTION_LIMIT + 1, REJECTION_LIMIT + 2, REJECTION_LIMIT + 3];
    let index = 0;
    const source: Uint32Source = () => {
      const value = index < tail.length ? tail[index]! : 11;
      index += 1;
      return value;
    };

    expect(drawDistrict(source)).toBe(12);
    expect(index).toBe(5);
  });

  it('keeps every district within ±3% across 120000 draws', () => {
    const source = mulberry32(0xdecaf);
    const counts = Array.from({ length: 12 }, () => 0);
    const total = 120_000;

    for (let i = 0; i < total; i += 1) {
      const district = drawDistrict(source);
      counts[district - 1] = (counts[district - 1] ?? 0) + 1;
    }

    const expected = total / 12;
    for (const count of counts) {
      expect(count).toBeGreaterThan(0);
      expect(Math.abs(count - expected) / expected).toBeLessThanOrEqual(0.03);
    }
  });

  it('reaches all 12 districts through the default source', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 2_000; i += 1) {
      const district = drawDistrict();
      expect(district).toBeGreaterThanOrEqual(1);
      expect(district).toBeLessThanOrEqual(12);
      seen.add(district);
    }
    expect(seen.size).toBe(12);
  });
});
