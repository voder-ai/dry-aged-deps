---
status: 'accepted'
date: 2025-11-13
decision-makers: ['Tom Howard']
consulted: []
informed: []
reassessment-date: 2026-11-13
---

# 0007. ESLint Plugin Selection Strategy

## Context and Problem Statement

The project currently uses ESLint with two configurations:

- ESLint recommended rules (built-in).
- `eslint-plugin-security` (security-focused rules).

We need to decide whether to add additional ESLint plugins to improve code quality, particularly considering:

- `eslint-plugin-unicorn`: 100+ opinionated rules for modern JavaScript.
- `eslint-plugin-sonarjs`: bug detection and cognitive-complexity rules.
- Other alternatives.

### Prior state

**Project characteristics:**

- Small, mature codebase: 1,815 lines of code.
- 10 source modules, 13 implemented features.
- Single active contributor.
- Stable functionality (not rapidly evolving).
- Fast linting: 0.67 seconds.

**Existing quality measures:**

- ESLint recommended rules.
- `eslint-plugin-security` (critical for npm packages).
- TypeScript type checking via JSDoc (ADR-0006).
- Prettier for formatting.
- vitest with 96.96% statement coverage.
- Only 3 `eslint-disable` comments (all justified).

### Plugins evaluated

**`eslint-plugin-unicorn` (v62.0.0):**

- 100+ opinionated rules.
- 6M+ weekly downloads.
- Focuses on modern JavaScript patterns, consistency, best practices.
- Highly configurable but very comprehensive.
- Many auto-fixable rules.

**`eslint-plugin-sonarjs` (v3.0.5):**

- ~30 cognitive-complexity and bug-detection rules.
- 2M+ weekly downloads.
- Focused on code smells, complexity tracking, and logic bugs.
- Less opinionated than unicorn (bugs over style).
- From SonarSource (static-analysis experts).
- Fewer auto-fixes (requires manual refactoring).

## Decision Drivers

- **Appropriate for project scale**: 1,815 LOC does not warrant 100+ additional rules.
- **Single contributor**: consistency enforcement is less critical without team coordination.
- **Already comprehensive**: security + TypeScript + ESLint covers essential quality checks.
- **High current quality**: only 3 justified `eslint-disable` comments indicates clean code.
- **YAGNI**: no evidence of problems these plugins would solve.
- **Fast feedback loop**: the current 0.67-second linting time should not be degraded.
- **Mature codebase**: 13 features implemented; stability preferred over refactoring churn.
- **Cost/benefit**: refactoring effort would exceed value gained.

## Considered Options

1. **Do NOT add additional plugins; maintain the current configuration.**
2. **Add `eslint-plugin-unicorn` with full configuration.**
3. **Add `eslint-plugin-unicorn` with selective rules.**
4. **Add `eslint-plugin-sonarjs`.**
5. **Use `@stylistic/eslint-plugin`.**
6. **Add `eslint-plugin-node`.**

## Decision Outcome

Chosen option: **Do NOT add `eslint-plugin-unicorn` or additional linting plugins at this time**, because current quality measures are sufficient for the project's scale and there is no evidence of problems these plugins would solve.

Maintain the current ESLint configuration:

- ESLint recommended rules.
- `eslint-plugin-security`.
- TypeScript type checking (ADR-0006).
- Prettier formatting.

### Recommendation if adding a plugin

Choose **`eslint-plugin-sonarjs`** over unicorn for its focus on bugs and maintainability over style. See Option 4 below for the example configuration if circumstances change.

### Alternative: selective rule adoption

If specific improvements are identified, consider adding individual rules from plugins without full plugin adoption.

**High-value unicorn rules to consider individually:**

```javascript
// If adopting selective rules later
{
  plugins: { unicorn },
  rules: {
    'unicorn/prefer-node-protocol': 'error',      // import 'node:fs' vs 'fs'
    'unicorn/prefer-module': 'error',             // ESM best practices
    'unicorn/error-message': 'error',             // new Error() must have message
    'unicorn/explicit-length-check': 'error',     // .length > 0 clarity
    'unicorn/no-array-reduce': 'warn',            // reduce() often unclear
    'unicorn/prefer-array-some': 'error',         // .some() vs .find()
    'unicorn/prefer-spread': 'error',             // [...array] vs Array.from()
    'unicorn/throw-new-error': 'error',           // throw new Error() not Error()
  }
}
```

