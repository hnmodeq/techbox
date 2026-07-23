/**
 * TechBox Permission System
 *
 * Format: resource:section:access
 * Examples:
 *   product:price:view  → can see price section (read-only)
 *   product:price:edit  → can edit price section
 *   content:blog:view   → can see blog content list
 *   settings:email:edit → can edit email settings
 *
 * Wildcards:
 *   content:*:view → can see content list in ANY module
 *   *:*:edit       → can edit everything (super_admin)
 */

// ─── Permission Constants ────────────────────────────────────────────────────

// Content modules
const CONTENT_MODULES = ["blog", "news", "media", "timeline", "forum", "download", "review"] as const;
const CONTENT_ACCESSES = ["view", "create", "edit", "delete", "publish"] as const;

// Product sections
const PRODUCT_SECTIONS = ["basic", "seo", "content", "media", "download", "review", "info", "price", "specs", "gallery", "status", "series"] as const;
const PRODUCT_ACCESSES = ["view", "edit"] as const;

// Settings sections
const SETTINGS_SECTIONS = ["comments", "resume", "email", "auth", "price"] as const;

// ─── Permission Builders ─────────────────────────────────────────────────────

/** Generate content module permissions */
export function contentPerm(module: string, access: string): string {
  return `content:${module}:${access}`;
}

/** Generate product section permissions */
export function productPerm(section: string, access: string): string {
  return `product:${section}:${access}`;
}

/** Generate settings section permissions */
export function settingsPerm(section: string, access: string): string {
  return `settings:${section}:${access}`;
}

// ─── Permission Bundles ──────────────────────────────────────────────────────

export type PermissionBundle = {
  id: string;
  name: string;
  nameFa: string;
  description: string;
  category: string;
  permissions: string[];
};

