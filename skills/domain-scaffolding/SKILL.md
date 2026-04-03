---
name: domain-scaffolding
description: "Domain repository scaffolding patterns — demo-app and workshop repo templates, bootstrap scripts, screenshot automation, PBIP schemas, and CI/CD pipeline generation"
---

# Domain Scaffolding Skill

Domain knowledge for scaffolding new scanner demo-app and workshop repositories. Agents load this skill to understand the two-repo pattern, directory templates, bootstrap scripts, screenshot automation, Power BI PBIP schemas, and CI/CD pipeline generation.

## Two-Repo Pattern Overview

Each domain in the Agentic Accelerator Framework follows a **two-repo pattern** documented in `docs/domain-parity-and-contribution.md`:

| Repo | Naming | Purpose |
|------|--------|---------|
| `{domain}-scan-demo-app` | Scanner platform | Scanner engine, 5 sample apps, GHCP artifacts, bootstrap scripts, CI/CD pipelines, SARIF converters, Power BI PBIP |
| `{domain}-scan-workshop` | Hands-on workshop | 10 labs (8 core + 2 ADO), screenshot automation, dev container, Jekyll GitHub Pages site |

The demo-app repo owns all scanning logic, Copilot customization artifacts, and infrastructure. The workshop repo is a GitHub template repository that teaches practitioners how to use the scanner through progressive hands-on labs.

**Existing domain repos:**

| Domain | Demo App | Workshop |
|--------|----------|----------|
| Accessibility | `accessibility-scan-demo-app` | `accessibility-scan-workshop` |
| FinOps | `finops-scan-demo-app` | `finops-scan-workshop` |

## Demo App Repository Template

The following directory tree is the canonical structure for any `{domain}-scan-demo-app` repository. Replace `{domain}` with the lowercase hyphenated domain name and `{prefix}` with a short abbreviation (e.g., `cq` for code-quality, `a11y` for accessibility).

```text
{domain}-scan-demo-app/
├── .github/
│   ├── agents/
│   │   ├── {domain}-detector.agent.md
│   │   └── {domain}-resolver.agent.md          # or related agents
│   ├── instructions/
│   │   ├── {domain}.instructions.md
│   │   └── ado-workflow.instructions.md
│   ├── prompts/
│   │   ├── {domain}-scan.prompt.md
│   │   └── {domain}-fix.prompt.md
│   ├── skills/
│   │   └── {domain}-scan/
│   │       └── SKILL.md
│   └── workflows/
│       ├── {domain}-scan.yml                    # Central scan (matrix strategy)
│       ├── {domain}-lint-gate.yml               # PR lint gate
│       ├── deploy-all.yml                       # Deploy all 5 demo apps
│       └── teardown-all.yml                     # Teardown with approval gate
├── .azuredevops/
│   └── pipelines/
│       ├── {domain}-scan.yml                    # ADO: Central scan
│       ├── {domain}-lint-gate.yml               # ADO: PR lint gate
│       ├── deploy-all.yml                       # ADO: Deploy all apps
│       ├── teardown-all.yml                     # ADO: Teardown
│       ├── scan-and-store.yml                   # ADO: Scan + upload to ADLS Gen2
│       ├── templates/
│       │   ├── deploy-app.yml                   # Parameterized per-app deploy
│       │   └── teardown-app.yml                 # Parameterized per-app teardown
│       └── variables/
│           └── common.yml                       # Shared pipeline variables
├── src/
│   ├── converters/                              # SARIF converters for non-native tools
│   │   └── {tool}-to-sarif.py
│   └── config/                                  # Tool configuration files
│       └── .{tool}.yml
├── infra/
│   └── storage.bicep                            # ADLS Gen2 storage (isHnsEnabled: true)
├── scripts/
│   ├── bootstrap-demo-apps.ps1                  # GitHub: Create repos, push, secrets
│   ├── bootstrap-demo-apps-ado.ps1              # ADO: Repos, variable groups, pipelines
│   ├── setup-oidc.ps1                           # GitHub: Azure AD OIDC federation
│   ├── setup-oidc-ado.ps1                       # ADO: Azure AD WIF federation
│   └── scan-and-store.ps1                       # Parse SARIF → ADLS Gen2 upload
├── {prefix}-demo-app-001/                       # Sample app 1
│   ├── src/
│   ├── infra/main.bicep
│   └── Dockerfile
├── {prefix}-demo-app-002/                       # Sample app 2
├── {prefix}-demo-app-003/                       # Sample app 3
├── {prefix}-demo-app-004/                       # Sample app 4
├── {prefix}-demo-app-005/                       # Sample app 5
├── power-bi/
│   ├── {Domain}Report.pbip
│   ├── {Domain}Report.Report/
│   │   ├── .platform
│   │   ├── definition.pbir
│   │   └── definition/
│   │       ├── report.json
│   │       ├── version.json
│   │       └── pages/
│   │           └── {page_name}/
│   │               ├── page.json
│   │               └── visuals/
│   └── {Domain}Report.SemanticModel/
│       ├── .platform
│       ├── definition.pbism
│       └── definition/
│           ├── database.tmdl
│           ├── model.tmdl
│           ├── relationships.tmdl
│           ├── expressions.tmdl
│           └── tables/
│               ├── Fact_{Domain}Findings.tmdl
│               ├── Repositories.tmdl
│               ├── ScanTools.tmdl
│               ├── Dim_Date.tmdl
│               └── {DomainDimension}.tmdl       # Domain-specific dimension(s)
├── docs/
│   ├── {domain}-scan-overview.md
│   ├── power-bi-data-model.md
│   └── workshop-setup.md
└── README.md
```

