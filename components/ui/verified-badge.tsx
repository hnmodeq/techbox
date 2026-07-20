"use client";

/**
 * VerifiedBadge — tick icon shown next to usernames for verified accounts.
 *
 * Types:
 *   "content" → blue  → تولید کننده محتوای تایید شده
 *   "org"     → purple → کاربر سازمانی تایید شده (+ optional label line)
 *   "user"    → yellow → کاربر تایید شده
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
    color: "#3b82f6",   // blue-500
    title: "تولید کننده محتوای تایید شده",
  },
  org: {
    color: "#a855f7",   // purple-500
    title: "کاربر سازمانی تایید شده",
  },
  user: {
    color: "#eab308",   // yellow-500
    title: "کاربر تایید شده",
  },
} as const;

function TickSvg({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
    >
      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

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
          <TickSvg color={cfg.color} size={size} />
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
