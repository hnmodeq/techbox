/**
 * §12 · About + Authors — Tom's Guide `about-1`
 *
 * TG stacks two halves inside one widget:
 *   A. a dark manifesto panel — EST badge, headline, three bordered
 *      feature cards
 *   B. a lighter carousel of contributor cards, avatars 116px on mobile
 *      and 160px from 700px up (their measured values)
 *
 * The positioning paragraph is the Persian equivalent of the Spiceworks
 * one-liner the owner asked for: community + marketplace for IT pros.
 *
 * Only users with at least one published post appear — a contributor card
 * for someone who has never contributed would be fiction.
 *
 * Server Component (ScrollRail is the client part).
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §12
 */
import * as React from "react";
import Link from "next/link";
import type { AuthorCard } from "@/features/home/lib/home-types";
import { ScrollRail } from "../primitives";
import { Num } from "@/components/ui/num";
import { UserAvatar } from "@/components/ui/user-avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type AuthorsSectionProps = {
  authors: AuthorCard[];
  title?: string;
};

const HEADING_ID = "hp-authors-heading";
/** Below four, a "carousel" is just a short row. */
const MIN_AUTHORS = 4;

export function AuthorsSection({
  authors,
  title = "برخی از نویسندگان تکباکس",
}: AuthorsSectionProps) {
  if (!authors || authors.length < MIN_AUTHORS) return null;

  return (
    <section aria-labelledby={HEADING_ID} className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1280px] overflow-hidden rounded-[var(--hp-r-lg)]">
        {/* ── Half A: manifesto ─────────────────────────────────── */}
        <div className="bg-[color:var(--hp-brand-ink)] px-6 py-16 text-[color:var(--hp-on-brand)] sm:px-8 lg:py-20 dark:border dark:border-white/[0.08] dark:border-b-0">
          <div className="mx-auto max-w-4xl">
            <h2
              id={HEADING_ID}
              className="text-center text-[26px] font-medium leading-8 md:text-5xl md:leading-[60px]"
            >
              مرجع روزانهٔ شما در فناوری اطلاعات.
            </h2>

            <div
              aria-hidden="true"
              className="mx-auto my-3 h-0.5 w-24 bg-gradient-to-l from-transparent via-current to-transparent opacity-40"
            />

            <p className="text-center text-xl font-light leading-8 text-[color:var(--hp-on-brand-mut)] md:text-2xl">
              تکباکس یک جامعهٔ آنلاین و بازارگاه است که در آن متخصصان فناوری اطلاعات
              می‌توانند مشاوره بگیرند، شبکه‌های خود را مدیریت کنند، و محصولات و خدمات
              IT را کشف و خریداری کنند.
            </p>
          </div>
        </div>

        {/* ── Half B: contributors ──────────────────────────────── */}
        <div className="px-6 pb-4 md:px-12">
          <div className="p-8 pb-4">
            <p className="text-base font-semibold leading-6 text-[color:var(--hp-ink)] md:text-3xl md:leading-8">
              {title}
            </p>
          </div>

          <ScrollRail label={title} gap={20} railClassName="pb-2">
            {authors.map((a) => (
              <AuthorTile key={a.username} author={a} />
            ))}
          </ScrollRail>
        </div>
      </div>
    </section>
  );
}

function AuthorTile({ author }: { author: AuthorCard }) {
  return (
    <div className="group my-8 flex w-[240px] flex-col px-8 text-center">
      {/* Avatar + name share one tooltip: they are the same target as far as
          the reader is concerned, and two tooltips on one card fight. */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={`/author/${author.username}`}
              className="flex flex-col rounded-[var(--hp-r-md)] transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[color:var(--hp-brand)] focus-visible:outline-none motion-reduce:transform-none"
            />
          }
        >
          <UserAvatar
            name={author.name}
            username={author.username}
            src={author.avatar}
            sizes="160px"
            className="mx-auto mb-6 h-[116px] w-[116px] text-4xl sm:h-[160px] sm:w-[160px]"
            imageClassName="object-center"
          />

          <p className="flex items-center justify-center gap-1.5 text-xl font-bold leading-7 text-[color:var(--hp-ink)] transition-colors group-hover:text-[color:var(--hp-brand)]">
            {author.name}
            {/* The shared PNG badge — same asset the verification modal and
                every other surface uses. This card used to draw its own
                inline SVG, which is why the badge looked like a different
                shape and colour here than everywhere else. */}
            {author.verifiedType && (
              <VerifiedBadge
                type={author.verifiedType as "content" | "org" | "user"}
                label={author.verifiedLabel}
                size={18}
              />
            )}
          </p>
        </TooltipTrigger>
        <TooltipContent dir="rtl" className="text-right">
          <p className="font-semibold">{author.name}</p>
          {author.role && (
            <p className="mt-0.5 text-xs text-muted-foreground">{author.role}</p>
          )}
        </TooltipContent>
      </Tooltip>

      {author.role && (
        <p className="mb-4 text-xs font-bold leading-4 text-[color:var(--hp-ink-3)]">
          {author.role}
        </p>
      )}

      {/* Deep-links to the profile's content tab so the count is not a dead
          number: readers land on the posts it refers to. */}
      <Link
        href={`/author/${author.username}?tab=content`}
        className="mt-auto text-xs font-bold leading-4 text-[color:var(--hp-brand)] transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[color:var(--hp-brand)] focus-visible:outline-none"
      >
        <Num>{author.postCount}</Num> مطلب
      </Link>
    </div>
  );
}

export default AuthorsSection;
