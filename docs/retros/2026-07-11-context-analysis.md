# Context Analysis — 2026-07-11

> Source: `/wr-retrospective:analyze-context` (deep layer per ADR-043).
> Methodology: byte-count-on-disk + per-plugin decomposition (cache-fallback) + per-turn attribution (when session log available).
> Cheap-layer baseline: `packages/retrospective/scripts/measure-context-budget.sh`.
> Auto-fired from run-retro Step 2c: first measurement for this project (no prior context-analysis report existed → calendar-elapse trigger held).

## Bucket Totals

Project on-disk surfaces (cheap-layer buckets). `hooks` / `skills` are source-absent in this adopter tree (they live in the plugin cache, not the project) — decomposed separately below via cache-fallback.

| Bucket             | Bytes                                                                            | % of measured | Δ vs prior                                         |
| ------------------ | -------------------------------------------------------------------------------- | ------------- | -------------------------------------------------- |
| memory             | 572,996                                                                          | 46.2%         | no prior snapshot — first measurement this project |
| decisions          | 299,777                                                                          | 24.2%         | no prior snapshot — first measurement this project |
| problems           | 274,088                                                                          | 22.1%         | no prior snapshot — first measurement this project |
| jtbd               | 46,575                                                                           | 3.8%          | no prior snapshot — first measurement this project |
| briefing           | 38,968                                                                           | 3.1%          | no prior snapshot — first measurement this project |
| project-claude-md  | 7,747                                                                            | 0.6%          | no prior snapshot — first measurement this project |
| hooks              | not measured — source-absent (plugin-cache, not project tree; see decomposition) | —             | —                                                  |
| skills             | not measured — source-absent (plugin-cache, not project tree; see decomposition) | —             | —                                                  |
| framework-injected | not measured — framework-injected-no-on-disk-source                              | —             | —                                                  |

Total measured (project on-disk buckets): **1,240,151 bytes**. Threshold (cheap-layer per-bucket ceiling): 10,240 bytes — every measured project bucket except `project-claude-md` is over the advisory ceiling, expected for a mature governance corpus (`decisions` / `problems` / `jtbd` grow monotonically by design).

## Per-Plugin Decomposition

Resolved via `wr-retrospective-list-plugin-attribution` cache-fallback mode (no `packages/` in this adopter tree; helper sniffed plugin-cache `bin/` entries).

### Hooks (aggregate: 519,395 bytes)

| Plugin               | Bytes   | % of hooks |
| -------------------- | ------- | ---------- |
| wr-itil              | 186,931 | 36.0%      |
| wr-risk-scorer       | 122,270 | 23.5%      |
| wr-architect         | 68,821  | 13.2%      |
| wr-voice-tone        | 59,564  | 11.5%      |
| wr-jtbd              | 39,893  | 7.7%       |
| wr-style-guide       | 24,305  | 4.7%       |
| wr-retrospective     | 17,163  | 3.3%       |
| ponytail             | 448     | 0.1%       |
| accessibility-agents | 0       | 0.0%       |

### Skills (aggregate: 1,311,265 bytes)

| Plugin           | Bytes     | % of skills |
| ---------------- | --------- | ----------- |
| wr-itil          | 1,004,794 | 76.6%       |
| wr-retrospective | 116,481   | 8.9%        |
| wr-risk-scorer   | 74,674    | 5.7%        |
| wr-architect     | 64,100    | 4.9%        |
| wr-jtbd          | 21,702    | 1.7%        |
| ponytail         | 15,500    | 1.2%        |
| wr-voice-tone    | 10,119    | 0.8%        |
| wr-style-guide   | 3,895     | 0.3%        |

## Top-N Offenders

| Surface                          | Bytes     | Bucket    | Comparable prior              |
| -------------------------------- | --------- | --------- | ----------------------------- |
| wr-itil skills (plugin cache)    | 1,004,794 | skills    | not estimated — no prior data |
| memory (`~/.claude/.../memory/`) | 572,996   | memory    | not estimated — no prior data |
| decisions (`docs/decisions/`)    | 299,777   | decisions | not estimated — no prior data |
| problems (`docs/problems/`)      | 274,088   | problems  | not estimated — no prior data |
| wr-itil hooks (plugin cache)     | 186,931   | hooks     | not estimated — no prior data |

## Per-Turn Attribution

per-turn attribution: not measured — no session log accessible (only `.afk-run-state/outstanding-questions.jsonl` and `risk-register-queue.jsonl` present; neither carries per-turn `usage` fields).

## Suggestions

Per ADR-026 — this is the first measurement, so no comparable prior byte-saving data exists for this project; approaches are cited from the wr-retrospective plugin's own reclamation history, byte estimates marked ungrounded.

1. **skills / wr-itil (1,004,794 bytes)** — The `wr-itil` SKILL corpus dominates loaded context; the largest single file is `manage-problem/SKILL.md` (~52 KB observed this session, exceeding the ADR-038 P097 50 KB cluster anchor). Approach precedent: `P100` split the monolithic `BRIEFING.md` into per-topic files loaded on demand; the same lazy-load / REFERENCE.md-split pattern (per ADR-054) applies to oversized SKILL bodies. This is an upstream `@windyroad/itil` concern, not a dry-aged-deps surface. Estimated byte saving: not estimated — no prior data.
2. **memory (572,996 bytes)** — The per-project auto-memory corpus is the second-largest bucket. Approach precedent: `P105` signal-vs-noise scoring drives decay-based removal of unused entries. Estimated byte saving: not estimated — no prior data.
3. **problems (274,088 bytes)** — `docs/problems/README.md` line-3 accumulator was already bounded by `P134` (README-history rotation). Continued closed-ticket archival keeps the active queue readable. Estimated byte saving: not estimated — no prior data.

## Policy Breaches

no policy breaches detected on project surfaces measured. ADR-040 Tier-3 briefing budget check (`check-briefing-budgets.sh`) not resolvable in this adopter tree (no `packages/`); the run-retro Step 3 Tier-3 pass is the load-bearing surface for briefing budgets.

<!--
context-snapshot:
  total-bytes: 1240151
  hooks: 519395
  skills: 1311265
  memory: 572996
  briefing: 38968
  decisions: 299777
  problems: 274088
  jtbd: 46575
  project-claude-md: 7747
  framework-injected: not measured
  measurement-method: byte-count-on-disk
  measured-at: 2026-07-11
-->
