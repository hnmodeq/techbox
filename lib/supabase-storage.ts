type StorageConfig = {
  url: string;
  serviceKey: string;
  publicBucket: string;
  privateBucket: string;
};

export type SupabaseStorageObject = {
  name: string;
  id: string | null;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown> | null;
};

function cleanBaseUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

export function getSupabaseStorageConfig(): StorageConfig {
  const url = cleanBaseUrl(process.env.SUPABASE_URL || "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) {
    throw new Error("supabase_storage_not_configured");
  }
  return {
    url,
    serviceKey,
    publicBucket: process.env.SUPABASE_PUBLIC_BUCKET || "techbox",
    privateBucket: process.env.SUPABASE_PRIVATE_BUCKET || "job-resumes",
  };
}

function storageHeaders(config: StorageConfig, contentType?: string) {
  const headers = new Headers({
    apikey: config.serviceKey,
    Authorization: `Bearer ${config.serviceKey}`,
  });
  if (contentType) headers.set("Content-Type", contentType);
  return headers;
}

function encodeObjectPath(path: string) {
  return path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

export function sanitizeStoragePath(path: string) {
  return path
    .replace(/\\/g, "/")
    .split("/")
    .filter((segment) => segment && segment !== "." && segment !== "..")
    .join("/");
}

async function storageError(response: Response) {
  const body = await response.json().catch(() => null);
  return body?.message || body?.error || `storage_http_${response.status}`;
}

export async function uploadSupabaseObject(params: {
  bucket: string;
  path: string;
  body: Blob;
  contentType: string;
  upsert?: boolean;
}) {
  const config = getSupabaseStorageConfig();
  const path = sanitizeStoragePath(params.path);
  const response = await fetch(
    `${config.url}/storage/v1/object/${encodeURIComponent(params.bucket)}/${encodeObjectPath(path)}`,
    {
      method: "POST",
      headers: (() => {
        const headers = storageHeaders(config, params.contentType);
        headers.set("x-upsert", params.upsert ? "true" : "false");
        headers.set("Cache-Control", "3600");
        return headers;
      })(),
      body: params.body,
      cache: "no-store",
    }
  );
  if (!response.ok) throw new Error(await storageError(response));
  return { bucket: params.bucket, path };
}

export function getSupabasePublicUrl(bucket: string, path: string) {
  const config = getSupabaseStorageConfig();
  return `${config.url}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeObjectPath(sanitizeStoragePath(path))}`;
}

export function makePrivateStorageRef(bucket: string, path: string) {
  return `supabase://${bucket}/${sanitizeStoragePath(path)}`;
}

export function parsePrivateStorageRef(value: string) {
  if (!value.startsWith("supabase://")) return null;
  const rest = value.slice("supabase://".length);
  const slash = rest.indexOf("/");
  if (slash <= 0) return null;
  return { bucket: rest.slice(0, slash), path: sanitizeStoragePath(rest.slice(slash + 1)) };
}

export async function fetchSupabaseObject(bucket: string, path: string) {
  const config = getSupabaseStorageConfig();
  return fetch(
    `${config.url}/storage/v1/object/authenticated/${encodeURIComponent(bucket)}/${encodeObjectPath(sanitizeStoragePath(path))}`,
    { headers: storageHeaders(config), cache: "no-store" }
  );
}

export async function removeSupabaseObjects(bucket: string, paths: string[]) {
  if (paths.length === 0) return;
  const config = getSupabaseStorageConfig();
  const response = await fetch(`${config.url}/storage/v1/object/${encodeURIComponent(bucket)}`, {
    method: "DELETE",
    headers: storageHeaders(config, "application/json"),
    body: JSON.stringify({ prefixes: paths.map(sanitizeStoragePath) }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await storageError(response));
}

export async function listSupabaseObjects(bucket: string, prefix = "", limit = 1000, offset = 0) {
  const config = getSupabaseStorageConfig();
  const response = await fetch(`${config.url}/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
    method: "POST",
    headers: storageHeaders(config, "application/json"),
    body: JSON.stringify({
      prefix: sanitizeStoragePath(prefix),
      limit: Math.min(Math.max(limit, 1), 1000),
      offset: Math.max(offset, 0),
      sortBy: { column: "name", order: "asc" },
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await storageError(response));
  return (await response.json()) as SupabaseStorageObject[];
}
