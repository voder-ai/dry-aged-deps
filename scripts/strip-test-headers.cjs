#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');

async function processFile(filePath) {
  const rel = path.relative(process.cwd(), filePath);
  if (rel.includes(`${path.sep}helpers${path.sep}`) || rel.includes(`${path.sep}fixtures${path.sep}`)) {
    return;
  }
  let content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const idx = lines.findIndex((line) => /^\s*(import|describe|it|test|const|let|var)/.test(line));
  if (idx > 0) {
    const newContent = lines.slice(idx).join('\n');
    await fs.writeFile(filePath, newContent, 'utf-8');
    console.log(`Cleaned header: ${rel}`);
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'helpers' || entry.name === 'fixtures') continue;
      await walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      await processFile(fullPath);
    }
  }
}

walk(path.resolve(process.cwd(), 'test')).catch((err) => {
  console.error(err);
  process.exit(1);
});
