import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";
import { requireModulePermission, requirePermission } from "@/lib/api-permissions";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getSupabasePublicUrl,
  getSupabaseStorageConfig,
  removeSupabaseObjects,
  uploadSupabaseObject,
} from "@/lib/supabase-storage";

const MIN_FRAMES = 10;
const MAX_FRAMES = 12;
const MAX_FRAME_SIZE = 1.5 * 1024 * 1024;

function isWebP(bytes: Uint8Array) {
  return bytes.length >= 12
    && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
    && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
}

function formatVideoDuration(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export async function POST(req: NextRequest) {
  const user = await requirePermission("blob:upload");
  if (user instanceof NextResponse) return user;

  const limit = await checkRateLimit(`${user.id}:${getClientIp(req)}`, "upload");
  if (!limit.success) return NextResponse.json({ error: "too_many_requests" }, { status: 429 });

  const uploaded: string[] = [];
  try {
    const form = await req.formData();
    const mediaSlugValue = form.get("mediaSlug");
    const mediaSlug = typeof mediaSlugValue === "string" ? mediaSlugValue.trim() : "";
    const durationValue = form.get("durationSeconds");
    const durationSeconds = typeof durationValue === "string" ? Number(durationValue) : NaN;

    // When a slug is supplied this batch is a backfill for an existing Media
    // post. It needs both storage-upload and Media-edit authority; the upload
    // is persisted here so a failed DB write can clean up all ten objects.
    let existingMedia: { id: string; slug: string; title: string; videoUrl: string | null; deletedAt: Date | null } | null = null;
    if (mediaSlug) {
      if (mediaSlug.length > 200) {
        return NextResponse.json({ error: "invalid_media_slug" }, { status: 400 });
      }
      const editor = await requireModulePermission("media", "edit");
      if (editor instanceof NextResponse) return editor;
      existingMedia = await prisma.post.findUnique({
        where: { module_slug: { module: "media", slug: mediaSlug } },
        select: { id: true, slug: true, title: true, videoUrl: true, deletedAt: true },
      });
      if (!existingMedia || existingMedia.deletedAt) return NextResponse.json({ error: "media_post_not_found" }, { status: 404 });
      if (!existingMedia.videoUrl) return NextResponse.json({ error: "media_video_missing" }, { status: 422 });
    }

    const frames = form.getAll("frames").filter((value): value is File => value instanceof File);
    if (frames.length < MIN_FRAMES || frames.length > MAX_FRAMES) {
      return NextResponse.json({ error: "ten_to_twelve_frames_required" }, { status: 400 });
    }

    // Validate the entire batch before writing the first object, so a bad
    // tenth frame cannot leave nine unreferenced objects behind.
    const payloads: File[] = [];
    for (const frame of frames) {
      if (frame.size <= 0 || frame.size > MAX_FRAME_SIZE || frame.type !== "image/webp") {
        return NextResponse.json({ error: "invalid_storyboard_frame" }, { status: 415 });
      }
      const bytes = new Uint8Array(await frame.arrayBuffer());
      if (!isWebP(bytes)) return NextResponse.json({ error: "invalid_storyboard_frame" }, { status: 415 });
      payloads.push(frame);
    }

    const { publicBucket } = getSupabaseStorageConfig();
    const folder = `videos/storyboards/${randomUUID()}`;
    const urls: string[] = [];
    for (let index = 0; index < payloads.length; index += 1) {
      const path = `${folder}/frame-${String(index + 1).padStart(2, "0")}.webp`;
      await uploadSupabaseObject({
        bucket: publicBucket,
        path,
        body: payloads[index],
        contentType: "image/webp",
      });
      uploaded.push(path);
      urls.push(getSupabasePublicUrl(publicBucket, path));
    }

    if (existingMedia) {
      await prisma.post.update({
        where: { id: existingMedia.id },
        data: {
          gallery: urls,
          ...(Number.isFinite(durationSeconds) && durationSeconds > 0
            ? { videoDuration: formatVideoDuration(durationSeconds) }
            : {}),
        },
      });
      revalidateTag("home-data", "max");
      revalidatePath("/");
      revalidatePath("/media");
      revalidatePath(`/media/${existingMedia.slug}`);
      logAudit({
        userId: user.id,
        userName: user.name,
        action: "media.storyboard.backfill",
        target: `media/${existingMedia.slug}`,
        details: { frames: urls.length },
      });
    }

    return NextResponse.json({
      ok: true,
      urls,
      count: urls.length,
      persisted: Boolean(existingMedia),
    });
  } catch {
    try {
      const { publicBucket } = getSupabaseStorageConfig();
      await removeSupabaseObjects(publicBucket, uploaded);
    } catch {}
    return NextResponse.json({ error: "storyboard_upload_failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
