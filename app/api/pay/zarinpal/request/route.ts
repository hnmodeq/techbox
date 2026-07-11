import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  amount: z.number().int().positive(),
  description: z.string().default("سفارش تکباکس"),
  email: z.string().optional(),
  mobile: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // Shop is catalog-only — payments are disabled
  if (process.env.PAYMENTS_ENABLED !== "true") {
    return NextResponse.json(
      { error: "payments_disabled", message: "فروشگاه تکباکس در حال حاضر فقط کاتالوگ است. پرداخت فعال نیست." },
      { status: 503 }
    );
  }

  // Future: when PAYMENTS_ENABLED=true, real payment logic goes here
  const body = await req.json().catch(() => ({}));
  schema.parse(body);
  return NextResponse.json(
    { error: "not_implemented", message: "پرداخت هنوز پیاده‌سازی نشده است." },
    { status: 501 }
  );
}
export const dynamic = "force-dynamic";
