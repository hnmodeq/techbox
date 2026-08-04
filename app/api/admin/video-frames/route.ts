import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/api-permissions";
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

export async function POST(req: NextRequest) {
  const user = await requirePermission("blob:upload");
  if (user instanceof NextResponse) return user;

  const limit = await checkRateLimit(`${user.id}:${getClientIp(req)}`, "upload");
  if (!limit.success) return NextResponse.json({ error: "too_many_requests" }, { status: 429 });

  const uploaded: string[] = [];
  try {
    const form = await req.formData();
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

    return NextResponse.json({ ok: true, urls, count: urls.length });
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
