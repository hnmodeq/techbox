import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { requirePermission } from "@/lib/api-permissions";
import { getCurrencyRates } from "@/lib/currency";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";
import {
  createOrderAccessToken,
  hashOrderAccessToken,
  MAX_ORDER_ITEM_QUANTITY,
  OrderPricingError,
  priceOrderItems,
  verifyOrderAccessToken,
} from "@/lib/orders";
import { z } from "zod";

const orderItemSchema = z.object({
  slug: z.string().trim().min(1).max(200),
  quantity: z.number().int().min(1).max(MAX_ORDER_ITEM_QUANTITY).default(1),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(50),
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254).optional(),
    phone: z.string().trim().min(7).max(30),
    address: z.string().trim().min(5).max(2000),
    postalCode: z.string().trim().min(5).max(20),
    city: z.string().trim().max(120).optional(),
  }),
  note: z.string().trim().max(1000).optional(),
});

const updateOrderSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["processing", "shipped", "delivered", "cancelled", "refunded"]),
  adminNote: z.string().max(2000).optional(),
});

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(4).toString("hex");
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

function orderResponse(order: any, includeAdmin = false) {
  return {
    id: includeAdmin ? order.id : order.orderNumber,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    tax: order.tax,
    total: order.total,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    paymentReference: order.paymentReference,
    paidAt: order.paidAt,
    items: (order.items || []).map((item: any) => ({
      slug: item.slug,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    })),
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      address: order.customerAddress,
      postalCode: order.customerPostalCode,
      city: order.customerCity,
    },
    customerNote: order.customerNote,
    ...(includeAdmin ? { adminNote: order.adminNote } : {}),
  };
}

async function findOrder(identifier: string) {
  return prisma.order.findFirst({
    where: { OR: [{ id: identifier }, { orderNumber: identifier }] },
    include: { items: true },
  });
}

function canReadOrder(
  user: Awaited<ReturnType<typeof getSessionUserPublic>>,
  order: { userId: string | null; accessTokenHash: string | null },
  accessToken: string | null
) {
  if (user?.role === "super_admin") return true;
  if (user && order.userId === user.id) return true;
  return verifyOrderAccessToken(accessToken, order.accessTokenHash);
}

// Create an order from canonical database products. Browser-provided names,
// images, and prices are intentionally ignored and are not accepted by schema.
export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(`${user?.id || "guest"}:${ip}`, "orders");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد تلاش‌های ثبت سفارش بیش از حد مجاز است." },
      { status: 429, headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  }

  try {
    const body = createOrderSchema.parse(await req.json());
    const slugs = [...new Set(body.items.map((item) => item.slug))];
    const [products, rates] = await Promise.all([
      prisma.post.findMany({
        where: { module: "shop", slug: { in: slugs } },
        select: {
          id: true,
          slug: true,
          module: true,
          title: true,
          image: true,
          published: true,
          deletedAt: true,
          availability: true,
          priceAmount: true,
          sourcePriceAmount: true,
          sourceCurrency: true,
          priceAdjustmentPercent: true,
          sellerBenefitPercent: true,
          discountPercent: true,
          discountEndsAt: true,
        },
      }),
      getCurrencyRates(),
    ]);

    const priced = priceOrderItems(body.items, products, rates);
    const shippingCost = 0;
    const tax = 0;
    const total = priced.subtotal + shippingCost + tax;
    const accessToken = createOrderAccessToken();

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user?.id || null,
        accessTokenHash: hashOrderAccessToken(accessToken),
        status: "pending",
        customerName: body.customer.name,
        customerEmail: body.customer.email?.toLowerCase() || null,
        customerPhone: body.customer.phone,
        customerAddress: body.customer.address,
        customerPostalCode: body.customer.postalCode,
        customerCity: body.customer.city || null,
        subtotal: priced.subtotal,
        shippingCost,
        tax,
        total,
        currency: "IRR",
        customerNote: body.note || null,
        items: { create: priced.items },
      },
      include: { items: true },
    });

    return NextResponse.json(
      {
        ok: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        accessToken,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        tax: order.tax,
        total: order.total,
        status: order.status,
      },
      { status: 201, headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation", issues: error.issues },
        { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) }
      );
    }
    if (error instanceof OrderPricingError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: 409, headers: cacheHeaders(PRIVATE_NO_STORE) }
      );
    }
    console.error("[orders:create]", error);
    return NextResponse.json(
      { error: "order_failed", message: "ثبت سفارش انجام نشد." },
      { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  }
}

// Read an authorized single order, the current user's orders, or the admin list.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const scope = searchParams.get("scope");
  const userParam = searchParams.get("user");
  const user = await getSessionUserPublic();

  try {
    if (scope === "admin") {
      const authorized = await requirePermission("order:list:view");
      if (authorized instanceof NextResponse) return authorized;
      const requestedStatus = searchParams.get("status");
      const validStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];
      const status = requestedStatus && validStatuses.includes(requestedStatus) ? requestedStatus : undefined;
      const orders = await prisma.order.findMany({
        where: status ? { status } : undefined,
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      return NextResponse.json(orders.map((order) => orderResponse(order, true)), { headers: cacheHeaders(PRIVATE_NO_STORE) });
    }

    if (id) {
      const order = await findOrder(id);
      if (!order) return NextResponse.json({ error: "not_found" }, { status: 404, headers: cacheHeaders(PRIVATE_NO_STORE) });
      if (!canReadOrder(user, order, searchParams.get("token"))) {
        return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
      }
      return NextResponse.json(orderResponse(order), { headers: cacheHeaders(PRIVATE_NO_STORE) });
    }

    if (userParam === "me") {
      if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: cacheHeaders(PRIVATE_NO_STORE) });
      const orders = await prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { items: true },
      });
      return NextResponse.json(orders.map((order) => orderResponse(order)), { headers: cacheHeaders(PRIVATE_NO_STORE) });
    }

    return NextResponse.json({ error: "missing_scope" }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (error) {
    console.error("[orders:read]", error);
    return NextResponse.json({ error: "order_read_failed" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

// Administrative fulfilment updates. A paid state can only be produced by the
// verified gateway callback, never by this general admin endpoint.
export async function PATCH(req: NextRequest) {
  const authorized = await requirePermission("order:status:edit");
  if (authorized instanceof NextResponse) return authorized;

  try {
    const body = updateOrderSchema.parse(await req.json());
    const current = await prisma.order.findUnique({ where: { id: body.id }, select: { status: true } });
    if (!current) {
      return NextResponse.json({ error: "not_found" }, { status: 404, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    const transitions: Record<string, string[]> = {
      pending: ["cancelled"],
      paid: ["processing", "refunded"],
      processing: ["shipped", "refunded"],
      shipped: ["delivered", "refunded"],
      delivered: ["refunded"],
      cancelled: [],
      refunded: [],
    };
    if (!transitions[current.status]?.includes(body.status)) {
      return NextResponse.json(
        { error: "invalid_status_transition", from: current.status, to: body.status },
        { status: 409, headers: cacheHeaders(PRIVATE_NO_STORE) }
      );
    }
    const order = await prisma.order.update({
      where: { id: body.id },
      data: { status: body.status, adminNote: body.adminNote },
      include: { items: true },
    });
    return NextResponse.json({ ok: true, order: orderResponse(order, true) }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "validation", issues: error.issues }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    console.error("[orders:update]", error);
    return NextResponse.json({ error: "order_update_failed" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
