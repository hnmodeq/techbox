import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAllPermissions, requireStaff } from "@/lib/api-permissions";
import { hasPermission } from "@/lib/permissions";
import { logAudit } from "@/lib/audit-log";
import { z } from "zod";
import { revalidateTag, revalidatePath } from "next/cache";
import { HERO_MAGIC_DEFAULTS } from "@/lib/hero-magic-settings";

const SETTINGS_DEFAULTS: Record<string, string> = {
  "shop.banners": "[]",
  "comments.mode": "auto_approve", // "auto_approve" | "require_approval"
  "comments.hidden_globally": "false", // "true" | "false"
  "jobs.resume_retention_days": "30",
  "jobs.pageTitle": "موقعیت‌های شغلی تکباکس",
  "terms.content": "",
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
  "hero.visible": "true",
  // Homepage upgrade (docs/homepage-upgrade). All optional; absent or
  // malformed values degrade to "feature off" rather than breaking a section.
  "home.announcement": '{"enabled":false,"version":1,"textFa":"","tone":"brand"}',
  "home.finder.chips": "[]",
  "home.tools.featured": "[]",
  "home.familyComments.blocklist": "[]",
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
  "currency.usd_rate": "189000",
  "currency.eur_rate": "200000",
  "currency.aed_rate": "51500",
  "currency.global_adjustment_percent": "0",
  ...HERO_MAGIC_DEFAULTS,
};

const updateSchema = z.record(z.string(), z.string());

function settingPermission(key: string, access: "view" | "edit") {
  if (key.startsWith("comments.")) return `settings:comments:${access}`;
  if (key.startsWith("jobs.resume_")) return `settings:resume:${access}`;
  if (key.startsWith("email.") || key.startsWith("newsletter.email.")) return `settings:email:${access}`;
  if (key.startsWith("auth.")) return `settings:auth:${access}`;
  if (key.startsWith("currency.")) return `settings:price:${access}`;
  if (key === "shop.banners") return `banner:${access}`;
  if (key.startsWith("terms.")) return `terms:${access}`;
  if (key.startsWith("modules.")) return `module:${access}`;
  if (key.startsWith("hero.")) return `hero:${access}`;
  if (key.startsWith("home.")) return `hero:${access}`;
  return `settings:*:${access}`;
}

export async function GET() {
  const user = await requireStaff();
  if (user instanceof NextResponse) return user;

  try {
    const settings = await prisma.siteSetting.findMany();
    const map: Record<string, string> = { ...SETTINGS_DEFAULTS };
    for (const s of settings) map[s.key] = s.value;
    if (user.role !== "super_admin") {
      for (const key of Object.keys(map)) {
        if (!hasPermission(user.permissions, settingPermission(key, "view"))) delete map[key];
      }
    }
    return NextResponse.json(map);
  } catch {
    const fallback: Record<string, string> = { ...SETTINGS_DEFAULTS };
    if (user.role !== "super_admin") {
      for (const key of Object.keys(fallback)) {
        if (!hasPermission(user.permissions, settingPermission(key, "view"))) delete fallback[key];
      }
    }
    return NextResponse.json(fallback);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const updates = updateSchema.parse(body);
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "no_settings_to_update" }, { status: 400 });
    }
    const required = [...new Set(Object.keys(updates).map((key) => settingPermission(key, "edit")))];
    const user = await requireAllPermissions(required);
    if (user instanceof NextResponse) return user;

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

    // Settings feed unstable_cache layers that hold for up to 24h. Without
    // this, toggling a module or editing the homepage banner appeared to do
    // nothing until the window expired — the write succeeded but every
    // reader kept serving the stale cached value.
    const touched = Object.keys(updates);
    if (touched.some((k) => k.startsWith("modules.") || k.startsWith("hero.") || k.startsWith("home."))) {
      revalidateTag("module-config", "max");
      revalidateTag("home-data", "max");
      revalidatePath("/");
    }
    if (touched.some((k) => k.startsWith("currency."))) {
      // Prices are derived from these rates on the server.
      revalidateTag("currency-rates", "max");
      revalidateTag("home-data", "max");
      revalidatePath("/");
      revalidatePath("/shop");
    }

    logAudit({ userId: user.id, userName: user.name, action: "settings.update", details: { keys: touched } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "Failed to update settings" }, { status: 500 });
  }
}
