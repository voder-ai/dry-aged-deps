/**
 * Smoke test for bin/dry-aged-deps.js — threads RFC-001 T4
 * `--no-overrides-hygiene` and RFC-002 T4 `--exposure-aware-soak` flags
 * through to printOutdated without erroring.
 *
 * Co-located in bin/ so the TDD hook pairs it with `bin/dry-aged-deps.js`
 * for the T4 edit cycles; deeper CLI integration tests already live in
 * test/cli-entrypoint.test.js per the ADR-0020 cross-cutting exception.
 *
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-DEFAULT-ON
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-CLI-FLAG
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';

describe('Story 017.0-DEV-OVERRIDES-HYGIENE: bin/dry-aged-deps.js', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const cliPath = path.resolve(__dirname, './dry-aged-deps.js');

  it('[REQ-OVERRIDES-DEFAULT-ON] accepts --no-overrides-hygiene without surfacing as an unknown option', async () => {
    const result = await execa('node', [cliPath, '--no-overrides-hygiene', '--help'], {
      reject: false,
    });
    expect(result.exitCode).toBe(0);
    expect(result.stderr).not.toContain('Unknown option');
  });

  it('[REQ-OVERRIDES-EXIT-CODE] --help advertises the widened --check exit-1 trigger for override pins with a safe upgrade target (RFC-001 T6)', async () => {
    const result = await execa('node', [cliPath, '--help'], { reject: false });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/override pins with a safe upgrade target/);
  });

  it('[REQ-EXPOSURE-CLI-FLAG] accepts --exposure-aware-soak without surfacing as an unknown option (RFC-002 T4)', async () => {
    const result = await execa('node', [cliPath, '--exposure-aware-soak', '--help'], {
      reject: false,
    });
    expect(result.exitCode).toBe(0);
    expect(result.stderr).not.toContain('Unknown option');
  });

  it('[REQ-EXPOSURE-CLI-FLAG] accepts --no-exposure-aware-soak without surfacing as an unknown option (RFC-002 T4)', async () => {
    const result = await execa('node', [cliPath, '--no-exposure-aware-soak', '--help'], {
      reject: false,
    });
    expect(result.exitCode).toBe(0);
    expect(result.stderr).not.toContain('Unknown option');
  });
});
