import Link from "next/link";
import { moduleColors } from "@/config/module-colors";
import { moduleMeta, type ModuleSlug } from "@/lib/content";

type TickerItem = {
 slug: string;
 title: string;
 module?: ModuleSlug | string;
 date_fa?: string;
 time?: string;
 author?: { name?: string };
};

type NewsTickerProps = {
 items: TickerItem[];
 className?: string;
};

const KNOWN: ModuleSlug[] = ["blog", "news", "media", "review", "tools", "download", "shop", "forum"];

function getModule(item: TickerItem): ModuleSlug {
 return KNOWN.includes(item.module as ModuleSlug) ? (item.module as ModuleSlug) : "news";
}

/** Short Farsi label describing the kind of update, per module. */
function getKindLabel(module: ModuleSlug, item: TickerItem): string {
 switch (module) {
 case "media":
 return "ویدیوی جدید";
 case "forum":
 return item.author?.name ? `تاپیک: ${item.author.name}`: "تاپیک جدید";
 case "download":
 return "دانلود جدید";
 case "review":
 return "نقد جدید";
 case "blog":
 return "مجله";
 case "shop":
 return "محصول جدید";
 case "tools":
 return "ابزار";
 default:
 return "خبر";
 }
}

export default function NewsTicker({ items, className = "" }: NewsTickerProps) {
 if (!items?.length) return null;

 const loopItems = [...items, ...items, ...items];

 return (
 <section className={`w-full overflow-hidden ${className}`} aria-label="آخرین به‌روزرسانی‌ها">
 <div dir="rtl" className="ticker-wrapper relative w-full overflow-hidden">
 <div className="ticker-track flex w-max min-w-full items-center gap-8 py-2.5">
 {loopItems.map((item, index) => {
 const itemModule = getModule(item);
 const tone = moduleColors[itemModule].active;
 const hoverTone = moduleColors[itemModule].hover;
 const kind = getKindLabel(itemModule, item);
 const when = item.time ? `${item.date_fa ?? ""} ${item.time}`.trim() : item.date_fa;
 return (
 <Link
 key={`${item.module || "news"}-${item.slug}-${index}`}
 href={`/${itemModule}/${item.slug}`}
 className={`ticker-item group flex shrink-0 items-center gap-2 whitespace-nowrap tb-text-md text-[var(--tb-fg-muted)] transition-colors duration-[var(--tb-motion-sm)] ${hoverTone}`}
 >
                <span className="h-1.5 w-1.5 rounded-[var(--tb-radius-full)] bg-[var(--tb-fg-muted)] opacity-70 transition-transform group-hover:scale-125" />
                <span className={`rounded-[var(--tb-radius-full)] border border-[var(--tb-border)] px-2 py-0.5 tb-text-sm ${tone}`}>
                  {moduleMeta[itemModule]?.titleFa ?? kind}
                </span>
 <span className="text-[var(--tb-fg-primary)]">{item.title}</span>
 {when && <span className="tb-text-sm text-[var(--tb-fg-muted)]">• {when}</span>}
 </Link>
 );
 })}
 </div>
 </div>
 </section>
 );
}
