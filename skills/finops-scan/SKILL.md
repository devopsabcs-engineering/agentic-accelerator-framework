---
name: finops-scan
description: "FinOps scanning methodology — 4-tool architecture, PSRule/Checkov/Cloud Custodian/Infracost, SARIF output, cost optimization patterns, and CI/CD integration"
---

# FinOps Scan Skill

Domain knowledge for FinOps cost governance scanning across Infrastructure as Code templates. Agents load this skill to understand the 4-tool scanning architecture, cost optimization categories, severity classification, FinOps Framework mapping, CIS Azure Benchmarks, and SARIF output requirements for enforcing cost governance in Bicep, Terraform, ARM, and HCL files.

## The Cost Governance Gap

Traditional IaC security scanning tools focus on hardening and compliance but miss cost governance entirely. None of them scan for:

- **Missing cost attribution tags** that prevent chargeback and showback reporting
- **Oversized SKUs** deployed in non-production environments without justification
- **Orphaned resources** (unattached disks, unused public IPs) incurring unnecessary costs
- **Missing budget alerts** that allow uncontrolled spending
- **No auto-shutdown schedules** on dev/test VMs running 24/7
- **Pay-as-you-go workloads** that would benefit from reservations or savings plans

IaC templates — `.bicep`, `.tf`, `.json` (ARM), `.hcl` — define the cost structure of cloud deployments. A misconfigured template can result in thousands of dollars in unnecessary spend per month. Cost governance must shift left into the IaC review process.

## Cost Categories

| # | Category | Vector | Example | FinOps Capability |
|---|---|---|---|---|
| 1 | Missing Tags | No cost attribution | Production VM without `costCenter` tag blocks chargeback | Cost Allocation |
| 2 | Oversized Resources | Wrong SKU for workload | `Standard_D16s_v5` VM in dev environment | Resource Utilization |
| 3 | Orphaned Resources | Unused allocated resources | Managed disk not attached to any VM | Resource Utilization |
| 4 | Missing Budget Controls | No spend guardrails | Resource group without budget alert | Budget Management |
| 5 | Scheduling Gaps | 24/7 non-production | Dev VMs without auto-shutdown | Resource Utilization |
| 6 | Rate Optimization | Missed savings | Production workloads on pay-as-you-go pricing | Rate Optimization |

## FinOps Framework Alignment

| # | FinOps Capability | Domain | IaC Relevance |
|---|---|---|---|
| 1 | Cost Allocation | Inform | Tags on IaC resources enable chargeback and showback |
| 2 | Anomaly Management | Inform | Budget alerts and anomaly detection configured in IaC |
| 3 | Resource Utilization | Optimize | Right-sized SKUs and cleanup of orphaned resources |
| 4 | Rate Optimization | Optimize | Reservation and savings plan recommendations based on workload patterns |
| 5 | Cloud Policy | Operate | CI/CD gates enforce cost governance before deployment |
| 6 | Budget Management | Operate | Budget resources and alerts defined in IaC templates |

## 4-Tool Scanning Architecture

### Tool 1: PSRule for Azure

Validates Azure IaC against the Azure Well-Architected Framework and organizational cost policies.

**Key cost checks:**

| Check | Rule | Severity | Description |
|---|---|---|---|
| Required tags | `Azure.Resource.UseTags` | CRITICAL | All resources must include cost attribution tags |
| SKU validation | `Azure.VM.UseSkuPolicy` | HIGH | VM SKUs must match environment tier |
| Diagnostic settings | `Azure.Resource.UseDiagnosticSettings` | MEDIUM | Missing diagnostics may hide cost anomalies |
| Availability zones | `Azure.Resource.UseAvailabilityZones` | MEDIUM | Zone configuration impacts cost and resilience |

**CI integration:**

```bash
psrule run --input-path infra/ --output-format Sarif --output-path psrule-results.sarif
# Exit code 0 = pass, 1 = fail (findings above threshold)
```

### Tool 2: Checkov

Scans Bicep, Terraform, ARM, and CloudFormation templates against CIS Azure Benchmarks.

**Key cost checks:**

| Check | CIS Control | Severity | Description |
|---|---|---|---|
| Encryption at rest | CIS 7.x | HIGH | Missing encryption incurs compliance remediation cost |
| Network restrictions | CIS 6.x | HIGH | Open network rules risk data exfiltration costs |
| Logging enabled | CIS 5.x | MEDIUM | Cost of missing logs exceeds logging cost |
| Custom cost policies | Organization | HIGH | Organization-specific cost governance rules |

```bash
checkov -d infra/ --framework bicep terraform arm --output sarif --output-file checkov-results.sarif
```

### Tool 3: Cloud Custodian

