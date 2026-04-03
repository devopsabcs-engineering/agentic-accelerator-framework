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
│   ├── .github/
│   │   └── workflows/
│   │       └── deploy.yml                       # Per-app deploy workflow
│   ├── src/
│   ├── infra/main.bicep
│   └── Dockerfile
├── {prefix}-demo-app-002/                       # Sample app 2
│   ├── .github/
│   │   └── workflows/
│   │       └── deploy.yml                       # Per-app deploy workflow
│   ├── src/
│   ├── infra/main.bicep
│   └── Dockerfile
├── {prefix}-demo-app-003/                       # Sample app 3
│   ├── .github/
│   │   └── workflows/
│   │       └── deploy.yml                       # Per-app deploy workflow
│   ├── src/
│   ├── infra/main.bicep
│   └── Dockerfile
├── {prefix}-demo-app-004/                       # Sample app 4
│   ├── .github/
│   │   └── workflows/
│   │       └── deploy.yml                       # Per-app deploy workflow
│   ├── src/
│   ├── infra/main.bicep
│   └── Dockerfile
├── {prefix}-demo-app-005/                       # Sample app 5
│   ├── .github/
│   │   └── workflows/
│   │       └── deploy.yml                       # Per-app deploy workflow
│   ├── src/
│   ├── infra/main.bicep
│   └── Dockerfile
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
├── _includes/
│   └── head-custom.html                         # Mermaid v11 ESM support
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

## Mermaid Support Template

Workshop repos use Jekyll's `head-custom.html` include to enable Mermaid diagrams on GitHub Pages.

### `_includes/head-custom.html`

```html
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true });
  document.querySelectorAll('pre > code.language-mermaid').forEach(el => {
    const div = document.createElement('div');
    div.className = 'mermaid';
    div.textContent = el.textContent;
    el.parentElement.replaceWith(div);
  });
</script>
<style>
  .mermaid { text-align: center; }
</style>
```

This script loads Mermaid v11 as an ES module and converts fenced code blocks with the `mermaid` language identifier into rendered diagrams.

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

### Idempotency Requirements

All bootstrap scripts MUST be idempotent. Every resource creation step MUST check for existing resources before creating. The following patterns are required:

#### GitHub Repo Creation Guard

```powershell
$repoCheck = gh repo view "$Org/$RepoName" --json name 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating repository $Org/$RepoName..." -ForegroundColor Green
    gh repo create "$Org/$RepoName" --public --description "$Description"
} else {
    Write-Host "Repository $Org/$RepoName already exists — skipping." -ForegroundColor Yellow
}
```

#### Content Push Guard

```powershell
$commitCount = gh api "repos/$Org/$RepoName/commits?per_page=1" --jq 'length' 2>$null
if ($commitCount -gt 0) {
    Write-Host "Repository $Org/$RepoName already has content — skipping push." -ForegroundColor Yellow
} else {
    # ... git init, add, commit, push ...
}
```

#### Azure AD App Registration Guard

```powershell
$existingApp = az ad app list --display-name $AppDisplayName --query "[0].appId" -o tsv
if ($existingApp) {
    Write-Host "App registration '$AppDisplayName' already exists (appId: $existingApp)." -ForegroundColor Yellow
    $appId = $existingApp
} else {
    $appId = az ad app create --display-name $AppDisplayName --query appId -o tsv
}
```

#### Federated Credential Guard

```powershell
$existingCreds = az ad app federated-credential list --id $appId --query "[].name" -o tsv
if ($existingCreds -contains $credName) {
    Write-Host "Federated credential '$credName' already exists — skipping." -ForegroundColor Yellow
} else {
    az ad app federated-credential create --id $appId --parameters $credParams
}
```

#### Service Principal Guard

```powershell
$existingSp = az ad sp list --filter "appId eq '$appId'" --query "[0].id" -o tsv
if ($existingSp) {
    Write-Host "Service principal already exists for appId $appId." -ForegroundColor Yellow
    $spId = $existingSp
} else {
    $spId = az ad sp create --id $appId --query id -o tsv
}
```

#### Role Assignment Guard

