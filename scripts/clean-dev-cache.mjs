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

console.log(
  "\nDev caches cleared. The browser also caches the old build:\n" +
  "  DevTools -> Application -> Storage -> Clear site data,\n" +
  "or just open the page in a private window.",
);
