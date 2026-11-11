export interface District {
  id: number;
  title: string;
  tagline: string;
  accent: string;
  symbolAssetId: string;
  isPlaceholder: boolean;
}

/**
 * Taglines are temporary book-canon labels until marketing sends the real copy.
 * Accents stay dark enough for white text at AA (4.5:1).
 */
export const DISTRICTS: readonly District[] = [
  {
    id: 1,
    title: 'Дистрикт 1',
    tagline: 'предметы роскоши',
    accent: '#742525',
    symbolAssetId: 'district.symbol.1',
    isPlaceholder: true,
  },
  {
    id: 2,
    title: 'Дистрикт 2',
    tagline: 'камнеобработка и оборона',
    accent: '#71451e',
    symbolAssetId: 'district.symbol.2',
    isPlaceholder: true,
  },
  {
    id: 3,
    title: 'Дистрикт 3',
    tagline: 'технологии',
    accent: '#5c541f',
    symbolAssetId: 'district.symbol.3',
    isPlaceholder: true,
  },
  {
    id: 4,
    title: 'Дистрикт 4',
    tagline: 'рыболовство',
    accent: '#446222',
    symbolAssetId: 'district.symbol.4',
    isPlaceholder: true,
  },
  {
    id: 5,
    title: 'Дистрикт 5',
    tagline: 'энергетика',
    accent: '#21632a',
    symbolAssetId: 'district.symbol.5',
    isPlaceholder: true,
  },
  {
    id: 6,
    title: 'Дистрикт 6',
    tagline: 'транспорт',
    accent: '#22624b',
    symbolAssetId: 'district.symbol.6',
    isPlaceholder: true,
  },
  {
    id: 7,
    title: 'Дистрикт 7',
    tagline: 'лесозаготовка',
    accent: '#225a62',
    symbolAssetId: 'district.symbol.7',
    isPlaceholder: true,
  },
  {
    id: 8,
    title: 'Дистрикт 8',
    tagline: 'текстиль',
    accent: '#254d74',
    symbolAssetId: 'district.symbol.8',
    isPlaceholder: true,
  },
  {
    id: 9,
    title: 'Дистрикт 9',
    tagline: 'зерно',
    accent: '#2a277c',
    symbolAssetId: 'district.symbol.9',
    isPlaceholder: true,
  },
  {
    id: 10,
    title: 'Дистрикт 10',
    tagline: 'скотоводство',
    accent: '#4d2871',
    symbolAssetId: 'district.symbol.10',
    isPlaceholder: true,
  },
  {
    id: 11,
    title: 'Дистрикт 11',
    tagline: 'сельское хозяйство',
    accent: '#732663',
    symbolAssetId: 'district.symbol.11',
    isPlaceholder: true,
  },
  {
    id: 12,
    title: 'Дистрикт 12',
    tagline: 'угледобыча',
    accent: '#742542',
    symbolAssetId: 'district.symbol.12',
    isPlaceholder: true,
  },
];

export function getDistrict(id: number): District | undefined {
  return DISTRICTS.find((district) => district.id === id);
}
