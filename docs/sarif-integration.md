---
title: "SARIF Integration Reference"
description: "Comprehensive reference for SARIF v2.1.0 integration across all framework domains, including the category registry, domain-specific mappings, upload patterns for GitHub Actions and Azure DevOps, and strategies for staying within platform limits."
ms.date: 2026-03-17
ms.topic: reference
---

## SARIF v2.1.0 Overview

The Static Analysis Results Interchange Format (SARIF) v2.1.0 is the universal interchange format for all scan tools in the Agentic Accelerator Framework. Every domain (Security, Accessibility, Code Quality, FinOps) produces SARIF-compliant output that flows into GitHub Code Scanning, ADO Advanced Security, and Microsoft Defender for Cloud.

## Schema Requirements

Every SARIF file must include the following structure:

```json
{
  "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json",
  "version": "2.1.0",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "tool-name",
          "rules": []
        }
      },
      "results": [],
      "automationDetails": {
        "id": "category/"
      }
    }
  ]
}
```

### Required Fields (GitHub)

| Field | Purpose |
|---|---|
| `$schema` | SARIF schema URL |
| `version` | Must be `"2.1.0"` |
| `tool.driver.name` | Name of the scan tool |
| `tool.driver.rules[]` | Rule definitions with unique `ruleId` values |
| `help.text` | Plain-text help for each rule (required by GitHub) |
| `partialFingerprints` | Fingerprinting for deduplication across runs |

### Recommended Enrichment

| Field | Purpose |
|---|---|
| `help.markdown` | Markdown-formatted help (GitHub renders this in the UI) |
| `properties.tags` | Array of tags for filtering (for example, `["accessibility", "wcag2.1"]`) |
| `automationDetails.id` | Category prefix for grouping runs (for example, `accessibility-scan/homepage`) |

## Platform Limits

| Limit | Value |
|---|---|
| Maximum file size | 10 MB (gzip compressed) |
| Maximum results per run | 25,000 |
| Maximum runs per file | 20 |

> [!IMPORTANT]
> Report only regressions and below-threshold items as SARIF results to stay within the 25,000-result limit. Full reports should go to separate storage (for example, Azure Blob or build artifacts).

## SARIF Category Registry

Each scan type uses a distinct `automationDetails.id` category prefix to prevent collisions and enable filtering in Security Overview.

| Category Prefix | Scan Type | Tool |
|---|---|---|
| `secret-scanning/` | Secrets | GitHub Secret Protection |
| `dependency-review/` | SCA (Software Composition Analysis) | Dependabot |
| `codeql/` | SAST (Static Application Security Testing) | CodeQL + Copilot Autofix |
| `iac-scanning/` | Infrastructure as Code | MSDO (Checkov, Trivy) |
| `container-scanning/` | Container Images | Trivy, Grype |
| `dast/` | Dynamic Application Security Testing | ZAP |
| `accessibility-scan/` | Accessibility (WCAG 2.2) | axe-core + IBM Equal Access |
| `code-quality/coverage/` | Code Coverage | Coverage-to-SARIF converter |
| `agent-config-scan/` | Agent Configuration Security | APM (`microsoft/apm`) `apm audit` |
| `finops-finding/` | FinOps and Cost Analysis | Cost analysis agent |

## Severity Classification

All findings use a consistent severity model mapped to SARIF levels.

| Severity | SARIF Level | Description |
|---|---|---|
| CRITICAL | `error` | Immediate risk: active exploitation possible, data exposure, or compliance violation |
| HIGH | `error` | Significant risk: must be remediated before merge |
| MEDIUM | `warning` | Moderate risk: should be addressed in the current sprint |
| LOW | `note` | Minor risk: track for future improvement |

When applicable, map findings to CWE IDs (security), OWASP Top 10 (application security), OWASP LLM Top 10 (AI/LLM findings), and WCAG 2.2 success criteria (accessibility).

## Domain-Specific Mappings

### Accessibility: axe-core Impact to SARIF

The accessibility scanner maps axe-core impact levels to SARIF levels with numeric security-severity scores.

| axe-core Impact | SARIF Level | security-severity | Notes |
|---|---|---|---|
| critical | `error` | 9.0 | Blocks users from accessing content |
| serious | `error` | 7.0 | Significantly impairs usability |
| moderate | `warning` | 4.0 | Creates difficulty for some users |
| minor | `note` | 1.0 | Best-practice improvement |

SARIF enrichment for accessibility results:

