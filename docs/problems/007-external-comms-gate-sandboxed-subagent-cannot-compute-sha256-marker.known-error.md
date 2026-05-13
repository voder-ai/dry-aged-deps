# Problem 007: external-comms gate's sandboxed subagent reviewer cannot compute the SHA256 marker key

**Status**: Known Error
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

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Read `~/.claude/plugins/marketplaces/windyroad/packages/risk-scorer/hooks/risk-score-mark.sh` to confirm the marker-write mechanism
- [ ] Read `~/.claude/plugins/marketplaces/windyroad/packages/risk-scorer/agents/external-comms.md` to confirm the subagent's tool surface
- [ ] Decide on fix path (Option 1 hook-computes-key vs Option 2 grant-bash-to-subagent)
- [ ] File upstream report against `windyroad/agent-plugins` once fix path is chosen

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
