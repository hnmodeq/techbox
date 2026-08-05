import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { getSupabasePublicUrl, getSupabaseStorageConfig, uploadSupabaseObject } from "@/lib/supabase-storage";
import { DRIVE_CATALOG } from "./drive-catalog";
import { DEFAULT_HOME_ADVERTISEMENTS, parseHomeAdvertisements, type HomeAdvertisement } from "@/features/home/lib/home-advertisements";

function contentType(fileName: string) {
  return fileName.endsWith(".gif") ? "image/gif" : "image/webp";
}

async function upload(localPath: string, storagePath: string) {
  const bytes = new Uint8Array(await fs.readFile(path.join(process.cwd(), localPath)));
  const type = contentType(localPath);
  await uploadSupabaseObject({
    bucket: getSupabaseStorageConfig().publicBucket,
    path: storagePath,
    body: new Blob([bytes], { type }),
    contentType: type,
    upsert: true,
  });
  return getSupabasePublicUrl(getSupabaseStorageConfig().publicBucket, storagePath);
}

async function main() {
  if (process.env.SITE_VISUALS_CONFIRM !== "yes") throw new Error("Set SITE_VISUALS_CONFIRM=yes");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

  // Replace all drive family visuals with true alpha-channel WebP assets.
  const driveUrls = new Map<string, string>();
  for (const fileName of new Set(DRIVE_CATALOG.map((item) => item.imageFile))) {
    driveUrls.set(fileName, await upload(
      `public/assets/shop/drives/${fileName}`,
      `shop/drives/${fileName}`,
    ));
  }
  for (const item of DRIVE_CATALOG) {
    const image = driveUrls.get(item.imageFile)!;
    await prisma.post.updateMany({
      where: { module: "shop", slug: item.slug },
      data: { image, gallery: [image] },
    });
  }

  // Keep uploaded owner artwork available in Storage even though transparent
  // UI decorations also ship locally for zero-latency rendering.
  for (const fileName of ["raid-calculator.webp", "nas-selector.webp", "nvr-selector.webp", "subnet-calculator.webp", "ups-calculator.webp"]) {
    await upload(`public/assets/home/tools-transparent/${fileName}`, `tools/home-transparent/${fileName}`);
  }
  for (const fileName of ["consultation.webp", "website-info.webp"]) {
    await upload(`public/assets/home/decorations/${fileName}`, `decorations/home/${fileName}`);
  }

  const topUrl = await upload("public/assets/advertisements/site/ad-banner.gif", "advertisements/site/ad-banner.gif");
  const sidebarOneUrl = await upload("public/assets/advertisements/site/sidebar-ad-1.webp", "advertisements/site/sidebar-ad-1.webp");
  const sidebarTwoUrl = await upload("public/assets/advertisements/site/sidebar-ad-2.webp", "advertisements/site/sidebar-ad-2.webp");

  const setting = await prisma.siteSetting.findUnique({ where: { key: "home.advertisements" } });
  const current = setting ? parseHomeAdvertisements(setting.value) : DEFAULT_HOME_ADVERTISEMENTS;
  const replacements: HomeAdvertisement[] = [
    { id: "site-top-campaign", image: topUrl, alt: "پیشنهاد ویژه بالای سایت", section: "siteTop", enabled: true, order: 8, version: 1 },
    { id: "sidebar-primary", image: sidebarOneUrl, alt: "تبلیغ خدمات اینترنت پرسرعت", section: "sidebarPrimary", enabled: true, order: 9, version: 1 },
    { id: "sidebar-secondary", image: sidebarTwoUrl, alt: "تبلیغ سرورهای ابری و اختصاصی", section: "sidebarSecondary", enabled: true, order: 10, version: 1 },
  ];
  const replacementIds = new Set(replacements.map((item) => item.id));
  const merged = [
    ...current.filter((item) => !replacementIds.has(item.id)),
    ...replacements,
  ].map((item, order) => ({ ...item, order }));

  await prisma.siteSetting.upsert({
    where: { key: "home.advertisements" },
    update: { value: JSON.stringify(merged) },
    create: { key: "home.advertisements", value: JSON.stringify(merged) },
  });

  console.log(JSON.stringify({ driveImages: driveUrls.size, advertisements: replacements.map((item) => item.image), totalAds: merged.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
