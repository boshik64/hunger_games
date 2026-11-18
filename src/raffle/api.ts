import { isValidCode, normalizeCode } from './code';

export type RaffleError = 'bad_captcha' | 'bad_code' | 'duplicate' | 'network' | 'invalid_json';

export interface CaptchaChallenge {
  id: string;
  challenge: string;
}

export async function fetchCaptcha(): Promise<CaptchaChallenge> {
  const response = await fetch('/api/raffle/captcha', { method: 'GET', cache: 'no-store' });
  if (!response.ok) throw new Error('network');
  return (await response.json()) as CaptchaChallenge;
}

export async function submitRaffle(input: {
  code: string;
  captchaId: string;
  captchaAnswer: string;
}): Promise<{ ok: true } | { ok: false; error: RaffleError }> {
  const code = normalizeCode(input.code);
  if (!isValidCode(code)) return { ok: false, error: 'bad_code' };

  try {
    const response = await fetch('/api/raffle', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        code,
        captchaId: input.captchaId,
        captchaAnswer: input.captchaAnswer,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: RaffleError };
    if (response.ok && data.ok) return { ok: true };
    return { ok: false, error: data.error ?? 'network' };
  } catch {
    return { ok: false, error: 'network' };
  }
}
