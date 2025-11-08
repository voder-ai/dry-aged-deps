import { execFile } from 'child_process';

/**
 * Fetch version publish times for an npm package.
 * @param {string} packageName - The name of the npm package.
 * @returns {Promise<Record<string, string>>} A promise resolving to a mapping of version to publish date string.
 */
export async function fetchVersionTimes(packageName) {
  const pkgNameRegex = /^[a-z0-9@\-_/.]+$/i;
  if (!pkgNameRegex.test(packageName)) {
    throw new Error(`Invalid package name: ${packageName}`);
  }

  const maxRetries = 2;
  const retryDelayMs = 1000;
  let attempt = 0;

  const doExec = () =>
    new Promise((resolve, reject) => {
      execFile(
        'npm',
        ['view', packageName, 'time', '--json'],
        { encoding: 'utf8' },
        (error, stdout) => {
          if (error) {
            return reject(error);
          }
          resolve(stdout);
        }
      );
    });

  while (true) {
    try {
      const stdout = await doExec();
      let times;
      try {
        times = stdout ? JSON.parse(stdout) : {};
      } catch (parseErr) {
        throw parseErr;
      }
      const versionTimes = {};
      // Exclude non-version entries like 'created' and 'modified'
      for (const [version, time] of Object.entries(times || {})) {
        if (version !== 'created' && version !== 'modified') {
          // eslint-disable-next-line security/detect-object-injection -- safe iteration
          versionTimes[version] = time;
        }
      }
      return versionTimes;
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw err;
      }
      if (attempt < maxRetries) {
        attempt++;
        await new Promise((res) => setTimeout(res, retryDelayMs));
        continue;
      }
      throw err;
    }
  }
}
