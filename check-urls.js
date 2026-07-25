const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const posts = await prisma.post.findMany({ where: { image: { not: null } }, select: { image: true, videoUrl: true }, take: 3 });
  posts.forEach(p => { console.log('image:', p.image); console.log('video:', p.videoUrl); });
  const users = await prisma.user.findMany({ where: { avatar: { not: null } }, select: { avatar: true }, take: 2 });
  users.forEach(u => console.log('avatar:', u.avatar));
  await prisma.$disconnect();
}
main();
