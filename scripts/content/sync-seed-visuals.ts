/*
 * Upload the committed AI-generated development visuals to the configured
 * public Supabase bucket, then attach permanent storage URLs to the relevant
 * User and Post records.
 *
 * This never downloads or hotlinks images from social media or Google. It is
 * idempotent: the same storage paths are upserted and existing authored post
 * images are preserved. Blank/legacy fallback post images receive a generated
 * infrastructure or network cover so every public card has a real URL.
 *
 * Run locally, where .env contains DATABASE_URL, SUPABASE_URL, and
 * SUPABASE_SERVICE_ROLE_KEY:
 *   pnpm content:sync-visuals
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
  infrastructure: "infrastructure.jpg",
  network: "network.jpg",
} as const;

function localVisual(...segments: string[]) {
  const file = path.join(VISUALS_ROOT, ...segments);
  if (!fs.existsSync(file)) throw new Error(`visual_source_missing:${file}`);
  return file;
}

async function uploadJpeg(storagePath: string, localFile: string) {
  const config = getSupabaseStorageConfig();
  const bytes = fs.readFileSync(localFile);
  await uploadSupabaseObject({
    bucket: config.publicBucket,
    path: storagePath,
    body: new Blob([new Uint8Array(bytes)], { type: "image/jpeg" }),
    contentType: "image/jpeg",
    upsert: true,
  });
  return getSupabasePublicUrl(config.publicBucket, storagePath);
}

async function main() {
  // Fail early with a clear message before any database row is touched.
  getSupabaseStorageConfig();

  const avatarUrls = new Map<string, string>();
  for (const username of AVATARS) {
    const local = localVisual("avatars", `${username}.jpg`);
    const url = await uploadJpeg(`seed-visuals/avatars/${username}.jpg`, local);
    avatarUrls.set(username, url);
  }

  const infrastructureUrl = await uploadJpeg(
    `seed-visuals/covers/${COVERS.infrastructure}`,
    localVisual("covers", COVERS.infrastructure),
  );
  const networkUrl = await uploadJpeg(
    `seed-visuals/covers/${COVERS.network}`,
    localVisual("covers", COVERS.network),
  );

  let avatarUpdates = 0;
  for (const [username, avatar] of avatarUrls) {
    const result = await prisma.user.updateMany({
      where: { username },
      data: { avatar },
    });
    avatarUpdates += result.count;
  }

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

  console.log(`✓ uploaded ${avatarUrls.size} AI-generated profile portraits and 2 editorial covers`);
  console.log(`✓ updated ${avatarUpdates} community profile rows`);
  console.log(`✓ attached generated covers to ${networkPosts.count + infrastructurePosts.count} public posts without images`);
}

main()
  .catch((error) => {
    console.error("Visual sync failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
