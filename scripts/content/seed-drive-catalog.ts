import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { getSupabasePublicUrl, getSupabaseStorageConfig, uploadSupabaseObject } from "@/lib/supabase-storage";
import { DRIVE_CATALOG } from "./drive-catalog";

function isWebP(bytes: Uint8Array) {
  return bytes.length >= 12
    && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
    && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
}

async function main() {
  if (process.env.DRIVE_CATALOG_CONFIRM !== "yes") {
    throw new Error("Set DRIVE_CATALOG_CONFIRM=yes to write the drive catalogue.");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const { publicBucket } = getSupabaseStorageConfig();
  const imageUrls = new Map<string, string>();
  for (const imageFile of new Set(DRIVE_CATALOG.map((item) => item.imageFile))) {
    const localPath = path.join(process.cwd(), "public", "assets", "shop", "drives", imageFile);
    const bytes = new Uint8Array(await fs.readFile(localPath));
    if (!isWebP(bytes)) throw new Error(`${imageFile} is not a real WebP file.`);
    const storagePath = `shop/drives/${imageFile}`;
    await uploadSupabaseObject({
      bucket: publicBucket,
      path: storagePath,
      body: new Blob([bytes], { type: "image/webp" }),
      contentType: "image/webp",
      upsert: true,
    });
    imageUrls.set(imageFile, getSupabasePublicUrl(publicBucket, storagePath));
  }

  const date = new Date();
  const dateFa = new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(date);
  for (const item of DRIVE_CATALOG) {
    const image = imageUrls.get(item.imageFile);
    if (!image) throw new Error(`Missing uploaded image for ${item.slug}`);
    const data = {
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      image,
      gallery: [image],
      tags: item.tags,
      category: item.category,
      seoTitle: `${item.title} | فروشگاه درایو تکباکس`,
      seoDescription: item.excerpt,
      brand: item.brand,
      model: item.model,
      sku: item.sku,
      sourcePriceAmount: item.sourcePriceAmount,
      sourceCurrency: item.sourceCurrency,
      priceAdjustmentPercent: item.priceAdjustmentPercent,
      sellerBenefitPercent: item.sellerBenefitPercent,
      availability: item.availability,
      warranty: item.warranty,
      specs: item.specs,
      authorName: "فروشگاه تکباکس",
      published: true,
      status: "published",
      deletedAt: null,
    } as const;

    await prisma.post.upsert({
      where: { module_slug: { module: "shop", slug: item.slug } },
      update: data,
      create: {
        ...data,
        module: "shop",
        slug: item.slug,
        date,
        dateFa,
      },
    });
  }

  const grouped = await prisma.post.groupBy({
    by: ["category"],
    where: {
      module: "shop",
      category: { in: ["Enterprise HDD", "Enterprise SSD"] },
      published: true,
      deletedAt: null,
    },
    _count: { _all: true },
  });
  console.log(JSON.stringify({ uploadedImages: imageUrls.size, upserted: DRIVE_CATALOG.length, grouped }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
