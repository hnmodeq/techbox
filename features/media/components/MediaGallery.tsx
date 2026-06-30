"use client";
import Image from "next/image";
import { getModuleItems, moduleMeta } from "@/lib/content";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { useState } from "react";

const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function MediaGallery(){
  const items = getModuleItems("media");
  const meta = moduleMeta.media;
  const [active, setActive] = useState(items[0] || null);

  // naive comments count – pull from seed
  const commentsCount = (slug: string) => slug.includes("qnap") ? 23 : slug.includes("mikrotik") ? 12 : 8;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <div className="flex items-end justify-between mb-5">
        <h1 className={`text-3xl font-black ${meta.color}`}>رسانه ویدیویی تکباکس</h1>
        <span className="text-[11px] text-muted-foreground">{items.length} ویدیو</span>
      </div>

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
              <div className="font-extrabold text-[17px]">{active.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{active.excerpt}</div>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-3">
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
          <button
            key={v.slug}
            onClick={()=>setActive(v)}
            className={`text-right card overflow-hidden text-start transition-all group ${active?.slug===v.slug ? "ring-2 ring-[var(--tb-media)] shadow-[var(--tb-shadow-glow)]" : "hover:-translate-y-1"}`}
          >
            <div className="aspect-video relative bg-black">
              <Image src={v.image || "/assets/blog-1.jpg"} alt={v.title} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover opacity-90 transition-opacity group-hover:opacity-100" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="tb-image-badge flex h-14 w-14 items-center justify-center text-xl text-white">▶</span>
              </span>
              <span className="absolute bottom-2 left-2 rounded-[var(--tb-radius-sm)] bg-[var(--tb-image-overlay)] px-2 py-0.5 text-[10px] text-white">۱۲:۴۴</span>
              <span className="absolute top-2 right-2 badge !text-[10px]">{v.category}</span>
            </div>
            <div className="p-3">
              <div className="font-bold text-[13px] leading-6 line-clamp-2 min-h-[48px]">{v.title}</div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                <span>{v.author.name}</span>
                <span>{v.date_fa}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground border-t border-[color-mix(in_oklch,var(--tb-border)_50%,transparent)] pt-2">
                <span>👁 {v.views.toLocaleString("fa-IR")}</span>
                <span>♥ {v.likes}</span>
                <span>💬 {commentsCount(v.slug)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
