const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const posts = await prisma.post.findMany({ 
    where: { module: "shop", image: { not: null } }, 
    select: { image: true }, 
    take: 10 
  });
  posts.forEach(p => console.log(p.image));
  await prisma.$disconnect();
}
main();
