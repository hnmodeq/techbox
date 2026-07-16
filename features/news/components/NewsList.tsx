"use client";
import Image from "next/image";
import { getModuleItems, type ContentItem } from "@/lib/content";
import { useDbPosts } from "@/hooks/useDbPosts";
import Link from "next/link";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { Icon } from "@/design/icons";
import { CardStats } from "@/components/ui/card-stats";

export default function NewsList({ serverItems }: { serverItems?: ContentItem[] }) {
 const fallbackItems = getModuleItems("news");
 const { items: dbItems } = useDbPosts("news", fallbackItems, 100);

 const items = serverItems && serverItems.length > 0 ? serverItems : dbItems;
 const forceNews = items.slice(0, 8);

 return (
 <main className="mx-auto max-w-7xl px-4 md:px-6 py-12" dir="rtl">
 <ModuleHeader module="news" title="اخبار تکنولوژی" description="با منبع و ساعت انتشار" />

 <div className="grid lg:grid-cols-12 gap-7 items-start mt-6">
 <section className="lg:col-span-8 order-1 lg:order-2">
 <div className="flex flex-col gap-5">
 {items.map((n: any) => (
                <Link key={n.slug} href={`/news/${n.slug}`} className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] overflow-hidden group hover:shadow-[var(--shadow-size)] transition-all !p-0 grid sm:grid-cols-3 gap-4 items-center">
                  <div className="block relative aspect-[16/9] sm:aspect-[4/3] sm:h-full overflow-hidden bg-[var(--muted-background)]">
                    <Image src={n.image || "/assets/blog-1.jpg"} alt={n.title} fill sizes="(min-width:1024px) 30vw, 100vw" className="object-cover transition-transform duration-[300ms] group-hover:scale-105" />
                    <span className="absolute top-3 right-3 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-white/30 bg-transparent px-2 py-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-white backdrop-blur-[0px]">{n.category}</span>
                  </div>
                  <div className="p-4 sm:col-span-2">
                    <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] flex flex-wrap items-center gap-2 paragraph-color">
                      <span className="inline-flex items-center gap-1"><Icon name="clock" size={13} strokeWidth={1.75} />{n.date_fa} {n.time ? `• ${n.time}`: ""}</span>
                      {n.source && <><span>•</span><span>منبع: {n.source}</span></>}
                    </div>
                    <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold mt-2 transition-colors group-hover:text-[var(--news)]">{n.title}</h3>
                    <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] line-clamp-2 mt-2 paragraph-color">{n.excerpt}</p>
                    <div className="mt-3 pt-2 border-t-[length:var(--border-size)] border-[var(--border-color)]/50">
                      <CardStats module="news" slug={n.slug} initialViews={n.views} initialLikes={n.likes} initialComments={n.comments || 0} showComments={true} />
                    </div>
                  </div>
                </Link>
 ))}
 </div>
 </section>

 <aside className="lg:col-span-4 order-2 lg:order-1">
 <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4 sticky top-20">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold text-[var(--news)]">اخبار فوری</h3>
 <span className="inline-flex items-center gap-1.5 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] px-2 py-0.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 <span className="h-2 w-2 rounded-[var(--corner-radius)] bg-[var(--news)] animate-pulse" /> زنده
 </span>
 </div>
 <div className="relative">
 <div className="absolute right-[8px] top-2 bottom-2 w-px" style={{ background: "linear-gradient(to bottom, color-mix(in oklch, var(--news) 60%, transparent), var(--border-color), transparent)" }} />
              <ul className="space-y-5">
                {forceNews.map((f: any) => (
                  <li key={f.slug} className="relative pr-7">
                    <span className="absolute right-0 top-[4px] w-[17px] h-[17px] rounded-full flex items-center justify-center bg-[var(--main-background)] border-[length:var(--border-size)] border-[color-mix(in_oklch,var(--news)_65%,transparent)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--news)]" />
                    </span>
                    <Link href={`/news/${f.slug}`} className="group block">
                      <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] flex items-center gap-1 paragraph-color">
                        <Icon name="clock" size={13} strokeWidth={1.75} />
                        <span>{f.date_fa} {f.time || ""}</span>
                      </div>
                      <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] block mt-1 transition-colors group-hover:text-[var(--news)]">{f.title}</span>
                    </Link>
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
