#!/usr/bin/env node

// Script to prepend @story header to test files in test/ directory
// Only add header if not already present as first non-blank line

const fs = require('fs');
const path = require('path');

const testDir = path.resolve(__dirname, '../test');
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.test.js'));

files.forEach(file => {
  const filePath = path.join(testDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  // Check if header already present
  if (lines[0].trim().startsWith('/** @story')) {
    console.log(`Header exists in ${file}, skipping`);
    return;
  }

  // Find index of first code line (import, const, let, var, describe, test)
  const codeIndex = lines.findIndex(line => {
    const t = line.trim();
    return t.startsWith('import ') || t.startsWith('const ') || t.startsWith('let ') || t.startsWith('var ') || t.startsWith('describe(') || t.startsWith('test(') || t.startsWith('it(');
  });
  const prefix = lines.slice(0, codeIndex >= 0 ? codeIndex : 0);
  const code = lines.slice(codeIndex >= 0 ? codeIndex : 0);

  const header = `/** @story prompts/dry-aged-deps-user-story-map.md */`;
  const newLines = [header, '', ...code];
  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log(`Prepended header to ${file}`);
});