"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ShopBannerItem {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  href?: string;
  bgColor?: string;
}

interface Props {
  banners: ShopBannerItem[];
}

export default function ShopBanner({ banners }: Props) {
  const [current, setCurrent] = useState(0);
  const count = banners.length;

  const prev = useCallback(() => setCurrent((c) => (c - 1 + count) % count), [count]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % count), [count]);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, count]);

  if (!count) return null;

  const banner = banners[current];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl mb-6 select-none"
      style={{ backgroundColor: banner.bgColor || "#f3f4f6", aspectRatio: "21/6" }}
    >
      {banner.image && (
        <Image
          src={banner.image}
          alt={banner.title || ""}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}

      {(banner.title || banner.subtitle) && (
        <div className="absolute inset-0 flex flex-col justify-center px-8 gap-1 bg-gradient-to-l from-black/40 to-transparent" dir="rtl">
          {banner.title && (
            <h2 className="text-white text-xl font-extrabold drop-shadow">{banner.title}</h2>
          )}
          {banner.subtitle && (
            <p className="text-white/90 text-sm drop-shadow">{banner.subtitle}</p>
          )}
        </div>
      )}

      {banner.href && (
        <Link href={banner.href} className="absolute inset-0 z-10" aria-label={banner.title} />
      )}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 hover:bg-white shadow transition"
            aria-label="قبلی"
          >
            <ChevronRight className="size-4 text-gray-700" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 hover:bg-white shadow transition"
            aria-label="بعدی"
          >
            <ChevronLeft className="size-4 text-gray-700" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === current ? "w-5 bg-white" : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
