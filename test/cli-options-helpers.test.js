/* eslint-disable traceability/valid-story-reference, traceability/valid-req-reference, traceability/valid-annotation-format, traceability/prefer-supports-annotation, traceability/require-branch-annotation */
/**
 * Tests for CLI flag parsing helpers
 * @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-CLI-FLAG
 * @supports prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md REQ-CLI-FLAG REQ-VALIDATION
 * @supports prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md REQ-CLI-FLAGS
 * @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-CLI-FLAG REQ-VALIDATION
 * @supports prompts/009.0-DEV-XML-OUTPUT.md REQ-CLI-FLAG REQ-VALIDATION
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  parseFormatFlag,
  parseMinAgeFlag,
  parseSeverityFlag,
  parseProdMinAgeFlag,
  parseDevMinAgeFlag,
  parseProdSeverityFlag,
  parseDevSeverityFlag,
} from '../src/cli-options-helpers.js';

// Stub process.exit and console.error to catch exits and errors
beforeEach(() => {
  vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`process.exit:${code}`);
  });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Story 008.0-DEV-JSON-OUTPUT: parseFormatFlag', () => {
  const validFormats = ['table', 'json', 'xml'];

  it('[REQ-VALIDATION] returns default format when no flag provided', () => {
    expect(parseFormatFlag([], 'table', validFormats)).toBe('table');
    expect(parseFormatFlag([], 'json', validFormats)).toBe('json');
  });

  it('[REQ-VALIDATION] parses --format=<value> syntax', () => {
    expect(parseFormatFlag(['--format=json'], 'table', validFormats)).toBe('json');
  });

  it('[REQ-VALIDATION] parses --format <value> syntax', () => {
    expect(parseFormatFlag(['--format', 'xml'], 'table', validFormats)).toBe('xml');
  });

  it('[REQ-VALIDATION] errors and exits on invalid format', () => {
    const args = ['--format=invalid'];
    // @supports prompts/008.0-DEV-JSON-OUTPUT.md REQ-VALIDATION
    try {
      parseFormatFlag(args, 'table', validFormats);
    } catch (err) {
      // @req REQ-VALIDATION
      // @story <story-file>.story.md
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid format: invalid'));
    }
  });
});

describe('Story 005.0-DEV-CONFIGURABLE-AGE-THRESHOLD: parseMinAgeFlag', () => {
  it('[REQ-CLI-FLAG] returns default minAge when no flag provided', () => {
    expect(parseMinAgeFlag([], 7)).toBe(7);
    expect(parseMinAgeFlag([], 15)).toBe(15);
  });

  it('[REQ-CLI-FLAG] parses --min-age=<number>', () => {
    expect(parseMinAgeFlag(['--min-age=10'], 7)).toBe(10);
  });

  it('[REQ-CLI-FLAG] parses --min-age <number>', () => {
    expect(parseMinAgeFlag(['--min-age', '20'], 7)).toBe(20);
  });

  it('[REQ-VALIDATION] errors on non-integer value', () => {
    // @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-VALIDATION
    try {
      parseMinAgeFlag(['--min-age=abc'], 7);
    } catch (err) {
      // @req REQ-VALIDATION
      // @story <story-file>.story.md
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid min-age: abc'));
    }
  });

  it('[REQ-VALIDATION] errors on out-of-range number (0)', () => {
    // @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-VALIDATION
    try {
      parseMinAgeFlag(['--min-age=0'], 7);
    } catch (err) {
      // @req REQ-VALIDATION
      // @story <story-file>.story.md
      expect(err.message).toContain('process.exit:2');
    }
  });

  it('[REQ-VALIDATION] errors on out-of-range number (>365)', () => {
    // @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-VALIDATION
    try {
      parseMinAgeFlag(['--min-age=366'], 7);
    } catch (err) {
      // @req REQ-VALIDATION
      // @story <story-file>.story.md
      expect(err.message).toContain('process.exit:2');
    }
  });

  it('[REQ-VALIDATION] errors when missing value for --min-age flag', () => {
    // @supports prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md REQ-VALIDATION
    try {
      parseMinAgeFlag(['--min-age'], 7);
    } catch (err) {
      // @req REQ-VALIDATION
      // @story <story-file>.story.md
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Missing value for --min-age'));
    }
  });
});

describe('Story 006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD: parseSeverityFlag', () => {
  const validSeverities = ['none', 'low', 'moderate', 'high', 'critical'];

  it('[REQ-CLI-FLAG] returns default severity when no flag provided', () => {
    expect(parseSeverityFlag([], 'none', validSeverities)).toBe('none');
    expect(parseSeverityFlag([], 'high', validSeverities)).toBe('high');
  });

  it('[REQ-CLI-FLAG] parses --severity=<value>', () => {
    expect(parseSeverityFlag(['--severity=low'], 'none', validSeverities)).toBe('low');
  });

  it('[REQ-CLI-FLAG] parses --severity <value>', () => {
    expect(parseSeverityFlag(['--severity', 'critical'], 'none', validSeverities)).toBe('critical');
  });

  it('[REQ-VALIDATION] errors on invalid severity value', () => {
    // @supports prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md REQ-VALIDATION
    try {
      parseSeverityFlag(['--severity=foo'], 'none', validSeverities);
    } catch (err) {
      // @req REQ-VALIDATION
      // @story <story-file>.story.md
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid severity: foo'));
    }
  });

  it('[REQ-VALIDATION] errors when missing value for --severity flag', () => {
    // @supports prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md REQ-VALIDATION
    try {
      parseSeverityFlag(['--severity'], 'none', validSeverities);
    } catch (err) {
      // @req REQ-VALIDATION
      // @story <story-file>.story.md
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Missing value for --severity'));
    }
  });
});

describe('Story 007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS: parseProdMinAgeFlag', () => {
  it('[REQ-CLI-FLAGS] returns default prodMinAge when no flag provided', () => {
    expect(parseProdMinAgeFlag([], 5)).toBe(5);
  });

  it('[REQ-CLI-FLAGS] parses --prod-min-age=<number>', () => {
    expect(parseProdMinAgeFlag(['--prod-min-age=30'], 5)).toBe(30);
  });

  it('[REQ-CLI-FLAGS] parses --prod-min-age <number>', () => {
    expect(parseProdMinAgeFlag(['--prod-min-age', '40'], 5)).toBe(40);
  });

  it('[REQ-VALIDATION] errors on invalid prod-min-age value', () => {
    // @supports prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md REQ-VALIDATION
    try {
      parseProdMinAgeFlag(['--prod-min-age=xyz'], 5);
    } catch (err) {
      // @req REQ-VALIDATION
      // @story <story-file>.story.md
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid prod-min-age: xyz'));
    }
  });

  it('[REQ-VALIDATION] errors when missing value for --prod-min-age flag', () => {
    // @supports prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md REQ-VALIDATION
    try {
      parseProdMinAgeFlag(['--prod-min-age'], 5);
    } catch (err) {
      // @req REQ-VALIDATION
      // @story <story-file>.story.md
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Missing value for --prod-min-age'));
    }
  });
});

describe('Story 007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS: parseDevMinAgeFlag', () => {
  it('[REQ-CLI-FLAGS] returns default devMinAge when no flag provided', () => {
    expect(parseDevMinAgeFlag([], 8)).toBe(8);
  });

  it('[REQ-CLI-FLAGS] parses --dev-min-age=<number>', () => {
    expect(parseDevMinAgeFlag(['--dev-min-age=12'], 8)).toBe(12);
  });

  it('[REQ-CLI-FLAGS] parses --dev-min-age <number>', () => {
    expect(parseDevMinAgeFlag(['--dev-min-age', '22'], 8)).toBe(22);
  });

  it('[REQ-VALIDATION] errors on invalid dev-min-age value', () => {
    // @supports prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md REQ-VALIDATION
    try {
      parseDevMinAgeFlag(['--dev-min-age=foo'], 8);
    } catch (err) {
      // @req REQ-VALIDATION
      // @story <story-file>.story.md
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid dev-min-age: foo'));
    }
  });

  it('[REQ-VALIDATION] errors when missing value for --dev-min-age flag', () => {
    // @supports prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md REQ-VALIDATION
    try {
      parseDevMinAgeFlag(['--dev-min-age'], 8);
    } catch (err) {
      // @req REQ-VALIDATION
      // @story <story-file>.story.md
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Missing value for --dev-min-age'));
    }
  });
});

describe('Story 007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS: parseProdSeverityFlag', () => {
  const validSeverities = ['none', 'low', 'moderate', 'high', 'critical'];

  it('[REQ-CLI-FLAGS] returns default prodMinSeverity when no flag provided', () => {
    expect(parseProdSeverityFlag([], 'moderate', validSeverities)).toBe('moderate');
  });

  it('[REQ-CLI-FLAGS] parses --prod-severity=<value>', () => {
    expect(parseProdSeverityFlag(['--prod-severity=high'], 'low', validSeverities)).toBe('high');
  });

  it('[REQ-CLI-FLAGS] parses --prod-severity <value>', () => {
    expect(parseProdSeverityFlag(['--prod-severity', 'critical'], 'low', validSeverities)).toBe('critical');
  });

  it('[REQ-VALIDATION] errors on invalid prod-severity value', () => {
    // @supports prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md REQ-VALIDATION
    try {
      parseProdSeverityFlag(['--prod-severity=bar'], 'low', validSeverities);
    } catch (err) {
      // @req REQ-VALIDATION
      // @story <story-file>.story.md
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid prod-severity: bar'));
    }
  });
});

describe('Story 007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS: parseDevSeverityFlag', () => {
  const validSeverities = ['none', 'low', 'moderate', 'high', 'critical'];

  it('[REQ-CLI-FLAGS] returns default devMinSeverity when no flag provided', () => {
    expect(parseDevSeverityFlag([], 'high', validSeverities)).toBe('high');
  });

  it('[REQ-CLI-FLAGS] parses --dev-severity=<value>', () => {
    expect(parseDevSeverityFlag(['--dev-severity=low'], 'high', validSeverities)).toBe('low');
  });

  it('[REQ-CLI-FLAGS] parses --dev-severity <value>', () => {
    expect(parseDevSeverityFlag(['--dev-severity', 'moderate'], 'high', validSeverities)).toBe('moderate');
  });

  it('[REQ-VALIDATION] errors on invalid dev-severity value', () => {
    // @supports prompts/007.0-DEV-SEPARATE-PROD-DEV-THRESHOLDS.md REQ-VALIDATION
    try {
      parseDevSeverityFlag(['--dev-severity=baz'], 'high', validSeverities);
    } catch (err) {
      // @req REQ-VALIDATION
      // @story <story-file>.story.md
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid dev-severity: baz'));
    }
  });
});
