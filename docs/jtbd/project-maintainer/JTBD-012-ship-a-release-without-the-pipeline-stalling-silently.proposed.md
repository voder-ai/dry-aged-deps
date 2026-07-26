---
status: proposed
job-id: ship-a-release-without-the-pipeline-stalling-silently
persona: project-maintainer
date-created: 2026-07-26
human-oversight: confirmed
oversight-date: 2026-07-26
screens:
  - CI: .github/workflows/ci-publish.yml (Build & Test → Release)
  - CLI: npm run prepush
  - CLI: npm run check:lockfile
  - npm registry: published package version
---

# JTBD-012: Ship a release without the pipeline stalling silently

## Job Statement

When I land a release-eligible change — a `feat:` or `fix:` commit that semantic-release should publish — I want the release pipeline to actually ship it, or to fail **loudly and locally** if something in the toolchain would break the release, so a release never silently stalls with my commit sitting unpublished on `main` while I believe it went out.

## Desired Outcomes

- A release-eligible commit reaching `main` either publishes, or surfaces a clear reason it did not — never a silent no-op where the version simply never bumps.
- Toolchain drift that would break the release (most concretely: the CI npm pin diverging from the npm that generated the committed `package-lock.json`, so `npm ci` rejects the lockfile) fails **at prepush / locally**, before the commit lands, not as an opaque CI failure discovered later.
- When the pipeline does fail, the failure names the actual cause (lockfile/npm mismatch, failing gate, missing status check) rather than a generic `npm ci` "Missing: <pkg> from lock file".
- Every release-path CI job resolves the committed lockfile identically, so a fix to one job (e.g. the build job's npm pin) cannot leave another job (e.g. the unpinned publish job) still broken.
- I can trust that "my feat/fix is on `main`" means "it will be released" — the audit trail between a release-eligible commit and the published version stays unbroken.

## Persona Constraints

- Time is the scarcest resource — I will not routinely watch CI dashboards to confirm each release actually published; the pipeline must be trustworthy by default or fail where I already look (prepush, the terminal).
- I review every change I push myself, but the failure here is invisible at review time — the commit looks fine; only the pipeline downstream is wedged — so the guard must live before or at the push, not only in CI.
- I cannot afford a release to appear shipped when it is not — adopters silently stop getting updates, and the gap is discovered late.
- I will not maintain a separate release-health monitor — the signal must come through the tooling I already run (prepush, the release workflow), not a new side-channel.
- Trust in the tool's defaults matters — a release-blocking condition must be surfaced, never worked around silently.

## Current Solutions

- Notice that `npm view <pkg> version` has not advanced after a release-eligible push — reactive, and only if I think to check; the stall is already in effect.
- Read the failing ci-publish run's logs to discover the `npm ci` rejection — high-friction, after the fact, and the error message does not name "your CI npm pin drifted from your lockfile generator".
- Manually keep the CI npm pins and the local npm in sync by memory — exactly the discipline that drifted and caused 3 consecutive failed release runs on 2026-07-25.
- Accept the gap and hope the pipeline keeps working — the silent-stall failure this job exists to close.

## Related

- **P033** — CI npm pin drifts from the lockfile-generator npm version, silently stalling the release pipeline (driving problem; this job is its anchor).
- **ADR-0024** — pin CI npm to the lockfile-generator npm version (the invariant that keeps the pipeline shipping; its P033 fix — a fail-fast drift guard — is what serves this job).
- **JTBD-105** (ci-automation-engineer: compose with semantic-release) — sibling release-adjacent job, but from the perspective of a user _consuming_ dry-aged-deps in their own semantic-release pipeline; JTBD-012 is the maintainer's own-release-pipeline reliability, a distinct perspective.
