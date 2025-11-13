# 0007. ESLint Plugin Selection Strategy

Date: 2025-11-13

## Status

Accepted

## Context

The project currently uses ESLint with two configurations:
- ESLint recommended rules (built-in)
- eslint-plugin-security (security-focused rules)

We need to decide whether to add additional ESLint plugins to improve code quality, particularly considering:
- **eslint-plugin-unicorn**: 100+ opinionated rules for modern JavaScript
- **eslint-plugin-sonarjs**: Bug detection and cognitive complexity rules
- Other alternatives

### Current State

**Project Characteristics:**
- Small, mature codebase: 1,815 lines of code
- 10 source modules, 13 implemented features
- Single active contributor
- Stable functionality (not rapidly evolving)
- Fast linting: 0.67 seconds

**Existing Quality Measures:**
- ESLint recommended rules
- eslint-plugin-security (critical for npm packages)
- TypeScript type checking via JSDoc (ADR 0006)
- Prettier for formatting
- Vitest with 96.96% statement coverage
- Only 3 eslint-disable comments (all justified)

### Plugins Evaluated

**eslint-plugin-unicorn (v62.0.0):**
- 100+ opinionated rules
- 6M+ weekly downloads
- Focuses on modern JavaScript patterns, consistency, best practices
- Highly configurable but very comprehensive
- Many auto-fixable rules

**eslint-plugin-sonarjs (v3.0.5):**
- ~30 cognitive complexity and bug detection rules
- 2M+ weekly downloads
- Focused on code smells, complexity tracking, and logic bugs
- Less opinionated than unicorn (bugs over style)
- From SonarSource (static analysis experts)
- Fewer auto-fixes (requires manual refactoring)

## Decision

**Do NOT add eslint-plugin-unicorn or additional linting plugins at this time.**

Maintain current ESLint configuration:
- ESLint recommended rules
- eslint-plugin-security
- TypeScript type checking (ADR 0006)
- Prettier formatting

### Rationale

1. **Appropriate for Project Scale**: 1,815 LOC doesn't warrant 100+ additional rules
2. **Single Contributor**: Consistency enforcement less critical without team coordination
3. **Already Comprehensive**: Security + TypeScript + ESLint covers essential quality checks
4. **High Current Quality**: Only 3 justified eslint-disables indicates clean code
5. **YAGNI Principle**: No evidence of problems these plugins would solve
6. **Fast Feedback Loop**: Current 0.67s linting time shouldn't be degraded
7. **Mature Codebase**: 13 features implemented; stability preferred over refactoring churn
8. **Cost/Benefit**: Refactoring effort would exceed value gained

## Consequences

### Positive

- **Simplicity**: Fewer dependencies and configurations to maintain
- **Fast CI**: Linting remains quick (<1 second)
- **Lower Maintenance**: No plugin update breaking changes to manage
- **Focus on Features**: Developer time spent on functionality, not style debates
- **Stable Workflow**: No disruptive refactoring required
- **Clear Standards**: Current rules are well-understood and proven

### Negative

- **Missed Modernization**: Won't automatically adopt latest JavaScript best practices
- **Manual Review**: Some patterns that plugins would catch require human review
- **Potential Technical Debt**: Some code patterns may become outdated
- **Less Guidance**: New contributors won't have extensive style enforcement

### Neutral

- **Selective Adoption Available**: Can still manually apply specific best practices
- **Future Flexibility**: Decision can be revisited as project evolves

## Implementation

### No Changes Required

