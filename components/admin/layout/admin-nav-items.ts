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
      { title: "آمار جستجو", href: "/admin/search-analytics", icon: Search, superAdminOnly: true },
    ],
  },
  {
    label: "محتوا",
    items: [
      { title: "مدیریت محتوا", href: "/admin/posts", icon: FileText },
      { title: "تایم‌لاین", href: "/admin/timeline", icon: Clock },
      { title: "خبرنامه", href: "/admin/newsletter", icon: Newspaper, superAdminOnly: true },
      { title: "آگهی استخدام", href: "/admin/jobs", icon: Briefcase },
      { title: "شرایط همکاری", href: "/admin/terms", icon: Briefcase },
    ],
  },
  {
    label: "کاربران و اجتماع",
    items: [
      { title: "کاربران", href: "/admin/users", icon: Users, superAdminOnly: true },
      { title: "نقش‌ها و دسترسی", href: "/admin/roles-v2", icon: Shield, superAdminOnly: true },
      { title: "مدیریت گفتگو", href: "/admin/moderation", icon: Shield, superAdminOnly: true },
      { title: "تایید هویت", href: "/admin/verification", icon: BadgeCheck, superAdminOnly: true },
    ],
  },
  {
    label: "ارتباطات",
    items: [
      { title: "صندوق پیام‌ها", href: "/admin/inbox", icon: MessageCircle, superAdminOnly: true },
      { title: "مشاوره‌ها", href: "/admin/consultations", icon: MessageSquare, superAdminOnly: true },
    ],
  },
  {
    label: "فروشگاه",
    items: [
      { title: "سفارشات", href: "/admin/orders", icon: ShoppingCart, superAdminOnly: true },
      { title: "بنرهای فروشگاه", href: "/admin/shop-banners", icon: Image, superAdminOnly: true },
    ],
  },
  {
    label: "تنظیمات",
    items: [
      { title: "ماژول‌ها", href: "/admin/modules", icon: Layers, superAdminOnly: true },
      { title: "تنظیمات سایت", href: "/admin/settings", icon: CreditCard, superAdminOnly: true },
      { title: "تعطیلات", href: "/admin/holidays", icon: CalendarDays, superAdminOnly: true },
      { title: "Redirectها", href: "/admin/redirects", icon: Link2, superAdminOnly: true },
      { title: "سلامت محتوا", href: "/admin/content-health", icon: Activity, superAdminOnly: true },
      { title: "ممیزی SEO", href: "/admin/seo-audit", icon: Search, superAdminOnly: true },
      { title: "FAQ", href: "/admin/faq", icon: HelpCircle },
      { title: "درباره ما", href: "/admin/about", icon: Users, superAdminOnly: true },
      { title: "لاگ فعالیت‌ها", href: "/admin/audit-log", icon: ScrollText, superAdminOnly: true },
      { title: "ترمینال هیرو", href: "/admin/hero-terminal", icon: Terminal, superAdminOnly: true },
    ],
  },
  {
    label: "ابزارها",
    items: [
      { title: "کتابخانه رسانه", href: "/admin/media", icon: ImageIcon, superAdminOnly: true },
      { title: "فایل‌های Blob", href: "/admin/blob", icon: Database, superAdminOnly: true },
      { title: "آپلود فایل", href: "/admin/upload", icon: Upload, superAdminOnly: true },
      { title: "دیزاین سیستم", href: "/admin/design-system", icon: Palette, superAdminOnly: true },
    ],
  },
];
