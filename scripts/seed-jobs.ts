import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const jobsPath = path.join(process.cwd(), 'prisma/mock-data/jobs.json');
  const jobsData = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));

  console.log('Seeding jobs...');

  for (const job of jobsData) {
    await prisma.job.upsert({
      where: { slug: job.slug },
      update: {
        title: job.title,
        type: job.type,
        remote: job.remote.includes('ریموت') || job.remote.includes('هیبرید'),
        team: job.team,
        excerpt: job.excerpt,
        description: job.description,
        active: true,
        createdAt: new Date(job.date),
      },
      create: {
        slug: job.slug,
        title: job.title,
        type: job.type,
        remote: job.remote.includes('ریموت') || job.remote.includes('هیبرید'),
        team: job.team,
        excerpt: job.excerpt,
        description: job.description,
        active: true,
        createdAt: new Date(job.date),
      },
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
