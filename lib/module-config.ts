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
  /** Whether row title is visible */
  showHomeTitle: boolean;
  /** Whether "more" button is visible */
  showHomeMoreLabel: boolean;
};

export type ModuleConfigMap = Record<ModuleSlug, ModuleConfig>;

/** Full site layout config returned by getModuleConfig() */
export type SiteLayoutConfig = ModuleConfigMap & {
  /** Whether the hero section is visible on the homepage */
  heroVisible: boolean;
  /** Whether the per-module color system is enabled */
  moduleColorsEnabled: boolean;
  /** Unified color when moduleColorsEnabled is false (CSS value) */
  unifiedModuleColor: string;
  /** Per-module custom colors (CSS values) */
  moduleColors: Partial<Record<ModuleSlug, string>>;
  /** Single source of truth for each module's DISPLAY NAME (titleFa).
   *  Overrides moduleMeta/sidebar titles everywhere. */
  titles: Record<ModuleSlug, string>;
};

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

// ─── Module display names (source of truth) ───────────────────────────
// These are the canonical display names for each module. Editable from the
// admin panel (SiteSetting: modules.titles); this is the fallback. Renaming a
// module here (or in admin) propagates to the sidebar, tickbar, suggestions,
// user activity, home rows, badges, and SEO via getModuleTitleFa() /
// useModuleTitles().
export const DEFAULT_MODULE_TITLES: Record<ModuleSlug, string> = {
  blog: "مجله آنلاین",
  news: "اخبار",
  media: "ویدیوهای کوتاه",
  shop: "فروشگاه",
  forum: "انجمن",
  review: "نقد و بررسی",
  download: "دانلود",
  tools: "ابزارهای کاربردی",
  timeline: "گاه‌شمار تکنولوژی",
};

export function getDefaultModuleConfig(slug: ModuleSlug): ModuleConfig {
  return {
    enabled: true,
    showOnHome: true,
    homeOrder: DEFAULT_HOME_ORDER[slug] ?? 99,
    homeTitle: DEFAULT_HOME_TITLES[slug] ?? "",
    homeMoreLabel: DEFAULT_HOME_MORE_LABELS[slug] ?? "",
    showHomeTitle: true,
    showHomeMoreLabel: true,
  };
}

export function getDefaultModuleConfigMap(): ModuleConfigMap {
  return Object.fromEntries(
    DEFAULT_MODULE_SLUGS.map((slug) => [slug, getDefaultModuleConfig(slug)])
  ) as ModuleConfigMap;
}

export function getDefaultSiteLayoutConfig(): SiteLayoutConfig {
  return {
    ...getDefaultModuleConfigMap(),
    heroVisible: true,
    moduleColorsEnabled: true,
    unifiedModuleColor: "var(--primary)",
    moduleColors: {},
    titles: { ...DEFAULT_MODULE_TITLES },
  };
}

// ─── SiteSetting Keys ─────────────────────────────────────────────────

const KEY_ENABLED = "modules.enabled";
const KEY_HOME_VISIBILITY = "modules.home_visibility";
const KEY_HOME_ORDER = "modules.home_order";
const KEY_HOME_TITLES = "modules.home_titles";
const KEY_HOME_MORE_LABELS = "modules.home_more_labels";
const KEY_HOME_SHOW_TITLE = "modules.home_show_title";
const KEY_HOME_SHOW_MORE_LABEL = "modules.home_show_more_label";
const KEY_HERO_VISIBLE = "hero.visible";
const KEY_MODULE_COLORS_ENABLED = "modules.colors_enabled";
const KEY_UNIFIED_MODULE_COLOR = "modules.unified_color";
const KEY_MODULE_COLORS = "modules.custom_colors";
const KEY_MODULE_TITLES = "modules.titles";

// ─── Read Config (cached) ─────────────────────────────────────────────

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
 * OPTIMIZED: Single DB query for all 12 keys to avoid P2024 pool timeout (was 12 parallel findUnique)
 */
