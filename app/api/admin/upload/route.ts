import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSessionUser } from "@/lib/auth-server";
import { captureUploadError } from "@/lib/sentry";

const MAX_SIZE_BY_KIND: Record<string, number> = {
  image: 8 * 1024 * 1024,
  avatar: 3 * 1024 * 1024,
  video: 120 * 1024 * 1024,
  download: 250 * 1024 * 1024,
  file: 50 * 1024 * 1024,
};

const ALLOWED_BY_KIND: Record<string, RegExp[]> = {
  image: [/^image\/(jpeg|png|webp|gif|svg\+xml)$/],
  avatar: [/^image\/(jpeg|png|webp)$/],
  video: [/^video\/(mp4|webm|quicktime)$/],
  download: [
    /^application\/(pdf|zip|x-zip-compressed|octet-stream)$/,
    /^application\/x-iso9660-image$/,
    /^application\/x-7z-compressed$/,
    /^application\/vnd\.rar$/,
    /^text\//,
  ],
  file: [/^image\//, /^video\//, /^application\//, /^text\//],
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
  const user = await getSessionUser();
  if (!user || !["super_admin", "editor"].includes(user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "blob_not_configured", message: "BLOB_READ_WRITE_TOKEN is not configured." }, { status: 503 });
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
    const fileName = sanitizeFileName(file.name);
    const pathname = `${folder}/${fileName}`;

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      contentType,
    });

    return NextResponse.json({
      ok: true,
      kind,
      fileName,
      contentType,
      size: file.size,
      pathname: blob.pathname,
      url: blob.url,
      downloadUrl: blob.downloadUrl || blob.url,
      uploadedBy: { id: user.id, username: user.username, name: user.name },
    });
  } catch (e: any) {
    captureUploadError(e, fileNameForError);
    return NextResponse.json({ error: e?.message || "upload_failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
