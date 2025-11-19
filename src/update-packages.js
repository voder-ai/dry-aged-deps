// @ts-check
import fs from 'fs';
import path from 'path';

/**
 * Prompt the user for confirmation before updating.
 *
 * @story prompts/011.0-DEV-AUTO-UPDATE.md
 * @req REQ-YES-FLAG - Skip confirmation when --yes flag provided
 * @req REQ-CONFIRMATION - Interactive confirmation prompt before applying updates
 * @param {boolean} skipConfirmation - If true, skip the confirmation prompt.
 * @returns {Promise<boolean>} Whether the user confirmed.
 */
async function promptConfirmation(skipConfirmation) {
  if (skipConfirmation) return true;
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
 * @story prompts/011.0-DEV-AUTO-UPDATE.md
 * @req REQ-BACKUP - Create package.json.backup before applying updates
 * @param {string} pkgPath - Path to package.json.
 */
function createBackup(pkgPath) {
  const backupPath = pkgPath + '.backup';
  fs.copyFileSync(pkgPath, backupPath);
  console.log(`Created backup of package.json at ${backupPath}`);
}

/**
 * Apply dependency updates to package.json.
 *
 * @story prompts/011.0-DEV-AUTO-UPDATE.md
 * @req REQ-PACKAGE-JSON - Read, modify, and write package.json preserving format
 * @req REQ-POST-UPDATE - Prompt user to run npm install after updating
 * @param {string} pkgPath - Path to package.json.
 * @param {Array<[string, string, string, string, number|string, string]>} safeRows - Array of tuples [name, current, wanted, latest, age, depType] where name is package name, current is installed version, wanted is safe version to update to, latest is latest available version, age is release age in days or version distance, depType is 'prod' or 'dev'.
 */
function applyUpdates(pkgPath, safeRows) {
  const pkgContent = fs.readFileSync(pkgPath, 'utf8');
  const pkgData = JSON.parse(pkgContent);

  safeRows.forEach(([name, , wanted, , , depType]) => {
    if (depType === 'prod') {
      pkgData.dependencies = { ...(pkgData.dependencies || {}), [name]: wanted };
    } else {
      pkgData.devDependencies = { ...(pkgData.devDependencies || {}), [name]: wanted };
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
 * @story prompts/011.0-DEV-AUTO-UPDATE.md
 * @req REQ-UPDATE-FLAG - Support --update flag to enable update mode
 * @req REQ-YES-FLAG - Support --yes flag to skip confirmation
 * @req REQ-PREVIEW - Display preview of updates before applying
 * @req REQ-SAFE-ONLY - Only update safe packages that passed filters
 * @req REQ-PACKAGE-JSON - Read, modify, and write package.json preserving format
 * @req REQ-BACKUP - Create package.json.backup before applying updates
 * @req REQ-CONFIRMATION - Interactive user confirmation prompt
 * @req REQ-ERROR-HANDLING - Gracefully handle errors during backup and update
 * @req REQ-POST-UPDATE - Prompt user to run npm install after updates
 * @req REQ-SUMMARY - Display summary of updated packages
 *
 * @param {Array<[string, string, string, string, number|string, string]>} safeRows - Array of tuples [name, current, wanted, latest, age, depType]
 * @param {boolean} skipConfirmation - If true, skip the confirmation prompt (--yes)
 * @param {{ totalOutdated: number, safeUpdates: number, filteredByAge: number, filteredBySecurity: number }} summary - Summary object to return after update
 * @returns {Promise<{ totalOutdated: number, safeUpdates: number, filteredByAge: number, filteredBySecurity: number }>} The summary object.
 */
export async function updatePackages(safeRows, skipConfirmation, summary) {
  const pkgPath = path.join(process.cwd(), 'package.json');

  // @story prompts/011.0-DEV-AUTO-UPDATE.md
  // @req REQ-SAFE-ONLY - No updates when no safe packages available
  if (safeRows.length === 0) {
    console.log('No safe updates available.');
    return summary;
  }

  console.log('The following packages will be updated:');
  safeRows.forEach(([name, current, wanted]) => {
    console.log(`  ${name}: ${current} → ${wanted}`);
  });

  const confirmed = await promptConfirmation(skipConfirmation);
  // @story prompts/011.0-DEV-AUTO-UPDATE.md
  // @req REQ-CONFIRMATION - Abort when user denies confirmation
  if (!confirmed) {
    console.log('Aborted.');
    return summary;
  }

  try {
    createBackup(pkgPath);
  } catch (err) {
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-ERROR-HANDLING - Handle backup creation failure gracefully
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to create backup: ${message}`);
    return summary;
  }

  try {
    applyUpdates(pkgPath, safeRows);
  } catch (err) {
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-ERROR-HANDLING - Handle package.json update failure gracefully
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to update package.json: ${message}`);
    return summary;
  }

  return summary;
}
