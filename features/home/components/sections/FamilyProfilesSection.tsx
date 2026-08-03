/**
 * §12C · Family profiles rail — "و همچنین ..."
 *
 * Clean member tiles with no background card, no badge background,
 * and correct verified badge support.
 */
import * as React from "react";
import Link from "next/link";
import type { FamilyProfile } from "@/features/home/lib/home-types";
import { ScrollRail } from "../primitives";
import { Num } from "@/components/ui/num";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type FamilyProfilesRailProps = {
  profiles: FamilyProfile[];
  title?: string;
};

const MIN = 4;

export function FamilyProfilesRail({
  profiles,
  title = "و همچنین ...",
}: FamilyProfilesRailProps) {
  if (!profiles || profiles.length < MIN) return null;

  return (
    <div className="px-6 pb-10 md:px-12">
      <div className="p-8 pb-4">
        <p className="text-base font-semibold leading-6 text-[color:var(--hp-ink)] md:text-3xl md:leading-8">
          {title}
        </p>
        <p className="mt-2 max-w-2xl text-[15px] leading-[28px] text-[color:var(--hp-ink-3)]">
          اعضایی که هر روز در انجمن، نظرات و محتوای تکباکس مشارکت می‌کنند.
        </p>
      </div>

      <ScrollRail label={title} gap={16}>
        {profiles.map((p) => (
          <ProfileCard key={p.username} profile={p} />
        ))}
      </ScrollRail>
    </div>
  );
}

function ProfileCard({ profile }: { profile: FamilyProfile }) {
  const activity = profile.postCount + profile.commentCount;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={`/author/${profile.username}`}
            className="group flex w-[190px] flex-col items-center p-4 text-center transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[color:var(--hp-brand)] focus-visible:outline-none motion-reduce:transform-none bg-transparent"
          />
        }
      >
        <span className="mb-3 h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[color:var(--hp-brand-tint)] ring-1 ring-border">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={profile.name}
              width={80}
              height={80}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center text-2xl font-bold text-[color:var(--hp-ink-3)]"
            >
              {profile.name.trim()[0] ?? "؟"}
            </span>
          )}
        </span>

        <p className="w-full flex items-center justify-center gap-1 truncate text-[15px] font-bold leading-6 text-[color:var(--hp-ink)] transition-colors group-hover:text-[color:var(--hp-brand)]">
          {profile.name}
          {profile.verifiedType && (
            <VerifiedBadge
              type={profile.verifiedType as "content" | "org" | "user"}
              size={14}
            />
          )}
        </p>

        {profile.job && (
          <p className="mt-0.5 line-clamp-2 text-[12px] leading-[18px] text-[color:var(--hp-ink-3)]">
            {profile.job}
          </p>
        )}

        {activity > 0 && (
          <span className="mt-2 text-[11px] text-[color:var(--hp-ink-3)] bg-transparent">
            <Num>{activity}</Num> مشارکت
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent dir="rtl">
        {profile.name} — {profile.job || "عضو انجمن"}
      </TooltipContent>
    </Tooltip>
  );
}

export default FamilyProfilesRail;
