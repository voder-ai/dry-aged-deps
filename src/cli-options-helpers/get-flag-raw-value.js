// @ts-nocheck
/**
 * Extract raw flag value from CLI arguments.
 * @story ???
 * @req UNKNOWN - Extract raw CLI flag values for parsing.
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