import Link from "next/link";
import Image from "next/image";
import type { ContentItem } from "@/lib/content";
import { moduleMeta } from "@/lib/content";
import { moduleColors } from "@/config/module-colors";
import { ButtonLink } from "@/components/ui/Button";

const fallbackImage = "/assets/blog-1.jpg";
const fallbackAvatar = "/assets/hooman.png";

/**
 * Module-synced hover color class for a feed card's title, scoped to THIS card only.
 * Each feed card uses `group/card`, so we retarget the centralized `group-hover:` token
 * to the named `group-hover/card:` variant. This prevents hovering one card from changing
 * every title inside the same Bento (which has its own outer `group`).
 */
function moduleHover(module: ContentItem["module"]) {
  const cls = moduleColors[module]?.hover ?? "group-hover:text-[var(--tb-foreground)]";
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
      className="group/card block rounded-[var(--tb-radius-md)] p-2 transition-colors hover:bg-[color-mix(in_oklch,var(--tb-muted)_45%,transparent)]"
    >
      <div className="flex gap-3">
        {item.image && !compact && (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--tb-radius-md)] bg-[var(--tb-muted)]">
            <SafeImage src={item.image} alt={item.title} className="object-cover" sizes="80px" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] text-[var(--tb-muted-foreground)]">
            <span className="font-semibold text-[var(--tb-foreground)]">{meta.titleFa}</span>
            <span>•</span>
            <span>{item.date_fa}</span>
          </div>
          <h4 className={`mt-1 line-clamp-2 text-[13px] font-bold leading-6 text-[var(--tb-foreground)] transition-colors ${moduleHover(item.module)}`}>{item.title}</h4>
          {!compact && <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[var(--tb-muted-foreground)]">{item.excerpt}</p>}
          <div className="mt-2 flex items-center gap-3 text-[10px] text-[var(--tb-muted-foreground)]">
            <span>♥ {item.likes}</span>
            <span>👁 {item.views.toLocaleString("fa-IR")}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ---------- FEED VARIANTS ----------
export function ContentFeedList({ items, variant="compact" }: { items: ContentItem[]; variant?: "compact"|"image"|"video"|"forum"|"product"|"download"|"review" }) {
  if (!items.length) return <div className="py-6 text-center text-xs text-[var(--tb-muted-foreground)]">مطلبی نیست</div>;

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
    <Link href={`/${item.module}/${item.slug}`} className="group/card block overflow-hidden rounded-[var(--tb-radius-md)] p-1.5 transition-colors hover:bg-[color-mix(in_oklch,var(--tb-muted)_45%,transparent)]">
      <div className="relative aspect-video overflow-hidden rounded-[var(--tb-radius-sm)] bg-black">
        <SafeImage src={item.image} alt={item.title} className="object-cover" sizes="(min-width:768px) 33vw, 100vw" />
        <span className="absolute inset-0 flex items-center justify-center"><span className="tb-image-badge h-10 w-10 text-white">▶</span></span>
      </div>
      <div className="px-1 pt-2">
        <div className={`line-clamp-2 text-[12px] font-bold leading-5 transition-colors ${moduleHover(item.module)}`}>{item.title}</div>
        <div className="mt-1 text-[10px] text-[var(--tb-muted-foreground)]">👁 {item.views.toLocaleString("fa-IR")} • ♥ {item.likes} • 💬</div>
      </div>
    </Link>
  );
}

function ForumFeedCard({item}:{item:ContentItem}){
  const answers = (item.likes % 7) + 2;
  const solved = !item.slug.includes("proxmox");
  return (
    <Link href={`/${item.module}/${item.slug}`} className="group/card flex gap-2.5 rounded-[var(--tb-radius-md)] p-2 transition-colors hover:bg-[color-mix(in_oklch,var(--tb-muted)_45%,transparent)]">
      <div className="relative mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-[var(--tb-radius-full)] bg-[var(--tb-muted)]">
        <Image src={item.author.avatar || fallbackAvatar} alt={item.author.name} fill sizes="32px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`line-clamp-2 text-[12px] font-bold leading-5 transition-colors ${moduleHover(item.module)}`}>{item.title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-[var(--tb-muted-foreground)]">
          <span>{item.author.name}</span>
          <span>• {answers} پاسخ</span>
          <span className="rounded-[var(--tb-radius-xs)] border border-[var(--tb-border)] px-1.5 py-0.5 text-[9px] text-[var(--tb-muted-foreground)]">{solved ? "حل‌شده" : "باز"}</span>
        </div>
      </div>
    </Link>
  );
}

