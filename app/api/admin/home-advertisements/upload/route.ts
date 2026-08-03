import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/api-permissions";
import {
  getSupabasePublicUrl,
  getSupabaseStorageConfig,
  uploadSupabaseObject,
} from "@/lib/supabase-storage";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_ADVERTISEMENT_BYTES = 8 * 1024 * 1024;

function isWebP(bytes: Uint8Array) {
  if (bytes.byteLength < 12) return false;
  return (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

function safeBaseName(name: string) {
  const base = name.replace(/\\/g, "/").split("/").pop() || "advertisement";
  return base
    .replace(/\.webp$/i, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "advertisement";
}

export async function POST(req: NextRequest) {
  const user = await requirePermission("banner:edit");
  if (user instanceof NextResponse) return user;

  const limit = await checkRateLimit(`${user.id}:${getClientIp(req)}`, "upload");
  if (!limit.success) {
    return NextResponse.json(
      { error: "too_many_requests" },
      { status: 429, headers: cacheHeaders(PRIVATE_NO_STORE) },
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "file_required" },
        { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) },
      );
    }
    if (file.size <= 0 || file.size > MAX_ADVERTISEMENT_BYTES) {
      return NextResponse.json(
        { error: "file_too_large", maxSize: MAX_ADVERTISEMENT_BYTES },
        { status: 413, headers: cacheHeaders(PRIVATE_NO_STORE) },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    // MIME and extension are client-controlled; validate the actual RIFF/WebP
    // signature before an object reaches the WebP-only campaign folder.
    if (file.type !== "image/webp" || !/\.webp$/i.test(file.name) || !isWebP(bytes)) {
      return NextResponse.json(
        { error: "webp_required", message: "فقط فایل WebP پذیرفته می‌شود." },
        { status: 415, headers: cacheHeaders(PRIVATE_NO_STORE) },
      );
    }

    const { publicBucket } = getSupabaseStorageConfig();
    const fileName = `${safeBaseName(file.name)}-${randomUUID()}.webp`;
    const path = `advertisements/home/${fileName}`;

    await uploadSupabaseObject({
      bucket: publicBucket,
      path,
      body: new Blob([bytes], { type: "image/webp" }),
      contentType: "image/webp",
    });

    return NextResponse.json(
      {
        ok: true,
        path,
        url: getSupabasePublicUrl(publicBucket, path),
        contentType: "image/webp",
        size: file.size,
      },
      { headers: cacheHeaders(PRIVATE_NO_STORE) },
    );
  } catch {
    return NextResponse.json(
      { error: "advertisement_upload_failed" },
      { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) },
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
