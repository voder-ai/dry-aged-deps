/* eslint-disable traceability/require-branch-annotation */
/**
 * Tests for CLI exit code behaviors
 * @supports prompts/012.0-DEV-EXIT-CODE-REFINEMENT.md REQ-EXIT-0 REQ-EXIT-1 REQ-EXIT-2
 */

import { execa } from 'execa';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Story 012.0-DEV-EXIT-CODE-REFINEMENT: dry-aged-deps CLI error exit code', () => {
  let fakeNpmDir;

  beforeAll(() => {
    // Create a temporary directory for fake npm executable
    fakeNpmDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fake-npm-'));
    const npmPath = path.join(fakeNpmDir, 'npm');
    fs.writeFileSync(npmPath, '#!/usr/bin/env node\n' + 'console.log("not valid json");' + '\nprocess.exit(0);');
    // Make the fake npm executable
    fs.chmodSync(npmPath, 0o755);
  });

  afterAll(() => {
    // Clean up fake npm directory
    fs.rmSync(fakeNpmDir, { recursive: true, force: true });
  });

  it('[REQ-EXIT-2] exits with code 2 when npm outdated output is invalid JSON', async () => {
    const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');
    // Prepend fake npm directory to PATH
    const env = Object.assign({}, process.env, {
      PATH: `${fakeNpmDir}:${process.env.PATH}`,
    });

    await expect(execa('node', [cliPath], { env })).rejects.toMatchObject({
      exitCode: 2,
    });

    try {
      await execa('node', [cliPath], { env });
    } catch (err) {
      expect(err.stderr).toContain('Failed to parse npm outdated output');
    }
  }, 30000);
});
