---
description: "Scan IaC files for cost optimization and governance violations — PSRule, Checkov, Cloud Custodian, Infracost"
agent: CostAnalysisAgent
argument-hint: "[path=...] [engine=...]"
---

# FinOps Scan

## Inputs

* ${input:path}: (Optional) Path to scan. Defaults to workspace root.
* ${input:engine}: (Optional) Specific engine to run (psrule, checkov, custodian, infracost). Runs all if omitted.

## Requirements

1. Scan IaC files at the provided path for cost optimization and governance violations across four engines.
2. Use the 4-tool architecture (PSRule for Azure, Checkov, Cloud Custodian, Infracost).
3. Produce a report organized by cost category with severity classification.
4. Map findings to CIS Azure Benchmarks and FinOps Framework principles.
5. Generate SARIF output with `automationDetails.id` prefixed with `finops/`.
