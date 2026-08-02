"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * A deterministic, theme-independent palette for people who have not chosen
 * an avatar yet. The key is a stable username when available, otherwise the
 * person's name, so a refresh never assigns a different colour.
 */
const AVATAR_PALETTE = [
  { background: "#1d4ed8", foreground: "#eff6ff" },
  { background: "#0f766e", foreground: "#f0fdfa" },
  { background: "#7e22ce", foreground: "#faf5ff" },
  { background: "#be123c", foreground: "#fff1f2" },
  { background: "#b45309", foreground: "#fffbeb" },
  { background: "#0369a1", foreground: "#f0f9ff" },
  { background: "#9d174d", foreground: "#fdf2f8" },
  { background: "#3f6212", foreground: "#f7fee7" },
  { background: "#4338ca", foreground: "#eef2ff" },
  { background: "#0e7490", foreground: "#ecfeff" },
] as const;

function hashAvatarKey(value: string) {
  let hash = 2166136261;
  for (const char of Array.from(value)) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function userAvatarInitial(name?: string | null) {
  const value = name?.trim();
  return value ? Array.from(value)[0] ?? "؟" : "؟";
}

export function userAvatarColors(key?: string | null) {
  const paletteKey = key?.trim() || "techbox-member";
  return AVATAR_PALETTE[hashAvatarKey(paletteKey) % AVATAR_PALETTE.length];
}

export type UserAvatarProps = {
  name?: string | null;
  username?: string | null;
  src?: string | null;
  alt?: string;
  /** Size/shape/ring classes for the outer avatar element. */
  className?: string;
  /** Image-only adjustments, such as object-position. */
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  style?: React.CSSProperties;
};

/**
 * Displays a stored avatar when one exists, otherwise a fixed-colour initial.
 * `onError` also falls back cleanly when a legacy avatar URL is broken.
 */
export function UserAvatar({
  name,
  username,
  src,
  alt,
  className,
  imageClassName,
  sizes = "64px",
  priority = false,
  style,
}: UserAvatarProps) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const source = src?.trim() || "";

  React.useEffect(() => setImageFailed(false), [source]);

  const key = username?.trim() || name?.trim() || "techbox-member";
  const colors = userAvatarColors(key);
  const initial = userAvatarInitial(name);
  const showImage = Boolean(source && !imageFailed);

  return (
    <span
      className={cn("relative block shrink-0 overflow-hidden rounded-full", className)}
      style={showImage
        ? style
        : { backgroundColor: colors.background, color: colors.foreground, ...style }}
    >
      {showImage ? (
        <Image
          src={source}
          alt={alt || name || "کاربر"}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setImageFailed(true)}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-bold">
          {initial}
        </span>
      )}
    </span>
  );
}

export default UserAvatar;
