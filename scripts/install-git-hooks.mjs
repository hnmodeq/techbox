#!/usr/bin/env node
/**
 * Installs the repository's git hooks.
 *
 * Run once after cloning:  node scripts/install-git-hooks.mjs
 *
 * Git hooks are not versioned by git itself, so they have to be copied into
 * .git/hooks. This installs a pre-commit hook that runs gitleaks against the
 * staged diff and refuses the commit if a credential is found — the control
 * that would have stopped the Neon password and GitHub PAT that reached this
 * repository's history in July 2026.
 *
 * The hook degrades to a warning when gitleaks is not installed, so it never
 * blocks a contributor who has not set it up yet. CI enforces the same rules
 * unconditionally.
 */

import fs from "node:fs";
import path from "node:path";

const HOOK = `#!/bin/sh
# TechBox pre-commit: block credentials before they become history.
# Managed by scripts/install-git-hooks.mjs — edit there, not here.

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "[pre-commit] gitleaks not installed — skipping secret scan."
  echo "[pre-commit] Install it:  brew install gitleaks   |   https://github.com/gitleaks/gitleaks"
  exit 0
fi

echo "[pre-commit] Scanning staged changes for secrets..."
if ! gitleaks protect --staged --config .gitleaks.toml --redact --verbose; then
  echo ""
  echo "[pre-commit] BLOCKED: a credential was found in your staged changes."
  echo ""
  echo "  Do NOT commit it. Remove the value and use an environment variable."
  echo "  If the finding is a false positive, add it to [allowlist] in .gitleaks.toml."
  echo "  To bypass in a genuine emergency:  git commit --no-verify"
  echo ""
  exit 1
fi

echo "[pre-commit] Clean."
exit 0
`;

const gitDir = path.resolve(process.cwd(), ".git");
if (!fs.existsSync(gitDir)) {
  console.error("[install-git-hooks] No .git directory here. Run from the repository root.");
  process.exit(1);
}

const hooksDir = path.join(gitDir, "hooks");
fs.mkdirSync(hooksDir, { recursive: true });

const target = path.join(hooksDir, "pre-commit");
fs.writeFileSync(target, HOOK, { mode: 0o755 });

console.log(`[install-git-hooks] Installed pre-commit hook -> ${target}`);
console.log("[install-git-hooks] Requires gitleaks: https://github.com/gitleaks/gitleaks");
