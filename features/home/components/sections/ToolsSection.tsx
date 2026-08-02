/**
 * §8 · Tools — Spiceworks "Tools & Apps"
 *
 * Spiceworks uses flat coloured illustrations above a two-line, centred
 * name, five across, with NO card chrome at all — the tiles float on the
 * section background and only gain a surface on hover. That restraint is
 * the look; adding borders would break it.
 *
 * Data comes from `toolRoutes` in config/modules.config.ts, the same
 * registry /tools renders from, so a tool appears here the moment its
 * route ships and disappears if it is removed. No hardcoded tool list.
 *
 * Server Component.
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §8
 */
import * as React from "react";
import Link from "next/link";
import { toolRoutes } from "@/config/modules.config";
import { ToolIcon } from "@/design/icons/tools";
import { SectionHeader } from "../primitives";

export type ToolsSectionProps = {
  /** Optional slug allow-list/order from SiteSetting `home.tools.featured`. */
  featured?: string[];
  title?: string;
  moreLabel?: string;
  showTitle?: boolean;
  showMore?: boolean;
  accentColor?: string;
};

const HEADING_ID = "hp-tools-heading";

type ToolsStyle = React.CSSProperties & { "--tools-accent"?: string };

export function ToolsSection({
  featured,
  title = "ابزارها و اپلیکیشن‌ها",
  moreLabel = "مشاهده همه ابزارها",
  showTitle = true,
  showMore = true,
  accentColor,
}: ToolsSectionProps) {
  const all = [...toolRoutes];

  // Admin override reorders and filters; anything unknown is ignored
  // rather than rendered as a broken tile.
  const tools = featured?.length
    ? featured
        .map((slug) => all.find((t) => t.slug === slug))
        .filter((t): t is (typeof all)[number] => Boolean(t))
    : all;

  if (!tools.length) return null;

  const style: ToolsStyle = { "--tools-accent": accentColor || "var(--primary)" };

  return (
    <section
      aria-labelledby={HEADING_ID}
      className="w-full bg-[color:var(--hp-bg)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      style={style}
    >
      <div className="mx-auto w-full max-w-[1280px]">
        {showTitle && (
          <SectionHeader
            headingId={HEADING_ID}
            title={title}
            description="ابزارهای آنلاین و آسان IT. محاسبه ظرفیت، انتخاب سخت‌افزار و زیرشبکه — بدون نصب."
            href={showMore ? "/tools" : undefined}
            linkLabel={moreLabel}
            accentColor={accentColor}
          />
        )}
        {!showTitle && <h2 id={HEADING_ID} className="sr-only">{title}</h2>}

        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <ToolTile tool={tool} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ToolTile({ tool }: { tool: (typeof toolRoutes)[number] }) {
  return (
    <Link
      href={tool.href}
      className="group relative flex h-full flex-col items-center rounded-[var(--hp-r-md)] bg-transparent px-4 py-8 text-center focus-visible:ring-2 focus-visible:ring-[color:var(--hp-brand)] focus-visible:outline-none"
    >
      {/* Fixed monochrome technical glyph: icon colour never changes on hover. */}
      <ToolIcon
        slug={tool.slug}
        size={56}
        className="text-[color:var(--hp-ink-3)] motion-reduce:transform-none"
      />

      {/*
        Spiceworks breaks the tool name onto two lines and keeps the block
        a fixed height so the grid baseline stays level. `text-wrap:
        balance` + min-height reproduces that without hardcoding a break.
      */}
      <h3
        className="mt-4 text-[18px] font-bold leading-[28px] text-[color:var(--hp-ink)] transition-colors group-hover:text-[color:var(--tools-accent)]"
        style={{ textWrap: "balance", minHeight: "56px" }}
      >
        {tool.titleFa}
      </h3>

      <p className="mt-1 line-clamp-2 text-[13px] leading-[22px] text-[color:var(--hp-ink-3)]">
        {tool.descriptionFa}
      </p>
    </Link>
  );
}

export default ToolsSection;
