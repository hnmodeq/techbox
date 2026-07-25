import {
  LayoutDashboard,
  BarChart3,
  Search,
  FileText,
  Clock,
  Newspaper,
  Briefcase,
  Users,
  Shield,
  BadgeCheck,
  MessageSquare,
  MessageCircle,
  Store,
  ShoppingCart,
  Image,
  CreditCard,
  Layers,
  CalendarDays,
  Link2,
  Activity,
  Palette,
  HelpCircle,
  Database,
  Upload,
  Terminal,
  ScrollText,
  ImageIcon,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  superAdminOnly?: boolean;
  badge?: string;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "عمومی",
    items: [
      { title: "داشبورد", href: "/admin", icon: LayoutDashboard },
      { title: "آمار و تحلیل", href: "/admin/analytics", icon: BarChart3 },
      { title: "آمار جستجو", href: "/admin/search-analytics", icon: Search },
    ],
  },
  {
    label: "محتوا",
    items: [
      { title: "مدیریت محتوا", href: "/admin/posts", icon: FileText },
      { title: "تایم‌لاین", href: "/admin/timeline", icon: Clock },
      { title: "خبرنامه", href: "/admin/newsletter", icon: Newspaper },
      { title: "آگهی استخدام", href: "/admin/jobs", icon: Briefcase },
      { title: "شرایط همکاری", href: "/admin/terms", icon: Briefcase },
    ],
  },
  {
    label: "کاربران و اجتماع",
    items: [
      { title: "کاربران", href: "/admin/users", icon: Users },
      { title: "نقش‌ها و دسترسی", href: "/admin/roles-v2", icon: Shield },
      { title: "مدیریت گفتگو", href: "/admin/moderation", icon: Shield },
      { title: "تایید هویت", href: "/admin/verification", icon: BadgeCheck },
    ],
  },
  {
    label: "ارتباطات",
    items: [
      { title: "صندوق پیام‌ها", href: "/admin/inbox", icon: MessageCircle },
      { title: "مشاوره‌ها", href: "/admin/consultations", icon: MessageSquare },
    ],
  },
  {
    label: "فروشگاه",
    items: [
      { title: "سفارشات", href: "/admin/orders", icon: ShoppingCart },
      { title: "بنرهای فروشگاه", href: "/admin/shop-banners", icon: Image },
    ],
  },
  {
    label: "تنظیمات",
    items: [
      { title: "ماژول‌ها", href: "/admin/modules", icon: Layers },
      { title: "تنظیمات سایت", href: "/admin/settings", icon: CreditCard },
      { title: "تعطیلات", href: "/admin/holidays", icon: CalendarDays },
      { title: "Redirectها", href: "/admin/redirects", icon: Link2 },
      { title: "سلامت محتوا", href: "/admin/content-health", icon: Activity },
      { title: "ممیزی SEO", href: "/admin/seo-audit", icon: Search },
      { title: "FAQ", href: "/admin/faq", icon: HelpCircle },
      { title: "درباره ما", href: "/admin/about", icon: Users },
      { title: "لاگ فعالیت‌ها", href: "/admin/audit-log", icon: ScrollText },
      { title: "ترمینال هیرو", href: "/admin/hero-terminal", icon: Terminal },
    ],
  },
  {
    label: "ابزارها",
    items: [
      { title: "کتابخانه رسانه", href: "/admin/media", icon: ImageIcon },
      { title: "فایل‌های Blob", href: "/admin/blob", icon: Database },
      { title: "آپلود فایل", href: "/admin/upload", icon: Upload },
      { title: "دیزاین سیستم", href: "/admin/design-system", icon: Palette, superAdminOnly: true },
    ],
  },
];
