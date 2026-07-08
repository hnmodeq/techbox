import { prisma } from "@/lib/db";

export async function createPostRevision(params: {
  postId: string;
  oldTitle?: string;
  oldContent?: string;
  oldImage?: string;
  editedBy?: string;
}) {
  try {
    await prisma.postRevision.create({
      data: {
        postId: params.postId,
        oldTitle: params.oldTitle,
        oldContent: params.oldContent,
        oldImage: params.oldImage,
        editedBy: params.editedBy,
      },
    });
  } catch (e) {
    console.error("[revision] Failed to create revision:", e);
  }
}

export async function getPostRevisions(postId: string) {
  return prisma.postRevision.findMany({
    where: { postId },
    orderBy: { editedAt: "desc" },
    take: 20,
  });
}
