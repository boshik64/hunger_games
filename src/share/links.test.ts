import { describe, expect, it } from 'vitest';
import { ogImageUrl, telegramShareUrl, vkShareUrl } from './links';

const url = 'https://example.com/hunger-games/';
const message = 'Смельчак, Дистрикт 7. Узнай свой дистрикт';

describe('share links', () => {
  it('gives Telegram the phrase and the page, with spaces as %20', () => {
    const href = telegramShareUrl(message, url);
    const parsed = new URL(href);
    expect(parsed.origin + parsed.pathname).toBe('https://t.me/share/url');
    expect(parsed.searchParams.get('text')).toBe(message);
    expect(parsed.searchParams.get('url')).toBe(url);
    expect(href.includes('+')).toBe(false);
    expect(parsed.searchParams.get('text')?.includes(url)).toBe(false);
  });

  it('gives VK the phrase, the page and the cover', () => {
    const image = ogImageUrl(url);
    const parsed = new URL(vkShareUrl(message, url, image));
    expect(parsed.origin + parsed.pathname).toBe('https://vk.com/share.php');
    expect(parsed.searchParams.get('title')).toBe(message);
    expect(parsed.searchParams.get('url')).toBe(url);
    expect(parsed.searchParams.get('image')).toBe('https://example.com/hunger-games/og-cover.jpg');
    expect(parsed.searchParams.get('noparse')).toBe('1');
  });
});
