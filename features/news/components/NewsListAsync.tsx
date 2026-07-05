'use client';
import Image from "next/image";
import { ContentItem } from "@/lib/content";
import Link from "next/link";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { Icon } from "@/design/icons";
import { CardStats } from "@/components/ui/card-stats";

export default function NewsListAsync({ items }: { items: ContentItem[] }) {
 return (
   <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
     <ModuleHeader module="news" title="اخبار تکباکس" description={`آخرین خبرهای فناوری اطلاعات • ${items.length.toLocaleString("fa-IR")} خبر`} />
     <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
       {items.map((p) => (
         <Link key={p.slug} href={`/news/${p.slug}`} className="group flex flex-col overflow-hidden rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] shadow-[var(--shadow-size)] transition-all duration-[200ms] hover:-translate-y-1 hover:shadow-[var(--shadow-size)]">
           <div className="relative aspect-video overflow-hidden bg-[var(--muted-background)]">
             <Image src={p.image || "/assets/news-1.jpg"} alt={p.title} fill sizes="(min-width:1024px) 25vw, 100vw" className="object-cover transition-transform duration-[300ms] group-hover:scale-105" />
           </div>
           <div className="p-4 flex-1 flex flex-col">
             <div className="flex items-center gap-2 text-xs paragraph-color mb-2">
               <span>{p.date_fa}</span>
               {p.time && <span>• {p.time}</span>}
               {p.source && <span className="opacity-70">• {p.source}</span>}
             </div>
             <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold line-clamp-2 transition-colors group-hover:text-[var(--news)] min-h-[48px]">{p.title}</h3>
             <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color line-clamp-2 mt-2 flex-1">{p.excerpt}</p>
             <div className="flex items-center justify-between mt-3 pt-3 border-t-[length:var(--border-size)] border-[color-mix(in_oklch,var(--border-color)_50%,transparent)]">
               <CardStats module="news" slug={p.slug} initialViews={p.views ?? 0} initialLikes={p.likes ?? 0} showComments={true} />
             </div>
           </div>
         </Link>
       ))}
     </div>
   </main>
 );
}