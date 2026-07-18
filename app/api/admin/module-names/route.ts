import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { DEFAULT_MODULE_TITLES, type ModuleSlug } from "@/lib/module-config";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

const KEY = "modules.titles";
const VALID_SLUGS = Object.keys(DEFAULT_MODULE_TITLES) as ModuleSlug[];

const schema = z.record(z.string(), z.string().max(60)).refine(
  (obj) => Object.keys(obj).every((k) => VALID_SLUGS.includes(k as ModuleSlug)),
  { message: "unknown module slug" }
);

async function requireSuperAdmin() {
  const user = await getSessionUserPublic();
  return user && user.role === "super_admin" ? user : null;
}

export async function GET() {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });

  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
    const overrides = row?.value ? JSON.parse(row.value) : {};
    const titles = { ...DEFAULT_MODULE_TITLES, ...overrides };
    return NextResponse.json({ titles, defaults: DEFAULT_MODULE_TITLES }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch {
    return NextResponse.json({ titles: DEFAULT_MODULE_TITLES, defaults: DEFAULT_MODULE_TITLES }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export async function PUT(req: NextRequest) {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });

  try {
    const body = schema.parse(await req.json());
    const value = JSON.stringify(body);
    await prisma.siteSetting.upsert({
      where: { key: KEY },
      update: { value, updatedBy: admin.id },
      create: { key: KEY, value, updatedBy: admin.id },
    });
    revalidateTag("module-config", "max");
    return NextResponse.json({ ok: true }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "validation", issues: e.errors }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    return NextResponse.json({ error: e?.message || "update_failed" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