Continue using current `eslint.config.js`:

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
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_', 
        varsIgnorePattern: '^_' 
      }],
    },
  },
  // ... file-specific configurations
];
```

### When to Reconsider

Review this decision if:

1. **Project Growth**: Codebase exceeds 5,000 LOC
2. **Team Expansion**: Multiple active contributors join
3. **Maintenance Issues**: Bugs that linting plugins would prevent
4. **Major Refactoring**: Natural time to adopt stricter standards
5. **Quality Problems**: eslint-disable comments proliferate
6. **Dependency Issues**: Security plugin no longer maintained
7. **Complexity Creep**: Functions becoming difficult to understand/maintain

**Recommendation if adding a plugin**: Choose **eslint-plugin-sonarjs** over unicorn for its focus on bugs and maintainability over style.

### Alternative: Selective Rule Adoption

If specific improvements are identified, consider adding individual rules from plugins without full plugin adoption:

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
- Rule prevents actual bugs (not just style)
- Auto-fixable (minimal manual effort)
- Addresses observed code review feedback
- Team consensus on value

## Alternatives Considered

### Add eslint-plugin-unicorn (Full Configuration)

**Approach**: Enable all 100+ unicorn rules

**Pros:**
- Maximum consistency and modernization
- Enforces latest JavaScript best practices
- Many auto-fixable rules reduce manual work
- Popular, well-maintained plugin

**Cons:**
- Very opinionated; may not agree with all rules
- Significant initial refactoring (likely 50-100 issues)
- Slower CI/linting times
- Overkill for small, single-contributor project
- Breaking changes in plugin updates
- Time spent on style > functionality

**Rejection Reason**: Cost/benefit ratio unfavorable for project scale. Would introduce churn without addressing actual problems.

### Add eslint-plugin-unicorn (Selective Rules)

**Approach**: Cherry-pick 10-20 specific unicorn rules

**Pros:**
- Targeted improvements without full plugin overhead
- Can focus on bug-prevention rules
- Lower refactoring cost

**Cons:**
- Still requires dependency and configuration maintenance
- Need to research and select "right" rules
- Partial adoption may be inconsistent
- No current problems these would solve

**Rejection Reason**: Even selective adoption adds complexity without clear need. Current quality measures are sufficient.

### Add eslint-plugin-sonarjs

**Approach**: Add ~30 cognitive complexity and bug detection rules from SonarSource

**Pros:**
- **Bug Prevention Focus**: Catches logic errors, duplicated code, and confusing patterns
- **Cognitive Complexity Tracking**: Quantifies function complexity (measurable metric)
- **Smaller Footprint**: ~30 rules vs 100+ (more targeted than unicorn)
- **Less Opinionated**: Focuses on correctness over style preferences
- **Professional Pedigree**: From SonarSource (static analysis experts)
- **Lower False Positives**: Rules target genuine maintainability issues
- **Better Than Unicorn**: If adding anything, this is the best choice

**Cons:**
- **Another Dependency**: More maintenance overhead
- **May Flag Working Code**: Complex but correct functions will be flagged for refactoring
- **Subjective Thresholds**: Complexity limits (default: 15) are somewhat arbitrary
- **Not Auto-Fixable**: Most issues require manual refactoring
- **Configuration Needed**: Thresholds may need tuning for project
- **Still Not Necessary**: Current quality is good without it

**Expected Impact on dry-aged-deps:**
- **5-10 warnings** likely (based on codebase analysis)
- `printOutdated()` (277 lines) may exceed cognitive complexity
- `cli-options.js` (470 lines) validation logic might be flagged
- **2-4 hours** refactoring effort to address issues
- **Potential improvements**: Extract validation functions, simplify conditionals

**Rejection Reason**: While sonarjs is superior to unicorn (bug prevention > style), the project's current quality measures are sufficient. The codebase shows no evidence of complexity problems:
- Only 236 control structures across 1,815 LOC (healthy ratio)
- No deeply nested conditionals found
- 96.96% test coverage catches logic bugs
- TypeScript type checking prevents type errors
- Single contributor understands complexity trade-offs

**If circumstances change** (team growth, complexity issues), sonarjs would be the first plugin to add.

**Example Configuration if Adopted:**
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
    }
  }
];
```

### Use @stylistic/eslint-plugin

**Approach**: Add formatting-focused rules

**Pros:**
- Modern replacement for deprecated formatting rules
- Comprehensive style enforcement

**Cons:**
- Prettier already handles formatting
- Redundant with existing tooling
- Would conflict with Prettier

**Rejection Reason**: Prettier already provides formatting. Adding stylistic rules would create conflicts and duplication.

### Add eslint-plugin-node

**Approach**: Node.js-specific best practices

**Pros:**
- Tailored for Node.js projects
- Catches Node.js-specific issues

**Cons:**
- ESLint + security plugin cover critical Node.js concerns
- Project uses modern Node.js (v18+) without deprecated APIs
- Would add minimal value

**Rejection Reason**: Current rules cover Node.js essentials. Project doesn't use deprecated Node.js features.

## Related Decisions

- **ADR 0001**: Use ES Modules - Modern JavaScript already adopted
- **ADR 0006**: JSDoc Type Checking - Type safety covered by TypeScript
- Prettier configuration - Formatting already handled

## References

- [eslint-plugin-unicorn](https://github.com/sindresorhus/eslint-plugin-unicorn)
- [eslint-plugin-sonarjs](https://github.com/SonarSource/eslint-plugin-sonarjs)
- [ESLint Recommended Rules](https://eslint.org/docs/latest/rules/)
- [eslint-plugin-security](https://github.com/eslint-community/eslint-plugin-security)

## Review Schedule

This decision should be reviewed:

- When codebase exceeds 5,000 LOC
- When adding additional active contributors
- If code quality issues emerge that linting would prevent
- During major refactoring efforts
- Every 12 months or with significant project changes
- If security plugin becomes unmaintained
