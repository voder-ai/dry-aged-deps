# Problem 007: external-comms gate's sandboxed subagent reviewer cannot compute the SHA256 marker key

**Status**: Parked
**Reported**: 2026-05-13
**Priority**: 10 (High) — Impact: Minor (2) x Likelihood: Almost certain (5)
**Effort**: M — choice between Option 1 (hook computes key) vs Option 2 (grant Bash to subagent), then upstream implementation
**WSJF**: 10.0 = (10 × 2.0) / 2
**Type**: technical

## Description

The `wr-risk-scorer:external-comms` gate (P064, ADR-028) on `gh issue create` / `gh api .../security-advisories` / `gh issue comment` requires a SHA256 marker keyed by `sha256(draft + '\n' + surface)`. The PostToolUse hook (`risk-score-mark.sh`) writes the marker when the canonical reviewer subagent (`wr-risk-scorer:external-comms`) emits a verdict block of shape:

```
EXTERNAL_COMMS_RISK_VERDICT: PASS
EXTERNAL_COMMS_RISK_KEY: <sha256-hex>
```

The subagent runs in a sandboxed environment that has access to Read/Glob/Grep only — **no Bash**. It cannot execute `shasum -a 256` (or equivalent) and so cannot produce the actual SHA256 hex string. The subagent honestly returns a placeholder-shaped key with a note that the invoking skill should compute the key with `printf '%s\n%s' "<body>" "<surface>" | shasum -a 256`.

The PostToolUse hook doesn't (or can't) execute that command on the subagent's behalf — it consumes whatever key the subagent emits as the marker filename. A placeholder key produces a marker file that doesn't match the hash the gate's PreToolUse check computes, so the gate continues to deny.

Observed during /wr-itil:report-upstream P004 and P005 invocations on 2026-05-13:

- Invocation 1: subagent returned PASS verdict (no Confidential Information class matched, public-repo cross-referencing public-repo) but with placeholder key. PostToolUse hook wrote marker; gh issue create remained blocked.
- Invocation 2 (via `/wr-risk-scorer:assess-external-comms` skill wrapper): same outcome. Subagent explicitly stated: "this reviewer agent has only Read/Glob/Grep available and cannot execute `shasum -a 256` to produce the canonical key".
- Workaround used: `BYPASS_RISK_GATE=1` for both gh issue create invocations, with audit trail in the commit message (`6c87f9c`) documenting that the subagent had PASSed twice.

## Symptoms

- `gh issue create` blocked by P064 gate even AFTER `wr-risk-scorer:external-comms` returned PASS verdict (twice).
- Subagent output explicitly mentions: "no Bash available", "cannot execute shasum", "key string below is a recipe-marker, not an executed hash".
- PostToolUse hook fires after the subagent invocation and writes a marker under the placeholder key, which never matches the gate's recomputed key.
- Bypassing via `BYPASS_RISK_GATE=1` is the only path forward without a tooling change.

## Workaround

`BYPASS_RISK_GATE=1` with audit-trail documentation:

```bash
BYPASS_RISK_GATE=1 gh issue create --repo <upstream> --title <...> --body-file <draft>.md
```

Record in the commit message: which subagent invocation returned PASS, what review classes were checked, why the bypass was necessary (subagent sandbox lacks Bash). This preserves the audit trail for retro inspection.

## Impact Assessment

(deferred to investigation)

## Root Cause Analysis

### Initial hypothesis

Two possible fix paths:

1. **PostToolUse hook computes the key from the subagent's draft input + surface, not the subagent's emitted key field.** The hook has the same `printf | shasum` capability that the subagent lacks; it can recompute the key deterministically. The subagent's role becomes "emit PASS/FAIL + reasoning" only; the key is the hook's responsibility.

2. **Grant the `wr-risk-scorer:external-comms` subagent Bash access.** The subagent definition (in `~/.claude/plugins/marketplaces/windyroad/packages/risk-scorer/agents/external-comms.md`) restricts the tool surface — extending it to include Bash for the specific `shasum` invocation would let the subagent compute the key itself. Trade-off: broader tool surface for an agent whose role is "read and judge", not "execute".

Option 1 is structurally cleaner (separation of concerns: subagent judges; hook computes mechanical key). Option 2 is the smaller code change.

### Initial decision (recommended path for upstream report)

Investigation confirmed both fix paths land in upstream `@windyroad/risk-scorer`:

- `~/.claude/plugins/marketplaces/windyroad/packages/risk-scorer/agents/external-comms.md` declares `tools: Read, Glob, Grep` (lines 4–7). The reviewer is structurally unable to invoke `shasum`.
- `~/.claude/plugins/marketplaces/windyroad/packages/risk-scorer/hooks/risk-score-mark.sh` lines 214–227 read `EXTERNAL_COMMS_RISK_KEY` directly from `AGENT_OUTPUT` and validate it against the regex `^[0-9a-f]{64}$`. The hook never recomputes; a non-hex placeholder fails validation silently and no marker is written.

