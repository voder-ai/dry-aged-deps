// @ts-check
import { execFile as cpExecFile } from 'child_process';

/**
 * Symbol channel carrying the latest version's npm deprecation message on the
 * version-times map. A Symbol key is excluded from `Object.keys`/`entries`/
 * `JSON.stringify`, so it is invisible to every version-indexing consumer of
 * the returned map (build-rows, override lookup, security filter) while still
 * riding the same single `npm view` call — no extra registry round-trip
 * (ADR-0023). Absent when the package is not deprecated.
 * @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
 */
export const DEPRECATED = Symbol('deprecatedMessage');

/**
 * Fetch version publish times for an npm package, plus the latest version's
 * deprecation message (if any) on the {@link DEPRECATED} symbol channel.
 * @param {string} packageName - The name of the npm package.
 * @param {any} [execFileImpl] - Optional execFile implementation (matches Node's execFile signature).
 * @returns {Promise<Record<string, string>>} A promise resolving to a mapping of version to publish date string; the latest version's deprecation message, when present, is attached on the `DEPRECATED` symbol key.
 * @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
 */
export async function fetchVersionTimes(packageName, execFileImpl = cpExecFile) {
  const pkgNameRegex = /^[a-z0-9@\-_/.]+$/i;
  // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
  if (!pkgNameRegex.test(packageName)) {
    // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
    throw new Error(`Invalid package name: ${packageName}`);
    // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
  }

  const maxRetries = 2;
  const retryDelayMs = 50;
  let attempt = 0;

  /** @story prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md */
  const doExec = () =>
    new Promise((resolve, reject) => {
      execFileImpl(
        'npm',
        ['view', packageName, 'time', 'deprecated', '--json'],
        { encoding: 'utf8' },
        (error, stdout) => {
          // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
          if (error) {
            // @req REQ-NPM-VIEW
            return reject(error);
            // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
          }
          resolve(stdout);
        }
      );
    });

  // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
  while (true) {
    // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
    try {
      const stdout = await doExec();
      const parsed = stdout ? JSON.parse(stdout) : {};
      // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
      // npm collapses a single-valued projection: `time deprecated` wraps under
      // field names (`{ time: {...}, deprecated: ... }`) only when BOTH have
      // values; when `deprecated` is absent it returns the bare time map. A
      // version can never be named `time`, so a `time` object discriminates the
      // wrapped shape. `typeof null === 'object'`, hence the explicit null guard.
      const wrapped = parsed.time !== null && typeof parsed.time === 'object';
      const times = wrapped ? parsed.time : parsed;
      const versionTimes = Object.fromEntries(
        Object.entries(times)
          .filter(([version]) => version !== 'created' && version !== 'modified')
          .map(([version, time]) => [version, /** @type {string} */ (time)])
      );
      // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
      // `npm view <pkg> deprecated` resolves to the latest version, yielding a
      // scalar message. A version-keyed object (multiple deprecated versions)
      // has no single latest scalar to surface here, so ignore non-strings.
      const deprecatedMessage = wrapped ? parsed.deprecated : undefined;
      if (typeof deprecatedMessage === 'string' && deprecatedMessage.length > 0) {
        /** @type {any} */ (versionTimes)[DEPRECATED] = deprecatedMessage;
      }
      return versionTimes;
      // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
    } catch (err) {
      // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
      if (err instanceof SyntaxError) {
        // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
        throw err;
        // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
      }
      // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
      if (attempt < maxRetries) {
        // @req REQ-NPM-VIEW
        attempt++;
        const delay = retryDelayMs * 2 ** attempt;
        await new Promise((res) => setTimeout(res, delay));
        continue;
        // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
      }
      throw err;
    }
  }
}
