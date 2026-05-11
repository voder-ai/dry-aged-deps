---
name: project-maintainer
description: An individual maintainer responsible for the day-to-day health of an npm project who runs dry-aged-deps against their own repository.
---

# Project Maintainer

## Who

The person who keeps a single Node.js project healthy day-to-day. Usually a senior developer or a solo open-source maintainer. They write code, review PRs, cut releases, and own dependency hygiene as one part of a broader role. They are competent with the npm CLI but do not want dependency management to dominate their week.

## Context Constraints

- Time is the scarcest resource — dependency hygiene competes with feature work, bug triage, and reviews.
- They run on their own machine, on their own schedule, often interactively in a terminal.
- They expect output to look and feel like familiar npm tools so they do not have to learn a new mental model.
- They cannot afford to be the unknowing distribution point of a compromised package version.
- They review every change they push themselves; trust in the tool's defaults matters because they will rarely tune flags for routine work.

## Pain Points

- `npm outdated` shows everything, including versions hours old that may turn out to be rushed or malicious.
- Manually cross-referencing release dates and `npm audit` for every outdated package is tedious and rarely happens.
- Skipping the check entirely feels reckless after every recent supply-chain incident in the ecosystem.
- The mental cost of deciding "is this update safe yet?" repeatedly across many packages drains attention that should go to product work.
