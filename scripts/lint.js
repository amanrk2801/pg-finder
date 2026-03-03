const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TARGET_EXTENSIONS = new Set(['.js', '.json', '.md']);
const IGNORE_DIRS = new Set(['node_modules', '.git']);

let hasError = false;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    const ext = path.extname(entry.name);
    if (!TARGET_EXTENSIONS.has(ext)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');

    if (/^<{7}|^={7}|^>{7}/m.test(content)) {
      console.error(`Merge marker found: ${fullPath}`);
      hasError = true;
    }

    if (content.includes('\t')) {
      console.error(`Tab character found: ${fullPath}`);
      hasError = true;
    }
  }
}

walk(ROOT);

if (hasError) {
  process.exit(1);
}

console.log('Basic lint checks passed.');
