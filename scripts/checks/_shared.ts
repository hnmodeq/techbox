import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export type Issue = {
  level: 'error' | 'warning';
  scope: string;
  id?: string;
  message: string;
  hint?: string;
};

export function printIssues(title: string, issues: Issue[]) {
  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');
  console.log(`\n${title}`);
  console.log(`${'='.repeat(title.length)}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  for (const issue of issues) {
    const icon = issue.level === 'error' ? '✖' : '⚠';
    console.log(`${icon} [${issue.scope}]${issue.id ? ` ${issue.id}` : ''}: ${issue.message}`);
    if (issue.hint) console.log(`  hint: ${issue.hint}`);
  }

  if (issues.length === 0) console.log('✓ No issues found.');
  return errors.length;
}

export function safeJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function safeJsonObject(value: string | null | undefined): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function isHttpUrl(value?: string | null) {
  return Boolean(value && /^https?:\/\//i.test(value));
}

export function isLocalUrl(value?: string | null) {
  return Boolean(value && value.startsWith('/'));
}

export function requiredEnv(name: string) {
  if (!process.env[name]) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
}
