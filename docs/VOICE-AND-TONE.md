# Voice and Tone Guide

**Last reviewed:** 2026-05-13

This guide is the source of truth for `dry-aged-deps`'s voice and tone. The `wr-voice-tone:agent` reads this file to review user-facing copy. Contributors authoring CLI strings, README updates, ADRs, or release notes consult it to keep prose consistent across surfaces.

## Brand Voice

Three adjectives, in priority order:

1. **Precise** — say the specific thing. `--update` writes the latest mature, vulnerability-free version; it does NOT write `wanted`. `--check` exits 1 on safe updates, 0 on none, 2 on error. Vague qualifiers ("rich set of features", "lightning fast", "best in class") have no place. If a claim cannot be grounded in a flag, a contract, or an exit code, it doesn't go in product copy.
2. **Concrete** — bias toward examples over abstractions. `npm install -g dry-aged-deps` beats "easy installation". `Severity 4 × Likelihood 2 = 8 (Medium)` beats "moderate risk". Show the user what they will see or do, not what category it belongs to.
3. **Plain** — short words and short sentences when they fit. The audience is technical, but technicality is not an excuse for jargon-for-jargon's-sake. "Mature" beats "soaked"; "latest safe version" beats "the post-filter post-smart-search safe target tuple element" (except inside an ADR where the precision is load-bearing).

The voice is **sober about risk** — this is a supply-chain-safety tool. Trust in defaults is the product. Marketing-flavoured certainty ("never miss an update again", "complete protection") is the wrong register; honest statement of what the tool covers and what it doesn't is the right register.

## Audience

- **Project maintainers** running the CLI on their own machine to vet dependency updates before applying them. They're time-scarce, comfortable with `npm` ergonomics, and trust default behaviour to be safe.
- **CI/automation engineers** integrating the CLI into pipelines via `--check`, `--format=json`, exit codes, and `.dry-aged-deps.json` config. They depend on stable contracts — flag names, exit-code semantics, JSON/XML schema — staying stable.
- **Tech leads** setting team policy via `.dry-aged-deps.json`, per-team thresholds, and stricter prod-vs-dev rules. They care about reproducibility and audit trails.

All three personas are technical. None are sales prospects. Speak to them as peers.

## Tone Spectrum

The project has three surfaces; tone shifts across them. The voice stays consistent (precise, concrete, plain); the **register** changes.

### Surface 1 — README and marketing copy

**Register: warm + playful + concrete.** This is the user's first contact with the project. A small amount of personality is appropriate and welcome. The existing README uses food/aging metaphors (the "dry-aged-deps" name itself; "Like a fine steak, some dependencies are better aged"; "drinking wine straight from the fermenting vat") as a memorable hook for what the tool does. Keep that register where it lands cleanly. **Constraints**:

- Metaphors must illustrate, not obscure. The reader should understand the literal claim from the next sentence even if they missed the metaphor.
- One playful framing per section is plenty; stacking metaphors becomes noise.
- The Problem / Solution structure stays sober — list the actual failure modes (supply-chain attacks, rushed releases) without softening them.
- Emoji as section-header glyphs (⚠️ ✨ 🚀 🥩) are an established register and stay; emoji inside body prose are not.

### Surface 2 — CLI strings (`console.log`, `console.error`, help text)

**Register: terse + action-oriented + helpful.** Users see these mid-task; they need to act on them.

- Errors lead with `Error:`; warnings with `Warning:`. Information messages have no prefix.
- Errors name what failed and offer the next step when possible. `Error: Unknown option '--json'\n  Did you mean '--format=json'?` is the model.
- Help text uses one line per flag, parallel construction, default values in parentheses.
- No emoji. No metaphors. No second person beyond imperatives ("Run", "Set", "See").
- Output destined for machine parsing (`--format=json`, `--format=xml`) carries no decorative text whatsoever.

### Surface 3 — ADRs, RISK-POLICY, problem tickets, internal docs

**Register: precise + reference-heavy + sober.** This surface records decisions for future readers (including future-you).

- Use the term once, define it implicitly through context, then use it consistently. ADR-0014's "4th tuple element (`latest`)" reads strangely on first encounter but is precise; once the reader has seen the pipeline, the term clicks.
- Cross-reference by stable IDs: `ADR-NNNN`, `P<NNN>`, `prompts/NNN.N-...md`, `JTBD-<persona>-<NNN>`. Never cite by title alone.
- Trade-offs are mandatory, not optional. Every Decision Outcome has Good / Neutral / Bad consequences; every option in Considered Options has Good / Bad bullets.
- Avoid hedge words ("perhaps", "might be", "could possibly") unless they reflect a genuine open question — in which case the open question goes in Confirmation or Reassessment Criteria, not buried in prose.

## Do / Don't Examples

Each pair is drawn from actual project content or content the project might plausibly add.

### 1. CLI error messages

| Don't                          | Do                                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `Error: Something went wrong.` | `Error: Unknown option '--json'`<br>`  Did you mean '--format=json'?`<br>`  Use 'dry-aged-deps --help' to see all available options.` |

The don't is vague and offers no next step. The do names the exact failure, suggests a likely fix, and points at the help surface.

### 2. README claims

