#!/usr/bin/env node

/**
 * Script to add @story and @req annotations to test files
 * Inserts a JSDoc header at the top of each .test.js file missing them
 * References a placeholder story map and requirement ID
 */
const fs = require('fs');
const path = require('path');

// Directory containing tests
const testDir = path.resolve(__dirname, '../test');

// Recursively collect .test.js files, excluding fixtures and helpers directories
function collectTestFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'fixtures' || entry.name === 'helpers') continue;
      files.push(...collectTestFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

const testFiles = collectTestFiles(testDir);
let annotatedCount = 0;
for (const filePath of testFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Skip files already annotated
  if (/\*\*[^]*@story .*\.md/.test(content) && /@req /.test(content)) {
    continue;
  }
  const header = `/**\n * @story prompts/dry-aged-deps-user-story-map.md\n * @req UNKNOWN - Placeholder traceability annotation\n */\n\n`;
  fs.writeFileSync(filePath, header + content, 'utf8');
  annotatedCount++;
  console.log(`Annotated ${path.relative(process.cwd(), filePath)}`);
}
console.log(`Traceability annotations added to ${annotatedCount} test files.`);
