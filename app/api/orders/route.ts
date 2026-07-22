import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserPublic } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { items, customer, shipping, subtotal, tax, total } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "no_items" }, { status: 400 });
  }

  if (!customer?.name || !customer?.phone || !customer?.address || !customer?.postalCode) {
    return NextResponse.json({ error: "missing_customer_info" }, { status: 400 });
  }

  const user = await getSessionUserPublic();
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    // Store order as a SiteSetting (lightweight, no new table needed)
    await prisma.siteSetting.upsert({
      where: { key: `order_${orderId}` },
      create: {
        key: `order_${orderId}`,
        value: JSON.stringify({
          id: orderId,
          status: "processing",
          items,
          customer,
          shipping,
          subtotal,
          tax,
          total,
          userId: user?.id || null,
          createdAt: new Date().toISOString(),
        }),
      },
      update: {
        value: JSON.stringify({
          id: orderId,
          status: "processing",
          items,
          customer,
          shipping,
          subtotal,
          tax,
          total,
          userId: user?.id || null,
          createdAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({ orderId, status: "processing" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "order_failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: `order_${id}` },
    });

    if (!setting) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const order = JSON.parse(setting.value);
    return NextResponse.json(order);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "fetch_failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
