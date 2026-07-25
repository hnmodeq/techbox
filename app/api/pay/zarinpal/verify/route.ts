import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/seo";
import { verifyOrderAccessToken } from "@/lib/orders";

const ZARINPAL_VERIFY_URL = "https://payment.zarinpal.com/pg/v4/payment/verify.json";
const ZARINPAL_SANDBOX_VERIFY_URL = "https://sandbox.zarinpal.com/pg/v4/payment/verify.json";

function resultUrl(params: Record<string, string | undefined>) {
  const url = new URL("/order/success", siteUrl());
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const authority = searchParams.get("Authority");
  const gatewayStatus = searchParams.get("Status");
  const orderId = searchParams.get("orderId");
  const accessToken = searchParams.get("token") || undefined;

  if (!authority || !orderId) {
    return NextResponse.redirect(resultUrl({ error: "missing_params" }));
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } }).catch(() => null);
  if (!order) {
    return NextResponse.redirect(resultUrl({ error: "order_not_found" }));
  }

  // The callback must match the authority issued for this exact order. The
  // customer token is carried only so a guest can open the protected tracking
  // page after returning from the gateway.
  if (order.paymentMethod !== "zarinpal" || order.paymentAuthority !== authority) {
    console.error("[zarinpal:verify] authority mismatch", { orderId: order.id });
    return NextResponse.redirect(resultUrl({ error: "authority_mismatch" }));
  }
  if (accessToken && !verifyOrderAccessToken(accessToken, order.accessTokenHash)) {
    return NextResponse.redirect(resultUrl({ error: "invalid_order_token" }));
  }

  if (order.status === "paid" || order.paidAt) {
    return NextResponse.redirect(resultUrl({ id: order.orderNumber, token: accessToken }));
  }

  if (gatewayStatus !== "OK") {
    // Keep the order pending so the customer can retry payment. A cancelled
    // browser return is not an administrative cancellation of the order.
    return NextResponse.redirect(resultUrl({ id: order.orderNumber, token: accessToken, cancelled: "true" }));
  }

  const merchantId = process.env.ZARIN_MERCHANT_ID;
  if (!merchantId) {
    return NextResponse.redirect(resultUrl({ id: order.orderNumber, token: accessToken, error: "payment_not_configured" }));
  }
  if (order.status !== "pending" || !Number.isSafeInteger(order.total) || order.total <= 0) {
    return NextResponse.redirect(resultUrl({ id: order.orderNumber, token: accessToken, error: "invalid_order_state" }));
  }

  try {
    const isSandbox = process.env.ZARINPAL_SANDBOX === "true";
    const verifyUrl = isSandbox ? ZARINPAL_SANDBOX_VERIFY_URL : ZARINPAL_VERIFY_URL;
    const verifyRes = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: Math.round(order.total),
        authority,
      }),
      cache: "no-store",
    });
    const verifyData = await verifyRes.json().catch(() => null);
    const code = verifyData?.data?.code;

    if (verifyRes.ok && (code === 100 || code === 101)) {
      const reference = verifyData?.data?.ref_id?.toString() || null;
      await prisma.order.updateMany({
        where: { id: order.id, status: "pending", paymentAuthority: authority },
        data: {
          status: "paid",
          paymentReference: reference,
          paidAt: new Date(),
        },
      });
      return NextResponse.redirect(resultUrl({ id: order.orderNumber, token: accessToken }));
    }

    console.error("[zarinpal:verify] gateway verification failed", {
      orderId: order.id,
      status: verifyRes.status,
      code,
    });
    return NextResponse.redirect(resultUrl({ id: order.orderNumber, token: accessToken, error: "verification_failed" }));
  } catch (error) {
    console.error("[zarinpal:verify]", error);
    return NextResponse.redirect(resultUrl({ id: order.orderNumber, token: accessToken, error: "verify_error" }));
  }
}

export const dynamic = "force-dynamic";
