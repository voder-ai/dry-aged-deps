/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format , traceability/valid-annotation-format */
/**
 * Integration tests for dry-aged-deps CLI XML error output.
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-ERROR-FORMAT - Format errors as XML when in XML mode
 * @req REQ-EXIT-2 - Exit code 2 on errors
 */

import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('prompts/009.0-DEV-XML-OUTPUT.md: dry-aged-deps CLI XML error output', () => {
  it('emits XML error block and exits with code 2 when npm outdated output is invalid JSON', async () => {
    // Create a temporary directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dry-aged-deps-'));
    // Create fake npm script that outputs invalid JSON
    const fakeNpmDir = path.join(tempDir, 'fake-npm');
    await fs.mkdir(fakeNpmDir, { recursive: true });
    const npmPath = path.join(fakeNpmDir, 'npm');
    await fs.writeFile(npmPath, '#!/usr/bin/env node\nconsole.log("not valid json");\nprocess.exit(0);');
    await fs.chmod(npmPath, 0o755);

    const cliPath = path.join(process.cwd(), 'bin', 'dry-aged-deps.js');
    // Run CLI with fake npm in PATH
    const env = { ...process.env, PATH: `${fakeNpmDir}:${process.env.PATH}` };
    const result = await execa('node', [cliPath, '--format=xml'], {
      cwd: tempDir,
      env,
      reject: false,
    });

    expect(result.exitCode).toBe(2);
    const xml = result.stdout;
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<outdated-packages timestamp="');
    expect(xml).toContain('<error>');
    expect(xml).toContain('<message>');
    // Ensure closing tag present
    expect(xml.trim().endsWith('</outdated-packages>')).toBe(true);
  });
});
