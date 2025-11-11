#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'bin', 'dry-aged-deps.js');
let content = fs.readFileSync(filePath, 'utf8');

// Change await call to capture summary
content = content.replace(
  /await printOutdated\(data,\s*\{/g,
  'const summary = await printOutdated(data, {'
);

// Change exit code for success
content = content.replace(
  /process\.exit\(0\);/g,
  'process.exit(summary.safeUpdates > 0 ? 1 : 0);'
);

// Inject exit codes info into help text
content = content.replace(
  /\s*console\.log\('  --dev-severity=<lvl>   Severity threshold for development dependencies \(falls back to --severity\)'\);[	 ]*process\.exit\(0\);/,
  "  console.log('  --dev-severity=<lvl>   Severity threshold for development dependencies (falls back to --severity)');\n" +
    "    console.log('');\n" +
    "    console.log('Exit codes:');\n" +
    "    console.log('  0: no safe updates available');\n" +
    "    console.log('  1: safe updates available');\n" +
    "    console.log('  2: error occurred');"
);

fs.writeFileSync(filePath, content);
console.log('Patched bin/dry-aged-deps.js');
