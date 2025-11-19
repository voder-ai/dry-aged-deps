/**
 * TypeScript interface for parsing CLI options in dry-aged-deps.
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 * @story prompts/006.0-DEV-CONFIGURABLE-SECURITY-THRESHOLD.md
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @story prompts/010.0-DEV-CONFIG-FILE-SUPPORT.md
 * @story prompts/011.0-DEV-AUTO-UPDATE.md
 * @story prompts/013.0-DEV-CHECK-MODE.md
 * @req REQ-PARSE-OPTIONS - Define the shape of parsed CLI options and config file values.
 */
export interface CliOptions {
  /** Output format: table, json, or xml */
  format: 'table' | 'json' | 'xml';

  /** Minimum age (days) for production dependencies */
  prodMinAge: number;

  /** Minimum age (days) for development dependencies */
  devMinAge: number;

  /** Vulnerability severity threshold for production dependencies */
  prodMinSeverity: 'none' | 'low' | 'moderate' | 'high' | 'critical';

  /** Vulnerability severity threshold for development dependencies */
  devMinSeverity: 'none' | 'low' | 'moderate' | 'high' | 'critical';

  /** Whether to update dependencies to latest safe versions */
  updateMode: boolean;

  /** Whether to skip confirmation prompts */
  skipConfirmation: boolean;

  /** If true, return summary object instead of printing results */
  returnSummary: boolean;
}

/**
 * Parse CLI arguments into a CliOptions object.
 * @story prompts/005.0-DEV-CONFIGURABLE-AGE-THRESHOLD.md
 */
export declare function parseOptions(argv: string[]): CliOptions;
