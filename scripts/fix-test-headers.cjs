#!/usr/bin/env node

// Script to fix test file headers: ensure proper JSDoc block with @story and placeholder @req
// Usage: node scripts/fix-test-headers.cjs

const fs = require('fs');
const path = require('path');

const testDir = path.resolve(__dirname, '../test');
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.test.js'));

files.forEach(file => {
  const filePath = path.join(testDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Find first line containing @story
  const storyLineIndex = lines.findIndex(line => line.includes('@story'));
  if (storyLineIndex === -1) {
    console.warn(`No @story found in ${file}`);
    return;
  }
  // Extract story path
  const storyMatch = lines[storyLineIndex].match(/@story\s+(.+?\.md)/);
  if (!storyMatch) {
    console.warn(`Unable to parse story path in ${file}`);
    return;
  }
  const storyPath = storyMatch[1].trim();

  // Find end of existing JSDoc block (*/)
  let endIndex = storyLineIndex;
  for (let i = storyLineIndex; i < lines.length; i++) {
    if (lines[i].includes('*/')) {
      endIndex = i;
      break;
    }
  }

  // Construct new header
  const header = [
    '/**',
    ` * @story ${storyPath}`,
    ` * @req UNKNOWN - TODO: specify requirement ID and description`,
    ' */',
  ];

  // Replace lines [storyLineIndex..endIndex] with new header
  const newLines = [
    ...lines.slice(0, storyLineIndex),
    ...header,
    ...lines.slice(endIndex + 1),
  ];

  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log(`Fixed header in ${file}`);
});
