// @ts-check
import { fetchVersionTimes as defaultFetchVersionTimes } from './fetch-version-times.js';
import { calculateAgeInDays as defaultCalculateAgeInDays } from './age-calculator.js';

/**
 * Build rows with age and dependency type.
 * @param {Record<string, { current: string; wanted: string; latest: string }>} data
 * @param {{
 *   fetchVersionTimes?: Function,
 *   calculateAgeInDays?: Function,
 *   getDependencyType: Function,
 *   format?: string
 * }} options
 * @returns {Promise<Array<[string, string, string, string, number|string, string]>>}
 * @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW REQ-AGE-CALC REQ-OPTIMIZATION
 */
export async function buildRows(data, options) {
  const fetchVersionTimes = options.fetchVersionTimes || defaultFetchVersionTimes;
  const calculateAgeInDays = options.calculateAgeInDays || defaultCalculateAgeInDays;
  const getDependencyType = options.getDependencyType;
  const format = options.format || 'table';

  const entries = Object.entries(data);
  const tasks = entries.map(([name, info]) =>
    (async () => {
      let age = 'N/A';
      const depType = getDependencyType(name);
      // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
      try {
        const versionTimes = await fetchVersionTimes(name);
        const latestTime = versionTimes[info.latest];
        // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-AGE-CALC
        if (latestTime) {
          age = calculateAgeInDays(latestTime);
        }
      } catch (err) {
        // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
        // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
        if (format !== 'xml' && format !== 'json') {
          const message = err instanceof Error ? (err.message ?? err.toString()) : String(err);
          console.error(`Warning: failed to fetch version times for ${name}: ${message}`);
        }
      }
      return /** @type {[string, string, string, string, number|string, string]} */ ([
        name,
        info.current,
        info.wanted,
        info.latest,
        age,
        depType,
      ]);
    })()
  );

  return Promise.all(tasks);
}
