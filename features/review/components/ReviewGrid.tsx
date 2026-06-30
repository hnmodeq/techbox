"use client";
import { getModuleItems, moduleMeta } from "@/lib/content";
import Link from "next/link";

function stars(n=4.5){ const f=Math.floor(n); return "★".repeat(f)+"☆".repeat(5-f); }

export default function ReviewGrid(){
  const items=getModuleItems("review");
  const meta=moduleMeta.review;
  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className={`text-3xl font-black ${meta.color}`}>نقد و بررسی تخصصی</h1>
          <p className="text-sm text-muted-foreground mt-1">تست لَب • بنچمارک واقعی • عکس مربعی</p>
        </div>
        <div className="text-[11px] text-muted-foreground">{items.length} بررسی</div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((r,i)=>{
          const rating = 4.6 - (i*0.15);
          const comments = 18 + i*7;
          return (
          <article key={r.slug} className="card overflow-hidden group flex flex-col">
            <Link href={`/review/${r.slug}`} className="block relative aspect-square bg-muted overflow-hidden">
              <img src={r.image||""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={r.title}/>
              <span className="absolute top-3 right-3 badge !bg-black/55 !text-white backdrop-blur border-white/20">{r.category}</span>
              <span className="absolute bottom-3 left-3 text-[11px] bg-black/60 text-[var(--tb-warning)] px-2 py-1 rounded-full backdrop-blur">{stars(rating)} {rating.toFixed(1)}</span>
            </Link>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-extrabold text-[15px] leading-7 line-clamp-2 min-h-[56px]">
                <Link href={`/review/${r.slug}`} className="hover:text-[var(--tb-review)]">{r.title}</Link>
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-2 flex-1">{r.excerpt}</p>

              {/* author row with avatar */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
                <div className="flex items-center gap-2">
                  <img src={r.author.avatar || "/assets/hooman.png"} className="w-8 h-8 rounded-full object-cover ring-1 ring-border" alt={r.author.name} />
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
