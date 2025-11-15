#!/usr/bin/env node

// Script to fix test file headers: ensure proper JSDoc @story header
// Usage: node scripts/fix-test-headers-v2.cjs

const fs = require('fs');
const path = require('path');

const testDir = path.resolve(__dirname, '../test');
const files = fs.readdirSync(testDir).filter((f) => f.endsWith('.test.js'));

for (const file of files) {
  const filePath = path.join(testDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  // Find index of first code line
  const codeIdx = lines.findIndex((line) => {
    const t = line.trim();
    return t.startsWith('import') || t.startsWith('describe') || t.startsWith('test') || t.startsWith('it');
  });
  const rest = codeIdx >= 0 ? lines.slice(codeIdx) : lines;

  const header = ['/**', ' * @story prompts/dry-aged-deps-user-story-map.md', ' */', ''];

  const newContent = header.concat(rest).join('\n');
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Fixed header in ${file}`);
}
