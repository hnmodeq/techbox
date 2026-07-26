/**
 * Upload IT-timeline images to Supabase and link each TimelineEvent.
 *
 * Images are sourced from Wikimedia Commons under public-domain or CC
 * licences, converted to WebP locally, then uploaded to the same
 * `timeline-images/` folder the admin uploader writes to. Nothing is
 * hardcoded into the app — every event ends up with a normal DB row that
 * an admin can change or replace from /admin/timeline.
 *
 * Attribution for each image is stored on the event's `tags` so the
 * credit travels with the record rather than living in a script.
 *
 * Usage:
 *   pnpm exec tsx scripts/content/upload-timeline-images.ts            # dry run
 *   pnpm exec tsx scripts/content/upload-timeline-images.ts --apply
 */
import fs from "node:fs";

// tsx does not load .env the way next does; load it so SUPABASE_* resolve.
for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
import path from "node:path";
import { prisma } from "../checks/_shared";
import { uploadSupabaseObject, getSupabaseStorageConfig, getSupabasePublicUrl } from "@/lib/supabase-storage";

const APPLY = process.argv.includes("--apply");
const SRC_DIR = process.env.TIMELINE_IMG_DIR || "/tmp/itl-webp";
const MANIFEST = process.env.TIMELINE_MANIFEST || "/tmp/itl-webp/manifest.json";

type Entry = { year: string; file: string; title: string; license: string; artist: string; descurl: string };

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

async function main() {
  const cfg = getSupabaseStorageConfig();
  const manifest: Entry[] = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

  console.log(`${APPLY ? "APPLY" : "DRY RUN"} — bucket "${cfg.publicBucket}", ${manifest.length} images\n`);

  let linked = 0;
  for (const e of manifest) {
    const event = await prisma.timelineEvent.findFirst({
      where: { year: Number(e.year), published: true },
      select: { id: true, title: true, image: true, tags: true },
    });
    if (!event) {
      console.log(`  ! ${e.year}: no published event for that year — skipped`);
      continue;
    }

    const local = path.join(SRC_DIR, e.file);
    if (!fs.existsSync(local)) {
      console.log(`  ! ${e.year}: ${e.file} missing locally — skipped`);
      continue;
    }

    const storagePath = `timeline-images/${e.file}`;
    const credit = `${stripHtml(e.artist)} · ${e.license}`;

    console.log(`  ${e.year}  ${event.title.slice(0, 34).padEnd(34)} ← ${e.file}`);
    console.log(`         ${credit}`);

    if (!APPLY) continue;

    const buf = fs.readFileSync(local);
    await uploadSupabaseObject({
      bucket: cfg.publicBucket,
      path: storagePath,
      body: new Blob([new Uint8Array(buf)], { type: "image/webp" }),
      contentType: "image/webp",
      upsert: true,
    });
    const publicUrl = getSupabasePublicUrl(cfg.publicBucket, storagePath);

    // Keep the existing tags and append the credit, so attribution lives
    // with the record instead of only in this script.
    const existing = Array.isArray(event.tags) ? (event.tags as string[]) : [];
    const tags = [...new Set([...existing, `عکس: ${credit}`])].slice(0, 8);

    await prisma.timelineEvent.update({
      where: { id: event.id },
      data: { image: publicUrl, tags: tags as unknown as object },
    });
    linked++;
  }

  console.log(`\n${APPLY ? `✔ linked ${linked} events` : "dry run complete — re-run with --apply"}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("upload failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
