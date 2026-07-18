import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, hashTokenSha256 } from "@/lib/auth-server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  token: z.string(),
  newPassword: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip, "resetPassword");

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد درخواست‌ها بیش از حد مجاز است." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email, token, newPassword } = schema.parse(body);

    // Hash the incoming token to compare with stored hash
    const tokenHash = await hashTokenSha256(token);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "invalid_credentials", message: "لینک بازیابی نامعتبر است." },
        { status: 400 }
      );
    }

    // Find valid reset token by hash
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: tokenHash,
        userId: user.id,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "لینک بازیابی نامعتبر یا منقضی شده است" },
        { status: 400 }
      );
    }

    // Password update, token consumption, and session invalidation must be
    // atomic — otherwise a concurrent reset attempt could reuse a token or the
    // invalidation could race the password write.
    const hashed = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashed, sessionsInvalidatedAt: new Date() },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "رمز عبور با موفقیت تغییر کرد",
    });

  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "خطا در تغییر رمز عبور" }, { status: 500 });
  }
}
