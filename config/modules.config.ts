import { moduleColors } from "@/config/module-colors";

export type ModuleItem = {
  title: string;
  slug: string;
  description: string;
  color: string;
  cols?: string;
  rows?: string;
  order: number;
};

export const modules: ModuleItem[] = [
  {
    title: "مجله آنلاین",
    slug: "blog",
    description: "مقالات تخصصی، تحلیل‌ها و راهنماهای عمیق.",
    color: moduleColors.blog.active,
    cols: "md:col-span-4",
    order: 1,
  },
  {
    title: "اخبار",
    slug: "news",
    description: "آخرین خبرهای فناوری، زیرساخت و هوش مصنوعی.",
    color: moduleColors.news.active,
    cols: "md:col-span-3",
    order: 2,
  },
  {
    title: "ویدیوهای کوتاه",
    slug: "media",
    description: "ویدیوهای آموزشی، بررسی‌ها و محتوای چندرسانه‌ای.",
    color: moduleColors.media.active,
    cols: "md:col-span-3",
    order: 3,
  },
  {
    title: "انجمن",
    slug: "forum",
    description: "پرسش و پاسخ تخصصی کاربران و مهندسین.",
    color: moduleColors.forum.active,
    cols: "md:col-span-4",
    order: 4,
  },
  {
    title: "دانلود",
    slug: "download",
    description: "ISO، Firmware، فایل‌ها و منابع قابل دانلود.",
    color: moduleColors.download.active,
    cols: "md:col-span-4",
    order: 5,
  },
  {
    title: "ابزارهای کاربردی",
    slug: "tools",
    description: "ابزارهای کاربردی برای شبکه و مهندسی سیستم.",
    color: moduleColors.tools.active,
    cols: "md:col-span-3",
    order: 6,
  },
  {
    title: "نقد و بررسی",
    slug: "review",
    description: "بررسی تخصصی تجهیزات، سرویس‌ها و نرم‌افزارها.",
    color: moduleColors.review.active,
    cols: "md:col-span-4",
    order: 7,
  },
  {
    title: "گاه‌شمار تکنولوژی",
    slug: "timeline",
    description: "تاریخچه تحولات، رویدادها و نقاط عطف فناوری اطلاعات.",
    color: moduleColors.timeline.active,
    cols: "md:col-span-4",
    order: 8,
  },
  {
    title: "فروشگاه",
    slug: "shop",
    description: "سرور، استوریج و تجهیزات تخصصی زیرساخت.",
    color: moduleColors.shop.active,
    cols: "md:col-span-3",
    order: 9,
  },
];

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
  | "timeline"
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
    | "nas" | "nvr" | "timeline";
  descriptionFa?: string;
};

