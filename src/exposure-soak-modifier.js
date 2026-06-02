// @ts-check
// @jtbd JTBD-001
// JTBD-006 default-OFF contract is enforced by callers in RFC-002 T4 (CLI wire).

/**
 * RFC-002 §Summary locked severity → soak-modifier policy table.
 *
 * Critical exposure drops the soak to a 0-day floor (operator pulls the fix
 * immediately); High exposure halves the soak; Moderate / Low / None preserve
 * the operator's `--min-age` unchanged. Per RFC-002 §Summary the two locked
 * points (critical → 0, high → 0.5) MUST NOT regress without an explicit
 * policy-change ADR.
 *
 * Materialised as a `Map` so the lookup avoids dynamic object-index access
 * (and the false-positive security/detect-object-injection lint it triggers).
 *
 * @type {Map<string, number>}
 */
const SEVERITY_TO_MODIFIER = new Map([
  ['critical', 0],
  ['high', 0.5],
  ['moderate', 1],
  ['low', 1],
  ['none', 1],
]);

/**
 * Pure-function realization of the RFC-002 §Summary locked policy table.
 *
 * @param {('critical' | 'high' | 'moderate' | 'low' | 'none' | null | undefined)} severity
 *   Max-severity exposure band for an installed package. `null` / `undefined`
 *   means no current advisory exposure and resolves to the unchanged default
 *   soak (modifier 1.0).
 * @returns {number} Multiplier in [0.0, 1.0] to apply to the operator's base soak.
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-POLICY-TABLE REQ-EXPOSURE-PURE-FUNCTION
 */
export function severityToModifier(severity) {
  if (severity == null) {
    return 1;
  }
  const modifier = SEVERITY_TO_MODIFIER.get(severity);
  return modifier == null ? 1 : modifier;
}

/**
 * Compose the locked policy modifier with the operator's `--min-age` to
 * produce an effective per-package soak in integer milliseconds.
 *
 * The modifier scales whatever soak the operator has set — NOT a hard-coded
 * 7 days. Result is floored: the age comparison is monotonic, so flooring
 * preserves correctness.
 *
 * @param {('critical' | 'high' | 'moderate' | 'low' | 'none' | null | undefined)} severity
 *   Max-severity exposure band for an installed package.
 * @param {number} baseSoakMs Operator-set base soak in milliseconds.
 * @returns {number} Effective soak in integer milliseconds.
 * @supports prompts/018.0-DEV-EXPOSURE-AWARE-SOAK.md REQ-EXPOSURE-EFFECTIVE-SOAK REQ-EXPOSURE-PURE-FUNCTION
 */
export function effectiveSoakMs(severity, baseSoakMs) {
  return Math.floor(baseSoakMs * severityToModifier(severity));
}
