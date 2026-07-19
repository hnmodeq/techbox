import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const news = await prisma.post.findMany({
    where: { module: "news", published: true },
    orderBy: { date: "desc" },
    take: 2,
  });

  if (news.length === 0) {
    console.log("No news posts found in the database to bump.");
    return;
  }

  const now = new Date();
  
  if (news[0]) {
    await prisma.post.update({
      where: { id: news[0].id },
      data: { date: new Date(now.getTime() - 2 * 60 * 60 * 1000) } // 2 hours ago
    });
    console.log(`Bumped: ${news[0].title}`);
  }

  if (news[1]) {
    await prisma.post.update({
      where: { id: news[1].id },
      data: { date: new Date(now.getTime() - 15 * 60 * 60 * 1000) } // 15 hours ago
    });
    console.log(`Bumped: ${news[1].title}`);
  }

  console.log("Successfully bumped 2 real news posts to be within the last 24 hours.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
