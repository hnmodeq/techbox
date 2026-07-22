import Link from "next/link";
import { prisma } from "@/lib/db";
import { publicPostDateWhere } from "@/lib/post-date";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Server component that shows navigation within a content series.
 * Renders prev/next links and a link to the series index.
 */
export async function SeriesNav({
  module,
  slug,
  series,
  seriesOrder,
}: {
  module: string;
  slug: string;
  series: string;
  seriesOrder?: number | null;
}) {
  if (!series) return null;

  let siblings: Array<{ slug: string; title: string; seriesOrder: number | null }> = [];
  try {
    siblings = await prisma.post.findMany({
      where: {
        module,
        series,
        published: true,
        deletedAt: null,
        date: publicPostDateWhere(),
      },
      orderBy: { seriesOrder: "asc" },
      select: { slug: true, title: true, seriesOrder: true },
    });
  } catch {}

  if (siblings.length < 2) return null;

  const currentIdx = siblings.findIndex((s) => s.slug === slug);
  const prev = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const next = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="text-[10px]">مجموعه مقالات</Badge>
          <Link href={`/${module}/series/${encodeURIComponent(series)}`} className="text-xs text-primary hover:underline">
            مشاهده همه ({siblings.length.toLocaleString("fa-IR")} بخش)
          </Link>
        </div>
        <p className="text-sm font-bold">{series}</p>
        <div className="flex items-center gap-2">
          {prev ? (
            <Link
              href={`/${module}/${prev.slug}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors flex-1"
            >
              <ChevronRight className="size-3.5" />
              <span className="truncate">
                {prev.seriesOrder != null && <span className="font-bold me-1">{prev.seriesOrder}.</span>}
                {prev.title}
              </span>
            </Link>
          ) : <div />}
          {next ? (
            <Link
              href={`/${module}/${next.slug}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors flex-1 justify-end text-left"
            >
              <span className="truncate">
                {next.seriesOrder != null && <span className="font-bold me-1">{next.seriesOrder}.</span>}
                {next.title}
              </span>
              <ChevronLeft className="size-3.5" />
            </Link>
          ) : <div />}
        </div>
        {/* Series parts list */}
        <div className="flex flex-wrap gap-1">
          {siblings.map((s, idx) => (
            <Link
              key={s.slug}
              href={`/${module}/${s.slug}`}
              className={`inline-flex size-7 items-center justify-center rounded text-[10px] font-bold transition-colors ${
                s.slug === slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
              title={s.title}
            >
              {s.seriesOrder || idx + 1}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
