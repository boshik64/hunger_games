export interface LocalCaptcha {
  a: number;
  b: number;
  challenge: string;
}

export function createLocalCaptcha(): LocalCaptcha {
  const a = 2 + Math.floor(Math.random() * 8);
  const b = 1 + Math.floor(Math.random() * 9);
  return { a, b, challenge: `${a} + ${b}` };
}