**Recommended path: Option 2 (grant the subagent Bash, scoped to `shasum -a 256`).** Rationale:

- **Smaller blast radius for the upstream change.** A `tools:` list addition in `external-comms.md` (single-line frontmatter edit) is reviewable in isolation. Option 1 requires the PostToolUse hook to recover the original `gh issue create --body ...` draft body and the surface name — neither is in `AGENT_OUTPUT`. The hook would need a sidecar marker written at gate time (PreToolUse on the gated tool) that the PostToolUse:Agent hook reads back, plus a new contract for keying that sidecar to the agent invocation. That's a multi-file architectural change, not a tool-list tweak.
- **Privilege expansion is narrow and audit-trail-friendly.** The subagent's prompt explicitly instructs it to compute `printf '%s\n%s' "<draft>" "<surface>" | shasum -a 256 | cut -d' ' -f1`. Granting Bash widens its theoretical surface but the agent definition can be tightened with a Bash-permissions allow-list at the plugin level (`allowed-tools`) restricting invocations to `shasum`. Even un-narrowed, the agent is read-only on the user filesystem in the sense that matters (no Write/Edit).
- **Option 1 is preserved as the structurally-cleaner follow-up.** When upstream wants to migrate "reviewer judges; hook computes mechanical key" as a doctrine across all gate subagents (not just external-comms), Option 1 is the right shape — but that's a larger refactor justified by a wider problem, not by this one ticket.

Defer the final call to the upstream maintainer when `/wr-itil:report-upstream` runs against `windyroad/agent-plugins`. This local recommendation is informational, not authoritative.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [x] Read `~/.claude/plugins/marketplaces/windyroad/packages/risk-scorer/hooks/risk-score-mark.sh` to confirm the marker-write mechanism — confirmed; lines 214–227 trust the agent's emitted key with sha256 hex validation only.
- [x] Read `~/.claude/plugins/marketplaces/windyroad/packages/risk-scorer/agents/external-comms.md` to confirm the subagent's tool surface — confirmed; `tools: Read, Glob, Grep` (lines 4–7).
- [x] Decide on fix path (Option 1 hook-computes-key vs Option 2 grant-bash-to-subagent) — Option 2 recommended (see "Initial decision" above); upstream maintainer holds final call.
- [ ] File upstream report against `windyroad/agent-plugins` once parking lifts — invoke `/wr-itil:report-upstream` in an interactive session (Step 6 security-path branch is interactive per ADR-024 Consequences; cannot run under the AFK orchestrator).

## Dependencies

- **Blocks**: clean `/wr-itil:report-upstream` flow (currently requires BYPASS_RISK_GATE)
- **Blocked by**: upstream `@windyroad/risk-scorer` (capability gap; report-upstream pending)
- **Composes with**: P064 (external-comms leak gate), ADR-028 (voice-tone-and-external-comms gate ownership), ADR-027 (governance-skill subagent surfaces)

## Related

- **ADR-028** (`docs/decisions/`-not-yet-imported) — voice-tone gate on external comms; external-comms gate is the sibling.
- **P064** — driver problem ticket for the external-comms leak gate.
- Commit `6c87f9c` (this session) — first use of BYPASS_RISK_GATE=1 with full audit trail; PASS verdicts referenced.
- Subagent self-description: "this reviewer agent has only Read/Glob/Grep available" — `wr-risk-scorer:external-comms` agent definition.
- **Upstream report pending** — external dependency identified; invoke /wr-itil:report-upstream when ready

(captured via /wr-itil:capture-problem during /wr-retrospective:run-retro Step 2b pipeline-instability scan; expand at next investigation)

## Parked

- **Reason**: `upstream-blocked` — both fix paths land in upstream `@windyroad/risk-scorer` (the subagent's `tools:` frontmatter or the PostToolUse hook's key-handling block in `risk-score-mark.sh`). No local-only path remediates the capability gap: the gate's marker contract is fixed by upstream and bypass-via-`BYPASS_RISK_GATE=1` is the documented workaround until upstream lands the fix.
- **Un-park trigger**: upstream `@windyroad/risk-scorer` ships a fix that lets the subagent emit a valid sha256 key (Option 2 — grant Bash) OR moves key-computation to the hook (Option 1 — hook recomputes from draft + surface). Detection signal: marker file under `${RDIR}/external-comms-risk-reviewed-<sha256hex>` appears after a `wr-risk-scorer:external-comms` invocation without `BYPASS_RISK_GATE=1`. On un-park: `git mv` to `.known-error.md` (root cause remains confirmed), exercise the gate end-to-end through a real `gh issue create`, then transition to `.verifying.md` per ADR-022.
- **Parked since**: 2026-05-16
- **External-root-cause detection (P063)**: already-noted check passed — the `- **Upstream report pending** —` marker in the `## Related` section (set during capture on 2026-05-13) is the audit-trail anchor; the parking-path detection did not re-fire the prompt.
