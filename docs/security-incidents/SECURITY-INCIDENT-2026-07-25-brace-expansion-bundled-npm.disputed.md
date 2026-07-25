# Security Incident: brace-expansion DoS (unbounded expansion → OOM) bundled within npm

## 1. Classification

- Severity Level: P1: High (as reported by npm audit / better-npm-audit `--level high`)
  - brace-expansion: CWE-400 (Uncontrolled Resource Consumption) — GHSA-mh99-v99m-4gvg
- Impact:
  - **brace-expansion vulnerability (GHSA-mh99-v99m-4gvg)**:
    - Advisory ID: 1124334
    - Affected Versions: brace-expansion `<= 5.0.7`
    - Patched Versions: brace-expansion `5.0.8+`
    - Bundled in: npm 11.18.0 (within `@semantic-release/npm` 13.1.5) — `node_modules/npm/node_modules/brace-expansion`
    - Potential consequence: Denial of Service via unbounded expansion length causing an out-of-memory process crash when expanding a maliciously-crafted brace pattern.
    - **Actual risk for this project**: False positive — see §6 Risk Assessment.

## 2. Triage

- Date reported: 2026-07-25 (surfaced by the pre-push `audit:ci` gate failing on `--level high`)
- Reporter: npm audit / better-npm-audit during routine pre-push validation
- Initial acknowledgment date: 2026-07-25
- Assigned to: Maintenance Team (single maintainer)

## 3. Containment

- Steps to reproduce:

  ```bash
  npm audit --audit-level=high
  # brace-expansion  <=5.0.7
  # Severity: high
  # GHSA-mh99-v99m-4gvg — node_modules/npm/node_modules/brace-expansion
  ```

- Immediate remediation actions:
  1. Confirmed the project's own direct/transitive (non-bundled) `brace-expansion` is already patched to `5.0.8` (prior fix this session, commit `c421909`).
  2. Confirmed the flagged copy is the one **bundled inside npm** (`node_modules/npm/node_modules/brace-expansion`), inside the `@semantic-release/npm` dev dependency.
  3. Verified it is unfixable from this repository: `npm audit fix` reports `brace-expansion@5.0.7 is a bundled dependency of npm@11.18.0 ... It cannot be fixed automatically. Check for updates to the npm package.` The only `npm audit fix --force` path downgrades `@semantic-release/npm` to `4.0.2` (a ~9-major breaking rollback of the release tooling) — rejected.
  4. Confirmed dependency `overrides` cannot reach a bundled dependency (empirically verified earlier this session for the sibling tar advisory: the override left the bundled copy vulnerable and introduced new advisories).
  5. Documented this analysis and added advisory `1124334` to `audit-resolve.json` per ADR-0008, referencing this incident.

## 4. Eradication

- Root cause analysis:
  - `brace-expansion <= 5.0.7` has an uncontrolled-expansion DoS. npm bundles (vendors) its own copy of `brace-expansion` inside its published tarball; `@semantic-release/npm` in turn bundles npm. The vulnerable copy is therefore three levels deep inside a bundled tree that top-level `overrides` and `npm audit fix` cannot rewrite.
  - `@semantic-release/npm` 13.1.5 (latest) bundles npm 11.18.0, which still vendors the pre-patch `brace-expansion`. A patched npm (12.0.1 is published) would carry the fix, but adopting it requires `@semantic-release/npm` to bump its bundled npm — an upstream change, not a local one.
  - The advisory is not in a direct or overridable dependency of this project.

- Fix implemented:
  - No code or dependency change is possible from this repository (bundled dependency).
  - Added a documented exception (`audit-resolve.json` advisory `1124334`) referencing this incident, per ADR-0008.

- Tests added:
  - None required — no product code path changes. Existing suite unaffected.

## 5. Recovery

- Validated changes:
  - `npm run audit:ci` passes with advisory `1124334` excluded; all other advisories still enforced at `--level high`.
  - No product dependency, source, CLI, or exit-code change.

- Monitoring:
  - npm audit continues to report this advisory (and the sibling moderate tar advisory GHSA-r292-9mhp-454m) until `@semantic-release/npm` ships a bundled-npm bump carrying patched `brace-expansion`. The exclusion is scoped to advisory `1124334` only — a genuinely new, unexcepted advisory still fails the gate.

## 6. Postmortem

- Timeline:
  - 2026-07-25: `audit:ci` failed the pre-push gate on GHSA-mh99-v99m-4gvg (high).
  - 2026-07-25: Investigated; confirmed bundled-in-npm, unfixable-from-here, dev-only.
  - 2026-07-25: Maintainer authorised the ADR-0008 documented-exception path; incident recorded; exclusion added.

- Risk Assessment:
  - **brace-expansion vulnerability**: FALSE POSITIVE for this project's usage.
    - The vulnerable copy is bundled inside npm, inside `@semantic-release/npm` — a **dev dependency** that executes only during CI releases (semantic-release on push to `main`), never in the published `dry-aged-deps` package (which ships with zero production dependencies).
    - During a release, `brace-expansion` is exercised by npm internally over the project's **own** files and glob patterns — trusted input, not attacker-controlled brace strings. Triggering the DoS requires feeding a maliciously-crafted brace pattern to the expander, which no untrusted party supplies on this code path.
    - No practical risk of exploitation in this project's context.

## 7. Communication

- Internal stakeholders: Maintainer.
- External communication: Not required — false positive in a dev-only bundled dependency.
- Disclosure timeline: N/A.

---

**Status**: Disputed (False Positive — No Actual Risk to this project's usage)

**Resolution Summary**: brace-expansion DoS (GHSA-mh99-v99m-4gvg) is bundled inside npm within the `@semantic-release/npm` dev dependency and is unfixable from this repository (`npm audit fix` confirms; the only forced path is a 9-major semantic-release downgrade). It is exercised only during CI releases over the project's own trusted files, so it poses no practical risk. Advisory `1124334` added to `audit-resolve.json` per ADR-0008, referencing this incident. Will clear when `@semantic-release/npm` ships a bundled-npm bump carrying patched brace-expansion.

_Document created 2026-07-25 following `docs/security-incidents/incident-response-template.md` and the 2025-11-19 glob/tar precedent (ADR-0008)._
