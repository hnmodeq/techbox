import { prisma, printIssues, safeJsonArray, isHttpUrl, isLocalUrl, type Issue } from './_shared';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function checkUrl(url: string) {
  let lastStatus: number | undefined;
  let lastError: string | undefined;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
      lastStatus = response.status;
      if (response.ok) return { ok: true, status: response.status };
      if (![429, 502, 503, 504].includes(response.status)) {
        return { ok: false, status: response.status, transient: false };
      }
      const retryAfter = Number(response.headers.get('retry-after'));
      await wait(Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 500 * (2 ** attempt));
    } catch (error: any) {
      lastError = error?.message || 'request_failed';
      await wait(500 * (2 ** attempt));
    }
  }

  // A rate-limited/transient provider response does not prove the object is
  // missing. Report it, but do not turn an informational integrity job red.
  return { ok: false, status: lastStatus, error: lastError, transient: true };
}

function isRetiredVercelBlobUrl(url: string) {
  try {
    return new URL(url).hostname.endsWith("public.blob.vercel-storage.com");
  } catch {
    return false;
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

  const limit = Number(process.env.STORAGE_CHECK_LIMIT || 500);
  console.log(`Checking ${Math.min(targets.length, limit)} of ${targets.length} remote storage URLs...`);
  for (const target of targets.slice(0, limit)) {
    const result = await checkUrl(target.url);
    if (!result.ok) {
      const retired = isRetiredVercelBlobUrl(target.url);
      const transient = result.transient === true;
      issues.push({
        level: retired || transient ? 'warning' : 'error',
        scope: target.scope,
        id: target.id,
        message: `${target.field} URL failed (${result.status || result.error || 'unknown'})${retired ? ' — retired Vercel Blob reference' : transient ? ' — transient provider response after retries' : ''}`,
        hint: target.url,
      });
    }
    await wait(25);
  }

  const errorCount = printIssues('TechBox Supabase storage/URL validation', issues);
  await prisma.$disconnect();
  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
