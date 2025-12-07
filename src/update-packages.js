// @ts-check
import fs from 'fs';
import path from 'path';

/**
 * Prompt the user for confirmation before updating.
 *
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-YES-FLAG REQ-CONFIRMATION
 * @param {boolean} skipConfirmation - If true, skip the confirmation prompt.
 * @returns {Promise<boolean>} Whether the user confirmed.
 */
async function promptConfirmation(skipConfirmation) {
  // @story prompts/011.0-DEV-AUTO-UPDATE.md
  // @req REQ-YES-FLAG
  if (skipConfirmation) {
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-YES-FLAG
    return true;
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-YES-FLAG
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
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-BACKUP
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
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-PACKAGE-JSON REQ-POST-UPDATE
 * @param {string} pkgPath - Path to package.json.
 * @param {Array<[string, string, string, string, number|string, string]>} safeRows - Array of tuples [name, current, wanted, latest, age, depType] where name is package name, current is installed version, wanted is safe version to update to, latest is latest available version, age is release age in days or version distance, depType is 'prod' or 'dev'.
 */
function applyUpdates(pkgPath, safeRows) {
  const pkgContent = fs.readFileSync(pkgPath, 'utf8');
  const pkgData = JSON.parse(pkgContent);

  safeRows.forEach(([name, , wanted, , , depType]) => {
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-PACKAGE-JSON
    if (depType === 'prod') {
      // @story prompts/011.0-DEV-AUTO-UPDATE.md
      // @req REQ-PACKAGE-JSON
      pkgData.dependencies = { ...(pkgData.dependencies || {}), [name]: wanted };
      // @story prompts/011.0-DEV-AUTO-UPDATE.md
      // @req REQ-PACKAGE-JSON
    } else {
      // @story prompts/011.0-DEV-AUTO-UPDATE.md
      // @req REQ-PACKAGE-JSON
      pkgData.devDependencies = { ...(pkgData.devDependencies || {}), [name]: wanted };
      // @story prompts/011.0-DEV-AUTO-UPDATE.md
      // @req REQ-PACKAGE-JSON
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
 * @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-UPDATE-FLAG REQ-YES-FLAG REQ-PREVIEW REQ-SAFE-ONLY REQ-PACKAGE-JSON REQ-BACKUP REQ-CONFIRMATION REQ-POST-UPDATE REQ-SUMMARY
 *
 * @param {Array<[string, string, string, string, number|string, string]>} safeRows - Array of tuples [name, current, wanted, latest, age, depType]
 * @param {boolean} skipConfirmation - If true, skip the confirmation prompt (--yes)
 * @param {{ totalOutdated: number, safeUpdates: number, filteredByAge: number, filteredBySecurity: number }} summary - Summary object to return after update
 * @returns {Promise<{ totalOutdated: number, safeUpdates: number, filteredByAge: number, filteredBySecurity: number }>} The summary object.
 */
export async function updatePackages(safeRows, skipConfirmation, summary) {
  const pkgPath = path.join(process.cwd(), 'package.json');

  // @story prompts/011.0-DEV-AUTO-UPDATE.md
  // @req REQ-SAFE-ONLY
  if (safeRows.length === 0) {
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-SAFE-ONLY
    console.log('No safe updates available.');
    return summary;
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-SAFE-ONLY
  }

  console.log('The following packages will be updated:');
  safeRows.forEach(([name, current, wanted]) => {
    console.log(`  ${name}: ${current} → ${wanted}`);
  });

  const confirmed = await promptConfirmation(skipConfirmation);
  // @story prompts/011.0-DEV-AUTO-UPDATE.md
  // @req REQ-CONFIRMATION
  if (!confirmed) {
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-CONFIRMATION
    console.log('Aborted.');
    return summary;
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-CONFIRMATION
  }

  // @story prompts/011.0-DEV-AUTO-UPDATE.md
  // @req REQ-BACKUP
  try {
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-BACKUP
    createBackup(pkgPath);
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-BACKUP
  } catch (err) {
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-BACKUP
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to create backup: ${message}`);
    return summary;
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-BACKUP
  }

  // @story prompts/011.0-DEV-AUTO-UPDATE.md
  // @req REQ-PACKAGE-JSON
  try {
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-PACKAGE-JSON
    applyUpdates(pkgPath, safeRows);
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-PACKAGE-JSON
  } catch (err) {
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-PACKAGE-JSON
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to update package.json: ${message}`);
    return summary;
    // @story prompts/011.0-DEV-AUTO-UPDATE.md
    // @req REQ-PACKAGE-JSON
  }

  return summary;
}
