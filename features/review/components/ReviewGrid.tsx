"use client";
import Image from "next/image";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { Icon } from "@/design/icons";

/** Star rating rendered with central-system icons (filled + outline). */
function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-[var(--tb-warning)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="star" size={13} className={i < full ? "fill-current" : "opacity-40"} strokeWidth={1.5} />
      ))}
      <span className="ms-1 tb-text-sm text-[var(--tb-on-accent)]">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function ReviewGrid(){
  const items=getModuleItems("review");
  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <ModuleHeader module="review" title="نقد و بررسی تخصصی" description="تست لَب • بنچمارک واقعی • عکس مربعی" count={`${items.length.toLocaleString("fa-IR")} بررسی`} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((r,i)=>{
          const rating = 4.6 - (i*0.15);
          const comments = 18 + i*7;
          return (
            <Link key={r.slug} href={`/review/${r.slug}`} className="card overflow-hidden group flex flex-col !p-0">
              <div className="block relative aspect-square bg-[var(--tb-bg-muted)] overflow-hidden">
                <Image src={r.image || "/assets/blog-1.jpg"} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-[var(--tb-motion-lg)] group-hover:scale-105" alt={r.title}/>
                <span className="absolute top-3 right-3 rounded-[var(--tb-radius-full)] border border-white/30 bg-transparent px-2 py-1 tb-text-sm text-white backdrop-blur-[var(--tb-blur-sm)]">{r.category}</span>
                <span className="absolute bottom-3 left-3 rounded-[var(--tb-radius-full)] bg-[color-mix(in_oklch,black_60%,transparent)] px-2 py-1 backdrop-blur-[var(--tb-blur-sm)]"><Stars rating={rating} /></span>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="tb-text-md line-clamp-2 min-h-[56px] transition-colors group-hover:text-[var(--tb-review)]">{r.title}</h3>
                <p className="tb-text-sm text-[var(--tb-fg-muted)] line-clamp-2 mt-2 flex-1">{r.excerpt}</p>

                {/* author row with avatar */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[color-mix(in_oklch,var(--tb-border)_60%,transparent)]">
                  <div className="flex items-center gap-2">
                    <Image src={r.author.avatar || "/assets/hooman.png"} width={32} height={32} className="h-8 w-8 rounded-[var(--tb-radius-full)] object-cover ring-1 ring-[var(--tb-border)]" alt={r.author.name} />
                    <div>
                      <div className="tb-text-sm text-[var(--tb-fg-primary)]">{r.author.name}</div>
                      <div className="tb-text-sm text-[var(--tb-fg-muted)]">{r.author.role || "نویسنده"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 tb-text-sm text-[var(--tb-fg-muted)]">
                    <span className="inline-flex items-center gap-1"><Icon name="view" size={14} strokeWidth={1.75} />{r.views.toLocaleString("fa-IR")}</span>
                    <span className="inline-flex items-center gap-1"><Icon name="like" size={14} strokeWidth={1.75} />{r.likes.toLocaleString("fa-IR")}</span>
                    <span className="inline-flex items-center gap-1"><Icon name="comment" size={14} strokeWidth={1.75} />{comments.toLocaleString("fa-IR")}</span>
                  </div>
                </div>
              </div>
            </Link>
          )})}
      </div>
    </main>
  );
}
