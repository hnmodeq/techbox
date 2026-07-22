import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { siteUrl } from "@/lib/seo";

const ZARINPAL_GATEWAY = "https://www.zarinpal.com/pg/StartPay";
const ZARINPAL_REQUEST_URL = "https://payment.zarinpal.com/pg/v4/payment/request.json";
const ZARINPAL_SANDBOX_REQUEST_URL = "https://sandbox.zarinpal.com/pg/v4/payment/request.json";

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();

  const body = await req.json().catch(() => null);
  if (!body?.orderId) {
    return NextResponse.json({ error: "orderId_required" }, { status: 400 });
  }

  const merchantId = process.env.ZARIN_MERCHANT_ID;
  if (!merchantId) {
    return NextResponse.json({ error: "payment_not_configured" }, { status: 503 });
  }

  const isSandbox = process.env.ZARINPAL_SANDBOX === "true";
  const requestUrl = isSandbox ? ZARINPAL_SANDBOX_REQUEST_URL : ZARINPAL_REQUEST_URL;

  try {
    // Find the order
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: body.orderId }, { orderNumber: body.orderId }] },
    });

    if (!order) {
      return NextResponse.json({ error: "order_not_found" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ error: "order_not_pending", status: order.status }, { status: 400 });
    }

    const base = siteUrl();
    const callbackUrl = `${base}/api/pay/zarinpal/verify?orderId=${order.id}`;

    // Request payment from Zarinpal
    const zarinpalRes = await fetch(requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: Math.round(order.total), // Amount in Toman
        callback_url: callbackUrl,
        description: `سفارش ${order.orderNumber} - تکباکس`,
        metadata: {
          email: order.customerEmail || "",
          mobile: order.customerPhone,
        },
      }),
    });

    const zarinpalData = await zarinpalRes.json();

    if (zarinpalData.data?.code === 100) {
      // Store the authority on the order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentMethod: "zarinpal",
          paymentId: zarinpalData.data.authority,
        },
      });

      const gatewayUrl = `${ZARINPAL_GATEWAY}/${zarinpalData.data.authority}`;

      return NextResponse.json({
        ok: true,
        authority: zarinpalData.data.authority,
        gatewayUrl,
      });
    } else {
      return NextResponse.json({
        error: "zarinpal_error",
        code: zarinpalData.data?.code,
        message: zarinpalData.errors?.message || "خطا در اتصال به درگاه پرداخت",
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[zarinpal:request]", error);
    return NextResponse.json({ error: error.message || "payment_request_failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
