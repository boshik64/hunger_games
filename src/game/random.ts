const DISTRICT_COUNT = 12;
const UINT32_SPAN = 2 ** 32;

/** Values at or above this limit are rejected so `% 12` stays uniform. */
export const REJECTION_LIMIT = Math.floor(UINT32_SPAN / DISTRICT_COUNT) * DISTRICT_COUNT;

export type Uint32Source = () => number;

function defaultUint32(): number {
  try {
    const cryptoObj = globalThis.crypto;
    if (cryptoObj?.getRandomValues) {
      const buf = new Uint32Array(1);
      cryptoObj.getRandomValues(buf);
      return buf[0] ?? 0;
    }
  } catch {
    // crypto can throw in locked-down contexts; fall through to Math.random.
  }
  return Math.floor(Math.random() * UINT32_SPAN);
}

/**
 * Uniform district 1..12.
 * Uses crypto.getRandomValues and rejection sampling. Math.random is the fallback
 * when crypto is missing, or when a source keeps landing in the rejected tail.
 */
export function drawDistrict(source: Uint32Source = defaultUint32): number {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const value = source() >>> 0;
    if (value < REJECTION_LIMIT) {
      return (value % DISTRICT_COUNT) + 1;
    }
  }
  return Math.floor(Math.random() * DISTRICT_COUNT) + 1;
}
