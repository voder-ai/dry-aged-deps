/**
 * Tests for the husky pre-commit hook's auto-write+re-stage contract (ADR-0016, P009).
 * @supports docs/decisions/0016-pre-commit-hook-auto-write-restage.proposed.md REQ-PRECOMMIT-AUTO-WRITE-RESTAGE
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOK_PATH = resolve(__dirname, '..', '.husky', 'pre-commit');

/**
 * Returns the hook's command-execution lines only: drop shell comments,
 * blank lines, and pure `echo` guidance lines (echo prints to stdout/stderr;
 * it does not execute the referenced command). Echo piped into another
 * command (e.g., `echo "$staged" | xargs ...`) IS a data pipeline and is
 * preserved — the data pipeline's downstream command is what the hook
 * actually runs.
 *
 * @param {string} hookText
 * @returns {string}
 */
function commandLines(hookText) {
  return hookText
    .split('\n')
    .filter((line) => {
      const t = line.trim();
      if (t.length === 0) return false;
      if (t.startsWith('#')) return false;
      // Pure echo (no pipe to a downstream command) is guidance — drop.
      // Echo as the head of a pipeline keeps the downstream command in scope.
      if (t.startsWith('echo') && !t.includes('|')) return false;
      return true;
    })
    .join('\n');
}

describe('ADR-0016: husky pre-commit hook auto-writes and re-stages staged files (P009)', () => {
  it('[REQ-PRECOMMIT-AUTO-WRITE-RESTAGE] invokes prettier --write on staged files', async () => {
    const hookText = await readFile(HOOK_PATH, 'utf8');
    expect(commandLines(hookText)).toMatch(/prettier\s+--write/);
  });

  it('[REQ-PRECOMMIT-AUTO-WRITE-RESTAGE] re-stages formatted output via git add', async () => {
    const hookText = await readFile(HOOK_PATH, 'utf8');
    expect(commandLines(hookText)).toMatch(/git\s+add/);
  });

  it('[REQ-PRECOMMIT-AUTO-WRITE-RESTAGE] scopes prettier --write to the staged set, not the whole tree', async () => {
    const hookText = await readFile(HOOK_PATH, 'utf8');
    // The hook MUST derive the file list from `git diff --cached --name-only`
    // before invoking prettier — never `prettier --write .` and never
    // `npm run format` (which is `prettier --write .` per package.json).
    expect(hookText).toMatch(/git\s+diff\s+--cached\s+--name-only/);
    const cmds = commandLines(hookText);
    expect(cmds).not.toMatch(/prettier\s+--write\s+\.\s*$/m);
    expect(cmds).not.toMatch(/npm\s+run\s+format(?!:)/);
  });

  it('[REQ-PRECOMMIT-AUTO-WRITE-RESTAGE] retains format:check as defense-in-depth post-write', async () => {
    const hookText = await readFile(HOOK_PATH, 'utf8');
    expect(hookText).toMatch(/npm\s+run\s+format:check/);
  });
});
