# Azure Cost Analysis & FinOps Custom GitHub Copilot Agent Research

## Status: Complete

## Research Topics & Questions

1. What Azure SDK APIs are available for retrieving cost data? (Cost Management APIs, Consumption APIs)
2. How can a custom GHCP agent query Azure costs and present them?
3. What FinOps patterns can be automated with agents?
4. How can cost anomalies be detected and alerted on using agents?
5. What SARIF-like reporting format could be used for cost/FinOps findings?
6. How does the cost-analysis-ai repository implement cost retrieval and visualization?
7. What Azure Cost Management tools/APIs should the agent leverage?
8. How can infrastructure cost be associated with specific repositories/applications?
9. How would a FinOps agent help with budget alerting, cost optimization recommendations?
10. What CI/CD integration patterns exist for cost checks (e.g., block deployments exceeding budget)?

---

## 1. Azure SDK APIs for Retrieving Cost Data

### Cost Management REST API (Primary)

- **Endpoint**: `https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-11-01`
- **Description**: The Cost Management APIs provide multidimensional analysis with customized filters and expressions for consumption-related questions. Available for Azure Enterprise customers and most subscription types.
- **Key operations**:
  - **Query API** (`Microsoft.CostManagement/query`): Execute ad-hoc cost queries with grouping, filtering, and aggregation. Supports `ActualCost` and `AmortizedCost` types.
  - **Exports API** (`Microsoft.CostManagement/exports`): Configure recurring exports of cost details to Azure Storage (CSV). Recommended for large-scale data ingestion.
  - **Generate Cost Details** (`Microsoft.CostManagement/generateCostDetailsReport`): On-demand CSV download for smaller, date-range-based datasets.
  - **Budgets API** (`Microsoft.Consumption/budgets`): Create cost budgets with threshold alerts and automated actions.
  - **Alerts API** (`Microsoft.CostManagement/alerts`): Manage all budget and anomaly alerts.
  - **Scheduled Actions API** (`Microsoft.CostManagement/scheduledActions`): Automate anomaly alert rule creation (kind: `InsightAlert`).
  - **Forecast API**: Available in Cost Analysis smart views for projecting future costs based on 60-day historical data using WaveNet deep learning.

### Python SDK Packages

- **`azure-mgmt-costmanagement>=4.0.1`**: Primary SDK for Cost Management queries.
  - Key classes: `CostManagementClient`, `QueryDefinition`, `QueryDataset`, `QueryAggregation`, `QueryGrouping`, `QueryTimePeriod`
  - Usage: `client.query.usage(scope=scope, parameters=query)`
- **`azure-identity>=1.15.0`**: Authentication via `DefaultAzureCredential`, `AzureCliCredential`.
- **`azure-storage-blob>=12.19.0`**: For uploading/downloading cost report artifacts to Blob Storage.

### Consumption REST API (Secondary/Fallback)

- **CLI**: `az consumption usage list --start-date --end-date`
- **Description**: Fetches itemized usage details including `pretaxCost`, `consumedService`, `instanceName`, `usageQuantity`, `currency`.
- **Use case**: Fallback when Cost Management Query API doesn't return data for certain subscription types.

### Pricing APIs

- **Azure Retail Prices API**: Get pay-as-you-go meter rates.
- **Price Sheet API** (`Microsoft.Consumption/pricesheet`): Custom pricing for all meters (EA/MCA).

### Invoicing APIs

- **Invoices API** (`Microsoft.Billing/invoices`): List invoices with amounts, payment status, PDF download links.
- **Transactions API** (`Microsoft.Billing/transactions`): Invoice line-items for MCA/MPA customers.

### Reservation APIs

- **Reservation Details**: Detailed resource consumption for reservations.
- **Reservation Recommendations**: Purchase recommendations with expected savings.
- **Reservation Transactions**: Purchase and management transactions.

---

## 2. How the cost-analysis-ai Repository Works

### Architecture Overview

The `devopsabcs-engineering/cost-analysis-ai` repository implements a complete cost governance pipeline with these components:

#### Tag Governance Layer (Azure Policy)

- **7 mandatory tags enforced**: CostCenter, Environment, Owner, ProjectName, ServiceCategory, ChargebackEnabled, Compliance
- **Tag Inheritance**: Azure Policy auto-propagates tags from resource groups to child resources via `Modify` effect with system-assigned managed identity (Tag Contributor role).
- **Cost Management Tag Inheritance**: Virtual tag inheritance on usage records via `07-enable-tag-inheritance.ps1`.

#### Cost Query Implementation

**PowerShell (`08-generate-cost-invoice.ps1`)**:

```powershell
$uri = "https://management.azure.com/subscriptions/$SubscriptionId/providers/Microsoft.CostManagement/query?api-version=2023-11-01"
$body = @{
    type      = 'ActualCost'
    timeframe = $QueryTimeframe
    dataset   = @{
        granularity = 'None'
        aggregation = @{ totalCost = @{ name = 'PreTaxCost'; function = 'Sum' } }
        grouping    = @( @{ type = 'TagKey'; name = 'CostCenter' } )
    }
}
```

**Python Azure Function (`function_app.py`)**:

```python
from azure.mgmt.costmanagement import CostManagementClient
from azure.mgmt.costmanagement.models import (
    QueryAggregation, QueryDataset, QueryDefinition, QueryGrouping, QueryTimePeriod,
)

client = CostManagementClient(credential)
dataset = QueryDataset(
    granularity="None",
    aggregation={"totalCost": QueryAggregation(name="PreTaxCost", function="Sum")},
    grouping=[QueryGrouping(type="TagKey", name="CostCenter")],
)
query = QueryDefinition(
    type="ActualCost", timeframe="Custom",
    time_period=QueryTimePeriod(from_property=start_dt, to=end_dt),
    dataset=dataset,
)
result = client.query.usage(scope=f"/subscriptions/{sub_id}", parameters=query)
```

**Fallback chain** in `download-azure-invoice.py`:

1. **Attempt 1**: Download official billing invoice PDF via `az billing invoice list`
2. **Attempt 2**: Cost Management Query API (ResourceGroup x ServiceName grouping)
3. **Attempt 3**: Usage Details API via `az consumption usage list`

#### Visualization and Output Approaches

- **PDF/A-3B Invoices**: Generated using `fpdf2` library with embedded CSV attachments.
  - Cost by Service tables with percentages
  - Cost by Resource Group tables
  - Detailed breakdown (Resource Group x Service) tables
  - CostCenter-grouped subtotals and grand totals
- **D365 F&O Journal CSV**: `LedgerJournalEntity` format for Finance & Operations import.
- **Excel Summaries**: CostCenter-aggregated `.xlsx` files using `openpyxl`.
- **Power BI Dashboards**: Star schema model with 6 pages (Executive Overview, Tag Governance, Cost Center Analysis, Subscription Comparison, Owner Accountability, Trend Analysis).
- **JSON artifacts**: Raw Cost Management API responses and normalized cost data.

#### Azure Function (Serverless)

- **Triggers**: Timer (monthly on 5th at 08:00 UTC) and HTTP POST (`/api/generate-invoice`)
- **Authentication**: `DefaultAzureCredential` via User-Assigned Managed Identity
- **RBAC**: Cost Management Reader role on target subscriptions
- **Storage**: Blob Storage upload to `invoices/{tenant}/{year}/{month}/`
- **Infrastructure**: Bicep template deploying Storage Account, App Service Plan (Y1 Consumption), Function App (Python 3.11), Managed Identity

#### CI/CD Workflows

- **`generate-cost-invoices-local.yml`**: Queries Cost Management for all subscriptions, generates per-subscription PDFs, D365 CSVs, Excel summaries. Uses OIDC federated credentials.
- **`deploy-test-cost-invoice.yml`**: Deploys Function infrastructure via Bicep and runs E2E tests.

---

## 3. FinOps Patterns Automatable with Agents

### Cost Allocation & Chargeback