| Don't                                                                                              | Do                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "dry-aged-deps protects you from all supply-chain attacks with cutting-edge filtering technology." | "`dry-aged-deps` wraps `npm outdated` and filters results to only show updates that are both: 1. Mature (≥7 days old by default) — giving the community time to catch issues. 2. Secure (no known vulnerabilities)." |

The don't makes an unfounded sweeping claim ("all supply-chain attacks") and uses marketing filler ("cutting-edge"). The do names exactly what the tool does — wraps `npm outdated`, applies two filters — and gives the defaults so the reader can judge fit.

### 3. ADR consequences

| Don't                                              | Do                                                                                                                                                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "This is a good change that improves reliability." | "Behaviour change for any consumer who relied on `--update` being a no-op on exact pins. No such consumer is known to exist; the behaviour was a bug rather than a feature. Recorded here for completeness." |

The don't is a content-free assertion. The do names the specific consequence, the specific population affected (zero, in this case), and acknowledges the framing trade-off (bug vs feature). Lifted from ADR-0014.

### 4. Help text

| Don't                                                      | Do                                                                   |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| `--update    Updates your dependencies (use with caution)` | `--update               Update dependencies to latest safe versions` |

The don't editorialises ("use with caution") without saying what to be cautious about. The do states exactly what the flag does. If a warning is genuinely needed, it belongs in the README or in `--update`'s confirmation prompt, not the one-line help.

### 5. Problem ticket descriptions

| Don't                                                                       | Do                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "The update command sometimes doesn't work right and we should look at it." | "`dry-aged-deps --update` does not bump exact-pinned dependencies even when a mature, vulnerability-free newer version is available. The implementation uses the `wanted` column from `npm outdated` (which equals `current` when the package.json range is an exact pin), but the spec ... says updates should go to the latest safe version filtered by maturity + security." |

The don't is vague and unactionable. The do names the exact symptom, the exact root cause (the `wanted` column), and the exact spec divergence. Lifted from P001 (verifying).

### 6. Risk-report prose

| Don't                                                                                  | Do                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "This change is pretty risky because of various reasons including supply-chain stuff." | "Risk 1: `--update` CLI semantic shift ships to npm consumers. Inherent impact 4/5 (Significant — user-facing CLI behaviour change). Inherent likelihood 3/5 (Possible — change touches `--check`/`--update` coherence + autonomous-workflow contract). Controls: 4 RED→GREEN tests in `src/update-packages.test.js`; `applyFilters()` architectural safeguard; ADR-0014 records the decision. Residual: 4/25 (Low)." |

The don't is hand-waving. The do names the risk concretely, scores it against `RISK-POLICY.md`, lists the controls that bring it down, and gives the residual. The form forces precision.

## Terminology

### Preferred

- **Mature** — the project's word for "version is at least N days old". Better than "stable", "soaked", "aged" (the last is the brand name; reserve it for that context).
- **Safe** — the project's word for "passes the maturity and security filters". Use when the meaning is "passed our gate", not as a generic adjective.
- **Exact pin** — `"foo": "1.2.3"` in `package.json`. Better than "fixed version" or "hard-pinned".
- **Smart-search safe target** — the post-filter version produced by `trySmartSearchFallback` when npm's `latest` doesn't pass the gate. Use the full phrase in docs; "safe target" alone in CLI strings if context resolves it.
- **Soak window** — the time between a version being published to npm and being eligible for `--update`. Use sparingly; "mature" is the more common term.
- **Supply-chain safety** — the project's value proposition. Capitalise as needed in headings; sentence case in body.

### Avoid

- **Lightning fast / blazing fast / cutting-edge / best-in-class / industry-leading** — marketing filler. The tool's speed is bounded by `npm outdated` + `npm audit`; we don't outperform anything dramatically and shouldn't claim to.
- **Complete protection / never miss / total / always safe** — overpromises. The tool reduces risk; it doesn't eliminate it. `RISK-POLICY.md` is explicit about residual risk and appetite; product copy should match that honesty.
- **Easy / simple / intuitive** — these adjectives describe the user's experience, not the product. Show via concrete examples whether something is easy; don't claim it.
- **Just / merely / simply** — minimisers that condescend ("just run this command"). Drop the qualifier and let the imperative carry the meaning.
- **Robust / scalable / enterprise-grade** — vague positive-sounding words with no specific meaning. If a real claim is being made, state it concretely.

## When to update this guide

Refresh this guide when:

1. A new surface emerges (e.g. a web dashboard, a Slack notifier) that needs its own register entry in the Tone Spectrum section.
2. A do/don't example becomes stale because the referenced feature has shifted (ADR superseded, flag renamed).
3. A reviewer keeps catching the same kind of voice drift in PRs — that's evidence the existing examples don't cover the case.
4. Three months from the date at the top of this file as a default review checkpoint.

When updating: change the **Last reviewed** date, preserve guidance you don't intend to revise, and note material changes in the commit message so reviewers can see the diff at a glance.

## Why this file exists

The `wr-voice-tone:agent` subagent — wired into commit-gate flows on every project that has the `wr-voice-tone` plugin enabled — reads this file as the authoritative voice/tone reference when reviewing user-facing copy. Without this file, the agent returns FAIL on every invocation (captured as **P005**); with this file, the agent has the context to produce useful PASS / ISSUES FOUND verdicts on real prose changes.

This guide is also a contract with future contributors and with future-you: the project's voice is what's written here, not what's in any individual contributor's head.
