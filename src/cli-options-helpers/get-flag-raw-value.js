// @ts-check
/**
 * Extract raw flag value from CLI arguments.
 * @story prompts/014.0-DEV-INVALID-OPTION-ERROR.md
 * @req REQ-MISSING-VALUE-ERROR - Display error message when option is provided without a value
 * @param {string[]} args - CLI arguments.
 * @param {string} flag - Flag name without leading hyphens.
 * @returns {string|undefined} The raw flag value, or undefined if not present.
 * Exits with code 2 if flag provided without a value.
 */
export function getFlagRawValue(args, flag) {
  const prefix = `--${flag}=`;
  const eqArg = args.find((a) => a.startsWith(prefix));
  if (eqArg) {
    return eqArg.slice(prefix.length);
  }
  const idx = args.indexOf(`--${flag}`);
  if (idx !== -1) {
    if (args.length > idx + 1) {
      return args[idx + 1];
    }
    console.error(`Missing value for --${flag}`);
    process.exit(2);
  }
  return undefined;
}
