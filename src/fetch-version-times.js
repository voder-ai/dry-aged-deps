// @ts-check
import { execFile as cpExecFile } from 'child_process';

/**
 * Fetch version publish times for an npm package.
 * @param {string} packageName - The name of the npm package.
 * @param {any} [execFileImpl] - Optional execFile implementation (matches Node's execFile signature).
 * @returns {Promise<Record<string, string>>} A promise resolving to a mapping of version to publish date string.
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

  const doExec = () =>
    new Promise((resolve, reject) => {
      execFileImpl('npm', ['view', packageName, 'time', '--json'], { encoding: 'utf8' }, (error, stdout) => {
        // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
        if (error) {
          // @req REQ-NPM-VIEW
          return reject(error);
          // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
        }
        resolve(stdout);
      });
    });

  // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
  while (true) {
    // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
    try {
      const stdout = await doExec();
      const times = stdout ? JSON.parse(stdout) : {};
      const versionTimes = Object.fromEntries(
        Object.entries(times)
          .filter(([version]) => version !== 'created' && version !== 'modified')
          .map(([version, time]) => [version, /** @type {string} */ (time)])
      );
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