```powershell
$existingRole = az role assignment list --assignee $spId --role $RoleName --scope $scope --query "[0]" -o tsv
if ($existingRole) {
    Write-Host "Role '$RoleName' already assigned — skipping." -ForegroundColor Yellow
} else {
    az role assignment create --assignee $spId --role $RoleName --scope $scope
}
```

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
| `workingDir` | string | No | Working directory override. Set to `"demo-app"` for commands that must run inside the sibling `{domain}-scan-demo-app` directory. The capture script resolves this to the actual sibling path. |

#### workingDir Example

```json
{
  "lab": "02",
  "name": "lab-02-lint-results",
  "phase": 1,
  "method": "freeze-execute",
  "command": "npx eslint src/ --format stylish | Select-Object -First 40",
  "workingDir": "demo-app"
}
```

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

### Platform Requirements

All `command` values in screenshot manifest entries MUST use PowerShell Core syntax. The following Unix commands are forbidden:

| Forbidden | Replacement |
|-----------|-------------|
| `head -n N` | `Select-Object -First N` |
| `tail -n N` | `Select-Object -Last N` |
| `cat file` | `Get-Content file` |
| `2>/dev/null` | `2>$null` |
| `/tmp/` | `$env:TEMP` |
| `./script` | `.\script` |

### PATH Forwarding

Capture scripts MUST forward the current `$env:PATH` to child processes to ensure tools installed via `pip install --user` (Python Scripts directory) are available:

```powershell
$env:PATH = "$env:USERPROFILE\AppData\Local\Programs\Python\Python312\Scripts;$env:PATH"
```

The capture script SHOULD also accept a `-DemoAppDir` parameter to explicitly specify the sibling demo-app directory path.

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

## Individual Demo App Deploy Workflow Template

Each individual demo app repository (`{prefix}-demo-app-NNN`) includes a `.github/workflows/deploy.yml` that deploys the app to Azure App Service.

### Base Template

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

env:
  AZURE_RG: rg-{prefix}-demo-{NNN}
  APP_NAME: {prefix}-demo-app-{NNN}
  LOCATION: canadacentral

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Create Resource Group
        run: az group create --name ${{ env.AZURE_RG }} --location ${{ env.LOCATION }}

      - name: Deploy Infrastructure
        run: |
          az deployment group create \
            --resource-group ${{ env.AZURE_RG }} \
            --template-file infra/main.bicep \
            --parameters appName=${{ env.APP_NAME }}

      # Language-specific build step — see variants below

      - name: Deploy to App Service
        uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ env.APP_NAME }}
          # package or images parameter per language

      - name: Health Check
        run: |
          APP_URL=$(az webapp show -g ${{ env.AZURE_RG }} -n ${{ env.APP_NAME }} --query defaultHostName -o tsv)
          curl -sf "https://$APP_URL" || exit 1

      - name: Summary
        run: |
          APP_URL=$(az webapp show -g ${{ env.AZURE_RG }} -n ${{ env.APP_NAME }} --query defaultHostName -o tsv)
          echo "### ✅ ${{ env.APP_NAME }}" >> $GITHUB_STEP_SUMMARY
          echo "Deployed to: https://$APP_URL" >> $GITHUB_STEP_SUMMARY
```

### Language-Specific Build Steps

#### C# (.NET)

```yaml
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0'
      - name: Build
        run: dotnet publish -c Release -o ./publish
```

#### Python

```yaml
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install Dependencies
        run: pip install -r requirements.txt
```

#### Java (Gradle)

```yaml
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'
      - name: Build
        run: ./gradlew build
```

#### TypeScript (Node.js)

```yaml
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install and Build
        run: |
          npm ci
          npm run build
```

#### Go

```yaml
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      - name: Build
        run: go build -o ./app .
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

## ESLint Configuration Template

JavaScript and TypeScript demo apps MUST include an `eslint.config.mjs` file using the flat config format (ESLint v9+).

### Base Template (`eslint.config.mjs`)

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends(
    // Add framework-specific extends here
    "plugin:@typescript-eslint/recommended"
  ),
  {
    rules: {
      // Intentional violations for scanner findings
      "prefer-const": "warn",
    },
  },
];

