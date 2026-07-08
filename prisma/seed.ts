import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed script initialized. Mock data has been permanently removed.");
  console.log("Please use the Admin Dashboard to create new content manually.");
  
  // Optional: We can add an initial Super Admin account here if the DB is entirely empty, 
  // but since your DB is already populated, we skip seeding.
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
