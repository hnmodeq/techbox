/**
 * RemoteImage — the one way the homepage renders a content image.
 *
 * Every homepage section used a bare `<img src={supabaseUrl}>`, which skips
 * Next's image pipeline entirely: no AVIF/WebP negotiation, no resizing to
 * the slot, no `sizes` honoured by the server. A single card was shipping
 * the full-resolution original — 884 kB of images on the homepage for slots
 * a few hundred pixels wide.
 *
 * This wraps `next/image` with `fill`, so the parent's aspect-ratio box
 * keeps controlling layout exactly as before and no section needs to know
 * intrinsic dimensions. `next.config.mjs` already whitelists the Supabase
 * and GitHub hosts and sets `formats: ['image/avif', 'image/webp']`.
 *
 * Always pass `sizes`. Without it Next assumes 100vw and serves a desktop-
 * width file to a 143px thumbnail, which is the bug this component exists
 * to prevent.
 */
import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Hosts next/image is allowed to optimise, mirroring
 * `images.remotePatterns` in next.config.mjs.
 *
 * next/image THROWS on an unconfigured host rather than degrading, so one
 * un-migrated row can take down a whole page — which is exactly what a
 * leftover Vercel Blob avatar did to /about. Content URLs come from the
 * database and can point anywhere, so this component checks first and
 * falls back to a plain <img> instead of letting the render fail.
 */
const OPTIMISED_HOSTS = [
  /\.supabase\.co$/,
  /\.public\.blob\.vercel-storage\.com$/,
  /^cdn\.zarinpal\.com$/,
  /^images\.unsplash\.com$/,
  /^github\.com$/,
  /\.githubusercontent\.com$/,
];

function canOptimise(src: string): boolean {
  // Relative paths are always local and always fine.
  if (src.startsWith("/")) return true;
  try {
    const { hostname, protocol } = new URL(src);
    if (protocol !== "https:") return false;
    return OPTIMISED_HOSTS.some((pattern) => pattern.test(hostname));
  } catch {
    return false;
  }
}

export type RemoteImageProps = {
  src?: string | null;
  alt: string;
  /** Required in practice — see the note above. */
  sizes: string;
  /** Above-the-fold images only. Everything else stays lazy. */
  priority?: boolean;
  className?: string;
};

export function RemoteImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: RemoteImageProps) {
  if (!src) return null;

  // Unknown host: render it, unoptimised, rather than throwing. Losing
  // AVIF/WebP on a handful of legacy rows is a far better outcome than a
  // runtime error that blanks the route.
  if (!canOptimise(src)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[RemoteImage] ${new URL(src, "https://x").hostname} is not in ` +
          "images.remotePatterns — serving unoptimised. Add it to " +
          "next.config.mjs, or migrate the asset.",
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={cn("object-cover", className)}
    />
  );
}

export default RemoteImage;
