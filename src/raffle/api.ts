import { isValidCode, normalizeCode } from './code';

export type RaffleError = 'bad_captcha' | 'bad_code' | 'duplicate' | 'network' | 'invalid_json';

export async function submitRaffle(input: {
  code: string;
  captchaA: number;
  captchaB: number;
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
        captchaA: input.captchaA,
        captchaB: input.captchaB,
        captchaAnswer: input.captchaAnswer,
      }),
    });
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return { ok: false, error: 'network' };
    }
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: RaffleError };
    if (response.ok && data.ok) return { ok: true };
    return { ok: false, error: data.error ?? 'network' };
  } catch {
    return { ok: false, error: 'network' };
  }
}
