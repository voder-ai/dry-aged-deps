/* eslint-disable traceability/require-test-traceability, traceability/require-story-annotation, traceability/require-req-annotation */
/**
 * Helper to mock execFile invocations for fetchVersionTimes tests.
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
