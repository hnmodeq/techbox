import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth-server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  token: z.string(),
  newPassword: z.string().min(5),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token, newPassword } = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        userId: user.id,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json({ 
        error: "لینک بازیابی نامعتبر یا منقضی شده است" 
      }, { status: 400 });
    }

    // Update password
    const hashed = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return NextResponse.json({ 
      ok: true, 
      message: "رمز عبور با موفقیت تغییر کرد" 
    });

  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "خطا در تغییر رمز عبور" }, { status: 500 });
  }
}
