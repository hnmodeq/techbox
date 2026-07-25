import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_ROLES = [
  {
    name: "super_admin",
    nameFa: "مدیر کل",
    description: "دسترسی کامل به تمام بخش‌ها",
    permissions: ["*"],
    isSystem: true,
    color: "#ef4444",
  },
  {
    name: "content_writer",
    nameFa: "تولید محتوا",
    description: "نوشتن مقالات، اخبار، ویدیو، تایم‌لاین، انجمن، دانلود، نقد و بررسی",
    permissions: [
      "content:blog:view", "content:blog:create", "content:blog:edit", "content:blog:delete", "content:blog:publish",
      "content:news:view", "content:news:create", "content:news:edit", "content:news:delete", "content:news:publish",
      "content:media:view", "content:media:create", "content:media:edit", "content:media:upload",
      "content:timeline:view", "content:timeline:create", "content:timeline:edit", "content:timeline:delete",
      "content:forum:view", "content:forum:create", "content:forum:edit",
      "content:download:view", "content:download:create", "content:download:edit",
      "content:review:view", "content:review:create", "content:review:edit",
      "blob:upload",
    ],
    isSystem: false,
    color: "#3b82f6",
  },
  {
    name: "product_manager",
    nameFa: "مدیر محصولات",
    description: "مدیریت محصولات، مشخصات فنی و گالری",
    permissions: [
      "product:list:view", "product:create",
      "product:basic:view", "product:basic:edit",
      "product:seo:view", "product:seo:edit",
      "product:content:view", "product:content:edit",
      "product:media:view", "product:media:edit",
      "product:download:view", "product:download:edit",
      "product:review:view", "product:review:edit",
      "product:info:view", "product:info:edit",
      "product:specs:view", "product:specs:edit",
      "product:gallery:view", "product:gallery:edit",
      "product:status:view", "product:status:edit",
      "product:series:view", "product:series:edit",
      "blob:upload",
    ],
    isSystem: false,
    color: "#22c55e",
  },
  {
    name: "price_manager",
    nameFa: "مدیر قیمت‌ها",
    description: "مدیریت قیمت‌ها، نرخ ارز و تخفیف‌ها",
    permissions: [
      "product:list:view",
      "product:price:view", "product:price:edit",
      "settings:price:view", "settings:price:edit",
    ],
    isSystem: false,
    color: "#f59e0b",
  },
  {
    name: "order_manager",
    nameFa: "مدیر سفارشات",
    description: "مدیریت سفارشات و مشاوره‌ها",
    permissions: [
      "order:list:view", "order:detail:view", "order:status:edit", "order:note:edit",
      "consultation:view", "consultation:manage",
    ],
    isSystem: false,
    color: "#8b5cf6",
  },
  {
    name: "support_agent",
    nameFa: "پشتیبانی",
    description: "پاسخ به تیکت‌ها و پشتیبانی آنلاین",
    permissions: [
      "inbox:view", "inbox:reply", "inbox:close",
      "chat:view", "chat:support",
    ],
    isSystem: false,
    color: "#06b6d4",
  },
  {
    name: "moderator",
    nameFa: "مدیر اجتماعی",
    description: "مدیریت دیدگاه‌ها و انجمن",
    permissions: [
      "comment:view", "comment:moderate",
      "forum:view", "forum:moderate",
      "user:list:view",
    ],
    isSystem: false,
    color: "#ec4899",
  },
  {
    name: "analyst",
    nameFa: "تحلیلگر",
    description: "مشاهده آمار و تحلیل‌ها",
    permissions: [
      "analytics:view",
      "seo:view",
      "health:view",
      "search:view",
    ],
    isSystem: false,
    color: "#14b8a6",
  },
  {
    name: "designer",
    nameFa: "طراح",
    description: "مدیریت طراحی، رنگ‌ها و ماژول‌ها",
    permissions: [
      "design:view", "design:edit",
      "module:view", "module:edit",
      "hero:view", "hero:edit",
    ],
    isSystem: false,
    color: "#a855f7",
  },
  {
    name: "social_manager",
    nameFa: "مدیر شبکه‌های اجتماعی",
    description: "مدیریت دیدگاه‌ها، خبرنامه و انجمن",
    permissions: [
      "comment:view", "comment:moderate",
      "newsletter:view", "newsletter:send", "newsletter:template",
      "forum:view", "forum:moderate",
    ],
    isSystem: false,
    color: "#f97316",
  },
  {
    name: "sales_specialist",
    nameFa: "کارشناس فروش",
    description: "مشاهده محصولات و سفارشات (فقط خواندنی)",
    permissions: [
      "product:list:view",
      "product:basic:view", "product:info:view", "product:price:view", "product:specs:view",
      "order:list:view", "order:detail:view",
      "consultation:view",
    ],
    isSystem: false,
    color: "#84cc16",
  },
];

async function main() {
  console.log("Seeding roles...");

  for (const roleData of DEFAULT_ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        nameFa: roleData.nameFa,
        description: roleData.description,
        permissions: roleData.permissions,
        isSystem: roleData.isSystem,
        color: roleData.color,
      },
      create: roleData,
    });
    console.log(`  ✓ Synced role "${role.name}" (${role.nameFa})`);
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
