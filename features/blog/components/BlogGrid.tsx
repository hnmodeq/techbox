"use client";
import Image from "next/image";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { Icon } from "@/design/icons";

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
            className="group flex flex-col overflow-hidden rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)] shadow-[var(--tb-shadow-md)] transition-all duration-[var(--tb-motion-md)] hover:-translate-y-1 hover:shadow-[var(--tb-shadow-lg)]"
          >
            <div className="block relative aspect-square overflow-hidden bg-[var(--tb-bg-muted)]">
              <Image src={p.image || "/assets/blog-1.jpg"} alt={p.title} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-[var(--tb-motion-lg)] group-hover:scale-105" />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="tb-text-lg line-clamp-2 min-h-[56px] transition-colors group-hover:text-[var(--tb-blog)]">{p.title}</h3>
              <p className="tb-text-sm text-[var(--tb-fg-muted)] line-clamp-3 mt-2 flex-1">{p.excerpt}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[color-mix(in_oklch,var(--tb-border)_50%,transparent)] tb-text-sm text-[var(--tb-fg-muted)]">
                <div className="flex items-center gap-2">
                  {p.author.avatar && <Image src={p.author.avatar} width={28} height={28} className="h-7 w-7 rounded-[var(--tb-radius-full)] object-cover ring-1 ring-[var(--tb-border)]" alt={p.author.name} />}
                  <div>
                    <div className="text-[var(--tb-fg-primary)] tb-text-sm">{p.author.name}</div>
                    <div>{p.date_fa}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1"><Icon name="like" size={14} strokeWidth={1.75} />{p.likes.toLocaleString("fa-IR")}</span>
                  <span className="inline-flex items-center gap-1"><Icon name="view" size={14} strokeWidth={1.75} />{p.views.toLocaleString("fa-IR")}</span>
                  <span className="inline-flex items-center gap-1"><Icon name="comment" size={14} strokeWidth={1.75} />{((p.likes % 9) + 1).toLocaleString("fa-IR")}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
