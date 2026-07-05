import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth-server";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ حرف باشد"),
  username: z.string().min(3, "نام کاربری باید حداقل ۳ حرف باشد").regex(/^[a-zA-Z0-9_]+$/, "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد و آندرلاین باشد"),
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(5, "رمز عبور باید حداقل ۵ کاراکتر باشد")
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, username, email, password } = registerSchema.parse(body);

    const cleanUsername = username.toLowerCase();
    let existing: any = null;
    try {
      existing = await prisma.user.findFirst({
        where: {
          OR: [
            { username: cleanUsername },
            { email: email.toLowerCase() }
          ]
        }
      });
    } catch (dbErr: any) {
      console.warn("Prisma lookup failed during register, checking mock data:", dbErr.message);
      try {
        const mockUsers = require("@/prisma/mock-data/users.json");
        existing = mockUsers.find((u: any) => u.username.toLowerCase() === cleanUsername || u.email?.toLowerCase() === email.toLowerCase());
      } catch {}
    }

    if (existing) {
      if (existing.username === cleanUsername) {
        return NextResponse.json({ error: "این نام کاربری قبلا ثبت شده است" }, { status: 409 });
      }
      return NextResponse.json({ error: "این ایمیل قبلا در سیستم ثبت شده است" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    let user: any;
    try {
      user = await prisma.user.create({
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
    } catch (createErr: any) {
      if (String(createErr?.message).includes("Unknown argument")) {
        user = await prisma.user.create({
          data: {
            name,
            username: cleanUsername,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "user",
            modules: "[]",
            avatar: ""
          }
        });
      } else {
        const gUsers = globalThis as unknown as { __local_users__?: Record<string, any> };
        if (!gUsers.__local_users__) gUsers.__local_users__ = {};
        user = {
          id: `local_${Date.now()}`,
          name,
          username: cleanUsername,
          email: email.toLowerCase(),
          role: "user",
          roleFa: "کاربر عضو",
          modules: "[]",
          avatar: ""
        };
        gUsers.__local_users__[user.id] = user;
      }
    }

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
