import Link from "next/link";
import Image from "next/image";
import type { ContentItem } from "@/lib/content";
import { moduleMeta } from "@/lib/content";
import { moduleColors } from "@/config/module-colors";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/design/icons";
import { CardStats } from "@/components/ui/CardStats";

const fallbackImage = "/assets/blog-1.jpg";
const fallbackAvatar = "/assets/hooman.png";

/** Small engagement stat with a central-system icon. */
function Stat({ icon, value }: { icon: "like" | "view" | "comment"; value: string | number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon name={icon} size={14} strokeWidth={1.75} className="shrink-0" />
      <span>{value}</span>
    </span>
  );
}

/**
 * Module-synced hover color class for a feed card's title, scoped to THIS card only.
 * Each feed card uses `group/card`, so we retarget the centralized `group-hover:`token
 * to the named `group-hover/card:`variant. This prevents hovering one card from changing
 * every title inside the same Bento (which has its own outer `group`).
 */
function moduleHover(module: ContentItem["module"]) {
 const cls = moduleColors[module]?.hover ?? "group-hover:text-[var(--primary-text)]";
 return cls.replaceAll("group-hover:", "group-hover/card:");
}

function SafeImage({
 src,
 alt,
 className = "",
 sizes = "100vw",
}: {
 src?: string;
 alt: string;
 className?: string;
 sizes?: string;
}) {
 return (
 <Image
 src={src || fallbackImage}
 alt={alt}
 fill
 sizes={sizes}
 className={className}
 />
 );
}

export function ContentCard({ item, compact = false }: { item: ContentItem; compact?: boolean }) {
 const meta = moduleMeta[item.module];
 return (
 <Link
 href={`/${item.module}/${item.slug}`}
 className="group/card block rounded-[var(--corner-radius)] p-2 transition-colors hover:bg-[color-mix(in_oklch,var(--muted-background)_45%,transparent)]"
 >
 <div className="flex gap-3">
 {item.image && !compact && (
 <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--corner-radius)] bg-[var(--muted-background)]">
 <SafeImage src={item.image} alt={item.title} className="object-cover" sizes="80px" />
 </div>
 )}
 <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
            <span>{item.date_fa}</span>
          </div>
 <h4 className={`mt-1 line-clamp-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-[var(--primary-text)] transition-colors ${moduleHover(item.module)}`}>{item.title}</h4>
 {!compact && <p className="mt-1 line-clamp-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{item.excerpt}</p>}
          <div className="mt-2">
            <CardStats module={item.module} slug={item.slug} initialViews={item.views ?? 0} initialLikes={item.likes ?? 0} showComments={true} />
          </div>
 </div>
 </div>
 </Link>
 );
}

// ---------- FEED VARIANTS ----------
export function ContentFeedList({ items, variant="compact" }: { items: ContentItem[]; variant?: "compact"|"image"|"video"|"forum"|"product"|"download"|"review" }) {
 if (!items.length) return <div className="py-6 text-center text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">مطلبی نیست</div>;

 if (variant === "product") {
 return (
 <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
 {items.map(i => <ProductFeedCard key={i.module+i.slug} item={i} />)}
 </div>
 );
 }

 if (variant === "review") {
 return (
 <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
 {items.map(i => <ReviewFeedCard key={i.module+i.slug} item={i} />)}
 </div>
 );
 }

 return (
 <div className="space-y-1.5">
 {items.map(i => {
 if(variant==="video") return <VideoFeedCard key={i.module+i.slug} item={i} />;
 if(variant==="forum") return <ForumFeedCard key={i.module+i.slug} item={i} />;
 if(variant==="download") return <DownloadFeedCard key={i.module+i.slug} item={i} />;
 return <ContentCard key={i.module+i.slug} item={i} compact={variant==="compact"} />;
 })}
 </div>
 );
}

function VideoFeedCard({item}:{item:ContentItem}){
 return (
 <Link href={`/${item.module}/${item.slug}`} className="group/card block overflow-hidden rounded-[var(--corner-radius)] p-1.5 transition-colors hover:bg-[color-mix(in_oklch,var(--muted-background)_45%,transparent)]">
 <div className="relative aspect-video overflow-hidden rounded-[var(--corner-radius)] bg-black">
        <SafeImage src={item.image} alt={item.title} className="object-cover" sizes="(min-width:768px) 33vw, 100vw" />
      </div>
      <div className="px-1 pt-2">
        <div className={`line-clamp-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] transition-colors ${moduleHover(item.module)}`}>{item.title}</div>
        <div className="mt-1">
          <CardStats module={item.module} slug={item.slug} initialViews={item.views ?? 0} initialLikes={item.likes ?? 0} showComments={true} />
        </div>
      </div>
 </Link>
 );
}

