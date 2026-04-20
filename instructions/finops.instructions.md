---
description: "FinOps standards — IaC cost governance rules, 4-tool scanning architecture, CIS Azure Benchmarks, FinOps Framework principles"
applyTo: "**/*.bicep,**/*.tf,**/*.tfvars,**/*.json,**/*.hcl,**/main.bicep,**/main.tf"
---

# FinOps Standards

These rules apply automatically when editing Infrastructure as Code files. Follow these standards to ensure IaC templates enforce cost governance, right-sizing, tagging compliance, and budget controls aligned to the FinOps Framework.

## Cost Tagging Rules

All IaC-provisioned resources MUST include cost attribution tags to enable chargeback and showback reporting.

| Tag | Requirement | Severity | Enforcement |
|---|---|---|---|
| `costCenter` | Must be present on every resource | CRITICAL | CI gate — block merge |
| `environment` | Must be `dev`, `staging`, or `prod` | CRITICAL | CI gate — block merge |
| `owner` | Must identify the responsible team or individual | HIGH | CI gate — block merge |
| `project` | Must identify the project or workload | HIGH | CI gate — block merge |
| `budgetCode` | Must reference an approved budget allocation | MEDIUM | CI gate — warn |
| `expirationDate` | Required for non-production resources | LOW | Advisory |

### Tag Enforcement CI Gate

```text
PSRule tag validation exit code 0 → PASS (all required tags present)
PSRule tag validation exit code 1 → FAIL (missing critical tags — block merge)
Checkov tag check exit code 1     → FAIL (missing required tags — block merge)
```

- Run tag validation on every PR that modifies IaC files.
- Block merge when critical tags are missing.
- Use PSRule `Azure.Resource.UseTags` and Checkov `CKV_AZURE_*` tag policies.

## SKU Right-Sizing Rules

IaC templates MUST NOT provision oversized or premium-tier resources without documented justification.

| Rule ID | Pattern | Detection | Severity |
|---|---|---|---|
| FINOPS-001 | Oversized VM SKU | VM SKU exceeds workload baseline (e.g., `Standard_D16s_v5` for dev) | HIGH |
| FINOPS-002 | Premium storage for non-production | Premium SSD or Ultra Disk in dev/staging environments | HIGH |
| FINOPS-003 | Unbudgeted resource | Resource deployed without associated budget alert | CRITICAL |
| FINOPS-004 | Missing auto-shutdown | Dev/test VMs without auto-shutdown schedule | MEDIUM |
| FINOPS-005 | No reservation recommendation | Production workloads running on pay-as-you-go without reservation analysis | MEDIUM |
| FINOPS-006 | Unused public IP | Public IP allocated but not attached to a resource | HIGH |
| FINOPS-007 | Orphaned disk | Managed disk not attached to any VM | HIGH |
| FINOPS-008 | Missing budget alert | Resource group without a budget alert configured | CRITICAL |
| FINOPS-009 | Naming convention deviation | Resource name does not follow organizational naming standard | LOW |
| FINOPS-010 | Missing cost anomaly alert | Subscription without cost anomaly detection enabled | MEDIUM |

### Justification Mechanism

Legitimate overrides for SKU sizing MAY be documented by adding inline comments:

- Bicep: `// finops-ignore: FINOPS-001 — Load testing requires D16s_v5 for realistic benchmarks`
- Terraform: `# finops-ignore: FINOPS-001 — Load testing requires D16s_v5 for realistic benchmarks`

Suppressions MUST include a comment explaining the business justification.

## 4-Tool Scanning Architecture

### Tool 1: PSRule for Azure

Validates Azure IaC against the Azure Well-Architected Framework and organizational cost policies.

| Check Category | Examples | Output |
|---|---|---|
| Tag compliance | Required tags present, valid values | SARIF findings with rule `Azure.Resource.UseTags` |
| SKU validation | Right-sized SKUs per environment tier | SARIF findings with cost-impact metadata |
| Best practices | Diagnostic settings, availability zones | SARIF findings mapped to WAF pillars |

```bash
psrule run --input-path infra/ --output-format Sarif --output-path psrule-results.sarif
```

### Tool 2: Checkov

Scans Bicep, Terraform, ARM, and CloudFormation templates against CIS Azure Benchmarks.

| Check Category | Examples | Output |
|---|---|---|
| CIS benchmark controls | Encryption at rest, network restrictions | SARIF findings with CIS control IDs |
| Cost-related controls | Logging enabled (cost of missing logs > log cost) | SARIF findings with cost justification |
| Custom policies | Organization-specific cost governance rules | SARIF findings with custom rule IDs |

```bash
checkov -d infra/ --framework bicep terraform arm --output sarif --output-file checkov-results.sarif
```

### Tool 3: Cloud Custodian

Enforces real-time cost governance policies against deployed resources and IaC templates.

| Policy Category | Examples | Output |
|---|---|---|
| Unused resources | Unattached disks, idle VMs, orphaned NICs | Policy violations with cost-impact estimates |
| Budget enforcement | Resources exceeding budget thresholds | Budget alerts and remediation actions |
| Scheduling | Missing auto-shutdown on dev/test VMs | Schedule enforcement recommendations |

