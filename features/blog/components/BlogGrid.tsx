"use client";
import Image from "next/image";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";
import ModuleHeader from "@/components/effects/ModuleHeader";

export default function BlogGrid(){
  const items = getModuleItems("blog");
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
      <ModuleHeader module="blog" title="مجله تکباکس" description={`مقالات تخصصی زیرساخت • ${items.length.toLocaleString("fa-IR")} مطلب`} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(p=>(
          <article key={p.slug} className="group flex flex-col overflow-hidden rounded-[var(--tb-radius-2xl)] border border-[var(--tb-border)] bg-[var(--tb-card)] shadow-[var(--tb-shadow)] transition-all duration-[var(--tb-duration-normal)] hover:-translate-y-1 hover:shadow-[var(--tb-shadow-glow)]">
            <Link href={`/blog/${p.slug}`} className="block relative aspect-square overflow-hidden bg-muted">
              <Image src={p.image || "/assets/blog-1.jpg"} alt={p.title} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-[var(--tb-duration-slower)] group-hover:scale-105" />
            </Link>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-extrabold text-[17px] leading-7 line-clamp-2 min-h-[56px]">
                <Link href={`/blog/${p.slug}`} className="hover:text-[var(--tb-blog)]">{p.title}</Link>
              </h3>
              <p className="text-[13px] text-muted-foreground leading-6 line-clamp-3 mt-2 flex-1">{p.excerpt}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[color-mix(in_oklch,var(--tb-border)_50%,transparent)] text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  {p.author.avatar && <Image src={p.author.avatar} width={28} height={28} className="h-7 w-7 rounded-[var(--tb-radius-full)] object-cover ring-1 ring-[var(--tb-border)]" alt={p.author.name} />}
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