export const PERMISSION_BUNDLES: PermissionBundle[] = [
  // Content bundles (per module)
  ...CONTENT_MODULES.map((mod) => ({
    id: `content:${mod}`,
    name: `Content ${mod}`,
    nameFa: `محتوای ${mod === "blog" ? "مجله" : mod === "news" ? "اخبار" : mod === "media" ? "رسانه" : mod === "timeline" ? "تایم‌لاین" : mod === "forum" ? "انجمن" : mod === "download" ? "دانلود" : "نقد و بررسی"}`,
    description: `دسترسی کامل به ماژول ${mod}`,
    category: "content",
    permissions: CONTENT_ACCESSES.map((a) => contentPerm(mod, a)),
  })),

  // Product bundles (per section)
  ...PRODUCT_SECTIONS.map((sec) => {
    const labels: Record<string, string> = {
      basic: "اطلاعات پایه", seo: "سئو", content: "محتوا", media: "ویدیو",
      download: "دانلود", review: "امتیاز", info: "اطلاعات محصول",
      price: "قیمت", specs: "مشخصات فنی", gallery: "گالری", status: "وضعیت", series: "مجموعه",
    };
    return {
      id: `product:${sec}`,
      name: `Product ${sec}`,
      nameFa: labels[sec] || sec,
      description: `دسترسی به بخش ${labels[sec] || sec} محصول`,
      category: "product",
      permissions: [
        productPerm(sec, "view"),
        productPerm(sec, "edit"),
      ],
    };
  }),

  // Product actions
  { id: "product:list", name: "Product List", nameFa: "لیست محصولات", description: "مشاهده لیست محصولات", category: "product", permissions: ["product:list:view"] },
  { id: "product:create", name: "Product Create", nameFa: "ایجاد محصول", description: "ایجاد محصول جدید", category: "product", permissions: ["product:create"] },
  { id: "product:delete", name: "Product Delete", nameFa: "حذف محصول", description: "حذف محصول", category: "product", permissions: ["product:delete"] },

  // Orders
  { id: "order:view", name: "Order View", nameFa: "مشاهده سفارشات", description: "مشاهده لیست و جزئیات سفارشات", category: "shop", permissions: ["order:list:view", "order:detail:view"] },
  { id: "order:manage", name: "Order Manage", nameFa: "مدیریت سفارشات", description: "تغییر وضعیت و مدیریت سفارشات", category: "shop", permissions: ["order:status:edit", "order:note:edit"] },

  // Consultations
  { id: "consultation:view", name: "Consultation View", nameFa: "مشاهده مشاوره‌ها", description: "مشاهده درخواست‌های مشاوره", category: "shop", permissions: ["consultation:view"] },
  { id: "consultation:manage", name: "Consultation Manage", nameFa: "مدیریت مشاوره‌ها", description: "مدیریت درخواست‌های مشاوره", category: "shop", permissions: ["consultation:manage"] },

  // Banners
  { id: "banner:view", name: "Banner View", nameFa: "مشاهده بنرها", description: "مشاهده بنرهای فروشگاه", category: "shop", permissions: ["banner:view"] },
  { id: "banner:edit", name: "Banner Edit", nameFa: "ویرایش بنرها", description: "ویرایش بنرهای فروشگاه", category: "shop", permissions: ["banner:edit"] },

  // Communication
  { id: "inbox", name: "Inbox", nameFa: "صندوق پیام‌ها", description: "مشاهده و پاسخ به پیام‌ها", category: "communication", permissions: ["inbox:view", "inbox:reply", "inbox:close"] },
  { id: "chat", name: "Chat Support", nameFa: "پشتیبانی چت", description: "پشتیبانی آنلاین چت", category: "communication", permissions: ["chat:view", "chat:support"] },
  { id: "comments", name: "Comments", nameFa: "دیدگاه‌ها", description: "مشاهده و مدیریت دیدگاه‌ها", category: "communication", permissions: ["comment:view", "comment:moderate"] },
  { id: "newsletter", name: "Newsletter", nameFa: "خبرنامه", description: "مدیریت و ارسال خبرنامه", category: "communication", permissions: ["newsletter:view", "newsletter:send", "newsletter:template"] },
  { id: "forum:moderate", name: "Forum Moderate", nameFa: "مدیریت انجمن", description: "مدیریت محتوای انجمن", category: "communication", permissions: ["forum:view", "forum:moderate"] },

  // User management
  { id: "users:view", name: "Users View", nameFa: "مشاهده کاربران", description: "مشاهده لیست کاربران", category: "users", permissions: ["user:list:view"] },
  { id: "users:edit", name: "Users Edit", nameFa: "ویرایش کاربران", description: "ویرایش پروفایل کاربران", category: "users", permissions: ["user:profile:edit", "user:password:reset"] },
  { id: "users:manage", name: "Users Manage", nameFa: "مدیریت کاربران", description: "مدیریت نقش‌ها و دسترسی‌ها", category: "users", permissions: ["user:role:assign", "user:ban"] },
  { id: "verification", name: "Verification", nameFa: "تایید هویت", description: "بررسی درخواست‌های تایید هویت", category: "users", permissions: ["verification:view", "verification:review"] },

  // Roles
  { id: "roles", name: "Roles", nameFa: "نقش‌ها", description: "مدیریت نقش‌ها و دسترسی‌ها", category: "users", permissions: ["role:view", "role:create", "role:edit", "role:delete"] },

  // Settings bundles (per section)
  ...SETTINGS_SECTIONS.map((sec) => {
    const labels: Record<string, string> = {
      comments: "دیدگاه‌ها", resume: "رزومه‌ها", email: "ایمیل", auth: "احراز هویت", price: "قیمت و ارز",
    };
    return {
      id: `settings:${sec}`,
      name: `Settings ${sec}`,
      nameFa: `تنظیمات ${labels[sec]}`,
      description: `دسترسی به تنظیمات ${labels[sec]}`,
      category: "settings",
      permissions: [settingsPerm(sec, "view"), settingsPerm(sec, "edit")],
    };
  }),

  // System
  { id: "modules", name: "Modules", nameFa: "ماژول‌ها", description: "مدیریت ماژول‌ها", category: "system", permissions: ["module:view", "module:edit"] },
  { id: "design", name: "Design", nameFa: "دیزاین سیستم", description: "مدیریت طراحی و رنگ‌ها", category: "system", permissions: ["design:view", "design:edit"] },
  { id: "hero", name: "Hero Terminal", nameFa: "ترمینال هیرو", description: "مدیریت ترمینال صفحه اصلی", category: "system", permissions: ["hero:view", "hero:edit"] },
  { id: "analytics", name: "Analytics", nameFa: "آمار و تحلیل", description: "مشاهده آمار و تحلیل‌ها", category: "system", permissions: ["analytics:view"] },
  { id: "seo", name: "SEO", nameFa: "ممیزی SEO", description: "مشاهده ممیزی SEO", category: "system", permissions: ["seo:view"] },
  { id: "health", name: "Content Health", nameFa: "سلامت محتوا", description: "مشاهده سلامت محتوا", category: "system", permissions: ["health:view"] },
  { id: "redirects", name: "Redirects", nameFa: "Redirectها", description: "مدیریت ریدایرکت‌ها", category: "system", permissions: ["redirect:view", "redirect:edit"] },
  { id: "faq", name: "FAQ", nameFa: "FAQ", description: "مدیریت پرسش‌های متداول", category: "system", permissions: ["faq:view", "faq:edit"] },
  { id: "holidays", name: "Holidays", nameFa: "تعطیلات", description: "مدیریت تعطیلات", category: "system", permissions: ["holiday:view", "holiday:edit"] },
  { id: "blob", name: "Blob Files", nameFa: "فایل‌های Blob", description: "مدیریت فایل‌ها", category: "system", permissions: ["blob:view", "blob:upload", "blob:delete"] },
  { id: "jobs", name: "Jobs", nameFa: "آگهی استخدام", description: "مدیریت آگهی‌های استخدام", category: "system", permissions: ["job:view", "job:edit", "job:applications"] },
  { id: "audit", name: "Audit Log", nameFa: "لاگ فعالیت‌ها", description: "مشاهده لاگ فعالیت‌ها", category: "system", permissions: ["audit:view"] },
  { id: "search", name: "Search Analytics", nameFa: "آمار جستجو", description: "مشاهده آمار جستجو", category: "system", permissions: ["search:view"] },
];

