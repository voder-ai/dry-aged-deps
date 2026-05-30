/**
 * Tests for scripts/push-watch.sh's network-flake fallback contract (P016).
 * @supports docs/problems/open/016-push-watch-verify-on-fetch-failure.md REQ-PUSH-WATCH-NETWORK-FLAKE-FALLBACK
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = resolve(__dirname, '..', 'scripts', 'push-watch.sh');

describe('P016: push-watch.sh verifies CI status via gh run view when gh run watch fails', () => {
  it('[REQ-PUSH-WATCH-NETWORK-FLAKE-FALLBACK] queries gh run view --json status,conclusion after a failed gh run watch', async () => {
    const scriptText = await readFile(SCRIPT_PATH, 'utf8');
    // After the gh run watch failure path, the script must verify the actual
    // run state via gh run view --json status and --json conclusion before
    // declaring pipeline failure. A bare `exit 1` on watch non-zero conflates
    // network flakes (api.github.com read timeout) with real CI failures.
    expect(scriptText).toMatch(/gh\s+run\s+view\s+"\$RUN_ID"\s+--json\s+status/);
    expect(scriptText).toMatch(/gh\s+run\s+view\s+"\$RUN_ID"\s+--json\s+conclusion/);
  });

  it('[REQ-PUSH-WATCH-NETWORK-FLAKE-FALLBACK] only declares failure when status=completed AND conclusion=failure', async () => {
    const scriptText = await readFile(SCRIPT_PATH, 'utf8');
    // The verifying branch must gate the "Pipeline failed" + exit 1 path on
    // both status=completed AND conclusion=failure. A bare status=completed
    // check or a bare conclusion=failure check would mis-classify in-progress
    // runs as failures.
    expect(scriptText).toMatch(
      /\[\s+"\$STATUS"\s+=\s+"completed"\s+\]\s+&&\s+\[\s+"\$CONCLUSION"\s+=\s+"failure"\s+\]/
    );
  });

  it('[REQ-PUSH-WATCH-NETWORK-FLAKE-FALLBACK] retries the watch with bounded attempts and backoff on network flakes', async () => {
    const scriptText = await readFile(SCRIPT_PATH, 'utf8');
    // Bounded retry: a fixed attempt cap and a backoff between attempts so
    // unattended AFK loops don't loop forever on a permanently-broken API.
    expect(scriptText).toMatch(/WATCH_ATTEMPTS=\d+/);
    expect(scriptText).toMatch(/WATCH_BACKOFF=\d+/);
    expect(scriptText).toMatch(/sleep\s+"\$WATCH_BACKOFF"/);
  });
});
