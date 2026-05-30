/**
 * Tests for --no-overrides-hygiene CLI option parsing (RFC-001 T4).
 * Mirrors the --no-unfixable pattern in cli-options.unfixable.test.js, but
 * lives at the canonical `cli-options.test.js` path so the TDD hook pairs
 * it with `cli-options.js` for the RFC-001 T4 edit cycle.
 *
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-DEFAULT-ON
 */

import { describe, it, expect } from 'vitest';
import { parseOptions } from './cli-options.js';

describe('Story 017.0-DEV-OVERRIDES-HYGIENE: parseOptions overrides-hygiene flag', () => {
  it('[REQ-OVERRIDES-DEFAULT-ON] defaults overridesHygiene to true', () => {
    const opts = parseOptions([]);
    expect(opts.overridesHygiene).toBe(true);
  });

  it('[REQ-OVERRIDES-DEFAULT-ON] --no-overrides-hygiene disables the surface', () => {
    const opts = parseOptions(['--no-overrides-hygiene']);
    expect(opts.overridesHygiene).toBe(false);
  });

  it('[REQ-OVERRIDES-DEFAULT-ON] accepts --no-overrides-hygiene alongside other flags without surfacing as unknown', () => {
    const opts = parseOptions(['--no-overrides-hygiene', '--check']);
    expect(opts.overridesHygiene).toBe(false);
    expect(opts.returnSummary).toBe(true);
  });
});
