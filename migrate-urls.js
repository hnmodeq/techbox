const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const OLD = "https://gasy0aqpxehqiy8d.public.blob.vercel-storage.com";
const NEW = "https://nggwgcfkceuadvhxnczf.supabase.co/storage/v1/object/public/techbox";

// Folders that map 1:1 (same path, just domain + extension change)
const IMAGE_FOLDERS = ["thumbnails", "article-images", "news-images", "review-images", "timeline-images", "avatars"];

async function run() {
  let total = 0;

  // 1. Post images (non-product)
  const posts = await prisma.post.findMany({ where: { image: { contains: OLD } }, select: { id: true, image: true, module: true } });
  for (const p of posts) {
    // Skip shop products — they need manual update
    if (p.module === "shop") continue;
    const newUrl = p.image.replace(OLD, NEW).replace(/\.jpg$/i, '.webp').replace(/\.png$/i, '.webp');
    await prisma.post.update({ where: { id: p.id }, data: { image: newUrl } });
    console.log('[post image]', p.image.slice(-40), '->', newUrl.slice(-40));
    total++;
  }

  // 2. Post videos (add -small suffix)
  const videoPosts = await prisma.post.findMany({ where: { videoUrl: { contains: OLD } }, select: { id: true, videoUrl: true } });
  for (const p of videoPosts) {
    const newUrl = p.videoUrl.replace(OLD, NEW).replace(/\.mp4$/i, '-small.mp4');
    await prisma.post.update({ where: { id: p.id }, data: { videoUrl: newUrl } });
    console.log('[post video]', p.videoUrl.slice(-40), '->', newUrl.slice(-40));
    total++;
  }

  // 3. User avatars
  const users = await prisma.user.findMany({ where: { avatar: { contains: OLD } }, select: { id: true, avatar: true } });
  for (const u of users) {
    const newUrl = u.avatar.replace(OLD, NEW).replace(/\.jpg$/i, '.webp').replace(/\.png$/i, '.webp');
    await prisma.user.update({ where: { id: u.id }, data: { avatar: newUrl } });
    console.log('[avatar]', u.avatar.slice(-40), '->', newUrl.slice(-40));
    total++;
  }

  // 4. Post gallery
  const galleryPosts = await prisma.post.findMany({ where: { gallery: { contains: OLD } }, select: { id: true, gallery: true } });
  for (const p of galleryPosts) {
    if (!Array.isArray(p.gallery)) continue;
    const updated = p.gallery.map(url => typeof url === 'string' ? url.replace(OLD, NEW).replace(/\.jpg$/i, '.webp').replace(/\.png$/i, '.webp') : url);
    await prisma.post.update({ where: { id: p.id }, data: { gallery: updated } });
    console.log('[gallery]', p.id);
    total++;
  }

  // 5. Timeline events
  const events = await prisma.timelineEvent.findMany({ where: { image: { contains: OLD } }, select: { id: true, image: true } });
  for (const e of events) {
    const newUrl = e.image.replace(OLD, NEW).replace(/\.jpg$/i, '.webp').replace(/\.png$/i, '.webp');
    await prisma.timelineEvent.update({ where: { id: e.id }, data: { image: newUrl } });
    console.log('[timeline]', e.image.slice(-40), '->', newUrl.slice(-40));
    total++;
  }

  // 6. JobApplication resumes
  const apps = await prisma.jobApplication.findMany({ where: { resumeUrl: { contains: OLD } }, select: { id: true, resumeUrl: true } });
  for (const a of apps) {
    const newUrl = a.resumeUrl.replace(OLD, NEW);
    await prisma.jobApplication.update({ where: { id: a.id }, data: { resumeUrl: newUrl } });
    console.log('[resume]', a.id);
    total++;
  }

  console.log(`\nDone! ${total} URLs updated.`);
  console.log('\nNOTE: Product (shop) images skipped — update manually via admin panel.');
  await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
