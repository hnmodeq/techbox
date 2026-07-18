import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getSessionUser,
  verifyPassword,
  hashPassword,
  invalidateAllSessions,
  createSession,
  setSessionCookie,
} from "@/lib/auth-server";
import { z } from "zod";

const pwdSchema = z.object({
  currentPassword: z.string().min(1, "رمز عبور فعلی الزامی است"),
  newPassword: z.string().min(8, "رمز عبور جدید باید حداقل ۸ کاراکتر باشد")
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = pwdSchema.parse(body);

    const ok = await verifyPassword(currentPassword, user.password).catch(() => false);
    if (!ok) {
      return NextResponse.json({ error: "رمز عبور فعلی اشتباه است" }, { status: 400 });
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed }
    });

    // Revoke every other session (other devices) for this account, then issue a
    // fresh token for the current browser so the user stays logged in here.
    await invalidateAllSessions(user.id);
    const fresh = await createSession(user.id);
    await setSessionCookie(fresh);

    return NextResponse.json({ ok: true, message: "رمز عبور با موفقیت تغییر کرد" });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "خطا در تغییر رمز عبور" }, { status: 400 });
  }
}
