/**
 * Tests for the husky pre-commit hook's read-only contract (ADR-0013, P003).
 * @supports docs/decisions/0013-pre-commit-hook-read-only-policy.proposed.md REQ-PRECOMMIT-READ-ONLY
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOK_PATH = resolve(__dirname, '..', '.husky', 'pre-commit');

describe('ADR-0013: husky pre-commit hook is read-only (P003)', () => {
  it('[REQ-PRECOMMIT-READ-ONLY] does not invoke a write-mode prettier command', async () => {
    const hookText = await readFile(HOOK_PATH, 'utf8');
    // Scan only command-execution lines — drop shell comments, blank lines, and
    // `echo` guidance lines (echo prints to stderr/stdout; it does not execute
    // the referenced command). The contract is about what the hook *runs*, not
    // what its messages mention.
    const commandLines = hookText
      .split('\n')
      .filter((line) => {
        const t = line.trim();
        if (t.length === 0) return false;
        if (t.startsWith('#')) return false;
        if (t.startsWith('echo')) return false;
        return true;
      })
      .join('\n');
    expect(commandLines).not.toMatch(/prettier\s+--write/);
    expect(commandLines).not.toMatch(/npm\s+run\s+format(?!:)/);
  });

  it('[REQ-PRECOMMIT-READ-ONLY] invokes format:check for read-only formatting verification', async () => {
    const hookText = await readFile(HOOK_PATH, 'utf8');
    expect(hookText).toMatch(/npm\s+run\s+format:check/);
  });
});
