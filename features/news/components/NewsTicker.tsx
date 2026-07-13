"use client";
import { useMemo } from "react";
import Link from "next/link";
import { moduleColors } from "@/config/module-colors";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import { useHomeTicker } from "@/features/home/lib/home-data";

type TickerItem = { slug: string; title: string; module?: ModuleSlug | string; date?: string; date_fa?: string; time?: string; author?: { name?: string } };
type NewsTickerProps = { items: TickerItem[]; className?: string };
const KNOWN: ModuleSlug[] = ["blog", "news", "media", "review", "tools", "download", "shop", "forum"];
function getModule(item: TickerItem): ModuleSlug { return KNOWN.includes(item.module as ModuleSlug) ? (item.module as ModuleSlug) : "blog"; }
function getKindLabel(module: ModuleSlug) { return moduleMeta[module]?.titleFa || module; }

export default function NewsTicker({ items, className = "" }: NewsTickerProps) {
  const { items: liveItems } = useHomeTicker();
  const live = liveItems.length ? liveItems : items;
  const filtered = useMemo(() => live.filter(i => i.module !== 'news').slice(0, 30), [live]);
  if (!filtered.length) return null;
  const renderGroup = (groupIndex: number) => <div className="ticker-group flex shrink-0 items-center gap-8 py-1.5" aria-hidden={groupIndex > 0}>{filtered.map((item, index) => { const itemModule=getModule(item); const tone=moduleColors[itemModule].active; const hoverTone=moduleColors[itemModule].hover; const when=item.time ? `${item.date_fa ?? ""} ${item.time}`.trim() : item.date_fa; return <Link key={`${groupIndex}-${item.module}-${item.slug}-${index}`} href={`/${itemModule}/${item.slug}`} tabIndex={groupIndex>0?-1:undefined} className={`ticker-item group flex shrink-0 items-center gap-2 whitespace-nowrap text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold paragraph-color transition-colors duration-[150ms] ${hoverTone}`} dir="rtl"><span className="h-1.5 w-1.5 rounded-[var(--corner-radius)] bg-[var(--paragraph-color)] opacity-70 transition-transform group-hover:scale-125" /><span className={`px-2 py-0.5 font-bold ${tone}`}>{getKindLabel(itemModule)}</span><span className="text-[var(--primary-text)]">{item.title}</span>{when && <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">• {when}</span>}</Link>;})}</div>;
  return <section className={`w-full max-w-full overflow-x-hidden overflow-hidden ${className}`} aria-label="آخرین به‌روزرسانی‌ها"><div dir="ltr" className="ticker-wrapper relative w-full max-w-full overflow-x-hidden overflow-hidden"><div className="ticker-track flex w-max min-w-max items-center">{renderGroup(0)}{renderGroup(1)}</div></div></section>;
}
