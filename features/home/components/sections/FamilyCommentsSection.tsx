/**
 * §10 · TechBox Family Comments
 * Spiceworks "See what our community has to say"
 *
 * Their testimonial is deliberately chrome-less: a large decorative quote
 * mark inline before the text, the quote as plain UPRIGHT running text
 * (Spiceworks does not italicise — matching that matters), then a
 * circular avatar, the handle, and "Member since {year}".
 *
 * TechBox addition: an origin chip, because unlike Spiceworks we pull
 * from several modules and the reader needs to know whether a quote came
 * from the forum, the magazine or the shop.
 *
 * Every quote is a real, approved comment from an active member; the
 * sampling and filtering happen in lib/home-sections.ts. Nothing here is
 * ever fabricated — if fewer than three qualify, the section is absent.
 *
 * Server Component.
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §10
 */
import * as React from "react";
import Link from "next/link";
import type { FamilyComment } from "@/features/home/lib/home-types";
import { SectionShell, SectionHeader } from "../primitives";
import { UserAvatar } from "@/components/ui/user-avatar";

export type FamilyCommentsSectionProps = {
  comments: FamilyComment[];
  title?: string;
};

const HEADING_ID = "hp-family-heading";
/** A single testimonial reads as an accident rather than a chorus. */
const MIN_COMMENTS = 3;

export function FamilyCommentsSection({
  comments,
  title = "بعضی از نظرات خانوادهٔ تکباکس",
}: FamilyCommentsSectionProps) {
  if (!comments || comments.length < MIN_COMMENTS) return null;

  return (
    <SectionShell labelledBy={HEADING_ID}>
      <SectionHeader
        headingId={HEADING_ID}
        title={title}
        description="آنچه اعضای تکباکس دربارهٔ محتوا، محصولات و تجربهٔ کارشان نوشته‌اند."
        href="/forum"
        linkLabel="انجمن تکباکس"
      />

      <ul className="hp-rail gap-6 lg:grid lg:grid-cols-3 lg:gap-10 lg:overflow-visible">
        {comments.map((c) => (
          <li key={c.id} className="w-[85%] shrink-0 sm:w-[60%] lg:w-auto">
            <Testimonial comment={c} />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

function Testimonial({ comment }: { comment: FamilyComment }) {
  return (
    <figure className="hp-card flex h-full flex-col">
      <blockquote className="text-[15px] leading-[28px] text-[color:var(--hp-ink-2)]">
        {/* Decorative quote mark, floated so the text wraps around it the
            way Spiceworks' image-based one does. */}
        <span
          aria-hidden="true"
          className="float-start -mt-1 me-2 font-serif text-[44px] leading-none text-[color:var(--hp-brand)] opacity-[0.22]"
        >
          »
        </span>
        {/* Upright, not italic — Spiceworks keeps these plain. */}
        <span className="line-clamp-6">{comment.text}</span>
      </blockquote>

      <figcaption className="mt-6">
        <Link
          href={comment.origin.href}
          className="group flex items-center gap-3 focus-visible:outline-none"
        >
          <UserAvatar
            name={comment.author.name}
            username={comment.author.username}
            src={comment.author.avatar}
            sizes="64px"
            className="h-16 w-16 text-xl"
          />

          <span className="min-w-0">
            <span className="block truncate text-[16px] font-bold leading-6 text-[color:var(--hp-ink)] transition-colors group-hover:text-[color:var(--hp-brand)]">
              {comment.author.name}
            </span>
            {comment.memberSince && (
              <span className="block text-[13px] leading-5 text-[color:var(--hp-ink-3)]">
                عضو از {comment.memberSince}
              </span>
            )}
            <span className="mt-1.5 inline-block rounded-[4px] bg-[color:var(--hp-brand-tint)] px-1.5 py-0.5 text-[11px] text-[color:var(--hp-ink-3)]">
              {comment.origin.label}
            </span>
          </span>
        </Link>
      </figcaption>
    </figure>
  );
}

export default FamilyCommentsSection;
