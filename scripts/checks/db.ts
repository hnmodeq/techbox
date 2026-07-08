import { prisma, printIssues, type Issue } from './_shared';

async function main() {
  const issues: Issue[] = [];

  const [posts, users, comments, ratings, likes, redirects] = await Promise.all([
    prisma.post.findMany({ select: { id: true, module: true, slug: true, authorId: true } }),
    prisma.user.findMany({ select: { id: true, username: true } }),
    prisma.comment.findMany({ select: { id: true, postId: true, authorId: true, parentId: true, status: true } }),
    prisma.rating.findMany({ select: { id: true, postId: true, userId: true, value: true } }),
    prisma.like.findMany({ select: { id: true, module: true, slug: true, userId: true } }),
    prisma.slugRedirect.findMany({ select: { id: true, sourceModule: true, sourceSlug: true, targetModule: true, targetSlug: true } }),
  ]);

  const postIds = new Set(posts.map((p) => p.id));
  const userIds = new Set(users.map((u) => u.id));
  const commentIds = new Set(comments.map((c) => c.id));
  const postKeys = new Set(posts.map((p) => `${p.module}:${p.slug}`));

  for (const comment of comments) {
    if (!postIds.has(comment.postId)) issues.push({ level: 'error', scope: 'comment', id: comment.id, message: 'orphan comment postId' });
    if (comment.authorId && !userIds.has(comment.authorId)) issues.push({ level: 'warning', scope: 'comment', id: comment.id, message: 'comment authorId points to missing user' });
    if (comment.parentId && !commentIds.has(comment.parentId)) issues.push({ level: 'warning', scope: 'comment', id: comment.id, message: 'comment parentId points to missing comment' });
    if (!['approved', 'pending', 'hidden', 'spam'].includes(comment.status)) issues.push({ level: 'error', scope: 'comment', id: comment.id, message: `invalid status ${comment.status}` });
  }

  for (const rating of ratings) {
    if (!postIds.has(rating.postId)) issues.push({ level: 'error', scope: 'rating', id: rating.id, message: 'orphan rating postId' });
    if (!userIds.has(rating.userId)) issues.push({ level: 'error', scope: 'rating', id: rating.id, message: 'orphan rating userId' });
    if (rating.value < 1 || rating.value > 5) issues.push({ level: 'error', scope: 'rating', id: rating.id, message: 'rating value outside 1..5' });
  }

  for (const like of likes) {
    if (!postKeys.has(`${like.module}:${like.slug}`)) issues.push({ level: 'warning', scope: 'like', id: like.id, message: `like points to missing post ${like.module}/${like.slug}` });
    if (like.userId && !userIds.has(like.userId)) issues.push({ level: 'warning', scope: 'like', id: like.id, message: 'like userId points to missing user' });
  }

  for (const redirect of redirects) {
    if (!postKeys.has(`${redirect.targetModule}:${redirect.targetSlug}`)) {
      issues.push({ level: 'warning', scope: 'redirect', id: redirect.id, message: `target does not exist ${redirect.targetModule}/${redirect.targetSlug}` });
    }
  }

  const errorCount = printIssues('TechBox database consistency validation', issues);
  await prisma.$disconnect();
  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
