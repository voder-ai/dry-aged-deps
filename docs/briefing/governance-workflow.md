# Governance Workflow

## What You Need to Know

- ADR convention (per ADR-0011): MADR 4.0 with YAML frontmatter and `.proposed.md` / `.accepted.md` / `.superseded.md` filename suffixes. New ADRs start `.proposed.md`; rename via `git mv` to `.accepted.md` only after the Confirmation criteria are observed in production.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- JTBD personas: project-maintainer (001-099), ci-automation-engineer (100-199), tech-lead (200-299). Each job in `docs/jtbd/<persona>/JTBD-NNN-*.proposed.md`. Index at `docs/jtbd/README.md`.
  <!-- signal-score: 2 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- Architect pushback is substantive. When `wr-architect:agent` returns ISSUES FOUND, the findings are usually correct and worth addressing — don't try to argue past them. Common findings: in-place ADR amendments that smuggle decisions (route to a new ADR instead), trust-boundary widening without recording the broadening, confirmation criteria that don't survive the proposed change.
  <!-- signal-score: 4 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

- Capture-problem skill is the lightweight aside-invocation path. Use `/wr-itil:capture-problem <description>` (or pass `--no-prompt --type=technical` for non-interactive). The heavyweight `/wr-itil:manage-problem` is for full intake with WSJF placement.
  <!-- signal-score: 4 | last-classified: 2026-05-17 | first-written: 2026-05-13 -->

- **ADR-0011 supersession lifecycle is a 4-step dance per ADR-0011 lines 73-77.** Proposed → Accepted: split into two commits (`git mv` + frontmatter status edit) so `git log --follow` preserves rename detection. Accepted → Superseded: same split (`git mv` + frontmatter `superseded-by:` + "Superseded by" body note). New superseding ADR adds `supersedes:` in its own frontmatter and lives at `docs/decisions/<NNN>-<title>.proposed.md`. Five commits total when going `proposed → accepted → superseded` and adding the new ADR (rename-x2, frontmatter-x2, new ADR add). Implementation commit (e.g. `.husky/pre-commit` change) is its own commit (commit 6 in the sequence). Worked example: ADR-0013 → ADR-0016 supersession this session (commits 6a081bc / a2eec5b / 4c50c64 / 7a945b5 / 0c82d50 / ed5c0e4).
  <!-- signal-score: 3 | last-classified: 2026-05-17 | first-written: 2026-05-17 -->

## What Will Surprise You

- Verify-before-assert is a recurring agent failure mode. Three flip-flops on branch-protection behaviour in one session were directly caused by asserting from training data without checking GitHub's actual docs. Default to verification (fetch action source, read docs, test) when the answer is platform-specific. **Re-confirmed by P008's v2.7.2 → v2.7.3 layered fix**: candidate 1 was picked from training-data assumption that bearer auth works for git transport. It does not. Architect / JTBD reviews would not have caught this — both PASS'd candidate 1 because the failure surface is empirical (live runner) and not in any local file the agents can read. The lesson: for auth-scheme decisions involving non-test-runnable surfaces, EITHER write a dry-run probe before shipping OR pick the most-documented option (candidate 3's URL-embedded basic auth is GitHub's own published recommendation; candidate 1 was a workaround for the duplicate-header symptom that ignored the underlying auth scheme).
  <!-- signal-score: 5 | last-classified: 2026-05-16 | first-written: 2026-05-13 -->

- Memory files (e.g. `feedback_claude_subscription_only.md`) load into context at session start but only help if the agent actually applies them. Loading is not application.
  <!-- signal-score: 2 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
