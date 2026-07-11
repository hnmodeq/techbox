import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Shop is catalog-only — payments are disabled
  if (process.env.PAYMENTS_ENABLED !== "true") {
    return NextResponse.json(
      { error: "payments_disabled", message: "فروشگاه تکباکس در حال حاضر فقط کاتالوگ است. پرداخت فعال نیست." },
      { status: 503 }
    );
  }

  // Future: when PAYMENTS_ENABLED=true, real verification logic goes here
  return NextResponse.json(
    { error: "not_implemented", message: "تایید پرداخت هنوز پیاده‌سازی نشده است." },
    { status: 501 }
  );
}
export const dynamic = "force-dynamic";
