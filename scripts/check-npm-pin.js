/**
 * check:npm-pin — fail fast when a CI npm pin's major diverges from the local
 * npm that generates package-lock.json.
 *
 * P033: `npm ci --prefer-frozen-lockfile` rejects the lockfile across an npm
 * major boundary, silently stalling the release pipeline. lockfileVersion is
 * not a usable drift fingerprint (npm 10 and 11 both write version 3), so this
 * guard compares the pinned CI npm major against the local (generator) npm
 * major. Majors only — minor/patch don't change lockfile shape.
 *
 * @supports docs/rfcs/RFC-006-check-npm-pin-prepush-drift-guard.proposed.md P033
 */

import { readdirSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const WORKFLOW_DIR = '.github/workflows';
const PIN_RE = /npm install -g npm@(\d+(?:\.\d+)*)/g;

/**
 * Extract every `npm install -g npm@<version>` pin from workflow YAML text.
 * @param {string} text
 * @returns {string[]} version strings, one per pin occurrence
 */
export function parsePins(text) {
  return [...text.matchAll(PIN_RE)].map((m) => m[1]);
}

/** @param {string} version @returns {number} major version integer */
export function majorOf(version) {
  return Number.parseInt(version.split('.')[0], 10);
}

/**
 * Return the pins whose major differs from the local npm major.
 * @param {string[]} pins version strings
 * @param {number} localMajor
 * @returns {string[]} drifting pin versions
 */
export function findDrift(pins, localMajor) {
  return pins.filter((v) => majorOf(v) !== localMajor);
}

/**
 * Collect pins across all workflow files. Returns [{ file, version }].
 * @param {string} dir
 * @returns {{file: string, version: string}[]}
 */
export function collectPins(dir = WORKFLOW_DIR) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
  const pins = [];
  for (const f of files) {
    for (const version of parsePins(readFileSync(join(dir, f), 'utf8'))) {
      pins.push({ file: f, version });
    }
  }
  return pins;
}

function main() {
  const pins = collectPins();

  // No-silent-failures: a guard that finds zero pins must fail loudly, not
  // pass vacuously — an unpinned/renamed step is the exact silent-stall P033 kills.
  if (pins.length === 0) {
    console.error(
      `check:npm-pin — no \`npm install -g npm@<X>\` pin found in ${WORKFLOW_DIR}/*.yml.\n` +
        'Every release-path CI job must pin npm to the lockfile generator (P033 / ADR-0024).'
    );
    process.exit(1);
  }

  const localVersion = execSync('npm --version').toString().trim();
  const localMajor = majorOf(localVersion);
  const drifting = findDrift(
    pins.map((p) => p.version),
    localMajor
  );

  if (drifting.length > 0) {
    const detail = pins
      .filter((p) => majorOf(p.version) !== localMajor)
      .map((p) => `  ${p.file}: npm@${p.version} (major ${majorOf(p.version)})`)
      .join('\n');
    console.error(
      `check:npm-pin — CI npm pin drifts from the local lockfile generator (npm ${localVersion}, major ${localMajor}):\n` +
        `${detail}\n` +
        `Fix: bump the CI pins in ${WORKFLOW_DIR}/*.yml to npm ${localMajor}.x, ` +
        `OR regenerate package-lock.json under npm ${majorOf(drifting[0])}.`
    );
    process.exit(1);
  }

  console.log(`check:npm-pin — ${pins.length} CI npm pin(s) match local npm major ${localMajor}.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
