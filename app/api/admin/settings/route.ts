import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";
import { HERO_MAGIC_DEFAULTS } from "@/lib/hero-magic-settings";
import { ensureSiteSettingsTable } from "@/lib/site-settings-table";

const SETTINGS_DEFAULTS: Record<string, string> = {
  "comments.mode": "auto_approve", // "auto_approve" | "require_approval"
  "comments.hidden_globally": "false", // "true" | "false"
  "jobs.resume_retention_days": "30",
  "modules.enabled": "{}",
  "modules.home_visibility": "{}",
  "modules.home_order": "{}",
  "modules.home_titles": "{}",
  "modules.home_more_labels": "{}",
  "modules.home_show_title": "{}",
  "modules.home_show_more_label": "{}",
  "modules.colors_enabled": "true",
  "modules.unified_color": "var(--primary)",
  "modules.custom_colors": "{}",
  "modules.titles": "{}",
  "auth.require_email_verification": "false",
  "email.provider": "resend",
  "email.nodemailer_host": "smtp.gmail.com",
  "email.nodemailer_port": "465",
  "email.nodemailer_secure": "true",
  "email.nodemailer_user": "",
  "email.nodemailer_pass": "",
  "email.from_address": "TechBox <techboxnoreply@gmail.com>",
  ...HERO_MAGIC_DEFAULTS,
};

const updateSchema = z.record(z.string(), z.string());

export async function GET() {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    await ensureSiteSettingsTable();
    const settings = await prisma.siteSetting.findMany();
    const map: Record<string, string> = { ...SETTINGS_DEFAULTS };
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return NextResponse.json(map);
  } catch {
    return NextResponse.json(SETTINGS_DEFAULTS);
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    await ensureSiteSettingsTable();
    const body = await req.json();
    const updates = updateSchema.parse(body);

    // Validate known keys
    const validKeys = Object.keys(SETTINGS_DEFAULTS);
    for (const key of Object.keys(updates)) {
      if (!validKeys.includes(key)) {
        return NextResponse.json({ error: `Unknown setting: ${key}` }, { status: 400 });
      }
    }

    // Validate specific values
    if (updates["comments.mode"] && !["auto_approve", "require_approval"].includes(updates["comments.mode"])) {
      return NextResponse.json({ error: "comments.mode must be auto_approve or require_approval" }, { status: 400 });
    }
    if (updates["comments.hidden_globally"] && !["true", "false"].includes(updates["comments.hidden_globally"])) {
      return NextResponse.json({ error: "comments.hidden_globally must be true or false" }, { status: 400 });
    }
    if (updates["jobs.resume_retention_days"]) {
      const days = parseInt(updates["jobs.resume_retention_days"], 10);
      if (isNaN(days) || days < 1 || days > 365) {
        return NextResponse.json({ error: "jobs.resume_retention_days must be 1-365" }, { status: 400 });
      }
    }

    // Upsert each setting
    for (const [key, value] of Object.entries(updates)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value, updatedBy: user.id },
        create: { key, value, updatedBy: user.id },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "Failed to update settings" }, { status: 500 });
  }
}
