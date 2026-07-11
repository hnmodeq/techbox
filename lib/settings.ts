import { prisma } from "./db";

const DEFAULTS: Record<string, string> = {
  "comments.mode": "auto_approve",
  "comments.hidden_globally": "false",
  "jobs.resume_retention_days": "30",
};

/**
 * Get a single site setting by key, returning the default if not set.
 * Safe to call in API routes — returns the default if DB is unavailable.
 */
export async function getSetting(key: string): Promise<string> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value ?? DEFAULTS[key] ?? "";
  } catch {
    return DEFAULTS[key] ?? "";
  }
}

/**
 * Get multiple settings at once. Returns a key→value map with defaults filled in.
 */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
    const map: Record<string, string> = {};
    for (const key of keys) {
      map[key] = DEFAULTS[key] ?? "";
    }
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  } catch {
    const map: Record<string, string> = {};
    for (const key of keys) {
      map[key] = DEFAULTS[key] ?? "";
    }
    return map;
  }
}
