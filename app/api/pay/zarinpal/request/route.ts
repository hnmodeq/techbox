import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { siteUrl } from "@/lib/seo";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyOrderAccessToken } from "@/lib/orders";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

const ZARINPAL_GATEWAY = "https://www.zarinpal.com/pg/StartPay";
const ZARINPAL_REQUEST_URL = "https://payment.zarinpal.com/pg/v4/payment/request.json";
const ZARINPAL_SANDBOX_REQUEST_URL = "https://sandbox.zarinpal.com/pg/v4/payment/request.json";

const requestSchema = z.object({
  orderId: z.string().min(1),
  accessToken: z.string().min(32).max(200).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(`${user?.id || "guest"}:${ip}`, "orders");
  if (!rateLimit.success) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }

  const merchantId = process.env.ZARIN_MERCHANT_ID;
  if (!merchantId) {
    return NextResponse.json(
      { error: "payment_not_configured", message: "درگاه پرداخت فروشگاه پیکربندی نشده است." },
      { status: 503, headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  }

  try {
    const body = requestSchema.parse(await req.json());
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: body.orderId }, { orderNumber: body.orderId }] },
    });

    if (!order) {
      return NextResponse.json({ error: "order_not_found" }, { status: 404, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }

    const ownsOrder = Boolean(user && order.userId === user.id);
    const hasCapability = verifyOrderAccessToken(body.accessToken, order.accessTokenHash);
    if (user?.role !== "super_admin" && !ownsOrder && !hasCapability) {
      return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "order_not_pending", status: order.status },
        { status: 409, headers: cacheHeaders(PRIVATE_NO_STORE) }
      );
    }
    if (!Number.isSafeInteger(order.total) || order.total <= 0) {
      return NextResponse.json({ error: "invalid_order_total" }, { status: 409, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }

    const callbackUrl = new URL("/api/pay/zarinpal/verify", siteUrl());
    callbackUrl.searchParams.set("orderId", order.id);
    if (body.accessToken) callbackUrl.searchParams.set("token", body.accessToken);

    const isSandbox = process.env.ZARINPAL_SANDBOX === "true";
    const requestUrl = isSandbox ? ZARINPAL_SANDBOX_REQUEST_URL : ZARINPAL_REQUEST_URL;
    const zarinpalRes = await fetch(requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: Math.round(order.total),
        callback_url: callbackUrl.toString(),
        description: `سفارش ${order.orderNumber} - تکباکس`,
        metadata: {
          email: order.customerEmail || "",
          mobile: order.customerPhone,
        },
      }),
      cache: "no-store",
    });

    const zarinpalData = await zarinpalRes.json().catch(() => null);
    const authority = zarinpalData?.data?.authority;
    if (!zarinpalRes.ok || zarinpalData?.data?.code !== 100 || typeof authority !== "string") {
      console.error("[zarinpal:request] gateway rejected request", {
        status: zarinpalRes.status,
        code: zarinpalData?.data?.code,
      });
      return NextResponse.json(
        { error: "payment_gateway_rejected", message: "اتصال به درگاه پرداخت انجام نشد." },
        { status: 502, headers: cacheHeaders(PRIVATE_NO_STORE) }
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentMethod: "zarinpal", paymentAuthority: authority },
    });

    return NextResponse.json(
      { ok: true, gatewayUrl: `${ZARINPAL_GATEWAY}/${authority}` },
      { headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "validation", issues: error.issues }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    console.error("[zarinpal:request]", error);
    return NextResponse.json(
      { error: "payment_request_failed", message: "شروع پرداخت انجام نشد." },
      { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  }
}

export const dynamic = "force-dynamic";