- `help.markdown` includes WCAG mapping and remediation guidance
- `properties.tags` includes `accessibility` and WCAG success criteria tags (for example, `wcag2.1.1`)
- `partialFingerprints` enables deduplication across scans
- `automationDetails.id` uses `accessibility-scan/<url>` for multi-site matrix scans

### Code Quality: Coverage to SARIF

Coverage reports convert to SARIF findings for threshold enforcement.

| Coverage Concept | SARIF Mapping |
|---|---|
| Uncovered function | `result` with `ruleId: "uncovered-function"` |
| Uncovered branch | `result` with `ruleId: "uncovered-branch"` |
| File below threshold | `result` with `ruleId: "coverage-threshold-violation"` |
| Uncovered line range | `physicalLocation.region` with `startLine` and `endLine` |

The `automationDetails.id` category is `code-quality/coverage/`.

> [!TIP]
> Report only regressions and below-threshold functions as SARIF results rather than full coverage data. This keeps results within the 25,000-result limit.

### FinOps: Cost Findings to SARIF

FinOps findings use a SARIF-inspired schema with domain-specific rule identifiers.

| Finding Type | SARIF `ruleId` | Description |
|---|---|---|
| Budget overspend | `budget-overspend` | Spending exceeds the defined budget threshold |
| Cost anomaly | `cost-anomaly` | Unexpected cost spike detected |
| Untagged resources | `untagged-resources` | Resources missing required cost allocation tags |
| Idle resources | `idle-resources` | Resources running with minimal or no utilization |
| Reservation waste | `reservation-waste` | Reserved instances or savings plans with low utilization |
| Cost trend | `cost-trend` | Persistent upward cost trend exceeding forecast |
| Optimization opportunity | `optimization-opportunity` | Azure Advisor recommendation for cost savings |

The `automationDetails.id` category is `finops-finding/v1`.

## Upload Patterns

### GitHub Actions

All SARIF uploads in GitHub Actions use the `github/codeql-action/upload-sarif@v4` action.

```yaml
- name: Upload SARIF results
  uses: github/codeql-action/upload-sarif@v4
  with:
    sarif_file: results.sarif
    category: accessibility-scan/homepage
```

The workflow must have `security-events: write` permission:

```yaml
permissions:
  security-events: write
```

### Azure DevOps

SARIF results upload to ADO Advanced Security through the `AdvancedSecurity-Publish@1` pipeline task.

```yaml
- script: npx a11y-scan scan --url "$(SCAN_URL)" --threshold 80 --format sarif --output a11y-results.sarif
  displayName: Run accessibility scan

- task: AdvancedSecurity-Publish@1
  inputs:
    sarif_file: a11y-results.sarif
  displayName: Publish SARIF to ADO Advanced Security
```

For native ADO code scanning, use the GHAzDO pipeline tasks:

```yaml
- task: AdvancedSecurity-Codeql-Init@1
  inputs:
    languages: 'csharp'
    enableAutomaticCodeQLInstall: true

- task: AdvancedSecurity-Dependency-Scanning@1

- task: AdvancedSecurity-Codeql-Analyze@1
```

### Comparison

| Aspect | GitHub Actions | Azure DevOps |
|---|---|---|
| Upload action/task | `github/codeql-action/upload-sarif@v4` | `AdvancedSecurity-Publish@1` |
| Permission required | `security-events: write` | GHAzDO enabled on the repo |
| Results visible in | GitHub Code Scanning alerts | ADO Code Scanning tab |
| Defender for Cloud | Via GitHub connector | Via ADO connector |
| Category filtering | `automationDetails.id` | Tool name in ADO UI |

## 25,000-Result Limit Strategy

GitHub enforces a limit of 25,000 results per SARIF run. For large-scale scans, apply these strategies:

1. Report only regressions (new findings compared to the baseline) rather than the full finding set.
2. Report only below-threshold items (for example, functions below 80% coverage) rather than every measured item.
3. Split results across multiple SARIF files with distinct `automationDetails.id` categories.
4. Use matrix strategies to partition scans by URL, module, or language, each producing a separate SARIF file.
5. Archive full results to build artifacts or Azure Blob storage for historical analysis.

## References

- [SARIF v2.1.0 Specification](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html)
- [GitHub Code Scanning SARIF Support](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning)
- [ADO Advanced Security](https://learn.microsoft.com/en-us/azure/devops/repos/security/configure-github-advanced-security-features)
- [Microsoft Defender for DevOps](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-devops-introduction)
