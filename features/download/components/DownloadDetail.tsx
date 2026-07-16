"use client";
import type { ContentItem } from "@/lib/content";
import Link from "next/link";
import { LiveViewCounter } from "@/components/ui/live-view-counter";
import { DownloadMetaLine } from "@/components/ui/download-meta";
import { DownloadAction } from "@/components/ui/download-action";
import { DownloadJsonLd } from "@/components/seo/StructuredData";

export default function DownloadDetail({ item }: { item: ContentItem }){
 const versions = Array.isArray((item as any).versions) ? (item as any).versions : [];

 return (
 <>
 <DownloadJsonLd item={item} />
 <main className="mx-auto max-w-4xl px-4 py-10" dir="rtl">
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground mb-2">
 <Link href="/download" className="hover:text-foreground">دانلود</Link> / <span className="text-[var(--download)]">{item.category}</span>
 </div>
 <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold md:text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold ">{item.title}</h1>
 <div className="mt-3 flex flex-wrap items-center gap-4">
   <LiveViewCounter module="download" slug={item.slug} initialViews={item.views || 0} showLabel />
   <DownloadMetaLine slug={item.slug} fallbackFileName={item.fileName ?? null} fallbackFileSize={item.fileSize ?? null} fallbackDownloadCount={item.downloadCount ?? 0} />
 </div>
 <div className="mt-5">
   <DownloadAction slug={item.slug} fallbackFileName={item.fileName ?? null} />
 </div>
      <p className="text-muted-foreground mt-3">{item.excerpt}</p>

      {versions.length > 0 ? (
        <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4 mt-8">
          <h2 className="font-bold text-[var(--primary-text)] mb-3">نسخه‌های ثبت‌شده</h2>
          <div className="space-y-2">
            {versions.map((v: any, index: number) => (
              <div key={`${v.ver || v.version || index}`} className="flex flex-wrap items-center justify-between gap-3 border-b-[length:var(--border-size)] border-[var(--border-color)]/40 pb-2 last:border-0">
                <span className="font-mono text-[length:var(--paragraph-font-size)] text-[var(--primary-text)]">{v.ver || v.version || 'نسخه نامشخص'}</span>
                {v.size && <span className="paragraph-color" dir="ltr">{v.size}</span>}
                {v.dateFa && <span className="paragraph-color">{v.dateFa}</span>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4 mt-8 paragraph-color">
          نسخه یا لینک دانلود مستقیمی برای این آیتم در دیتابیس ثبت نشده است.
        </div>
      )}

 <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-4 mt-6 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-muted-foreground">
 {item.content}
 </div>
 </main>
 </>
 );
}
