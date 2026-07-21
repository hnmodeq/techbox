"use client";

import Image from "next/image";
import { blurProps } from "@/lib/image-placeholder";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const clean = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  if (!clean.length) return null;
  const current = clean[index] || clean[0];

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card" dir="rtl">
      {/* Main image — transparent, theme-aware, no white bg */}
      <div className="relative aspect-[4/3] w-full bg-transparent p-6 flex items-center justify-center">
        <Image
          src={current}
          alt={`${title} - تصویر ${index + 1}`}
          fill
          sizes="(min-width:1024px) 40vw, 100vw"
          className="object-contain object-center mix-blend-normal"
          {...blurProps(current)}
        />
        {/* Discount badge over image if needed? handled outside */}
        {clean.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((p) => (p - 1 + clean.length) % clean.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-background/80 border border-border backdrop-blur text-foreground hover:bg-accent"
              aria-label="قبلی"
            >
              ›
            </button>
            <button
              type="button"
              onClick={() => setIndex((p) => (p + 1) % clean.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-background/80 border border-border backdrop-blur text-foreground hover:bg-accent"
              aria-label="بعدی"
            >
              ‹
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {clean.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-t border-border bg-card p-3 scrollbar-thin">
          {clean.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-md border bg-transparent p-1 transition",
                i === index ? "border-[#ef394e] ring-1 ring-[#ef394e]/20" : "border-border hover:border-foreground/20"
              )}
            >
              <Image
                src={src}
                alt={`${title} thumb ${i + 1}`}
                fill
                sizes="64px"
                className="object-contain object-center"
                {...blurProps(src)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
