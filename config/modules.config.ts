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
 title: "مجله",
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
 title: "رسانه ویدیویی",
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
 title: "ابزارها",
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
 title: "فروشگاه",
 slug: "shop",
 description: "سرور، استوریج و تجهیزات تخصصی زیرساخت.",
 color: moduleColors.shop.active,
 cols: "md:col-span-7",
 order: 8,
 },
];

export { toolRoutes, moduleMap, getModuleMeta, type ToolSlug, type ModuleKey } from "./modules.config.TECHBOX_TOOLS_V2";
