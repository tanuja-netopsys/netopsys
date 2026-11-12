import type { ImgHTMLAttributes } from "react";

const LOCAL_WEBP_WIDTHS: Record<string, [number, number]> = {
  cube: [320, 600],
  teams: [440, 720],
  portfolio: [560, 1100],
  about: [560, 1100],
};

/**
 * Resolve responsive WebP srcSet for local public assets that have sibling
 * `.webp` and `-sm.webp` variants generated alongside the original asset.
 */
function getLocalWebpSrcSet(src?: string): string | undefined {
  if (!src) return undefined;
  const match = src.match(/^\/(cube|portfolio|teams|about)\/([^?#]+)\.(?:jpg|jpeg|png)$/i);
  if (!match) return undefined;
  const [, dir, stem] = match;
  const [smW, lgW] = LOCAL_WEBP_WIDTHS[dir.toLowerCase()] || [560, 1100];
  return `/${dir}/${stem}-sm.webp ${smW}w, /${dir}/${stem}.webp ${lgW}w`;
}

export interface OptimizedPictureProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  sizes?: string;
}

/**
 * Drop-in `<picture>` + `<img>` wrapper that prefers local responsive WebP
 * sources while keeping the original `<img>` fallback intact for CMS/external URLs.
 */
export function OptimizedPicture({
  src,
  sizes,
  decoding = "async",
  ...imgProps
}: OptimizedPictureProps) {
  const webpSrcSet = getLocalWebpSrcSet(src);

  if (!webpSrcSet) {
    return <img src={src} decoding={decoding} {...imgProps} />;
  }

  return (
    <picture className="contents">
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img src={src} decoding={decoding} {...imgProps} />
    </picture>
  );
}