// ─── Sidebar Permission Mapping ──────────────────────────────────────────────

export type SidebarPermissionItem = {
  href: string;
  /** Permission required to see this item. null = always visible. */
  permission: string | null;
};

export const SIDEBAR_PERMISSIONS: SidebarPermissionItem[] = [
  // Always visible
  { href: "/admin", permission: null },

  // General
  { href: "/admin/analytics", permission: "analytics:view" },
  { href: "/admin/search-analytics", permission: "search:view" },

  // Content
  { href: "/admin/posts", permission: "content:*:view" },
  { href: "/admin/timeline", permission: "timeline:view" },
  { href: "/admin/newsletter", permission: "newsletter:view" },
  { href: "/admin/jobs", permission: "job:view" },

  // Shop
  { href: "/admin/orders", permission: "order:list:view" },
  { href: "/admin/consultations", permission: "consultation:view" },
  { href: "/admin/shop-banners", permission: "banner:view" },

  // Users
  { href: "/admin/users", permission: "user:list:view" },
  { href: "/admin/roles", permission: "role:view" },
  { href: "/admin/roles-v2", permission: "role:view" },
  { href: "/admin/moderation", permission: "comment:view" },
  { href: "/admin/verification", permission: "verification:view" },

  // Communication
  { href: "/admin/inbox", permission: "inbox:view" },

  // Settings
  { href: "/admin/modules", permission: "module:view" },
  { href: "/admin/settings", permission: "settings:*:view" },
  { href: "/admin/holidays", permission: "holiday:view" },
  { href: "/admin/redirects", permission: "redirect:view" },
  { href: "/admin/content-health", permission: "health:view" },
  { href: "/admin/seo-audit", permission: "seo:view" },
  { href: "/admin/faq", permission: "faq:view" },
  { href: "/admin/hero-terminal", permission: "hero:view" },

  // Tools
  { href: "/admin/blob", permission: "blob:view" },
  { href: "/admin/upload", permission: "blob:upload" },
  { href: "/admin/media", permission: "blob:view" },
  { href: "/admin/design-system", permission: "design:view" },
  { href: "/admin/audit-log", permission: "audit:view" },
];

// ─── Permission Checking ─────────────────────────────────────────────────────

/**
 * Check if a user has a specific permission.
 * Super_admin always returns true.
 *
 * Supports wildcards:
 *   hasPermission(perms, "content:blog:view") → checks exact match
 *   hasPermission(perms, "content:*:view")    → matches any module
 *   hasPermission(perms, "*:*:*")             → matches everything
 */
export function hasPermission(userPermissions: string[], required: string): boolean {
  // Super_admin check (if "*" is in permissions)
  if (userPermissions.includes("*") || userPermissions.includes("*:*:*")) return true;

  const [reqResource, reqSection, reqAccess] = required.split(":");

  for (const perm of userPermissions) {
    const [pResource, pSection, pAccess] = perm.split(":");

    // Exact match
    if (perm === required) return true;

    // Wildcard match on resource
    if (pResource === "*" && pSection === reqSection && pAccess === reqAccess) return true;

    // Wildcard match on section
    if (pResource === reqResource && pSection === "*" && pAccess === reqAccess) return true;

    // Wildcard match on both
    if (pResource === "*" && pSection === "*" && pAccess === reqAccess) return true;

    // Full wildcard
    if (pResource === "*" && pSection === "*" && pAccess === "*") return true;
  }

  return false;
}

/**
 * Check if a user has ANY of the given permissions.
 */
export function hasAnyPermission(userPermissions: string[], required: string[]): boolean {
  return required.some((perm) => hasPermission(userPermissions, perm));
}

/**
 * Get all permissions for a user from their roles.
 */
export function getUserPermissions(roles: Array<{ permissions: string[] }>): string[] {
  const perms = new Set<string>();
  for (const role of roles) {
    for (const p of role.permissions) {
      perms.add(p);
    }
  }
  return Array.from(perms);
}

/**
 * Get sidebar items visible to a user based on their permissions.
 */
export function getVisibleSidebarItems(userPermissions: string[]): Set<string> {
  const visible = new Set<string>();

  for (const item of SIDEBAR_PERMISSIONS) {
    if (!item.permission) {
      // No permission required — always visible
      visible.add(item.href);
    } else if (hasPermission(userPermissions, item.permission)) {
      visible.add(item.href);
    }
  }

  return visible;
}
