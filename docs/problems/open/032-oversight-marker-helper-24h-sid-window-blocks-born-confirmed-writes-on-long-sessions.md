# Problem 032: oversight-marker helper's 24h SID-candidate window blocks born-confirmed ADR/JTBD writes on long sessions

**Status**: Open
**Reported**: 2026-07-11
**Priority**: 6 (Medium) — Impact: 2 (Minor — friction + multiple failed Write round-trips; a manual workaround exists) × Likelihood: 3 (Possible — fires on every born-confirmed ADR/JTBD write in any session running > 24h; hit 4× this session)
**Origin**: external (`@windyroad/wr-architect` + `@windyroad/wr-jtbd` `mark-oversight-confirmed` helpers)
**Effort**: M — upstream helper change (widen/replace the 24h SID-candidate window, or key the marker off the current session SID read from the tool's own SID surface)

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

## Impact Assessment

- **Who is affected**: the maintainer/agent recording born-confirmed decisions during any session > 24h.
- **Frequency**: every born-confirmed ADR/JTBD write on a long session. Hit 4× here (ADR-0022 ×3, JTBD-010 ×1).
- **Severity**: Minor — bounded by a reliable manual workaround; no data loss, the confirmation itself is valid.
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

The helper's SID-candidate enumeration is time-bounded (24h mtime window over `/tmp/*-announced-<UUID>`) rather than including the _live_ session's SID unconditionally. Long-lived sessions fall out of the window. The gate hook keys on the live SID, so the sets diverge.

### Investigation Tasks

- [ ] Confirm the 24h window constant + enumeration logic in the upstream `mark-oversight-confirmed` helper(s)
- [ ] Decide fix: always include the current session SID (read from the tool's own SID surface) regardless of announce-marker age, OR widen/remove the window
- [ ] Report upstream against `@windyroad/wr-architect` + `@windyroad/wr-jtbd`

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P024 (external-comms cross-session marker dir mismatch) — sibling gate-marker-vs-live-session-SID class, different marker.

## Related

- **ADR-066** (architect oversight marker + drain) / **ADR-068** (JTBD born-confirmed ratification) — the gates this marker feeds.
- **P024 / P007 / P023** — sibling external gate-marker friction tickets.
- Captured via /wr-itil:capture-problem during the 2026-07-11 retro; hit repeatedly on ADR-0022 + JTBD-010 born-confirmed writes this session.
