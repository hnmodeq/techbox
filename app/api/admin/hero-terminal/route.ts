import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { cacheHeaders, PUBLIC_CONTENT_CACHE, PRIVATE_NO_STORE } from "@/lib/cache-headers";

const KEY = "hero.terminal.lines";

export const DEFAULT_LINES = [
  "به تکباکس خوش اومدی 👋",
  "پلتفرم تخصصی زیرساخت و فناوری اطلاعات",
  "مقاله، ویدیو، انجمن، ابزار، فروشگاه و بیشتر...",
  "محتوای تخصصی برای مهندسان زیرساخت ایران",
  "سرور، شبکه، استوریج، امنیت — همه اینجاست",
];

export async function GET() {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
    const lines = row ? JSON.parse(row.value) : DEFAULT_LINES;
    return NextResponse.json({ lines }, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  } catch {
    return NextResponse.json({ lines: DEFAULT_LINES }, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  const { lines } = await req.json();
  if (!Array.isArray(lines) || lines.some((l) => typeof l !== "string")) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const filtered = lines.map((l: string) => l.trim()).filter(Boolean).slice(0, 20);

  await prisma.siteSetting.upsert({
    where: { key: KEY },
    update: { value: JSON.stringify(filtered), updatedBy: user.id },
    create: { key: KEY, value: JSON.stringify(filtered), updatedBy: user.id },
  });

  return NextResponse.json({ ok: true, lines: filtered });
}

export const dynamic = "force-dynamic";