function ForumFeedCard({item}:{item:ContentItem}){
 const answers = ((item.likes ?? 0) % 7) + 2;
 const solved = !item.slug.includes("proxmox");
 return (
 <Link href={`/${item.module}/${item.slug}`} className="group/card flex gap-2.5 rounded-[var(--corner-radius)] p-2 transition-colors hover:bg-[color-mix(in_oklch,var(--muted-background)_45%,transparent)]">
 <div className="relative mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-[var(--corner-radius)] bg-[var(--muted-background)]">
 <Image src={item.author?.avatar || fallbackAvatar} alt={item.author?.name || "کاربر"} fill sizes="32px" className="object-cover" />
 </div>
 <div className="min-w-0 flex-1">
 <div className={`line-clamp-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] transition-colors ${moduleHover(item.module)}`}>{item.title}</div>
 <div className="mt-1 flex flex-wrap items-center gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 <span>{item.author?.name || "کاربر"}</span>
 <span>• {answers} پاسخ</span>
            <span className={`rounded-[var(--corner-radius)] border px-1.5 py-0.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] ${solved ? "border-[color-mix(in_oklch,var(--tb-success)_45%,transparent)] text-[var(--tb-success)]" : "border-[color-mix(in_oklch,var(--tb-warning)_45%,transparent)] text-[var(--tb-warning)]"}`}>{solved ? "حل‌شده" : "باز"}</span>
 </div>
 </div>
 </Link>
 );
}

function ProductFeedCard({item}:{item:ContentItem}){
 return (
 <Link href={`/${item.module}/${item.slug}`} className="group/card block overflow-hidden rounded-[var(--corner-radius)] p-1.5 transition-colors hover:bg-[color-mix(in_oklch,var(--muted-background)_45%,transparent)]">
 <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--corner-radius)] bg-[var(--muted-background)]">
 <SafeImage src={item.image} alt={item.title} className="object-cover" sizes="(min-width:1024px) 180px, 50vw" />
 <span className="absolute left-2 top-2 rounded-[var(--corner-radius)] border border-white/30 bg-transparent px-2 py-0.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-white backdrop-blur-[var(--tb-blur-sm)]">موجود</span>
 </div>
 <div className="px-1 pt-2">
 <div className={`line-clamp-2 min-h-[34px] text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] transition-colors ${moduleHover(item.module)}`}>{item.title}</div>
 <div className="mt-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-[var(--shop)]">۴۸,۹۰۰,۰۰۰ <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">تومان</span></div>
 </div>
 </Link>
 );
}

function DownloadFeedCard({item}:{item:ContentItem}){
 return (
 <Link href={`/${item.module}/${item.slug}`} className="group/card flex items-center justify-between gap-3 rounded-[var(--corner-radius)] p-2.5 transition-colors hover:bg-[color-mix(in_oklch,var(--muted-background)_45%,transparent)]">
 <div className="min-w-0 flex-1">
 <div className={`line-clamp-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] font-bold transition-colors ${moduleHover(item.module)}`}>{item.title}</div>
 <div className="mt-0.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{item.date_fa} • {item.category}</div>
 </div>
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color shrink-0 font-bold">{(item.likes ?? 0).toLocaleString("fa-IR")} بار دانلود</div>
 </Link>
 );
}

function ReviewFeedCard({item}:{item:ContentItem}){
 return (
 <Link href={`/${item.module}/${item.slug}`} className="group/card flex gap-2.5 overflow-hidden rounded-[var(--corner-radius)] p-2 transition-colors hover:bg-[color-mix(in_oklch,var(--muted-background)_45%,transparent)]">
 <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--corner-radius)] bg-[var(--muted-background)]">
 <SafeImage src={item.image} alt={item.title} className="object-cover" sizes="64px" />
 </div>
 <div className="min-w-0 flex-1 space-y-1">
 <div className={`line-clamp-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] transition-colors ${moduleHover(item.module)}`}>{item.title}</div>
 <div className="flex items-center gap-2">
 <div className="relative h-5 w-5 overflow-hidden rounded-[var(--corner-radius)] bg-[var(--muted-background)]">
 <Image src={item.author?.avatar || fallbackAvatar} alt={item.author?.name || "نویسنده"} fill sizes="20px" className="object-cover" />
 </div>
 <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{item.author?.name || "تکباکس"}</span>
 </div>
          <div className="mt-1">
            <CardStats module={item.module} slug={item.slug} initialViews={item.views ?? 0} initialLikes={item.likes ?? 0} showComments={true} />
          </div>
 </div>
 </Link>
 );
}
