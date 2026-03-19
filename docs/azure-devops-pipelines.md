---
title: "Azure DevOps Pipeline Integration"
description: "ADO YAML pipeline equivalents for each GitHub Actions workflow in the Agentic Accelerator Framework, covering security scanning with GHAzDO, accessibility, code quality, APM audit, and FinOps cost gates."
ms.date: 2026-03-17
ms.topic: reference
---

## Overview

Azure DevOps is a first-class citizen in the Agentic Accelerator Framework. Every GitHub Actions workflow has an equivalent ADO YAML pipeline using GitHub Advanced Security for Azure DevOps (GHAzDO) tasks and native ADO publishing capabilities.

This document maps each GitHub Actions workflow to its ADO pipeline equivalent and provides YAML fragments for each domain. Full pipeline samples are available in the `samples/azure-devops/` directory.

## GHAzDO Task Reference

GHAzDO provides pipeline tasks that mirror GitHub Advanced Security capabilities:

| Task | Purpose |
| --- | --- |
| `AdvancedSecurity-Codeql-Init@1` | Initialize CodeQL analysis (language, queries) |
| `AdvancedSecurity-Codeql-Analyze@1` | Run CodeQL analysis and generate SARIF |
| `AdvancedSecurity-Dependency-Scanning@1` | Scan dependencies for known vulnerabilities |
| `AdvancedSecurity-Publish@1` | Publish SARIF results to ADO Advanced Security |
| `MicrosoftSecurityDevOps@1` | Run Microsoft Security DevOps (MSDO) for IaC scanning |

> [!IMPORTANT]
> GHAzDO must be enabled at the organization, project, or repository level before these tasks will function. Enable it under **Project Settings > Repos > Advanced Security**.

## Security Pipeline

**GitHub Actions equivalent**: `.github/workflows/security-scan.yml`

The security pipeline covers SAST (CodeQL), SCA (dependency scanning), IaC scanning (MSDO), container image scanning, and DAST.

### CodeQL (SAST)

```yaml
steps:
  - task: AdvancedSecurity-Codeql-Init@1
    displayName: Initialize CodeQL
    inputs:
      languages: javascript
      querysuite: security-extended

  - task: AdvancedSecurity-Codeql-Analyze@1
    displayName: Run CodeQL Analysis
```

CodeQL results are automatically published to ADO Advanced Security. No separate publish step is needed for CodeQL findings.

### Dependency Scanning (SCA)

```yaml
steps:
  - task: AdvancedSecurity-Dependency-Scanning@1
    displayName: Dependency Scanning
```

Dependency scanning results appear in the ADO Advanced Security dependency alerts tab and as PR annotations when build validation policies are configured.

### IaC Scanning (MSDO)

```yaml
steps:
  - task: MicrosoftSecurityDevOps@1
    displayName: Microsoft Security DevOps
    inputs:
      categories: IaC
      tools: checkov,trivy,terrascan

  - task: AdvancedSecurity-Publish@1
    displayName: Publish IaC SARIF
    inputs:
      sarifFile: $(Build.ArtifactStagingDirectory)/*.sarif
```

MSDO generates SARIF output that `AdvancedSecurity-Publish@1` uploads to ADO Advanced Security. These findings appear alongside CodeQL and dependency alerts in the Security tab.

### Container Image Scanning

```yaml
steps:
  - script: |
      docker build -t scan-target:latest -f Dockerfile .
    displayName: Build container image

  - script: |
      trivy image --format sarif --output trivy-container.sarif --severity CRITICAL,HIGH scan-target:latest
    displayName: Run Trivy container scan

  - task: AdvancedSecurity-Publish@1
    displayName: Publish Container SARIF
    condition: always()
    inputs:
      sarifFile: $(Build.SourcesDirectory)/trivy-container.sarif
```

### DAST (ZAP)

```yaml
steps:
  - script: |
      docker run --rm -v $(Build.SourcesDirectory):/zap/wrk owasp/zap2docker-stable zap-baseline.py \
        -t $(DAST_TARGET_URL) \
        -J zap-report.json
    displayName: ZAP Baseline Scan

  - script: |
      npx @microsoft/sarif-multitool convert zap-report.json --tool ZAP --output zap-results.sarif
    displayName: Convert ZAP JSON to SARIF
    condition: always()

  - task: AdvancedSecurity-Publish@1
    displayName: Publish DAST SARIF
    condition: always()
    inputs:
      sarifFile: $(Build.SourcesDirectory)/zap-results.sarif
```

> [!NOTE]
> See `samples/azure-devops/security-pipeline.yml` for the complete security pipeline definition.

## Accessibility Pipeline