function ProductFeedCard({item}:{item:ContentItem}){
  return (
    <Link href={`/${item.module}/${item.slug}`} className="group/card block overflow-hidden rounded-[var(--tb-radius-md)] p-1.5 transition-colors hover:bg-[color-mix(in_oklch,var(--tb-muted)_45%,transparent)]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--tb-radius-sm)] bg-[var(--tb-muted)]">
        <SafeImage src={item.image} alt={item.title} className="object-cover" sizes="(min-width:1024px) 180px, 50vw" />
        <span className="absolute left-2 top-2 rounded-[var(--tb-radius-full)] border border-white/30 bg-transparent px-2 py-0.5 text-[9px] text-white backdrop-blur-[var(--tb-blur-sm)]">موجود</span>
      </div>
      <div className="px-1 pt-2">
        <div className={`line-clamp-2 min-h-[34px] text-[11.5px] font-bold leading-5 transition-colors ${moduleHover(item.module)}`}>{item.title}</div>
        <div className="mt-1 text-[12px] font-black text-[var(--tb-shop)]">۴۸,۹۰۰,۰۰۰ <span className="text-[9px] text-[var(--tb-muted-foreground)]">تومان</span></div>
      </div>
    </Link>
  );
}

function DownloadFeedCard({item}:{item:ContentItem}){
  return (
    <div className="group/card flex items-center gap-2 rounded-[var(--tb-radius-md)] p-2 transition-colors hover:bg-[color-mix(in_oklch,var(--tb-muted)_45%,transparent)]">
      <div className="min-w-0 flex-1">
        <Link href={`/${item.module}/${item.slug}`} className={`line-clamp-1 text-[12px] font-bold transition-colors ${moduleHover(item.module)}`}>{item.title}</Link>
        <div className="mt-0.5 text-[10px] text-[var(--tb-muted-foreground)]">{item.date_fa} • {item.category}</div>
      </div>
      <ButtonLink href={`/${item.module}/${item.slug}`} size="xs" className="whitespace-nowrap px-3 py-1.5 text-[10px]">انتخاب نسخه</ButtonLink>
    </div>
  );
}

function ReviewFeedCard({item}:{item:ContentItem}){
  return (
    <Link href={`/${item.module}/${item.slug}`} className="group/card flex gap-2.5 overflow-hidden rounded-[var(--tb-radius-md)] p-2 transition-colors hover:bg-[color-mix(in_oklch,var(--tb-muted)_45%,transparent)]">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--tb-radius-md)] bg-[var(--tb-muted)]">
        <SafeImage src={item.image} alt={item.title} className="object-cover" sizes="64px" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className={`line-clamp-2 text-[12px] font-bold leading-5 transition-colors ${moduleHover(item.module)}`}>{item.title}</div>
        <div className="flex items-center gap-2">
          <div className="relative h-5 w-5 overflow-hidden rounded-[var(--tb-radius-full)] bg-[var(--tb-muted)]">
            <Image src={item.author.avatar || fallbackAvatar} alt={item.author.name} fill sizes="20px" className="object-cover" />
          </div>
          <span className="text-[10px] text-[var(--tb-muted-foreground)]">{item.author.name}</span>
        </div>
        <div className="flex gap-2 text-[10px] text-[var(--tb-muted-foreground)]">
          <span>♥ {item.likes}</span>
          <span>💬 12</span>
          <span>👁 {item.views.toLocaleString("fa-IR")}</span>
        </div>
      </div>
    </Link>
  );
}
