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

**eslint-plugin-sonarjs (TBD):**
- 30 cognitive complexity and bug detection rules
- Focused on code smell detection
- Less opinionated than unicorn
- (Analysis pending)

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

**Approach**: Add cognitive complexity and bug detection rules

**Pros:**
- Focused on bugs/code smells vs style
- ~30 rules (more focused than unicorn)
- Detects complex functions needing refactoring

**Cons:**
- Another dependency to maintain
- May flag false positives
- Project complexity is already manageable
- (Full analysis to follow)

**Rejection Reason**: (To be documented after sonarjs analysis)

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
