/* eslint-disable traceability/valid-story-reference, traceability/valid-req-reference, traceability/valid-annotation-format, traceability/prefer-supports-annotation */
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
  // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-YES-FLAG
  if (skipConfirmation) {
    // @req REQ-YES-FLAG
    return true;
    // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-YES-FLAG
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
    // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-PACKAGE-JSON
    if (depType === 'prod') {
      // @req REQ-PACKAGE-JSON
      pkgData.dependencies = { ...(pkgData.dependencies || {}), [name]: wanted };
      // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-PACKAGE-JSON
    } else {
      // @req REQ-PACKAGE-JSON
      pkgData.devDependencies = { ...(pkgData.devDependencies || {}), [name]: wanted };
      // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-PACKAGE-JSON
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
/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
export async function updatePackages(safeRows, skipConfirmation, summary) {
  const pkgPath = path.join(process.cwd(), 'package.json');

  // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-SAFE-ONLY
  if (safeRows.length === 0) {
    // @req REQ-SAFE-ONLY
    console.log('No safe updates available.');
    return summary;
    // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-SAFE-ONLY
  }

  console.log('The following packages will be updated:');
  safeRows.forEach(([name, current, wanted]) => {
    console.log(`  ${name}: ${current} → ${wanted}`);
  });

  const confirmed = await promptConfirmation(skipConfirmation);
  // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-CONFIRMATION
  if (!confirmed) {
    // @req REQ-CONFIRMATION
    console.log('Aborted.');
    return summary;
    // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-CONFIRMATION
  }

  // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-BACKUP
  try {
    // @req REQ-BACKUP
    createBackup(pkgPath);
    // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-BACKUP
  } catch (err) {
    // @req REQ-BACKUP
    // @story <story-file>.story.md
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to create backup: ${message}`);
    return summary;
    // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-BACKUP
  }

  // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-PACKAGE-JSON
  try {
    // @req REQ-PACKAGE-JSON
    applyUpdates(pkgPath, safeRows);
    // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-PACKAGE-JSON
  } catch (err) {
    // @req REQ-PACKAGE-JSON
    // @story <story-file>.story.md
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to update package.json: ${message}`);
    return summary;
    // @supports prompts/011.0-DEV-AUTO-UPDATE.md REQ-PACKAGE-JSON
  }

  return summary;
}
