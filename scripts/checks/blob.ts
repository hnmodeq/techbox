import { prisma, printIssues, safeJsonArray, isHttpUrl, isLocalUrl, type Issue } from './_shared';

async function checkUrl(url: string) {
  try {
    const head = await fetch(url, { method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (head.ok) return { ok: true, status: head.status };
    const get = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' }, cache: 'no-store', signal: AbortSignal.timeout(8000) });
    return { ok: get.ok, status: get.status };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'request_failed' };
  }
}

async function main() {
  const issues: Issue[] = [];
  const targets: Array<{ scope: string; id: string; field: string; url: string }> = [];
  const posts = await prisma.post.findMany({ where: { published: true }, orderBy: [{ module: 'asc' }, { slug: 'asc' }] });
  const users = await prisma.user.findMany({ orderBy: { username: 'asc' } });

  for (const post of posts) {
    const id = `${post.module}/${post.slug}`;
    for (const [field, url] of Object.entries({ image: post.image, videoUrl: post.videoUrl, fileUrl: post.fileUrl })) {
      if (url && isHttpUrl(url)) targets.push({ scope: 'post', id, field, url });
      else if (url && !isLocalUrl(url)) issues.push({ level: 'warning', scope: 'url', id, message: `${field} is neither http nor local path`, hint: url });
    }
    for (const url of safeJsonArray(post.gallery)) {
      if (isHttpUrl(url)) targets.push({ scope: 'post', id, field: 'gallery', url });
      else if (!isLocalUrl(url)) issues.push({ level: 'warning', scope: 'url', id, message: 'gallery URL is neither http nor local path', hint: url });
    }
  }

  for (const user of users) {
    if (user.avatar && isHttpUrl(user.avatar)) targets.push({ scope: 'user', id: user.username, field: 'avatar', url: user.avatar });
  }

  const limit = Number(process.env.BLOB_CHECK_LIMIT || 500);
  console.log(`Checking ${Math.min(targets.length, limit)} of ${targets.length} remote URLs...`);
  for (const target of targets.slice(0, limit)) {
    const result = await checkUrl(target.url);
    if (!result.ok) {
      issues.push({
        level: 'error',
        scope: target.scope,
        id: target.id,
        message: `${target.field} URL failed (${result.status || result.error || 'unknown'})`,
        hint: target.url,
      });
    }
  }

  const errorCount = printIssues('TechBox Blob/URL validation', issues);
  await prisma.$disconnect();
  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