async function getModuleConfigUncached(): Promise<SiteLayoutConfig> {
  const defaults = getDefaultModuleConfigMap();

  // Single query instead of 12 parallel – prevents connection pool exhaustion
  let settingsMap = new Map<string, string>();
  try {
    const allKeys = [
      KEY_ENABLED,
      KEY_HOME_VISIBILITY,
      KEY_HOME_ORDER,
      KEY_HOME_TITLES,
      KEY_HOME_MORE_LABELS,
      KEY_HOME_SHOW_TITLE,
      KEY_HOME_SHOW_MORE_LABEL,
      KEY_HERO_VISIBLE,
      KEY_MODULE_COLORS_ENABLED,
      KEY_UNIFIED_MODULE_COLOR,
      KEY_MODULE_COLORS,
      KEY_MODULE_TITLES,
    ];
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: allKeys } },
      select: { key: true, value: true },
    });
    settingsMap = new Map(rows.map((r) => [r.key, r.value]));
  } catch {
    // DB unavailable – use defaults
  }

  const getRaw = (k: string) => settingsMap.get(k) ?? null;

  const enabledRaw = getRaw(KEY_ENABLED);
  const homeVisRaw = getRaw(KEY_HOME_VISIBILITY);
  const homeOrderRaw = getRaw(KEY_HOME_ORDER);
  const homeTitlesRaw = getRaw(KEY_HOME_TITLES);
  const homeMoreRaw = getRaw(KEY_HOME_MORE_LABELS);
  const homeShowTitleRaw = getRaw(KEY_HOME_SHOW_TITLE);
  const homeShowMoreLabelRaw = getRaw(KEY_HOME_SHOW_MORE_LABEL);
  const heroVisibleRaw = getRaw(KEY_HERO_VISIBLE);
  const colorsEnabledRaw = getRaw(KEY_MODULE_COLORS_ENABLED);
  const unifiedColorRaw = getRaw(KEY_UNIFIED_MODULE_COLOR);
  const moduleColorsRaw = getRaw(KEY_MODULE_COLORS);
  const moduleTitlesRaw = getRaw(KEY_MODULE_TITLES);

  const enabledMap = parseJsonSafe<Partial<Record<ModuleSlug, boolean>>>(enabledRaw, {});
  const homeVisMap = parseJsonSafe<Partial<Record<ModuleSlug, boolean>>>(homeVisRaw, {});
  const homeOrderMap = parseJsonSafe<Partial<Record<ModuleSlug, number>>>(homeOrderRaw, {});
  const homeTitlesMap = parseJsonSafe<Partial<Record<ModuleSlug, string>>>(homeTitlesRaw, {});
  const homeMoreMap = parseJsonSafe<Partial<Record<ModuleSlug, string>>>(homeMoreRaw, {});
  const homeShowTitleMap = parseJsonSafe<Partial<Record<ModuleSlug, boolean>>>(homeShowTitleRaw, {});
  const homeShowMoreLabelMap = parseJsonSafe<Partial<Record<ModuleSlug, boolean>>>(homeShowMoreLabelRaw, {});

  for (const slug of DEFAULT_MODULE_SLUGS) {
    const cfg = defaults[slug];
    if (enabledMap[slug] !== undefined) cfg.enabled = enabledMap[slug]!;
    if (homeVisMap[slug] !== undefined) cfg.showOnHome = homeVisMap[slug]!;
    if (homeOrderMap[slug] !== undefined) cfg.homeOrder = homeOrderMap[slug]!;
    if (homeTitlesMap[slug] !== undefined) cfg.homeTitle = homeTitlesMap[slug]!;
    if (homeMoreMap[slug] !== undefined) cfg.homeMoreLabel = homeMoreMap[slug]!;
    if (homeShowTitleMap[slug] !== undefined) cfg.showHomeTitle = homeShowTitleMap[slug]!;
    if (homeShowMoreLabelMap[slug] !== undefined) cfg.showHomeMoreLabel = homeShowMoreLabelMap[slug]!;
  }

  // Hero visibility (default: true)
  const heroVisible = heroVisibleRaw === "false" ? false : true;

  // Module color system
  const moduleColorsEnabled = colorsEnabledRaw !== "false";
  const unifiedModuleColor = unifiedColorRaw || "var(--primary)";
  const moduleColors = parseJsonSafe<Partial<Record<ModuleSlug, string>>>(moduleColorsRaw, {});

  // Module display names (source of truth). Overlay DB overrides on the defaults.
  const moduleTitlesMap = parseJsonSafe<Partial<Record<ModuleSlug, string>>>(moduleTitlesRaw, {});
  const titles = { ...DEFAULT_MODULE_TITLES };
  for (const slug of DEFAULT_MODULE_SLUGS) {
    const override = moduleTitlesMap[slug];
    if (typeof override === "string" && override.trim()) titles[slug] = override.trim();
  }

  return { ...defaults, heroVisible, moduleColorsEnabled, unifiedModuleColor, moduleColors, titles };
}

