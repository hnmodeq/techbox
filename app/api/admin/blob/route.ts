import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { getSessionUser } from "@/lib/auth-server";

const MAX_PAGES = 20;
const PAGE_LIMIT = 1000;

type BlobLike = {
  pathname: string;
  url: string;
  downloadUrl?: string;
  size: number;
  uploadedAt: string | Date;
  contentType?: string;
};

function normalizePrefix(prefix: string | null) {
  if (!prefix) return "";
  return prefix.replace(/^\/+/, "").replace(/\.\./g, "");
}

function inferContentType(pathname: string, explicit?: string) {
  if (explicit) return explicit;
  const ext = pathname.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    pdf: "application/pdf",
    zip: "application/zip",
    rar: "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    iso: "application/x-iso9660-image",
    ts: "text/typescript",
    js: "text/javascript",
    json: "application/json",
    txt: "text/plain",
  };
  return map[ext] || "application/octet-stream";
}

function collectFolders(blobs: BlobLike[], prefix: string) {
  const folders = new Map<string, { name: string; prefix: string; count: number; size: number }>();
  for (const blob of blobs) {
    const rest = blob.pathname.slice(prefix.length);
    const firstSlash = rest.indexOf("/");
    if (firstSlash <= 0) continue;
    const name = rest.slice(0, firstSlash);
    const folderPrefix = `${prefix}${name}/`;
    const existing = folders.get(folderPrefix) ?? { name, prefix: folderPrefix, count: 0, size: 0 };
    existing.count += 1;
    existing.size += blob.size || 0;
    folders.set(folderPrefix, existing);
  }
  return [...folders.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error: "blob_not_configured",
        message: "BLOB_READ_WRITE_TOKEN is not configured in this environment.",
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const prefix = normalizePrefix(searchParams.get("prefix"));

  try {
    let cursor: string | undefined;
    const blobs: BlobLike[] = [];
    let hasMore = false;

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const result = await list({ prefix, cursor, limit: PAGE_LIMIT });
      blobs.push(...(result.blobs as BlobLike[]));
      cursor = result.cursor;
      hasMore = Boolean(cursor);
      if (!cursor) break;
    }

    const files = blobs
      .filter((blob) => !blob.pathname.slice(prefix.length).includes("/"))
      .map((blob) => ({
        pathname: blob.pathname,
        name: blob.pathname.split("/").pop() || blob.pathname,
        url: blob.url,
        downloadUrl: blob.downloadUrl || blob.url,
        size: blob.size || 0,
        uploadedAt: blob.uploadedAt,
        contentType: inferContentType(blob.pathname, blob.contentType),
      }))
      .sort((a, b) => a.pathname.localeCompare(b.pathname));

    const folders = collectFolders(blobs, prefix);
    const totalSize = blobs.reduce((sum, blob) => sum + (blob.size || 0), 0);

    return NextResponse.json({
      prefix,
      folders,
      files,
      totalFiles: blobs.length,
      totalSize,
      hasMore,
      cursor: hasMore ? cursor : null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "blob_list_failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
