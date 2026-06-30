/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();
const outputFile = path.join(rootDir, "readme", "tree.md");

const ignored = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".vercel",
  ".idea",
  ".vscode",
  ".DS_Store",
]);

// خواندن .gitignore
const gitignorePath = path.join(rootDir, ".gitignore");

if (fs.existsSync(gitignorePath)) {
  const lines = fs
    .readFileSync(gitignorePath, "utf8")
    .split("\n")
    .map(v => v.trim())
    .filter(v => v && !v.startsWith("#"));

  for (const line of lines) {
    ignored.add(line.replace(/\/$/, ""));
  }
}

function shouldIgnore(relativePath, name) {
  if (ignored.has(name)) return true;

  for (const item of ignored) {
    if (relativePath.startsWith(item)) {
      return true;
    }
  }

  return false;
}

function buildTree(dir, prefix = "") {
  const items = fs
    .readdirSync(dir)
    .sort((a, b) => {
      const aDir = fs.statSync(path.join(dir, a)).isDirectory();
      const bDir = fs.statSync(path.join(dir, b)).isDirectory();

      if (aDir && !bDir) return -1;
      if (!aDir && bDir) return 1;

      return a.localeCompare(b);
    });

  let output = "";

  items.forEach((item, index) => {
    const fullPath = path.join(dir, item);
    const relative = path.relative(rootDir, fullPath).replaceAll("\\", "/");

    if (shouldIgnore(relative, item)) return;

    const isLast = index === items.length - 1;
    const connector = isLast ? "└── " : "├── ";

    output += prefix + connector + item + "\n";

    if (fs.statSync(fullPath).isDirectory()) {
      output += buildTree(
        fullPath,
        prefix + (isLast ? "    " : "│   ")
      );
    }
  });

  return output;
}

const tree = `${path.basename(rootDir)}\n${buildTree(rootDir)}`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });

fs.writeFileSync(
  outputFile,
  `# Project Structure\n\n\`\`\`\n${tree}\`\`\`\n`,
  "utf8"
);

console.log(`✅ Tree exported to ${outputFile}`);