/* eslint-disable security/detect-object-injection */
// test/helpers/cli.outdated.mock.js
// Stub module for dry-aged-deps CLI outdated testing

export const outdatedData = {
  fakepkg: { current: '1.0.0', wanted: '1.1.0', latest: '2.0.0' },
};

export async function fetchVersionTimes(packageName) {
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