**Criteria for selective adoption:**

- Rule prevents actual bugs (not just style).
- Auto-fixable (minimal manual effort).
- Addresses observed code-review feedback.
- Team consensus on value.

## Consequences

### Good

- **Simplicity**: fewer dependencies and configurations to maintain.
- **Fast CI**: linting remains quick (<1 second).
- **Lower maintenance**: no plugin-update breaking changes to manage.
- **Focus on features**: developer time spent on functionality, not style debates.
- **Stable workflow**: no disruptive refactoring required.
- **Clear standards**: current rules are well-understood and proven.

### Neutral

- **Selective adoption available**: can still manually apply specific best practices.
- **Future flexibility**: the decision can be revisited as the project evolves.

### Bad

- **Missed modernisation**: won't automatically adopt the latest JavaScript best practices.
- **Manual review**: some patterns that plugins would catch require human review.
- **Potential technical debt**: some code patterns may become outdated.
- **Less guidance**: new contributors will not have extensive style enforcement.

## Confirmation

This decision is implemented when:

1. `eslint.config.js` does NOT include `eslint-plugin-unicorn`, `eslint-plugin-sonarjs`, `@stylistic/eslint-plugin`, or `eslint-plugin-node` as plugins.
2. `eslint.config.js` includes `@eslint/js` recommended rules and `eslint-plugin-security`.
3. `npm run lint` completes in under ~2 seconds on the current codebase.
4. The number of `eslint-disable` comments remains in single digits.

### Continue using current `eslint.config.js`

```javascript
import js from '@eslint/js';
import globals from 'globals';
import security from 'eslint-plugin-security';

export default [
  js.configs.recommended,
  {
    plugins: { security },
    rules: {
      ...security.configs.recommended.rules,
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  // ... file-specific configurations
];
```

## Pros and Cons of the Options

### Option 1 — Keep current configuration (chosen)

- Good: zero migration; fast CI; low maintenance.
- Good: current quality measures are demonstrably sufficient.
- Bad: relies on human review to catch patterns plugins would automate.

### Option 2 — `eslint-plugin-unicorn` (full configuration)

**Approach**: enable all 100+ unicorn rules.

- Good: maximum consistency and modernisation.
- Good: enforces latest JavaScript best practices.
- Good: many auto-fixable rules reduce manual work.
- Good: popular, well-maintained plugin.
- Bad: very opinionated; may not agree with all rules.
- Bad: significant initial refactoring (likely 50–100 issues).
- Bad: slower CI/linting times.
- Bad: overkill for a small, single-contributor project.
- Bad: breaking changes in plugin updates.
- Bad: time spent on style > functionality.
- Rejection reason: cost/benefit ratio unfavourable for project scale. Would introduce churn without addressing actual problems.

### Option 3 — `eslint-plugin-unicorn` (selective rules)

**Approach**: cherry-pick 10–20 specific unicorn rules.

- Good: targeted improvements without full plugin overhead.
- Good: can focus on bug-prevention rules.
- Good: lower refactoring cost.
- Bad: still requires dependency and configuration maintenance.
- Bad: need to research and select "right" rules.
- Bad: partial adoption may be inconsistent.
- Bad: no current problems these would solve.
- Rejection reason: even selective adoption adds complexity without clear need. Current quality measures are sufficient.

### Option 4 — `eslint-plugin-sonarjs`

**Approach**: add ~30 cognitive-complexity and bug-detection rules from SonarSource.

