const { execa } = require('execa');

/**
 * Helper to run the CLI with given arguments and return the result
 * @param {string[]} args - CLI arguments
 * @returns {Promise<import('execa').ExecaReturnValue>}
 */
async function runCli(args) {
  const nodeArgs = [];
  if (process.env.CLI_MOCK_PATH) {
    nodeArgs.push('-r', process.env.CLI_MOCK_PATH);
  }
  nodeArgs.push('./bin/dry-aged-deps.js', ...args);
  return await execa('node', nodeArgs, { env: process.env });
}

module.exports = { runCli };
