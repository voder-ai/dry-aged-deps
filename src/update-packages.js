import fs from 'fs';
import path from 'path';

/**
 * Prompt the user for confirmation before updating.
 *
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
 * @param {string} pkgPath - Path to package.json.
 * @param {Array<[string, string, string, string, number|string, string]>} safeRows
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
 * @param {Array<[string, string, string, string, number|string, string]>} safeRows - Array of [name, current, wanted, latest, age, depType]
 * @param {boolean} skipConfirmation - If true, skip the confirmation prompt.
 * @param {{ totalOutdated: number, safeUpdates: number, filteredByAge: number, filteredBySecurity: number }} summary - Summary object to return after update
 * @returns {Promise<{ totalOutdated: number, safeUpdates: number, filteredByAge: number, filteredBySecurity: number }>} The summary object.
 */
export async function updatePackages(safeRows, skipConfirmation, summary) {
  const pkgPath = path.join(process.cwd(), 'package.json');

  if (safeRows.length === 0) {
    console.log('No safe updates available.');
    return summary;
  }

  console.log('The following packages will be updated:');
  safeRows.forEach(([name, current, wanted]) => {
    console.log(`  ${name}: ${current} → ${wanted}`);
  });

  const confirmed = await promptConfirmation(skipConfirmation);
  if (!confirmed) {
    console.log('Aborted.');
    return summary;
  }

  try {
    createBackup(pkgPath);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to create backup: ${message}`);
    return summary;
  }

  try {
    applyUpdates(pkgPath, safeRows);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to update package.json: ${message}`);
    return summary;
  }

  return summary;
}