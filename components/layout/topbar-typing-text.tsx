"use client";

import Link from "next/link";
import TextType from "@/components/ui/text-type/TextType";
import { moduleColors } from "@/config/module-colors";
import { useModuleConfig } from "@/providers/module-config.provider";
import type { ModuleSlug } from "@/lib/module-config";

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

export function TopbarTypingText() {
  const { enabled } = useModuleConfig();

  const items = ALL_ITEMS.filter((item) => enabled.has(item.module as ModuleSlug));

  if (items.length === 0) return null;

  const texts = items.map((item) => item.text);
  const colors = items.map((item) => moduleColors[item.module]?.active || "inherit");

  return (
    <Link
      href={items[0].href}
      className="hidden lg:flex items-center min-w-0 max-w-[260px] text-sm font-medium hover:opacity-85 transition-opacity"
      dir="rtl"
    >
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
        className="text-sm font-medium leading-7 truncate"
      />
    </Link>
  );
}
