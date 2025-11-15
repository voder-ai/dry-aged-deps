#!/usr/bin/env node

// Script to add a placeholder @req JSDoc tag under the first @story header in each test file
// Usage: node scripts/add-req-annotations.cjs

const fs = require('fs');
const path = require('path');

const testDir = path.resolve(__dirname, '../test');
const files = fs.readdirSync(testDir);

files.forEach((file) => {
  if (!file.endsWith('.test.js')) return;
  const filePath = path.join(testDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  // Do not add if @req already present
  if (content.includes('@req')) {
    return;
  }
  // Find the position of the first @story tag
  const storyMatch = content.match(/@story\s+(.+?\.md)/);
  if (!storyMatch) {
    console.warn(`No @story header found in ${file}`);
    return;
  }
  // Insert @req placeholder after the @story line
  const storyLine = storyMatch[0];
  const lines = content.split('\n');
  const idx = lines.findIndex((line) => line.includes(storyLine));
  if (idx === -1) {
    console.warn(`Story line not found in lines for ${file}`);
    return;
  }
  // Determine indentation from story line
  const indent = lines[idx].match(/^(\s*)\*/);
  const prefix = indent ? indent[1] + '* ' : '* ';
  const reqLine = `${prefix}@req UNKNOWN - TODO: specify requirement ID and description`;
  lines.splice(idx + 1, 0, reqLine);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`Annotated ${file} with placeholder @req`);
});
