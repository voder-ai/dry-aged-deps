# Problem 032: oversight-marker helper's 24h SID-candidate window blocks born-confirmed ADR/JTBD writes on long sessions

**Status**: Known Error
**Reported**: 2026-07-11
**Priority**: 6 (Medium) — Impact: 2 (Minor — friction + multiple failed Write round-trips; a manual workaround exists) × Likelihood: 3 (Possible — fires on every born-confirmed ADR/JTBD write in any session running > 24h; hit 4× this session)
**Origin**: external (`@windyroad/wr-architect` + `@windyroad/wr-jtbd` `mark-oversight-confirmed` helpers)
**Effort**: M — upstream helper change (widen/replace the 24h SID-candidate window, or key the marker off the current session SID read from the tool's own SID surface). Re-rated at Known-Error transition (2026-07-11): held at M — the root-cause fix is a one-line candidate-enumeration change duplicated across TWO upstream plugins (`wr-architect` + `wr-jtbd`), and the change surface is `scripts/mark-oversight-confirmed.sh` in each. A zero-code adopter-side mitigation exists (`export SESSION_CANDIDATE_WINDOW_MINS=<large>` or `export CLAUDE_SESSION_ID`), but that is a workaround, not the durable fix.

## Description

`wr-architect-mark-oversight-confirmed <path>` / `wr-jtbd-mark-oversight-confirmed <path>` write the `/tmp/oversight-confirmed-<sha>-<sid>` evidence marker that the PreToolUse gate requires before a Write can set `human-oversight: confirmed` on a new ADR/JTBD (ADR-066 / ADR-068 born-confirmed path). The helper enumerates candidate session SIDs from recent `/tmp/*-announced-<UUID>` markers within a **24h mtime window** and writes the marker under each. A Claude Code session running longer than 24h (this session spanned 2026-07-07 → 07-11) has its OWN announce marker aged out of that window, so its SID is not a candidate — the marker lands only under recent _other_ sessions' SIDs. The gate hook, reading the current session's SID from the Write's stdin, finds no matching marker and blocks the Write:

> `BLOCKED: … no substance-confirm evidence marker exists for this ADR/JTBD in this session (P348 / ADR-066)`

The AskUserQuestion substance-confirm genuinely happened; only the marker-SID bookkeeping is wrong.

## Symptoms

- Born-confirmed ADR/JTBD Write blocked with the `no substance-confirm evidence marker` message immediately after running the `mark-oversight-confirmed` helper for the same path.
- `ls /tmp/oversight-confirmed-*` shows markers written under UUIDs that are NOT the current session's SID.

## Workaround

After running the helper, write the marker directly under the ACTUAL current session SID (derive it from the scratchpad path `…/<SID>/scratchpad` or a `/tmp/jtbd-reviewed-<SID>` / `/tmp/*-announced-<SID>` marker for the live session):

```bash
CURRENT_SID=f3fed730-b656-4aae-9631-1c71778f3d84   # this session's SID
for m in /tmp/oversight-confirmed-*; do
  sha=$(basename "$m" | sed -E 's/^oversight-confirmed-([0-9a-f]+)-.*/\1/')
  : > "/tmp/oversight-confirmed-${sha}-${CURRENT_SID}"
done
```

Then retry the Write. (The helper's own sha computation is reused via the existing marker filenames, so the correct `<sha>` is covered without recomputing it.)

**Zero-code alternative (confirmed 2026-07-11):** before running the helper, widen the candidate window or populate the fast path so the live SID is enumerated:

```bash
export SESSION_CANDIDATE_WINDOW_MINS=1000000   # widen the -mmin window past the session age
# or, if the live SID is known:
export CLAUDE_SESSION_ID=<live-sid>            # helper's env-var fast path
```

Either avoids the marker-under-wrong-SID bookkeeping entirely, without post-hoc marker copying.

## Impact Assessment

- **Who is affected**: the maintainer/agent recording born-confirmed decisions during any session > 24h.
- **Frequency**: every born-confirmed ADR/JTBD write on a long session. Hit 4× here (ADR-0022 ×3, JTBD-010 ×1).
- **Severity**: Minor — bounded by a reliable manual workaround; no data loss, the confirmation itself is valid.
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

The helper's SID-candidate enumeration is time-bounded (24h mtime window over `/tmp/*-announced-<UUID>`) rather than including the _live_ session's SID unconditionally. Long-lived sessions fall out of the window. The gate hook keys on the live SID, so the sets diverge.

### Confirmed against upstream source (2026-07-11)

Root cause confirmed by reading the installed upstream helpers (latest versions, both carry the defect):

- `~/.claude/plugins/cache/windyroad/wr-architect/0.19.0/scripts/mark-oversight-confirmed.sh`
- `~/.claude/plugins/cache/windyroad/wr-jtbd/0.12.14/scripts/mark-oversight-confirmed.sh`

Both share the identical candidate-SID enumeration block:

```bash
WINDOW_MINS="${SESSION_CANDIDATE_WINDOW_MINS:-1440}"   # 1440 min = 24h
candidates=$(
  {
    if [ -n "${CLAUDE_SESSION_ID:-}" ]; then echo "$CLAUDE_SESSION_ID"; fi
    find -L "$MARKER_DIR" -maxdepth 1 -name '*-announced-*' -mmin "-${WINDOW_MINS}" 2>/dev/null \
      | sed 's|.*/||; s/.*-announced-//'
  } | awk 'NF && !seen[$0]++'
)
```

Two facts confirm the divergence:

1. **`CLAUDE_SESSION_ID` is not exported in agent contexts today** — the helper's own comment states this ("Not exported in agent contexts today"). So the env-var fast path never contributes the live SID.
2. **The only other candidate source is `*-announced-*` markers within `-mmin -1440`.** Announce markers are written once, on prompt 1 of a session (per `session-marker.sh`). On a session running > 24h, that marker's mtime is > 1440 min old and is filtered out by `find -mmin -1440`. The live SID is therefore absent from `candidates`, so the marker lands only under recent _other_ sessions' SIDs — exactly the observed symptom.

The gate hook (`architect-gate.sh` / the jtbd equivalent) reads the live SID from the Write's stdin JSON and finds no matching `oversight-confirmed-<sha>-<live-sid>` marker → deny.

The helper comment notes it cannot depend on itil-internal `get_candidate_session_ids` (per ADR-002 plugin-packaging isolation), which is why architect/jtbd re-implement a narrower, announce-marker-only enumeration that omits the itil runtime-sid marker the itil create-gate uses.

### Investigation Tasks

- [x] Confirm the 24h window constant + enumeration logic in the upstream `mark-oversight-confirmed` helper(s) — **confirmed**: `WINDOW_MINS=1440`, announce-marker-only candidate source, `CLAUDE_SESSION_ID` unexported (see "Confirmed against upstream source" above).
- [x] Decide fix — **decided fix direction** (upstream, for the report): unconditionally include the live session SID in `candidates` regardless of announce-marker age. Preferred: read the live SID from a stable per-session surface (the itil runtime-sid marker pattern, or a future exported `CLAUDE_SESSION_ID`); acceptable fallback: widen/remove `WINDOW_MINS`. Two adopter-side env knobs already exist as zero-code mitigations: `SESSION_CANDIDATE_WINDOW_MINS` (widen the window) and `CLAUDE_SESSION_ID` (populate the fast path). Fix proposal + RFC happen after this Known-Error transition per ADR-072.
- [ ] Report upstream against `@windyroad/wr-architect` + `@windyroad/wr-jtbd` — deferred; see `- **Upstream report pending**` marker in `## Related`.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P024 (external-comms cross-session marker dir mismatch) — sibling gate-marker-vs-live-session-SID class, different marker.

## Related

- **ADR-066** (architect oversight marker + drain) / **ADR-068** (JTBD born-confirmed ratification) — the gates this marker feeds.
- **P024 / P007 / P023** — sibling external gate-marker friction tickets.
- Captured via /wr-itil:capture-problem during the 2026-07-11 retro; hit repeatedly on ADR-0022 + JTBD-010 born-confirmed writes this session.
- **Upstream report pending** -- external dependency identified; invoke /wr-itil:report-upstream when ready. Deferred at the 2026-07-11 Open→Known-Error transition: filing public issues against upstream repos is outward-facing and was not auto-fired in the AFK loop (orchestrator owns external-comms cadence). Two upstream targets: `@windyroad/wr-architect` + `@windyroad/wr-jtbd`, each `scripts/mark-oversight-confirmed.sh`.

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/393#issuecomment-5083267394
- **Reported**: 2026-07-26
- **Template used**: comment cross-reference
- **Disclosure path**: commented-on-existing-issue (#393, same oversight-marker helper)
- **Cross-reference confirmed**: yes — comment carries the voder-ai/dry-aged-deps cross-reference + P032
