---
description: "Remediate IaC cost governance violations — apply cost-optimized patterns, right-size resources, enforce tagging"
agent: CostOptimizerAgent
argument-hint: "[path=...] [finding=...]"
---

# FinOps Fix

## Inputs

* ${input:path}: (Optional) Path to the file or directory with violations.
* ${input:finding}: (Optional) Specific finding ID to remediate. Fixes all if omitted.

## Requirements

1. Read the FinOps scan findings for the specified path.
2. Apply automated remediation using the appropriate engine-specific fix strategy.
3. For PSRule violations, apply Azure best practice configurations.
4. For Checkov violations, update IaC to meet CIS benchmark controls.
5. For Cloud Custodian issues, adjust resource configurations to policy compliance.
6. For Infracost threshold breaches, suggest right-sizing or alternative SKUs.
7. Generate unified diff patches showing all changes.
8. Re-scan to verify all fixes were applied correctly.
