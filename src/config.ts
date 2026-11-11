export const ticketsUrl = import.meta.env.VITE_TICKETS_URL || 'https://www.karofilm.ru/film/16396';
export const siteUrl = import.meta.env.VITE_SITE_URL || 'https://example.com/hunger-games/';
export const themeAudioUrl =
  'https://firebasestorage.googleapis.com/v0/b/hungergamesboss-e8cb7.appspot.com/o/sotr-v4%2FHunger-Games-Love-Reign-Over-Me-Instrumental.mp3?alt=media';

export function siteLabel(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
