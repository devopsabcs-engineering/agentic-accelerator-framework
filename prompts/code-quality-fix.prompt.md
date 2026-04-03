---
description: "Fix code quality violations by generating tests, reducing complexity, and removing duplication"
agent: TestGenerator
argument-hint: "[component=...] [report=...]"
---

# Code Quality Fix

## Inputs

* ${input:component}: (Required) Component file path to fix.
* ${input:report}: (Optional) SARIF report or scan findings to address.
* ${input:category}: (Optional) Fix category: coverage, complexity, duplication, lint. Defaults to all.

## Requirements

1. Analyze the provided component file for code quality violations.
2. Generate unit tests to improve coverage using the Arrange-Act-Assert pattern.
3. Refactor functions exceeding CCN ≤ 10 into smaller, composable functions.
4. Eliminate code duplication identified by jscpd.
5. Apply lint fixes following language-specific conventions.
6. Maintain or improve existing test coverage after refactoring.
