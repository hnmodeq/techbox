import { NextResponse } from "next/server";
import { getSessionUserPublic } from "@/lib/auth-server";

export async function GET(){
  // Check AUTH_SECRET before attempting auth operations
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    console.error("[auth/me] AUTH_SECRET is missing or too short. Set it in Vercel environment variables (≥32 chars).");
    return NextResponse.json({ user: null, error: "server_config_error" });
  }

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
    bio: user.bio || "",
    birthday: user.birthday || "",
    modules,
    avatar: user.avatar ?? "",
    emailVerified: user.emailVerified ? true : false,
  }});
}

export const dynamic = "force-dynamic";
