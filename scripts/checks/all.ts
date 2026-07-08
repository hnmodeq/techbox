import { spawnSync } from 'node:child_process';

const checks: Array<[string, string[]]> = [
  ['content', ['tsx', 'scripts/checks/content.ts']],
  ['db', ['tsx', 'scripts/checks/db.ts']],
  ['blob', ['tsx', 'scripts/checks/blob.ts']],
];

let failed = false;
for (const [name, args] of checks) {
  console.log(`\nRunning check:${name}...`);
  const result = spawnSync('npx', args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) failed = true;
}

process.exit(failed ? 1 : 0);
