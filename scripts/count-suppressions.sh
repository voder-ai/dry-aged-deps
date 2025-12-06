#!/usr/bin/env bash
# Count remaining traceability/require-branch-annotation suppressions

total=618
current=$(grep -r 'eslint-disable traceability/require-branch-annotation' src/ bin/ test/ 2>/dev/null | wc -l | tr -d ' ')
fixed=$((total - current))

echo "Progress: $fixed/$total files fixed"
echo "Remaining suppressions: $current"
echo "Completion: $((fixed * 100 / total))%"
