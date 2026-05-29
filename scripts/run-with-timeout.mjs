#!/usr/bin/env node
// Wall-clock timeout wrapper. Spawns the requested command and SIGKILLs it
// (after a SIGTERM grace window) if it does not exit within `<seconds>`.
// Exits with the child's exit code on a clean run, with 124 on timeout
// (GNU `timeout` convention), and with 64 on usage error (EX_USAGE).
//
// Usage: node scripts/run-with-timeout.mjs <seconds> -- <command> [args...]
//
// Closes P015 (test script has no wall-clock timeout, hung runner runs unbounded).

import { spawn } from 'node:child_process';

const TERM_GRACE_MS = 5000;
const EXIT_USAGE = 64;
const EXIT_TIMEOUT = 124;

function die(message) {
  process.stderr.write(`run-with-timeout: ${message}\n`);
  process.stderr.write('Usage: node scripts/run-with-timeout.mjs <seconds> -- <command> [args...]\n');
  process.exit(EXIT_USAGE);
}

const argv = process.argv.slice(2);
const sepIndex = argv.indexOf('--');
if (sepIndex === -1) {
  die('missing `--` separator between <seconds> and <command>');
}
if (sepIndex !== 1) {
  die('expected <seconds> as the first argument, followed by `--` and the command');
}

const seconds = Number(argv[0]);
if (!Number.isFinite(seconds) || seconds <= 0) {
  die(`invalid timeout: expected a positive number of seconds, got "${argv[0]}"`);
}

const command = argv[sepIndex + 1];
const commandArgs = argv.slice(sepIndex + 2);
if (!command) {
  die('missing command after `--`');
}

const child = spawn(command, commandArgs, { stdio: 'inherit' });

let timedOut = false;
const timer = setTimeout(() => {
  timedOut = true;
  process.stderr.write(`run-with-timeout: command timed out after ${seconds}s; sending SIGTERM\n`);
  child.kill('SIGTERM');
  setTimeout(() => {
    if (child.exitCode === null && child.signalCode === null) {
      process.stderr.write('run-with-timeout: child did not exit on SIGTERM; sending SIGKILL\n');
      child.kill('SIGKILL');
    }
  }, TERM_GRACE_MS).unref();
}, seconds * 1000);
timer.unref();

const forwardSignal = (signal) => {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill(signal);
  }
};
process.on('SIGINT', () => forwardSignal('SIGINT'));
process.on('SIGTERM', () => forwardSignal('SIGTERM'));

child.on('error', (err) => {
  clearTimeout(timer);
  process.stderr.write(`run-with-timeout: failed to spawn "${command}": ${err.message}\n`);
  process.exit(127);
});

child.on('exit', (code, signal) => {
  clearTimeout(timer);
  if (timedOut) {
    process.exit(EXIT_TIMEOUT);
  }
  if (signal) {
    process.exit(128 + (signal === 'SIGTERM' ? 15 : signal === 'SIGKILL' ? 9 : 1));
  }
  process.exit(code ?? 1);
});
