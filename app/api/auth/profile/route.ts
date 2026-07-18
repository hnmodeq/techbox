import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic, createEmailVerification } from "@/lib/auth-server";
import { sendEmail, emailTemplates } from "@/lib/email";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  job: z.string().optional(),
  birthday: z.string().optional(),
  avatar: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = profileSchema.parse(body);

    // Detect an actual email change so we can re-trigger verification.
    const newEmail = data.email !== undefined ? data.email.toLowerCase() : undefined;
    const emailChanged =
      newEmail !== undefined && newEmail !== (user.email ?? "").toLowerCase();

    // Ensure a new email isn't already taken by another account.
    if (emailChanged) {
      const clash = await prisma.user.findUnique({ where: { email: newEmail! } });
      if (clash) {
        return NextResponse.json(
          { error: "این ایمیل قبلاً توسط حساب دیگری استفاده شده است." },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(newEmail !== undefined ? { email: newEmail } : {}),
        ...(emailChanged ? { emailVerified: null } : {}),
        ...(data.job !== undefined ? { job: data.job } : {}),
        ...(data.birthday !== undefined ? { birthday: data.birthday } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
      },
      select: {
        id: true, name: true, username: true, email: true, role: true, roleFa: true,
        job: true, birthday: true, modules: true, avatar: true, emailVerified: true,
      },
    });

    // If the email changed, the user must verify the new address. They keep
    // their current session, but the next login will be blocked until verified.
    if (emailChanged) {
      try {
        const { rawToken } = await createEmailVerification(user.id);
        const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const verifyLink = `${base}/auth/verify-email?token=${rawToken}&email=${encodeURIComponent(newEmail!)}`;
        const { subject, html } = emailTemplates.emailVerification(verifyLink);
        await sendEmail({ to: newEmail!, subject, html });
      } catch {
        // Non-fatal: profile still saved; user can resend from login.
      }
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: updated.id,
        name: updated.name,
        username: updated.username,
        email: updated.email,
        role: updated.role,
        roleFa: updated.roleFa || (updated.role === "super_admin" ? "مدیر کل" : "کاربر"),
        job: updated.job || "",
        birthday: updated.birthday || "",
        modules: Array.isArray(updated.modules) ? updated.modules : [],
        avatar: updated.avatar || "/assets/hooman.png",
        emailVerified: !!updated.emailVerified,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "خطا در به‌روزرسانی پروفایل" }, { status: 400 });
  }
}