- **Tag governance enforcement**: Agent queries tag compliance status via Azure Policy and Azure Resource Graph, reports untagged resources.
- **CostCenter attribution**: Agent queries costs grouped by CostCenter tag, generates chargeback reports.
- **Cross-charging automation**: Use Exports API to download cost details, allocate based on tags/subscriptions/resource groups.

### Cost Monitoring & Alerting

- **Budget monitoring**: Agent creates/manages budgets via Budgets API, configures threshold alerts.
- **Anomaly detection**: Cost Management anomaly detection uses WaveNet deep learning on 60-day usage history. Agent integrates via Scheduled Actions API (`InsightAlert` kind).
- **Forecast comparison**: Agent compares forecasted costs against budgets and alerts when projected overspend.

### Cost Optimization

- **Reservation recommendations**: Agent retrieves Reservation Recommendations API data and presents purchase suggestions with expected savings.
- **Idle resource detection**: Agent queries usage details for resources with zero/low utilization.
- **Right-sizing guidance**: Agent analyzes VM/database SKU utilization and recommends downsizing.
- **Savings plan analysis**: Compare current spend against savings plan pricing.

### Reporting & Governance

- **Monthly invoice generation**: Automated PDF/CSV report generation (already implemented in cost-analysis-ai).
- **Tag compliance scoring**: Calculate and report tag completeness percentages across subscriptions.
- **Trend analysis**: Historical cost comparison across billing periods.

---

## 4. Cost Anomaly Detection and Alerting via Agents

### Azure-Native Anomaly Detection

- **Scope**: Subscription-level, evaluated daily
- **Algorithm**: WaveNet-based univariate time-series analysis on 60-day historical usage
- **Latency**: Runs 36 hours after end of day (UTC) for complete data
- **Alert delivery**: Email notifications with summary of resource group changes and cost impact

### Agent Integration Patterns

1. **Logic Apps workflow**: Monitor mailbox for anomaly alert emails, parse details, trigger Cost Management Query API for investigation, post to Teams/Slack.
2. **Copilot/OpenAI integration**: Parse alert details, send to language model for intelligent analysis, dynamically suggest causes and recommend actions.
3. **Microsoft Sentinel integration**: Route anomaly alerts to Sentinel, create analytics rules for reconnaissance patterns:

   ```kql
   AzureActivity
   | where OperationNameValue == "MICROSOFT.COSTMANAGEMENT/QUERY/ACTION"
   | summarize QueryCount = count() by Caller, bin(TimeGenerated, 1h)
   | where QueryCount > 100
   ```

4. **ITSM integration**: Auto-create ServiceNow/Jira tickets when anomalies detected.

### Programmatic Anomaly Alert Creation

```http
PUT /subscriptions/{subscriptionId}/providers/Microsoft.CostManagement/scheduledActions/{name}?api-version=2023-11-01
```

With `kind: "InsightAlert"` and `viewId: "/subscriptions/{id}/providers/Microsoft.CostManagement/views/ms:DailyAnomalyByResourceGroup"`.

---

## 5. Reporting Format for Cost/FinOps Findings

### Recommended: FinOps Finding Schema (SARIF-Inspired)

A JSON-based finding format inspired by SARIF but adapted for cost/FinOps:

```json
{
  "$schema": "finops-finding/v1",
  "runs": [{
    "tool": { "name": "cost-analysis-agent", "version": "1.0.0" },
    "results": [{
      "ruleId": "FINOPS-001",
      "level": "warning",
      "message": "Subscription spend exceeds monthly budget by 15%",
      "scope": "/subscriptions/{id}",
      "category": "budget-overspend",
      "metrics": {
        "actualCost": 12500.00,
        "budgetAmount": 10000.00,
        "variance": 2500.00,
        "currency": "CAD"
      },
      "recommendation": "Review resource group 'rg-web-prod' which accounts for 60% of overspend",
      "period": "2026-02",
      "severity": "high"
    }]
  }]
}
```

### Finding Categories

