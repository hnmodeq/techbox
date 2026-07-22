import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/seo";

const ZARINPAL_VERIFY_URL = "https://payment.zarinpal.com/pg/v4/payment/verify.json";
const ZARINPAL_SANDBOX_VERIFY_URL = "https://sandbox.zarinpal.com/pg/v4/payment/verify.json";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");
  const orderId = searchParams.get("orderId");

  const base = siteUrl();

  if (!authority || !orderId) {
    return NextResponse.redirect(`${base}/order/success?error=missing_params`);
  }

  if (status !== "OK") {
    // User cancelled or payment failed
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    }).catch(() => {});
    return NextResponse.redirect(`${base}/order/success?cancelled=true`);
  }

  const merchantId = process.env.ZARIN_MERCHANT_ID;
  if (!merchantId) {
    return NextResponse.redirect(`${base}/order/success?error=payment_not_configured`);
  }

  const isSandbox = process.env.ZARINPAL_SANDBOX === "true";
  const verifyUrl = isSandbox ? ZARINPAL_SANDBOX_VERIFY_URL : ZARINPAL_VERIFY_URL;

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.redirect(`${base}/order/success?error=order_not_found`);
    }

    // Verify with Zarinpal
    const verifyRes = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: Math.round(order.total),
        authority,
      }),
    });

    const verifyData = await verifyRes.json();

    if (verifyData.data?.code === 100 || verifyData.data?.code === 101) {
      // Payment verified successfully
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "paid",
          paymentId: verifyData.data.ref_id?.toString() || authority,
          paidAt: new Date(),
        },
      });

      return NextResponse.redirect(`${base}/order/success?id=${order.orderNumber}`);
    } else {
      // Verification failed
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "cancelled" },
      }).catch(() => {});

      return NextResponse.redirect(`${base}/order/success?error=verification_failed`);
    }
  } catch (error) {
    console.error("[zarinpal:verify]", error);
    return NextResponse.redirect(`${base}/order/success?error=verify_error`);
  }
}

export const dynamic = "force-dynamic";
