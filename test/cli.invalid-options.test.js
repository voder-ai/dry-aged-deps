/**
 * Tests for invalid CLI options
 * @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-OPTION-VALIDATION REQ-UNKNOWN-OPTION-ERROR REQ-INVALID-VALUE-ERROR REQ-ERROR-EXIT-CODE
 */

import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.join(__dirname, '..', 'bin', 'dry-aged-deps.js');

describe('Story 014.0-DEV-INVALID-OPTION-ERROR: Invalid CLI options error handling', () => {
  it("[REQ-UNKNOWN-OPTION-ERROR] should error on unknown option '--foo'", async () => {
    const result = await execa('node', [cliPath, '--foo'], { reject: false });
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Error: Unknown option '--foo'");
    expect(result.stderr).toContain("Use 'dry-aged-deps --help' to see all available options.");
  });

  it("[REQ-UNKNOWN-OPTION-ERROR] should suggest '--format=json' for '--json'", async () => {
    const result = await execa('node', [cliPath, '--json'], { reject: false });
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Error: Unknown option '--json'");
    expect(result.stderr).toContain("Did you mean '--format=json'?");
    expect(result.stderr).toContain("Use 'dry-aged-deps --help' to see all available options.");
  });

  it("[REQ-UNKNOWN-OPTION-ERROR] should suggest '--format' for '--formatx'", async () => {
    const result = await execa('node', [cliPath, '--formatx'], { reject: false });
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Error: Unknown option '--formatx'");
    expect(result.stderr).toContain("Did you mean '--format'?");
    expect(result.stderr).toContain("Use 'dry-aged-deps --help' to see all available options.");
  });

  it("[REQ-INVALID-VALUE-ERROR] should error on invalid value for '--format=yaml'", async () => {
    const result = await execa('node', [cliPath, '--format=yaml'], { reject: false });
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('Invalid format: yaml. Valid values are: table, json, xml');
  });

  it('[REQ-UNKNOWN-OPTION-ERROR] should show multiple errors for multiple invalid flags', async () => {
    const result = await execa('node', [cliPath, '--json', '--formatx'], { reject: false });
    expect(result.exitCode).toBe(2);
    // Both errors for unknown options
    expect(result.stderr).toContain("Error: Unknown option '--json'");
    expect(result.stderr).toContain("Error: Unknown option '--formatx'");
    expect(result.stderr).toContain("Did you mean '--format=json'?");
    expect(result.stderr).toContain("Did you mean '--format'?");
    // Help suggestion only once at end
    expect(result.stderr).toMatch(/Use 'dry-aged-deps --help' to see all available options\./);
  });
});
