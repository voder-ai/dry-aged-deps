// @ts-check
import fs from 'fs';
import path from 'path';

/**
 * Prompt the user for confirmation before updating.
 *
 * @param {boolean} skipConfirmation - If true, skip the confirmation prompt.
 * @returns {Promise<boolean>} Whether the user confirmed.
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-YES-FLAG REQ-CONFIRMATION
 */
async function promptConfirmation(skipConfirmation) {
  // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-YES-FLAG
  if (skipConfirmation) {
    return true;
  }
  const { createInterface } = await import('readline');
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await new Promise((resolve) => {
    rl.question('Update package.json? [y/N] ', (ans) => {
      rl.close();
      resolve(ans.trim().toLowerCase());
    });
  });
  return answer === 'y' || answer === 'yes';
}

/**
 * Create a backup of package.json.
 *
 * @param {string} pkgPath - Path to package.json.
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-BACKUP
 */
function createBackup(pkgPath) {
  const backupPath = pkgPath + '.backup';
  fs.copyFileSync(pkgPath, backupPath);
  console.log(`Created backup of package.json at ${backupPath}`);
}

/**
 * Apply dependency updates to package.json.
 *
 * Writes the 4th tuple element (`latest`) — the post-filter / post-smart-search safe
 * target produced by applyFilters() — into the corresponding package.json entry. Per
 * ADR-0014, this is the canonical "latest safe version" and the only column that has
 * been validated by the maturity + security filters. Writing the 3rd element (`wanted`)
 * would produce a no-op for exact-pinned dependencies (P001).
 *
 * @param {string} pkgPath - Path to package.json.
 * @param {Array<[string, string, string, string, number|string, string]>} safeRows - Array of tuples [name, current, wanted, latest, age, depType] where name is package name, current is installed version, wanted is the semver-range-satisfying version (unused — see ADR-0014), latest is the post-filter / post-smart-search safe target written to package.json, age is release age in days or version distance, depType is 'prod' or 'dev'.
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-PACKAGE-JSON REQ-POST-UPDATE REQ-SAFE-ONLY
 */
function applyUpdates(pkgPath, safeRows) {
  const pkgContent = fs.readFileSync(pkgPath, 'utf8');
  const pkgData = JSON.parse(pkgContent);

  safeRows.forEach(([name, , , latest, , depType]) => {
    // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-PACKAGE-JSON REQ-SAFE-ONLY
    if (depType === 'prod') {
      pkgData.dependencies = { ...(pkgData.dependencies || {}), [name]: latest };
    } else {
      pkgData.devDependencies = { ...(pkgData.devDependencies || {}), [name]: latest };
    }
  });

  fs.writeFileSync(pkgPath, JSON.stringify(pkgData, null, 2) + '\n', 'utf8');
  console.log(`Updated package.json with ${safeRows.length} safe packages`);
  console.log("Run 'npm install' to install the updates");
}

/**
 * Update package.json dependencies to the specified safe versions.
 * Creates a backup and applies updates only for safeRows.
 *
 * @param {Array<[string, string, string, string, number|string, string]>} safeRows - Array of tuples [name, current, wanted, latest, age, depType]
 * @param {boolean} skipConfirmation - If true, skip the confirmation prompt (--yes)
 * @param {{ totalOutdated: number, safeUpdates: number, filteredByAge: number, filteredBySecurity: number }} summary - Summary object to return after update
 * @returns {Promise<{ totalOutdated: number, safeUpdates: number, filteredByAge: number, filteredBySecurity: number }>} The summary object.
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-UPDATE-FLAG REQ-YES-FLAG REQ-PREVIEW REQ-SAFE-ONLY REQ-PACKAGE-JSON REQ-BACKUP REQ-CONFIRMATION REQ-POST-UPDATE REQ-SUMMARY
 */
export async function updatePackages(safeRows, skipConfirmation, summary) {
  const pkgPath = path.join(process.cwd(), 'package.json');

  // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-SAFE-ONLY
  if (safeRows.length === 0) {
    console.log('No safe updates available.');
    return summary;
  }

  console.log('The following packages will be updated:');
  // Preview shows the actual target written to package.json (latest, element[3]) per ADR-0014.
  // The pre-fix code rendered `${current} → ${wanted}` which produced a misleading `X → X` for
  // exact-pinned packages (P001 symptom).
  safeRows.forEach(([name, current, , latest]) => {
    console.log(`  ${name}: ${current} → ${latest}`);
  });

  const confirmed = await promptConfirmation(skipConfirmation);
  // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-CONFIRMATION
  if (!confirmed) {
    console.log('Aborted.');
    return summary;
  }

  // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-BACKUP
  try {
    createBackup(pkgPath);
  } catch (err) {
    // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-BACKUP
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to create backup: ${message}`);
    return summary;
  }

  // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-PACKAGE-JSON
  try {
    applyUpdates(pkgPath, safeRows);
  } catch (err) {
    // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-PACKAGE-JSON
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to update package.json: ${message}`);
    return summary;
  }

  return summary;
}
