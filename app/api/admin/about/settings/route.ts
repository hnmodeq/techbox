import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-permissions";
import { PRIVATE_NO_STORE, cacheHeaders } from "@/lib/cache-headers";

const KEY = "about.settings";

export async function GET() {
  const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
  const defaults = {
    description: "",
    addressTitle: "دفتر تهران",
    address: "",
    email: process.env.CONTACT_EMAIL || "info@techbox.ir",
    hours: "شنبه–چهارشنبه ۹–۱۷",
    mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=51.41%2C35.75%2C51.45%2C35.77&layer=mapnik&marker=35.76%2C51.43",
  };
  const data = row?.value ? { ...defaults, ...JSON.parse(row.value) } : defaults;
  return NextResponse.json(data, { headers: cacheHeaders(PRIVATE_NO_STORE) });
}

export async function PUT(req: NextRequest) {
  const user = await requirePermission("about:edit");
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  await prisma.siteSetting.upsert({
    where: { key: KEY },
    update: { value: JSON.stringify(body), updatedBy: user.id },
    create: { key: KEY, value: JSON.stringify(body), updatedBy: user.id },
  });
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
