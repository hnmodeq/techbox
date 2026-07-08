import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth-server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ حرف باشد"),
  username: z.string().min(3, "نام کاربری باید حداقل ۳ حرف باشد").regex(/^[a-zA-Z0-9_]+$/, "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد و آندرلاین باشد"),
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(5, "رمز عبور باید حداقل ۵ کاراکتر باشد")
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
    const user = await prisma.user.create({
      data: {
        name,
        username: cleanUsername,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "user",
        roleFa: "کاربر عضو",
        modules: "[]",
        avatar: ""
      }
    });

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
        roleFa: user.roleFa || "کاربر عضو",
        modules: [],
        avatar: user.avatar
      }
    }, { status: 201 });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "خطا در ثبت‌نام" }, { status: 400 });
  }
}
