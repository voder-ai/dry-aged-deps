/**
 * Tests for CLI outdated mock output (Story 001.0-DEV-RUN-NPM-OUTDATED).
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @req REQ-NPM-COMMAND - Execute npm outdated --json using child_process
 * @req REQ-OUTPUT-DISPLAY - Display results of npm outdated
 */

import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');

describe('dry-aged-deps CLI mocked outdated output', () => {
  it('prints mocked outdated package information', async () => {
    const result = await execa('node', [cliPath], {
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    expect(result.exitCode).toBe(1);

    const stdout = result.stdout;
    expect(stdout).toContain('Outdated packages:');
    expect(stdout).toContain('Name	Current	Wanted	Latest	Age (days)');
    expect(stdout).toContain('fakepkg	1.0.0	1.1.0	2.0.0');
  });
});