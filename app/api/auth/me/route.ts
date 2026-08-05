import { NextResponse } from "next/server";
import { getSessionUserPublicStrict } from "@/lib/auth-server";
import { deriveModulesFromPermissions, getEffectivePermissions } from "@/lib/user-permissions";
import { isDbUnreachable, logDbFailure } from "@/lib/db-error";

export async function GET() {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    console.error("[auth/me] AUTH_SECRET is missing or too short.");
    return NextResponse.json({ user: null, error: "server_config_error" }, { status: 503 });
  }

  try {
    const user = await getSessionUserPublicStrict();
    if (!user) return NextResponse.json({ user: null });
    const permissions = await getEffectivePermissions(user);
    const modules = deriveModulesFromPermissions(user.role, permissions);
    return NextResponse.json({ user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status || "active",
      roleFa: user.roleFa || (user.role === "super_admin" ? "مدیر کل" : "کاربر"),
      job: user.job || "",
      bio: user.bio || "",
      birthday: user.birthday || "",
      modules,
      permissions,
      avatar: user.avatar ?? "",
      emailVerified: Boolean(user.emailVerified),
      verifiedType: user.verifiedType || null,
      verifiedLabel: user.verifiedLabel || null,
    }});
  } catch (error) {
    if (isDbUnreachable(error)) logDbFailure("auth/me", error);
    return NextResponse.json(
      { user: null, error: "auth_temporarily_unavailable" },
      { status: 503 },
    );
  }
}

export const dynamic = "force-dynamic";
