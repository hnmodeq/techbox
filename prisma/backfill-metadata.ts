import { PrismaClient } from "@prisma/client";
import review from "./mock-data/review.json";
import download from "./mock-data/download.json";

const prisma = new PrismaClient();

async function main() {
  console.log("Backfilling review ratings and download metadata…");

  for (const item of review as any[]) {
    if (typeof item.rating !== "number") continue;
    await prisma.post.updateMany({
      where: { module: "review", slug: item.slug },
      data: {
        rating: item.rating,
        ratingCount: typeof item.ratingCount === "number" ? item.ratingCount : 0,
      },
    });
  }

  for (const item of download as any[]) {
    const data = {
      title: item.title,
      excerpt: item.excerpt || "",
      content: item.content || item.excerpt || "",
      image: item.image || null,
      tags: JSON.stringify(item.tags || []),
      category: item.category || null,
      authorName: item.author?.name || "تکباکس دانلود",
      date: item.date && !isNaN(Date.parse(item.date)) ? new Date(item.date) : new Date(),
      dateFa: item.date_fa || "",
      likes: item.likes || 0,
      views: item.views || 0,
      fileName: item.fileName || null,
      fileUrl: item.fileUrl || null,
      fileSize: item.fileSize || null,
      downloadCount: typeof item.downloadCount === "number" ? item.downloadCount : 0,
      published: true,
    };

    await prisma.post.upsert({
      where: { module_slug: { module: "download", slug: item.slug } },
      update: {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        // Do not overwrite existing downloadCount for existing rows.
      },
      create: {
        slug: item.slug,
        module: "download",
        ...data,
      },
    });
  }

  console.log("Backfill complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
