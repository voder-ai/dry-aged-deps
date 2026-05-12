/**
 * Tests for scripts/push-watch.sh's release-trigger heuristic contract (P002).
 * @supports docs/problems/002-push-watch-release-trigger-heuristic-broken-post-push.known-error.md REQ-PUSH-WATCH-RELEASE-HEURISTIC
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = resolve(__dirname, '..', 'scripts', 'push-watch.sh');

describe("P002: push-watch.sh's release-trigger heuristic captures the pre-push remote head", () => {
  it('[REQ-PUSH-WATCH-RELEASE-HEURISTIC] captures PRE_PUSH_REMOTE from @{push} before git push runs', async () => {
    const scriptText = await readFile(SCRIPT_PATH, 'utf8');
    const lines = scriptText.split('\n');
    // Locate the index of the `git push "$@"` command line (ignoring shell
    // comments and echo guidance). The capture MUST happen at a smaller index.
    const pushIdx = lines.findIndex((line) => /^\s*git\s+push\s+"\$@"/.test(line));
    expect(pushIdx, 'expected a `git push "$@"` invocation line').toBeGreaterThan(-1);
    const captureIdx = lines.findIndex((line) => /^\s*PRE_PUSH_REMOTE=\$\(git\s+rev-parse\s+@\{push\}\)/.test(line));
    expect(captureIdx, 'expected PRE_PUSH_REMOTE to be captured via `git rev-parse @{push}`').toBeGreaterThan(-1);
    expect(
      captureIdx,
      'expected PRE_PUSH_REMOTE to be captured BEFORE `git push` runs (post-push, @{push} resolves to the new remote head and the range is empty)'
    ).toBeLessThan(pushIdx);
  });

  it('[REQ-PUSH-WATCH-RELEASE-HEURISTIC] release-trigger heuristic uses ${PRE_PUSH_REMOTE}..HEAD, not @{push}..', async () => {
    const scriptText = await readFile(SCRIPT_PATH, 'utf8');
    const commandLines = scriptText
      .split('\n')
      .filter((line) => {
        const t = line.trim();
        if (t.length === 0) return false;
        if (t.startsWith('#')) return false;
        if (t.startsWith('echo')) return false;
        return true;
      })
      .join('\n');
    expect(commandLines).toMatch(/git\s+log\s+--format=%s\s+"\$\{PRE_PUSH_REMOTE\}\.\.HEAD"/);
    expect(commandLines).not.toMatch(/git\s+log\s+--format=%s\s+"@\{push\}\.\."/);
  });
});
