## NOW
Add a `.voderignore` file (or update it if it already exists) with these patterns to hide the biggest token-sinks from the assistant’s context:

```
# Hide large generated and cache files
package-lock.json
node_modules/**
coverage/**
dist/**
build/**
.cache/**
.parcel-cache/**
docs/generated/**
*.log

# Hide large test fixtures
test/fixtures/**
```

## NEXT
Add ignore rules for IDE/editor files, environment files and auxiliary tool configs:

```
# Env and secrets
.env*
  
# Editor settings and swap files
.vscode/**
.idea/**
*.swp
*.swo
  
# Husky hooks and GitHub assistant prompts
.husky/**
.github/instructions/**
.github/prompts/**
```

## LATER
Evaluate breaking out very large fixtures or documentation (e.g. move to a separate repo or archive) and prune any other seldom-used files to further slim the context.