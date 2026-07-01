import Image from "next/image";
import { type ContentItem } from "@/lib/content";
import { moduleMeta } from "@/lib/content";
import { LikeButton } from "@/components/ui/LikeButton";
import CommentSection from "@/features/comment/components/CommentSection";
import SuggestionGrid from "@/features/content/components/SuggestionGrid";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function ContentDetail({ item }: { item: ContentItem }) {
 const meta = moduleMeta[item.module];
 return (
 <article className="mx-auto max-w-3xl px-5 md:px-0 py-10" dir="rtl">
 <div className="flex items-center gap-2 tb-text-sm text-[var(--tb-fg-muted)] mb-3">
 <Link href={`/${item.module}`} className={`${meta.color} hover:underline`}>{meta.titleFa}</Link>
 <span>•</span>
 <span>{item.date_fa}</span>
 <span>•</span>
 <span>{item.category}</span>
 </div>

 <h1 className="tb-text-hero md:text-[2.4rem] ">{item.title}</h1>
 <p className="text-[var(--tb-fg-muted)] mt-4 tb-text-md ">{item.excerpt}</p>

 <div className="flex flex-wrap items-center gap-3 mt-6 tb-text-sm">
 <div className="flex items-center gap-2">
 {item.author.avatar && <Image src={item.author.avatar} width={32} height={32} className="h-8 w-8 rounded-[var(--tb-radius-full)] object-cover ring-1 ring-[var(--tb-border)]" alt={item.author.name} />}
 <div>
 <div className=" tb-text-sm">{item.author.name}</div>
 <div className="text-[var(--tb-fg-muted)] tb-text-sm">{item.author.role}</div>
 </div>
 </div>
 <div className="ms-auto flex items-center gap-2 text-[var(--tb-fg-muted)]">
 <span>👁 {item.views.toLocaleString("fa-IR")}</span>
 </div>
 </div>

 {item.module === "media" ? (
 <div className="mt-8 overflow-hidden rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-black shadow-[var(--tb-shadow-md)]">
 <video
 controls
 playsInline
 poster={item.image}
 className="w-full aspect-video object-contain bg-black"
 src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
 />
 <div className="bg-[var(--tb-bg-secondary)] px-4 py-2 tb-text-sm text-[var(--tb-fg-muted)] flex gap-4">
 <span>👁 {item.views.toLocaleString("fa-IR")} بازدید</span>
 <span>♥ {item.likes.toLocaleString("fa-IR")} پسند</span>
 <span>💬 نظرات فعال</span>
 </div>
 </div>
 ) : item.image && (
 <div className="mt-8 overflow-hidden rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] shadow-[var(--tb-shadow-md)]">
 <div className="relative aspect-[16/9] max-h-[420px]"><Image src={item.image} alt={item.title} fill sizes="(min-width:768px) 768px, 100vw" className="object-cover" /></div>
 </div>
 )}

 <div className="prose prose-invert max-w-none mt-8 tb-text-md text-[var(--tb-fg-muted)]" dir="rtl">
 <p>{item.content || item.excerpt}</p>
 <p className="mt-4">
 این مطلب به صورت آزمایشی از دیتاسورس JSON تکباکس بارگذاری شده و سیستم لایک، کامنت و پیشنهاد مرتبط فعال است.
 </p>
 </div>

 <div className="flex flex-wrap gap-2 mt-8">
 {item.tags.map(t => (
 <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="transition-opacity hover:opacity-85"><span className="rounded-[var(--tb-radius-full)] border border-[var(--tb-border)] bg-transparent px-2 py-0.5 tb-text-sm text-[var(--tb-fg-muted)]">#{t}</span></Link>
 ))}
 </div>

 <div className="mt-8 flex flex-wrap items-center gap-3">
 <LikeButton contentType={item.module} slug={item.slug} initial={item.likes} />
 <Button variant="ghost" size="sm">اشتراک‌گذاری</Button>
 </div>

 <SuggestionGrid current={item} />
 <CommentSection module={item.module} slug={item.slug} />
 </article>
 );
}