Enforces real-time cost governance policies against deployed resources and IaC templates.

**Key cost policies:**

| Policy | Category | Severity | Description |
|---|---|---|---|
| Orphaned disks | Unused resources | HIGH | Unattached managed disks incurring storage costs |
| Idle VMs | Unused resources | HIGH | VMs with < 5% CPU utilization over 14 days |
| Missing auto-shutdown | Scheduling | MEDIUM | Dev/test VMs without shutdown schedules |
| Budget enforcement | Budget controls | CRITICAL | Resources exceeding budget thresholds |

```bash
custodian run -s output/ policies/cost-governance.yml
custodian report -s output/ policies/cost-governance.yml --format sarif > custodian-results.sarif
```

### Tool 4: Infracost

Provides cost estimation and drift detection for IaC changes before deployment.

**Key capabilities:**

| Analysis | Description | Output |
|---|---|---|
| Cost estimate | Monthly cost projection for IaC changes | Cost breakdown per resource |
| Cost diff | Comparison between current and proposed state | Delta cost with percentage change |
| Threshold alerts | Flag changes exceeding defined cost thresholds | SARIF findings for threshold breaches |

```bash
infracost breakdown --path infra/ --format json --out-file infracost.json
python src/converters/infracost-to-sarif.py --input infracost.json --output infracost-results.sarif
```

## SARIF Output Format

All 4 tools produce SARIF v2.1.0 output with tool-specific `automationDetails.id` prefixes.

| Tool | `automationDetails.id` | `tool.driver.name` |
|---|---|---|
| PSRule for Azure | `finops/psrule` | `psrule-azure` |
| Checkov | `finops/checkov` | `checkov` |
| Cloud Custodian | `finops/custodian` | `cloud-custodian` |
| Infracost | `finops/infracost` | `infracost` |

**Required SARIF fields:**

- `runs[].tool.driver.name` — Tool name
- `runs[].tool.driver.rules[]` — Rule definitions with `id`, `shortDescription`, `fullDescription`, `helpUri`, `properties.tags`
- `runs[].results[]` — Finding instances with `ruleId`, `level`, `message.text`, `locations[].physicalLocation`
- `runs[].results[].partialFingerprints` — `ruleId:filePath:lineNumber` hash for deduplication
- `runs[].automationDetails.id` — Tool-specific category prefix

**Severity mapping:**

| Framework Severity | SARIF Level | `security-severity` |
|---|---|---|
| CRITICAL | `error` | 9.0 |
| HIGH | `error` | 7.0 |
| MEDIUM | `warning` | 4.0 |
| LOW | `note` | 1.0 |

## Rule Definitions

| Rule ID | Pattern | Detection | Severity | FinOps Capability |
|---|---|---|---|---|
| FINOPS-001 | Oversized VM SKU | VM SKU exceeds workload baseline for environment tier | HIGH | Resource Utilization |
| FINOPS-002 | Premium storage for non-production | Premium SSD or Ultra Disk in dev/staging environments | HIGH | Resource Utilization |
| FINOPS-003 | Unbudgeted resource | Resource deployed without associated budget alert | CRITICAL | Budget Management |
| FINOPS-004 | Missing auto-shutdown | Dev/test VMs without auto-shutdown schedule | MEDIUM | Resource Utilization |
| FINOPS-005 | No reservation recommendation | Production workloads on pay-as-you-go without reservation analysis | MEDIUM | Rate Optimization |
| FINOPS-006 | Unused public IP | Public IP allocated but not attached to a resource | HIGH | Resource Utilization |
| FINOPS-007 | Orphaned disk | Managed disk not attached to any VM | HIGH | Resource Utilization |
| FINOPS-008 | Missing budget alert | Resource group without a budget alert configured | CRITICAL | Budget Management |
| FINOPS-009 | Naming convention deviation | Resource name does not follow organizational naming standard | LOW | Cloud Policy |
| FINOPS-010 | Missing cost anomaly alert | Subscription without cost anomaly detection enabled | MEDIUM | Anomaly Management |
| FINOPS-TAG-001 | Missing costCenter tag | Resource without `costCenter` tag | CRITICAL | Cost Allocation |
| FINOPS-TAG-002 | Missing environment tag | Resource without `environment` tag | CRITICAL | Cost Allocation |
| FINOPS-TAG-003 | Missing owner tag | Resource without `owner` tag | HIGH | Cost Allocation |
| FINOPS-TAG-004 | Missing project tag | Resource without `project` tag | HIGH | Cost Allocation |

## CIS Azure Benchmarks for Cost Controls

