/**
 * Helper to mock execFile invocations for fetchVersionTimes tests.
 * @supports prompts/002.0-DEV-FETCH-AVAILABLE-VERSIONS.md REQ-NPM-VIEW
 */
function createExecFileMock() {
  const calls = [];
  let _mockImplementation;

  const mockImpl = (cmd, args, options, callback) => {
    calls.push([cmd, args, options, callback]);
    if (_mockImplementation) {
      return _mockImplementation(cmd, args, options, callback);
    }
  };

  mockImpl.mockImplementation = (fn) => {
    _mockImplementation = fn;
  };
  mockImpl.mockReset = () => {
    calls.length = 0;
    _mockImplementation = undefined;
  };
  Object.defineProperty(mockImpl, 'calls', {
    get: () => calls,
  });

  return mockImpl;
}

export { createExecFileMock };
