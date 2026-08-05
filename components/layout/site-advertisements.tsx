"use client";

import type { HomeAdvertisement } from "@/features/home/lib/home-advertisements";

function AdLink({ advertisement, children, className }: {
  advertisement: HomeAdvertisement;
  children: React.ReactNode;
  className?: string;
}) {
  if (!advertisement.href) return <div className={className}>{children}</div>;
  return (
    <a
      href={advertisement.href}
      target={advertisement.href.startsWith("/") ? undefined : "_blank"}
      rel="sponsored noopener noreferrer"
      aria-label={advertisement.alt}
      className={className}
    >
      {children}
    </a>
  );
}

export function SiteTopAdvertisement({ advertisement }: { advertisement?: HomeAdvertisement }) {
  if (!advertisement?.enabled) return null;
  return (
    <div
      role="complementary"
      aria-label={`تبلیغات: ${advertisement.alt}`}
      className="h-[50px] w-full overflow-hidden bg-background"
      data-site-ad="top"
    >
      <AdLink advertisement={advertisement} className="block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={advertisement.image}
          alt={advertisement.alt}
          width={2800}
          height={100}
          className="h-full w-full object-cover"
        />
      </AdLink>
    </div>
  );
}

export function SidebarAdvertisementRail({ advertisements }: { advertisements: HomeAdvertisement[] }) {
  const visible = advertisements.filter((advertisement) => advertisement.enabled).slice(0, 2);
  if (visible.length === 0) return null;

  return (
    <div className="space-y-3 px-2 pb-3" aria-label="تبلیغات نوار کناری">
      <p className="px-1 text-[9px] text-muted-foreground">تبلیغات</p>
      {visible.map((advertisement) => (
        <AdLink
          key={advertisement.id}
          advertisement={advertisement}
          className="block overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={advertisement.image}
            alt={advertisement.alt}
            width={340}
            height={400}
            loading="lazy"
            decoding="async"
            className="h-auto w-full object-contain"
            data-site-ad={advertisement.id}
          />
        </AdLink>
      ))}
    </div>
  );
}
