---
status: 'proposed'
date: 2026-05-11
decision-makers: ['Tom Howard']
consulted: []
informed: []
reassessment-date: 2026-08-11
---

# 0011. ADR Format and Lifecycle Convention

## Context and Problem Statement

The project has eight existing Architecture Decision Records under `docs/decisions/`. They were written in a "traditional" ADR style: a top-level title, a free-text `Date:` line, prose `## Status`, `## Context`, `## Decision`, and a varying selection of supporting sections. The status of each ADR is encoded both inside the file (`## Status: Accepted`) and partially in the filename (`0001`–`0004` have no suffix; `0005`–`0008` use `.accepted.md`). No ADR has ever been superseded or rejected, so no convention for lifecycle transitions exists.

`CLAUDE.md` already mentions "MADR 4.0" as the format the project intends to use, but no ADR records that choice or defines how decisions move from proposed to accepted to superseded. The `wr-architect:create-adr` skill that the project's tooling uses produces files in MADR 4.0 with frontmatter and a `.proposed.md`/`.accepted.md`/`.superseded.md` suffix convention; the project's existing files do not match that template.

This is the moment to formalise the convention, both because we are about to migrate the existing eight ADRs to a uniform format and because two new ADRs (0009, 0010) are being written this same week.

## Decision Drivers

- The format needs a frontmatter-based status so tooling can read decision state without parsing prose.
- The lifecycle (proposed → accepted, accepted → superseded) needs to be both file-content and filename signals so the directory listing alone is informative.
- The convention must be honoured by the `wr-architect:create-adr` skill the project already invokes, so re-inventing the wheel is undesirable.
- Migration of the eight existing ADRs must preserve their content and their git history; renames must be detectable by `git log --follow`.
- The change is purely presentational — no underlying decision is being altered.

## Considered Options

1. **MADR 4.0 with `.proposed.md`/`.accepted.md`/`.superseded.md` filename suffixes** — adopt the format and suffix convention used by the `wr-architect:create-adr` skill.
2. **Keep the traditional in-project format** — leave the eight existing ADRs unchanged, write 0009 and 0010 in the same traditional style.
3. **MADR 4.0 with no suffix convention** — adopt the frontmatter and section structure but encode status only in frontmatter, not in filenames.

## Decision Outcome

Chosen option: **MADR 4.0 with `.proposed.md`/`.accepted.md`/`.superseded.md` filename suffixes**, because it aligns the project with the format the `wr-architect:create-adr` skill produces, makes status visible in `ls docs/decisions/`, and standardises the partial suffix convention 0005–0008 already established.

### Format

Every ADR in `docs/decisions/` uses YAML frontmatter at the top:

```yaml
---
status: "proposed" | "accepted" | "superseded"
date: YYYY-MM-DD
decision-makers: [list of names]
consulted: [list of names, or empty]
informed: [list of names, or empty]
reassessment-date: YYYY-MM-DD
supersedes: NNNN-decision-title  # optional, only on superseding ADRs
superseded-by: NNNN-decision-title  # optional, only on superseded ADRs
---
```

Followed by these sections in this order:

1. `# NNNN. Title` (number padded to four digits)
2. `## Context and Problem Statement`
3. `## Decision Drivers`
4. `## Considered Options`
5. `## Decision Outcome` (state the chosen option and the primary reason)
6. `## Consequences` with `### Good`, `### Neutral`, `### Bad` subsections
7. `## Confirmation` (concrete, testable criteria that the decision is implemented)
8. `## Pros and Cons of the Options` (one block per option)
9. `## Reassessment Criteria` (when the decision should be revisited)

Project-specific subsections (for example operational state tables, implementation notes, or process specifications) are placed under the closest standard section. The standard section order and presence is mandatory; extra subsections within them are permitted.

### Filename convention

`docs/decisions/NNNN-kebab-case-title.STATUS.md` where `STATUS` is `proposed`, `accepted`, or `superseded`. New ADRs start as `.proposed.md`. When accepted, rename via `git mv`. When superseded by a later ADR, rename via `git mv` and add the `superseded-by` field to the frontmatter.

### Lifecycle transitions

