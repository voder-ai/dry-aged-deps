/**
 * Tests for --no-overrides-hygiene (RFC-001 T4) and --exposure-aware-soak
 * (RFC-002 T4) CLI option parsing. Both groups live at the canonical
 * `cli-options.test.js` path so the TDD hook pairs them with `cli-options.js`
 * for their respective T4 edit cycles (per P020 strict stem-match — the
 * variant `cli-options.<variant>.test.js` files coexist for backwards
 * compatibility but the hook only honours the canonical stem).
 *
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-DEFAULT-ON
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-CLI-FLAG REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED
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

describe('Story 018.0-DEV-EXPOSURE-AWARE-SOAK: parseOptions exposure-aware-soak flag (RFC-002 T4)', () => {
  it('[REQ-EXPOSURE-OFF-BY-DEFAULT-PRESERVED] defaults exposureAwareSoak to false (opt-in for v1)', () => {
    const opts = parseOptions([]);
    expect(opts.exposureAwareSoak).toBe(false);
  });

  it('[REQ-EXPOSURE-CLI-FLAG] --exposure-aware-soak opts in', () => {
    const opts = parseOptions(['--exposure-aware-soak']);
    expect(opts.exposureAwareSoak).toBe(true);
  });

  it('[REQ-EXPOSURE-CLI-FLAG] --no-exposure-aware-soak is the explicit default', () => {
    const opts = parseOptions(['--no-exposure-aware-soak']);
    expect(opts.exposureAwareSoak).toBe(false);
  });

  it('[REQ-EXPOSURE-CLI-FLAG] accepts --exposure-aware-soak alongside other flags without surfacing as unknown', () => {
    const opts = parseOptions(['--exposure-aware-soak', '--check']);
    expect(opts.exposureAwareSoak).toBe(true);
    expect(opts.returnSummary).toBe(true);
  });
});
