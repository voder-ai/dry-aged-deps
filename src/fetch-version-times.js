const cp = require('child_process');

/**
 * Fetch version publish times for an npm package.
 * @param {string} packageName - The name of the npm package.
 * @returns {Record<string,string>} A mapping of version to publish date string.
 */
function fetchVersionTimes(packageName) {
  // Execute npm view to get time data in JSON
  const output = cp.execSync(`npm view ${packageName} time --json`, { encoding: 'utf8' });
  const times = JSON.parse(output);
  const versionTimes = {};

  // Exclude non-version entries like 'created' and 'modified'
  for (const [version, time] of Object.entries(times || {})) {
    if (version !== 'created' && version !== 'modified') {
      versionTimes[version] = time;
    }
  }

  return versionTimes;
}

module.exports = { fetchVersionTimes };