export const getModuleConfig = unstable_cache(
  getModuleConfigUncached,
  ["module-config-v1"],
  { revalidate: 86400, tags: ["module-config"] }
);

/**
 * Get only the list of enabled module slugs (most common query).
 */
export async function getEnabledModules(): Promise<ModuleSlug[]> {
  const config = await getModuleConfig();
  return DEFAULT_MODULE_SLUGS.filter((slug) => config[slug]?.enabled !== false);
}

/**
 * Get the full module display-name map (source of truth). Server-side only;
 * client components use useModuleTitles() from the provider.
 */
export async function getModuleTitles(): Promise<Record<ModuleSlug, string>> {
  const config = await getModuleConfig();
  return config.titles;
}

/**
 * Resolve a single module's display name, with a sensible fallback.
 */
export async function getModuleTitleFa(slug: ModuleSlug | string): Promise<string> {
  const titles = await getModuleTitles();
  return (titles as Record<string, string>)[slug] ?? slug;
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

export async function saveModuleConfig(config: SiteLayoutConfig, updatedBy: string): Promise<void> {
  const enabledMap: Record<string, boolean> = {};
  const homeVisMap: Record<string, boolean> = {};
  const homeOrderMap: Record<string, number> = {};
  const homeTitlesMap: Record<string, string> = {};
  const homeMoreMap: Record<string, string> = {};
  const homeShowTitleMap: Record<string, boolean> = {};
  const homeShowMoreLabelMap: Record<string, boolean> = {};

  for (const slug of DEFAULT_MODULE_SLUGS) {
    const cfg = config[slug];
    if (!cfg) continue;
    enabledMap[slug] = cfg.enabled;
    homeVisMap[slug] = cfg.showOnHome;
    homeOrderMap[slug] = cfg.homeOrder;
    homeTitlesMap[slug] = cfg.homeTitle;
    homeMoreMap[slug] = cfg.homeMoreLabel;
    homeShowTitleMap[slug] = cfg.showHomeTitle;
    homeShowMoreLabelMap[slug] = cfg.showHomeMoreLabel;
  }

  const updates: Array<{ key: string; value: string }> = [
    { key: KEY_ENABLED, value: JSON.stringify(enabledMap) },
    { key: KEY_HOME_VISIBILITY, value: JSON.stringify(homeVisMap) },
    { key: KEY_HOME_ORDER, value: JSON.stringify(homeOrderMap) },
    { key: KEY_HOME_TITLES, value: JSON.stringify(homeTitlesMap) },
    { key: KEY_HOME_MORE_LABELS, value: JSON.stringify(homeMoreMap) },
    { key: KEY_HOME_SHOW_TITLE, value: JSON.stringify(homeShowTitleMap) },
    { key: KEY_HOME_SHOW_MORE_LABEL, value: JSON.stringify(homeShowMoreLabelMap) },
    { key: KEY_HERO_VISIBLE, value: String(config.heroVisible ?? true) },
    { key: KEY_MODULE_COLORS_ENABLED, value: String(config.moduleColorsEnabled ?? true) },
    { key: KEY_UNIFIED_MODULE_COLOR, value: config.unifiedModuleColor || "var(--primary)" },
    { key: KEY_MODULE_COLORS, value: JSON.stringify(config.moduleColors || {}) },
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
