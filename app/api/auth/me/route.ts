import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";

export async function GET(){
 const user = await getSessionUser();
 if(!user) return NextResponse.json({ user: null });
 return NextResponse.json({ user: {
 id: user.id, name: user.name, username: user.username,
 role: user.role, modules: JSON.parse(user.modules), avatar: user.avatar
 }});
}

export const dynamic = "force-dynamic";