| Category | Rule IDs | Description |
|----------|----------|-------------|
| budget-overspend | FINOPS-001 | Actual > budget threshold |
| cost-anomaly | FINOPS-002 | Anomalous daily cost detected |
| untagged-resources | FINOPS-003 | Resources missing governance tags |
| idle-resources | FINOPS-004 | Resources with zero/low utilization |
| reservation-waste | FINOPS-005 | Unused reservation capacity |
| cost-trend | FINOPS-006 | Month-over-month cost increase > threshold |
| optimization-opportunity | FINOPS-007 | Right-sizing or savings plan recommendation |

---

## 6. Azure Cost Management APIs the Agent Should Leverage

### Primary APIs (Agent Tools)

| API | Use Case | Authentication |
|-----|----------|----------------|
| Cost Management Query | Ad-hoc cost queries by tag, resource group, service | Cost Management Reader |
| Budgets | Create/read/update budgets | Cost Management Contributor |
| Alerts | List and manage cost alerts | Cost Management Reader |
| Exports | Configure recurring cost data exports | Cost Management Contributor |
| Forecasts | Project future costs | Cost Management Reader |
| Scheduled Actions | Create anomaly alert rules | Cost Management Contributor |
| Azure Resource Graph | Query resource metadata, tags, compliance | Reader |
| Azure Advisor | Get cost optimization recommendations | Reader |

### Recommended RBAC Roles

- **Cost Management Reader** (`72fafb9e-0641-4937-9268-a91bfd8191a3`): Read-only access to cost data, budgets, alerts.
- **Cost Management Contributor**: Create/modify budgets, exports, scheduled actions.
- **Reader**: For Azure Resource Graph queries and Advisor recommendations.

---

## 7. Associating Infrastructure Cost with Repositories/Applications

### Tag-Based Attribution

The cost-analysis-ai repo enforces 7 governance tags including `ProjectName`, `CostCenter`, and `ServiceCategory`. The mapping approach:

1. **Tag resources at deployment**: CI/CD pipeline applies `ProjectName=<repo-name>` tag to all deployed resources.
2. **Enable tag inheritance**: Azure Policy propagates tags from resource groups to child resources.
3. **Enable Cost Management tag inheritance**: Virtual tag inheritance on usage records.
4. **Query by tag**: Cost Management Query API groups costs by `ProjectName` tag to get per-repo costs.

### Resource Group Convention

- Name resources groups with repo/app identifiers: `rg-{app-name}-{env}`
- Query costs grouped by `ResourceGroup` dimension and map to repositories via naming convention.

### Azure Resource Graph for Discovery

```kql
Resources
| where tags.ProjectName == "my-repo"
| summarize count() by type, subscriptionId
```

---

## 8. FinOps Agent Budget Alerting & Optimization Recommendations

### Budget Alerting Agent Capabilities

1. **Create budgets programmatically**: Use Budgets API to set monthly/quarterly budgets per subscription, resource group, or tag scope.
2. **Multi-threshold alerts**: Configure alerts at 50%, 75%, 90%, 100%, 120% thresholds.
3. **Forecast-based alerts**: Alert when forecasted spend will exceed budget before period end.
4. **Action groups**: Trigger Azure Functions, Logic Apps, or webhooks when thresholds are breached.

### Optimization Recommendations Agent Can Surface

- **Azure Advisor cost recommendations**: Right-size VMs, delete unused resources, purchase reservations.
- **Reservation utilization**: Identify unused reservation capacity (check `unusedreservation` charge type).
- **Spending patterns**: Identify services with highest month-over-month growth.
- **Spot VM opportunities**: Identify workloads that could use Spot pricing.

---

## 9. CI/CD Integration Patterns for Cost Checks

### Pre-Deployment Cost Estimation

1. **Bicep/ARM what-if + pricing lookup**: Run `az deployment sub what-if` to get resource changes, lookup Azure Retail Prices API for estimated costs.
2. **Gate deployment on budget**: Compare estimated cost against remaining budget; fail pipeline if over.

### Post-Deployment Cost Verification

