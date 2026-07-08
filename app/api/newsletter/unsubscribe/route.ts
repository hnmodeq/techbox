import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const unsubscribeSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = unsubscribeSchema.parse(body);

    await prisma.newsletterSubscriber.updateMany({
      where: { email: email.toLowerCase().trim() },
      data: { active: false },
    });

    return NextResponse.json({ 
      ok: true, 
      message: "عضویت شما لغو شد." 
    });

  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "خطا در لغو عضویت" }, { status: 500 });
  }
}
