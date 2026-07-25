import { prisma } from "@/lib/db";
import {
  getSupabaseStorageConfig,
  removeSupabaseObjects,
} from "@/lib/supabase-storage";

const APPLY = process.argv.includes("--apply");

const TARGETS = [
  { module: "review", slug: "review-01" },
  { module: "media", slug: "media-video-3-switching-vlan-lab" },
  { module: "download", slug: "archive-pdf-1" },
  { module: "download", slug: "archive-pdf-2" },
  { module: "download", slug: "archive-zip-1" },
] as const;

function parseOwnedPublicObject(value: string | null | undefined) {
  if (!value) return null;
  try {
    const config = getSupabaseStorageConfig();
    const url = new URL(value);
    if (url.hostname !== new URL(config.url).hostname) return null;
    const prefix = `/storage/v1/object/public/${config.publicBucket}/`;
    if (!url.pathname.startsWith(prefix)) return null;
    return {
      bucket: config.publicBucket,
      path: decodeURIComponent(url.pathname.slice(prefix.length)),
    };
  } catch {
    return null;
  }
}

async function main() {
  const posts = await prisma.post.findMany({
    where: { OR: TARGETS.map((target) => ({ module: target.module, slug: target.slug })) },
    select: {
      id: true,
      module: true,
      slug: true,
      title: true,
      image: true,
      videoUrl: true,
      fileUrl: true,
      gallery: true,
    },
  });

  console.log(`Requested ${TARGETS.length} removals; found ${posts.length} posts.`);
  for (const target of TARGETS) {
    const found = posts.find((post) => post.module === target.module && post.slug === target.slug);
    console.log(`${found ? "FOUND" : "ALREADY ABSENT"} ${target.module}/${target.slug}${found ? ` — ${found.title}` : ""}`);
  }
  if (!APPLY) {
    console.log("Dry run only. Re-run with --apply to delete these records and owned storage objects.");
    return;
  }

  const keys = TARGETS.map((target) => `${target.module}:${target.slug}`);
  await prisma.$transaction(async (tx) => {
    await tx.like.deleteMany({
      where: { OR: TARGETS.map((target) => ({ module: target.module, slug: target.slug })) },
    });
    await tx.savedContent.deleteMany({
      where: { OR: TARGETS.map((target) => ({ module: target.module, slug: target.slug })) },
    });
    await tx.slugRedirect.deleteMany({
      where: {
        OR: [
          ...TARGETS.map((target) => ({ sourceModule: target.module, sourceSlug: target.slug })),
          ...TARGETS.map((target) => ({ targetModule: target.module, targetSlug: target.slug })),
        ],
      },
    });
    await tx.post.deleteMany({ where: { id: { in: posts.map((post) => post.id) } } });
    await tx.auditLog.create({
      data: {
        userName: "retired-content cleanup",
        action: "content.hard_delete.batch",
        target: keys.join(","),
        details: JSON.stringify({ requested: TARGETS, deletedPostIds: posts.map((post) => post.id) }),
      },
    });
  });

  const objects = new Map<string, Set<string>>();
  const addObject = (value: string | null | undefined) => {
    const object = parseOwnedPublicObject(value);
    if (!object) return;
    const paths = objects.get(object.bucket) || new Set<string>();
    paths.add(object.path);
    objects.set(object.bucket, paths);
  };

  for (const post of posts) {
    addObject(post.image);
    addObject(post.videoUrl);
    addObject(post.fileUrl);
    if (Array.isArray(post.gallery)) {
      for (const value of post.gallery) {
        if (typeof value === "string") addObject(value);
      }
    }
  }

  // Explicitly remove the retired VLAN thumbnail even if its DB reference was
  // changed between the storage audit and this cleanup.
  try {
    const { publicBucket } = getSupabaseStorageConfig();
    const paths = objects.get(publicBucket) || new Set<string>();
    paths.add("thumbnails/thumbnail13.webp");
    objects.set(publicBucket, paths);
  } catch {
    // DB cleanup still succeeds when storage is temporarily unconfigured.
  }

  for (const [bucket, paths] of objects) {
    const values = [...paths];
    for (let index = 0; index < values.length; index += 100) {
      await removeSupabaseObjects(bucket, values.slice(index, index + 100)).catch((error) => {
        console.warn(`Storage cleanup failed for ${bucket}; database records are already removed.`, error);
      });
    }
  }

  console.log(`Deleted ${posts.length} posts and cleaned ${[...objects.values()].reduce((sum, paths) => sum + paths.size, 0)} storage references.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
