/**
 * §14 · Partners — "شرکایی که با آن‌ها کار می‌کنیم"
 *
 * A quiet logo band, the pattern both Spiceworks and Tom's Guide use for
 * vendor rows: greyscale by default, full colour on hover, so it reads as
 * credibility rather than advertising.
 *
 * Fully admin-managed through /admin/partners — nothing hardcoded. The
 * section hides itself when no partners are published.
 *
 * Server Component.
 */
import * as React from "react";
import Link from "next/link";
import type { PartnerCard } from "@/features/home/lib/home-types";
import { SectionShell, SectionHeader } from "../primitives";

export type PartnersSectionProps = {
  partners: PartnerCard[];
  title?: string;
};

const HEADING_ID = "hp-partners-heading";

export function PartnersSection({
  partners,
  title = "شرکایی که با آن‌ها کار می‌کنیم",
}: PartnersSectionProps) {
  if (!partners?.length) return null;

  return (
    <SectionShell labelledBy={HEADING_ID}>
      <SectionHeader
        headingId={HEADING_ID}
        title={title}
        description="برندها و شرکت‌هایی که تکباکس با آن‌ها همکاری می‌کند."
      />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {partners.map((p) => (
          <li key={p.id}>
            <PartnerTile partner={p} />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

function PartnerTile({ partner }: { partner: PartnerCard }) {
  const inner = (
    <>
      <span className="flex h-14 w-full items-center justify-center">
        {partner.logo ? (
          // Greyscale until hover — a wall of competing brand colours
          // would fight the page for attention.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={partner.logo}
            alt={partner.name}
            loading="lazy"
            className="max-h-12 max-w-full object-contain opacity-70 grayscale transition-[filter,opacity] duration-200 group-hover:opacity-100 group-hover:grayscale-0"
          />
        ) : (
          <span className="text-[15px] font-bold text-[color:var(--hp-ink-2)]">
            {partner.name}
          </span>
        )}
      </span>

      {partner.tagline && (
        <span className="mt-1.5 block truncate text-center text-[11px] leading-4 text-[color:var(--hp-ink-3)]">
          {partner.tagline}
        </span>
      )}
    </>
  );

  const cls =
    "hp-card group flex h-full flex-col items-center justify-center rounded-[var(--hp-r-md)] border border-[color:var(--hp-border)] bg-[color:var(--hp-surface)] p-4 transition-colors duration-200 hover:border-[color:var(--hp-brand)]/40";

  if (partner.url) {
    return (
      <a
        href={partner.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cls} focus-visible:ring-2 focus-visible:ring-[color:var(--hp-brand)] focus-visible:outline-none`}
        title={partner.name}
      >
        {inner}
      </a>
    );
  }

  return (
    <div className={cls} title={partner.name}>
      {inner}
    </div>
  );
}

export default PartnersSection;