**GitHub Actions equivalent**: `.github/workflows/accessibility-scan.yml`

The accessibility pipeline installs scanning tools, runs a three-engine scan, converts findings to SARIF, publishes results to ADO Advanced Security, and enforces threshold gating.

### Install Scanning Dependencies

```yaml
steps:
  - task: NodeTool@0
    displayName: Setup Node.js
    inputs:
      versionSpec: '20.x'

  - script: |
      npm install -g @axe-core/cli accessibility-checker
      npx playwright install --with-deps chromium
    displayName: Install scanning dependencies
```

### Run Scan and Publish

```yaml
steps:
  - script: |
      npx a11y-scan scan \
        --url "$(A11Y_SCAN_URL)" \
        --threshold $(A11Y_THRESHOLD) \
        --format sarif \
        --output a11y-results.sarif
    displayName: Run accessibility scan
    continueOnError: true

  - task: AdvancedSecurity-Publish@1
    displayName: Publish A11y SARIF
    condition: always()
    inputs:
      sarifFile: $(Build.SourcesDirectory)/a11y-results.sarif
```

### Threshold Gate

```yaml
steps:
  - script: |
      if [ -f a11y-results.sarif ]; then
        CRITICAL_COUNT=$(jq '[.runs[].results[] | select(.level == "error")] | length' a11y-results.sarif)
        echo "Critical/serious findings: $CRITICAL_COUNT"
        if [ "$CRITICAL_COUNT" -gt 0 ]; then
          echo "##vso[task.logissue type=error]Accessibility scan found $CRITICAL_COUNT critical/serious violations"
          exit 1
        fi
      fi
    displayName: Threshold gate
    condition: always()
```

> [!NOTE]
> See `samples/azure-devops/accessibility-pipeline.yml` for the complete accessibility pipeline definition.

## Code Quality Pipeline

**GitHub Actions equivalent**: `.github/workflows/code-quality.yml`

The code quality pipeline runs linting, type checking, and tests with coverage. ADO provides native tasks for publishing JUnit test results and Cobertura code coverage.

### Test Results (JUnit)

```yaml
steps:
  - script: npm run test:ci
    displayName: Run tests with coverage

  - task: PublishTestResults@2
    displayName: Publish test results
    condition: always()
    inputs:
      testResultsFormat: JUnit
      testResultsFiles: '**/junit.xml'
      mergeTestResults: true
      testRunTitle: Unit Tests
```

Test results appear in the **Tests** tab of each pipeline run. Failed tests generate work items when configured through test management policies.

### Code Coverage (Cobertura)

```yaml
steps:
  - task: PublishCodeCoverageResults@2
    displayName: Publish code coverage
    condition: always()
    inputs:
      codeCoverageTool: Cobertura
      summaryFileLocation: $(Build.SourcesDirectory)/coverage/cobertura-coverage.xml
```

Coverage results appear in the **Code Coverage** tab of each pipeline run. ADO displays line-by-line coverage highlighting directly in the repository browser.

### Coverage SARIF Upload

```yaml
steps:
  - script: |
      node convert-coverage.js coverage/coverage-summary.json 80 coverage-results.sarif
    displayName: Convert coverage to SARIF

  - task: AdvancedSecurity-Publish@1
    displayName: Publish Coverage SARIF
    condition: always()
    inputs:
      sarifFile: $(Build.SourcesDirectory)/coverage-results.sarif
```

> [!NOTE]
> See `samples/azure-devops/quality-pipeline.yml` for the complete code quality pipeline definition.

## APM Security Pipeline

**GitHub Actions equivalent**: `.github/workflows/apm-security.yml`

The APM audit pipeline validates agent configuration files for supply chain attacks. In ADO, this runs as a script step since the APM CLI is platform-agnostic.

```yaml
trigger:
  paths:
    include:
      - apm.yml
      - mcp.json
      - agents/*
      - instructions/*
      - prompts/*
      - skills/*

steps:
  - script: |
      npx apm audit
    displayName: APM Agent Config Audit
```

> [!TIP]
> Configure trigger path filters to match only agent configuration files. This prevents unnecessary pipeline runs on unrelated changes.

## FinOps Cost Gate Pipeline

**GitHub Actions equivalent**: `.github/workflows/finops-cost-gate.yml`

The FinOps cost gate pipeline estimates infrastructure costs from IaC changes and blocks merges that exceed budget thresholds.

### Variable Groups

Store budget thresholds in an ADO variable group for centralized management across multiple pipelines:

```yaml
variables:
  - group: FinOps-Settings  # Contains MONTHLY_BUDGET, INFRACOST_API_KEY
```

Create the variable group under **Pipelines > Library**:

| Variable | Description | Secret |
| --- | --- | --- |
| `MONTHLY_BUDGET` | Maximum allowed monthly cost in USD | No |
| `INFRACOST_API_KEY` | Infracost API key for cost estimation | Yes |

### Cost Estimation

```yaml
trigger:
  paths:
    include:
      - '**/*.tf'
      - '**/*.bicep'

steps:
  - script: |
      curl -fsSL https://raw.githubusercontent.com/infracost/infracost/master/scripts/install.sh | sh
      infracost breakdown --path . --format json --out-file /tmp/infracost.json
    displayName: Run Infracost estimate

  - script: |
      node convert-cost.js $(MONTHLY_BUDGET) /tmp/infracost.json finops-results.sarif
    displayName: Convert cost report to SARIF

  - task: AdvancedSecurity-Publish@1
    displayName: Publish FinOps SARIF
    condition: always()
    inputs:
      sarifFile: $(Build.SourcesDirectory)/finops-results.sarif
```

### Environment Approvals for Cost Gates

ADO environments provide manual approval gates for deployments that exceed cost thresholds:

```yaml
stages:
  - stage: CostEstimate
    jobs:
      - job: Estimate
        steps:
          - script: infracost breakdown --path . --format json --out-file /tmp/infracost.json
            displayName: Run cost estimate

  - stage: Deploy
    dependsOn: CostEstimate
    jobs:
      - deployment: DeployInfra
        environment: production  # Configure approvals in ADO environment settings
        strategy:
          runOnce:
            deploy:
              steps:
                - script: echo "Deploying infrastructure"
                  displayName: Deploy
```

Configure approval gates under **Pipelines > Environments > production > Approvals and checks**. Add required approvers for any deployment that modifies infrastructure.

## Workflow Mapping Summary

| GitHub Actions Workflow | ADO Pipeline Equivalent | Key ADO Tasks |
| --- | --- | --- |
| `security-scan.yml` | `security-pipeline.yml` | `AdvancedSecurity-Codeql-Init@1`, `AdvancedSecurity-Codeql-Analyze@1`, `AdvancedSecurity-Dependency-Scanning@1`, `MicrosoftSecurityDevOps@1`, `AdvancedSecurity-Publish@1` |
| `accessibility-scan.yml` | `accessibility-pipeline.yml` | `NodeTool@0`, `AdvancedSecurity-Publish@1` |
| `code-quality.yml` | `quality-pipeline.yml` | `PublishTestResults@2`, `PublishCodeCoverageResults@2`, `AdvancedSecurity-Publish@1` |
| `apm-security.yml` | (inline script) | `npx apm audit` |
| `finops-cost-gate.yml` | (inline script + variable group) | `AdvancedSecurity-Publish@1`, ADO environment approvals |

## Custom SARIF Publishing

All custom tool outputs (accessibility scans, coverage analysis, FinOps findings) reach ADO Advanced Security through the `AdvancedSecurity-Publish@1` task. SARIF files must comply with v2.1.0 and include:

- `runs[].tool.driver.name` set to the tool identifier
- `runs[].tool.driver.rules[]` with unique `ruleId` values
- `runs[].results[].level` using `error`, `warning`, or `note`
- `runs[].results[].partialFingerprints` for deduplication
- `automationDetails.id` with a domain category prefix (for example, `accessibility-scan/`, `code-quality/coverage/`, `finops-finding/`)

Published SARIF results appear in the ADO **Advanced Security** tab, filterable by tool name. These findings also flow to Microsoft Defender for Cloud through the ADO connector.

## Sample Pipeline Files

Complete, ready-to-use pipeline definitions are available in the `samples/azure-devops/` directory:

| File | Domain |
| --- | --- |
| `samples/azure-devops/security-pipeline.yml` | Security (CodeQL, SCA, IaC, container, DAST) |
| `samples/azure-devops/accessibility-pipeline.yml` | Accessibility (axe-core, IBM Equal Access, threshold gating) |
| `samples/azure-devops/quality-pipeline.yml` | Code quality (lint, type check, test, coverage) |

## References

- [GHAzDO documentation](https://learn.microsoft.com/en-us/azure/devops/repos/security/configure-github-advanced-security-features)
- [AdvancedSecurity-Publish task](https://learn.microsoft.com/en-us/azure/devops/repos/security/github-advanced-security-code-scanning#third-party-tool-sarif-file-import)
- [PublishTestResults@2 task](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/publish-test-results-v2)
- [PublishCodeCoverageResults@2 task](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/publish-code-coverage-results-v2)
- [ADO Variable Groups](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/variable-groups)
- [ADO Environment Approvals](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/approvals)
- [SARIF v2.1.0 Specification](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html)
