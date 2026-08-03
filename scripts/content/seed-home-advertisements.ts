/**
 * Persist the owner-supplied homepage advertisement defaults exactly once.
 *
 * The application has the same list as a first-deploy fallback, but a real
 * SiteSetting row makes the admin panel the authority from launch. Existing
 * admin configuration is never overwritten.
 */
import { DEFAULT_HOME_ADVERTISEMENTS } from "../../features/home/lib/home-advertisements";
import { prisma } from "../checks/_shared";

const APPLY = process.argv.includes("--apply");
const CONFIRMED = process.env.HOME_ADVERTISEMENTS_CONFIRM === "production-authorized";
const KEY = "home.advertisements";

async function main() {
  const existing = await prisma.siteSetting.findUnique({
    where: { key: KEY },
    select: { id: true },
  });
  if (existing) {
    console.log(`${KEY} already exists; preserving the admin-managed value.`);
    return;
  }

  console.log(`Prepared ${DEFAULT_HOME_ADVERTISEMENTS.length} WebP homepage advertisements.`);
  if (!APPLY) {
    console.log("Dry run: no setting written.");
    return;
  }
  if (!CONFIRMED) {
    throw new Error("Refusing write: set HOME_ADVERTISEMENTS_CONFIRM=production-authorized.");
  }

  await prisma.siteSetting.create({
    data: {
      key: KEY,
      value: JSON.stringify(DEFAULT_HOME_ADVERTISEMENTS),
      updatedBy: "system:initial-home-advertisements",
    },
  });
  console.log(`Created ${KEY} with ${DEFAULT_HOME_ADVERTISEMENTS.length} advertisements.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
