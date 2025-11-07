import { execFile } from 'child_process';

/**
 * Fetch version publish times for an npm package.
 * @param {string} packageName - The name of the npm package.
 * @returns {Promise<Record<string, string>>} A promise resolving to a mapping of version to publish date string.
 */
export function fetchVersionTimes(packageName) {
  const pkgNameRegex = /^[a-z0-9@\-_/.]+$/i;
  if (!pkgNameRegex.test(packageName)) {
    return Promise.reject(new Error(`Invalid package name: ${packageName}`));
  }

  return new Promise((resolve, reject) => {
    execFile(
      'npm',
      ['view', packageName, 'time', '--json'],
      { encoding: 'utf8' },
      (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        let times;
        try {
          times = stdout ? JSON.parse(stdout) : {};
        } catch (parseErr) {
          return reject(parseErr);
        }
        const versionTimes = {};
        // Exclude non-version entries like 'created' and 'modified'
        for (const [version, time] of Object.entries(times || {})) {
          if (version !== 'created' && version !== 'modified') {
            versionTimes[version] = time;
          }
        }
        resolve(versionTimes);
      }
    );
  });
}
