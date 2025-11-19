#!/usr/bin/env node
/**
 * scripts/add-ts-check.js
 *
 * Adds // @ts-check to the top of all .js source files under src/ and bin/
 *
 * Traceability:
 *  - Story: @story ???
 *  - Requirement: @req UNKNOWN
 *  - Source prompt: prompts/???
 *
 * Usage: Run from project root: node scripts/add-ts-check.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function traverseDir(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found, skipping: ${dir}`);
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      traverseDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (!content.startsWith('// @ts-check')) {
        fs.writeFileSync(fullPath, '// @ts-check\n' + content, 'utf8');
        console.log(`Added @ts-check to ${fullPath}`);
      }
    }
  }
}

// Ensure this script file is executable on the filesystem (best effort).
try {
  const __filename = fileURLToPath(import.meta.url);
  const stat = fs.statSync(__filename);
  // Add owner execute bit while preserving other permission bits
  const newMode = stat.mode | 0o100; // Owner execute
  fs.chmodSync(__filename, newMode);
} catch (err) {
  // Non-fatal; just warn
  console.warn('Could not set executable bit on script file:', err.message);
}

const srcDir = path.join(process.cwd(), 'src');
const binDir = path.join(process.cwd(), 'bin');

traverseDir(srcDir);
traverseDir(binDir);
