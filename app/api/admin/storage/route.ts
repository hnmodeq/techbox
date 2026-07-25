import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/api-permissions";
import {
  getSupabasePublicUrl,
  getSupabaseStorageConfig,
  listSupabaseObjects,
  type SupabaseStorageObject,
} from "@/lib/supabase-storage";

const MAX_FOLDERS = 200;

function normalizePrefix(prefix: string | null) {
  return (prefix || "").replace(/^\/+|\/+$/g, "").replace(/\.\./g, "");
}

function inferContentType(pathname: string, explicit?: unknown) {
  if (typeof explicit === "string" && explicit) return explicit;
  const ext = pathname.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
    gif: "image/gif", svg: "image/svg+xml", mp4: "video/mp4", webm: "video/webm",
    mov: "video/quicktime", mp3: "audio/mpeg", wav: "audio/wav", pdf: "application/pdf",
    zip: "application/zip", rar: "application/vnd.rar", "7z": "application/x-7z-compressed",
    iso: "application/x-iso9660-image", json: "application/json", txt: "text/plain",
  };
  return map[ext] || "application/octet-stream";
}

function objectPath(prefix: string, name: string) {
  return [prefix, name].filter(Boolean).join("/");
}

function isFolder(item: SupabaseStorageObject) {
  return !item.id && !item.metadata;
}

async function walkFiles(bucket: string, rootPrefix: string) {
  const queue = [rootPrefix];
  const files: Array<{ item: SupabaseStorageObject; pathname: string }> = [];
  let visited = 0;
  while (queue.length > 0 && visited < MAX_FOLDERS) {
    const prefix = queue.shift()!;
    visited += 1;
    const items = await listSupabaseObjects(bucket, prefix);
    for (const item of items) {
      const pathname = objectPath(prefix, item.name);
      if (isFolder(item)) queue.push(pathname);
      else files.push({ item, pathname });
    }
  }
  return files;
}

function normalizeFile(bucket: string, item: SupabaseStorageObject, pathname: string) {
  const metadata = item.metadata || {};
  const url = getSupabasePublicUrl(bucket, pathname);
  return {
    pathname,
    name: item.name,
    url,
    downloadUrl: url,
    size: typeof metadata.size === "number" ? metadata.size : 0,
    uploadedAt: item.updated_at || item.created_at || new Date(0).toISOString(),
    contentType: inferContentType(pathname, metadata.mimetype),
  };
}

export async function GET(req: NextRequest) {
  const user = await requirePermission("blob:view");
  if (user instanceof NextResponse) return user;

  try {
    const { publicBucket } = getSupabaseStorageConfig();
    const prefix = normalizePrefix(new URL(req.url).searchParams.get("prefix"));
    const direct = await listSupabaseObjects(publicBucket, prefix);
    const directFiles = direct.filter((item) => !isFolder(item));
    const directFolders = direct.filter(isFolder);
    const walked = await walkFiles(publicBucket, prefix);
    const allFiles = walked
      .map(({ item, pathname }) => normalizeFile(publicBucket, item, pathname))
      .sort((a, b) => a.pathname.localeCompare(b.pathname));
    const files = directFiles.map((item) => normalizeFile(publicBucket, item, objectPath(prefix, item.name)));
    const folders = directFolders.map((item) => {
      const folderPrefix = objectPath(prefix, item.name);
      const children = allFiles.filter((file) => file.pathname.startsWith(`${folderPrefix}/`));
      return {
        name: item.name,
        prefix: `${folderPrefix}/`,
        count: children.length,
        size: children.reduce((sum, file) => sum + file.size, 0),
      };
    });

    return NextResponse.json({
      provider: "supabase",
      bucket: publicBucket,
      prefix: prefix ? `${prefix}/` : "",
      folders,
      files,
      allFiles,
      totalFiles: allFiles.length,
      totalSize: allFiles.reduce((sum, file) => sum + file.size, 0),
      hasMore: false,
      cursor: null,
    });
  } catch (error: any) {
    console.error("[supabase-storage:list]", error);
    return NextResponse.json(
      { error: error?.message === "supabase_storage_not_configured" ? error.message : "storage_list_failed" },
      { status: error?.message === "supabase_storage_not_configured" ? 503 : 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