const moduleList: ModuleMeta[] = [
  { key: "home", slug: "home", title: "Home", titleFa: "خانه", href: "/", color: "var(--home)", icon: "home", descriptionFa: "صفحه اصلی" },
  { key: "blog", slug: "blog", title: "Blog", titleFa: "مجله آنلاین", href: "/blog", color: "var(--blog)", icon: "blog", descriptionFa: "مقالات تخصصی" },
  { key: "news", slug: "news", title: "News", titleFa: "اخبار", href: "/news", color: "var(--news)", icon: "news", descriptionFa: "اخبار دنیای تکنولوژی" },
  { key: "media", slug: "media", title: "Media", titleFa: "ویدیوهای کوتاه", href: "/media", color: "var(--media)", icon: "media", descriptionFa: "ویدئو و پادکست" },
  { key: "shop", slug: "shop", title: "Shop", titleFa: "فروشگاه", href: "/shop", color: "var(--shop)", icon: "shop", descriptionFa: "خرید تجهیزات" },
  { key: "tools", slug: "tools", title: "Tools", titleFa: "ابزارهای کاربردی", href: "/tools", color: "var(--tools)", icon: "tools", descriptionFa: "ابزارهای محاسباتی" },
  { key: "download", slug: "download", title: "Download", titleFa: "دانلود", href: "/download", color: "var(--download)", icon: "downloadModule", descriptionFa: "مرکز دانلود" },
  { key: "timeline", slug: "timeline", title: "Timeline", titleFa: "گاه‌شمار تکنولوژی", href: "/timeline", color: "var(--timeline)", icon: "timeline", descriptionFa: "تاریخچه و رویدادهای فناوری" },
  { key: "forum", slug: "forum", title: "Forum", titleFa: "انجمن", href: "/forum", color: "var(--forum)", icon: "forum", descriptionFa: "پرسش و پاسخ" },
  { key: "review", slug: "review", title: "Review", titleFa: "بررسی", href: "/review", color: "var(--review)", icon: "review", descriptionFa: "نقد و بررسی" },
  { key: "raid", slug: "raid", title: "RAID", titleFa: "رید", href: "/tools/raid-calculator", color: "var(--raid)", icon: "disk", descriptionFa: "ماشین حساب RAID" },
  { key: "subnet", slug: "subnet", title: "Subnet", titleFa: "ساب‌نت", href: "/tools/subnet-calculator", color: "var(--subnet)", icon: "tools", descriptionFa: "ماشین حساب ساب‌نت" },
  { key: "vip", slug: "vip", title: "VIP", titleFa: "ویژه", href: "/vip", color: "var(--vip)", icon: "shield", descriptionFa: "بخش ویژه" },
  { key: "account", slug: "account", title: "Account", titleFa: "حساب کاربری", href: "/account", color: "var(--account)", icon: "user", descriptionFa: "پنل کاربری" },
  { key: "admin", slug: "admin", title: "Admin", titleFa: "مدیریت", href: "/admin", color: "var(--admin)", icon: "shield", descriptionFa: "پنل مدیریت" },
  { key: "about", slug: "about", title: "About", titleFa: "درباره ما", href: "/about", color: "var(--about)", icon: "users", descriptionFa: "درباره تک‌باکس" },
  { key: "contact", slug: "contact", title: "Contact", titleFa: "تماس", href: "/contact", color: "var(--contact)", icon: "chat", descriptionFa: "تماس با ما" },
  { key: "consultation", slug: "consultation", title: "Consultation", titleFa: "مشاوره", href: "/consultation", color: "var(--consultation)", icon: "chat", descriptionFa: "درخواست مشاوره" },
  { key: "workwithus", slug: "workwithus", title: "Work With Us", titleFa: "همکاری", href: "/work-with-us", color: "var(--workwithus)", icon: "users", descriptionFa: "همکاری با ما" },
  { key: "search", slug: "search", title: "Search", titleFa: "جستجو", href: "/search", color: "var(--home)", icon: "home", descriptionFa: "جستجو" },
  { key: "nas-selector", slug: "nas-selector", title: "NAS Selector", titleFa: "انتخاب‌گر NAS", href: "/tools/nas-selector", color: "var(--nas)", icon: "nas", descriptionFa: "انتخاب NAS" },
  { key: "nvr-selector", slug: "nvr-selector", title: "NVR Selector", titleFa: "انتخاب‌گر NVR", href: "/tools/nvr-selector", color: "var(--nvr)", icon: "nvr", descriptionFa: "انتخاب NVR" },
  { key: "raid-calculator", slug: "raid-calculator", title: "RAID Calculator", titleFa: "ماشین حساب RAID", href: "/tools/raid-calculator", color: "var(--raid)", icon: "disk", descriptionFa: "RAID / SHR" },
  { key: "subnet-calculator", slug: "subnet-calculator", title: "Subnet Calculator", titleFa: "ماشین حساب ساب‌نت", href: "/tools/subnet-calculator", color: "var(--subnet)", icon: "tools", descriptionFa: "ساب‌نت" },
];

const fallbackMeta: ModuleMeta = {
  key: "tools",
  slug: "tools",
  title: "Tools",
  titleFa: "ابزارها",
  href: "/tools",
  color: "var(--home)",
  icon: "tools",
  descriptionFa: "",
};

export const moduleMap: Record<string, ModuleMeta> = Object.fromEntries(
  moduleList.map(m => [m.slug, m]).concat(moduleList.map(m => [m.key, m]))
);

export function getModuleMeta(slug?: string | null): ModuleMeta {
  if (!slug) return fallbackMeta;
  return moduleMap[slug] ?? { ...fallbackMeta, slug: slug as ModuleKey, key: slug as ModuleKey, href: `/${slug}` };
}

export const MODULES = moduleList;
export const moduleRegistry = moduleMap;
export const MODULE_MAP = moduleMap;

export const toolRoutes = [
  {
    slug: "nas-selector",
    key: "nas-selector",
    titleFa: "انتخاب‌گر NAS",
    title: "NAS Selector",
    href: "/tools/nas-selector",
    descriptionFa: "پیشنهاد NAS بر اساس ظرفیت، RAID، کاربران و بودجه",
    icon: "nas" as const,
    color: "var(--nas)",
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
    color: "var(--nvr)",
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
    color: "var(--raid)",
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
    color: "var(--subnet)",
  },
] as const;

export type ToolSlug = typeof toolRoutes[number]["slug"];
