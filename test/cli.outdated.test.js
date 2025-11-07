import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { runCli } from './helpers/cli-helper';
import path from 'path';

describe('dry-aged-deps CLI outdated output', () => {
  beforeAll(() => {
    // Preload mock module to stub npm commands
    const mockPath = path.resolve(__dirname, 'helpers/cli.outdated.mock.js');
    process.env.CLI_MOCK_PATH = mockPath;
  });

  afterAll(() => {
    delete process.env.CLI_MOCK_PATH;
  });

  it('prints a table header and data row for a fake outdated package', async () => {
    const result = await runCli([]);
    expect(result.exitCode).toBe(0);
    const outputLines = result.stdout.split('\n').filter(Boolean);
    // First line: Outdated packages:
    expect(outputLines[0]).toBe('Outdated packages:');
    // Second line: header
    expect(outputLines[1]).toBe('Name	Current	Wanted	Latest	Age (days)');
    // Third line: fakepkg data row
    const row = outputLines[2].split('	');
    expect(row[0]).toBe('fakepkg');
    expect(row[1]).toBe('1.0.0');
    expect(row[2]).toBe('1.1.0');
    expect(row[3]).toBe('2.0.0');
    // Age should be a number or "N/A"
    expect(/^(?:\d+|N\/A)$/.test(row[4])).toBe(true);
  });
});
