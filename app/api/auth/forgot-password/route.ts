import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendEmail, emailTemplates } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success (security best practice)
    if (!user) {
      return NextResponse.json({ ok: true, message: "اگر ایمیل وجود داشته باشد، لینک ارسال شد." });
    }

    // Delete any existing unused tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    // Create a secure reset token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send reset email
    const { subject, html } = emailTemplates.passwordReset(resetLink);
    
    await sendEmail({
      to: user.email,
      subject,
      html,
    });

    return NextResponse.json({ 
      ok: true, 
      message: "لینک بازیابی رمز عبور ارسال شد." 
    });

  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "خطا در ارسال ایمیل" }, { status: 500 });
  }
}
