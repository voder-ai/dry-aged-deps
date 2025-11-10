// test/helpers/cli.outdated.mock.js
// Stub module for dry-aged-deps CLI outdated testing

export const outdatedData = {
  fakepkg: { current: '1.0.0', wanted: '1.1.0', latest: '2.0.0' },
};

// Stub fetchVersionTimes to return publish dates in the past
export async function fetchVersionTimes(packageName) {
  return {
    '1.0.0': '2020-01-01T00:00:00Z',
    '1.1.0': '2020-06-01T00:00:00Z',
    '2.0.0': '2021-01-01T00:00:00Z',
  };
}

// Stub checkVulnerabilities to always return 0 (no vulnerabilities)
export async function checkVulnerabilities(packageName, version) {
  return 0;
}
