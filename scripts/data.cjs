/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();

const outputFile = path.join(rootDir, "readme", "data.md");

const targets = [
"app",
"components",
"config",
"constants",
"data",
"design",
"features",
"hooks",
"lib",
"prisma",
"providers",
"public",
"stores",
"tests",
"types",
"package.json",
"tsconfig.json",
"pnpm-workspace.yaml",
"next.config.mjs",
"next-env.d.ts",
"postcss.config.mjs",
".env",
".env.local"
];

const allowedExtensions = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".css",
  ".scss",
  ".json",
  ".md",
];

function getLanguageByExtension(filePath) {
  const ext = path.extname(filePath);

  switch (ext) {
    case ".ts":
      return "ts";
    case ".tsx":
      return "tsx";
    case ".js":
      return "js";
    case ".jsx":
      return "jsx";
    case ".css":
      return "css";
    case ".scss":
      return "scss";
    case ".json":
      return "json";
    case ".md":
      return "md";
    default:
      return "";
  }
}

function getAllFiles(dirPath) {
  let results = [];

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else {
      const ext = path.extname(fullPath);

      if (allowedExtensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

function toRelativePath(filePath) {
  return path.relative(rootDir, filePath).replaceAll("\\", "/");
}

let output = "";

for (const target of targets) {
  const absoluteTarget = path.join(rootDir, target);

  if (!fs.existsSync(absoluteTarget)) {
    console.warn(`⚠️ Not found: ${target}`);
    continue;
  }

  const stat = fs.statSync(absoluteTarget);

  const files = stat.isDirectory()
    ? getAllFiles(absoluteTarget)
    : [absoluteTarget];

  for (const file of files) {
    const relativeFilePath = toRelativePath(file);
    const language = getLanguageByExtension(file);
    const content = fs.readFileSync(file, "utf8");

    output += `## \`${relativeFilePath}\`\n\n`;
    output += `\`\`\`${language}\n`;
    output += content;
    output += `\n\`\`\`\n\n`;
    output += "---\n\n";
  }
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, output, "utf8");

console.log(`✅ Export completed: ${toRelativePath(outputFile)}`);
