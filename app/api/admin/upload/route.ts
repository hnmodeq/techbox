import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/api-permissions";
import {
  getSupabasePublicUrl,
  getSupabaseStorageConfig,
  uploadSupabaseObject,
} from "@/lib/supabase-storage";
import { captureUploadError } from "@/lib/sentry";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_SIZE_BY_KIND: Record<string, number> = {
  image: 5 * 1024 * 1024,      // 5MB
  avatar: 2 * 1024 * 1024,     // 2MB
  video: 50 * 1024 * 1024,     // 50MB
  download: 100 * 1024 * 1024, // 100MB
  file: 20 * 1024 * 1024,      // 20MB
};

const ALLOWED_BY_KIND: Record<string, RegExp[]> = {
  image: [/^image\/(jpeg|png|webp|gif)$/],
  avatar: [/^image\/(jpeg|png|webp)$/],
  video: [/^video\/(mp4|webm|quicktime)$/],
  download: [
    /^application\/(pdf|zip|x-zip-compressed|vnd\.rar|x-7z-compressed|x-iso9660-image|msi|vnd\.microsoft\.portable-executable|octet-stream)$/,
  ],
  // "file" is the generic fallback — allow common document/image/video binaries
  // but NOT bare text/* (would permit active HTML/JavaScript in public storage)
  // and NOT bare application/* (would permit application/javascript etc.).
  file: [
    /^image\//,
    /^video\//,
    /^application\/(pdf|zip|x-zip-compressed|vnd\.rar|x-7z-compressed|octet-stream|json|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.presentationml\.presentation)$/,
  ],
};

function sanitizeSegment(value: string) {
  return value
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9/_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .slice(0, 160);
}

function sanitizeFileName(value: string) {
  const fallback = "upload.bin";
  const clean = value
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    ?.replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .slice(0, 120);
  return clean || fallback;
}

function inferKind(contentType: string, explicitKind: string | null) {
  if (explicitKind && MAX_SIZE_BY_KIND[explicitKind]) return explicitKind;
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  return "file";
}

function allowed(contentType: string, kind: string) {
  const rules = ALLOWED_BY_KIND[kind] || ALLOWED_BY_KIND.file;
  return rules.some((rule) => rule.test(contentType));
}

function defaultFolder(kind: string) {
  switch (kind) {
    case "avatar": return "avatars";
    case "video": return "videos";
    case "download": return "archive/uploads";
    case "image": return "uploads/images";
    default: return "uploads/files";
  }
}

export async function POST(req: NextRequest) {
  const user = await requirePermission("blob:upload");
  if (user instanceof NextResponse) return user;

  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(`${user.id}:${ip}`, "upload");

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد آپلودها بیش از حد مجاز است." },
      { status: 429 }
    );
  }

  let fileNameForError: string | undefined;

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file_required" }, { status: 400 });
    }
    fileNameForError = file.name;

    const contentType = file.type || "application/octet-stream";
    const kind = inferKind(contentType, String(form.get("kind") || ""));
    const maxSize = MAX_SIZE_BY_KIND[kind] || MAX_SIZE_BY_KIND.file;

    if (file.size > maxSize) {
      return NextResponse.json({ error: "file_too_large", maxSize, size: file.size }, { status: 413 });
    }
    if (!allowed(contentType, kind)) {
      return NextResponse.json({ error: "unsupported_file_type", contentType, kind }, { status: 415 });
    }

    const folder = sanitizeSegment(String(form.get("folder") || "")) || defaultFolder(kind);
    const originalName = sanitizeFileName(file.name);
    const dot = originalName.lastIndexOf(".");
    const baseName = (dot > 0 ? originalName.slice(0, dot) : originalName).slice(0, 80);
    const extension = dot > 0 ? originalName.slice(dot).toLowerCase() : "";
    const fileName = `${baseName}-${randomUUID()}${extension}`;
    const pathname = `${folder}/${fileName}`;
    const { publicBucket } = getSupabaseStorageConfig();

    await uploadSupabaseObject({
      bucket: publicBucket,
      path: pathname,
      body: file,
      contentType,
    });
    const url = getSupabasePublicUrl(publicBucket, pathname);

    return NextResponse.json({
      ok: true,
      provider: "supabase",
      bucket: publicBucket,
      kind,
      fileName,
      contentType,
      size: file.size,
      pathname,
      url,
      downloadUrl: url,
      uploadedBy: { id: user.id, username: user.username, name: user.name },
    });
  } catch (e: any) {
    captureUploadError(e, fileNameForError);
    const notConfigured = e?.message === "supabase_storage_not_configured";
    return NextResponse.json(
      { error: notConfigured ? "supabase_storage_not_configured" : "upload_failed" },
      { status: notConfigured ? 503 : 500 }
    );
  }
}

export const dynamic = "force-dynamic";
