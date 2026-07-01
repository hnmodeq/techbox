// TechBox · modules.config – BACKWARD-COMPATIBLE v2
// Provides: modules array, moduleMap, getModuleMeta(), MODULES, default export
// Never returns undefined – always falls back to --tb-primary
// Safe for HomeModulesSection, Sidebar, Tool pages, etc.

export type ModuleKey =
  | "home"
  | "blog"
  | "news"
  | "media"
  | "shop"
  | "tools"
  | "download"
  | "forum"
  | "review"
  | "raid"
  | "subnet"
  | "vip"
  | "account"
  | "admin"
  | "about"
  | "contact"
  | "consultation"
  | "workwithus"
  | "search"
  | "nas-selector"
  | "nvr-selector"
  | "raid-calculator"
  | "subnet-calculator";

export type ModuleMeta = {
  key: ModuleKey;
  slug: ModuleKey;
  title: string;
  titleFa: string;
  href: string;
  color: string;
  icon: 
    | "home" | "blog" | "news" | "media" | "shop" | "tools"
    | "downloadModule" | "forum" | "review" | "server" | "disk"
    | "user" | "users" | "shield" | "chat"
    | "nas" | "nvr";
  descriptionFa?: string;
};

const moduleList: ModuleMeta[] = [
  { key: "home", slug: "home", title: "Home", titleFa: "خانه", href: "/", color: "var(--tb-home)", icon: "home", descriptionFa: "صفحه اصلی" },
  { key: "blog", slug: "blog", title: "Blog", titleFa: "بلاگ", href: "/blog", color: "var(--tb-blog)", icon: "blog", descriptionFa: "مقالات تخصصی" },
  { key: "news", slug: "news", title: "News", titleFa: "اخبار", href: "/news", color: "var(--tb-news)", icon: "news", descriptionFa: "اخبار دنیای تکنولوژی" },
  { key: "media", slug: "media", title: "Media", titleFa: "مدیا", href: "/media", color: "var(--tb-media)", icon: "media", descriptionFa: "ویدئو و پادکست" },
  { key: "shop", slug: "shop", title: "Shop", titleFa: "فروشگاه", href: "/shop", color: "var(--tb-shop)", icon: "shop", descriptionFa: "خرید تجهیزات" },
  { key: "tools", slug: "tools", title: "Tools", titleFa: "ابزارها", href: "/tools", color: "var(--tb-tools)", icon: "tools", descriptionFa: "ابزارهای محاسباتی" },
  { key: "download", slug: "download", title: "Download", titleFa: "دانلود", href: "/download", color: "var(--tb-download)", icon: "downloadModule", descriptionFa: "مرکز دانلود" },
  { key: "forum", slug: "forum", title: "Forum", titleFa: "انجمن", href: "/forum", color: "var(--tb-forum)", icon: "forum", descriptionFa: "پرسش و پاسخ" },
  { key: "review", slug: "review", title: "Review", titleFa: "بررسی", href: "/review", color: "var(--tb-review)", icon: "review", descriptionFa: "نقد و بررسی" },

  // calculators / sub-modules – keep color tokens consistent
  { key: "raid", slug: "raid", title: "RAID", titleFa: "رید", href: "/tools/raid-calculator", color: "var(--tb-raid)", icon: "disk", descriptionFa: "ماشین حساب RAID" },
  { key: "subnet", slug: "subnet", title: "Subnet", titleFa: "ساب‌نت", href: "/tools/subnet-calculator", color: "var(--tb-subnet)", icon: "tools", descriptionFa: "ماشین حساب ساب‌نت" },
  { key: "vip", slug: "vip", title: "VIP", titleFa: "ویژه", href: "/vip", color: "var(--tb-vip)", icon: "shield", descriptionFa: "بخش ویژه" },

  // system pages
  { key: "account", slug: "account", title: "Account", titleFa: "حساب کاربری", href: "/account", color: "var(--tb-account)", icon: "user", descriptionFa: "پنل کاربری" },
  { key: "admin", slug: "admin", title: "Admin", titleFa: "مدیریت", href: "/admin", color: "var(--tb-admin)", icon: "shield", descriptionFa: "پنل مدیریت" },
  { key: "about", slug: "about", title: "About", titleFa: "درباره ما", href: "/about", color: "var(--tb-about)", icon: "users", descriptionFa: "درباره تک‌باکس" },
  { key: "contact", slug: "contact", title: "Contact", titleFa: "تماس", href: "/contact", color: "var(--tb-contact)", icon: "chat", descriptionFa: "تماس با ما" },
  { key: "consultation", slug: "consultation", title: "Consultation", titleFa: "مشاوره", href: "/consultation", color: "var(--tb-consultation)", icon: "chat", descriptionFa: "درخواست مشاوره" },
  { key: "workwithus", slug: "workwithus", title: "Work With Us", titleFa: "همکاری", href: "/workwithus", color: "var(--tb-workwithus)", icon: "users", descriptionFa: "همکاری با ما" },
  { key: "search", slug: "search", title: "Search", titleFa: "جستجو", href: "/search", color: "var(--tb-primary)", icon: "home", descriptionFa: "جستجو" },

  // tools – explicit slugs (so HomeModulesSection / feed never gets undefined)
  { key: "nas-selector", slug: "nas-selector", title: "NAS Selector", titleFa: "انتخاب‌گر NAS", href: "/tools/nas-selector", color: "var(--tb-nas)", icon: "nas", descriptionFa: "انتخاب NAS" },
  { key: "nvr-selector", slug: "nvr-selector", title: "NVR Selector", titleFa: "انتخاب‌گر NVR", href: "/tools/nvr-selector", color: "var(--tb-nvr)", icon: "nvr", descriptionFa: "انتخاب NVR" },
  { key: "raid-calculator", slug: "raid-calculator", title: "RAID Calculator", titleFa: "ماشین حساب RAID", href: "/tools/raid-calculator", color: "var(--tb-raid)", icon: "disk", descriptionFa: "RAID / SHR" },
  { key: "subnet-calculator", slug: "subnet-calculator", title: "Subnet Calculator", titleFa: "ماشین حساب ساب‌نت", href: "/tools/subnet-calculator", color: "var(--tb-subnet)", icon: "tools", descriptionFa: "ساب‌نت" },
];

