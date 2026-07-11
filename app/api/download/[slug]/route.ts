import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBySlug } from "@/lib/content";

type Params = Promise<{ slug: string }>;

/** Allowed hosts for download redirects — only Vercel Blob / configured CDN. */
const ALLOWED_DOWNLOAD_HOSTS = new Set([
  "blob.vercel-storage.com",
  "public.blob.vercel-storage.com",
]);

function isAllowedDownloadUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    return u.protocol === "https:" && ALLOWED_DOWNLOAD_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { slug } = await params;

  try {
    const post = await prisma.post.findUnique({
      where: { module_slug: { module: "download", slug } },
      select: {
        id: true,
        slug: true,
        fileUrl: true,
        fileName: true,
        fileSize: true,
        downloadCount: true,
        published: true,
      },
    });

    if (post && post.published && post.fileUrl) {
      if (!isAllowedDownloadUrl(post.fileUrl)) {
        return NextResponse.json(
          { error: "download_unavailable", message: "آدرس فایل دانلودی معتبر نیست." },
          { status: 400 },
        );
      }

      const updated = await prisma.post.update({
        where: { id: post.id },
        data: { downloadCount: { increment: 1 } },
        select: { downloadCount: true },
      });

      const target = new URL(post.fileUrl);
      const res = NextResponse.redirect(target, 302);
      res.headers.set("Cache-Control", "no-store");
      res.headers.set("X-TechBox-Download-Count", String(updated.downloadCount));
      if (post.fileName) res.headers.set("X-TechBox-File-Name", post.fileName);
      if (post.fileSize) res.headers.set("X-TechBox-File-Size", post.fileSize);
      return res;
    }

    const fallback = getBySlug("download", slug) as any;
    if (fallback?.fileUrl) {
      if (!isAllowedDownloadUrl(fallback.fileUrl)) {
        return NextResponse.json(
          { error: "download_unavailable", message: "آدرس فایل دانلودی معتبر نیست." },
          { status: 400 },
        );
      }

      const target = new URL(fallback.fileUrl);
      const res = NextResponse.redirect(target, 302);
      res.headers.set("Cache-Control", "no-store");
      if (fallback.fileName) res.headers.set("X-TechBox-File-Name", fallback.fileName);
      if (fallback.fileSize) res.headers.set("X-TechBox-File-Size", fallback.fileSize);
      return res;
    }

    return NextResponse.json(
      { error: "download_unavailable", message: "برای این آیتم فایل دانلودی ثبت نشده است." },
      { status: 404 },
    );
  } catch {
    return NextResponse.json(
      { error: "download_failed", message: "خطا در دریافت فایل." },
      { status: 503 },
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
