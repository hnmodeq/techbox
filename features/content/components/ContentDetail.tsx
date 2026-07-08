import Image from "next/image";
import { blurProps } from "@/lib/image-placeholder";
import { type ContentItem } from "@/lib/content";
import { moduleMeta } from "@/lib/content";
import { Icon } from "@/design/icons";
import { LikeButton } from "@/components/ui/like-button";
import { LiveViewCounter } from "@/components/ui/live-view-counter";
import CommentSection from "@/features/comment/components/CommentSection";
import SuggestionGrid from "@/features/content/components/SuggestionGrid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/ui/product-gallery";
import { ContentJsonLd } from "@/components/seo/StructuredData";

export default function ContentDetail({ item }: { item: ContentItem }) {
 const meta = moduleMeta[item.module];
 const videoSrc = (item as any).videoUrl || (item as any).video || (item as any).videoSrc;
 const videoDuration = (item as any).videoDuration;
 const videoMimeType = (item as any).videoMimeType;
 const videoFileSize = (item as any).videoFileSize;
 const gallery = Array.isArray((item as any).gallery) ? (item as any).gallery : [];
 return (
 <>
 <ContentJsonLd item={item} />
 <article className="mx-auto max-w-3xl px-5 md:px-0 py-10" dir="rtl">
 <div className="flex items-center gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color mb-3">
 <Link href={`/${item.module}`} className={`${meta.color} hover:underline`}>{meta.titleFa}</Link>
 <span>•</span>
 <span>{item.date_fa}</span>
 <span>•</span>
 <span>{item.category}</span>
 </div>

        <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold">{item.title}</h1>
 <p className="paragraph-color mt-4 text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold ">{item.excerpt}</p>

 <div className="flex flex-wrap items-center gap-3 mt-6 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
 {item.module !== "media" && (
 <div className="flex items-center gap-2">
 {item.author?.avatar && <Image src={item.author.avatar} width={32} height={32} className="h-8 w-8 rounded-[var(--corner-radius)] object-cover ring-1 ring-[var(--border-color)]" alt={item.author.name || "نویسنده"} {...blurProps(item.author.avatar)} />}
 <div>
 <div className=" text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">{item.author?.name || "تکباکس"}</div>
 <div className="paragraph-color text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">{item.author?.role || "تحریریه"}</div>
 </div>
 </div>
 )}
 <div className="ms-auto flex items-center gap-2 paragraph-color">
 <LiveViewCounter module={item.module} slug={item.slug} />
 </div>
 </div>

 {item.module === "shop" && gallery.length > 0 ? (
 <ProductGallery images={gallery} title={item.title} />
 ) : item.module === "media" && videoSrc ? (
 <div className="mt-8 overflow-hidden rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-black shadow-[var(--shadow-size)]">
 <video
 controls
 playsInline
 poster={item.image}
 className="mx-auto h-[70vh] max-h-[780px] aspect-[9/16] object-contain bg-black"
 src={videoSrc}
 />
 <div className="bg-[var(--card-background)] px-4 py-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color flex flex-wrap items-center gap-4">
 <LiveViewCounter module={item.module} slug={item.slug} showLabel />
 <LikeButton contentType={item.module} slug={item.slug} />
 {videoDuration && <span dir="ltr">{videoDuration}</span>}
 {videoFileSize && <span dir="ltr">{videoFileSize}</span>}
 {videoMimeType && <span dir="ltr">{videoMimeType}</span>}
 </div>
 </div>
 ) : item.image && (
 <div className="mt-8 overflow-hidden rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)]">
 <div className="relative aspect-[16/9] max-h-[420px]"><Image src={item.image} alt={item.title} fill sizes="(min-width:768px) 768px, 100vw" className="object-cover" {...blurProps(item.image)} /></div>
 </div>
 )}

 <div className="prose prose-invert max-w-none mt-8 text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold paragraph-color" dir="rtl">
 <p>{item.content || item.excerpt}</p>
 </div>

 {item.module !== "media" && (
 <div className="flex flex-wrap gap-2 mt-8">
 {(item.tags || []).map(t => (
 <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="transition-opacity hover:opacity-85"><span className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-transparent px-2 py-0.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">#{t}</span></Link>
 ))}
 </div>
 )}

 <div className="mt-8 flex flex-wrap items-center gap-3">
 <LikeButton contentType={item.module} slug={item.slug} />
 <Button variant="ghost" size="sm">اشتراک‌گذاری</Button>
 </div>

 <SuggestionGrid current={item} />
 <CommentSection module={item.module} slug={item.slug} />
 </article>
 </>
 );
}
