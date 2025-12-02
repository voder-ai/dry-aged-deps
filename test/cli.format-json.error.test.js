/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format , traceability/valid-annotation-format */
/**
 * Integration tests for dry-aged-deps CLI JSON error output.
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @req REQ-ERROR-FORMAT - Format errors as JSON objects when in JSON mode
 * @req REQ-EXIT-2 - Exit code 2 on errors
 */

import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Story: prompts/008.0-DEV-JSON-OUTPUT.md - JSON error format tests
describe('prompts/008.0-DEV-JSON-OUTPUT.md: dry-aged-deps CLI JSON error output', () => {
  it('emits JSON error block and exits with code 2 when npm outdated command fails', async () => {
    // Create a temporary directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dry-aged-deps-'));
    // Create fake npm directory
    const fakeNpmDir = path.join(tempDir, 'fake-npm');
    await fs.mkdir(fakeNpmDir, { recursive: true });
    const npmPath = path.join(fakeNpmDir, 'npm');
    // Write fake npm that errors
    await fs.writeFile(npmPath, '#!/usr/bin/env node\nconsole.error("fatal error"); process.exit(1);');
    await fs.chmod(npmPath, 0o755);

    const cliPath = path.join(process.cwd(), 'bin', 'dry-aged-deps.js');
    // Run CLI with fake npm in PATH
    const result = await execa('node', [cliPath, '--format=json'], {
      cwd: tempDir,
      env: { ...process.env, PATH: `${fakeNpmDir}:${process.env.PATH}` },
      reject: false,
    });

    expect(result.exitCode).toBe(2);
    // No stderr output
    expect(result.stderr).toBe('');
    // stdout should be valid JSON with timestamp and error
    expect(() => JSON.parse(result.stdout)).not.toThrow();
    const obj = JSON.parse(result.stdout);
    expect(obj).toHaveProperty('timestamp');
    expect(obj).toHaveProperty('error');
    expect(obj.error).toHaveProperty('message');
    expect(obj.error).toHaveProperty('code');
    expect(obj.error).toHaveProperty('details');
  });
});
