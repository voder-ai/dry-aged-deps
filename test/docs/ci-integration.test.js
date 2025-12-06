/**
 * Tests for CI/CD integration documentation (Story 013.0-DEV-CHECK-MODE).
 * @supports prompts/013.0-DEV-CHECK-MODE.md REQ-CHECK-FLAG REQ-EXIT-0-NO-UPDATES REQ-EXIT-1-ON-UPDATES REQ-EXIT-2-ON-ERROR
 */

import fs from 'fs/promises';
import path from 'path';
import { describe, it, expect } from 'vitest';

describe('Story 013.0-DEV-CHECK-MODE: CI/CD Integration documentation', () => {
  it('[REQ-CHECK-FLAG] README.md contains CI/CD Integration example with --check flag and failure step', async () => {
    const readmePath = path.resolve(__dirname, '../../README.md');
    const content = await fs.readFile(readmePath, 'utf8');
    // Section title
    expect(content).toContain('## CI/CD Integration');
    // Check flag usage example
    expect(content).toContain('npx dry-aged-deps --check');
    // Failure step example
    expect(content).toContain('if: failure()');
  });

  it('[REQ-EXIT-0-NO-UPDATES][REQ-EXIT-1-ON-UPDATES][REQ-EXIT-2-ON-ERROR] docs/api.md contains CI/CD Integration section with exit code semantics', async () => {
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
