import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

/**
 * Module Configuration System
 *
 * Three layers of control stored in SiteSetting table as JSON:
 *
 * 1. Module enable/disable — disabled modules vanish from everywhere
 * 2. Homepage row visibility & order — only affects homepage layout
 * 3. Homepage row titles & "more" button labels — customizable text
 */

// ─── Types ────────────────────────────────────────────────────────────

export type ModuleSlug = "blog" | "news" | "media" | "shop" | "forum" | "review" | "download" | "tools" | "timeline";

export type ModuleConfig = {
  enabled: boolean;
  /** Homepage row visibility (independent of module enable) */
  showOnHome: boolean;
  /** Order on homepage (lower = higher). Default 999 means no order set yet */
  homeOrder: number;
  /** Custom row title. Empty = use default */
  homeTitle: string;
  /** Custom "more" button label. Empty = use default */
  homeMoreLabel: string;
};

export type ModuleConfigMap = Record<ModuleSlug, ModuleConfig>;

// ─── Defaults ─────────────────────────────────────────────────────────

const DEFAULT_MODULE_SLUGS: ModuleSlug[] = [
  "blog", "news", "media", "shop", "forum", "review", "download", "tools", "timeline",
];

const DEFAULT_HOME_TITLES: Record<ModuleSlug, string> = {
  blog: "آخرین مقالات منتشر شده",
  news: "", // news doesn't have a dedicated homepage row currently
  media: "آخرین ویدیوهای کوتاه تکباکسی",
  shop: "آخرین محصولات سازمانی اضافه شده",
  forum: "داغ‌ترین بحث‌ها و چالش‌های شبکه و دیتاسنتر",
  review: "بنچمارک‌ها و تست‌های عملی سخت‌افزار",
  download: "ISOها، فریم‌ورها و درایورهای سرور و زیرساخت",
  tools: "", // tools doesn't have a standard row
  timeline: "تاریخچه تحولات، رویدادها و نقاط عطف دیتاسنتر",
};

const DEFAULT_HOME_MORE_LABELS: Record<ModuleSlug, string> = {
  blog: "مشاهده همه ←",
  news: "",
  media: "گشت و گزار در ویدیوها",
  shop: "بازدید از فروشگاه ←",
  forum: "ورود به انجمن و ثبت پرسش ←",
  review: "مشاهده تمام بررسی‌ها ←",
  download: "ورود به مرکز دانلود ←",
  tools: "",
  timeline: "ورود به تایم‌لاین کامل",
};

const DEFAULT_HOME_ORDER: Record<ModuleSlug, number> = {
  blog: 1,
  media: 2,
  shop: 3,
  forum: 4,
  review: 5,
  download: 6,
  timeline: 7,
  news: 8,
  tools: 9,
};

export function getDefaultModuleConfig(slug: ModuleSlug): ModuleConfig {
  return {
    enabled: true,
    showOnHome: true,
    homeOrder: DEFAULT_HOME_ORDER[slug] ?? 99,
    homeTitle: DEFAULT_HOME_TITLES[slug] ?? "",
    homeMoreLabel: DEFAULT_HOME_MORE_LABELS[slug] ?? "",
  };
}

export function getDefaultModuleConfigMap(): ModuleConfigMap {
  return Object.fromEntries(
    DEFAULT_MODULE_SLUGS.map((slug) => [slug, getDefaultModuleConfig(slug)])
  ) as ModuleConfigMap;
}

// ─── SiteSetting Keys ─────────────────────────────────────────────────

const KEY_ENABLED = "modules.enabled";
const KEY_HOME_VISIBILITY = "modules.home_visibility";
const KEY_HOME_ORDER = "modules.home_order";
const KEY_HOME_TITLES = "modules.home_titles";
const KEY_HOME_MORE_LABELS = "modules.home_more_labels";

// ─── Read Config (cached) ─────────────────────────────────────────────

async function getSetting(key: string): Promise<string | null> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

function parseJsonSafe<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Get the full module configuration map.
 * Cached for 30 seconds via Next.js unstable_cache.
 */
