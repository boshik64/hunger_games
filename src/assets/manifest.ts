export type AssetKind =
  | 'bg-layer'
  | 'district-symbol'
  | 'item-icon'
  | 'strategy-art'
  | 'logo'
  | 'wordmark'
  | 'card-bg'
  | 'og';

export interface AssetEntry {
  id: string;
  kind: AssetKind;
  src: string;
  width: number;
  height: number;
  status: 'placeholder' | 'final';
  alt: string;
}

const base = import.meta.env.BASE_URL;

function final(
  id: string,
  kind: AssetKind,
  file: string,
  width: number,
  height: number,
  alt = '',
): AssetEntry {
  return {
    id,
    kind,
    src: `${base}${file}`,
    width,
    height,
    status: 'final',
    alt,
  };
}

export const ASSETS: Record<string, AssetEntry> = {
  'scene.draw': final('scene.draw', 'bg-layer', 'assets/final/scene-draw.webp', 960, 1440),
  'scene.item': final('scene.item', 'bg-layer', 'assets/final/scene-item.webp', 1600, 1067),
  'scene.strategy': final(
    'scene.strategy',
    'bg-layer',
    'assets/final/scene-strategy.webp',
    1600,
    1067,
  ),
  'scene.result': final(
    'scene.result',
    'bg-layer',
    'assets/final/scene-result.webp',
    960,
    1440,
  ),
  'scene.strategy.path.ravine': final(
    'scene.strategy.path.ravine',
    'strategy-art',
    'assets/final/path-ravine.webp',
    1600,
    670,
  ),
  'scene.strategy.path.forest': final(
    'scene.strategy.path.forest',
    'strategy-art',
    'assets/final/path-forest.webp',
    1600,
    1067,
  ),
  'item.flask': final('item.flask', 'item-icon', 'assets/final/item-flask.svg', 256, 256),
  'item.rope': final('item.rope', 'item-icon', 'assets/final/item-rope.svg', 256, 256),
  'item.medkit': final('item.medkit', 'item-icon', 'assets/final/item-medkit.svg', 256, 256),
  'logo.karo': final('logo.karo', 'logo', 'assets/final/logo-karo.svg', 640, 160),
  'wordmark.film': final('wordmark.film', 'wordmark', 'assets/final/wordmark.svg', 990, 218),
  'card.bg': final('card.bg', 'card-bg', 'assets/final/card-bg.webp', 1080, 1620),
  'og.cover': final('og.cover', 'og', 'og-cover.jpg', 1200, 630),
  ...Object.fromEntries(
    Array.from({ length: 12 }, (_, index) => {
      const id = index + 1;
      const assetId = `district.symbol.${id}`;
      return [
        assetId,
        final(assetId, 'district-symbol', `assets/final/district-${id}.svg`, 512, 512),
      ];
    }),
  ),
};

export function getAsset(id: string): AssetEntry {
  const asset = ASSETS[id];
  if (!asset) throw new Error(`Unknown asset: ${id}`);
  return asset;
}
