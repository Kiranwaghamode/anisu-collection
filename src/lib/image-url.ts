// Resized image URLs, built by the image host itself (no Vercel image optimization needed).
// Plain module: used by the client-side next/image loader and on the server.

const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)/;

/**
 * Cloudinary: insert a transformation, e.g. "f_auto,q_auto,c_limit,w_640".
 * Unsplash (placeholder photos): set the width and format query params.
 * Files in /public are served as they are (the width param only keeps next/image happy).
 * Anything else is returned unchanged.
 */
export function resizedImageUrl(src: string, width: number): string {
  if (src.startsWith("/")) return `${src}?w=${width}`;
  if (CLOUDINARY_UPLOAD.test(src)) {
    return src.replace(CLOUDINARY_UPLOAD, `$1f_auto,q_auto,c_limit,w_${width}/`);
  }
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", "75");
    url.searchParams.set("auto", "format");
    // A fixed height would distort the crop at other widths; the page crops with object-fit.
    url.searchParams.delete("h");
    return url.toString();
  }
  return src;
}

/**
 * A JPEG at most 1200px wide, for link previews (WhatsApp, Instagram, Facebook)
 * and Google Merchant Center, which don't all accept WebP/AVIF.
 */
export function shareImageUrl(src: string): string {
  if (CLOUDINARY_UPLOAD.test(src)) return src.replace(CLOUDINARY_UPLOAD, "$1f_jpg,q_auto,c_limit,w_1200/");
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", "1200");
    url.searchParams.set("fm", "jpg");
    url.searchParams.delete("h");
    url.searchParams.delete("auto");
    return url.toString();
  }
  return src;
}
