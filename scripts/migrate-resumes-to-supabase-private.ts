import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import {
  getSupabaseStorageConfig,
  makePrivateStorageRef,
  removeSupabaseObjects,
  uploadSupabaseObject,
} from "@/lib/supabase-storage";

function parsePublicObject(value: string) {
  try {
    const config = getSupabaseStorageConfig();
    const url = new URL(value);
    if (url.hostname !== new URL(config.url).hostname) return null;
    const prefix = `/storage/v1/object/public/${config.publicBucket}/`;
    if (!url.pathname.startsWith(prefix)) return null;
    return { bucket: config.publicBucket, path: decodeURIComponent(url.pathname.slice(prefix.length)) };
  } catch {
    return null;
  }
}

function safeName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 100) || "resume";
}

async function main() {
  const config = getSupabaseStorageConfig();
  const applications = await prisma.jobApplication.findMany({
    where: { resumePath: { startsWith: "http" } },
    include: { job: { select: { slug: true } } },
  });
  let migrated = 0;
  let skipped = 0;

  for (const application of applications) {
    const source = parsePublicObject(application.resumePath);
    if (!source) {
      console.warn(`SKIP ${application.id}: not an active Supabase public URL`);
      skipped += 1;
      continue;
    }
    const response = await fetch(application.resumePath, { cache: "no-store" });
    if (!response.ok) {
      console.warn(`SKIP ${application.id}: source returned ${response.status}`);
      skipped += 1;
      continue;
    }
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const body = new Blob([await response.arrayBuffer()], { type: contentType });
    const privatePath = `${application.job.slug}/${randomUUID()}-${safeName(application.resumeName)}`;
    await uploadSupabaseObject({
      bucket: config.privateBucket,
      path: privatePath,
      body,
      contentType,
    });
    await prisma.jobApplication.update({
      where: { id: application.id },
      data: { resumePath: makePrivateStorageRef(config.privateBucket, privatePath) },
    });
    await removeSupabaseObjects(source.bucket, [source.path]).catch((error) => {
      console.warn(`WARN ${application.id}: private copy active, but public source deletion failed`, error);
    });
    migrated += 1;
    console.log(`OK ${application.id}`);
  }

  console.log(`Migrated ${migrated}; skipped ${skipped}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
