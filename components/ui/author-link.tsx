"use client";
import React from "react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/ui/user-avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";

const nameToSlug: Record<string, string> = {
  "هومن مدق": "hoomanmodeq",
  "عطیه حاتمی": "atiyehatami",
  "بهناز قادری": "behnazghaderi",
  "بهروز قادری": "behruzghaderi",
  "نسترن خداکرمی": "nastarankhodakarami",
  "فراز فیضی": "farazfeizi",
  "مصطفی نجفی": "mostafanajafi",
  "پانیز باقری": "panizbagheri",
  "شقایق رستگار": "shaghayeghrastegaar",
  "فرید فیضی": "faridfeizi",
  "تحریریه": "editorial",
  "تکباکس": "editorial"
};

export function AuthorLink({
  name,
  avatar,
  role,
  job,
  username,
  verifiedType,
  verifiedLabel,
  className = "",
}: {
  name?: string;
  avatar?: string;
  /** Legacy display role; used only when a real profile job is absent. */
  role?: string;
  /** Public professional title from the user's profile. */
  job?: string | null;
  username?: string;
  verifiedType?: string | null;
  verifiedLabel?: string | null;
  className?: string;
}) {
  const authorName = name || "تحریریه";
  const professionalTitle = job?.trim() || role?.trim() || "";
  const slug = username || nameToSlug[authorName.trim()] || authorName.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "-");

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={`/author/${encodeURIComponent(slug)}`}
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-2 group/author hover:opacity-90 transition-all ${className}`}
          />
        }
      >
        <UserAvatar
          name={authorName}
          username={username}
          src={avatar}
          alt={authorName}
          sizes="32px"
          className="h-7 w-7 ring-1 ring-border transition-all group-hover/author:ring-primary sm:h-8 sm:w-8"
        />
        <div className="min-w-0 text-right">
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm font-extrabold text-foreground group-hover/author:text-primary transition-colors truncate">
              {authorName}
            </span>
            {verifiedType && (
              <VerifiedBadge
                type={verifiedType as "content" | "org" | "user"}
                label={verifiedLabel}
                size={14}
              />
            )}
          </div>
          {professionalTitle && <div className="text-[10px] sm:text-[11px] paragraph-color truncate">{professionalTitle}</div>}
        </div>
      </TooltipTrigger>
      <TooltipContent>بازدید از حساب کاربری {authorName}</TooltipContent>
    </Tooltip>
  );
}