- **proposed → accepted**: `git mv` the file from `.proposed.md` to `.accepted.md`, then in a _separate_ commit change `status:` in frontmatter from `"proposed"` to `"accepted"`. The two commits keep git rename-detection working when the body is later edited.
- **accepted → superseded**: `git mv` the file from `.accepted.md` to `.superseded.md`. Add `superseded-by: NNNN-decision-title` to its frontmatter and a brief "Superseded by" note at the top of `## Context and Problem Statement`. The superseding ADR adds `supersedes: NNNN-decision-title` to its own frontmatter.
- **proposed → withdrawn**: there is no `.withdrawn.md` suffix; withdrawn proposals are deleted, with the rationale captured in the commit message. ADRs that were considered and rejected are recorded as `.superseded.md` with a `supersedes:` chain only if they were ever accepted.

### Migration scope for existing ADRs

ADRs 0001–0008 are migrated to MADR 4.0 in a sequence that preserves history:

- 0001–0004 are renamed via `git mv` to `.accepted.md`. The rename and the body restructure happen in _separate_ commits so git rename-detection records the rename correctly.
- 0005–0008 already use `.accepted.md`; only their bodies are restructured.
- Migration preserves all substantive content of every ADR. Operational content that does not fit standard MADR sections (for example ADR-0005's CHANGELOG strategy, ADR-0007's selective-rule recommendation, ADR-0008's exception-management process and current-exceptions table) is preserved verbatim under the closest standard section.
- No underlying decision is changed by the migration.

## Consequences

### Good

- Tooling that already understands MADR 4.0 (including the `wr-architect:create-adr` skill and the `wr-architect:agent` reviewer) operates on the project's ADRs without per-project adaptation.
- `ls docs/decisions/` makes the status of every decision visible at a glance.
- The lifecycle is explicit, so the project can finally express a "superseded" outcome cleanly when the time comes.
- The format is documented in a single ADR, so future contributors have one place to look.

### Neutral

- The migration is a one-time cost that produces churn in the git history of `docs/decisions/`, but the cost is bounded and the resulting state is uniform.
- The frontmatter is slightly more verbose than the traditional `Date:` line, but it carries machine-readable status and reassessment dates.

### Bad

- Existing external links into specific section headings inside the eight migrated ADRs (for example anchor links to `#status` or `#alternatives-considered`) will break. There are no known external links of this kind, but the risk is real.
- The convention adds a small amount of ceremony at create-time (frontmatter, two commits for status transitions).

## Confirmation

This decision is implemented when:

1. `docs/decisions/0011-adr-format-and-lifecycle.accepted.md` (this file, once accepted) exists with the MADR 4.0 structure documented above.
2. All eight existing ADRs (0001–0008) have been rewritten in MADR 4.0 format and use the `.accepted.md` filename suffix.
3. Every ADR file in `docs/decisions/` contains YAML frontmatter with `status`, `date`, `decision-makers`, `consulted`, `informed`, and `reassessment-date` fields.
4. The `wr-architect:create-adr` skill can be invoked to create a new ADR and produces output that matches this convention without manual fixup.
5. No ADR file has the status encoded only in prose; every ADR has the canonical status in frontmatter.

## Pros and Cons of the Options

### Option 1 — MADR 4.0 with status suffixes

- Good: aligned with `wr-architect:create-adr` skill output.
- Good: status visible in filenames; `ls` is informative.
- Good: matches the partial convention 0005–0008 already established.
- Good: frontmatter carries machine-readable state for tooling.
- Bad: one-time migration cost for 0001–0008.

### Option 2 — Keep the traditional format

- Good: zero migration cost.
- Bad: the `wr-architect:create-adr` skill produces output the project then has to reshape every time.
- Bad: status remains split across filename suffix and prose, with no canonical answer.
- Bad: `CLAUDE.md`'s reference to "MADR 4.0" stays aspirational rather than real.

### Option 3 — MADR 4.0 frontmatter only, no filename suffix

- Good: no rename ceremony.
- Bad: status invisible in `ls`; must read every file to know which decisions are live.
- Bad: diverges from the `wr-architect:create-adr` skill's filename convention.
- Bad: gives up the natural place to record `.superseded.md`.

## Reassessment Criteria

Reassess this decision when:

1. The `wr-architect:create-adr` skill changes its filename convention or template.
2. A different ADR framework (Y-statements, design records, or another) is adopted at the organisation level.
3. Three months from the date on this ADR (2026-08-11) as a default review checkpoint.
4. The first attempted `accepted → superseded` transition exposes a process gap that this convention does not handle.
