/**
 * Tests for runProjectAudit — thin I/O wrapper around `npm audit --json`.
 *
 * RFC-001 T4: shape refactored to return the raw `{ vulnerabilities }` payload
 * so the same fetch can drive BOTH the unfixable surface (ADR-0018) and the
 * overrides-hygiene surface (RFC-001). The unfixable surface still consumes
 * `Object.values(...)` at its use site.
 *
 * @supports prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md REQ-UNFIXABLE-DETECT
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-AUDIT-XREF
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execFile } from 'child_process';
import { runProjectAudit } from './run-project-audit.js';

vi.mock('child_process');

describe('Story 016/017: runProjectAudit', () => {
  let errSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('[REQ-OVERRIDES-AUDIT-XREF] returns the raw audit payload with name-keyed vulnerabilities', async () => {
    execFile.mockImplementationOnce((cmd, args, opts, callback) => {
      callback(
        null,
        JSON.stringify({
          vulnerabilities: {
            'brace-expansion': { name: 'brace-expansion', severity: 'moderate', via: [] },
          },
        }),
        ''
      );
    });
    const result = await runProjectAudit();
    expect(result).toHaveProperty('vulnerabilities');
    expect(result.vulnerabilities['brace-expansion']).toEqual({
      name: 'brace-expansion',
      severity: 'moderate',
      via: [],
    });
  });

  it('[REQ-UNFIXABLE-DETECT] returns { vulnerabilities: {} } when npm audit emits no stdout', async () => {
    execFile.mockImplementationOnce((cmd, args, opts, callback) => {
      callback(null, '', '');
    });
    const result = await runProjectAudit();
    expect(result).toEqual({ vulnerabilities: {} });
  });

  it('[REQ-UNFIXABLE-DETECT] degrades to { vulnerabilities: {} } on JSON parse failure', async () => {
    execFile.mockImplementationOnce((cmd, args, opts, callback) => {
      callback(null, 'not-json{{', '');
    });
    const result = await runProjectAudit();
    expect(result).toEqual({ vulnerabilities: {} });
    expect(errSpy).toHaveBeenCalled();
  });

  it('[REQ-UNFIXABLE-DETECT] degrades to { vulnerabilities: {} } when the payload lacks a vulnerabilities map', async () => {
    execFile.mockImplementationOnce((cmd, args, opts, callback) => {
      callback(null, JSON.stringify({ metadata: {} }), '');
    });
    const result = await runProjectAudit();
    expect(result).toEqual({ vulnerabilities: {} });
  });
});
