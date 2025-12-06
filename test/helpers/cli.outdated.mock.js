/* eslint-disable traceability/require-test-traceability, traceability/require-story-annotation, traceability/require-req-annotation */
/**
 * Stub module for dry-aged-deps CLI outdated testing
 */
// test/helpers/cli.outdated.mock.js

export const outdatedData = {
  fakepkg: { current: '1.0.0', wanted: '1.1.0', latest: '2.0.0' },
};

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

export async function checkVulnerabilities(_packageName, _version) {
  return process.env.DRY_AGED_DEPS_MOCK_VULN === '1' ? 1 : 0;
}
