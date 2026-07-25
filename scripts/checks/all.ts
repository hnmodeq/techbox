import { spawnSync } from 'node:child_process';

const checks: Array<[string, string]> = [
  ['content', 'scripts/checks/content.ts'],
  ['db', 'scripts/checks/db.ts'],
  ['storage', 'scripts/checks/storage.ts'],
];

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
let failed = false;
for (const [name, script] of checks) {
  console.log(`\nRunning check:${name}...`);
  const result = spawnSync(pnpm, ['exec', 'tsx', script], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) failed = true;
}

process.exit(failed ? 1 : 0);
