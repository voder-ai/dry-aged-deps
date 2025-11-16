/**
 * Tests for CLI option helpers.
 * @story prompts/014.0-DEV-INVALID-OPTION-ERROR.md
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

describe('parseFormatFlag', () => {
  const validFormats = ['table', 'json', 'xml'];

  it('returns default format when no flag provided', () => {
    expect(parseFormatFlag([], 'table', validFormats)).toBe('table');
    expect(parseFormatFlag([], 'json', validFormats)).toBe('json');
  });

  it('parses --format=<value> syntax', () => {
    expect(parseFormatFlag(['--format=json'], 'table', validFormats)).toBe('json');
  });

  it('parses --format <value> syntax', () => {
    expect(parseFormatFlag(['--format', 'xml'], 'table', validFormats)).toBe('xml');
  });

  it('errors and exits on invalid format', () => {
    const args = ['--format=invalid'];
    try {
      parseFormatFlag(args, 'table', validFormats);
    } catch (err) {
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid format: invalid'));
    }
  });
});

describe('parseMinAgeFlag', () => {
  it('returns default minAge when no flag provided', () => {
    expect(parseMinAgeFlag([], 7)).toBe(7);
    expect(parseMinAgeFlag([], 15)).toBe(15);
  });

  it('parses --min-age=<number>', () => {
    expect(parseMinAgeFlag(['--min-age=10'], 7)).toBe(10);
  });

  it('parses --min-age <number>', () => {
    expect(parseMinAgeFlag(['--min-age', '20'], 7)).toBe(20);
  });

  it('errors on non-integer value', () => {
    try {
      parseMinAgeFlag(['--min-age=abc'], 7);
    } catch (err) {
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid min-age: abc'));
    }
  });

  it('errors on out-of-range number (0)', () => {
    try {
      parseMinAgeFlag(['--min-age=0'], 7);
    } catch (err) {
      expect(err.message).toContain('process.exit:2');
    }
  });

  it('errors on out-of-range number (>365)', () => {
    try {
      parseMinAgeFlag(['--min-age=366'], 7);
    } catch (err) {
      expect(err.message).toContain('process.exit:2');
    }
  });

  it('errors when missing value for --min-age flag', () => {
    try {
      parseMinAgeFlag(['--min-age'], 7);
    } catch (err) {
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Missing value for --min-age'));
    }
  });
});

describe('parseSeverityFlag', () => {
  const validSeverities = ['none', 'low', 'moderate', 'high', 'critical'];

  it('returns default severity when no flag provided', () => {
    expect(parseSeverityFlag([], 'none', validSeverities)).toBe('none');
    expect(parseSeverityFlag([], 'high', validSeverities)).toBe('high');
  });

  it('parses --severity=<value>', () => {
    expect(parseSeverityFlag(['--severity=low'], 'none', validSeverities)).toBe('low');
  });

  it('parses --severity <value>', () => {
    expect(parseSeverityFlag(['--severity', 'critical'], 'none', validSeverities)).toBe('critical');
  });

  it('errors on invalid severity value', () => {
    try {
      parseSeverityFlag(['--severity=foo'], 'none', validSeverities);
    } catch (err) {
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid severity: foo'));
    }
  });

  it('errors when missing value for --severity flag', () => {
    try {
      parseSeverityFlag(['--severity'], 'none', validSeverities);
    } catch (err) {
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Missing value for --severity'));
    }
  });
});

describe('parseProdMinAgeFlag', () => {
  it('returns default prodMinAge when no flag provided', () => {
    expect(parseProdMinAgeFlag([], 5)).toBe(5);
  });

  it('parses --prod-min-age=<number>', () => {
    expect(parseProdMinAgeFlag(['--prod-min-age=30'], 5)).toBe(30);
  });

  it('parses --prod-min-age <number>', () => {
    expect(parseProdMinAgeFlag(['--prod-min-age', '40'], 5)).toBe(40);
  });

  it('errors on invalid prod-min-age value', () => {
    try {
      parseProdMinAgeFlag(['--prod-min-age=xyz'], 5);
    } catch (err) {
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid prod-min-age: xyz'));
    }
  });

  it('errors when missing value for --prod-min-age flag', () => {
    try {
      parseProdMinAgeFlag(['--prod-min-age'], 5);
    } catch (err) {
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Missing value for --prod-min-age'));
    }
  });
});

describe('parseDevMinAgeFlag', () => {
  it('returns default devMinAge when no flag provided', () => {
    expect(parseDevMinAgeFlag([], 8)).toBe(8);
  });

  it('parses --dev-min-age=<number>', () => {
    expect(parseDevMinAgeFlag(['--dev-min-age=12'], 8)).toBe(12);
  });

  it('parses --dev-min-age <number>', () => {
    expect(parseDevMinAgeFlag(['--dev-min-age', '22'], 8)).toBe(22);
  });

  it('errors on invalid dev-min-age value', () => {
    try {
      parseDevMinAgeFlag(['--dev-min-age=foo'], 8);
    } catch (err) {
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid dev-min-age: foo'));
    }
  });

  it('errors when missing value for --dev-min-age flag', () => {
    try {
      parseDevMinAgeFlag(['--dev-min-age'], 8);
    } catch (err) {
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Missing value for --dev-min-age'));
    }
  });
});

describe('parseProdSeverityFlag', () => {
  const validSeverities = ['none', 'low', 'moderate', 'high', 'critical'];

  it('returns default prodMinSeverity when no flag provided', () => {
    expect(parseProdSeverityFlag([], 'moderate', validSeverities)).toBe('moderate');
  });

  it('parses --prod-severity=<value>', () => {
    expect(parseProdSeverityFlag(['--prod-severity=high'], 'low', validSeverities)).toBe('high');
  });

  it('parses --prod-severity <value>', () => {
    expect(parseProdSeverityFlag(['--prod-severity', 'critical'], 'low', validSeverities)).toBe('critical');
  });

  it('errors on invalid prod-severity value', () => {
    try {
      parseProdSeverityFlag(['--prod-severity=bar'], 'low', validSeverities);
    } catch (err) {
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid prod-severity: bar'));
    }
  });
});

describe('parseDevSeverityFlag', () => {
  const validSeverities = ['none', 'low', 'moderate', 'high', 'critical'];

  it('returns default devMinSeverity when no flag provided', () => {
    expect(parseDevSeverityFlag([], 'high', validSeverities)).toBe('high');
  });

  it('parses --dev-severity=<value>', () => {
    expect(parseDevSeverityFlag(['--dev-severity=low'], 'high', validSeverities)).toBe('low');
  });

  it('parses --dev-severity <value>', () => {
    expect(parseDevSeverityFlag(['--dev-severity', 'moderate'], 'high', validSeverities)).toBe('moderate');
  });

  it('errors on invalid dev-severity value', () => {
    try {
      parseDevSeverityFlag(['--dev-severity=baz'], 'high', validSeverities);
    } catch (err) {
      expect(err.message).toContain('process.exit:2');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid dev-severity: baz'));
    }
  });
});