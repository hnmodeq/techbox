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

export type AuthorsSectionProps = {
  authors: AuthorCard[];
  title?: string;
};

const HEADING_ID = "hp-authors-heading";
/** Below four, a "carousel" is just a short row. */
const MIN_AUTHORS = 4;

const PILLARS = [
  { title: "مستقل", body: "بدون جانب‌داری، بدون رانت" },
  { title: "آزمایش‌شده", body: "توصیه‌های ما بر پایهٔ تست واقعی سخت‌افزار است" },
  { title: "انسانی", body: "نوشتهٔ کارشناسان، نه الگوریتم‌ها" },
];

/** verifiedType → tooltip fallback. Colour stays achromatic per the site palette. */
const VERIFIED_LABEL: Record<string, string> = {
  content: "تأیید‌شده — تولیدکننده محتوا",
  org: "تأیید‌شده — سازمانی",
  user: "تأیید‌شده — کاربر",
};

export function AuthorsSection({
  authors,
  title = "سازندگان تکباکس",
}: AuthorsSectionProps) {
  if (!authors || authors.length < MIN_AUTHORS) return null;

  return (
    <section aria-labelledby={HEADING_ID} className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1280px] overflow-hidden rounded-[var(--hp-r-lg)]">
        {/* ── Half A: manifesto ─────────────────────────────────── */}
        <div className="bg-[color:var(--hp-brand-ink)] px-6 py-16 text-[color:var(--hp-on-brand)] sm:px-8 lg:py-20 dark:border dark:border-white/[0.08] dark:border-b-0">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex justify-center">
              <span className="rounded-full border-2 border-current/90 px-4 py-1 text-[12px] font-bold tracking-[1.2px]">
                تأسیس ۱۴۰۲
              </span>
            </div>

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

            <ul className="mx-auto mt-16 grid max-w-3xl gap-8 md:grid-cols-3">
              {PILLARS.map((p) => (
                <li
                  key={p.title}
                  className="rounded-[var(--hp-r-md)] border border-current/40 p-6"
                >
                  <h3 className="mb-2 text-lg font-bold leading-7">{p.title}</h3>
                  <p className="text-sm leading-5 text-[color:var(--hp-on-brand-mut)]">
                    {p.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Half B: contributors ──────────────────────────────── */}
        <div className="bg-[color:var(--hp-inset)] px-6 pb-4 md:px-12">
          <div className="p-8 pb-4">
            <p className="text-base font-semibold leading-6 text-[color:var(--hp-ink)] md:text-3xl md:leading-8">
              {title} این‌ها هستند
            </p>
            <p className="mt-2 max-w-2xl text-[15px] leading-[28px] text-[color:var(--hp-ink-3)]">
              تیمی که محتوای تکباکس را می‌نویسد، تست می‌کند و منتشر می‌کند.
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
  const tip = author.verifiedLabel || (author.verifiedType ? VERIFIED_LABEL[author.verifiedType] : "");

  return (
    <Link
      href={`/author/${author.username}`}
      className="group my-8 flex w-[240px] flex-col rounded-[var(--hp-r-md)] px-8 text-center transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[color:var(--hp-brand)] focus-visible:outline-none motion-reduce:transform-none"
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
        {author.verifiedType && (
          <span title={tip} className="shrink-0 text-[color:var(--hp-brand)]">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 1l2.2 1.6 2.7-.2.9 2.6 2.2 1.6-1 2.6 1 2.6-2.2 1.6-.9 2.6-2.7-.2L10 19l-2.2-1.6-2.7.2-.9-2.6L2 13.4l1-2.6-1-2.6L4.2 6.6l.9-2.6 2.7.2L10 1z" />
              <path d="M8.7 12.6L6.2 10l1.1-1.1 1.4 1.4 3.9-3.9L13.7 7.5l-5 5.1z" fill="var(--hp-inset)" />
            </svg>
            <span className="sr-only">{tip}</span>
          </span>
        )}
      </p>

      {author.role && (
        <p className="mb-4 text-xs font-bold leading-4 text-[color:var(--hp-ink-3)]">
          {author.role}
        </p>
      )}

      {author.bio && (
        <p className="mb-4 line-clamp-3 text-sm leading-5 text-[color:var(--hp-ink-2)]">
          {author.bio}
        </p>
      )}

      <span className="mt-auto text-xs font-bold leading-4 text-[color:var(--hp-brand)]">
        <Num>{author.postCount}</Num> مطلب · بیشتر بخوانید
      </span>
    </Link>
  );
}

export default AuthorsSection;
