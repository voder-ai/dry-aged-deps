# Ask Hygiene — 2026-05-17 (evening pass)

Session: `/wr-itil:work-problems` AFK loop (0 iters — all 3 open tickets classified at Step 4 as `upstream-blocked` and skipped without subprocess dispatch; stop-condition #3 fired) + `/wr-retrospective:run-retro` follow-on.

Second retro of the day; the morning pass trail lives at `2026-05-17-ask-hygiene.md`. Naming convention `<YYYY-MM-DD>-b-ask-hygiene.md` keeps the date-prefixed sort intact for `packages/retrospective/scripts/check-ask-hygiene.sh` while preserving the morning trail; `extract_date` strips `-ask-hygiene.md` and emits `2026-05-17-b` as the per-retro label.

## Classification table

(Empty — zero `AskUserQuestion` calls fired during this session.)

| Call # | Header | Classification | Citation |
| ------ | ------ | -------------- | -------- |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Notes

- `/wr-itil:work-problems` Step 4 classified all three open tickets (P006 / P010 / P011) as `upstream-blocked` deterministically — each ticket already carried either a `Reported Upstream` section (P006 = `agent-plugins#138`; P010 = `agent-plugins#137`) or an "Upstream report pending" marker (P011). Per Step 4 rule, skip without subprocess dispatch. Stop-condition #3 fired without any subprocess invocation; no `AskUserQuestion` needed at Step 2.5 / 2.5b (outstanding-questions queue empty; skip taxonomy is `upstream-blocked` not `user-answerable`).
- `/wr-retrospective:run-retro` Step 4b Stage 1 (mechanical ticket creation) delegated to `/wr-itil:capture-problem` for P012 (`migrate-problems-layout.sh` helper uses bashisms — observed during Step 0a auto-migration first-fire). capture-problem's Step 1.5 derive-first type classifier silently resolved `type=technical` from unambiguous lexical signals (`.sh`, `.md`, `bash`, `not found`, `shopt`) — no `AskUserQuestion` per the silent-framework-per-ADR-044-category-4 path (P185 refactor).
- Step 1.5 briefing signal-vs-noise pass and Step 3 Tier 3 budget pass both applied silent agent classification per P135 / ADR-044 (no per-entry `AskUserQuestion`). The one `≤-3` delete candidate ("Risk scorer first-pass over-conservative" in releases-and-ci.md, scored -3 after decay) was removed silently; user can correct via authentic-correction (ADR-044 cat 6) if the removal was wrong.

## R6 numeric gate status

This retro's lazy count: **0**. Prior retro (2026-05-17 morning) had lazy count **2**; before that (2026-05-16) had lazy count **0**. R6 condition requires lazy ≥2 across **3 consecutive** retros — current streak resets to **0** (this retro is below threshold). R6 NOT firing. No deviation-candidate auto-queued.

## Codification surface

No new codification candidates surfaced from the lazy count itself — there is no lazy count. The session's only codification observation is P012 (migrate-helper bashisms), which is upstream-blocked and ticketed via the Stage 1 mechanical path. Fix Strategy on P012 records the proposed shape (Option 3 — Other codification shape, free-text capture: targeted edit to `packages/itil/lib/migrate-problems-layout.sh` and/or `/wr-itil:work-problems` Step 0a SKILL.md to ensure bash invocation).
