---
description: "Remediate security vulnerabilities — apply secure coding patterns, harden IaC, fix pipeline configs, update dependencies"
agent: SecurityReviewerAgent
argument-hint: "[path=...] [finding=...]"
---

# Security Fix

## Inputs

* ${input:path}: (Optional) Path to the file or directory with vulnerabilities.
* ${input:finding}: (Optional) Specific finding ID (e.g., CWE-79) to remediate. Fixes all if omitted.

## Requirements

1. Read the security scan findings for the specified path.
2. Apply automated remediation using appropriate fix strategies per vulnerability type.
3. For OWASP Top 10 findings, apply secure coding patterns (input validation, output encoding, parameterized queries).
4. For IaC findings, apply CIS Azure Benchmark hardening patterns.
5. For pipeline findings, enforce least-privilege, secret management, and signed commits.
6. For supply chain findings, update vulnerable dependencies and verify integrity.
7. Generate unified diff patches showing all changes.
8. Re-scan to verify all fixes were applied correctly.
