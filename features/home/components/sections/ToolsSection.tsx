/** Homepage tools: one RAID feature plus a 2×2 image grid. */
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { toolRoutes } from "@/config/modules.config";
import { ToolsConsultationPanel } from "./ToolsConsultationPanel";

export type ToolsSectionProps = {
  featured?: string[];
  title?: string;
  moreLabel?: string;
  showTitle?: boolean;
  showMore?: boolean;
  accentColor?: string;
};

const HEADING_ID = "hp-tools-heading";
type ToolsStyle = React.CSSProperties & { "--tools-accent"?: string; "--hp-brand"?: string };
type ToolRoute = (typeof toolRoutes)[number];

export function ToolsSection({
  featured,
  title = "ابزارها و اپلیکیشن‌ها",
  accentColor,
}: ToolsSectionProps) {
  const all = [...toolRoutes];
  // Admin ordering still matters, but the homepage always keeps all five
  // shipped tools. RAID is promoted independently into the full-width slot.
  const preferred = featured?.length
    ? featured
        .map((slug) => all.find((tool) => tool.slug === slug))
        .filter((tool): tool is ToolRoute => Boolean(tool))
    : [];
  const ordered = [...preferred, ...all.filter((tool) => !preferred.some((item) => item.slug === tool.slug))];
  const raid = ordered.find((tool) => tool.slug === "raid-calculator");
  const compact = ordered.filter((tool) => tool.slug !== "raid-calculator").slice(0, 4);
  if (!raid || compact.length < 4) return null;

  const toolAccent = accentColor || "var(--module-tools-color, var(--primary))";
  const style: ToolsStyle = { "--tools-accent": toolAccent, "--hp-brand": toolAccent };

  return (
    <section
      aria-labelledby={HEADING_ID}
      className="w-full bg-white px-4 py-10 text-foreground dark:bg-black sm:px-6 lg:px-8 lg:py-12"
      style={style}
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <h2 id={HEADING_ID} className="sr-only">{title}</h2>
        <p className="mb-6 text-center text-xl font-bold text-foreground sm:text-2xl">
          ابزارهایی که کار شما رو شاید راحت‌تر کنه
        </p>

        <ToolTile tool={raid} />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {compact.map((tool) => <ToolTile key={tool.slug} tool={tool} />)}
        </div>

        <div className="my-7 flex items-center gap-4" aria-label="یا">
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
          <span className="text-sm font-black text-muted-foreground">یا</span>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>

        <ToolsConsultationPanel />
      </div>
    </section>
  );
}

function ToolTile({ tool }: { tool: ToolRoute }) {
  return (
    <Link
      href={tool.href}
      className="group relative isolate flex min-h-[90px] w-full overflow-hidden border border-border bg-black text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tools-accent)] sm:min-h-[96px]"
    >
      <Image
        src={tool.image}
        alt=""
        fill
        quality={95}
        sizes={tool.slug === "raid-calculator" ? "(min-width: 1280px) 1280px, 100vw" : "(min-width: 640px) 50vw, 100vw"}
        className="-z-20 object-cover saturate-100"
      />
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/70 to-black/55" />
      <span className="mt-auto block w-full p-3 text-right sm:p-4">
        <span className="block text-xl font-bold leading-8 text-white/90 transition-colors group-hover:text-[color:var(--tools-accent)] sm:text-2xl">{tool.titleFa}</span>
        <span className="mt-1 block max-w-3xl text-sm leading-6 text-white/78 sm:text-[15px]">
          {tool.descriptionFa}
        </span>
      </span>
    </Link>
  );
}

export default ToolsSection;
