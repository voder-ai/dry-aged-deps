# Hooks & Gates

## What You Need to Know

- Every UserPromptSubmit fires four mandatory gates: architect, JTBD, TDD, ITIL. Skip any of them and Write/Edit on project files is denied. The gates expire (TTL); plan to re-delegate on long sessions.
  <!-- signal-score: 4 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- `docs/jtbd/` MUST exist or the JTBD gate blocks every project file edit. Run `/wr-jtbd:update-guide` to bootstrap if absent.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- `RISK-POLICY.md` MUST exist or commits are blocked. Run `/wr-risk-scorer:update-policy` to bootstrap. Risk appetite for this project is ≤ 4 (Low band).
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- Every commit requires a wr-risk-scorer:pipeline score before the commit-msg hook accepts it. Delegate to the agent with the staged diff stat and notes; the scorer writes a marker that the hook reads.
  <!-- signal-score: 4 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- P057 staging-trap: `git mv` followed by post-rename edits is BLOCKED by a hook unless you stage the post-rename edits too. Either commit rename + rewrite together (architect's separate-commits recommendation can't apply here) or stage both before commit.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- The `/wr-itil:capture-problem` skill's Step 2 create-gate marker has to match the Claude Code session SID. Use the bash helpers in the plugin's `hooks/lib/` (or read `/tmp/itil-runtime-sid-${USER}-${proj_hash}.current` directly) — the agent-side helper sometimes returns a different SID than the hook expects.
  <!-- signal-score: 2 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

## What Will Surprise You

- Global PreToolUse hooks from other projects (e.g. windyroad's `git push` → `npm run push:watch` redirect) carry across to this project, EVEN IF the supporting script doesn't exist here. The fix is to install the supporting script locally, not to disable the hook.
  <!-- signal-score: 4 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- ADRs and `docs/jtbd/` are NOT exempt from the JTBD gate even though they're documentation. Plan delegations accordingly.
  <!-- signal-score: 2 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- The `correction-signal` hook fires on phrases like "DO NOT" / "DON'T" / "MUST NOT" and instructs the agent to OFFER a problem ticket BEFORE responding. Ignore at your peril — repeated mis-corrections accrue into a ticket anyway, just less visibly.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
