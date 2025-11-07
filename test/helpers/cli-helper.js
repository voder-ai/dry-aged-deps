const { execa } = require('execa');

/**
 * Helper to run the CLI with given arguments and return the result
 * @param {string[]} args - CLI arguments
 * @returns {Promise<import('execa').ExecaReturnValue>}
 */
async function runCli(args) {
  return await execa('node', ['./bin/dry-aged-deps.js', ...args]);
}

module.exports = { runCli };