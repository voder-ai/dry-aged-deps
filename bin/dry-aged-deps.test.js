/**
 * Smoke test for bin/dry-aged-deps.js — threads the RFC-001 T4
 * `--no-overrides-hygiene` flag through to printOutdated without erroring.
 *
 * Co-located in bin/ so the TDD hook pairs it with `bin/dry-aged-deps.js`
 * for the RFC-001 T4 edit cycle; deeper CLI integration tests already live
 * in test/cli-entrypoint.test.js per the ADR-0020 cross-cutting exception.
 *
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-DEFAULT-ON
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
});
