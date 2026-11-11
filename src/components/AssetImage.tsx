import { getAsset } from '../assets/manifest';

export function AssetImage({
  id,
  alt,
  className,
}: {
  id: string;
  alt: string;
  className?: string;
}) {
  const asset = getAsset(id);
  return (
    <img
      className={className}
      src={asset.src}
      alt={alt}
      width={asset.width}
      height={asset.height}
    />
  );
}
