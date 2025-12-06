/**
 * Integration tests for dry-aged-deps CLI XML output format.
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG REQ-XML-SCHEMA REQ-COMPLETE-DATA REQ-SUMMARY-STATS REQ-SILENT-MODE REQ-EXIT-CODES
 */

import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Use project root as fixtures directory since mock mode bypasses npm operations
const fixturesDir = process.cwd();

describe('Story 009.0-DEV-XML-OUTPUT: dry-aged-deps CLI XML output format', () => {
  it('[REQ-XML-SCHEMA][REQ-COMPLETE-DATA] outputs valid XML with proper root and package elements', async () => {
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
    const result = await execa('node', [cliPath, '--format=xml'], {
      cwd: fixturesDir,
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    expect(result.exitCode).toBe(1);
    const xml = result.stdout;
    expect(xml.startsWith('<?xml')).toBe(true);
    expect(xml).toContain('<outdated-packages');
    expect(xml).toContain('<packages>');
    expect(xml).toMatch(/<package>\s*<name>.*<\/name>/);
  });

  it('[REQ-SILENT-MODE] excludes log warnings for XML format', async () => {
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
    const result = await execa('node', [cliPath, '--format=xml'], {
      cwd: fixturesDir,
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    expect(result.stderr).toBe('');
  });
});