## Workshop Repository Template

The following directory tree is the canonical structure for any `{domain}-scan-workshop` repository.

```text
{domain}-scan-workshop/
├── _config.yml                                  # Jekyll configuration
├── index.md                                     # Workshop home / GitHub Pages landing
├── Gemfile                                      # Jekyll dependencies
├── .devcontainer/
│   ├── devcontainer.json                        # Dev container with prerequisites
│   └── post-create.sh                           # Install domain-specific tools
├── labs/
│   ├── lab-00-prerequisites/
│   │   └── README.md                            # Tool installation, environment setup
│   ├── lab-01-{first-lab}/
│   │   └── README.md                            # Explore demo apps and violations
│   ├── lab-02-{second-lab}/
│   │   └── README.md                            # Tool-specific lab
│   ├── lab-03-{third-lab}/
│   │   └── README.md
│   ├── lab-04-{fourth-lab}/
│   │   └── README.md
│   ├── lab-05-{fifth-lab}/
│   │   └── README.md
│   ├── lab-06-github-actions/
│   │   └── README.md                            # GH Actions scan pipeline + Security tab
│   ├── lab-06-ado-pipelines/
│   │   └── README.md                            # ADO scan pipeline + Advanced Security
│   ├── lab-07-remediation-github/
│   │   └── README.md                            # Fix violations, re-scan
│   ├── lab-07-ado-remediation/
│   │   └── README.md                            # Fix violations via ADO
│   └── lab-08-dashboard/
│       └── README.md                            # Power BI PBIP, ADLS Gen2, OAuth
├── images/
│   ├── lab-00/
│   │   └── README.md                            # Screenshot inventory
│   ├── lab-01/ ... lab-08/
│   │   └── README.md
│   ├── lab-06-ado/
│   │   └── README.md
│   └── lab-07-ado/
│       └── README.md
├── scripts/
│   ├── capture-screenshots.ps1                  # Domain-specific capture orchestrator
│   ├── screenshot-manifest.json                 # Declarative screenshot definitions
│   ├── screenshot-helpers.psm1                  # Shared capture module (reusable)
│   └── playwright-helpers.js                    # Playwright browser automation
├── delivery/
│   ├── half-day.md                              # 3.5h delivery guide
│   └── full-day.md                              # 7h delivery guide
├── CONTRIBUTING.md                              # Workshop contribution guide
└── README.md
```

## Bootstrap Script Templates

Every domain uses exactly **4 bootstrap scripts** plus a `scan-and-store.ps1` data pipeline script.

### setup-oidc.ps1 — GitHub OIDC Federation

Creates Azure AD app registration with federated credentials for GitHub Actions.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `$AppDisplayName` | string | Azure AD app name (e.g., `{domain}-scan-demo-app-oidc`) |
| `$GitHubOrg` | string | GitHub organization (e.g., `devopsabcs-engineering`) |
| `$RepoNames` | string[] | Array of repo names to federate |
| `$Environments` | string[] | GitHub environments (e.g., `dev`, `prod`) |
| `$SubscriptionId` | string | Azure subscription ID |
| `$ResourceGroupName` | string | Target resource group |
| `$RoleName` | string | Azure RBAC role (default: `Contributor`) |

**Actions:**
1. Create Azure AD application registration.
2. Create federated identity credentials for each repo × environment × branch.
3. Create service principal.
4. Assign RBAC role to the service principal on the target resource group.
5. Output client ID, tenant ID, and subscription ID for GitHub secrets.

