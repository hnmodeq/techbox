"use client";
import Image from "next/image";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";
import ModuleHeader from "@/components/effects/ModuleHeader";

export default function NewsList() {
 const items = getModuleItems("news");
 const mainNews = items.slice(0, 4);
 const forceNews = items.slice(4).concat(items.slice(0, 2));

 return (
 <main className="mx-auto max-w-7xl px-4 md:px-6 py-12" dir="rtl">
 <ModuleHeader module="news" title="اخبار تکنولوژی" description="با منبع و ساعت انتشار" count={`${items.length.toLocaleString("fa-IR")} خبر`}>
 <span className="inline-flex items-center gap-2 rounded-[var(--tb-radius-full)] border border-[var(--tb-border)] px-2 py-1 tb-text-sm text-[var(--tb-fg-muted)]">
 <span className="h-2 w-2 rounded-[var(--tb-radius-full)] bg-[var(--tb-news)] animate-pulse" /> زنده
 </span>
 </ModuleHeader>

 <div className="grid lg:grid-cols-12 gap-7 items-start">
 <section className="lg:col-span-8 order-1 lg:order-2">
 <div className="grid sm:grid-cols-2 gap-5">
 {mainNews.map((n: any, i: number) => (
 <article key={n.slug} className={`card overflow-hidden group hover:shadow-[var(--tb-shadow-lg)] transition-all ${i === 0 ? "sm:col-span-2" : ""}`} style={{ padding: 0 }}>
 <Link href={`/news/${n.slug}`} className="block relative aspect-[16/9] overflow-hidden bg-[var(--tb-bg-muted)]">
 <Image src={n.image || "/assets/blog-1.jpg"} alt={n.title} fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover transition-transform duration-[var(--tb-motion-lg)] group-hover:scale-105" />
 <span className="absolute top-3 right-3 rounded-[var(--tb-radius-full)] border border-white/30 bg-transparent px-2 py-1 tb-text-sm text-white backdrop-blur-[var(--tb-blur-sm)]">{n.category}</span>
 </Link>
 <div className="p-4">
 <div className="tb-text-sm flex flex-wrap items-center gap-2 text-[var(--tb-fg-muted)]">
 <span>🕒 {n.date_fa} {n.time ? `• ${n.time}`: ""}</span>
 <span>•</span>
 <span>{n.author?.name || "تحریریه"}</span>
 {n.source && <><span>•</span><span className="text-[var(--tb-info)]">منبع: {n.source}</span></>}
 </div>
 <h3 className=" tb-text-lg md:tb-text-lg mt-2 hover:text-[var(--tb-news)] transition-colors">
 <Link href={`/news/${n.slug}`}>{n.title}</Link>
 </h3>
 <p className="tb-text-sm line-clamp-2 mt-2 text-[var(--tb-fg-muted)]">{n.excerpt}</p>
 <div className="tb-text-sm mt-3 flex gap-3 text-[var(--tb-fg-muted)]">👁 {n.views.toLocaleString("fa-IR")} • ♥ {n.likes}</div>
 </div>
 </article>
 ))}
 </div>
 </section>

 <aside className="lg:col-span-4 order-2 lg:order-1">
 <div className="card p-4 sticky top-20">
 <div className="flex items-center justify-between mb-4">
 <h3 className=" tb-text-md text-[var(--tb-news)]">اخبار فوری</h3>
 <span className="w-1.5 h-1.5 rounded-full bg-[var(--tb-news)] animate-pulse" />
 </div>
 <div className="relative">
 <div className="absolute right-[9px] top-1 bottom-1 w-px" style={{ background: "linear-gradient(to bottom, color-mix(in oklch, var(--tb-news) 60%, transparent), var(--tb-border), transparent)" }} />
 <ul className="space-y-5">
 {(forceNews.length ? forceNews : items).slice(0, 8).map((f: any) => (
 <li key={f.slug} className="relative pe-7">
 <span className="absolute right-0 top-[6px] w-[18px] h-[18px] rounded-full flex items-center justify-center bg-[var(--tb-bg-primary)] border-2 border-[color-mix(in_oklch,var(--tb-news)_55%,transparent)]">
 <span className="w-1.5 h-1.5 rounded-full bg-[var(--tb-news)]" />
 </span>
 <div className="tb-text-sm flex items-center gap-2 flex-wrap text-[var(--tb-forum)]">
 <span>🕒 {f.date_fa} {f.time || ""}</span>
 {f.source && <span className="px-1.5 py-0.5 rounded tb-text-sm bg-[color-mix(in_oklch,var(--tb-info)_12%,transparent)] text-[var(--tb-info)]">{f.source}</span>}
 </div>
 <Link href={`/news/${f.slug}`} className="tb-text-sm hover:text-[var(--tb-news)] block mt-1">{f.title}</Link>
 </li>
 ))}
 </ul>
 </div>
 </div>
 </aside>
 </div>
 </main>
 );
}
