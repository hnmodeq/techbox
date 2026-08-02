/*
 * Upload the committed AI-generated development visuals to the configured
 * public Supabase bucket, then attach permanent storage URLs to the relevant
 * User and Post records.
 *
 * This never downloads or hotlinks images from social media or Google. It is
 * idempotent: the same storage paths are upserted and existing authored post
 * images are preserved. By default it syncs only the community portraits.
 * Pass --fill-content-covers only when intentionally applying the two shared
 * generated covers to blank legacy posts.
 *
 * Run locally, where .env contains DATABASE_URL, SUPABASE_URL, and
 * SUPABASE_SERVICE_ROLE_KEY:
 *   pnpm content:sync-visuals
 *   pnpm content:sync-visuals -- --fill-content-covers
 */
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  getSupabasePublicUrl,
  getSupabaseStorageConfig,
  uploadSupabaseObject,
} from "@/lib/supabase-storage";

function loadEnvFile(file: string) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    if (process.env[key]) continue;
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(path.resolve(".env"));
loadEnvFile(path.resolve(".env.local"));

const prisma = new PrismaClient();
const VISUALS_ROOT = path.resolve("public/seed-visuals");
const CUSTOM_IMAGES_ROOT = path.resolve("public/content-images");
const FILL_CONTENT_COVERS = process.argv.includes("--fill-content-covers");

const AVATARS = [
  "community_mahsa",
  "community_arash",
  "community_sara",
  "community_pouya",
  "community_elham",
  "community_milad",
  "community_nazanin",
  "community_reza",
] as const;

const COVERS = {
  infrastructure: "infrastructure.webp",
  network: "network.webp",
} as const;

/** User-supplied development images. The owner deliberately allowed an
 * arbitrary editorial assignment, so this map favours the visible Magazine
 * and News cards rather than implying a factual relationship. */
const CUSTOM_POST_IMAGES = [
  { module: "blog", slug: "runbook-design-for-small-ops-teams", file: "quantum-computing-lab.webp" },
  { module: "blog", slug: "capacity-planning-before-traffic-spike", file: "dug-nomad-exterior.webp" },
  { module: "blog", slug: "database-migration-rollback-notes", file: "dug-nomad-interior.webp" },
  { module: "blog", slug: "security-review-for-public-api", file: "broadcom-hba.webp" },
  { module: "blog", slug: "incident-review-without-blame", file: "ai-dome-camera.webp" },
  { module: "blog", slug: "choosing-slo-for-internal-services", file: "amd-epyc-server.webp" },
  { module: "blog", slug: "kubernetes-resource-request-review", file: "supermicro-server.webp" },
  { module: "blog", slug: "database-index-review-playbook", file: "large-scale-server.webp" },
  { module: "news", slug: "weekly-infrastructure-brief-observability", file: "hpe-proliant-server.webp" },
  { module: "news", slug: "weekly-infrastructure-brief-platform-teams", file: "solidigm-kvcache.webp" },
  { module: "news", slug: "weekly-infrastructure-brief-data-resilience", file: "seagate-ironwolf.webp" },
  { module: "news", slug: "weekly-infrastructure-brief-network-visibility", file: "dell-powerstore.webp" },
] as const;

function localVisual(...segments: string[]) {
  const file = path.join(VISUALS_ROOT, ...segments);
  if (!fs.existsSync(file)) throw new Error(`visual_source_missing:${file}`);
  return file;
}

function localContentImage(fileName: string) {
  const file = path.join(CUSTOM_IMAGES_ROOT, fileName);
  if (!fs.existsSync(file)) throw new Error(`content_image_missing:${file}`);
  return file;
}

async function uploadWebp(storagePath: string, localFile: string) {
  const config = getSupabaseStorageConfig();
  const bytes = fs.readFileSync(localFile);
  await uploadSupabaseObject({
    bucket: config.publicBucket,
    path: storagePath,
    body: new Blob([new Uint8Array(bytes)], { type: "image/webp" }),
    contentType: "image/webp",
    upsert: true,
  });
  return getSupabasePublicUrl(config.publicBucket, storagePath);
}

async function main() {
  // Fail early with a clear message before any database row is touched.
  getSupabaseStorageConfig();

  const avatarUrls = new Map<string, string>();
  for (const username of AVATARS) {
    const local = localVisual("avatars", `${username}.webp`);
    const url = await uploadWebp(`seed-visuals/avatars/${username}.webp`, local);
    avatarUrls.set(username, url);
  }

  let avatarUpdates = 0;
  for (const [username, avatar] of avatarUrls) {
    const result = await prisma.user.updateMany({
      where: { username },
      data: { avatar },
    });
    avatarUpdates += result.count;
  }

  console.log(`✓ uploaded ${avatarUrls.size} AI-generated profile portraits`);
  console.log(`✓ updated ${avatarUpdates} community profile rows`);

  let customImageUpdates = 0;
  for (const image of CUSTOM_POST_IMAGES) {
    const url = await uploadWebp(
      `user-content/${image.file}`,
      localContentImage(image.file),
    );
    const result = await prisma.post.updateMany({
      where: { module: image.module, slug: image.slug, published: true, deletedAt: null },
      data: { image: url },
    });
    customImageUpdates += result.count;
  }
  console.log(`✓ uploaded and linked ${customImageUpdates} user-supplied editorial images`);

  if (!FILL_CONTENT_COVERS) {
    console.log("· content covers were skipped — upload unique images through the Admin editor when ready");
    return;
  }

  const infrastructureUrl = await uploadWebp(
    `seed-visuals/covers/${COVERS.infrastructure}`,
    localVisual("covers", COVERS.infrastructure),
  );
  const networkUrl = await uploadWebp(
    `seed-visuals/covers/${COVERS.network}`,
    localVisual("covers", COVERS.network),
  );

  // Do not replace a real editorial image. Only missing rows and the retired
  // local fallback become generated covers, preserving any administrator work.
  const missingImage = {
    OR: [{ image: null }, { image: "" }, { image: "/assets/blog-1.jpg" }],
  };
  const publicPost = { published: true, deletedAt: null };
  const networkPosts = await prisma.post.updateMany({
    where: {
      ...publicPost,
      AND: [
        missingImage,
        { OR: [
          { category: { contains: "شبکه" } },
          { category: { contains: "وب" } },
          { tags: { array_contains: ["Network"] } },
          { tags: { array_contains: ["WireGuard"] } },
          { tags: { array_contains: ["DNS"] } },
        ] },
      ],
    },
    data: { image: networkUrl },
  });

  // `networkPosts` has already received its image, so this second query fills
  // every remaining blank public post with the neutral infrastructure cover.
  const infrastructurePosts = await prisma.post.updateMany({
    where: { ...publicPost, ...missingImage },
    data: { image: infrastructureUrl },
  });

  console.log(`✓ attached shared generated covers to ${networkPosts.count + infrastructurePosts.count} public posts without images`);
}

main()
  .catch((error) => {
    console.error("Visual sync failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
