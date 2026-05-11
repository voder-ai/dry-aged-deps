# Risk Policy

> ISO 31000-aligned risk policy for `dry-aged-deps`. This file is the single source of truth for impact levels, likelihood levels, the risk matrix, and the risk appetite that the risk-scorer agent and problem-management process consume when assessing pipeline actions (commit, push, release) and problem severity.

**Last reviewed:** 2026-05-12

## Business Context

`dry-aged-deps` is a public, MIT-licensed npm CLI tool that filters `npm outdated` to surface only updates that are mature (default ≥ 7 days old) and free of known vulnerabilities. Its primary value is supply-chain safety: helping maintainers and CI pipelines avoid rushed releases and compromised maintainer-account attacks.

- **Distribution:** npm registry, single canonical package (`dry-aged-deps`).
- **Users:** project maintainers (ad-hoc CLI use), CI/automation engineers (pipeline integration via `--check`, JSON output, exit codes), and tech leads (policy setting via config file + per-team thresholds). See `docs/jtbd/` for the full job catalogue.
- **Trust model:** users rely on the tool's default safety semantics. Defaults are part of the product, not a convenience — silently weakening them is a trust-breaking failure mode.
- **Maintenance:** single-maintainer open-source project. No formal SLA. No commercial customers, no compliance obligations beyond MIT-license terms and standard npm publishing requirements.
- **Release model:** semantic-release on push to `main` (ADR-0005). The CI pipeline (`ci-publish.yml`) gates every change with the same suite the husky pre-push hook runs locally.

## Confidential Information

This repository is **public**. No confidential business metrics (revenue, user counts, pricing, traffic volumes, client names, contractual commitments) belong in any committed file — including ADRs, problem tickets, security incidents, commit messages, or risk reports.

Where references to scale or activity are genuinely useful in documentation, use generic descriptions ("a small open-source project", "single-maintainer", "low-traffic CLI tool") rather than specific figures. If a specific figure would clarify a risk assessment, capture it in a working note outside the repo and reference it indirectly.

The risk-scorer agent will flag any diff that introduces business-metric prose as a confidentiality disclosure (standalone risk item, see `RISK_REGISTER_HINT:` protocol in the agent definition).

## Risk Appetite

**Per-action residual-risk threshold: ≤ 4 (Low band).**

Any commit, push, or release whose cumulative residual risk exceeds 4 (i.e. enters Medium, High, or Very High) is blocked at the gate. The maintainer must apply remediations until the score is back within appetite before the action can proceed.

Rationale: this project's value proposition is protecting downstream users from rushed or compromised releases. A tool that itself routinely ships Medium+ risk to npm undermines the contract its users rely on. The Low-band ceiling is tight, but tight is the correct setting for a supply-chain-safety tool.

## Impact Levels

Impact answers: "What happens to users or the business if this change goes wrong?" Five levels, anchored in this project's specific failure surfaces.

| Level | Label | Description |
|------:|-------|-------------|
| 1 | Negligible | Pure documentation typos, internal comments, README polish, or whitespace. No behavioural change in any code path. No user can observe the difference. |
| 2 | Minor | Developer-only impact: husky hook tweaks that don't change CI semantics, internal refactors that don't alter CLI output or exit codes, test-only changes, ESLint/Prettier configuration edits that don't change product code. Users on installed versions and CI pipelines using the tool are unaffected. |
| 3 | Moderate | Publishing or release pipeline disrupted: a broken `ci-publish.yml`, semantic-release misconfiguration, npm publish failure, or a release that doesn't reach the registry. Users on already-installed versions continue working; new installs are blocked until the next clean release. *Also (public-repo specific):* business metrics or confidential prose committed to the repo — an information-disclosure event requiring rapid remediation but not affecting tool behaviour. |
| 4 | Significant | User-facing CLI behaviour degraded: exit-code semantics changed (ADR-0003 / ADR-0004 contracts broken), `--check` mode reports wrong status, JSON/XML schema breaks downstream consumers (ADR-0002), prod/dev threshold isolation breaks (ADR-0007), config-file loading regresses. Users and CI pipelines see incorrect, misleading, or inconsistent signals; automation built on the CLI contract behaves wrongly. |
| 5 | Severe | The tool's supply-chain-safety promise is broken: a known-vulnerable version slips through as "safe", the age filter is bypassed (a fresh release flagged as aged), or the `.nsprc` exception process (ADR-0008) is silently widened so audit findings escape. *Also:* a compromised, malicious, or otherwise unauthorised release published to npm — the tool itself becomes a supply-chain attack vector. Trust in the tool destroyed; downstream projects that relied on its defaults are exposed. |

## Likelihood Levels

Likelihood is universal (not product-specific) and reflects how likely a risk is to materialise given the change's complexity and the controls present.

| Level | Label | Description |
|------:|-------|-------------|
| 1 | Rare | Trivial, isolated, well-understood. Extensive test coverage or architectural safeguards make occurrence very unlikely. |
| 2 | Unlikely | Could happen, but controls (tests, CI gates, review hooks) significantly reduce probability. Straightforward, clear scope. |
| 3 | Possible | Moderate complexity, multiple concerns, or limited test coverage. Could happen under normal conditions. |
| 4 | Likely | Complex, spans modules, hard to predict. High path count or limited controls. |
| 5 | Almost certain | Known gap, no controls in place, or previously observed failure mode. High-complexity, critical paths, wide dependencies. |

## Risk Matrix

Cumulative residual risk score is Impact × Likelihood. The risk-scorer agent computes a separate score per pipeline layer (commit, push, release); the highest applicable layer determines whether the action passes the appetite threshold.

| Impact \ Likelihood | 1 Rare | 2 Unlikely | 3 Possible | 4 Likely | 5 Almost certain |
|---|---:|---:|---:|---:|---:|
| **1 Negligible** | 1 | 2 | 3 | 4 | 5 |
| **2 Minor** | 2 | 4 | 6 | 8 | 10 |
| **3 Moderate** | 3 | 6 | 9 | 12 | 15 |
| **4 Significant** | 4 | 8 | 12 | 16 | 20 |
| **5 Severe** | 5 | 10 | 15 | 20 | 25 |

### Label Bands

| Score | Band |
|------:|------|
| 1–2 | Very Low |
| 3–4 | Low |
| 5–9 | Medium |
| 10–16 | High |
| 17–25 | Very High |

The appetite threshold (≤ 4) corresponds to the Low band ceiling.

## Consumers of This Policy

Both of the following read this file as the single source of truth:

- The **risk-scorer pipeline agent** scores commit, push, and release actions against the impact levels and appetite defined here.
- The **problem-management process** (`/wr-itil:capture-problem`, `/wr-itil:manage-problem`, related skills) uses the impact levels and risk matrix to set severity on problem tickets in `docs/problems/`.

Any change to impact levels, appetite, or the matrix in this file changes the behaviour of both. Treat updates as an ADR-worthy decision.
