/**
 * Canonical test file for src/print-outdated-handlers.js (P020 stem-match registration).
 *
 * The handler exports are thin pass-throughs to the equivalent functions in
 * src/print-outdated-utils.js; the heavy behavioural surface lives there
 * (covered by src/print-outdated-utils.test.js + src/print-unfixable-section.test.js).
 * This file guards the public-handler contract: each handler is exported and
 * forwards its options object verbatim to the delegate, so RFC-001 T5's
 * `overridesHygiene` field (and any future additive field) reaches the
 * delegate without per-field plumbing.
 *
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-OUTPUT-DISPLAY
 * @supports prompts/017.0-DEV-OVERRIDES-HYGIENE.md REQ-OVERRIDES-JSON REQ-OVERRIDES-XML REQ-OVERRIDES-TABLE
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { handleJsonOutput, handleXmlOutput, handleTableOutput } from './print-outdated-handlers.js';

describe('Story 001.0-DEV-RUN-NPM-OUTDATED: print-outdated-handlers pass-through contract', () => {
  afterEach(() => vi.restoreAllMocks());

  /** @story prompts/008.0-DEV-JSON-OUTPUT.md */
  it('[REQ-CLI-FLAG] handleJsonOutput forwards overridesHygiene through to the JSON delegate', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const summary = { totalOutdated: 0, safeUpdates: 0, filteredByAge: 0, filteredBySecurity: 0 };
    handleJsonOutput({
      rows: [],
      summary,
      thresholds: { prod: { minAge: 7, minSeverity: 'none' }, dev: { minAge: 7, minSeverity: 'none' } },
      vulnMap: new Map(),
      filterReasonMap: new Map(),
      overridesHygiene: [
        {
          name: 'brace-expansion',
          pinned: '^4.0.1',
          latest: '5.0.6',
          ageDays: 1,
          reason: 'stale: 1 days behind latest',
          advisories: [],
          safeUpgrade: '5.0.6',
        },
      ],
    });
    const printed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(printed).toHaveProperty('overridesHygiene');
    expect(printed.overridesHygiene).toHaveLength(1);
  });

  /** @story prompts/009.0-DEV-XML-OUTPUT.md */
  it('[REQ-CLI-FLAG] handleXmlOutput forwards overridesHygiene through to the XML delegate', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    handleXmlOutput({
      rows: [],
      summary: { totalOutdated: 0, safeUpdates: 0, filteredByAge: 0, filteredBySecurity: 0 },
      thresholds: { prod: { minAge: 7, minSeverity: 'none' }, dev: { minAge: 7, minSeverity: 'none' } },
      vulnMap: new Map(),
      filterReasonMap: new Map(),
      overridesHygiene: [
        {
          name: 'brace-expansion',
          pinned: '^4.0.1',
          latest: '5.0.6',
          ageDays: 1,
          reason: 'stale: 1 days behind latest',
          advisories: [],
          safeUpgrade: '5.0.6',
        },
      ],
    });
    const printed = logSpy.mock.calls[0][0];
    expect(printed).toContain('<overridesHygiene>');
    expect(printed).toContain('name="brace-expansion"');
  });

  /** @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md */
  it('[REQ-OUTPUT-DISPLAY] handleTableOutput forwards overridesHygiene through to the table delegate', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    handleTableOutput({
      safeRows: [['pkg', '1.0.0', '1.1.0', '1.1.0', 10, 'dev']],
      matureRows: [['pkg', '1.0.0', '1.1.0', '1.1.0', 10, 'dev']],
      summary: {},
      prodMinAge: 7,
      devMinAge: 7,
      returnSummary: false,
      overridesHygiene: [
        {
          name: 'brace-expansion',
          pinned: '^4.0.1',
          latest: '5.0.6',
          ageDays: 1,
          reason: 'stale: 1 days behind latest',
          advisories: [],
          safeUpgrade: '5.0.6',
        },
      ],
    });
    const logs = logSpy.mock.calls.map((c) => c[0]);
    expect(logs).toContain('Override hygiene:');
  });
});
