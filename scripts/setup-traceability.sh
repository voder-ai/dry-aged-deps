#!/usr/bin/env bash

# setup-traceability.sh
# Creates traceability directory structure and generates JSON tracking files
# for all .md files in the prompts/ directory

set -euo pipefail

# Configuration
PROMPTS_DIR="prompts"
TRACEABILITY_DIR=".voder/traceability"

# Create traceability directory if it doesn't exist
mkdir -p "$TRACEABILITY_DIR"

# Find all .md files in prompts directory
find "$PROMPTS_DIR" -type f -name "*.md" | while read -r spec_file; do
    # Convert file path to safe filename
    # Replace / with - and remove .md extension
    safe_name=$(echo "$spec_file" | sed 's/\//-/g' | sed 's/\.md$//')
    json_file="${TRACEABILITY_DIR}/${safe_name}.json"
    
    # Create JSON tracking file with initial TODO status
    cat > "$json_file" <<EOF
{
  "specificationPath": "$spec_file",
  "status": "TODO",
  "lastValidated": null,
  "evidence": []
}
EOF
    
    echo "Created: $json_file"
done

echo ""
echo "Traceability setup complete!"
echo "Directory: $TRACEABILITY_DIR"
echo "Files created: $(find "$TRACEABILITY_DIR" -type f -name "*.json" | wc -l)"
