"use client";
// next/image loader (next.config.ts → images.loaderFile). Photos are resized and
// converted to WebP/AVIF by Cloudinary, so Vercel's image optimization isn't used.
// `quality` is ignored on purpose: Cloudinary's q_auto picks it per photo.
import type { ImageLoaderProps } from "next/image";
import { resizedImageUrl } from "./image-url";

export default function imageLoader({ src, width }: ImageLoaderProps): string {
  return resizedImageUrl(src, width);
}
