import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";

// GET /api/admin/revisions?postId=xxx — fetch revisions for a post
export async function GET(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const postId = req.nextUrl.searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

  try {
    const revisions = await prisma.postRevision.findMany({
      where: { postId },
      orderBy: { editedAt: "desc" },
      take: 30,
    });
    return NextResponse.json(revisions);
  } catch (error) {
    console.error("[revisions]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

// PATCH /api/admin/revisions — restore a revision
export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { revisionId } = await req.json();
    if (!revisionId) return NextResponse.json({ error: "revisionId required" }, { status: 400 });

    const revision = await prisma.postRevision.findUnique({ where: { id: revisionId } });
    if (!revision) return NextResponse.json({ error: "not_found" }, { status: 404 });

    // Get current post to create a revision of the current state before restoring
    const currentPost = await prisma.post.findUnique({ where: { id: revision.postId } });
    if (!currentPost) return NextResponse.json({ error: "post_not_found" }, { status: 404 });

    // Save current state as a new revision
    await prisma.postRevision.create({
      data: {
        postId: currentPost.id,
        oldTitle: currentPost.title,
        oldContent: currentPost.content,
        oldImage: currentPost.image,
        editedBy: user.id,
      },
    });

    // Restore the old values
    const updated = await prisma.post.update({
      where: { id: revision.postId },
      data: {
        title: revision.oldTitle ?? currentPost.title,
        content: revision.oldContent ?? currentPost.content,
        image: revision.oldImage ?? currentPost.image,
      },
    });

    return NextResponse.json({ ok: true, post: updated });
  } catch (error) {
    console.error("[revisions]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
