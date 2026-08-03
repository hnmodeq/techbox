/**
 * §12 · Website info — the homepage's closing section.
 *
 * Three things that used to render as three separate sections, each with its
 * own band and its own place in the ordering:
 *
 *   A. the positioning statement ("مرجع روزانهٔ شما…")
 *   B. the author profiles
 *   C. the community members ("خانوادهٔ تکباکس")
 *
 * They are one idea — who is behind the site and who uses it — so they now
 * share one section, one band, and one entry in the admin ordering. Splitting
 * them meant the alternating band rhythm put a stripe between the manifesto
 * and the people it describes, and an admin who hid "authors" was left with
 * an orphaned intro paragraph.
 *
 * Visibility is controlled from the admin panel like any module, through the
 * `websiteInfo` section key.
 *
 * Server Component (the rails inside are the client parts).
 */
import * as React from "react";
import type { AuthorCard, FamilyProfile } from "@/features/home/lib/home-types";
import { AuthorsRail } from "./AuthorsSection";
import { FamilyProfilesRail } from "./FamilyProfilesSection";

export type WebsiteInfoSectionProps = {
  authors: AuthorCard[];
  profiles: FamilyProfile[];
  title?: string;
  showTitle?: boolean;
};

const HEADING_ID = "hp-website-info-heading";

export function WebsiteInfoSection({
  authors,
  profiles,
  title = "دربارهٔ تکباکس",
  showTitle = true,
}: WebsiteInfoSectionProps) {
  const hasAuthors = authors && authors.length >= 4;
  const hasProfiles = profiles && profiles.length >= 4;

  // Nothing to say without people to show. The manifesto alone is a wall of
  // text with no supporting content.
  if (!hasAuthors && !hasProfiles) return null;

  return (
    <section aria-labelledby={HEADING_ID} className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1280px] overflow-hidden rounded-[var(--hp-r-lg)]">
        {/* ── A. Manifesto ──────────────────────────────────────── */}
        <div className="bg-[color:var(--hp-brand-ink)] px-6 py-16 text-[color:var(--hp-on-brand)] sm:px-8 lg:py-20 dark:border dark:border-white/[0.08] dark:border-b-0">
          <div className="mx-auto max-w-4xl">
            <h2
              id={HEADING_ID}
              className="text-center text-[26px] font-medium leading-8 md:text-5xl md:leading-[60px]"
            >
              {showTitle ? "مرجع روزانهٔ شما در فناوری اطلاعات." : <span className="sr-only">{title}</span>}
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

        {/* ── B. Authors ────────────────────────────────────────── */}
        {hasAuthors && <AuthorsRail authors={authors} />}

        {/* ── C. Community members ──────────────────────────────── */}
        {hasProfiles && <FamilyProfilesRail profiles={profiles} />}
      </div>
    </section>
  );
}

export default WebsiteInfoSection;
