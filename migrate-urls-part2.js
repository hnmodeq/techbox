const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const OLD = "https://gasy0aqpxehqiy8d.public.blob.vercel-storage.com";
const NEW = "https://nggwgcfkceuadvhxnczf.supabase.co/storage/v1/object/public/techbox";

function fixUrl(url) {
  if (typeof url !== 'string' || !url.includes(OLD)) return url;
  return url.replace(OLD, NEW).replace(/\.jpg$/i, '.webp').replace(/\.png$/i, '.webp');
}

async function run() {
  let total = 0;

  // Post gallery (JSON field — scan all)
  const allPosts = await prisma.post.findMany({ select: { id: true, gallery: true } });
  for (const p of allPosts) {
    if (!Array.isArray(p.gallery) || p.gallery.length === 0) continue;
    let changed = false;
    const updated = p.gallery.map(url => { const f = fixUrl(url); if (f !== url) changed = true; return f; });
    if (changed) { await prisma.post.update({ where: { id: p.id }, data: { gallery: updated } }); console.log('[gallery]', p.id); total++; }
  }

  // Timeline events
  const events = await prisma.timelineEvent.findMany({ select: { id: true, image: true } });
  for (const e of events) {
    if (!e.image || !e.image.includes(OLD)) continue;
    const newUrl = fixUrl(e.image);
    await prisma.timelineEvent.update({ where: { id: e.id }, data: { image: newUrl } });
    console.log('[timeline]', e.id);
    total++;
  }

  // Job resumes
  const apps = await prisma.jobApplication.findMany({ where: { resumeUrl: { contains: OLD } }, select: { id: true, resumeUrl: true } });
  for (const a of apps) {
    await prisma.jobApplication.update({ where: { id: a.id }, data: { resumeUrl: a.resumeUrl.replace(OLD, NEW) } });
    console.log('[resume]', a.id);
    total++;
  }

  console.log('Done! ' + total + ' more URLs updated.');
  await prisma.$disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
