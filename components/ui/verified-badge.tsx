"use client";

/**
 * VerifiedBadge — badge image shown next to usernames for verified accounts.
 *
 * Uses a plain <img> with eager loading so the badge appears immediately
 * without any network-induced delay (next/image lazy optimization caused
 * the badge to pop in after the name was already rendered).
 *
 * Types:
 *   "content" → blue   → تولید کننده محتوای تایید شده
 *   "org"     → purple → کاربر سازمانی تایید شده (+ optional label line)
 *   "user"    → orange → کاربر تایید شده
 */

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  type: "content" | "org" | "user";
  /** For org type: admin-written label, e.g. "کارشناس فناوری - بانک ملت" */
  label?: string | null;
  size?: number;
  className?: string;
}

const CONFIG = {
  content: {
    src: "/assets/badges/blue-verified.png",
    title: "تولید کننده محتوای تایید شده",
  },
  org: {
    src: "/assets/badges/purple-verified.png",
    title: "کاربر سازمانی تایید شده",
  },
  user: {
    src: "/assets/badges/orange-verified.png",
    title: "کاربر تایید شده",
  },
} as const;

export function VerifiedBadge({ type, label, size = 16, className = "" }: VerifiedBadgeProps) {
  const cfg = CONFIG[type];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              className={`inline-flex shrink-0 cursor-default items-center ${className}`}
              aria-label={cfg.title}
            />
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cfg.src}
            alt={cfg.title}
            width={size}
            height={size}
            loading="eager"
            // @ts-expect-error — fetchpriority is a valid HTML attribute
            fetchpriority="high"
            decoding="sync"
            style={{ width: size, height: size, objectFit: "contain" }}
          />
        </TooltipTrigger>
        <TooltipContent dir="rtl" className="text-right">
          <p className="font-semibold">{cfg.title}</p>
          {type === "org" && label && (
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
