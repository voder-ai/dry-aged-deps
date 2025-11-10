#!/usr/bin/env node
import fs from 'fs';
// Modify package.json lint script
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts.lint = 'eslint src bin test --ext .js,.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('Updated lint script in package.json');