async function getModuleConfigUncached(): Promise<ModuleConfigMap> {
  const defaults = getDefaultModuleConfigMap();

  const [enabledRaw, homeVisRaw, homeOrderRaw, homeTitlesRaw, homeMoreRaw] = await Promise.all([
    getSetting(KEY_ENABLED),
    getSetting(KEY_HOME_VISIBILITY),
    getSetting(KEY_HOME_ORDER),
    getSetting(KEY_HOME_TITLES),
    getSetting(KEY_HOME_MORE_LABELS),
  ]);

  const enabledMap = parseJsonSafe<Partial<Record<ModuleSlug, boolean>>>(enabledRaw, {});
  const homeVisMap = parseJsonSafe<Partial<Record<ModuleSlug, boolean>>>(homeVisRaw, {});
  const homeOrderMap = parseJsonSafe<Partial<Record<ModuleSlug, number>>>(homeOrderRaw, {});
  const homeTitlesMap = parseJsonSafe<Partial<Record<ModuleSlug, string>>>(homeTitlesRaw, {});
  const homeMoreMap = parseJsonSafe<Partial<Record<ModuleSlug, string>>>(homeMoreRaw, {});

  for (const slug of DEFAULT_MODULE_SLUGS) {
    const cfg = defaults[slug];
    if (enabledMap[slug] !== undefined) cfg.enabled = enabledMap[slug]!;
    if (homeVisMap[slug] !== undefined) cfg.showOnHome = homeVisMap[slug]!;
    if (homeOrderMap[slug] !== undefined) cfg.homeOrder = homeOrderMap[slug]!;
    if (homeTitlesMap[slug] !== undefined) cfg.homeTitle = homeTitlesMap[slug]!;
    if (homeMoreMap[slug] !== undefined) cfg.homeMoreLabel = homeMoreMap[slug]!;
  }

  return defaults;
}

export const getModuleConfig = unstable_cache(
  getModuleConfigUncached,
  ["module-config-v1"],
  { revalidate: 30, tags: ["module-config"] }
);

/**
 * Get only the list of enabled module slugs (most common query).
 */
export async function getEnabledModules(): Promise<ModuleSlug[]> {
  const config = await getModuleConfig();
  return DEFAULT_MODULE_SLUGS.filter((slug) => config[slug]?.enabled !== false);
}

/**
 * Get homepage rows in configured order (only visible ones).
 */
export async function getHomeRows(): Promise<Array<{ slug: ModuleSlug; title: string; moreLabel: string }>> {
  const config = await getModuleConfig();
  return DEFAULT_MODULE_SLUGS
    .filter((slug) => config[slug]?.enabled && config[slug]?.showOnHome)
    .sort((a, b) => (config[a]?.homeOrder ?? 99) - (config[b]?.homeOrder ?? 99))
    .map((slug) => ({
      slug,
      title: config[slug]?.homeTitle || DEFAULT_HOME_TITLES[slug] || "",
      moreLabel: config[slug]?.homeMoreLabel || DEFAULT_HOME_MORE_LABELS[slug] || "",
    }));
}

// ─── Write Config ─────────────────────────────────────────────────────

export async function saveModuleConfig(config: ModuleConfigMap, updatedBy: string): Promise<void> {
  const enabledMap: Record<string, boolean> = {};
  const homeVisMap: Record<string, boolean> = {};
  const homeOrderMap: Record<string, number> = {};
  const homeTitlesMap: Record<string, string> = {};
  const homeMoreMap: Record<string, string> = {};

  for (const slug of DEFAULT_MODULE_SLUGS) {
    const cfg = config[slug];
    if (!cfg) continue;
    enabledMap[slug] = cfg.enabled;
    homeVisMap[slug] = cfg.showOnHome;
    homeOrderMap[slug] = cfg.homeOrder;
    homeTitlesMap[slug] = cfg.homeTitle;
    homeMoreMap[slug] = cfg.homeMoreLabel;
  }

  const updates: Array<{ key: string; value: string }> = [
    { key: KEY_ENABLED, value: JSON.stringify(enabledMap) },
    { key: KEY_HOME_VISIBILITY, value: JSON.stringify(homeVisMap) },
    { key: KEY_HOME_ORDER, value: JSON.stringify(homeOrderMap) },
    { key: KEY_HOME_TITLES, value: JSON.stringify(homeTitlesMap) },
    { key: KEY_HOME_MORE_LABELS, value: JSON.stringify(homeMoreMap) },
  ];

  for (const { key, value } of updates) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value, updatedBy },
      create: { key, value, updatedBy },
    });
  }
}

/** Re-export DEFAULT_HOME_TITLES and DEFAULT_HOME_MORE_LABELS for admin UI */
export { DEFAULT_HOME_TITLES, DEFAULT_HOME_MORE_LABELS, DEFAULT_MODULE_SLUGS };
