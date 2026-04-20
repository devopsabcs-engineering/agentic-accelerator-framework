---
description: "Scan application code and infrastructure for security vulnerabilities — OWASP Top 10, CWE mapping, SAST/DAST/SCA patterns"
agent: SecurityAgent
argument-hint: "[path=...] [scan-type=...]"
---

# Security Scan

## Inputs

* ${input:path}: (Optional) Path to scan. Defaults to workspace root.
* ${input:scan-type}: (Optional) Specific scan type (sast, iac, pipeline, supply-chain). Runs all if omitted.

## Requirements

1. Scan application code and infrastructure at the provided path for security vulnerabilities.
2. Cover OWASP Top 10 vulnerability categories with CWE mappings.
3. Include IaC security scanning for CIS Azure Benchmark compliance.
4. Evaluate pipeline configurations for security best practices.
5. Assess supply chain dependencies for known vulnerabilities.
6. Produce a report organized by vulnerability category with severity classification.
7. Generate SARIF output with `automationDetails.id` prefixed with `security/`.