export default eslintConfig;
```

### Framework-Specific Extensions

| Framework | Additional Extends |
|-----------|-------------------|
| Next.js | `"next/core-web-vitals"` |
| Express | (none — base config sufficient) |
| Fastify | (none — base config sufficient) |

### Required Dependencies

```json
{
  "devDependencies": {
    "eslint": "^9.0.0",
    "@eslint/eslintrc": "^3.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0"
  }
}
```

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

## Lab Markdown Template

Every generated lab README MUST follow this template structure:

````markdown
---
permalink: /labs/lab-{NN}-{slug}/
title: "Lab {NN}: {Title}"
description: "{One-sentence description}"
---

# Lab {NN}: {Title}

| Duration | Level | Prerequisites |
|----------|-------|---------------|
| {NN} min | {Beginner/Intermediate/Advanced} | {Lab NN-1 or None} |

## Learning Objectives

- {Objective 1}
- {Objective 2}
- {Objective 3}

## Prerequisites

- {Prerequisite 1}
- {Prerequisite 2}

## Exercises

### Exercise 1: {Title}

> **Working Directory**: Run the following commands from the `{domain}-scan-demo-app` repository root.

{Step instructions}

```powershell
{command}
```

![{Step description}](../images/lab-{NN}/lab-{NN}-{step-slug}.png)

### Exercise 2: {Title}

{Step instructions}

![{Step description}](../images/lab-{NN}/lab-{NN}-{step-slug}.png)

## Verification Checkpoint

Verify your work before continuing:

- [ ] {Verification item 1}
- [ ] {Verification item 2}

## Summary

{Key takeaways}

## Next Steps

Proceed to [Lab {NN+1}: {Next Title}](../lab-{NN+1}-{next-slug}/).
````

## Repository Configuration Checklist

After content is pushed, configure these repository-level settings via bootstrap scripts or manual setup.

### Demo App Repository

| Setting | Command | Required |
|---------|---------|----------|
| Description | `gh repo edit "$Org/$Repo" --description "$Desc"` | Yes |
| Topics | `gh repo edit "$Org/$Repo" --add-topic $topic` (loop) | Yes |
| Code scanning | `gh api repos/$Org/$Repo/code-scanning/default-setup -X PATCH -f state=configured` | Yes |
| Environments | `gh api repos/$Org/$Repo/environments/production --method PUT` | Yes |

### Workshop Repository

| Setting | Command | Required |
|---------|---------|----------|
| Description | `gh repo edit "$Org/$Repo" --description "$Desc"` | Yes |
| Topics | `gh repo edit "$Org/$Repo" --add-topic $topic` (loop) | Yes |
| Template flag | `gh repo edit "$Org/$Repo" --template` | Yes |
| GitHub Pages | `gh api "repos/$Org/$Repo/pages" --method POST -f source='{"branch":"main","path":"/"}'` | Yes |
| Website URL | `gh repo edit "$Org/$Repo" --homepage "https://$Org.github.io/$Repo"` | Yes |

### Individual Demo App Repositories

| Setting | Command | Required |
|---------|---------|----------|
| Description | `gh repo edit "$Org/$Repo" --description "$Desc"` | Yes |
| Topics | `gh repo edit "$Org/$Repo" --add-topic $topic` (loop) | Yes |
| Secrets | `gh secret set AZURE_CLIENT_ID --body $clientId -R "$Org/$Repo"` | Yes |
| Environments | `gh api repos/$Org/$Repo/environments/production --method PUT` | Yes |

### Resource Group Strategy

Recommended: Use separate resource groups per demo app for isolation:

```text
rg-{prefix}-demo-001
rg-{prefix}-demo-002
...
rg-{prefix}-demo-005
```

This enables independent teardown and cost tracking per app.

## DevContainer Template Updates

The workshop DevContainer's `post-create.sh` MUST automatically set up the scanner demo-app as a sibling directory for workshop participants.

### post-create.sh Template

```bash
#!/bin/bash
set -e

DOMAIN="{domain}"
SCANNER_REPO="{domain}-scan-demo-app"
ORG="devopsabcs-engineering"

# Fork and clone scanner repo as sibling
if [ ! -d "../$SCANNER_REPO" ]; then
  echo "Forking $ORG/$SCANNER_REPO..."
  gh repo fork "$ORG/$SCANNER_REPO" --clone -- "../$SCANNER_REPO" 2>/dev/null || \
    git clone "https://github.com/$ORG/$SCANNER_REPO.git" "../$SCANNER_REPO"
fi

# Install domain-specific tools
# {domain-specific installations here}
```

The script uses `gh repo fork` with a fallback to `git clone` for environments without GitHub CLI authentication.
