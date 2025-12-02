/* eslint-disable traceability/valid-req-reference , traceability/valid-annotation-format , traceability/valid-annotation-format */
/**
 * @story prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req fetchVersionTimes Fetch available versions and their publish times for a package
 * @req checkVulnerabilities Determine whether a specific package version has known vulnerabilities
 */
// test/helpers/cli.outdated.mock.js
// Stub module for dry-aged-deps CLI outdated testing

export const outdatedData = {
  fakepkg: { current: '1.0.0', wanted: '1.1.0', latest: '2.0.0' },
};

/**
 * @story prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req fetchVersionTimes Fetch available versions and their publish times for a package
 */
export async function fetchVersionTimes(packageName) {
  // eslint-disable-next-line security/detect-object-injection -- dynamic package name access is required for this test mock (see GH-1234)
  const data = outdatedData[packageName];
  if (!data) {
    return {};
  }
  if (process.env.DRY_AGED_DEPS_MOCK_AGE_NOW === '1') {
    return {
      [data.latest]: new Date().toISOString(),
    };
  }
  return {
    [data.current]: '2020-01-01T00:00:00Z',
    [data.wanted]: '2020-06-01T00:00:00Z',
    [data.latest]: '2021-01-01T00:00:00Z',
  };
}

/**
 * @story prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req checkVulnerabilities Determine whether a specific package version has known vulnerabilities
 */
export async function checkVulnerabilities(_packageName, _version) {
  return process.env.DRY_AGED_DEPS_MOCK_VULN === '1' ? 1 : 0;
}