### setup-oidc-ado.ps1 — ADO Workload Identity Federation

Creates Azure AD app registration with WIF for Azure DevOps pipelines.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `$AppDisplayName` | string | Azure AD app name (e.g., `{domain}-scan-demo-app-ado-oidc`) |
| `$AdoOrg` | string | ADO organization (e.g., `MngEnvMCAP675646`) |
| `$AdoProject` | string | ADO project name |
| `$ServiceConnectionName` | string | ADO service connection name |
| `$SubscriptionId` | string | Azure subscription ID |
| `$ResourceGroupName` | string | Target resource group |

**Actions:**
1. Create Azure AD application registration.
2. Create federated identity credentials for ADO service connection.
3. Create service principal with RBAC assignment.
4. Create ADO service connection using workload identity federation.

### bootstrap-demo-apps.ps1 — GitHub Repository Bootstrap

Creates GitHub repositories, pushes initial content, and configures secrets.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `$GitHubOrg` | string | GitHub organization |
| `$ScannerRepo` | string | Scanner demo-app repo name |
| `$DemoApps` | string[] | Array of demo app directory names |
| `$ClientId` | string | Azure AD client ID from OIDC setup |
| `$TenantId` | string | Azure AD tenant ID |
| `$SubscriptionId` | string | Azure subscription ID |
| `$ResourceGroup` | string | Azure resource group |

