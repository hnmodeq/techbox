import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";

export async function GET(){
  const user = await getSessionUser();
  if(!user) return NextResponse.json({ user: null });
  let modules = [];
  try { modules = JSON.parse(user.modules || "[]"); } catch {}
  return NextResponse.json({ user: {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    roleFa: user.roleFa || (user.role === "super_admin" ? "مدیر کل" : "کاربر"),
    job: user.job || "",
    birthday: user.birthday || "",
    modules,
    avatar: user.avatar ?? ""
  }});
}

export const dynamic = "force-dynamic";
