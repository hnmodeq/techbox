import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";

const orderItemSchema = z.object({
  slug: z.string(),
  module: z.string(),
  title: z.string(),
  image: z.string().optional(),
  price: z.number().positive(),
  quantity: z.number().int().positive().default(1),
  postId: z.string().optional(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().min(5),
    address: z.string().min(5),
    postalCode: z.string().min(5),
    city: z.string().optional(),
  }),
  note: z.string().max(500).optional(),
});

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 6);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

// POST /api/orders — Create a new order
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }

  const { items, customer, note } = parsed.data;
  const user = await getSessionUserPublic();

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = 0; // Free shipping or calculate based on rules
  const tax = 0; // Add tax calculation if needed
  const total = subtotal + shippingCost + tax;

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user?.id || null,
        status: "pending",
        customerName: customer.name,
        customerEmail: customer.email || null,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        customerPostalCode: customer.postalCode,
        customerCity: customer.city || null,
        subtotal,
        shippingCost,
        tax,
        total,
        currency: "IRR",
        customerNote: note || null,
        items: {
          create: items.map((item) => ({
            postId: item.postId || null,
            slug: item.slug,
            module: item.module,
            title: item.title,
            image: item.image || null,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
    });
  } catch (error: any) {
    console.error("[orders:create]", error);
    return NextResponse.json({ error: error.message || "order_failed" }, { status: 500 });
  }
}

// GET /api/orders?id=xxx or GET /api/orders?user=me — Fetch order(s)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const userParam = searchParams.get("user");

  if (id) {
    // Fetch single order
    try {
      const order = await prisma.order.findFirst({
        where: { OR: [{ id }, { orderNumber: id }] },
        include: { items: true },
      });
      if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
      return NextResponse.json(order);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (userParam === "me") {
    // Fetch current user's orders
    const user = await getSessionUserPublic();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    try {
      const orders = await prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { items: true },
      });
      return NextResponse.json(orders);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "missing_id_or_user" }, { status: 400 });
}

// PATCH /api/orders — Update order status (admin)
export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.id || !body?.status) {
    return NextResponse.json({ error: "id_and_status_required" }, { status: 400 });
  }

  const validStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];
  if (!validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  try {
    const order = await prisma.order.update({
      where: { id: body.id },
      data: {
        status: body.status,
        adminNote: body.adminNote || undefined,
        paidAt: body.status === "paid" ? new Date() : undefined,
      },
      include: { items: true },
    });
    return NextResponse.json({ ok: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
