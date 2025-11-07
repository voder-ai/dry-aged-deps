// test/helpers/cli.outdated.mock.js

// Preload this module to stub child_process.execFileSync for testing
const cp = require('child_process');
const originalExecFileSync = cp.execFileSync;

// Mock data for npm outdated and npm view time
const outdatedJson = JSON.stringify({
  "fakepkg": { current: "1.0.0", wanted: "1.1.0", latest: "2.0.0" }
});
const timeJson = JSON.stringify({
  "1.0.0": "2023-01-01T00:00:00Z",
  "1.1.0": "2023-06-01T00:00:00Z",
  "2.0.0": "2023-12-01T00:00:00Z"
});

cp.execFileSync = function (cmd, args, opts) {
  if (cmd === 'npm' && Array.isArray(args) && args[0] === 'outdated') {
    return outdatedJson;
  }
  if (cmd === 'npm' && Array.isArray(args) && args[0] === 'view') {
    return timeJson;
  }
  return originalExecFileSync(cmd, args, opts);
};