| CIS Control | Description | Cost Impact |
|---|---|---|
| 5.1.1 | Ensure diagnostic settings are configured | Missing diagnostics may hide cost anomalies |
| 5.2.1 | Ensure activity log alerts exist for key operations | Budget-impacting operations should trigger alerts |
| 7.1 | Ensure virtual machines use managed disks | Unmanaged disks have higher operational cost |
| 7.4 | Ensure unattached disks are encrypted and evaluated | Orphaned disks incur unnecessary storage costs |

## CI/CD Integration

### GitHub Actions

```yaml
name: FinOps Scan
on:
  pull_request:
    paths:
      - '**/*.bicep'
      - '**/*.tf'
      - '**/*.tfvars'
      - '**/*.json'
      - '**/*.hcl'
      - 'infra/**'
permissions:
  contents: read
  security-events: write

jobs:
  psrule-scan:
    name: "PSRule for Azure"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: microsoft/ps-rule@v2
        with:
          modules: PSRule.Rules.Azure
          outputFormat: Sarif
          outputPath: psrule-results.sarif
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: psrule-results.sarif
          category: finops/psrule

  checkov-scan:
    name: "Checkov CIS Scan"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: bridgecrewio/checkov-action@v12
        with:
          output_format: sarif
          output_file_path: checkov-results.sarif
          framework: bicep,terraform,arm
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: checkov-results.sarif
          category: finops/checkov

  infracost-analysis:
    name: "Infracost Cost Estimate"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: infracost/actions/setup@v3
        with:
          api-key: ${{ secrets.INFRACOST_API_KEY }}
      - name: Generate cost estimate
        run: infracost breakdown --path infra/ --format json --out-file infracost.json
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Convert to SARIF
        run: python src/converters/infracost-to-sarif.py --input infracost.json --output infracost-results.sarif
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: infracost-results.sarif
          category: finops/infracost
```

### Azure DevOps Pipeline

```yaml
trigger:
  branches:
    include: [main]
  paths:
    include:
      - '**/*.bicep'
      - '**/*.tf'
      - '**/*.tfvars'
      - '**/*.json'
      - '**/*.hcl'
      - 'infra/**'

pool:
  vmImage: ubuntu-latest

stages:
  - stage: PSRuleScan
    displayName: 'PSRule for Azure'
    jobs:
      - job: PSRule
        steps:
          - checkout: self
          - task: ps-rule-assert@2
            inputs:
              modules: PSRule.Rules.Azure
              outputFormat: Sarif
              outputPath: $(Build.ArtifactStagingDirectory)/psrule-results.sarif
          - task: AdvancedSecurity-Publish@1
            inputs:
              SarifPath: '$(Build.ArtifactStagingDirectory)/psrule-results.sarif'

  - stage: CheckovScan
    displayName: 'Checkov CIS Scan'
    dependsOn: []
    jobs:
      - job: Checkov
        steps:
          - checkout: self
          - task: UsePythonVersion@0
            inputs:
              versionSpec: '3.12'
          - script: |
              pip install checkov
              checkov -d infra/ --framework bicep terraform arm --output sarif --output-file $(Build.ArtifactStagingDirectory)/checkov-results.sarif
            displayName: 'Run Checkov'
          - task: AdvancedSecurity-Publish@1
            inputs:
              SarifPath: '$(Build.ArtifactStagingDirectory)/checkov-results.sarif'

  - stage: InfracostAnalysis
    displayName: 'Infracost Cost Estimate'
    dependsOn: []
    jobs:
      - job: Infracost
        steps:
          - checkout: self
          - task: UsePythonVersion@0
            inputs:
              versionSpec: '3.12'
          - script: |
              curl -fsSL https://raw.githubusercontent.com/infracost/infracost/master/scripts/install.sh | sh
              infracost breakdown --path infra/ --format json --out-file infracost.json
              python src/converters/infracost-to-sarif.py --input infracost.json --output $(Build.ArtifactStagingDirectory)/infracost-results.sarif
            displayName: 'Run Infracost'
          - task: AdvancedSecurity-Publish@1
            inputs:
              SarifPath: '$(Build.ArtifactStagingDirectory)/infracost-results.sarif'
```

## References

- [FinOps Framework](https://www.finops.org/framework/) — FinOps Foundation
- [PSRule for Azure](https://azure.github.io/PSRule.Rules.Azure/) — Azure Well-Architected Framework validation
- [Checkov](https://www.checkov.io/) — Static analysis for IaC
- [Cloud Custodian](https://cloudcustodian.io/) — Cloud governance as code
- [Infracost](https://www.infracost.io/) — Cloud cost estimation for IaC
- [CIS Azure Benchmarks](https://www.cisecurity.org/benchmark/azure) — Center for Internet Security
- [SARIF v2.1.0 Specification](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html)