1. **Wait period + query**: After deployment, wait for cost data propagation (24-48 hours), query Cost Management API.
2. **Cost delta check**: Compare pre/post deployment costs and alert if delta exceeds threshold.

### GitHub Actions Integration (Already Implemented)

The cost-analysis-ai repo has two workflow patterns:

- **`generate-cost-invoices-local.yml`**: Queries Azure Cost Management, generates per-subscription artifacts, produces GitHub Step Summary with cost breakdown table.
- **`deploy-test-cost-invoice.yml`**: Deploys infrastructure, runs E2E tests, commits artifacts.

Both use OIDC federated credentials (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`) for secure authentication.

### Proposed Pipeline Cost Gate

```yaml
- name: Check Budget
  run: |
    ACTUAL=$(az rest --method post --url ".../Microsoft.CostManagement/query?api-version=2023-11-01" ...)
    BUDGET=$(az consumption budget show --budget-name monthly-limit ...)
    if [ "$ACTUAL" -gt "$BUDGET" ]; then
      echo "::error::Deployment blocked: actual spend exceeds budget"
      exit 1
    fi
```

---

## 10. Recommended Agent Definitions for the Framework

### Agent 1: `cost-analysis` — Cost Query & Reporting Agent

**Purpose**: Query Azure costs and generate reports on demand.

**Tools**:

- `query-costs`: Execute Cost Management Query API with grouping/filtering
- `get-budget-status`: Retrieve budget vs actual for subscriptions
- `generate-cost-report`: Produce PDF/CSV cost reports
- `list-subscriptions`: Enumerate subscriptions for cost scope selection

**Triggers**: User query ("What did subscription X cost last month?"), scheduled reporting.

### Agent 2: `finops-governance` — Tag Compliance & Governance Agent

**Purpose**: Monitor and enforce tag governance, report compliance gaps.

**Tools**:

- `check-tag-compliance`: Query Azure Resource Graph for tag completeness
- `list-untagged-resources`: Find resources missing governance tags
- `score-subscription`: Calculate tag completeness scores
- `generate-compliance-report`: Produce governance PDF reports

**Triggers**: Scheduled daily/weekly runs, PR-triggered for IaC changes.

### Agent 3: `cost-anomaly-detector` — Anomaly Detection Agent

**Purpose**: Monitor for cost anomalies and alert stakeholders.

**Tools**:

- `check-anomalies`: Query Scheduled Actions API for anomaly status
- `investigate-anomaly`: Drill into cost changes by resource group/service
- `create-anomaly-alert`: Configure anomaly detection rules
- `notify-team`: Post findings to Teams/Slack/GitHub Issues

**Triggers**: Anomaly alert webhook, scheduled daily check.

### Agent 4: `cost-optimizer` — Optimization Recommendations Agent

**Purpose**: Surface cost optimization opportunities.

**Tools**:

- `get-advisor-recommendations`: Retrieve Azure Advisor cost recommendations
- `check-reservation-utilization`: Report unused reservation capacity
- `identify-idle-resources`: Find resources with no/low utilization
- `estimate-savings`: Calculate projected savings from recommendations

**Triggers**: Weekly scheduled run, user query.

### Agent 5: `deployment-cost-gate` — CI/CD Budget Enforcement Agent

**Purpose**: Block deployments that would exceed budget thresholds.

**Tools**:

- `estimate-deployment-cost`: Calculate cost impact of IaC changes
- `check-budget-headroom`: Verify remaining budget for target scope
- `approve-or-block`: Gate deployment based on cost analysis
- `generate-cost-impact-summary`: Produce PR comment with cost estimates

**Triggers**: Pull request IaC changes, deployment pipeline.

---

## References

### Azure Documentation

- [Cost Management REST API](https://learn.microsoft.com/en-us/rest/api/cost-management/)
- [Cost Management Documentation](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/)
- [Cost Management Automation Overview](https://learn.microsoft.com/en-us/azure/cost-management-billing/automate/automation-overview)
- [Common Cost Analysis Uses](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/cost-analysis-common-uses)
- [Analyze Unexpected Charges / Anomaly Detection](https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/analyze-unexpected-charges)
- [Enable Tag Inheritance](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/enable-tag-inheritance)
- [Budgets API](https://learn.microsoft.com/en-us/rest/api/consumption/budgets)
- [Exports API](https://learn.microsoft.com/en-us/rest/api/cost-management/exports/create-or-update)
- [Azure Consumption REST API](https://learn.microsoft.com/en-us/rest/api/consumption/)

### Repository References

- [cost-analysis-ai README](https://github.com/devopsabcs-engineering/cost-analysis-ai)
- [Cost Invoice Generation Docs](https://github.com/devopsabcs-engineering/cost-analysis-ai/tree/main/docs/cost-invoice-generation.md)
- [Threat Model](https://github.com/devopsabcs-engineering/cost-analysis-ai/tree/main/docs/threat-model.md)
- [Azure Function App](https://github.com/devopsabcs-engineering/cost-analysis-ai/tree/main/scripts/azure-function/function_app.py)
- [PowerShell Cost Query](https://github.com/devopsabcs-engineering/cost-analysis-ai/tree/main/scripts/08-generate-cost-invoice.ps1)
- [Bicep Infrastructure](https://github.com/devopsabcs-engineering/cost-analysis-ai/tree/main/scripts/09-deploy-cost-invoice-function.bicep)
- [E2E Test Script](https://github.com/devopsabcs-engineering/cost-analysis-ai/tree/main/scripts/test-cost-invoice-e2e.py)

### Python Package Dependencies

- `azure-mgmt-costmanagement>=4.0.1`
- `azure-identity>=1.15.0`
- `azure-storage-blob>=12.19.0`
- `fpdf2>=2.8.1`
- `openpyxl` (for Excel generation)

---

## Discovered Topics

1. **D365 Finance & Operations integration**: The cost-analysis-ai repo generates `LedgerJournalEntity` CSV for D365 F&O DMF import, enabling ERP chargeback workflows.
2. **Power BI semantic model design**: Star schema with DAX measures for tag governance KPIs, applicable as a visualization backend for agent-generated cost data.
3. **Threat model for cost infrastructure**: STRIDE analysis revealing 6 HIGH and 8 MEDIUM severity threats including cost data leakage, managed identity compromise, and billing exhaustion DoS.
4. **Multi-tenant cost governance**: The repo supports multiple Azure tenants with parameterized scripts and per-tenant subscription CSVs.
5. **PDF/A-3B compliance**: Invoice generation uses PDF/A-3B standard with embedded CSV for archival and machine-parsable content.
6. **Azure Policy for governance enforcement**: Both audit and deny modes for tag requirements, plus tag inheritance via Modify effect.
7. **OIDC federated credentials for CI/CD**: GitHub Actions authenticate to Azure without secrets using workload identity federation.

---

## Next Research (Not Completed)

- [ ] Investigate Azure Advisor REST API for programmatic cost optimization recommendations retrieval
- [ ] Research Azure Resource Graph queries for cross-subscription cost attribution
- [ ] Explore FOCUS (FinOps Open Cost and Usage Specification) as a standardized cost data format
- [ ] Investigate Microsoft Cost Management connector for Power Automate as an alternative automation approach
- [ ] Research Azure Cost Management MCP server possibilities for direct tool integration
- [ ] Explore Copilot extensibility patterns for embedding cost analysis directly in IDE

---

## Clarifying Questions

1. **Authentication model**: Will the FinOps agent use managed identity (Azure Function), service principal, or user-delegated tokens for Azure access?
2. **Scope**: Should the agent support management group, subscription, resource group, or all scopes for cost queries?
3. **Multi-cloud**: Is the scope Azure-only, or should the agent framework support AWS/GCP cost data (via FOCUS specification)?
4. **Alert delivery**: What notification channels should be supported? (GitHub Issues, Teams, Slack, Email, ITSM)
5. **Cost data freshness**: Cost Management data has 24-48 hour latency. Is near-real-time cost estimation needed (via pricing API + resource inventory)?
