import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const superAdmin = await prisma.user.findFirst({
    where: { role: "super_admin" },
  });
  const authorId = superAdmin?.id || "fallback-id";

  // Create news within the last 24 hours
  const now = new Date();
  
  await prisma.post.create({
    data: {
      module: "news",
      slug: "techbox-new-ai-features",
      title: "معرفی قابلیت‌های جدید هوش مصنوعی در تکباکس",
      excerpt: "تکباکس رسماً از قابلیت‌های هوشمند و یکپارچه جدید خود رونمایی کرد که به کاربران اجازه می‌دهد سریع‌تر از همیشه به پاسخ‌های خود برسند.",
      content: "این یک خبر آزمایشی است که در ۲۴ ساعت گذشته منتشر شده است.",
      image: "https://rastaak.co/images/blog/blog-1.jpg",
      published: true,
      authorId: authorId,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    }
  });

  await prisma.post.create({
    data: {
      module: "news",
      slug: "nvidia-new-gpu-release",
      title: "انویدیا از نسل جدید پردازنده‌های گرافیکی سرور پرده برداشت",
      excerpt: "پردازنده‌های جدید با مصرف انرژی کمتر و قدرت پردازشی دو برابر، تحولی عظیم در دیتاسنترها ایجاد خواهند کرد.",
      content: "این یک خبر آزمایشی است که در ۲۴ ساعت گذشته منتشر شده است.",
      image: "https://rastaak.co/images/blog/blog-2.jpg",
      published: true,
      authorId: authorId,
      createdAt: new Date(now.getTime() - 15 * 60 * 60 * 1000), // 15 hours ago
      updatedAt: new Date(now.getTime() - 15 * 60 * 60 * 1000),
    }
  });

  console.log("Successfully seeded 2 recent news posts.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
