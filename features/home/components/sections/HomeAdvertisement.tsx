"use client";

import * as React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { HomeAdvertisement } from "@/features/home/lib/home-advertisements";

export type HomeAdvertisementBannerProps = {
  advertisement: HomeAdvertisement;
};

function dismissalKey(advertisement: HomeAdvertisement) {
  return `techbox:home-ad-dismissed:layout-v2:${advertisement.id}:v${advertisement.version}`;
}

/**
 * Campaign creative rendered at the top of its owning homepage band.
 * It deliberately uses the exact same gutters/max-width as SectionShell.
 */
export function HomeAdvertisementBanner({ advertisement }: HomeAdvertisementBannerProps) {
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(dismissalKey(advertisement)) === "1");
    } catch {
      // Storage may be unavailable in strict/private contexts. The close
      // button still works for the current React tree through local state.
    }
  }, [advertisement]);

  if (!advertisement.enabled || dismissed) return null;

  const close = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(dismissalKey(advertisement), "1");
    } catch {}
  };

  const creative = (
    <Image
      src={advertisement.image}
      alt={advertisement.alt}
      width={2880}
      height={600}
      sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), 1280px"
      // The supplied files are already 2880×600 WebP. Serving the originals
      // avoids a second WebP encode by Next, which was the visible quality loss.
      unoptimized
      className="block h-auto w-full"
    />
  );

  return (
    <div
      role="complementary"
      aria-label={`تبلیغات: ${advertisement.alt}`}
      className="w-full px-4 pt-6 sm:px-6 lg:px-8"
      data-home-ad={advertisement.id}
    >
      <div className="mx-auto w-full max-w-[1280px] overflow-hidden rounded-[var(--hp-r-sm)] bg-black">
        {/* No margin below this bar: the label physically touches the image. */}
        <div className="flex h-7 items-center gap-1 bg-black px-1.5 text-white" dir="rtl">
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-white/65 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  aria-label="بستن این تبلیغ"
                />
              }
            >
              <X className="size-3.5" aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>بستن این تبلیغ</TooltipContent>
          </Tooltip>
          <span className="text-[11px] font-medium leading-none text-white/60">تبلیغات</span>
        </div>

        {advertisement.href ? (
          <a
            href={advertisement.href}
            rel="sponsored noopener noreferrer"
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset"
            aria-label={advertisement.alt}
          >
            {creative}
          </a>
        ) : creative}
      </div>
    </div>
  );
}

export default HomeAdvertisementBanner;
