// @ts-nocheck
import { execFile as cpExecFile } from 'child_process';

/**
 * A mockable wrapper for child_process.execFile.
 */
export function execFile(cmd, args, options, callback) {
  execFile.mock.calls.push([cmd, args, options, callback]);
  if (execFile._mockImplementation) {
    return execFile._mockImplementation(cmd, args, options, callback);
  }
  return cpExecFile(cmd, args, options, callback);
}

execFile.mockImplementation = (fn) => {
  execFile._mockImplementation = fn;
};

execFile.mockReset = () => {
  execFile.mock.calls = [];
  delete execFile._mockImplementation;
};

execFile.mock = { calls: [] };

/**
 * Fetch version publish times for an npm package.
 * @param {string} packageName - The name of the npm package.
 * @returns {Promise<Record<string, string>>} A promise resolving to a mapping of version to publish date string.
 * @story prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * @req REQ-NPM-VIEW - Use `npm view <package> time --json` to get publish dates
 */
export async function fetchVersionTimes(packageName) {
  const pkgNameRegex = /^[a-z0-9@\-_/.]+$/i;
  if (!pkgNameRegex.test(packageName)) {
    throw new Error(`Invalid package name: ${packageName}`);
  }

  const maxRetries = 2;
  const retryDelayMs = 50;
  let attempt = 0;

  const doExec = () =>
    new Promise((resolve, reject) => {
      execFile('npm', ['view', packageName, 'time', '--json'], { encoding: 'utf8' }, (error, stdout) => {
        if (error) {
          return reject(error);
        }
        resolve(stdout);
      });
    });

  while (true) {
    try {
      const stdout = await doExec();
      const times = stdout ? JSON.parse(stdout) : {};
      const versionTimes = Object.fromEntries(
        Object.entries(times)
          .filter(([version]) => version !== 'created' && version !== 'modified')
          .map(([version, time]) => [version, /** @type {string} */ (time)])
      );
      return versionTimes;
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw err;
      }
      if (attempt < maxRetries) {
        attempt++;
        const delay = retryDelayMs * 2 ** attempt;
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      throw err;
    }
  }
}