export const HOME_AD_PLACEMENTS = [
  "magazine",
  "video",
  "insights",
  "finder",
  "topPicks",
  "timeline",
  "deals",
  "tools",
  "community",
  "websiteInfo",
  "partners",
  "siteTop",
  "sidebarPrimary",
  "sidebarSecondary",
] as const;

export type HomeAdPlacement = (typeof HOME_AD_PLACEMENTS)[number];

export type HomeAdvertisement = {
  id: string;
  image: string;
  alt: string;
  href?: string;
  /** Render inside this homepage band, before the section content. */
  section: HomeAdPlacement;
  enabled: boolean;
  order: number;
  /** Bump when creative changes so a previously dismissed ad may appear again. */
  version: number;
};

const STORAGE_BASE =
  "https://nggwgcfkceuadvhxnczf.supabase.co/storage/v1/object/public/techbox/advertisements/home";

/**
 * Initial owner-supplied campaign set. The database setting replaces this
 * entire list as soon as an administrator saves the advertisements page.
 * Keeping a code fallback means a fresh deployment is not blank before the
 * first admin save, while an explicitly saved [] still disables every ad.
 */
export const DEFAULT_HOME_ADVERTISEMENTS: HomeAdvertisement[] = [
  {
    id: "bazar-instagram-shops",
    image: `${STORAGE_BASE}/bazar-instagram-shops.webp`,
    alt: "فروشگاه‌های اینستاگرامی، اومدن توی بازار",
    href: "https://digikala.ir",
    section: "magazine",
    enabled: true,
    order: 0,
    version: 1,
  },
  {
    id: "home-favorites",
    image: `${STORAGE_BASE}/home-favorites.webp`,
    alt: "محبوب‌ترین‌های خانه با تخفیف ویژه",
    href: "https://zoomit.ir",
    section: "video",
    enabled: true,
    order: 1,
    version: 1,
  },
  {
    id: "vitaplex-hair-care",
    image: `${STORAGE_BASE}/vitaplex-hair-care.webp`,
    alt: "محصولات تخصصی مراقبت از مو ویتاپلکس",
    href: "https://khanoomi.ir",
    section: "insights",
    enabled: true,
    order: 2,
    version: 1,
  },
  {
    id: "filmnet-koori",
    image: `${STORAGE_BASE}/filmnet-koori.webp`,
    alt: "سریال کوری در فیلم‌نت",
    href: "https://digiato.ir",
    section: "topPicks",
    enabled: true,
    order: 3,
    version: 1,
  },
  {
    id: "golden-time-jewelry",
    image: `${STORAGE_BASE}/golden-time-jewelry.webp`,
    alt: "تخفیف طلای ۱۸ عیار",
    href: "https://time.ir",
    section: "timeline",
    enabled: true,
    order: 4,
    version: 1,
  },
  {
    id: "centella-skincare",
    image: `${STORAGE_BASE}/centella-skincare.webp`,
    alt: "سرم پوستی سنتلا برای درخشش پوست",
    href: "https://irancell.ir",
    section: "deals",
    enabled: true,
    order: 5,
    version: 1,
  },
  {
    id: "digipet-pet-food",
    image: `${STORAGE_BASE}/digipet-pet-food.webp`,
    alt: "خرید قسطی غذای حیوانات خانگی",
    href: "https://digikala.ir",
    section: "tools",
    enabled: true,
    order: 6,
    version: 1,
  },
  {
    id: "otaghak-villa",
    image: `${STORAGE_BASE}/otaghak-villa.webp`,
    alt: "رزرو اقساطی ویلا در اتاقک",
    href: "https://digiato.ir",
    section: "community",
    enabled: true,
    order: 7,
    version: 1,
  },
  {
    id: "site-top-campaign",
    image: "/assets/advertisements/site/ad-banner.gif",
    alt: "پیشنهاد ویژه بالای سایت",
    section: "siteTop",
    enabled: true,
    order: 8,
    version: 1,
  },
  {
    id: "sidebar-primary",
    image: "/assets/advertisements/site/sidebar-ad-1.webp",
    alt: "تبلیغ خدمات اینترنت پرسرعت",
    section: "sidebarPrimary",
    enabled: true,
    order: 9,
    version: 1,
  },
  {
    id: "sidebar-secondary",
    image: "/assets/advertisements/site/sidebar-ad-2.webp",
    alt: "تبلیغ سرورهای ابری و اختصاصی",
    section: "sidebarSecondary",
    enabled: true,
    order: 10,
    version: 1,
  },
];

const PLACEMENTS = new Set<string>(HOME_AD_PLACEMENTS);

export function isSafeAdvertisementImage(value: string): boolean {
  const image = value.trim();
  const hasSupportedExtension = /\.(?:webp|gif)(?:\?.*)?$/i.test(image);
  if (!hasSupportedExtension) return false;
  if (image.startsWith("/") && !image.startsWith("//")) return true;
  try {
    return new URL(image).protocol === "https:";
  } catch {
    return false;
  }
}

export function isSafeAdvertisementHref(value: string): boolean {
  const href = value.trim();
  if (!href) return true;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}

/** Parse untrusted SiteSetting JSON without letting one bad row break home. */
export function parseHomeAdvertisements(raw: unknown): HomeAdvertisement[] {
  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const ads: HomeAdvertisement[] = [];

  for (const candidate of value.slice(0, 20)) {
    if (!candidate || typeof candidate !== "object") continue;
    const item = candidate as Record<string, unknown>;
    const id = typeof item.id === "string" ? item.id.trim() : "";
    const image = typeof item.image === "string" ? item.image.trim() : "";
    const alt = typeof item.alt === "string" ? item.alt.trim() : "";
    const href = typeof item.href === "string" ? item.href.trim() : "";
    // `afterSection` is the first-release field name. Read it for a seamless
    // migration, but every API/admin response now emits the truthful `section`.
    const section = typeof item.section === "string"
      ? item.section
      : typeof item.afterSection === "string"
        ? item.afterSection
        : "";

    if (!id || seen.has(id) || !/^[-a-zA-Z0-9_]{2,80}$/.test(id)) continue;
    if (!isSafeAdvertisementImage(image)) continue;
    if (!alt || alt.length > 180) continue;
    if (!PLACEMENTS.has(section)) continue;
    if (!isSafeAdvertisementHref(href)) continue;

    seen.add(id);
    ads.push({
      id,
      image,
      alt,
      href: href || undefined,
      section: section as HomeAdPlacement,
      enabled: item.enabled !== false,
      order: typeof item.order === "number" && Number.isFinite(item.order)
        ? Math.max(0, Math.trunc(item.order))
        : ads.length,
      version: typeof item.version === "number" && Number.isFinite(item.version)
        ? Math.max(1, Math.trunc(item.version))
        : 1,
    });
  }

  return ads.sort((a, b) => a.order - b.order);
}
