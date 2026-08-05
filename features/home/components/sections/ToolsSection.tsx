/** Homepage tools: five transparent visual shortcuts plus consultation. */
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
  const preferred = featured?.length
    ? featured
        .map((slug) => all.find((tool) => tool.slug === slug))
        .filter((tool): tool is ToolRoute => Boolean(tool))
    : [];
  const ordered = [...preferred, ...all.filter((tool) => !preferred.some((item) => item.slug === tool.slug))].slice(0, 5);
  if (ordered.length < 5) return null;

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
        <p className="mb-7 text-center text-xl font-bold text-foreground sm:text-2xl">
          ابزارهایی که کار شما رو شاید راحت‌تر کنه
        </p>

        <div className="grid grid-cols-2 items-start gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
          {ordered.map((tool) => <ToolTile key={tool.slug} tool={tool} />)}
        </div>

        <div className="my-8 flex items-center gap-4" aria-label="یا">
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
      className="group flex min-w-0 flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tools-accent)]"
    >
      <span className="relative block h-32 w-full sm:h-36 lg:h-40">
        <Image
          src={tool.image}
          alt=""
          fill
          quality={100}
          sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
          className="object-contain transition-transform duration-200 group-hover:-translate-y-1 motion-reduce:transform-none"
        />
      </span>
      <span className="mt-2 block text-sm font-bold leading-6 text-foreground transition-colors group-hover:text-[color:var(--tools-accent)] sm:text-base">
        {tool.titleFa}
      </span>
    </Link>
  );
}

export default ToolsSection;
