/**
 * Remove every Turbopack/Next dev artifact, including the persistent
 * filesystem cache.
 *
 * `rm -rf .next` is NOT sufficient on Next 16.1+. Turbopack's dev cache
 * (.next/dev/cache/turbopack) is an on-disk LSM store that is enabled by
 * default, and a browser holding chunks from an older build alongside newly
 * served ones ends up with two HMR clients disagreeing about the build id.
 * Each then orders a full reload, which is the dev refresh loop.
 *
 * Run with `pnpm clean`, or `pnpm dev:clean` to clean and start in one step.
 */
import { rm } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const targets = [
  ".next",
  ".turbo",
  "node_modules/.cache",
];

for (const target of targets) {
  const full = path.join(root, target);
  try {
    await rm(full, { recursive: true, force: true });
    console.log(`removed ${target}`);
  } catch (error) {
    console.warn(`could not remove ${target}: ${error.message}`);
  }
}

// Which env files exist, and therefore which DATABASE_URL actually wins.
//
// Next loads .env.local AFTER .env in development, so a leftover
// .env.local silently overrides a freshly-updated .env — the usual reason
// a project appears to still be pointed at an old database after a
// provider switch.
import { existsSync } from "node:fs";

const envFiles = [".env", ".env.local", ".env.development", ".env.development.local"]
  .filter((file) => existsSync(path.join(root, file)));

if (envFiles.length > 1) {
  console.log(
    `\nNOTE: ${envFiles.length} env files present: ${envFiles.join(", ")}\n` +
    "Later files override earlier ones in development. If you just switched\n" +
    "databases, make sure the OLD url is not still sitting in a later file.\n" +
    "`pnpm db:doctor` prints the host actually being used.",
  );
}

console.log(
  "\nDev caches cleared. The browser also caches the old build:\n" +
  "  DevTools -> Application -> Storage -> Clear site data,\n" +
  "or just open the page in a private window.",
);
