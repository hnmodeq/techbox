/**
 * §12C · Family profiles rail — "خانوادهٔ تکباکس"
 *
 * A random sample of ordinary community members. Staff are excluded on
 * purpose: they already appear in the authors rail above, and showing them
 * twice would make the community look smaller than it is.
 *
 * Rendered inside WebsiteInfoSection, which owns the band and the heading
 * landmark, so this exports a bare rail rather than its own <section>.
 *
 * Card follows the Spiceworks member-tile pattern: circular avatar, handle,
 * one line of context, and a small activity stat.
 *
 * Server Component (ScrollRail is the client part).
 */
import * as React from "react";
import Link from "next/link";
import type { FamilyProfile } from "@/features/home/lib/home-types";
import { ScrollRail } from "../primitives";
import { Num } from "@/components/ui/num";

export type FamilyProfilesRailProps = {
  profiles: FamilyProfile[];
  title?: string;
};

const MIN = 4;

export function FamilyProfilesRail({
  profiles,
  title = "خانوادهٔ تکباکس",
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
    <Link
      href={`/author/${profile.username}`}
      className="group flex w-[190px] flex-col items-center rounded-[var(--hp-r-md)] p-5 text-center transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[color:var(--hp-brand)] focus-visible:outline-none motion-reduce:transform-none"
    >
      <span className="mb-3 h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[color:var(--hp-brand-tint)]">
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

      <p className="w-full truncate text-[15px] font-bold leading-6 text-[color:var(--hp-ink)] transition-colors group-hover:text-[color:var(--hp-brand)]">
        {profile.name}
      </p>

      {profile.job && (
        <p className="mt-0.5 line-clamp-2 text-[12px] leading-[18px] text-[color:var(--hp-ink-3)]">
          {profile.job}
        </p>
      )}

      <p className="mt-2 text-[11px] leading-4 text-[color:var(--hp-ink-3)]">
        {profile.memberSince && <>عضو از {profile.memberSince}</>}
      </p>

      {activity > 0 && (
        <span className="mt-2 px-2 py-0.5 text-[11px] text-[color:var(--hp-ink-3)]">
          <Num>{activity}</Num> مشارکت
        </span>
      )}
    </Link>
  );
}

export default FamilyProfilesRail;
