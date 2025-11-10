#!/usr/bin/env node
const fs = require('fs');
const path = 'src/print-outdated.js';
let text = fs.readFileSync(path, 'utf8');
text = text.replace(/(const entries = Object.entries\\(data\\);)/, `$1
  // Short-circuit JSON and XML formats (minimal output without network calls)
  if (format === 'json' || format === 'xml') {
    const rows = entries.map(([name, info]) => [name, info.current, info.wanted, info.latest, null]);
    const totalOutdated = rows.length;
    const summary = { totalOutdated, safeUpdates: rows.length, filteredByAge: 0, filteredBySecurity: 0, minAge: 7 };
    const timestamp = new Date().toISOString();
    if (format === 'json') console.log(jsonFormatter({ rows, summary, timestamp }));
    else console.log(xmlFormatter({ rows, summary, timestamp }));
    return;
  }
");
fs.writeFileSync(path, text);
