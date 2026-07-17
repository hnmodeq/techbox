"use client";

import Link from "next/link";
import TextType from "@/components/ui/text-type/TextType";
import { moduleColors } from "@/config/module-colors";

const ALL_ITEMS: { text: string; href: string; module: keyof typeof moduleColors }[] = [
  { text: "اخبار تکنولوژی رو با تکباکس دنبال کن", href: "/news", module: "news" },
  { text: "محصولات زیرساختی رو از تکباکس خریداری کن", href: "/shop", module: "shop" },
  { text: "مشکلات فنی رو داخل انجمن تکباکس مطرح کن", href: "/forum", module: "forum" },
  { text: "از ابزارهای زیرساختی تکباکس استفاده کن", href: "/tools", module: "tools" },
  { text: "فایل‌هایی که نیاز داری رو از تکباکس دانلود کن", href: "/download", module: "download" },
  { text: "نقد و بررسی‌های تکباکس رو دنبال کن", href: "/review", module: "review" },
  { text: "مقاله‌های تکنولوژی رو از تکباکس دنبال کن", href: "/blog", module: "blog" },
  { text: "ویدیوهای سرگرم‌کننده حوزه تکنولوژی رو از تکباکس دنبال کن", href: "/media", module: "media" },
  { text: "تاریخچه تحولات و رویدادها رو در تایم‌لاین فناوری دنبال کن", href: "/timeline", module: "timeline" },
];

export default function HeroSection({ enabledModules }: { enabledModules?: string[] }) {
  const items = enabledModules
    ? ALL_ITEMS.filter((item) => enabledModules.includes(item.module))
    : ALL_ITEMS;

  if (items.length === 0) {
    return (
      <section className="w-full max-w-full flex flex-col justify-center items-center px-4 py-12 text-center" dir="rtl">
        <div className="flex flex-col items-center w-full max-w-3xl">
          <h1 className="text-[length:var(--hero-font-size)] text-foreground font-black tracking-tight">تکباکس</h1>
        </div>
      </section>
    );
  }

  const texts = items.map((item) => item.text);
  const colors = items.map((item) => moduleColors[item.module]?.active || "inherit");

  return (
    <section className="w-full max-w-full flex flex-col justify-center items-center px-4 py-12 text-center" dir="rtl">
      <div className="flex flex-col items-center w-full max-w-3xl">
        <h1 className="text-[length:var(--hero-font-size)] text-foreground font-black tracking-tight">تکباکس</h1>
        <div className="mt-4 w-full">
          <Link href={items[0].href} className="inline-block hero-rotator-text text-sm font-medium leading-7 sm:text-lg sm:font-semibold hover:opacity-85">
            <TextType
              text={texts}
              textColors={colors}
              typingSpeed={45}
              deletingSpeed={20}
              pauseDuration={2800}
              showCursor={true}
              cursorCharacter="|"
              cursorClassName="text-type__cursor--rtl"
              variableSpeed={{ min: 35, max: 65 }}
              className="text-sm font-medium leading-7 sm:text-lg sm:font-semibold"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
