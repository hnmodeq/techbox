/**
 * Byline — avatar + author name + role + date.
 *
 * Mirrors Tom's Guide's `wdn-listv2-item-content-byline`: a circular
 * avatar with a right-side stack of name / role / date. In their card
 * layout the byline is pinned to the bottom with `margin-top: auto`,
 * which callers reproduce by putting this in a flex-col with flex-1
 * content above it.
 *
 * Server Component.
 *
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §5, §11, §12
 */
import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type BylineAuthor = {
  name: string;
  username?: string;
  role?: string;
  avatar?: string;
};

export type BylineProps = {
  author: BylineAuthor;
  /** Pre-formatted Persian date, e.g. "۴ مرداد ۱۴۰۵" or "۲ ساعت پیش". */
  date?: string;
  /** Prefix for the date, e.g. "آخرین بروزرسانی". */
  datePrefix?: string;
  /** sm = compact rows (More to Explore cards) · md = card bylines. */
  size?: "sm" | "md";
  /** Hide the role line even when present. */
  hideRole?: boolean;
  /**
   * Suppress the author link.
   *
   * Set this when the Byline sits inside a larger <Link>. Nested anchors
   * are invalid HTML and React reports them as a hydration error, so the
   * name renders as plain text instead.
   */
  noLink?: boolean;
  onDark?: boolean;
  className?: string;
};

const AVATAR = { sm: 28, md: 40 } as const;

export function Byline({
  author,
  date,
  datePrefix,
  size = "md",
  hideRole = false,
  noLink = false,
  onDark = false,
  className,
}: BylineProps) {
  const px = AVATAR[size];
  const initial = author.name?.trim()?.[0] ?? "؟";

  const nameNode = (
    <span
      className={cn(
        size === "sm" ? "text-[12px] leading-[18px]" : "text-[13px] leading-[22px]",
        "font-bold",
        onDark ? "text-[color:var(--hp-on-brand)]" : "text-[color:var(--hp-ink)]",
      )}
    >
      نوشتهٔ {author.name}
    </span>
  );

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Avatar. Falls back to an initial disc rather than a broken image. */}
      <span
        className="relative shrink-0 overflow-hidden rounded-full bg-[color:var(--hp-brand-tint)]"
        style={{ width: px, height: px }}
      >
        {author.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.avatar}
            alt=""
            width={px}
            height={px}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-[11px] font-bold text-[color:var(--hp-brand)]"
          >
            {initial}
          </span>
        )}
      </span>

      <span className="flex min-w-0 flex-col">
        {author.username && !noLink ? (
          <Link
            href={`/author/${author.username}`}
            className="transition-colors hover:text-[color:var(--hp-brand)]"
          >
            {nameNode}
          </Link>
        ) : (
          nameNode
        )}

        {!hideRole && author.role && (
          <span
            className={cn(
              "truncate text-[12px] leading-[18px]",
              onDark ? "text-[color:var(--hp-on-brand-mut)]" : "text-[color:var(--hp-ink-3)]",
            )}
          >
            {author.role}
          </span>
        )}

        {date && (
          <span
            className={cn(
              "text-[12px] leading-[18px]",
              onDark ? "text-[color:var(--hp-on-brand-mut)]" : "text-[color:var(--hp-ink-3)]",
            )}
          >
            {datePrefix ? `${datePrefix} ${date}` : date}
          </span>
        )}
      </span>
    </div>
  );
}

export default Byline;
