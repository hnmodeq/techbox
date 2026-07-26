/**
 * §11 · More to Explore — Tom's Guide `remnant--tabbed-`
 *
 * TG's structure: one landscape hero spanning the full width, whose
 * content panel OVERLAPS the bottom of the image, then a 4-up row beneath
 * (gridX 4 from 900px, 2 on mobile).
 *
 * Content mix is genuine rediscovery rather than a second helping of what
 * is already above the fold: a random news post from the whole archive as
 * the hero, then the OLDEST item from each of media, blog, forum and shop.
 * The hero rotates hourly via a seeded index — see seededIndex() in
 * lib/home-sections.ts for why Math.random() is not used.
 *
 * Server Component.
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §11
 */
import * as React from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import type { MoreToExplore } from "@/features/home/lib/home-types";
import { InsetBand, Eyebrow, Byline } from "../primitives";

export type MoreToExploreSectionProps = {
  data?: MoreToExplore;
  title?: string;
};

const HEADING_ID = "hp-mte-heading";

const MODULE_LABEL: Record<string, string> = {
  blog: "مجله",
  news: "اخبار",
  media: "ویدیو",
  shop: "فروشگاه",
  forum: "انجمن",
  review: "نقد و بررسی",
  download: "دانلود",
};

export function MoreToExploreSection({
  data,
  title = "بیشتر کاوش کنید",
}: MoreToExploreSectionProps) {
  const hero = data?.hero ?? null;
  const cards = data?.cards ?? [];

  // The hero anchors the section; a bare row of four is a different design.
  if (!hero || cards.length < 2) return null;

  return (
    <InsetBand labelledBy={HEADING_ID} tone="tint">
      <h2
        id={HEADING_ID}
        className="mb-6 text-[28px] font-bold leading-[40px] text-[color:var(--hp-ink)]"
      >
        {title}
      </h2>

      <HeroCard item={hero} />

      <ul className="mt-8 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-5">
        {cards.map((c) => (
          <li key={`${c.module}-${c.slug}`}>
            <SmallCard item={c} />
          </li>
        ))}
      </ul>
    </InsetBand>
  );
}

function HeroCard({ item }: { item: ContentItem }) {
  return (
    <article className="hp-card group">
      <Link href={`/${item.module}/${item.slug}`} className="block focus-visible:outline-none">
        <div
          className="relative w-full overflow-hidden rounded-[var(--hp-r-md)] bg-[color:var(--hp-brand-tint)]"
          style={{ aspectRatio: "1200/500" }}
        >
          {item.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.title}
              sizes="(min-width: 1280px) 1216px, 100vw"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
            />
          )}
        </div>

        {/* TG floats the content panel up over the image edge. */}
        <div className="relative -mt-6 mx-4 rounded-[var(--hp-r-md)] bg-[color:var(--hp-brand-ink)] p-6 text-[color:var(--hp-on-brand)] sm:mx-8 dark:border dark:border-white/[0.08]">
          <Eyebrow onDark className="mb-2">
            {MODULE_LABEL[item.module] ?? item.module}
          </Eyebrow>

          <h3 className="text-[24px] font-bold leading-[32px]">{item.title}</h3>

          {item.excerpt && (
            <p className="mt-2 line-clamp-2 text-[15px] leading-[26px] text-[color:var(--hp-on-brand-mut)]">
              {item.excerpt}
            </p>
          )}

          <div className="mt-4">
            <Byline
              author={{
                name: item.author?.name ?? "تحریریه",
                username: item.author?.username,
                role: item.author?.role,
                avatar: item.author?.avatar,
              }}
              date={item.date_fa}
              onDark
            />
          </div>
        </div>
      </Link>
    </article>
  );
}

function SmallCard({ item }: { item: ContentItem }) {
  return (
    <article className="hp-card group h-full">
      <Link href={`/${item.module}/${item.slug}`} className="flex h-full flex-col focus-visible:outline-none">
        <div
          className="relative w-full overflow-hidden rounded-[var(--hp-r-sm)] bg-[color:var(--hp-brand-tint)]"
          style={{ aspectRatio: "450/253" }}
        >
          {item.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.title}
              sizes="(min-width: 900px) 290px, 50vw"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
            />
          )}
        </div>

        <div className="pt-3">
          <Eyebrow className="mb-1 !text-[11px] !tracking-[1px]">
            {MODULE_LABEL[item.module] ?? item.module}
          </Eyebrow>
          <h3 className="line-clamp-3 text-[16px] font-bold leading-[24px] text-[color:var(--hp-ink)] transition-colors group-hover:text-[color:var(--hp-brand)]">
            {item.title}
          </h3>
          <p className="mt-1.5 text-[12px] leading-[18px] text-[color:var(--hp-ink-3)]">
            {item.date_fa}
          </p>
        </div>
      </Link>
    </article>
  );
}

export default MoreToExploreSection;
