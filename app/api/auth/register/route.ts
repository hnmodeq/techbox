import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie, createEmailVerification } from "@/lib/auth-server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, emailTemplates } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ حرف باشد"),
  username: z.string().min(3, "نام کاربری باید حداقل ۳ حرف باشد").regex(/^[a-zA-Z0-9_]+$/, "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد و آندرلاین باشد"),
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip, "register");

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "ثبت‌نام موقتاً محدود شده است." },
      { status: 429 }
    );
  }

  // Check AUTH_SECRET before attempting auth operations
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    console.error("[register] AUTH_SECRET is missing or too short. Set it in Vercel environment variables (≥32 chars).");
    return NextResponse.json(
      { error: "server_config_error", message: "تنظیمات سرور ناقص است. لطفاً با مدیر سایت تماس بگیرید." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { name, username, email, password } = registerSchema.parse(body);

    const cleanUsername = username.toLowerCase();
    
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { email: email.toLowerCase() }
        ]
      }
    });

    if (existing) {
      if (existing.username === cleanUsername) {
        return NextResponse.json({ error: "این نام کاربری قبلا ثبت شده است" }, { status: 409 });
      }
      return NextResponse.json({ error: "این ایمیل قبلا در سیستم ثبت شده است" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    // First user to register becomes super_admin (for fresh deployments)
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;
    const role = isFirstUser ? "super_admin" : "user";
    const roleFa = isFirstUser ? "مدیر کل" : "کاربر عضو";
    const modules = isFirstUser ? ["blog", "news", "media", "review", "download", "shop", "forum", "tools"] : [];

    // The bootstrap (first) account is auto-verified and logged in immediately,
    // so a fresh deployment can never lock itself out if email delivery fails.
    // Every other account must verify its email before it can log in.
    const emailVerified = isFirstUser ? new Date() : null;

    const user = await prisma.user.create({
      data: {
        name,
        username: cleanUsername,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        roleFa,
        modules,
        avatar: "",
        emailVerified,
      }
    });

    // --- Bootstrap path: first user is verified & logged in right away ---
    if (isFirstUser) {
      const token = await createSession(user.id);
      await setSessionCookie(token);

      // Send welcome email
      if (user.email) {
        const { subject, html } = emailTemplates.welcome(user.name || user.username);
        await sendEmail({ to: user.email, subject, html });
      }

      return NextResponse.json({
        ok: true,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          roleFa: user.roleFa || "کاربر عضو",
          modules: user.modules || [],
          avatar: user.avatar
        }
      }, { status: 201 });
    }

    // --- Normal path: send a verification email, do NOT log in yet ---
    const { rawToken } = await createEmailVerification(user.id);
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const verifyLink = `${base}/auth/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    const { subject, html } = emailTemplates.emailVerification(verifyLink);
    await sendEmail({ to: user.email, subject, html });

    return NextResponse.json({
      ok: true,
      needsVerification: true,
      email: user.email,
      message: "حساب شما ساخته شد. برای تکمیل ثبت‌نام، لینک تأیید را از ایمیل خود بررسی کنید.",
    }, { status: 201 });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "خطا در ثبت‌نام" }, { status: 400 });
  }
}
