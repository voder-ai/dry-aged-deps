#!/usr/bin/env node

// Script to fix test file headers: ensure proper JSDoc block with @story and @req
// Usage: node scripts/fix-test-headers.cjs

const fs = require('fs');
const path = require('path');

const testDir = path.resolve(__dirname, '../test');
const files = fs.readdirSync(testDir).filter((f) => f.endsWith('.test.js'));

files.forEach((file) => {
  const filePath = path.join(testDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const storyMatch = content.match(/@story\s+([^\s*]+)/);
  if (!storyMatch) {
    console.warn(`No @story found in ${file}`);
    return;
  }
  const storyPath = storyMatch[1].trim();

  const codeStartIndex = lines.findIndex((line) => /^(import|const|let|var|describe|it|test)/.test(line));
  if (codeStartIndex === -1) {
    console.warn(`No code start found in ${file}`);
    return;
  }

  const header = [
    '/**',
    ` * @story ${storyPath}`,
    ' * @req UNKNOWN - TODO: specify requirement ID and description',
    ' */',
  ];

  const newLines = [...header, '', ...lines.slice(codeStartIndex)];

  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log(`Fixed header in ${file}`);
});
