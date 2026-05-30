/**
 * Tests for --no-unfixable / --unfixable-level CLI option parsing.
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DEFAULT-ON REQ-UNFIXABLE-SEVERITY-FLOOR
 */

import { describe, it, expect } from 'vitest';
import { parseOptions } from './cli-options.js';

describe('Story 016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES: parseOptions unfixable flags', () => {
  it('[REQ-UNFIXABLE-DEFAULT-ON] defaults to on with severity floor low (surface all)', () => {
    const opts = parseOptions([]);
    expect(opts.unfixable).toBe(true);
    expect(opts.unfixableLevel).toBe('low');
  });

  it('[REQ-UNFIXABLE-DEFAULT-ON] --no-unfixable disables the surface', () => {
    const opts = parseOptions(['--no-unfixable']);
    expect(opts.unfixable).toBe(false);
  });

  it('[REQ-UNFIXABLE-SEVERITY-FLOOR] --unfixable-level raises the floor', () => {
    const opts = parseOptions(['--unfixable-level=high']);
    expect(opts.unfixable).toBe(true);
    expect(opts.unfixableLevel).toBe('high');
  });
});
