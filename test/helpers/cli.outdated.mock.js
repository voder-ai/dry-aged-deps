/**
 * Stub module for dry-aged-deps CLI outdated testing
 * @supports prompts/001.0-DEV-RUN-NPM-OUTDATED.md REQ-NPM-COMMAND REQ-OUTPUT-DISPLAY
 * @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
 * @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-AUDIT-CHECK
 */
// test/helpers/cli.outdated.mock.js

export const outdatedData = {
  fakepkg: { current: '1.0.0', wanted: '1.1.0', latest: '2.0.0' },
};

/**
 * Mock fetchVersionTimes for testing
 * @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
 */
export async function fetchVersionTimes(packageName) {
  // eslint-disable-next-line security/detect-object-injection -- dynamic package name access is required for this test mock (see GH-1234)
  const data = outdatedData[packageName];
  // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
  if (!data) {
    // @req REQ-NPM-VIEW
    return {};
    // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
  }
  // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
  if (process.env.DRY_AGED_DEPS_MOCK_AGE_NOW === '1') {
    // @req REQ-NPM-VIEW
    return {
      [data.latest]: new Date().toISOString(),
    };
    // @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
  }
  return {
    [data.current]: '2020-01-01T00:00:00Z',
    [data.wanted]: '2020-06-01T00:00:00Z',
    [data.latest]: '2021-01-01T00:00:00Z',
  };
}

/**
 * Mock checkVulnerabilities for testing
 * @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-AUDIT-CHECK
 */
export async function checkVulnerabilities(_packageName, _version) {
  return process.env.DRY_AGED_DEPS_MOCK_VULN === '1' ? 1 : 0;
}
