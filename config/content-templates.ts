import type { ModuleSlug } from "@/lib/content";

export type ContentTemplate = {
  id: string;
  name: string;
  nameFa: string;
  module: ModuleSlug;
  category?: string;
  tags?: string[];
  excerpt?: string;
  content: string;
  description: string;
};

export const contentTemplates: ContentTemplate[] = [
  {
    id: "blog-guide",
    name: "Blog Guide",
    nameFa: "راهنمای جامع",
    module: "blog",
    category: "آموزش",
    tags: ["راهنما", "آموزش"],
    description: "قالب مقالات آموزشی و راهنماهای جامع",
    content: `## مقدمه

در این مقاله قصد داریم...

## پیش‌نیازها

قبل از شروع، مطمئن شوید:

- [ ] پیش‌نیاز ۱
- [ ] پیش‌نیاز ۲

## مرحله ۱: عنوان مرحله

توضیحات مرحله اول...

## مرحله ۲: عنوان مرحله

توضیحات مرحله دوم...

## مرحله ۳: عنوان مرحله

توضیحات مرحله سوم...

## نکات مهم

> نکته مهم اینجا قرار می‌گیرد.

## جمع‌بندی

در این مقاله یاد گرفتیم که...`,
  },
  {
    id: "blog-review",
    name: "Blog Review",
    nameFa: "تحلیل و بررسی",
    module: "blog",
    category: "تحلیل",
    tags: ["تحلیل", "بررسی"],
    description: "قالب مقالات تحلیلی و بررسی فناوری",
    content: `## خلاصه

**موضوع:** [موضوع بررسی]
**امتیاز کلی:** ⭐⭐⭐⭐ (۴ از ۵)

## مقدمه

## بررسی اجمالی

### نقاط قوت

- ✅ نقطه قوت ۱
- ✅ نقطه قوت ۲
- ✅ نقطه قوت ۳

### نقاط ضعف

- ❌ نقطه ضعف ۱
- ❌ نقطه ضعف ۲

## بررسی تخصصی

### عملکرد

### امنیت

### قیمت‌گذاری

## مقایسه با رقبا

| ویژگی | محصول | رقیب ۱ | رقیب ۲ |
|-------|-------|--------|--------|
| ویژگی ۱ | ✅ | ✅ | ❌ |

## نتیجه‌گیری

## امتیاز نهایی

| معیار | امتیاز |
|-------|--------|
| عملکرد | ۴/۵ |
| امنیت | ۵/۵ |
| قیمت | ۳/۵ |
| **کل** | **۴/۵** |`,
  },
  {
    id: "news-quick",
    name: "News Quick",
    nameFa: "خبر کوتاه",
    module: "news",
    category: "اخبار",
    tags: ["خبر", "فوری"],
    description: "قالب خبرهای کوتاه و سریع",
    excerpt: "خلاصه کوتاه خبر در یک تا دو جمله.",
    content: `## خبر

[متن خبر اینجا نوشته می‌شود]

## جزئیات

## منبع

- [نام منبع](https://example.com)`,
  },
  {
    id: "review-product",
    name: "Review Product",
    nameFa: "نقد محصول",
    module: "review",
    category: "نقد و بررسی",
    tags: ["نقد", "بررسی", "محصول"],
    description: "قالب نقد و بررسی تجهیزات زیرساخت",
    content: `## معرفی محصول

**برند:** [نام برند]
**مدل:** [نام مدل]
**کاربرد:** [کاربرد اصلی]

## مشخصات فنی کلیدی

## طراحی و ساخت

## عملکرد

### تست عملکرد

### مصرف انرژی

### صدا و خنک‌کننده

## نرم‌افزار و مدیریت

## امنیت

## قیمت و ارزش خرید

## مقایسه با محصولات مشابه

## جمع‌بندی

### مزایا

- ✅ 

### معایب

- ❌ 

### امتیاز نهایی: ⭐⭐⭐⭐☆`,
  },
  {
    id: "forum-question",
    name: "Forum Question",
    nameFa: "پرسش فنی",
    module: "forum",
    category: "پرسش",
    tags: ["پرسش", "کمک"],
    description: "قالب پرسش‌های فنی انجمن",
    content: `## شرح مشکل

## محیط و نسخه

- **سیستم‌عامل:** 
- **نسخه نرم‌افزار:** 
- **معماری:** 

## مراحل بازتولید

1. 
2. 
3. 

## پیام خطا

\`\`\`
پیام خطا اینجا قرار می‌گیرد
\`\`\`

## تلاش‌های انجام شده

- [ ] بررسی لاگ‌ها
- [ ] جستجو در مستندات
- [ ] تست با نسخه دیگر`,
  },
  {
    id: "download-release",
    name: "Download Release",
    nameFa: "انتشار نرم‌افزار",
    module: "download",
    category: "فریم‌ور",
    tags: ["دانلود", "فریم‌ور", "آپدیت"],
    description: "قالب انتشار فایل‌های دانلودی",
    content: `## تغییرات این نسخه

- ✨ ویژگی جدید ۱
- 🐛 رفع باگ ۱
- ⚡ بهبود عملکرد

## سازگاری

| پلتفرم | پشتیبانی |
|--------|----------|
| Linux | ✅ |
| Windows | ✅ |
| macOS | ✅ |

## نحوه نصب/استفاده

\`\`\`bash
دستورات نصب اینجا
\`\`\`

## یادداشت‌های انتشار

## لینک‌های مرتبط

- [مستندات]() 
- [چangelog]()`,
  },
];

export function getTemplatesForModule(module: ModuleSlug): ContentTemplate[] {
  return contentTemplates.filter((t) => t.module === module);
}

export function getAllTemplates(): ContentTemplate[] {
  return contentTemplates;
}
