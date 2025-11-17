#!/usr/bin/env node
// Validate that no test files contain placeholder traceability annotations
const { execSync } = require('child_process');
const path = require('path');

function runGrep(pattern) {
  try {
    execSync(`grep -R '${pattern}' test`, { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

let hasError = false;

// Check for story map references
if (runGrep('@story prompts/.*-user-story-map\\.md')) {
  console.error('Error: Found @story referencing user-story-map in test files. Please reference specific story files.');
  hasError = true;
}

// Check for placeholder @req UNKNOWN
if (runGrep('@req UNKNOWN')) {
  console.error('Error: Found placeholder @req UNKNOWN in test files. Please update to specific requirement IDs.');
  hasError = true;
}

if (hasError) {
  console.error('Traceability validation failed.');
  process.exit(1);
} else {
  console.log('Traceability validation passed.');
  process.exit(0);
}
