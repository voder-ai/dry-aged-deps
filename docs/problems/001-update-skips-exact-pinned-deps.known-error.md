# Problem 001: dry-aged-deps --update skips exact-pinned dependencies

**Status**: Known Error
**Reported**: 2026-05-12
**Priority**: 16 (High) — Impact: Significant (4) x Likelihood: Likely (4)
**Effort**: M — multiple files (src/update-packages.js, src/build-rows.js), spec clarification needed in prompts/011.0, plus reproduction test
**WSJF**: 16.0 = (16 × 2.0) / 2
**Type**: technical

## Description

`dry-aged-deps --update` does not bump exact-pinned dependencies even when a mature, vulnerability-free newer version is available.

The implementation uses the `wanted` column from `npm outdated` (which equals `current` when the package.json range is an exact pin), but the spec (`prompts/011.0-DEV-AUTO-UPDATE.md`) says updates should go to the **latest safe version** filtered by maturity + security. For exact-pinned packages like `typescript: "5.9.3"` or `globals: "17.4.0"`, `--update` reports the package in its "will be updated" list but applies no change. The output line `globals: 17.4.0 → 17.4.0` is misleading — it implies an update happened when nothing did.

This blocks the autonomous workflow in ADR-0009 from upgrading across npm semver-range boundaries (including across majors), which is the project's stated upgrade policy: pin exactly and let the dry-aged-deps process drive explicit upgrades using its age + security filter as the safety gate. Without this fix, exact-pinned packages drift further from their latest-safe versions every cycle, the opposite of what the tool exists to prevent.

Discovered while testing the auto-update workflow's OIDC mint step — the workflow short-circuits before reaching OIDC because `--update --yes` produces no diff to commit, so the workflow's "nothing to commit" path fires.

**Affects:**

- `src/update-packages.js` — uses `wanted` for the update target.
- `src/build-rows.js` — the row construction that decides what `wanted` is.
- `prompts/011.0-DEV-AUTO-UPDATE.md` — the spec needs clarifying (does "latest safe version" mean `latest` filtered by safety, or `wanted` filtered by safety?).
- `.github/workflows/auto-update.yml` — the autonomous workflow's contract (ADR-0009) depends on `--update` bumping across pins.
- `prompts/015.0-DEV-EXCLUDE-PACKAGES.md` — exclude was created for blocked-package handling; using it to mask "tool can't bump this pin" is a misuse.

## Symptoms

- Running `node ./bin/dry-aged-deps.js --check` shows the package as stale (latest version exists, is mature, no CVEs).
- Running `node ./bin/dry-aged-deps.js --update --yes` lists the package in the "will be updated" output and writes "X → X" (no change).
- `package.json` is unchanged.
- The misleading output line gives the impression an update was applied.
- The autonomous workflow's pre-push `check:deps` keeps blocking because nothing actually got fixed.

(further symptoms deferred to investigation)

## Workaround

Two workarounds, both unsatisfying:

1. Add the package to `.dry-aged-deps.json` exclude list with a reason. Silences the noise but accepts staleness.
2. Manually edit `package.json` to bump the exact pin, then run `npm install`.

Neither restores the autonomous workflow's intent.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next `/wr-itil:review-problems`
- [ ] Clarify the spec intent in `prompts/011.0-DEV-AUTO-UPDATE.md` (is `--update`'s target the `latest` column or the `wanted` column?)
- [ ] If spec intent is `latest`: change `src/update-packages.js` (and possibly `src/build-rows.js`) to use the latest-safe version and write the new exact value to `package.json`
- [ ] Update the misleading `X → X` output line (probably should not list packages where no change is applied, OR should clearly mark them as blocked-by-pin)
- [ ] Add a reproduction test that exercises an exact-pinned package with a mature newer version available
- [ ] Re-test the autonomous workflow once the fix lands (ADR-0009 §Confirmation criterion 4 — `workflow_dispatch` exercises OIDC mint + PR + auto-merge)

## Dependencies

- **Blocks**: ADR-0009 autonomous workflow end-to-end verification (the OIDC mint step is currently unreachable because no real update path exists for exact pins).
- **Blocked by**: (none)
- **Composes with**: ADR-0006 (TypeScript JSDoc setup may need compatibility verification before TS 6 lands — a separate concern that surfaces once this problem is fixed).

## Related

- **ADR-0009** — autonomous dependency-update workflow whose contract this problem blocks.
- **ADR-0012** — OIDC token-exchange authentication that remains unverified while this problem persists.
- **prompts/011.0-DEV-AUTO-UPDATE.md** — the spec whose intent the implementation diverges from.
- **prompts/015.0-DEV-EXCLUDE-PACKAGES.md** — the exclude feature being mis-used as a workaround for this problem.
- `.dry-aged-deps.json` — currently excludes `typescript` and `globals` with reasons that should reference this ticket after capture.

(captured via /wr-itil:capture-problem; expand at next investigation)
