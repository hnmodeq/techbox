import { NextResponse } from "next/server";
import { getSessionUserPublic } from "@/lib/auth-server";

export async function GET(){
  const user = await getSessionUserPublic();
  if(!user) return NextResponse.json({ user: null });
  const modules = Array.isArray(user.modules) ? user.modules : [];
  return NextResponse.json({ user: {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    status: (user as any).status || "active",
    roleFa: user.roleFa || (user.role === "super_admin" ? "مدیر کل" : "کاربر"),
    job: user.job || "",
    birthday: user.birthday || "",
    modules,
    avatar: user.avatar ?? ""
  }});
}

export const dynamic = "force-dynamic";
