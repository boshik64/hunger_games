import { describe, expect, it } from 'vitest';
import { isValidCode, normalizeCode } from './code';

describe('raffle code', () => {
  it('normalizes booking codes to 7 uppercase alphanumerics', () => {
    expect(normalizeCode(' ab-12cd ')).toBe('AB12CD');
    expect(normalizeCode('abc1234')).toBe('ABC1234');
    expect(isValidCode(normalizeCode('abc1234'))).toBe(true);
    expect(isValidCode(normalizeCode('short'))).toBe(false);
    expect(isValidCode(normalizeCode('toolong1'))).toBe(false);
  });
});
