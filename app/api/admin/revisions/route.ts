import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireModulePermission } from "@/lib/api-permissions";

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });
  try {
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { module: true } });
    if (!post) return NextResponse.json({ error: "post_not_found" }, { status: 404 });
    const user = await requireModulePermission(post.module, "view");
    if (user instanceof NextResponse) return user;
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

export async function PATCH(req: NextRequest) {
  try {
    const { revisionId } = await req.json();
    if (!revisionId) return NextResponse.json({ error: "revisionId required" }, { status: 400 });
    const revision = await prisma.postRevision.findUnique({ where: { id: revisionId } });
    if (!revision) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const currentPost = await prisma.post.findUnique({ where: { id: revision.postId } });
    if (!currentPost) return NextResponse.json({ error: "post_not_found" }, { status: 404 });
    const user = await requireModulePermission(currentPost.module, "edit");
    if (user instanceof NextResponse) return user;

    await prisma.postRevision.create({
      data: {
        postId: currentPost.id,
        oldTitle: currentPost.title,
        oldContent: currentPost.content,
        oldImage: currentPost.image,
        editedBy: user.id,
      },
    });
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
