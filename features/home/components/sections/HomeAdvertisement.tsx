"use client";

import * as React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { HomeAdvertisement } from "@/features/home/lib/home-advertisements";

export type HomeAdvertisementBannerProps = {
  advertisement: HomeAdvertisement;
};

function dismissalKey(advertisement: HomeAdvertisement) {
  return `techbox:home-ad-dismissed:${advertisement.id}:v${advertisement.version}`;
}

/**
 * A full-width campaign creative placed between homepage sections.
 * Dismissal lasts for the current browser session: closing an ad should be
 * respected while navigating, but a campaign is not hidden forever.
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
      sizes="(max-width: 640px) 100vw, (max-width: 1536px) calc(100vw - 4rem), 1440px"
      className="block h-auto w-full"
    />
  );

  return (
    <aside
      aria-label={`تبلیغ: ${advertisement.alt}`}
      className="w-full bg-black px-4 py-5 text-white sm:px-6 lg:px-8"
      data-home-ad={advertisement.id}
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium leading-4 text-white/55">تبلیغ</span>
          <button
            type="button"
            onClick={close}
            className="inline-flex size-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            aria-label="بستن تبلیغ"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-hidden rounded-[var(--hp-r-sm)] bg-black">
          {advertisement.href ? (
            <a
              href={advertisement.href}
              rel="sponsored noopener noreferrer"
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label={advertisement.alt}
            >
              {creative}
            </a>
          ) : creative}
        </div>
      </div>
    </aside>
  );
}

export default HomeAdvertisementBanner;
