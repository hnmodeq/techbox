import { prisma } from "./db";
import { ensureSiteSettingsTable } from "@/lib/site-settings-table";

const DEFAULTS: Record<string, string> = {
  "comments.mode": "auto_approve",
  "comments.hidden_globally": "false",
  "jobs.resume_retention_days": "30",
  "auth.require_email_verification": "false",
  "email.provider": "resend",
  "email.nodemailer_host": "smtp.gmail.com",
  "email.nodemailer_port": "465",
  "email.nodemailer_secure": "true",
  "email.nodemailer_user": "",
  "email.nodemailer_pass": "",
  "email.from_address": "TechBox <techboxnoreply@gmail.com>",
  "newsletter.email.provider": "resend",
  "newsletter.email.nodemailer_host": "smtp.gmail.com",
  "newsletter.email.nodemailer_port": "465",
  "newsletter.email.nodemailer_secure": "true",
  "newsletter.email.nodemailer_user": "",
  "newsletter.email.nodemailer_pass": "",
  "newsletter.email.from_address": "TechBox Newsletter <newsletter@techbox.local>",
};

/**
 * Get a single site setting by key, returning the default if not set.
 * Safe to call in API routes — returns the default if DB is unavailable.
 */
export async function getSetting(key: string): Promise<string> {
  try {
    await ensureSiteSettingsTable();
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
    await ensureSiteSettingsTable();
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
