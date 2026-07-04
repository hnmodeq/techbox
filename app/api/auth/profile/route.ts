import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  job: z.string().optional(),
  birthday: z.string().optional(),
  avatar: z.string().optional()
});

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = profileSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.job !== undefined ? { job: data.job } : {}),
        ...(data.birthday !== undefined ? { birthday: data.birthday } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {})
      }
    });

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
        modules: JSON.parse(updated.modules || "[]"),
        avatar: updated.avatar || "/assets/hooman.png"
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "خطا در به‌روزرسانی پروفایل" }, { status: 400 });
  }
}
