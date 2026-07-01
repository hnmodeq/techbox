"use client";
import { getModuleItems, moduleMeta } from "@/lib/content";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { MediaSelectorCard } from "@/components/ui/MediaSelectorCard";
import { useState } from "react";
import ModuleHeader from "@/components/effects/ModuleHeader";

const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function MediaGallery(){
 const items = getModuleItems("media");
 const [active, setActive] = useState(items[0] || null);

 // naive comments count – pull from seed
 const commentsCount = (slug: string) => slug.includes("qnap") ? 23 : slug.includes("mikrotik") ? 12 : 8;

 return (
 <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
 <ModuleHeader module="media" title="رسانه ویدیویی تکباکس" count={`${items.length.toLocaleString("fa-IR")} ویدیو`} />

 {active && (
 <div className="card overflow-hidden mb-8">
 <div className="relative bg-black aspect-video">
 <video
 key={active.slug}
 controls
 playsInline
 poster={active.image}
 className="w-full h-full object-contain bg-black"
 src={SAMPLE_VIDEO}
 />
 </div>
 <div className="p-4 flex flex-wrap items-start justify-between gap-3">
 <div className="min-w-0">
 <div className=" tb-text-lg">{active.title}</div>
 <div className="tb-text-sm text-[var(--tb-fg-muted)] mt-1">{active.excerpt}</div>
 <div className="flex items-center gap-4 tb-text-sm text-[var(--tb-fg-muted)] mt-3">
 <span>👁 {active.views.toLocaleString("fa-IR")} بازدید</span>
 <span>♥ {active.likes.toLocaleString("fa-IR")} پسند</span>
 <span>💬 {commentsCount(active.slug).toLocaleString("fa-IR")} نظر</span>
 <span>• {active.date_fa}</span>
 </div>
 </div>
 <ButtonLink href={`/media/${active.slug}`} variant="ghost" size="xs" className="whitespace-nowrap">صفحه اختصاصی →</ButtonLink>
 </div>
 </div>
 )}

 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
 {items.map(v => (
 <MediaSelectorCard
 key={v.slug}
 active={active?.slug===v.slug}
 image={v.image}
 title={v.title}
 category={v.category}
 author={v.author.name}
 dateFa={v.date_fa}
 views={v.views}
 likes={v.likes}
 comments={commentsCount(v.slug)}
 onClick={()=>setActive(v)}
 />
 ))}
 </div>
 </main>
 );
}
