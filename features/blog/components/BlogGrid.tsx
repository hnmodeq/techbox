"use client";
import Image from "next/image";
import { getModuleItems, getCommentCount } from "@/lib/content";
import Link from "next/link";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { Icon } from "@/design/icons";
import { CardStats } from "@/components/ui/card-stats";

export default function BlogGrid(){
  const items = getModuleItems("blog");
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
      <ModuleHeader module="blog" title="مجله تکباکس" description={`مقالات تخصصی زیرساخت • ${items.length.toLocaleString("fa-IR")} مطلب`} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(p=>(
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group flex flex-col overflow-hidden rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] shadow-[var(--shadow-size)] transition-all duration-[200ms] hover:-translate-y-1 hover:shadow-[var(--shadow-size)]"
          >
            <div className="block relative aspect-square overflow-hidden bg-[var(--muted-background)]">
              <Image src={p.image || "/assets/blog-1.jpg"} alt={p.title} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-[300ms] group-hover:scale-105" />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold line-clamp-2 min-h-[56px] transition-colors group-hover:text-[var(--blog)]">{p.title}</h3>
              <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color line-clamp-3 mt-2 flex-1">{p.excerpt}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t-[length:var(--border-size)] border-[color-mix(in_oklch,var(--border-color)_50%,transparent)] text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
                <div className="flex items-center gap-2">
                  {p.author.avatar && <Image src={p.author.avatar} width={28} height={28} className="h-7 w-7 rounded-[var(--corner-radius)] object-cover ring-1 ring-[var(--border-color)]" alt={p.author.name} />}
                  <div>
                    <div className="text-[var(--primary-text)] text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">{p.author.name}</div>
                    <div>{p.date_fa}</div>
                  </div>
                </div>
                <CardStats module="blog" slug={p.slug} initialViews={p.views ?? 0} initialLikes={p.likes ?? 0} initialComments={getCommentCount("blog", p.slug)} showComments={true} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