**Actions:**
1. Create each demo app as a separate GitHub repository.
2. Push initial content from the corresponding directory.
3. Set repository secrets (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`).
4. Create GitHub environments (`dev`, `prod`).
5. Create repository wiki with setup documentation.
6. Enable GitHub Advanced Security features.

### bootstrap-demo-apps-ado.ps1 — ADO Repository Bootstrap

Creates Azure DevOps repos, variable groups, service connections, and pipelines.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `$AdoOrg` | string | ADO organization (e.g., `MngEnvMCAP675646`) |
| `$AdoProject` | string | ADO project name |
| `$ScannerRepo` | string | Scanner repo name |
| `$DemoApps` | string[] | Array of demo app names |
| `$ServiceConnectionName` | string | ADO service connection name |

**Actions:**
1. Create Azure Repos for each demo app in the ADO project.
2. Push initial content to each repo.
3. Create variable groups with shared variables.
4. Create service connections using workload identity federation.
5. Create pipeline definitions from YAML files.
6. Set pipeline permissions and approvals.

## Screenshot Manifest Pattern

The screenshot system uses a **manifest-driven approach** for maintainability. Adding a new screenshot requires adding a JSON entry rather than modifying PowerShell code.

### Manifest Schema

```json
{
  "domain": "{domain}",
  "scannerRepo": "{domain}-scan-demo-app",
  "adoOrg": "MngEnvMCAP675646",
  "adoProject": "Agentic Accelerator Framework",
  "screenshots": [
    {
      "lab": "01",
      "name": "lab-01-{description}",
      "phase": 1,
      "method": "freeze-execute",
      "command": "command-to-execute"
    },
    {
      "lab": "06",
      "name": "lab-06-{description}",
      "phase": 3,
      "method": "playwright-auth",
      "url": "https://github.com/{org}/{repo}/path",
      "storageState": "github-auth.json"
    }
  ]
}
```

### Per-Screenshot Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lab` | string | Yes | Lab number (`"00"` through `"08"`, or `"06-ado"`, `"07-ado"`) |
| `name` | string | Yes | Output filename without extension (e.g., `lab-02-eslint-results`) |
| `phase` | number | Yes | Capture phase (1–4) |
| `method` | string | Yes | Capture method (see below) |
| `command` | string | Conditional | Shell command for `freeze-execute` method |
| `url` | string | Conditional | Target URL for `playwright-navigate` or `playwright-auth` |
| `script` | string | Conditional | Custom script path for `script` method |
| `storageState` | string | Conditional | Playwright auth state file for `playwright-auth` |

### Capture Methods

| Method | Description | Use Case |
|--------|-------------|----------|
| `freeze-execute` | Execute a CLI command and capture terminal output via Charm `freeze` | CLI tool output (linter results, scan summaries) |
| `playwright-navigate` | Navigate to a public URL and capture screenshot | Public web pages, GitHub repo pages |
| `playwright-auth` | Navigate to an authenticated URL using saved browser state | GitHub Security tab, ADO dashboards |
| `script` | Invoke a custom PowerShell or JavaScript script | Complex multi-step captures |

### Capture Phases

| Phase | Name | Requires | Description |
|-------|------|----------|-------------|
| 1 | Offline | Nothing | CLI tool output, local file screenshots |
| 2 | App-dependent | Deployed demo apps | Scan results against live apps |
| 3 | GitHub Web UI | GitHub authentication | Security tab, Actions, PR views |
| 4 | ADO Web UI | ADO authentication | ADO Advanced Security, Pipelines, Boards |

### Shared Module: screenshot-helpers.psm1

The shared PowerShell module provides reusable functions:

| Function | Purpose |
|----------|---------|
| `Invoke-CharmFreeze` | Execute command and capture with Charm `freeze` tool |
| `Invoke-PlaywrightCapture` | Navigate to URL and capture with Playwright |
| `Test-ShouldCapture` | Filter by lab, phase, and platform parameters |
| `New-LabDirectory` | Create lab image directory with README inventory |

## Power BI PBIP Template

Each domain produces a Power BI report in **PBIP format** (Git-friendly, text-based) with a star schema data model.

### Star Schema Pattern

| Table | Type | Description |
|-------|------|-------------|
| `Fact_{Domain}Findings` | Fact | One row per finding from scan results |
| `Repositories` | Shared Dimension | Repo metadata with `scan_domain` column for cross-domain linking |
| `ScanTools` | Dimension | Tool metadata (name, display name, version, category) |
| `Dim_Date` | Dimension | DAX-generated calendar table |
| Domain-specific dimensions | Dimension | Varies by domain (e.g., `Languages` for Code Quality, `WcagCriterion` for Accessibility) |

### Fact Table Columns

| Column | Type | Description |
|--------|------|-------------|
| `finding_id` | string | Unique finding identifier |
| `repo_name` | string | Source repository name |
| `rule_id` | string | Rule or check identifier |
| `severity` | string | CRITICAL, HIGH, MEDIUM, LOW |
| `tool_name` | string | Scanning tool that produced the finding |
| `scan_date` | date | Date of the scan |
| Domain-specific columns | varies | Additional columns per domain |

### Repositories Dimension (Shared)

The `Repositories` dimension table uses a `scan_domain` column to enable cross-domain reporting:

| Column | Type | Description |
|--------|------|-------------|
| `repo_name` | string | Repository name (primary key) |
| `org` | string | GitHub organization |
| `url` | string | Repository URL |
| `scan_domain` | string | Domain identifier (`Accessibility`, `FinOps`, `CodeQuality`) |

### TMDL File Structure

```text
definition/
├── database.tmdl          # Database metadata
├── model.tmdl             # Model configuration, culture, annotations
├── relationships.tmdl     # Table relationships
├── expressions.tmdl       # Power Query M expressions (data source)
└── tables/
    ├── Fact_{Domain}Findings.tmdl
    ├── Repositories.tmdl
    ├── ScanTools.tmdl
    ├── Dim_Date.tmdl
    └── {DomainDimension}.tmdl
```

### Data Source

All domain PBIPs connect to Azure Data Lake Storage Gen2 via OAuth (Organizational Account):

```text
Data Source: AzureStorage.DataLake()
Connection: https://{storageAccount}.dfs.core.windows.net/{container}
Authentication: OAuth (Organizational Account)
Path pattern: {yyyy}/{MM}/{dd}/{appId}-{tool}.json
```

### Deployment Scripts

| Script | Purpose |
|--------|---------|
| `power-bi/scripts/deploy.ps1` | Deploy PBIP to Power BI workspace using `FabricPS-PBIP` module |
| `power-bi/scripts/setup-parameters.ps1` | Configure data source parameters (storage account, container) |

## CI/CD Pipeline Templates

### GitHub Actions

| Workflow | Purpose | Strategy |
|----------|---------|----------|
| `{domain}-scan.yml` | Central scan across all demo apps | Matrix strategy: `{app: [001, 002, 003, 004, 005]}` |
| `{domain}-lint-gate.yml` | PR quality gate | Runs on `pull_request`, fails on severity ≥ HIGH |
| `deploy-all.yml` | Deploy all 5 demo apps to Azure | Matrix strategy with environment approvals |
| `teardown-all.yml` | Teardown all deployed resources | Manual trigger with approval gate |

**SARIF upload (GitHub):**

```yaml
- uses: github/codeql-action/upload-sarif@v4
  with:
    sarif_file: results.sarif
    category: "{domain}-scan/${{ matrix.app }}"
```

### Azure DevOps Pipelines

| Pipeline | Purpose |
|----------|---------|
| `{domain}-scan.yml` | Central scan across all demo apps |
| `{domain}-lint-gate.yml` | PR quality gate |
| `deploy-all.yml` | Deploy all demo apps |
| `teardown-all.yml` | Teardown with approval |
| `scan-and-store.yml` | Scan + upload results to ADLS Gen2 for Power BI |

**Pipeline templates:**

| Template | Purpose |
|----------|---------|
| `templates/deploy-app.yml` | Parameterized per-app deployment (Bicep + Docker) |
| `templates/teardown-app.yml` | Parameterized per-app teardown |

**Shared variables:** `variables/common.yml` with resource group, location, subscription, storage account.

**SARIF upload (ADO):**

```yaml
- task: AdvancedSecurity-Publish@1
  inputs:
    SarifFile: '$(Build.SourcesDirectory)/results.sarif'
```

## Sample App Specification

Each domain deploys **5 sample apps**, one per language/framework. Every app contains intentional violations that the domain scanner detects.

### App Structure

| Component | Required | Description |
|-----------|----------|-------------|
| `src/` | Yes | Application source with intentional domain violations |
| `infra/main.bicep` | Yes | Azure deployment infrastructure (App Service or Container App) |
| `Dockerfile` | Yes | Container build definition |
| `README.md` | Yes | App description and violation summary |

### Violation Density

Each app MUST produce a minimum of **15 findings** across all scanning tools to ensure meaningful scan results for workshop demonstrations.

### Language Distribution

Generate one app per language, varying the framework:

| App | Language | Typical Framework |
|-----|----------|-------------------|
| `{prefix}-demo-app-001` | TypeScript | Next.js, Express, or Fastify |
| `{prefix}-demo-app-002` | Python | Flask, FastAPI, or Django |
| `{prefix}-demo-app-003` | C# | ASP.NET Core |
| `{prefix}-demo-app-004` | Java | Spring Boot |
| `{prefix}-demo-app-005` | Go | net/http or Gin |

## Domain Parameterization

The scaffolder agent requires the following parameters to generate a new domain.

### Required Parameters

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `domain_name` | string | `code-quality` | Lowercase hyphenated domain identifier |
| `domain_display_name` | string | `Code Quality` | Title case display name |
| `domain_prefix` | string | `cq` | Short abbreviation for demo app directories |
| `tools` | object[] | See below | Array of scanning tool definitions |
| `sample_apps` | object[] | See below | Array of 5 app specifications |
| `pbip_pages` | object[] | See below | Array of report page definitions |
| `ado_org` | string | `MngEnvMCAP675646` | Azure DevOps organization |
| `ado_project` | string | `Agentic Accelerator Framework` | Azure DevOps project |

### Tool Definition Schema

```json
{
  "name": "eslint",
  "display_name": "ESLint",
  "category": "Linting",
  "native_sarif": true,
  "converter_script": null,
  "config_file": "eslint.config.mjs"
}
```

For tools without native SARIF support, set `native_sarif: false` and provide a `converter_script` path (e.g., `src/converters/lizard-to-sarif.py`).

### Sample App Schema

```json
{
  "index": "001",
  "language": "TypeScript",
  "framework": "Next.js",
  "violation_types": ["low-coverage", "high-complexity", "lint-errors", "duplication"]
}
```

### PBIP Page Schema

```json
{
  "page_id": "quality_overview",
  "title": "Quality Overview",
  "status": "IMPLEMENT",
  "visuals": ["stacked-bar", "kpi-cards", "slicers", "detail-table"]
}
```

## Cross-Repo Reference Map

Workshop labs reference specific files and features from the demo-app repo. The following map ensures generated workshops align with generated demo-apps.

| Workshop Lab | Demo App Dependency | Referenced Files |
|--------------|---------------------|------------------|
| lab-00 | None | Prerequisites only |
| lab-01 | Demo app source code | `{prefix}-demo-app-001/` through `005/` |
| lab-02 through lab-05 | Tool configurations, converters | `src/config/`, `src/converters/` |
| lab-06 (GitHub) | GitHub Actions workflows | `.github/workflows/{domain}-scan.yml` |
| lab-06 (ADO) | ADO pipelines | `.azuredevops/pipelines/{domain}-scan.yml` |
| lab-07 (GitHub) | Copilot agents, instructions | `.github/agents/`, `.github/instructions/` |
| lab-07 (ADO) | ADO pipelines, Advanced Security | `.azuredevops/pipelines/` |
| lab-08 | Power BI PBIP, scan-and-store | `power-bi/`, `scripts/scan-and-store.ps1` |
