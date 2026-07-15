import { prisma } from "@/lib/db";
import { formatPostDateFa } from "@/lib/post-date";

const HOUR_MS = 60 * 60 * 1000;

async function main() {
  const now = new Date();
  const futurePosts = await prisma.post.findMany({
    where: {
      deletedAt: null,
      date: { gt: now },
    },
    orderBy: { date: "asc" },
    select: { id: true, module: true, slug: true, title: true, date: true },
  });

  if (futurePosts.length === 0) {
    console.log("No future-dated posts found.");
    return;
  }

  console.log(`Found ${futurePosts.length} future-dated posts. Moving them to real past publish dates...`);

  for (const [index, post] of futurePosts.entries()) {
    const fixedDate = new Date(now.getTime() - index * HOUR_MS);
    await prisma.post.update({
      where: { id: post.id },
      data: {
        date: fixedDate,
        dateFa: formatPostDateFa(fixedDate),
      },
    });
    console.log(`${post.module}/${post.slug}: ${post.date.toISOString()} -> ${fixedDate.toISOString()}`);
  }

  console.log("Future post dates fixed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
