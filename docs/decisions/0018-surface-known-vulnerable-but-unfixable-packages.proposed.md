---
status: 'proposed'
date: 2026-05-19
decision-makers: ['Tom Howard']
consulted: ['Tom Howard (via wr-architect:agent, wr-jtbd:agent review)']
informed: []
reassessment-date: 2026-08-19
---

# 0018. Surface known-vulnerable-but-unfixable packages in dry-aged-deps output

## Context and Problem Statement

`dry-aged-deps` today recommends updates that are both _mature_ (past the configured age threshold) and _safe_ (no known vulnerabilities in the candidate version, per ADR-0008's audit invocation, with the safe target computed by the smart-search filter from ADR-0014). The complementary case — a package that has a known vulnerability **and no available version satisfies the same filter pipeline** — is currently invisible to the tool's output. Such packages do not appear in `--check`, are not represented in the JSON/XML schemas (ADR-0002), and never reach the auto-update workflow's PR body (ADR-0017).

The session of 2026-05-18 surfaced a concrete example: GHSA-f886-m6hf-6m8v ("brace-expansion: Zero-step sequence causes process hang and memory exhaustion") is a _moderate_-severity vulnerability in a transitive dependency. `better-npm-audit` prints it in its table output during the prepush audit step, but only because the console output happens to scroll through it; nothing in `dry-aged-deps` itself reports it, and the maintainer can only notice it by visually scanning the audit log. The auto-update workflow's PR body lists every bump but says nothing about vulns the workflow cannot autonomously fix — exactly the class of problem the maintainer most needs visibility into.

The job (a new JTBD, "See vulnerabilities I can't yet fix so I can plan mitigation") is unaddressed by today's output. This ADR proposes a complementary surface that reports these unfixable-by-dry-aged-deps vulnerabilities so they enter the maintainer's normal review loop instead of being noise in a CI log.

## Decision Drivers

- **JTBD-006: trust the default policy.** The maintainer expects routine information to surface without flag-juggling; an opt-in flag means missed vulns become a "I forgot to look" failure mode. _Tension acknowledged:_ JTBD-006 also values low cognitive cost; the chosen all-severities default trades some noise for guaranteed visibility (see §Bad consequences).
- **JTBD-005: familiar npm-outdated-style output.** The new surface MUST appear as a separate section _after_ the outdated table, not as a new column. The existing table's column shape is the most-recognised affordance and must not change.
- **JTBD-008: inspect what an automated update landed and why.** The auto-update workflow's PR body is the maintainer's audit surface for every automated landing; unfixable vulns belong there alongside the bump set. JTBD-008's "audit trail doesn't depend on workflow-run retention" constraint means the section must live in the PR body, not just in workflow logs.
- **JTBD-100: gate CI on pending updates.** `--check` is JTBD-100's screen; extending its semantics is JTBD-100's surface. The exit-code contract (ADR-0003/ADR-0004) is preserved verbatim so JTBD-100's gating behaviour does not shift.
- **JTBD-202: policy as code.** `--unfixable-level` is settable in `.dry-aged-deps.json`, so the unfixable severity floor lives alongside the rest of the project's dep policy.
- **JTBD-203: reproducible audit artefacts.** Surfacing unfixable vulns across table/JSON/XML gives tech-leads the "show stakeholders we know what's unpatched" surface JTBD-203 describes.
- **No human dev pool to escalate to.** A vuln the autonomous loop cannot fix has no human queue to land in unless it surfaces in a place the maintainer reads.
- **Schema additivity (ADR-0002).** New surface must be additive to the existing JSON/XML schemas so external consumers parsing the structured output are not broken.
- **Exit-code stability (ADR-0003 + ADR-0004).** The autonomous workflow keys off exit codes 0/1/2; the new surface must not perturb that mapping. Specifically, `--check`'s exit-1 trigger remains "safe updates available" — unfixable surfacing is informational and does NOT influence the trigger.
- **Filter-pipeline reuse (ADR-0014).** Unfixable detection is the inverse of the smart-search safe-target determination. The same filter pipeline that decides "is there a latest-safe candidate?" tells us "does no safe candidate exist?" — that is the unfixable signal.
- **Audit policy independence (ADR-0008).** The new surface is read-only reporting; it must not change `audit-resolve.json` semantics or the prepush audit gate's `--level high` policy. Advisories the maintainer has explicitly excepted in `audit-resolve.json` must NOT re-appear in the unfixable surface — the exception is the maintainer's "we know and accept" mark.

## Considered Options

1. **On by default in all output formats, suppressible via `--no-unfixable`.**
2. **Opt-in via `--show-unfixable` flag (default off).**
3. **Hybrid: JSON/XML always include the new field; table format is on-by-default with `--no-unfixable` to suppress.**
4. **Do nothing — rely on the maintainer scrolling the audit log to notice moderate-and-below vulns.**

## Decision Outcome

Chosen option: **"On by default in all output formats, suppressible via `--no-unfixable`"**, because it directly satisfies JTBD-006's default-policy expectation and JTBD-008's PR-body inspection job. Visibility-first is the right default for a tool whose mission is "the safe path is the default path"; an opt-in flag is precisely the failure mode the maintainer wants to avoid.

### Detection rule

A package is _unfixable-by-dry-aged-deps_ when **all** of the following hold:

1. `npm audit --json` reports at least one vulnerability whose `via` chain includes the package or a path through it (direct or transitive).
2. ADR-0014's smart-search filter pipeline yields **no safe target** for the package — i.e. no installable version satisfies _all_ of:
   - the vulnerability's `fixAvailable` range (patched), AND
   - the project's `--min-age` / `--min-age-prod` / `--min-age-dev` thresholds (mature), AND
   - the security-threshold gate (clean of higher-severity vulns introduced by the bump itself).
3. The advisory id is **not** listed in `audit-resolve.json` exclusions. Excepted advisories are the maintainer's explicit "known and accepted" mark; re-surfacing them would be noise.

If a patched version exists but is too young to be "safe" (failing ONLY the age threshold), the package is classified as _fixable-soon_, **not** unfixable. Fixable-soon packages already surface implicitly via the existing "would be safe later" semantics and are out of scope here. The boundary keeps two distinct user actions (wait vs. mitigate) on separate surfaces.

### Severity floor

**All severities** (low / moderate / high / critical) are surfaced by default. The maintainer can raise the floor per-call with `--unfixable-level=<low|moderate|high|critical>` or in the config file (`"unfixable-level": "<level>"` under `.dry-aged-deps.json`, per JTBD-202). The floor for unfixable surfacing is **independent** of the `--level high` policy used by `better-npm-audit` to gate prepush; the two thresholds answer different questions ("what blocks releases" vs "what should the maintainer know about").

### Output shape

JTBD-005 binding: the table format MUST keep the existing outdated columns intact. The unfixable surface is a **separate section appended below** the outdated table, never a new column.

- **Table** (default formatter): a separate section appears after the existing outdated table, headed `Known vulnerabilities without safe fix`. Columns: `Name`, `Severity`, `Advisory` (the GHSA / NPM advisory ID), `Reason` (a short string such as `no patched version`, `patched version withdrawn`, `vulnerable transitive: <pkg>`). **Amendment 2026-05-25:** the table groups by package — one row per package, with the package's advisories joined in the `Advisory` column and the highest severity shown — to avoid the visual duplication of repeating name/severity/reason across a package's multiple advisories. Columns are space-padded and aligned (npm-outdated style, JTBD-005), not tab-joined. The JSON and XML formats retain per-advisory granularity (one entry per advisory); only the human-readable table groups.
- **JSON** (`--format=json`): new top-level `unfixable` array; each element is an object with `name`, `severity`, `advisory`, `reason`, and a `via` array describing the dependency path. Existing `rows` / `packages` fields are unchanged.
- **XML** (`--format=xml`): new `<unfixable>` element under the root, containing one `<vulnerability>` element per row with `name`, `severity`, `advisory`, `reason` attributes and a nested `<via>` element.

When `--no-unfixable` is passed (or `unfixable: false` in the config file), the table section is omitted, the JSON `unfixable` array is omitted, and the XML `<unfixable>` element is omitted.

### Exit-code mapping (unchanged per ADR-0003 + ADR-0004)

Presence or absence of unfixable rows **does not** affect exit code. Exit 0 still means "nothing to recommend"; exit 1 still means "safe updates available" (per ADR-0004's `--check` semantics); exit 2 still means "tool error". The autonomous workflow's existing exit-code routing (JTBD-100's gating contract) is untouched.

### Workflow integration

The auto-update workflow's "Open pull request" step (`.github/workflows/auto-update.yml`, per ADR-0017 §Workflow shape steps 6 and 7) reads the new `unfixable` field from the `updates.json` artifact and appends a `## Known vulnerabilities without safe fix` section to the PR body. The section is omitted when the array is empty. The section is added on **both** the green and budget-exhaust PR paths — unfixable vulns are independent of the recovery loop's success.

Per JTBD-008, the PR body — not workflow logs — is the persistent audit surface. The section's presence in the body means an unfixable vuln remains discoverable after the workflow run's logs have rotated out of retention.

### Schema-version handling

The JSON and XML schemas gain an additive field. Consumers that ignore unknown fields will continue to work unchanged. No version field is bumped in the output (the schemas are unversioned today, per ADR-0002). If a future change ever needs to be subtractive or renaming, that will require a separate ADR and a versioning strategy.

## Consequences

### Good

- Vulns that the autonomous loop cannot fix become visible in the PR body the maintainer reviews on every auto-update landing (JTBD-008, JTBD-203).
- `--check` semantics gain useful read-only signal without altering JTBD-100's exit-code contract.
- All-severity default catches moderate vulns like the brace-expansion case that motivated this work; opt-in to severity floor stays available for noisier ecosystems.
- Schema-additive design avoids breaking any current JSON/XML consumer.
- Independence from the audit-resolve `--level high` policy lets visibility and gating evolve separately.
- Excluding `audit-resolve.json`-excepted advisories prevents the maintainer's explicit "known and accepted" decisions from re-surfacing as noise.
- The detection rule is mechanical and grep-able; tests can lock the boundary between unfixable, fixable-soon, and safe.
- Reuses ADR-0014's smart-search filter pipeline — no new vuln-resolution machinery; the unfixable signal IS the absence of that pipeline's output.
- Table format honours JTBD-005 by appending a new section rather than altering the outdated columns.

### Neutral

- Adds a new section to the table output and one optional field to JSON/XML. Output width is unchanged; JSON/XML byte size grows by a small array.
- Requires a new CLI flag (`--no-unfixable`) and corresponding config-file key. Existing config files without the key inherit the default (on).
- The auto-update workflow PR body grows by one section when unfixable vulns are present. PR bodies remain well under any reasonable size limit.
- The `--unfixable-level` flag adds a second severity threshold, which is one more thing for the maintainer to keep track of. Default of `low` (= surface everything) makes the flag invisible until consciously raised.

### Bad

- **More noise in the default output (JTBD-006 tension).** Surfacing every severity means a low-severity-vuln-rich ecosystem will produce a longer report. JTBD-006 values low cognitive cost; the chosen default trades some noise for guaranteed visibility. Mitigated by `--unfixable-level=moderate` (or higher) for projects that find this overwhelming; reassessment criterion #2 commits to revisiting the default if noise becomes sustained.
- **Detection accuracy depends on `npm audit --json` quality.** Advisories with imprecise `fixAvailable` data may produce false-negatives (a package reported as unfixable that actually has a fix) or false-positives (a fix that npm audit fails to report). The same risk exists for the current --check vulnerability filtering; this ADR inherits it.
- **Schema growth is one-way.** Once `unfixable` is in the JSON/XML schema, removing it later is a breaking change. Acceptable: the field is small and serves a clear job.

## Confirmation

This decision is implemented when:

1. `dry-aged-deps --check` with at least one vuln in a transitive dep that has no patched version (or whose patched version is too young AND no version satisfies the security threshold) prints a `Known vulnerabilities without safe fix` section after the outdated table. Each row includes `Name`, `Severity`, `Advisory`, `Reason`. (Verifiable via a test fixture that pins a known-vulnerable transitive without a fix path.)
2. `dry-aged-deps --check --format=json` includes a top-level `unfixable` array. Each element has `name`, `severity`, `advisory`, `reason`, `via` fields. (Verifiable by JSON schema assertion in a test fixture run.)
3. `dry-aged-deps --check --format=xml` includes an `<unfixable>` element with `<vulnerability>` children. (Verifiable by XML structure assertion.)
4. `dry-aged-deps --check --no-unfixable` produces output that contains no unfixable section/field/element across all three formats. (Verifiable by absence assertions.)
5. The default severity floor surfaces low/moderate/high/critical. `--unfixable-level=moderate` (or via config file `"unfixable-level": "moderate"`) suppresses low-only rows. (Verifiable by fixture matrix.)
6. Exit codes for `--check` invocations are unchanged from ADR-0003 / ADR-0004's mapping regardless of unfixable-row presence. Specifically: a `--check` invocation that finds **no safe updates** but **some unfixable vulns** still exits 0, not 1. (Verifiable by exit-code assertions across fixtures.)
7. A package with a patched version that is too young to meet `--min-age` does **not** appear in the `unfixable` set. (Verifiable by a fixture where a vuln has a 1-day-old patched version.)
8. An advisory id present in `audit-resolve.json` exclusions does **not** appear in the `unfixable` set, regardless of severity or fixability. (Verifiable by a fixture with a known excepted advisory.)
9. `.github/workflows/auto-update.yml` reads `unfixable` from `updates.json` and adds a `## Known vulnerabilities without safe fix` section to the PR body when the array is non-empty. The section appears on both green and budget-exhaust PRs. (Verifiable by inspection of the workflow file and a workflow_dispatch run against a fixture with unfixable vulns.)
10. The `audit-resolve.json` `--level high` gate (ADR-0008) is unaffected; prepush still passes/fails on the same criteria as before. (Verifiable by running prepush after adding an unfixable surface and confirming no audit-policy change.)
11. The JSON and XML schemas remain backward-compatible: existing consumers that ignore unknown fields continue to operate unchanged. (Verifiable by re-running any existing snapshot test that does not assert on `unfixable`.)
12. The existing outdated-table columns are unchanged — no new column is added, no column is widened by the new feature. The unfixable surface lives entirely in its own appended section. (Verifiable by snapshot test against the table formatter; honours JTBD-005.)

## Pros and Cons of the Options

### Option 1 — On by default, `--no-unfixable` to suppress (chosen)

- Good: matches JTBD-006's default-safe principle; vulns reach the maintainer's eyes without effort.
- Good: workflow PR body automatically benefits without per-call configuration.
- Good: opt-out is one flag for the (rare) maintainer who wants the quieter default.
- Bad: more noise in the default output, especially in low-vuln-rich ecosystems (mitigated by `--unfixable-level`).
- Bad: schema becomes one-way additive; future removal would be breaking (acceptable; field serves a clear job).

### Option 2 — Opt-in via `--show-unfixable` (default off)

- Good: zero behavioural change for existing users; quieter default.
- Good: keeps default JSON/XML schemas unchanged.
- Bad: the moderate-vuln-missed scenario this ADR exists to fix returns the moment the maintainer forgets the flag.
- Bad: workflow integration requires the workflow to remember to pass the flag, adding a coupling.

### Option 3 — Hybrid (JSON/XML always include; table on-by-default with opt-out)

- Good: machine-readable consumers always have the data; humans can suppress.
- Bad: two different default behaviours across format families is more surface area to document and reason about.
- Bad: the workflow's PR body integration is human-readable, so the hybrid would require the workflow to explicitly format from the always-on JSON — workable but more wiring.

### Option 4 — Do nothing

- Good: zero implementation cost.
- Bad: the brace-expansion-class observation that motivated this work continues to live in a CI log only the maintainer happens to scroll. The job remains unaddressed.

## Reassessment Criteria

Reassess by **2026-08-19** (3-month default), or earlier if any of the following hold:

1. **False-positive rate from npm audit > 10% in a calendar month.** If maintainers find that more than one in ten rows in the unfixable section is actually fixable on inspection, the detection logic needs revision (likely by adding a stricter `fixAvailable` cross-check or by querying GHSA directly).
2. **Default severity floor produces sustained complaints about noise.** If the default of "all severities" generates more than five rows per `--check` invocation on a repo this size, consider raising the default to `moderate` (this is the JTBD-006-tension reassessment trigger).
3. **PR body grows beyond a readability threshold.** If the auto-update PR body's `Known vulnerabilities without safe fix` section routinely exceeds, say, 20 rows, consider truncation with a "see full list in updates.json" link.
4. **A JSON/XML consumer breaks despite the additive design.** If a downstream tooling consumer can be shown to misbehave on the new field, revisit the schema strategy (likely toward an explicit version field in the output).
5. **`audit-resolve.json` exception leak.** If an excepted advisory is observed appearing in the unfixable surface, the exclusion-cross-check has regressed and needs an immediate fix.

### Related decisions and JTBDs

- **References ADR-0001** (ES Modules) — implementation will follow the ES-modules convention with `.js` extensions in imports.
- **References ADR-0002** (JSON/XML output support) — extends both schemas additively.
- **References ADR-0003** (Exit code standardisation) — exit-code mapping is unchanged.
- **References ADR-0004** (Check mode for CI/CD enforcement) — `--check`'s exit-1 trigger remains "safe updates available"; unfixable surfacing does not influence it.
- **References ADR-0008** (better-npm-audit for exceptions) — audit policy independence; the new surface is read-only and excluded advisories are filtered out.
- **References ADR-0014** (`--update` target is latest-safe, not wanted) — the smart-search filter pipeline whose absence-of-output IS the unfixable signal.
- **References ADR-0017** (Single-workflow inline-loop auto-update) — the workflow's "Open pull request" step (§Workflow shape steps 6 and 7) is extended to surface unfixable vulns in the PR body.
- **Driven by JTBD-005** (Familiar npm-outdated-style output) — table format keeps existing columns; new surface is a separate section.
- **Driven by JTBD-006** (Trust default policy) — visibility-first default, with tension acknowledged in §Bad consequences and a reassessment trigger.
- **Driven by JTBD-008** (Inspect what an automated update landed and why) — PR body is the maintainer's inspection surface; persists beyond log retention.
- **Driven by JTBD-100** (Gate CI on pending updates) — `--check` semantics extended without changing exit-code contract.
- **Driven by JTBD-202** (Policy as code) — `--unfixable-level` is config-file settable in `.dry-aged-deps.json`.
- **Driven by JTBD-203** (Reproducible audit artefacts) — unfixable surface visible across all three output formats.
- **Anticipates a new JTBD** (to be authored in the same change-set): "See vulnerabilities I can't yet fix so I can plan mitigation" under the project-maintainer persona. The new JTBD will be the primary alignment anchor for this feature; ADR-0018 documents the architectural shape. _(Status update 2026-06-05: this JTBD has since been authored and ratified as JTBD-009 — see `docs/jtbd/project-maintainer/JTBD-009-see-unfixable-vulnerabilities.proposed.md`. The 2026-06-05 amendment below cites it as a driver, not as anticipated.)_
- **Spec file:** `prompts/016.0-DEV-SURFACE-UNFIXABLE-VULNERABILITIES.md` (to be created in the same change-set).

## 2026-06-05 Amendment — three-class unfixable-reason taxonomy

### Motivation

The shipped v2.10.0 / v2.10.1 unfixable surface keys reason text off a binary `isDirect` test (`src/find-unfixable-vulns.js` lines 52–56): transitive deps get `vulnerable transitive dependency`, direct deps with no safe-and-mature target get `no patched version`, and a residual catch-all says `no safe, mature version available`. P013 (Status: Known Error, WSJF 4.5) confirmed the live case on this repo: `npm audit` reports `brace-expansion` with `fixAvailable: true` while `dry-aged-deps --check` stamps it `vulnerable transitive dependency` — directly contradictory guidance, and exactly the trust gap the unfixable surface is meant to close.

`fixAvailable: true` semantics are not uniform: in the brace-expansion case it means the fix exists inside an npm parent bump (`node_modules/npm/node_modules/brace-expansion`), which `overrides` cannot reach. In other cases the same flag means an `overrides` edit at the root project would resolve it. In a third class no satisfying version exists yet. The reason string must distinguish these three because each implies a different user action.

### Three-class taxonomy

A package surfaced under `Known vulnerabilities without safe fix` is classified into exactly one of:

- **(a) `fix-via-parent-bump`** — the vulnerable copy is bundled inside an upgradable parent (e.g. `node_modules/npm/node_modules/brace-expansion`). The parent itself appears in the dependency tree as a package that can be upgraded to a release that bundles a non-vulnerable copy. `overrides` cannot reach a bundling parent's own `node_modules`. **Action surfaced**: bump the bundling parent package.
- **(b) `fix-via-overrides-edit`** — the vulnerable copy lives in the root project's tree at a path that `package.json` `overrides` can pin. The advisory's patched range is satisfiable by some installable version. **Action surfaced**: add or update an `overrides` pin to a patched version.
- **(c) `genuinely-unfixable`** — no satisfying version exists yet (`fixAvailable: false` or `fixAvailable` describes a range with no installable member), OR the bundling parent itself has no upgrade path that resolves the vulnerability. **Action surfaced**: wait for an upstream patch; no autonomous action available.

### Detection signals

For each `npm audit --json` `vulnerabilities.<name>` entry that survives the existing safe-set / exclusion / severity-floor filters:

1. If `fixAvailable === false` or `fixAvailable` is an object whose `name`/`version` does not resolve to an installable patched version → **class (c)**.
2. Otherwise, walk `via` and `effects` to identify the bundling-parent path:
   - If the advisory's path traverses a `node_modules/<parent>/node_modules/<name>` segment AND `<parent>` itself appears as a vulnerability entry or as a dependency that can be upgraded to a release bundling a non-vulnerable copy → **class (a)** (`fix-via-parent-bump`, with the parent name surfaced in the advice string).
   - Else if the vulnerable package name resolves under the root project's own `node_modules/<name>` AND the patched range is satisfiable AND an `overrides` pin to the patched range is structurally possible (i.e. the package is not bundled inside an un-overridable parent) → **class (b)** (`fix-via-overrides-edit`).
   - Else → **class (c)**.

**Class precedence (per-advisory).** When a single advisory could be resolved by either bumping a bundling parent OR pinning via `overrides`, **class (a) takes precedence over class (b)**. Rationale: a parent bump resolves the vulnerable copy at its source (the parent's bundled `node_modules`), whereas an `overrides` pin against a bundled-inside-parent path is structurally unreachable. The step ordering above already encodes this — the precedence is stated here so the classifier's tie-break is documented, not implicit.

**Multi-advisory packages.** Per the 2026-05-25 amendment, the table formatter groups by package — one row per package with advisories joined in the `Advisory` column. When a package's advisories span multiple classes (e.g. one class (a) and one class (c)), the displayed `Reason` is the **most-actionable** class using the precedence **(a) > (b) > (c)**. Rationale: surfacing `no patched version` for a package whose other advisory is in fact fixable-by-parent-bump would suppress the actionable signal. The JSON / XML formats retain per-advisory granularity (one entry per advisory, each carrying its own classified `reason`); only the human-readable table collapses to the most-actionable class.

Detection runs entirely from existing inputs: `npm audit --json` (vulnerability + `fixAvailable` data), the dependency tree (`npm ls --json` or the already-resolved tree from the existing pipeline), and the `package.json` `overrides` block. No new I/O channel.

### User-facing reason strings

The `Reason` column in the table formatter and the `reason` field in JSON/XML use:

- **(a)**: `fix via parent bump: <parent>` — e.g. `fix via parent bump: npm` for the brace-expansion live case.
- **(b)**: `fix via overrides edit` — when no override currently pins the vulnerable name, OR `update overrides pin: <name>` when an existing pin needs to move to a patched range.
- **(c)**: `no patched version` (when `fixAvailable === false`) or `no fix path` (when `fixAvailable` is structurally unreachable).

The pre-amendment string `vulnerable transitive dependency` is **retired** — it was a category label, not an action, and conflated all three new classes. Existing test snapshots that assert the old string need updating. The `reason` field is documented as a human-readable string (not an enum); no known consumer switches on the retired literal, so the vocabulary churn is in-scope additive change rather than a schema break.

### Backwards compatibility

JSON / XML consumers see the same `reason` field shape (string) with new vocabulary. The schema is unchanged. Snapshot tests that assert exact reason strings (likely under `src/formatters.*.test.js` and `test/formatters.unfixable.test.js`) will need to be updated as part of the implementation iters — this is in-scope for the work P013 tracks, not a separate concern.

### Confirmation criterion (additive)

13. The `Reason` column / `reason` field uses one of `fix via parent bump: <parent>`, `fix via overrides edit`, `update overrides pin: <name>`, `no patched version`, or `no fix path` — never the retired `vulnerable transitive dependency` string. (Verifiable by fixture matrix covering all three classes plus the two class-(c) subcases.)
14. On the live repo state where `node_modules/npm/node_modules/brace-expansion` is the surviving vulnerable copy and `npm audit` reports `fixAvailable: true`, `dry-aged-deps --check` classifies brace-expansion as **(a) `fix via parent bump: npm`** — not `vulnerable transitive dependency`. (Verifiable by a fixture mirroring the bundled-in-npm topology, or by direct invocation on this repo post-implementation.)
15. A vulnerability whose patched range is satisfiable AND whose vulnerable copy sits at the root project's `node_modules/<name>` AND has no existing `overrides` pin is classified as **(b) `fix via overrides edit`**. (Verifiable by a fixture where overrides is empty and a transitive vuln has `fixAvailable: true`.)
16. A vulnerability with `fixAvailable: false` is classified as **(c) `no patched version`**; with `fixAvailable` describing an unreachable target it is **(c) `no fix path`**. (Verifiable by two fixtures covering each subcase.)
17. A package with two advisories spanning classes (a) and (c) renders a single table row whose `Reason` is the class-(a) string (most-actionable wins); the JSON / XML output retains both advisories with their per-advisory classified `reason`. (Verifiable by a fixture with a mixed-class package.)

### Lifecycle-transition decision

This amendment is **structural** to ADR-0018's chosen option (it sharpens the `Reason` semantics; it does not change which option was chosen, the detection rule's pipeline placement, or the exit-code contract). ADR-0018 remains `proposed` until the classifier-extension iters complete: an `accepted` ADR whose Confirmation criteria #13–#17 describe behaviour absent from `src/find-unfixable-vulns.js` would assert reality that does not hold. Transition `proposed → accepted` when the classifier-extension lands and Confirmation #14 is observable on this repo. (Architect review at amendment-draft time selected this option over (L1) "transition at amendment commit" and (L3) "defer to 2026-08-19 reassessment".)

### Related (amendment-specific)

- **Driven by JTBD-009** (See unfixable vulnerabilities, `docs/jtbd/project-maintainer/JTBD-009-see-unfixable-vulnerabilities.proposed.md`, ratified 2026-06-02) — Desired Outcome #1 ("by default, without me needing to remember a flag") is sharpened by making each surfaced row self-classify into an action class.
- **Drives P013** (Known Error, WSJF 4.5) — the brace-expansion live mislabel that motivated this amendment.
- **Touches `src/find-unfixable-vulns.js`** — `deriveReason()` (lines 52–56) is the surface that this amendment requires extending to read `fixAvailable` and walk the bundling-parent path.
- **Touches the table / JSON / XML formatters** — `Reason` column values change for any non-direct vuln; snapshot tests update with the rollout.
- **Composes with RFC-001 (Overrides Hygiene Module, verifying)** — RFC-001 surfaces stale `overrides` pins as a standalone section. This amendment is independent: classes (a) and (c) operate without any `overrides` block, and class (b) describes an action (`add an overrides pin`) that is downstream-readable by RFC-001's hygiene checks but does not require RFC-001 to be shipped.