- Good: **bug-prevention focus** — catches logic errors, duplicated code, confusing patterns.
- Good: **cognitive-complexity tracking** — quantifies function complexity (measurable metric).
- Good: smaller footprint (~30 rules vs 100+).
- Good: less opinionated; focuses on correctness over style preferences.
- Good: professional pedigree (SonarSource).
- Good: lower false positives; rules target genuine maintainability issues.
- Good: **better than unicorn**: if adding anything, this is the best choice.
- Bad: another dependency to maintain.
- Bad: may flag working code (complex but correct functions).
- Bad: subjective thresholds (complexity limit default 15 is somewhat arbitrary).
- Bad: most issues require manual refactoring.
- Bad: configuration tuning may be needed.
- Bad: not necessary given current quality.

**Expected impact on `dry-aged-deps`:**

- 5–10 warnings likely (based on codebase analysis at the time of the decision).
- `printOutdated()` (277 lines) may exceed cognitive complexity.
- `cli-options.js` (470 lines) validation logic might be flagged.
- 2–4 hours of refactoring effort to address issues.
- Potential improvements: extract validation functions, simplify conditionals.

**Rejection reason**: while sonarjs is superior to unicorn (bug prevention > style), the project's current quality measures are sufficient. The codebase shows no evidence of complexity problems:

- Only 236 control structures across 1,815 LOC (healthy ratio).
- No deeply nested conditionals found.
- 96.96% test coverage catches logic bugs.
- TypeScript type checking prevents type errors.
- Single contributor understands complexity trade-offs.

**If circumstances change** (team growth, complexity issues), sonarjs would be the first plugin to add.

**Example configuration if adopted:**

```javascript
import sonarjs from 'eslint-plugin-sonarjs';

export default [
  // ... existing config
  {
    plugins: { sonarjs },
    rules: {
      // Core bug detection (zero tolerance)
      'sonarjs/no-all-duplicated-branches': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-duplicate-string': ['warn', 5],

      // Complexity (warnings, tune thresholds)
      'sonarjs/cognitive-complexity': ['warn', 20], // Higher than default 15
      'sonarjs/max-switch-cases': ['warn', 15],

      // Code smells (start as warnings)
      'sonarjs/no-collapsible-if': 'warn',
      'sonarjs/prefer-immediate-return': 'warn',
    },
  },
];
```

### Option 5 — `@stylistic/eslint-plugin`

**Approach**: add formatting-focused rules.

- Good: modern replacement for deprecated formatting rules.
- Good: comprehensive style enforcement.
- Bad: Prettier already handles formatting.
- Bad: redundant with existing tooling.
- Bad: would conflict with Prettier.
- Rejection reason: Prettier already provides formatting. Adding stylistic rules would create conflicts and duplication.

### Option 6 — `eslint-plugin-node`

**Approach**: Node.js-specific best practices.

- Good: tailored for Node.js projects.
- Good: catches Node.js-specific issues.
- Bad: ESLint + security plugin cover critical Node.js concerns.
- Bad: project uses modern Node.js (v18+) without deprecated APIs.
- Bad: would add minimal value.
- Rejection reason: current rules cover Node.js essentials. Project does not use deprecated Node.js features.

## Reassessment Criteria

Review this decision when:

1. **Project growth**: codebase exceeds 5,000 LOC.
2. **Team expansion**: multiple active contributors join.
3. **Maintenance issues**: bugs emerge that linting plugins would prevent.
4. **Major refactoring**: a natural time to adopt stricter standards.
5. **Quality problems**: `eslint-disable` comments proliferate.
6. **Dependency issues**: the security plugin is no longer maintained.
7. **Complexity creep**: functions become difficult to understand/maintain.

## Related Decisions

- **ADR-0001**: Use ES Modules — modern JavaScript already adopted.
- **ADR-0006**: JSDoc Type Checking — type safety covered by TypeScript.
- Prettier configuration — formatting already handled.

## References

- [eslint-plugin-unicorn](https://github.com/sindresorhus/eslint-plugin-unicorn)
- [eslint-plugin-sonarjs](https://github.com/SonarSource/eslint-plugin-sonarjs)
- [ESLint Recommended Rules](https://eslint.org/docs/latest/rules/)
- [eslint-plugin-security](https://github.com/eslint-community/eslint-plugin-security)
