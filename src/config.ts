export const ticketsUrl = import.meta.env.VITE_TICKETS_URL || 'https://www.karofilm.ru/film/16396';
export const siteUrl = import.meta.env.VITE_SITE_URL || 'https://golodnyeigry.karofilm.ru/';
export const rewardRulesUrl =
  'https://static.karofilm.ru/v3k/uploads/filemanager/offer/rules_tvoya_nagrada.pdf?_t=1795690184';
export const rewardPath = '/reward';
export const statsPath = '/stats';
export const themeAudioUrl =
  'https://firebasestorage.googleapis.com/v0/b/hungergamesboss-e8cb7.appspot.com/o/sotr-v4%2FHunger-Games-Love-Reign-Over-Me-Instrumental.mp3?alt=media';

/** BrowserRouter basename from Vite `base` (`./` → undefined). */
export function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL || '/';
  const cleaned = base.replace(/\/$/, '').replace(/^\./, '');
  return cleaned || undefined;
}

export function siteLabel(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