const fallbackMeta: ModuleMeta = {
  key: "tools",
  slug: "tools",
  title: "Tools",
  titleFa: "ابزارها",
  href: "/tools",
  color: "var(--tb-primary)",
  icon: "tools",
  descriptionFa: "",
};

// fast lookup
export const moduleMap: Record<string, ModuleMeta> = Object.fromEntries(
  moduleList.map(m => [m.slug, m]).concat(moduleList.map(m => [m.key, m]))
);

// Always safe – never undefined
export function getModuleMeta(slug?: string | null): ModuleMeta {
  if (!slug) return fallbackMeta;
  return moduleMap[slug] ?? { ...fallbackMeta, slug: slug as ModuleKey, key: slug as ModuleKey, href: `/${slug}` };
}

// Legacy / named exports – cover every import style seen in the wild
export const modules = moduleList;
export const MODULES = moduleList;
export const moduleRegistry = moduleMap;
export const MODULE_MAP = moduleMap;

export default moduleList;

// Tool routes – used by ToolsGrid / Sidebar
export const toolRoutes = [
  {
    slug: "nas-selector",
    key: "nas-selector",
    titleFa: "انتخاب‌گر NAS",
    title: "NAS Selector",
    href: "/tools/nas-selector",
    descriptionFa: "پیشنهاد NAS بر اساس ظرفیت، RAID، کاربران و بودجه",
    icon: "nas" as const,
    color: "var(--tb-nas)",
    new: true,
  },
  {
    slug: "nvr-selector",
    key: "nvr-selector",
    titleFa: "انتخاب‌گر NVR",
    title: "NVR Selector",
    href: "/tools/nvr-selector",
    descriptionFa: "انتخاب NVR بر اساس دوربین، رزولوشن و روز ضبط",
    icon: "nvr" as const,
    color: "var(--tb-nvr)",
    new: true,
  },
  {
    slug: "raid-calculator",
    key: "raid-calculator",
    titleFa: "ماشین حساب RAID",
    title: "RAID Calculator",
    href: "/tools/raid-calculator",
    descriptionFa: "RAID 0/1/5/6/10 + SHR-1/2",
    icon: "disk" as const,
    color: "var(--tb-raid)",
    version: "v2",
  },
  {
    slug: "subnet-calculator",
    key: "subnet-calculator",
    titleFa: "ماشین حساب ساب‌نت",
    title: "Subnet Calculator",
    href: "/tools/subnet-calculator",
    descriptionFa: "محاسبه IP / CIDR – بدون تغییر",
    icon: "tools" as const,
    color: "var(--tb-subnet)",
  },
] as const;

export type ToolSlug = typeof toolRoutes[number]["slug"];
// ModuleKey already exported at top
