---
description: "Run code quality analysis on a codebase for coverage, complexity, duplication, and lint violations"
agent: CodeQualityDetector
argument-hint: "[path=...] [language=...]"
---

# Code Quality Scan

## Inputs

* ${input:path}: (Optional) Path to the codebase or specific file to analyze.
* ${input:language}: (Optional) Target language (typescript, python, csharp, java, go). Auto-detected if omitted.

## Requirements

1. Analyze the provided path for code quality violations across four categories: lint, complexity, duplication, and coverage.
2. Use the 4-tool architecture (per-language linters, Lizard, jscpd, per-language coverage).
3. Produce a report organized by violation category with severity classification.
4. Include coverage percentage, cyclomatic complexity scores, and duplication metrics.
5. Generate SARIF output with `automationDetails.id` prefixed with `code-quality/coverage/`.
