// Story: prompts/013.0-DEV-CHECK-MODE.md
// Tests for CI/CD integration documentation in README.md and docs/api.md

import fs from 'fs/promises';
import path from 'path';
import { describe, it, expect } from 'vitest';

describe('CI/CD Integration documentation', () => {
  it('README.md contains CI/CD Integration example with --check flag and failure step', async () => {
    const readmePath = path.resolve(__dirname, '../../README.md');
    const content = await fs.readFile(readmePath, 'utf8');
    // Section title
    expect(content).toContain('## CI/CD Integration');
    // Check flag usage example
    expect(content).toContain('npx dry-aged-deps --check');
    // Failure step example
    expect(content).toContain('if: failure()');
  });

  it('docs/api.md contains CI/CD Integration section with exit code semantics', async () => {
    const apiPath = path.resolve(__dirname, '../../docs/api.md');
    const content = await fs.readFile(apiPath, 'utf8');
    // Section title and exit code semantics
    expect(content).toContain('## CI/CD Integration');
    expect(content).toContain('exit codes are');
    expect(content).toContain('- `0`: No safe updates available (success)');
    expect(content).toContain('- `1`: Safe updates available (failure)');
    expect(content).toContain('- `2`: Execution error');
  });
});
