import Link from "next/link";
import Image from "next/image";
import type { ContentItem } from "@/lib/content";
import { moduleMeta } from "@/lib/content";

export function ContentCard({ item, compact = false }: { item: ContentItem; compact?: boolean }) {
  const meta = moduleMeta[item.module];
  return (
    <Link href={`/${item.module}/${item.slug}`} className="block rounded-2xl border border-border bg-card/70 p-3 hover:bg-card hover:border-primary/30 transition-colors">
      <div className="flex gap-3">
        {item.image && !compact && (
          <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-muted">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px]" style={{color:"var(--muted-foreground)"}}>
            <span style={{color:"var(--foreground)"}} className="font-semibold">{meta.titleFa}</span>
            <span>•</span>
            <span>{item.date_fa}</span>
          </div>
          <h4 className="text-[13px] font-bold leading-6 line-clamp-2 mt-1 text-foreground hover:text-primary transition-colors">{item.title}</h4>
          {!compact && <p className="text-[11px] leading-5 mt-1 line-clamp-2" style={{color:"var(--muted-foreground)"}}>{item.excerpt}</p>}
          <div className="flex items-center gap-3 text-[10px] mt-2" style={{color:"var(--muted-foreground)"}}>
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
  if (!items.length) return <div className="text-xs py-6 text-center" style={{color:"var(--muted-foreground)"}}>مطلبی نیست</div>;
  // NO scroll by default – only news variant gets scroll
  const scrollClass = variant==="image" && items[0]?.module==="news" ? "max-h-[260px] overflow-y-auto pe-1" : "";
  return (
    <div className={`space-y-2.5 ${scrollClass}`}>
      {items.map(i => {
        if(variant==="video") return <VideoFeedCard key={i.module+i.slug} item={i} />;
        if(variant==="forum") return <ForumFeedCard key={i.module+i.slug} item={i} />;
        if(variant==="product") return <ProductFeedCard key={i.module+i.slug} item={i} />;
        if(variant==="download") return <DownloadFeedCard key={i.module+i.slug} item={i} />;
        if(variant==="review") return <ReviewFeedCard key={i.module+i.slug} item={i} />;
        return <ContentCard key={i.module+i.slug} item={i} compact={variant==="compact"} />;
      })}
    </div>
  );
}

function VideoFeedCard({item}:{item:ContentItem}){
  return (
    <Link href={`/${item.module}/${item.slug}`} className="block rounded-xl overflow-hidden border border-border bg-card/70 hover:border-[color-mix(in_oklch,var(--tb-media)_40%,transparent)] transition-colors">
      <div className="relative aspect-video bg-black">
        <img src={item.image||""} className="w-full h-full object-cover" alt="" />
        <span className="absolute inset-0 flex items-center justify-center"><span className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white">▶</span></span>
      </div>
      <div className="p-2.5">
        <div className="text-[12px] font-bold line-clamp-2 leading-5">{item.title}</div>
        <div className="text-[10px] mt-1" style={{color:"var(--muted-foreground)"}}>👁 {item.views.toLocaleString("fa-IR")} • ♥ {item.likes} • 💬</div>
      </div>
    </Link>
  );
}
function ForumFeedCard({item}:{item:ContentItem}){
  const answers = (item.likes % 7) + 2;
  const solved = !item.slug.includes("proxmox");
  return (
    <Link href={`/${item.module}/${item.slug}`} className="flex gap-2.5 p-2.5 rounded-xl border border-border bg-card/60 hover:bg-card transition-colors">
      <img src={item.author.avatar || "/assets/hooman.png"} className="w-8 h-8 rounded-full object-cover mt-0.5" alt="" />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold line-clamp-2 leading-5">{item.title}</div>
        <div className="text-[10px] mt-1 flex items-center gap-2 flex-wrap" style={{color:"var(--muted-foreground)"}}>
          <span>{item.author.name}</span>
          <span>• {answers} پاسخ</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] ${solved ? "bg-[color-mix(in_oklch,var(--tb-success)_15%,transparent)] text-[var(--tb-success)]" : "bg-[color-mix(in_oklch,var(--tb-warning)_15%,transparent)] text-[var(--tb-warning)]"}`}>{solved ? "حل‌شده" : "باز"}</span>
        </div>
      </div>
    </Link>
  );
}
function ProductFeedCard({item}:{item:ContentItem}){
  // SQUARE product card for home feed – per request
  return (
    <Link href={`/${item.module}/${item.slug}`} className="block rounded-2xl border border-border bg-card/70 overflow-hidden hover:border-[color-mix(in_oklch,var(--tb-shop)_40%,transparent)] transition-colors">
      <div className="aspect-square bg-muted relative overflow-hidden">
        <img src={item.image||""} className="w-full h-full object-cover" alt="" />
        <span className="absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded-full bg-[color-mix(in_oklch,var(--tb-shop)_15%,transparent)] text-[var(--tb-shop)]">موجود</span>
      </div>
      <div className="p-2.5">
        <div className="text-[12px] font-bold line-clamp-2 min-h-[36px]">{item.title}</div>
        <div className="text-[13px] font-black mt-1 text-[var(--tb-shop)]">۴۸,۹۰۰,۰۰۰ <span className="text-[10px] text-[var(--tb-muted-foreground)]">تومان</span></div>
      </div>
    </Link>
  );
}
function DownloadFeedCard({item}:{item:ContentItem}){
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card/60">
      <div className="flex-1 min-w-0">
        <Link href={`/${item.module}/${item.slug}`} className="text-[12px] font-bold line-clamp-1 hover:text-[var(--tb-download)]">{item.title}</Link>
        <div className="text-[10px] mt-0.5" style={{color:"var(--muted-foreground)"}}>{item.date_fa} • {item.category}</div>
      </div>
      <Link href={`/${item.module}/${item.slug}`} className="btn btn-primary text-[10px] px-3 py-1.5 whitespace-nowrap">دانلود</Link>
    </div>
  );
}
function ReviewFeedCard({item}:{item:ContentItem}){
  return (
    <Link href={`/${item.module}/${item.slug}`} className="block rounded-xl border border-border bg-card/70 overflow-hidden hover:border-[color-mix(in_oklch,var(--tb-review)_30%,transparent)]">
      {item.image && <img src={item.image} className="w-full aspect-square object-cover" alt="" />}
      <div className="p-2.5 space-y-2">
        <div className="text-[12px] font-bold line-clamp-2">{item.title}</div>
        <div className="flex items-center gap-2">
          <img src={item.author.avatar || "/assets/hooman.png"} className="w-5 h-5 rounded-full" alt="" />
          <span className="text-[10px]" style={{color:"var(--muted-foreground)"}}>{item.author.name}</span>
        </div>
        <div className="text-[10px] flex gap-2" style={{color:"var(--muted-foreground)"}}>
          <span>♥ {item.likes}</span>
          <span>💬 12</span>
          <span>👁 {item.views.toLocaleString("fa-IR")}</span>
        </div>
      </div>
    </Link>
  );
}
