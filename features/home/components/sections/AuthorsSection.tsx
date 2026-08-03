/**
 * §12B · Authors rail — the contributor carousel.
 *
 * Rendered inside WebsiteInfoSection, which owns the surrounding band and
 * the manifesto above it. Exported as a bare rail (no <section>, no heading
 * landmark) because the parent already provides both; nesting a second
 * labelled section inside one band produced two landmarks for what reads as
 * one block.
 *
 * Only users with at least one published post appear — a contributor card
 * for someone who has never contributed would be fiction.
 *
 * Server Component (ScrollRail is the client part).
 */
import * as React from "react";
import Link from "next/link";
import type { AuthorCard } from "@/features/home/lib/home-types";
import { ScrollRail } from "../primitives";
import { Num } from "@/components/ui/num";
import { UserAvatar } from "@/components/ui/user-avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type AuthorsRailProps = {
  authors: AuthorCard[];
  title?: string;
};

/** Below four, a "carousel" is just a short row. */
const MIN_AUTHORS = 4;

export function AuthorsRail({
  authors,
  title = "برخی از نویسندگان تکباکس",
}: AuthorsRailProps) {
  if (!authors || authors.length < MIN_AUTHORS) return null;

  return (
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
        <Num>{author.postCount}</Num> مطلب منتشر کرده است
      </Link>
    </div>
  );
}

export default AuthorsRail;
