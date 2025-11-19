#!/usr/bin/env node

/**
 * Load audit-resolve.json to get excluded advisory IDs and run better-npm-audit accordingly.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const filePath = path.resolve(process.cwd(), 'audit-resolve.json');
let data;
try {
  data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
} catch (e) {
  console.error(`Error reading ${filePath}:`, e);
  process.exit(1);
}
const ids = data.exclusions.map((e) => e.id).join(',');
// Run better-npm-audit with the specified exclusions
const cmd = `npx better-npm-audit audit --level high --exclude ${ids}`;
console.log(`Running: ${cmd}`);
try {
  execSync(cmd, { stdio: 'inherit' });
} catch (err) {
  process.exit(err.status || 1);
}
