/**
 * Integration tests for dry-aged-deps CLI XML output format.
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-CLI-FLAG - Accepts --format=xml command-line flag
 * @req REQ-XML-VALID - Outputs valid XML with proper root and package elements
 * @req REQ-SILENT-MODE - Suppresses log warnings for XML format
 * @req REQ-EXIT-1 - Exit code 1 when safe updates available
 */

import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Use project root as fixtures directory since mock mode bypasses npm operations
const fixturesDir = process.cwd();

describe('dry-aged-deps CLI XML output format', () => {
  it('outputs valid XML with proper root and package elements', async () => {
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

  it('excludes log warnings for XML format', async () => {
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
    const result = await execa('node', [cliPath, '--format=xml'], {
      cwd: fixturesDir,
      env: { ...process.env, DRY_AGED_DEPS_MOCK: '1' },
      reject: false,
    });
    expect(result.stderr).toBe('');
  });
});
