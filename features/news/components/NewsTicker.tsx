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

 const renderGroup = (groupIndex: number) => (
 <div className="ticker-group flex shrink-0 items-center gap-8 py-2.5" aria-hidden={groupIndex > 0}>
 {items.map((item, index) => {
 const itemModule = getModule(item);
 const tone = moduleColors[itemModule].active;
 const hoverTone = moduleColors[itemModule].hover;
 const kind = getKindLabel(itemModule, item);
 const when = item.time ? `${item.date_fa ?? ""} ${item.time}`.trim() : item.date_fa;
 return (
 <Link
 key={`${groupIndex}-${item.module || "news"}-${item.slug}-${index}`}
 href={`/${itemModule}/${item.slug}`}
 tabIndex={groupIndex > 0 ? -1 : undefined}
 className={`ticker-item group flex shrink-0 items-center gap-2 whitespace-nowrap text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold paragraph-color transition-colors duration-[150ms] ${hoverTone}`}
 dir="rtl"
 >
                <span className="h-1.5 w-1.5 rounded-[var(--corner-radius)] bg-[var(--paragraph-color)] opacity-70 transition-transform group-hover:scale-125" />
                <span className={`px-2 py-0.5 font-bold ${tone}`}>
                  {moduleMeta[itemModule]?.titleFa ?? kind}
                </span>
 <span className="text-[var(--primary-text)]">{item.title}</span>
 {when && <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">• {when}</span>}
 </Link>
 );
 })}
 </div>
 );

 return (
 <section className={`w-full max-w-full overflow-x-hidden overflow-hidden ${className}`} aria-label="آخرین به‌روزرسانی‌ها">
 <div dir="ltr" className="ticker-wrapper relative w-full max-w-full overflow-x-hidden overflow-hidden">
 <div className="ticker-track flex w-max min-w-max items-center">
 {renderGroup(0)}
 {renderGroup(1)}
 </div>
 </div>
 </section>
 );
}
