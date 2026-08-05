/**
 * §12 · Website info — the homepage's closing section.
 *
 * Manifesto + Authors (برخی از نویسندگان تکباکس) + TechBox Family (خانواده تکباکس)
 * with no background card, no metadata buttons, and clean author profiles.
 */
import * as React from "react";
import Image from "next/image";
import type { AuthorCard, FamilyProfile } from "@/features/home/lib/home-types";
import { AuthorsRail } from "./AuthorsSection";
import { FamilyProfilesRail } from "./FamilyProfilesSection";
import { CommunityJoinActions } from "./CommunityJoinActions";

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
  // One author is a valid masthead — تیم تحریریه may genuinely have a single
  // member, so neither rail has a minimum beyond "not empty".
  const hasAuthors = authors && authors.length > 0;
  const hasProfiles = profiles && profiles.length > 0;

  if (!hasAuthors && !hasProfiles) return null;

  return (
    <section
      aria-labelledby={HEADING_ID}
      className="w-full bg-white px-4 py-6 text-foreground dark:bg-black sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[1280px] overflow-hidden">
        {/* Manifesto without card background */}
        <div className="px-6 py-10 text-foreground sm:px-8">
          <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="text-center lg:text-right">
              <h2
                id={HEADING_ID}
                className="text-2xl font-bold leading-8 text-[color:var(--hp-ink)] md:text-4xl md:leading-[50px]"
              >
                {showTitle ? "عضو خانواده IT ایران باشید تا با هم رشد کنیم" : <span className="sr-only">{title}</span>}
              </h2>

              <p className="mt-4 text-lg font-light leading-8 text-[color:var(--hp-ink-3)] md:text-xl">
                شما میتونید در تکباکس هم به عنوان نویسنده و هم به عنوان عضوی از این خانواده ثبت نام کنید. ما تلاش میکنیم تا جای خالی جامعه‌ای با دانش فناوری‌های دیتاسنتری رو با هم پر کنیم، خوشحال میشیم شما هم عضوی از این خانواده باشید.
              </p>
              <CommunityJoinActions />
            </div>
            <Image
              src="/assets/home/decorations/website-info.webp"
              alt="جامعه فناوری زیرساخت تکباکس"
              width={668}
              height={352}
              className="mx-auto h-auto w-full max-w-[300px] object-contain"
            />
          </div>
        </div>

        {/* Authors rail */}
        {hasAuthors && <AuthorsRail authors={authors} />}

        {/* TechBox Family section moved below author profiles */}
        {hasProfiles && <FamilyProfilesRail profiles={profiles} />}
      </div>
    </section>
  );
}

export default WebsiteInfoSection;
