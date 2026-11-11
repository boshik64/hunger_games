export function telegramShareUrl(message: string, url: string) {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
}

export function vkShareUrl(message: string, url: string, imageUrl: string) {
  const params = new URLSearchParams({
    url,
    title: message,
    image: imageUrl,
    noparse: '1',
  });
  return `https://vk.com/share.php?${params.toString()}`;
}

export function ogImageUrl(site: string) {
  return new URL('og-cover.jpg', site).href;
}
