import { NextResponse } from "next/server";
import { getHomeData } from "@/lib/home-server";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

export async function GET() {
  try {
    const data = await getHomeData();
    return NextResponse.json(data, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "home_failed", modules: {}, ticker: [] },
      { status: 503, headers: cacheHeaders(PRIVATE_NO_STORE) }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
