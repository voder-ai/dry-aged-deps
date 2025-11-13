import fs from 'fs';
import path from 'path';

/**
 * Update package.json dependencies to the specified safe versions.
 * Creates a backup and applies updates only for safeRows.
 *
 * @param {Array<[string, string, string, string, number|string, string]>} safeRows - Array of [name, current, wanted, latest, age, depType]
 * @param {boolean} skipConfirmation - If true, skip the confirmation prompt.
 * @param {Object} summary - Summary object to return after update
 * @returns {Object} The summary object.
 */
export async function updatePackages(safeRows, skipConfirmation, summary) {
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (safeRows.length === 0) {
    console.log('No safe updates available.');
    return summary;
  }
  console.log('The following packages will be updated:');
  for (const [name, current, wanted] of safeRows) {
    console.log(`  ${name}: ${current} → ${wanted}`);
  }
  if (!skipConfirmation) {
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
    if (answer !== 'y' && answer !== 'yes') {
      console.log('Aborted.');
      return summary;
    }
  }

  // Create backup
  const backupPath = pkgPath + '.backup';
  try {
    fs.copyFileSync(pkgPath, backupPath);
    console.log(`Created backup of package.json at ${backupPath}`);
  } catch (err) {
    console.error(`Failed to create backup: ${err.message}`);
    return summary;
  }

  // Apply updates
  try {
    const pkgContent = fs.readFileSync(pkgPath, 'utf8');
    const pkgData = JSON.parse(pkgContent);
    /* eslint-disable security/detect-object-injection */
    for (const [name, , wanted, , , depType] of safeRows) {
      if (depType === 'prod') {
        if (!pkgData.dependencies) pkgData.dependencies = {};
        pkgData.dependencies[name] = wanted;
      } else {
        if (!pkgData.devDependencies) pkgData.devDependencies = {};
        pkgData.devDependencies[name] = wanted;
      }
    }
    /* eslint-enable security/detect-object-injection */
    fs.writeFileSync(pkgPath, JSON.stringify(pkgData, null, 2) + '\n', 'utf8');
    console.log(`Updated package.json with ${safeRows.length} safe packages`);
    console.log("Run 'npm install' to install the updates");
  } catch (err) {
    console.error(`Failed to update package.json: ${err.message}`);
  }

  return summary;
}
