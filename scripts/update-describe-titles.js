#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

async function getTestFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['fixtures', 'fixtures-up-to-date'].includes(entry.name)) {
        continue;
      }
      const nested = await getTestFiles(fullPath);
      files = files.concat(nested);
    } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function processFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  const storyRegex = /@story\s+(.+)/g;
  let match;
  const stories = [];
  while ((match = storyRegex.exec(content)) !== null) {
    stories.push(match[1].trim());
  }
  if (stories.length === 0) {
    return;
  }
  const prefix = stories.join(' & ');
  const describeRegex = /describe\(\s*(['"`])(.+?)\1/;
  const replaced = content.replace(describeRegex, (fullMatch, quote, title) => {
    if (title.startsWith(prefix)) {
      return fullMatch;
    }
    const newTitle = `${prefix}: ${title}`;
    return fullMatch.replace(title, newTitle);
  });
  if (replaced !== content) {
    await fs.writeFile(filePath, replaced, 'utf8');
    console.log(`Updated describe in ${filePath}`);
  }
}

async function run() {
  const testDir = path.resolve('test');
  const files = await getTestFiles(testDir);
  for (const file of files) {
    await processFile(file);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});