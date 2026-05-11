---
status: proposed
job-id: apply-safe-updates
persona: project-maintainer
date-created: 2026-05-11
screens:
  - CLI: dry-aged-deps --update
  - CLI: dry-aged-deps --update --yes
---

# JTBD-002: Apply safe updates without manually picking versions

## Job Statement

When I have decided I am ready to take routine updates, I want one command that installs every safe-and-aged update in the correct dependency category, so I do not have to run `npm install pkg@x` for each row by hand.

## Desired Outcomes

- A single command applies all currently safe updates to `package.json` and `package-lock.json`.
- I can preview what will change before committing the action.
- I can run non-interactively when I am confident, with an explicit opt-in (e.g. `--yes`).
- The applied changes are a normal `package.json` diff I can review like any other.

## Persona Constraints

- Reviews everything they push themselves.
- Wants the friction of "apply" to be lower than the friction of "do nothing", so the safe path becomes the default path.

## Current Solutions

- Run `npm install pkg@version` once per row from `npm outdated`, typo-prone and slow.
- Use `npm update`, which does not respect age or vulnerability constraints.
- Edit `package.json` by hand and re-run `npm install`.
