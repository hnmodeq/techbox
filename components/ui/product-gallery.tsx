"use client";

import Image from "next/image";
import { blurProps } from "@/lib/image-placeholder";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const clean = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  if (!clean.length) return null;
  const current = clean[index] || clean[0];
  return (
    <div className="mt-8 overflow-hidden rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)]">
      <div className="relative aspect-[4/3] bg-white">
        <Image src={current} alt={`${title} - تصویر ${index + 1}`} fill sizes="(min-width:768px) 768px, 100vw" className="object-contain" {...blurProps(current)} />
        {clean.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            <Button type="button" size="xs" variant="ghost" onClick={() => setIndex((p) => (p - 1 + clean.length) % clean.length)}>قبلی</Button>
            <Button type="button" size="xs" onClick={() => setIndex((p) => (p + 1) % clean.length)}>بعدی</Button>
          </div>
        )}
      </div>
      {clean.length > 1 && (
        <div className="flex gap-2 overflow-x-auto bg-[var(--card-background)] p-3">
          {clean.map((src, i) => (
            <Button key={src} type="button" variant="ghost" size="icon" onClick={() => setIndex(i)} className={`relative h-16 w-20 shrink-0 p-0 overflow-hidden rounded-[var(--corner-radius)] border ${i === index ? 'border-[var(--shop)]' : 'border-[var(--border-color)]'}`}>
              <Image src={src} alt={`${title} thumbnail ${i + 1}`} fill sizes="80px" className="object-cover" {...blurProps(src)} />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
