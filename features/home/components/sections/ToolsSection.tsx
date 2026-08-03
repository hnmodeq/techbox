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

type ToolsStyle = React.CSSProperties & {
  "--tools-accent"?: string;
  "--hp-ink"?: string;
  "--hp-ink-3"?: string;
  "--hp-brand"?: string;
};

export function ToolsSection({
  featured,
  title = "ابزارها و اپلیکیشن‌ها",
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

  const toolAccent = accentColor || "var(--module-tools-color, #60a5fa)";
  const style: ToolsStyle = {
    "--tools-accent": toolAccent,
    "--hp-brand": toolAccent,
    "--hp-ink": "#ffffff",
    "--hp-ink-3": "rgb(255 255 255 / 0.68)",
  };

  return (
    <section
      aria-labelledby={HEADING_ID}
      className="w-full bg-black px-4 py-10 text-white sm:px-6 lg:px-8 lg:py-12"
      style={style}
    >
      <div className="mx-auto w-full max-w-[1280px]">
        {/* The visual header and its former “more” action are deliberately
            hidden; the accessible heading keeps the section landmark named. */}
        <h2 id={HEADING_ID} className="sr-only">{title}</h2>

        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
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
      <ToolIcon
        slug={tool.slug}
        size={56}
        className="text-[color:var(--hp-ink-3)] transition-colors duration-200 group-hover:text-[color:var(--tools-accent)] motion-reduce:transform-none"
      />

      <h3
        className="mt-4 text-[18px] font-bold leading-[28px] text-[color:var(--hp-ink)] transition-colors group-hover:text-[color:var(--tools-accent)]"
        style={{ textWrap: "balance" }}
      >
        {tool.titleFa}
      </h3>

      <p className="mt-0.5 line-clamp-3 text-[13px] leading-[21px] text-[color:var(--hp-ink-3)]">
        {tool.descriptionFa}
      </p>
    </Link>
  );
}

export default ToolsSection;
