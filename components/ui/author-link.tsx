"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

export function AuthorLink({ name, avatar, role, username, className = "" }: { name?: string; avatar?: string; role?: string; username?: string; className?: string; }) {
  const authorName = name || "تحریریه";
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
        <div className="relative h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-full overflow-hidden ring-1 ring-border group-hover/author:ring-primary transition-all">
          <Image src={avatar || "/assets/hooman.png"} alt={authorName} fill sizes="32px" className="object-cover" />
        </div>
        <div className="min-w-0 text-right">
          <div className="text-xs sm:text-sm font-extrabold text-foreground group-hover/author:text-primary transition-colors truncate">{authorName}</div>
          {role && <div className="text-[10px] sm:text-[11px] paragraph-color truncate">{role}</div>}
        </div>
      </TooltipTrigger>
      <TooltipContent>بازدید از حساب کاربری {authorName}</TooltipContent>
    </Tooltip>
  );
}
