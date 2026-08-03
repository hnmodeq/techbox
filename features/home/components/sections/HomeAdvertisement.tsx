"use client";

import * as React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { HomeAdvertisement } from "@/features/home/lib/home-advertisements";

export type HomeAdvertisementBannerProps = {
  advertisement: HomeAdvertisement;
  /** Tools/Website Info stay black even when the site theme is light. */
  inverted?: boolean;
};

function dismissalKey(advertisement: HomeAdvertisement) {
  return `techbox:home-ad-dismissed:layout-v2:${advertisement.id}:v${advertisement.version}`;
}

/**
 * Campaign creative rendered at the top of its owning homepage band.
 * It deliberately uses the exact same gutters/max-width as SectionShell.
 */
export function HomeAdvertisementBanner({ advertisement, inverted = false }: HomeAdvertisementBannerProps) {
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
      <div className="mx-auto w-full max-w-[1280px] overflow-hidden rounded-[var(--hp-r-sm)]">
        {/* Fully transparent—no background on this row or its parent. */}
        <div
          className={`flex h-7 items-center gap-1 px-1.5 ${inverted ? "text-white" : "text-foreground"}`}
          dir="rtl"
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-current opacity-65 transition-[color,opacity] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
                  aria-label="بستن این تبلیغ"
                />
              }
            >
              <X className="size-3.5" aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>بستن این تبلیغ</TooltipContent>
          </Tooltip>
          <span className="text-[11px] font-medium leading-none text-current opacity-60">تبلیغات</span>
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
