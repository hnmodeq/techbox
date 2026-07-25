import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBySlug } from "@/lib/content";

type Params = Promise<{ slug: string }>;

function isAllowedDownloadUrl(value: string) {
  try {
    const storageBase = new URL(process.env.SUPABASE_URL || "");
    const url = new URL(value);
    const bucket = process.env.SUPABASE_PUBLIC_BUCKET || "techbox";
    return url.protocol === "https:" && url.hostname === storageBase.hostname &&
      url.pathname.startsWith(`/storage/v1/object/public/${bucket}/`);
  } catch {
    return false;
  }
}

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { slug } = await params;
  try {
    const post = await prisma.post.findUnique({
      where: { module_slug: { module: "download", slug } },
      select: {
        id: true, slug: true, fileUrl: true, fileName: true, fileSize: true,
        downloadCount: true, published: true, deletedAt: true,
      },
    });

    if (post?.published && !post.deletedAt && post.fileUrl) {
      if (!isAllowedDownloadUrl(post.fileUrl)) {
        return NextResponse.json(
          { error: "download_unavailable", message: "آدرس فایل دانلودی معتبر نیست." },
          { status: 400 }
        );
      }
      const updated = await prisma.post.update({
        where: { id: post.id },
        data: { downloadCount: { increment: 1 } },
        select: { downloadCount: true },
      });
      const response = NextResponse.redirect(new URL(post.fileUrl), 302);
      response.headers.set("Cache-Control", "no-store");
      response.headers.set("X-TechBox-Download-Count", String(updated.downloadCount));
      if (post.fileName) response.headers.set("X-TechBox-File-Name", post.fileName);
      if (post.fileSize) response.headers.set("X-TechBox-File-Size", post.fileSize);
      return response;
    }

    const fallback = getBySlug("download", slug) as any;
    if (fallback?.fileUrl && isAllowedDownloadUrl(fallback.fileUrl)) {
      const response = NextResponse.redirect(new URL(fallback.fileUrl), 302);
      response.headers.set("Cache-Control", "no-store");
      return response;
    }
    return NextResponse.json(
      { error: "download_unavailable", message: "برای این آیتم فایل دانلودی ثبت نشده است." },
      { status: 404 }
    );
  } catch {
    return NextResponse.json(
      { error: "download_failed", message: "خطا در دریافت فایل." },
      { status: 503 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
