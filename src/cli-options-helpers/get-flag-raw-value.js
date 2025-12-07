// @ts-check
/**
 * Extract raw flag value from CLI arguments.
 * @supports prompts/014.0-DEV-INVALID-OPTION-ERROR.md REQ-ERROR-EXIT-CODE
 * @param {string[]} args - CLI arguments.
 * @param {string} flag - Flag name without leading hyphens.
 * @returns {string|undefined} The raw flag value, or undefined if not present.
 * Exits with code 2 if flag provided without a value.
 */
export function getFlagRawValue(args, flag) {
  const prefix = `--${flag}=`;
  const eqArg = args.find((a) => a.startsWith(prefix));
  // @story prompts/014.0-DEV-INVALID-OPTION-ERROR.md
  // @req REQ-ERROR-EXIT-CODE
  if (eqArg) {
    return eqArg.slice(prefix.length);
  }
  const idx = args.indexOf(`--${flag}`);
  // @story prompts/014.0-DEV-INVALID-OPTION-ERROR.md
  // @req REQ-ERROR-EXIT-CODE
  if (idx !== -1) {
    // @story prompts/014.0-DEV-INVALID-OPTION-ERROR.md
    // @req REQ-ERROR-EXIT-CODE
    if (args.length > idx + 1) {
      return args[idx + 1];
    }
    console.error(`Missing value for --${flag}`);
    process.exit(2);
  }
  return undefined;
}
