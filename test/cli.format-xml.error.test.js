import { describe, it, expect } from 'vitest';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('dry-aged-deps CLI XML error output', () => {
  it('emits XML error block and exits with code 2 when npm outdated fails', async () => {
    // Create a temporary empty directory (no package.json)
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dry-aged-deps-'));
    const cliPath = path.join(process.cwd(), 'bin', 'dry-aged-deps.js');
    // Run CLI in empty directory
    const result = await execa(
      'node',
      [cliPath, '--format=xml'],
      { cwd: tempDir, env: process.env, reject: false }
    );
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