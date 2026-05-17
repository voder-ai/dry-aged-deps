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
  <!-- signal-score: 4 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- The `wr-risk-scorer:external-comms` gate (P064) on `gh issue create` / `gh api .../security-advisories` requires a SHA256 marker keyed by `sha256(draft + '\n' + surface)`. The subagent reviewer (`wr-risk-scorer:external-comms`) returns PASS verdict on content but its sandboxed environment lacks Bash to compute the actual SHA256, so the PostToolUse hook never writes a usable marker. **Same applies to `wr-voice-tone:external-comms` gate.** Workaround: `BYPASS_RISK_GATE=1` with audit trail in the commit message documenting both PASS verdicts. Any draft-body edit (typo fix, content correction) invalidates BOTH markers — re-run both subagents before retrying. Hit twice this session: P010 + P006 upstream reports each required 2-4 subagent calls + one bypass. P007.
  <!-- signal-score: 4 | last-classified: 2026-05-17 | first-written: 2026-05-13 -->

- **The architect-review gate marker is per-file and TTL-bounded; cross-file Edits in one session may need re-delegation.** Architect delegations approve a sequence at plan time, but the PreToolUse Edit gate keys markers per file. Editing a second file in the planned sequence may fire the gate again — re-delegating with a brief "confirm proceed" is the documented path. Observed this session on the ADR-0013 supersession sequence (architect approved the 5-commit plan; the frontmatter edit on commit 2 re-fired the gate and needed a one-line confirm).
  <!-- signal-score: 3 | last-classified: 2026-05-17 | first-written: 2026-05-17 -->

- **P165 README-refresh hook overrides `/wr-itil:capture-problem`'s deferred-README contract.** capture-problem SKILL.md Step 6 says "Do NOT stage `docs/problems/README.md`" — defer the regenerate+stage cycle to next `/wr-itil:review-problems`. The project's P165 PreCommit hook says the opposite: "P<NNN> needs docs/problems/README.md refresh. Run: git add docs/problems/README.md." The hook wins; capture-problem's deferred-README contract is locally overridden. Hit this session on P010 capture. Fix path is upstream (P011 — to be filed against `@windyroad/itil`).
  <!-- signal-score: 3 | last-classified: 2026-05-17 | first-written: 2026-05-17 -->

- `gh issue create --label <name>` fails with `could not add label: '<name>' not found` if the label exists in the upstream's issue-template YAML but has not been created in the repo's Labels settings. Workaround: omit `--label` and let triage classify. Templates declare labels but don't auto-create them in repo settings.
  <!-- signal-score: 0 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
