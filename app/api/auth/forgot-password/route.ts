import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendEmail, emailTemplates } from "@/lib/email";
import { createSession } from "@/lib/auth-server";

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

    // Generate a simple reset token (in production use proper JWT or crypto token)
    const resetToken = Buffer.from(`${user.id}:${Date.now()}`).toString("base64url");
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

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
