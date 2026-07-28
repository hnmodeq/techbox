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
