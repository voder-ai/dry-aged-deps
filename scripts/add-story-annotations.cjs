#!/usr/bin/env node

// Script to add @story JSDoc header to test files missing them
// Usage: node scripts/add-story-annotations.cjs

const fs = require('fs');
const path = require('path');

const testDir = path.resolve(__dirname, '../test');
const files = fs.readdirSync(testDir);

files.forEach(file => {
  if (!file.endsWith('.test.js')) return;
  const filePath = path.join(testDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  // Check if @story already present
  if (/\*\*\s*@story/.test(content)) {
    return;
  }
  // Prepend header
  const header = `/** @story prompts/dry-aged-deps-user-story-map.md */\n`;
  fs.writeFileSync(filePath, header + content, 'utf8');
  console.log(`Annotated ${file}`);
});