id: 005
title: '@semantic-release/npm vulnerability via npm'
date: '2024-06-07'
severity: high
description: |
A security vulnerability was discovered in the @semantic-release/npm package (distributed via npm). Versions prior to 12.0.2 allow untrusted input to be executed during the release process, potentially leading to arbitrary code execution.
affected_packages:

- name: '@semantic-release/npm'
  vulnerable_versions: '<12.0.2'
  patched_versions: '>=12.0.2'
  remediation: |
  Update @semantic-release/npm to version 12.0.2 or later:

      npm install --save-dev @semantic-release/npm@^12.0.2

  references:

- description: 'npm advisory for @semantic-release/npm'
  url: 'https://www.npmjs.com/advisories/0000'
