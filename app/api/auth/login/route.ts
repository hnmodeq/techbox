import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth-server";
import { z } from "zod";
import { captureAuthError } from "@/lib/sentry";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({ username: z.string(), password: z.string() });

function parseModules(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return raw.split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(ip, "login");

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  // Check AUTH_SECRET before attempting auth operations
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    console.error("[login] AUTH_SECRET is missing or too short. Set it in Vercel environment variables (≥32 chars).");
    return NextResponse.json(
      { error: "server_config_error", message: "تنظیمات سرور ناقص است. لطفاً با مدیر سایت تماس بگیرید." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { username, password } = schema.parse(body);
    const cleanUser = username.trim().toLowerCase();

    // Allow signing in with either username or email.
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUser },
          { email: cleanUser }
        ]
      }
    });

    // Uniform error: don't reveal whether user exists or password is wrong
    if (!user) {
      return NextResponse.json(
        { error: "invalid_credentials", message: "نام کاربری یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    // Reject banned/suspended users with same generic error
    if (user.status === "banned" || user.status === "suspended") {
      return NextResponse.json(
        { error: "invalid_credentials", message: "نام کاربری یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, user.password).catch(() => false);
    if (!ok) {
      return NextResponse.json(
        { error: "invalid_credentials", message: "نام کاربری یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    // Bypass email verification requirement.
    // To re-enable, simply uncomment this block and set emailVerified to null
    // in the register route.
    /*
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "email_not_verified", message: "ایمیل این حساب تأیید نشده است.", email: user.email },
        { status: 403 }
      );
    }
    */

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        roleFa: (user as any).roleFa || (user.role === "super_admin" ? "مدیر کل" : "کاربر عضو"),
        modules: parseModules(user.modules),
        avatar: user.avatar || ""
      }
    });
  } catch (err: any) {
    console.error("Login route error:", err);
    captureAuthError(err, "login");
    return NextResponse.json({ error: err?.message || "خطای سرور در پردازش ورود" }, { status: 500 });
  }
}
