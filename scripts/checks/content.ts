import { prisma, printIssues, safeJsonArray, safeJsonObject, type Issue } from './_shared';

const imageRequired = new Set(['blog', 'news', 'media', 'review', 'shop', 'forum']);

async function main() {
  const issues: Issue[] = [];
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true, _count: { select: { comments: true, ratings: true } } },
    orderBy: [{ module: 'asc' }, { slug: 'asc' }],
  });

  const seen = new Set<string>();
  for (const post of posts) {
    const id = `${post.module}/${post.slug}`;
    if (seen.has(id)) issues.push({ level: 'error', scope: 'post', id, message: 'duplicate module/slug seen in result' });
    seen.add(id);

    if (!post.title.trim()) issues.push({ level: 'error', scope: 'post', id, message: 'missing title' });
    if (!post.excerpt.trim()) issues.push({ level: 'warning', scope: 'post', id, message: 'missing excerpt' });
    if (!post.content.trim()) issues.push({ level: 'warning', scope: 'post', id, message: 'missing content' });
    if (!post.dateFa.trim()) issues.push({ level: 'warning', scope: 'post', id, message: 'missing Persian date/dateFa' });
    if (imageRequired.has(post.module) && !post.image) issues.push({ level: 'error', scope: 'post', id, message: 'missing required image' });
    if (!post.authorId && !post.authorName.trim()) issues.push({ level: 'warning', scope: 'post', id, message: 'missing author' });

    const tags = safeJsonArray(post.tags);
    if (tags.length === 0) issues.push({ level: 'warning', scope: 'post', id, message: 'no tags' });

    if (post.module === 'media') {
      if (!post.videoUrl) issues.push({ level: 'error', scope: 'media', id, message: 'missing videoUrl' });
      if (!post.videoDuration) issues.push({ level: 'warning', scope: 'media', id, message: 'missing videoDuration' });
      if (!post.videoMimeType) issues.push({ level: 'warning', scope: 'media', id, message: 'missing videoMimeType' });
      if (!post.videoFileSize) issues.push({ level: 'warning', scope: 'media', id, message: 'missing videoFileSize' });
    }

    if (post.module === 'review') {
      if (typeof post.rating !== 'number') issues.push({ level: 'error', scope: 'review', id, message: 'missing rating' });
      if ((post.ratingCount || 0) <= 0) issues.push({ level: 'warning', scope: 'review', id, message: 'ratingCount is zero' });
    }

    if (post.module === 'download') {
      if (!post.fileUrl) issues.push({ level: 'error', scope: 'download', id, message: 'missing fileUrl' });
      if (!post.fileName) issues.push({ level: 'error', scope: 'download', id, message: 'missing fileName' });
      if (!post.fileSize) issues.push({ level: 'warning', scope: 'download', id, message: 'missing fileSize' });
    }

    if (post.module === 'shop') {
      const gallery = safeJsonArray(post.gallery);
      const specs = safeJsonObject(post.specs);
      if (gallery.length === 0) issues.push({ level: 'error', scope: 'shop', id, message: 'missing gallery' });
      if (!post.brand) issues.push({ level: 'warning', scope: 'shop', id, message: 'missing brand' });
      if (!post.model) issues.push({ level: 'warning', scope: 'shop', id, message: 'missing model' });
      if (!post.sku) issues.push({ level: 'warning', scope: 'shop', id, message: 'missing sku' });
      if (!post.priceLabel) issues.push({ level: 'warning', scope: 'shop', id, message: 'missing priceLabel' });
      if (Object.keys(specs).length === 0) issues.push({ level: 'warning', scope: 'shop', id, message: 'empty specs' });
    }
  }

  const users = await prisma.user.findMany({ orderBy: { username: 'asc' } });
  for (const user of users) {
    if (!user.name.trim()) issues.push({ level: 'error', scope: 'user', id: user.username, message: 'missing name' });
    if (!user.avatar) issues.push({ level: 'warning', scope: 'user', id: user.username, message: 'missing avatar' });
    if (!['active', 'suspended', 'banned'].includes((user as any).status || 'active')) {
      issues.push({ level: 'error', scope: 'user', id: user.username, message: `invalid status ${(user as any).status}` });
    }
  }

  const errorCount = printIssues('TechBox content validation', issues);
  await prisma.$disconnect();
  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
