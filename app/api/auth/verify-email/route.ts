import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashTokenSha256, createSession, setSessionCookie } from "@/lib/auth-server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, emailTemplates } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip, "resetPassword"); // reuse 5/hour bucket

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد درخواست‌ها بیش از حد مجاز است." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email, token } = schema.parse(body);

    // Compare the incoming token against the stored hash.
    const tokenHash = await hashTokenSha256(token);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "invalid_token", message: "لینک تأیید نامعتبر است." },
        { status: 400 }
      );
    }

    // Already verified — let them log in anyway (idempotent convenience).
    if (user.emailVerified) {
      const session = await createSession(user.id);
      await setSessionCookie(session);
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    const record = await prisma.emailVerificationToken.findFirst({
      where: {
        token: tokenHash,
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "invalid_token", message: "لینک تأیید نامعتبر یا منقضی شده است." },
        { status: 400 }
      );
    }

    // Mark verified + consume the token, in one transaction.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
      // Tidy up any other tokens for this user.
      prisma.emailVerificationToken.deleteMany({
        where: { userId: user.id, used: false },
      }),
    ]);

    // Send a welcome email now that they're fully registered.
    try {
      const { subject, html } = emailTemplates.welcome(user.name || user.username);
      await sendEmail({ to: user.email, subject, html });
    } catch {
      // Non-fatal: verification already succeeded.
    }

    // Log the user in immediately — they just proved ownership of the email.
    const session = await createSession(user.id);
    await setSessionCookie(session);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        roleFa: user.roleFa || (user.role === "super_admin" ? "مدیر کل" : "کاربر عضو"),
        modules: user.modules,
        avatar: user.avatar || "",
      },
    });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "خطا در تأیید ایمیل" }, { status: 500 });
  }
}