```bash
custodian run -s output/ policies/cost-governance.yml
custodian report -s output/ policies/cost-governance.yml --format sarif > custodian-results.sarif
```

### Tool 4: Infracost

Provides cost estimation and drift detection for IaC changes before deployment.

| Analysis | Description | Output |
|---|---|---|
| Cost estimate | Monthly cost projection for IaC changes | Cost breakdown per resource |
| Cost diff | Comparison between current and proposed state | Delta cost with percentage change |
| Threshold alerts | Flag changes exceeding defined cost thresholds | SARIF findings for threshold breaches |

```bash
infracost breakdown --path infra/ --format json --out-file infracost.json
python src/converters/infracost-to-sarif.py --input infracost.json --output infracost-results.sarif
```

## Severity Mapping

Findings from all four tools are mapped to unified severity levels matching the framework SARIF standard.

| Condition | SARIF Level | `security-severity` | Examples |
|---|---|---|---|
| CRITICAL | `error` | 9.0 | Untagged production resources, missing budget alerts, unbudgeted resource deployment |
| HIGH | `error` | 7.0 | Oversized SKUs, unused resources, orphaned disks, premium storage in non-production |
| MEDIUM | `warning` | 4.0 | No auto-shutdown, missing reservation recommendations, missing cost anomaly alerts |
| LOW | `note` | 1.0 | Naming convention deviations, missing optional tags |

## FinOps Framework Principles

All findings reference one or more FinOps Framework capabilities:

| Capability | Domain | Description |
|---|---|---|
| Cost Allocation | Inform | Tag resources for chargeback and showback reporting |
| Anomaly Management | Inform | Detect unexpected cost spikes through budget alerts and anomaly detection |
| Resource Utilization | Optimize | Right-size resources and eliminate waste (orphaned disks, idle VMs) |
| Rate Optimization | Optimize | Use reservations, savings plans, and spot instances where appropriate |
| Cloud Policy | Operate | Enforce organizational cost governance policies through CI/CD gates |
| Budget Management | Operate | Set and monitor budgets at resource group and subscription levels |

## CIS Azure Benchmarks for Cost Controls

The following CIS Azure Benchmark controls have cost governance implications:

| CIS Control | Description | Cost Impact |
|---|---|---|
| 5.1.1 | Ensure diagnostic settings are configured | Missing diagnostics may hide cost anomalies |
| 5.2.1 | Ensure activity log alerts exist for key operations | Budget-impacting operations should trigger alerts |
| 7.1 | Ensure virtual machines use managed disks | Unmanaged disks have higher operational cost |
| 7.4 | Ensure unattached disks are encrypted and evaluated | Orphaned disks incur unnecessary storage costs |

## Cost Optimization Patterns

### Bicep Pattern: Environment-Aware SKU Selection

```bicep
@allowed(['dev', 'staging', 'prod'])
param environment string

var vmSize = environment == 'prod' ? 'Standard_D4s_v5' : 'Standard_B2ms'
var storageSku = environment == 'prod' ? 'Premium_LRS' : 'Standard_LRS'

resource vm 'Microsoft.Compute/virtualMachines@2024-07-01' = {
  properties: {
    hardwareProfile: { vmSize: vmSize }
  }
  tags: {
    costCenter: costCenter
    environment: environment
    owner: owner
  }
}
```

### Terraform Pattern: Auto-Shutdown for Non-Production

```hcl
resource "azurerm_dev_test_global_vm_shutdown_schedule" "auto_shutdown" {
  count              = var.environment != "prod" ? 1 : 0
  virtual_machine_id = azurerm_virtual_machine.main.id
  location           = azurerm_resource_group.main.location
  enabled            = true

  daily_recurrence_time = "1900"
  timezone              = "UTC"

  notification_settings {
    enabled = true
  }
}
```

## CI/CD Quality Gate

The following checks MUST pass in CI before merge for IaC changes:

```text
1. PSRule tag validation passes (all required tags present)
2. PSRule SKU validation passes (no oversized resources without justification)
3. Checkov CIS benchmark scan finds no CRITICAL/HIGH findings
4. Cloud Custodian policies detect no budget violations
5. Infracost cost estimate stays within defined threshold
6. SARIF upload succeeds for all engines
```

## References

- [FinOps Framework](https://www.finops.org/framework/) — FinOps Foundation
- [PSRule for Azure](https://azure.github.io/PSRule.Rules.Azure/) — Azure Well-Architected Framework validation
- [Checkov](https://www.checkov.io/) — Static analysis for IaC
- [Cloud Custodian](https://cloudcustodian.io/) — Cloud governance as code
- [Infracost](https://www.infracost.io/) — Cloud cost estimation for IaC
- [CIS Azure Benchmarks](https://www.cisecurity.org/benchmark/azure) — Center for Internet Security
- [SARIF v2.1.0 Specification](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html)
