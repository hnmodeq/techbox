/**
 * §13 · Family Profiles — "خانوادهٔ تکباکس"
 *
 * A random sample of ordinary community members. Staff are excluded on
 * purpose: they already appear in §12 Authors, and showing them twice
 * would make the community look smaller than it is.
 *
 * Card follows the Spiceworks member-tile pattern: circular avatar,
 * handle, one line of context, and a small activity stat.
 *
 * Server Component (ScrollRail is the client part).
 */
import * as React from "react";
import Link from "next/link";
import type { FamilyProfile } from "@/features/home/lib/home-types";
import { SectionShell, SectionHeader, ScrollRail } from "../primitives";
import { Num } from "@/components/ui/num";

export type FamilyProfilesSectionProps = {
  profiles: FamilyProfile[];
  title?: string;
};

const HEADING_ID = "hp-profiles-heading";
const MIN = 4;

export function FamilyProfilesSection({
  profiles,
  title = "خانوادهٔ تکباکس",
}: FamilyProfilesSectionProps) {
  if (!profiles || profiles.length < MIN) return null;

  return (
    <SectionShell labelledBy={HEADING_ID}>
      <SectionHeader
        headingId={HEADING_ID}
        title={title}
        description="اعضایی که هر روز در انجمن، نظرات و محتوای تکباکس مشارکت می‌کنند."
      />

      <ScrollRail label={title} gap={16}>
        {profiles.map((p) => (
          <ProfileCard key={p.username} profile={p} />
        ))}
      </ScrollRail>
    </SectionShell>
  );
}

function ProfileCard({ profile }: { profile: FamilyProfile }) {
  const activity = profile.postCount + profile.commentCount;

  return (
    <Link
      href={`/author/${profile.username}`}
      className="hp-card group flex w-[190px] flex-col items-center rounded-[var(--hp-r-md)] border border-[color:var(--hp-border)] bg-[color:var(--hp-surface)] p-5 text-center transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--hp-shadow-hover)] focus-visible:ring-2 focus-visible:ring-[color:var(--hp-brand)] focus-visible:outline-none motion-reduce:transform-none"
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
        <span className="mt-2 rounded-[4px] bg-[color:var(--hp-brand-tint)] px-2 py-0.5 text-[11px] text-[color:var(--hp-ink-3)]">
          <Num>{activity}</Num> مشارکت
        </span>
      )}
    </Link>
  );
}

export default FamilyProfilesSection;
