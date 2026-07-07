import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBySlug } from "@/lib/content";

type Params = Promise<{ slug: string }>;

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
      const updated = await prisma.post.update({
        where: { id: post.id },
        data: { downloadCount: { increment: 1 } },
        select: { downloadCount: true },
      });

      const target = new URL(post.fileUrl, req.url);
      const res = NextResponse.redirect(target, 302);
      res.headers.set("Cache-Control", "no-store");
      res.headers.set("X-TechBox-Download-Count", String(updated.downloadCount));
      if (post.fileName) res.headers.set("X-TechBox-File-Name", post.fileName);
      if (post.fileSize) res.headers.set("X-TechBox-File-Size", post.fileSize);
      return res;
    }

    const fallback = getBySlug("download", slug) as any;
    if (fallback?.fileUrl) {
      const target = new URL(fallback.fileUrl, req.url);
      const res = NextResponse.redirect(target, 302);
      res.headers.set("Cache-Control", "no-store");
      if (fallback.fileName) res.headers.set("X-TechBox-File-Name", fallback.fileName);
      if (fallback.fileSize) res.headers.set("X-TechBox-File-Size", fallback.fileSize);
      return res;
    }

    return NextResponse.json(
      { error: "download_unavailable", message: "برای این آیتم فایل دانلودی ثبت نشده است." },
      { status: 404 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "download_failed" }, { status: 503 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
