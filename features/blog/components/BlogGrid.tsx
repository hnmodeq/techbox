"use client";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";

export default function BlogGrid(){
  const items = getModuleItems("blog");
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--tb-blog)]">مجله تکباکس</h1>
          <p className="text-sm text-muted-foreground mt-2">مقالات تخصصی زیرساخت • {items.length.toLocaleString("fa-IR")} مطلب</p>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(p=>(
          <article key={p.slug} className="group flex flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-card hover:shadow-glass hover:-translate-y-1 transition-all">
            <Link href={`/blog/${p.slug}`} className="block relative aspect-square overflow-hidden bg-muted">
              <img src={p.image || "/assets/blog-1.jpg"} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {p.category && <span className="absolute top-3 right-3 badge">{p.category}</span>}
            </Link>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-extrabold text-[17px] leading-7 line-clamp-2 min-h-[56px]">
                <Link href={`/blog/${p.slug}`} className="hover:text-[var(--tb-blog)]">{p.title}</Link>
              </h3>
              <p className="text-[13px] text-muted-foreground leading-6 line-clamp-3 mt-2 flex-1">{p.excerpt}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  {p.author.avatar && <img src={p.author.avatar} className="w-7 h-7 rounded-full ring-1 ring-border object-cover" alt="" />}
                  <div>
                    <div className="text-foreground font-semibold text-[12px]">{p.author.name}</div>
                    <div>{p.date_fa}</div>
                  </div>
                </div>
                <div className="text-left leading-5">
                  <div>♥ {p.likes.toLocaleString("fa-IR")}</div>
                  <div>👁 {p.views.toLocaleString("fa-IR")}</div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
