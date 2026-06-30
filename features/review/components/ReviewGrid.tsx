"use client";
import Image from "next/image";
import { getModuleItems, moduleMeta } from "@/lib/content";
import Link from "next/link";
import ModuleHeader from "@/components/effects/ModuleHeader";

function stars(n=4.5){ const f=Math.floor(n); return "★".repeat(f)+"☆".repeat(5-f); }

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
          <article key={r.slug} className="card overflow-hidden group flex flex-col">
            <Link href={`/review/${r.slug}`} className="block relative aspect-square bg-muted overflow-hidden">
              <Image src={r.image || "/assets/blog-1.jpg"} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-[var(--tb-duration-slower)] group-hover:scale-105" alt={r.title}/>
              <span className="absolute top-3 right-3 rounded-[var(--tb-radius-full)] border border-white/30 bg-transparent px-2 py-1 text-[10px] text-white backdrop-blur-[var(--tb-blur-sm)]">{r.category}</span>
              <span className="absolute bottom-3 left-3 rounded-[var(--tb-radius-full)] bg-[var(--tb-image-overlay)] px-2 py-1 text-[11px] text-[var(--tb-warning)] backdrop-blur-[var(--tb-blur-sm)]">{stars(rating)} {rating.toFixed(1)}</span>
            </Link>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-extrabold text-[15px] leading-7 line-clamp-2 min-h-[56px]">
                <Link href={`/review/${r.slug}`} className="hover:text-[var(--tb-review)]">{r.title}</Link>
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-2 flex-1">{r.excerpt}</p>

              {/* author row with avatar */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[color-mix(in_oklch,var(--tb-border)_60%,transparent)]">
                <div className="flex items-center gap-2">
                  <Image src={r.author.avatar || "/assets/hooman.png"} width={32} height={32} className="h-8 w-8 rounded-[var(--tb-radius-full)] object-cover ring-1 ring-[var(--tb-border)]" alt={r.author.name} />
                  <div>
                    <div className="text-[12px] font-bold leading-tight">{r.author.name}</div>
                    <div className="text-[10px] text-muted-foreground">{r.author.role || "نویسنده"}</div>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground text-left leading-4">
                  <div>👁 {r.views.toLocaleString("fa-IR")}</div>
                  <div>♥ {r.likes} • 💬 {comments}</div>
                </div>
              </div>
            </div>
          </article>
        )})}
      </div>
    </main>
  );
}
