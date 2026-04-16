# Domain Parity and Contribution Guide

This document compares the feature parity across the Accessibility, Code Quality, and FinOps domains and provides a step-by-step guide for contributing a new domain to the Agentic Accelerator Framework.

## Two-Repo Pattern

Each domain in the framework follows a consistent **two-repo pattern**:

| Repo | Purpose | Contains |
|------|---------|----------|
| `{domain}-scan-demo-app` | Centralized scanner platform and demo app hub | Scanner engine, 5 sample apps, GHCP artifacts, bootstrap scripts, CI/CD pipelines, SARIF integration |
| `{domain}-scan-workshop` | Hands-on workshop content | 8 labs (Lab 00–07), screenshot scripts, GitHub Pages site, dev container, contributing guide |

The demo-app repo owns all scanning logic, Copilot artifacts, and infrastructure. The workshop repo is a GitHub template repository that teaches practitioners how to use the scanner through progressive hands-on labs.

```text
{domain}-scan-demo-app/
├── .github/
│   ├── agents/           ← Custom GHCP agent definitions
│   ├── instructions/     ← Path-specific instruction files
│   ├── prompts/          ← Reusable prompt templates
│   ├── skills/           ← Domain knowledge packages
│   └── workflows/        ← GitHub Actions pipelines
├── .azuredevops/
│   └── pipelines/        ← Azure DevOps YAML pipelines + templates
├── {domain}-demo-app-001/ through 005/
│   ├── infra/main.bicep  ← Azure infrastructure
│   ├── src/              ← App source with intentional violations
│   └── README.md
├── src/                  ← Scanner engine (or converters)
├── scripts/
│   ├── bootstrap-demo-apps.ps1
│   ├── bootstrap-demo-apps-ado.ps1  ← ADO project provisioning
│   ├── setup-oidc.ps1
│   ├── setup-oidc-ado.ps1           ← ADO WIF federation
│   └── scan-and-store.ps1           ← Transform scan results for Power BI
├── power-bi/                 ← Domain-specific Power BI PBIP (or {domain}-pbi-report/)
└── docs/                 ← Power BI integration docs

{domain}-scan-workshop/
├── .devcontainer/        ← Dev container with prerequisites
├── labs/
│   ├── lab-00-setup.md   ← Prerequisites and environment setup
│   ├── lab-01.md         ← Explore demo apps and violations
│   ├── lab-02.md through lab-05.md  ← Tool-specific labs
│   ├── lab-06.md         ← SARIF output and Security tab
│   └── lab-07.md         ← GitHub Actions pipelines
├── scripts/
│   └── capture-screenshots.ps1
├── images/lab-00/ through lab-07/
├── index.md              ← GitHub Pages landing page
├── CONTRIBUTING.md       ← Lab authoring style guide
└── _config.yml           ← Jekyll configuration
```

## Feature Parity Comparison

### Demo App Repos

| Feature | Accessibility (`accessibility-scan-demo-app`) | Code Quality (`code-quality-scan-demo-app`) | FinOps (`finops-scan-demo-app`) |
|---------|-----------------------------------------------|----------------------------------------------|----------------------------------|
| **Sample apps** | 5 web apps (Rust, C#, Java, Python, Go) with 15+ WCAG violations each | 5 apps (TypeScript, Python, C#, Java, Go) with 15+ quality violations each (complexity, coverage, duplication, lint) | 5 IaC apps (Bicep + HTML) with cost governance violations |
| **Centralized scanner** | Full-stack Next.js 15 app (Web UI, REST API, CLI, GitHub Action) | MegaLinter multi-language orchestrator with 4-tool architecture | Central `finops-scan.yml` workflow with matrix strategy |
| **Scanner deployment** | Azure App Service (Docker container) | GitHub Actions CI workflow (no deployed scanner app) | GitHub Actions only (no deployed scanner app) |
| **Open source tools** | axe-core 4.11, IBM Equal Access 4.0 | MegaLinter (ESLint, Ruff, golangci-lint, .NET Analyzers), jscpd, Lizard, Jest, pytest-cov, JaCoCo, Go cover | PSRule for Azure, Checkov, Cloud Custodian, Infracost |
| **Custom tools** | 5 custom Playwright checks, CLI, SARIF generator, scoring engine, PDF/HTML reports | 2 Python SARIF converters (`lizard-to-sarif.py`, `coverage-to-sarif.py`), MegaLinter config, jscpd config | 2 Python SARIF converters, 4 Cloud Custodian policies |
| **SARIF generation** | Native (built-in SARIF v2.1.0 generator) | Mixed: ESLint, Ruff, golangci-lint, .NET Analyzers, jscpd native SARIF; Lizard and Coverage via 2 Python converters | Mixed: PSRule and Checkov native; Cloud Custodian and Infracost via 2 Python converters |
| **SARIF upload** | `codeql-action/upload-sarif@v4` (same-repo) | `codeql-action/upload-sarif@v4` (same-repo) | Cross-repo upload via GitHub REST API (`gh api`) |
| **Copilot agents** | 2 (a11y-detector, a11y-resolver) | 2 (CodeQualityDetector, CodeQualityResolver) | 5 (CostAnalysis, FinOpsGovernance, CostAnomalyDetector, CostOptimizer, DeploymentCostGate) |
| **Copilot prompts** | 2 (a11y-scan, a11y-fix) | 2 (code-quality-scan, code-quality-fix) | 2 (finops-scan, finops-fix) |
| **Copilot instructions** | 3 (wcag22-rules, a11y-remediation, ado-workflow) | 2 (code-quality, ado-workflow) | 2 (finops-governance, ado-workflow) |
| **Copilot skills** | 0 | 1 (code-quality-scan) | 1 (finops-scan) |
| **Bootstrap script** | `bootstrap-demo-apps.ps1` + `bootstrap-demo-apps-ado.ps1` — creates repos, OIDC, secrets (GitHub + ADO) | `bootstrap-demo-apps.ps1` + `bootstrap-demo-apps-ado.ps1` — creates repos, OIDC, secrets (GitHub + ADO) | `bootstrap-demo-apps.ps1` + `bootstrap-demo-apps-ado.ps1` — creates repos, OIDC, secrets, Infracost key (GitHub + ADO) |
| **OIDC setup script** | `setup-oidc.ps1` + `setup-oidc-ado.ps1` — Azure AD federation for GitHub Actions + ADO Pipelines | `setup-oidc.ps1` + `setup-oidc-ado.ps1` — Azure AD federation for GitHub Actions + ADO Pipelines | `setup-oidc.ps1` + `setup-oidc-ado.ps1` — Azure AD federation for 6 repos (GitHub + ADO) |
| **ADO bootstrap script** | `bootstrap-demo-apps-ado.ps1` — ADO project provisioning, repos, WIF | `bootstrap-demo-apps-ado.ps1` — ADO project provisioning, repos, WIF | `bootstrap-demo-apps-ado.ps1` — ADO project provisioning, repos, WIF |
| **Scan-and-store script** | `scan-and-store.ps1` — weekly scan to Azure Blob for Power BI | `scan-and-store.ps1` — weekly scan to Azure Blob for Power BI | `scan-and-store.ps1` — weekly SARIF to Azure Blob for Power BI |
| **Power BI PBIP** | `a11y-pbi-report/A11yReport.pbip` (1 page, 7 dimensions) | `power-bi/CodeQualityReport.pbip` (4 pages planned) | `power-bi/FinOpsReport.pbip` (1 page, 5 dimensions) |
| **GitHub Actions** | 5 workflows (ci, deploy, a11y-scan, deploy-all, scan-all) | 4 workflows (code-quality-scan, code-quality-lint-gate, deploy-all, teardown-all) | 4 workflows (finops-scan, finops-cost-gate, deploy-all, teardown-all) |
| **Azure DevOps pipelines** | 10 pipelines + 5 templates (ci, ci-cd, deploy, deploy-all, a11y-scan, a11y-scan-advancedsecurity, adv-sec-scan, scan-all, scan-and-store + 5 templates) | 5 pipelines + 4 templates (code-quality-scan, code-quality-lint-gate, deploy-all, scan-and-store, teardown-all + app-repo-scan, deploy-app, scan-app, teardown-app templates) | 5 pipelines + 2 templates (finops-scan, finops-cost-gate, deploy-all, teardown-all, scan-and-store + 2 templates) |
| **Power BI docs** | PBIP implemented (`a11y-pbi-report/A11yReport.pbip`) + deployment scripts | 3 docs (code-quality-scan-overview, power-bi-data-model, workshop-setup) | 5 docs (data model, dashboard design, Power Query M, Resource Graph, FinOps Toolkit) |
| **Primary language** | TypeScript 81.8% | Polyglot: TypeScript, Python, C#, Java, Go (5 languages across 5 demo apps) | PowerShell 59.8%, Bicep 16.4%, Python 13.6%, HCL 5.8%, HTML 4.1% |

### Workshop Repos

| Feature | Accessibility (`accessibility-scan-workshop`) | Code Quality (`code-quality-scan-workshop`) | FinOps (`finops-scan-workshop`) |
|---------|------------------------------------------------|----------------------------------------------|----------------------------------|
| **Labs** | 8 labs (Lab 00–07) | 9 labs (Lab 00–08, includes dashboard lab) | 8 labs (Lab 00–07) |
| **Platform-specific labs** | GitHub + ADO (Lab 06-github, Lab 06-ado, Lab 07-github, Lab 07-ado) | GitHub + ADO (Lab 06-github, Lab 06-ado, Lab 07-github, Lab 07-ado) | GitHub + ADO (Lab 06-github, Lab 06-ado, Lab 07-github, Lab 07-ado) |
| **Full-day duration** | ~6.5 hours | ~6.5 hours | ~7.25 hours |
| **Half-day duration** | ~3 hours (Labs 00, 01, 02, 03, 05) | ~3 hours (Labs 00, 01, 02, 03, 06) | ~3.5 hours (Labs 00, 01, 02, 03, 06) |
| **Delivery tiers** | 5 tiers (half-day GH, half-day ADO, full-day GH, full-day ADO, full-day dual) | 5 tiers (half-day GH, half-day ADO, full-day GH, full-day ADO, full-day dual) | 5 tiers (half-day GH, half-day ADO, full-day GH, full-day ADO, full-day dual) |
| **Workshop agent** | Yes (workshop-specific agent in `.github/agents/`) | Not yet implemented | No |
| **Copilot artifacts** | Workshop agent + governance instructions | Not yet implemented | None |
| **Screenshot script** | `capture-screenshots.ps1` (~900+ lines, 47 PNGs, 3 phases) | `capture-screenshots.ps1` (manifest-driven, ~125 lines + `screenshot-manifest.json`, 57 PNGs) | `capture-screenshots.ps1` (~710+ lines, 46 PNGs) |
| **Playwright helpers** | `playwright-helpers.js` (screenshot, scan, auth-screenshot) | `playwright-helpers.js` + `screenshot-helpers.psm1` (PowerShell module) | Not present |
| **Dev container** | Yes (Node.js 20 + Charm freeze) | Yes | Yes |
| **GitHub Pages** | Yes (Jekyll) | Yes (Jekyll) | Yes (Jekyll) |
| **Template repo** | Yes | Yes | Yes |
| **Contributing guide** | Yes (lab authoring style guide) | Yes (lab authoring style guide) | Yes (lab authoring style guide) |
| **License** | MIT | MIT | MIT |

The Accessibility workshop includes a workshop-specific Copilot agent that provides guided assistance during lab exercises, along with governance instructions that enforce coding standards within the workshop codebase. The FinOps workshop does not have equivalent Copilot artifacts. Adding a workshop agent and governance instructions to the FinOps workshop would bring AI-assisted lab guidance to parity. See [Gaps Identified](#gaps-identified) for remediation details.

#### Screenshot Script Comparison

All three domain workshops include automated screenshot capture scripts:

| Capability | Accessibility Workshop | Code Quality Workshop | FinOps Workshop |
|------------|----------------------|----------------------|------------------|
| Script size | ~900+ lines | ~125 lines + manifest | ~710+ lines |
| Target screenshots | 47 PNGs | 57 PNGs | 46 PNGs |
| Architecture | 3-phase (offline, app-dependent, GitHub web UI) | Manifest-driven (`screenshot-manifest.json`) | Multi-phase |
| Charm freeze support | Yes | Yes | Yes |
| Playwright helpers | Separate `playwright-helpers.js` with 3 functions | `playwright-helpers.js` + `screenshot-helpers.psm1` | Inline Playwright usage |
| Lab and phase filtering | Yes | Yes (via manifest) | Yes |
| Theme and font customization | Yes | Yes | Yes |
| Environment modes | local/azure | local/azure | local/azure |

New domains should follow this pattern and create a `capture-screenshots.ps1` script covering all labs, with phase filtering and both local and Azure environment support. The Code Quality workshop introduces a manifest-driven approach (`screenshot-manifest.json`) that separates screenshot definitions from execution logic.

### Power BI Report (`advsec-pbi-report-ado`)

| Aspect | Current State | Gap |
|--------|---------------|-----|
| **Security pages** | 3 pages (Overview, Alerts by Type, Trend Analysis) — centralized repo returns HTTP 404, status unverifiable | Status unknown |
| **Accessibility pages** | Per-domain PBIP: `A11yReport.pbip` (1 page: accessibility_compliance) | Need 4 additional pages per spec (5 total) |
| **FinOps pages** | Per-domain PBIP: `FinOpsReport.pbip` (1 page: finops_compliance) | Need 5 additional pages per spec (6 total) |
| **Code Quality pages** | Per-domain PBIP: `CodeQualityReport.pbip` (4 pages planned: Quality Overview, Coverage by Repository, Complexity Analysis, Test Generation Tracking) | Need implementation of planned pages |
| **Data source** | Accessibility: Azure Blob Storage (`a11yscan7yt3mwgxp3wiy`); FinOps: Azure Blob Storage (`finopsscanstore2497`) | Per-domain Blob Storage replaces centralized ADO REST API |
| **Format** | PBIP per domain (code-based, Git-friendly) | Transition from centralized to per-domain is complete for A11y, Code Quality, and FinOps |

The transition from a single centralized report to per-domain PBIPs is underway. The centralized `advsec-pbi-report-ado` repository returns HTTP 404 and may no longer be available. All three domains (Accessibility, Code Quality, and FinOps) now own their PBIPs in their respective demo-app repositories, sourcing data from Azure Blob Storage rather than the originally specified ADLS Gen 2 + OAuth2.

#### Three-Tier Dashboard Architecture

The Power BI reporting strategy follows a three-tier architecture:

1. **Centralized AdvSec Report** (`advsec-pbi-report-ado`) — Security-focused dashboard powered by the ADO Advanced Security REST API, with 3 pages (Security Overview, Alerts by Type, Trend Analysis) and a star schema built on `Fact_SecurityAlerts` + 5 dimension tables.
2. **Per-domain PBIPs** — Each domain owns its PBIP in its demo-app repository:
   * Accessibility: `a11y-pbi-report/A11yReport.pbip` (star schema, Azure Blob Storage)
   * Code Quality: `power-bi/CodeQualityReport.pbip` (4 pages planned)
   * FinOps: `power-bi/FinOpsReport.pbip` (star schema, Azure Blob Storage)
3. **Holistic view** — The centralized AdvSec report provides the Advanced Security findings view, while the 3 domain dashboards (Accessibility, Code Quality, FinOps) provide domain-specific deep dives. Together they offer a holistic view across all scanning domains.

| Aspect | Current (Centralized) | Target (Per-Domain PBIP) | Realized State |
|--------|----------------------|-------------------------|----------------|
| **Ownership** | Single `advsec-pbi-report-ado` repo (returns 404) | Each `{domain}-scan-demo-app/power-bi/` | A11y: `a11y-pbi-report/`, FinOps: `power-bi/` |
| **Data source** | ADO Advanced Security REST API | ADLS Gen 2 + OAuth2 (Organizational Account) | Azure Blob Storage + SAS token / Entra ID |
| **Schema** | Flat query results | Star schema: `Fact_Findings` + 6 dimension tables | Star schema implemented (both domains) |
| **Format** | PBIP (centralized) | PBIP per domain (code-based, Git-friendly) | PBIP per domain (both domains) |

See [Desired Features to Compare](#desired-features-to-compare) for full architecture details.

### ADO First-Class Citizen Status

Making Azure DevOps a first-class citizen means every GitHub Actions workflow has an equivalent ADO YAML pipeline, every workshop includes ADO-specific labs, each domain owns a Power BI PBIP, and SARIF results flow to storage. The target architecture specifies ADLS Gen 2; the current implementation uses Azure Blob Storage via scan-and-store pipelines. Current status across all parity dimensions:

| Domain | GH Actions | ADO Pipelines | ADO Workshop Labs | GH Workshop Labs | PBIP | SARIF → Storage |
|--------|-----------|---------------|-------------------|------------------|------|----------------|
| **Security** | `security-scan.yml` | `security-pipeline.yml` (sample) | No | Yes | Partial (3 pages) — repo returns 404, status unknown | No |
| **Accessibility** | `accessibility-scan.yml` (5 workflows) | 10 pipelines + 5 templates | Yes | Yes | Yes (`A11yReport.pbip`, 1 page) | Yes (scan-and-store → Azure Blob) |
| **Code Quality** | `code-quality-scan.yml` (4 workflows) | 5 pipelines + 4 templates | Yes | Yes | Yes (`CodeQualityReport.pbip`, 4 pages planned) | Yes (scan-and-store → Azure Blob) |
| **FinOps** | `finops-scan.yml`, `finops-cost-gate.yml` | 5 pipelines + 2 templates | Yes | Yes | Yes (`FinOpsReport.pbip`, 1 page) | Yes (scan-and-store → Azure Blob) |
| **APM Security** | `apm-security.yml` | Inline pattern in docs | No | No | No | No |

## Desired Features to Compare

Three feature areas remain before the framework achieves full domain parity: dual-platform workshops that cover both GitHub and ADO, consistent feature parity between ADO and GitHub across every domain, and domain-specific Power BI PBIPs (target: ADLS Gen 2; current: Azure Blob Storage). Each area is documented below with implementation patterns, target architecture, and domain-specific details.

### Dual-Platform Workshops (GitHub + ADO)

Each domain keeps one `{domain}-scan-workshop` repo with suffixed lab files for platform-specific content. Labs 00 through 05 are platform-agnostic and cover tool exploration, scanning, and SARIF fundamentals. Labs 06 and 07 have GitHub and ADO variants that teach platform-specific SARIF upload and CI/CD pipeline authoring.

```text
{domain}-scan-workshop/
├── labs/
│   ├── lab-00-setup.md                    ← Platform-agnostic (30 min)
│   ├── lab-01-explore-violations.md       ← Platform-agnostic (25 min)
│   ├── lab-02-{tool-1}.md                 ← Platform-agnostic (35 min)
│   ├── lab-03-{tool-2}.md                 ← Platform-agnostic (30 min)
│   ├── lab-04-{tool-3}.md                 ← Platform-agnostic (35 min)
│   ├── lab-05-{tool-4}.md                 ← Platform-agnostic (30 min)
│   ├── lab-06-github-sarif-security.md    ← GitHub Security Tab (30 min)
│   ├── lab-06-ado-sarif-advsec.md         ← ADO Advanced Security (35 min)
│   ├── lab-07-github-actions.md           ← GitHub Actions (45 min)
│   └── lab-07-ado-pipelines.md            ← ADO YAML Pipelines (50 min)
```

#### Delivery Tiers

| Tier | Platform | Labs | Duration |
|------|----------|------|----------|
| Half-day (GitHub) | GitHub | 00, 01, 02, 03, 06-github | ~3 hours |
| Half-day (ADO) | ADO | 00, 01, 02, 03, 06-ado | ~3 hours |
| Full-day (GitHub) | GitHub | 00–05, 06-github, 07-github | ~6.5 hours |
| Full-day (ADO) | ADO | 00–05, 06-ado, 07-ado | ~7 hours |
| Full-day (Dual) | Both | 00–05, 06-github, 06-ado, 07-github, 07-ado | ~8.5 hours |

#### Lab 06-ado: ADO Advanced Security (35 min)

- Review SARIF output from earlier labs
- Enable GHAzDO at project and repo level
- Create a minimal ADO YAML pipeline with `AdvancedSecurity-Publish@1`
- Run the pipeline and observe execution
- View findings in the ADO Advanced Security Overview
- Compare with the GitHub Security Tab

#### Lab 07-ado: ADO YAML Pipelines (50 min)

- ADO YAML pipeline basics (trigger, pr, pool, stages/jobs/steps)
- Multi-stage scan pipeline
- Variable groups for centralized configuration
- Schedule triggers with cron
- Environment approvals and deployment gates
- Pipeline templates for reuse
- `AB#` work item linking

Labs 00 through 05 represent roughly 80% of workshop content and are fully platform-agnostic. The single-repo approach with suffixed lab files avoids duplicating content across 10 additional repositories while still supporting independent GitHub and ADO delivery tracks.

### ADO vs GitHub Feature Parity

#### Per-Domain Parity Matrix (Current State)

| Domain | GH Workflows | ADO Pipelines (demo-app) | ADO Pipeline (framework sample) | GH Workshop Labs | ADO Workshop Labs | GH SARIF Upload | ADO SARIF Upload | PBIP |
|--------|--------------|--------------------------|--------------------------------|------------------|-------------------|-----------------|------------------|------|
| Security | Yes | N/A | Yes | Yes | No | Yes | Yes | Partial (3 pages) — repo returns 404, status unknown |
| Accessibility | Yes (5) | Yes (10 + 5 templates) | Yes | Yes | Yes | Yes | Yes | Yes (1 page) |
| Code Quality | Yes (4) | Yes (5 + 4 templates) | Yes | Yes | Yes | Yes | Yes | Yes (`CodeQualityReport.pbip`, 4 pages planned) |
| FinOps | Yes (2) | Yes (5 + 2 templates) | No | Yes | Yes | Yes | No | Yes (1 page) |

#### Target State Mapping

| Artifact | GitHub | ADO | Realized State |
|----------|--------|-----|----------------|
| CI/CD pipelines | GitHub Actions workflows | ADO YAML pipelines | |
| SARIF upload | `codeql-action/upload-sarif@v4` | `AdvancedSecurity-Publish@1` | |
| Security dashboard | GitHub Security Tab | ADO Advanced Security Overview | |
| Workshop Lab 06 | `lab-06-github-sarif-security.md` | `lab-06-ado-sarif-advsec.md` | |
| Workshop Lab 07 | `lab-07-github-actions.md` | `lab-07-ado-pipelines.md` | |
| Bootstrap scripts | `bootstrap-demo-apps.ps1` | `bootstrap-ado-projects.ps1` | `bootstrap-demo-apps-ado.ps1` (ADO provisioning) |
| SARIF to data lake | GH Actions → ADLS Gen 2 | ADO pipeline → ADLS Gen 2 | Both platforms → Azure Blob Storage via `scan-and-store.ps1` |
| Power BI PBIP | ADLS Gen 2 + OAuth2 | ADLS Gen 2 + OAuth2 (same) | Azure Blob Storage + SAS token / Entra ID |

See [docs/azure-devops-pipelines.md](azure-devops-pipelines.md) for the full GHAzDO task mapping between GitHub Actions and ADO YAML pipeline tasks.

### Domain-Specific Power BI PBIP with ADLS Gen 2 + OAuth2

Each domain's demo-app repo owns a PBIP with a star schema semantic model. The target architecture specifies ADLS Gen 2 via OAuth2 (Organizational Account); the current implementations use Azure Blob Storage with SAS tokens for Power BI connectivity and Entra ID for pipeline uploads.

#### PBIP Folder Structure

```text
{domain}-scan-demo-app/
└── power-bi/
    ├── {Domain}Alerts.pbip
    ├── {Domain}Alerts.Report/
    │   ├── .platform
    │   ├── definition.pbir
    │   └── definition/
    │       ├── report.json
    │       ├── version.json
    │       └── pages/
    │           ├── pages.json
    │           ├── overview/
    │           └── {domain-specific-pages}/
    └── {Domain}Alerts.SemanticModel/
        ├── .platform
        ├── definition.pbism
        └── definition/
            ├── database.tmdl
            ├── model.tmdl
            ├── relationships.tmdl
            ├── expressions.tmdl
            └── tables/
                ├── Fact_Findings.tmdl
                ├── Dim_Date.tmdl
                ├── Dim_Severity.tmdl
                ├── Dim_Tool.tmdl
                ├── Dim_Rule.tmdl
                └── Dim_Repository.tmdl
```

##### Actual Implementations

**Accessibility** (`a11y-pbi-report/` — deviates from `power-bi/` convention):

* PBIP file: `A11yReport.pbip` (instead of `{Domain}Alerts.pbip`)
* Fact table: `Fact_A11yViolations` (instead of `Fact_Findings`)
* Dimensions: 7 domain-specific (Dim_Date, Dim_Engine, Dim_Impact, Dim_Principle, Dim_Site, Dim_State, Dim_WcagCriterion)
* Report pages: 1 (`accessibility_compliance`) — spec calls for 5
* Deployment scripts: `scripts/deploy.ps1`, `scripts/setup-parameters.ps1` (uses FabricPS-PBIP module)
* Data source: Azure Blob Storage (`a11yscan7yt3mwgxp3wiy/a11y-scan-results`)

**FinOps** (`power-bi/` — follows convention):

* PBIP file: `FinOpsReport.pbip`
* Fact table: `Fact_FinOpsFindings` (instead of `Fact_Findings`)
* Dimensions: 5 generic (Dim_Date, Dim_Repository, Dim_Rule, Dim_Severity, Dim_Tool)
* Report pages: 1 (`finops_compliance`) — spec calls for 6
* Deployment scripts: None
* Data source: Azure Blob Storage (`finopsscanstore2497/finops-scan-results`)

#### Data Flow

```text
Target Data Flow:
  CI/CD Pipelines (GH Actions / ADO YAML)
    → Scan tools produce SARIF v2.1.0
    → Upload SARIF to ADLS Gen 2 (az storage blob upload-batch --auth-mode login)
    → ADLS Gen 2 (sarif-results/{domain}/{org}/{repo}/{date}/*.sarif)
    → Power BI PBIP connects via AzureStorage.DataLake() + OAuth2
    → Power Query M parses SARIF JSON → star schema
    → Domain-specific report pages

Realized Data Flow (Accessibility, Code Quality, and FinOps):
  CI/CD Pipelines (GH Actions / ADO YAML)
    → Scan tools produce results (SARIF, JSON, or tool-native output)
    → scan-and-store.ps1 transforms results to fact table JSON
    → Upload JSON to Azure Blob Storage (az storage blob upload --auth-mode login)
    → Azure Blob Storage ({storageaccount}/{container}/{yyyy/MM/dd}/{key}.json)
    → Power BI PBIP connects via AzureBlobStorage() + SAS token
    → Power Query M parses JSON → star schema
    → Domain-specific report pages
```

#### ADLS Gen 2 Container Layout

```text
sarif-results/
  accessibility/{org}/{repo}/{date}/
  finops/{org}/{repo}/{date}/
  security/{org}/{repo}/{date}/
  code-quality/{org}/{repo}/{date}/
```

##### Realized Azure Blob Storage Layout

Both domains implement a `scan-and-store.yml` pipeline that runs on a weekly schedule (Monday 06:00 UTC). The pipeline executes scan tools, transforms results into fact table JSON format via `scripts/scan-and-store.ps1`, and uploads to domain-specific Azure Blob Storage containers using Entra ID authentication.

| Aspect | Accessibility | FinOps |
|--------|-------------|--------|
| Pipeline | `scan-and-store.yml` | `scan-and-store.yml` |
| Schedule | Weekly Monday 06:00 UTC | Weekly Monday 06:00 UTC |
| Transform | Results → `Fact_A11yViolations` JSON | SARIF → `Fact_FinOpsFindings` JSON |
| Storage account | `a11yscan7yt3mwgxp3wiy` | `finopsscanstore2497` |
| Container | `a11y-scan-results` | `finops-scan-results` |
| Upload path | `{yyyy/MM/dd}/{siteKey}.json` | `{yyyy/MM/dd}/{appId}-{toolName}.json` |
| Deduplication | SHA-256 ViolationId | SHA-256 FindingId |

#### Authentication Requirements

**Target architecture** (ADLS Gen 2):

| Property | Value |
|----------|-------|
| Method | Organizational Account (Entra ID / OAuth2) |
| RBAC required | `Storage Blob Data Reader` (minimum) |
| Cross-tenant | Not supported |
| URL format | `https://<accountname>.dfs.core.windows.net/<container>` |
| Subfolder in URL | Not supported; filter in M code |

**Realized architecture** (Azure Blob Storage):

Pipeline upload authentication:

| Property | Value |
|----------|-------|
| Method | Entra ID Managed Identity (`az storage blob upload --auth-mode login`) |
| RBAC required | `Storage Blob Data Contributor` (for pipeline uploads) |
| Pipeline task | `AzureCLI@2` with service connection |

Power BI connectivity:

| Property | Value |
|----------|-------|
| Method | SAS token (Accessibility) / Parameterized connection string (FinOps) |
| Access level | Read-only to specific containers |
| URL format | `https://{accountname}.blob.core.windows.net/{container}` |

#### Domain-Specific Report Pages

| Domain | Pages |
|--------|-------|
| Accessibility | Overview, WCAG Criteria, Engine Comparison, Repository Detail, Remediation Tracking |
| FinOps | Cost Overview, Budget Compliance, Optimization Opportunities, Tagging Compliance, Tool Findings, Deployment Cost Gate |
| Security | Vulnerability Overview, CWE Distribution, Dependency Alerts, IaC Findings, Trend Analysis |
| Code Quality | Quality Overview, Coverage by Repository, Complexity Analysis, Test Generation Tracking |

#### CI/CD SARIF Upload to ADLS Gen 2

GitHub Actions:

```yaml
- name: Upload SARIF to ADLS Gen 2
  uses: azure/cli@v2
  with:
    inlineScript: |
      DOMAIN="accessibility"
      DATE=$(date +%Y-%m-%d)
      REPO="${{ github.repository }}"
      az storage blob upload-batch \
        --account-name scanresults \
        --destination sarif-results \
        --source ./sarif-output/ \
        --destination-path "${DOMAIN}/${REPO}/${DATE}/" \
        --auth-mode login \
        --overwrite
```

ADO Pipelines:

```yaml
- task: AzureCLI@2
  inputs:
    azureSubscription: 'service-connection'
    scriptType: 'bash'
    scriptLocation: 'inlineScript'
    inlineScript: |
      DOMAIN="accessibility"
      DATE=$(date +%Y-%m-%d)
      REPO="$(Build.Repository.Name)"
      az storage blob upload-batch \
        --account-name scanresults \
        --destination sarif-results \
        --source $(Build.ArtifactStagingDirectory)/sarif/ \
        --destination-path "${DOMAIN}/${REPO}/${DATE}/" \
        --auth-mode login \
        --overwrite
```

#### Power Query M Expression for SARIF Ingestion

```m
let
    Source = AzureStorage.DataLake(
        ADLSEndpoint,
        [HierarchicalNavigation = true]
    ),
    FilterDomain = Table.SelectRows(Source, each
        Text.StartsWith([Folder Path], DomainFilter & "/") and
        Text.EndsWith([Name], ".sarif")
    ),
    AddParsedContent = Table.AddColumn(FilterDomain, "ParsedSARIF", each Json.Document([Content])),
    ExpandRuns = Table.ExpandListColumn(
        Table.AddColumn(AddParsedContent, "Runs", each [ParsedSARIF][runs]),
        "Runs"
    ),
    ExpandRunDetails = Table.ExpandRecordColumn(ExpandRuns, "Runs", {"tool", "results", "automationDetails"}),
    AddToolName = Table.AddColumn(ExpandRunDetails, "ToolName", each [tool][driver][name]),
    ExpandResults = Table.ExpandListColumn(AddToolName, "results"),
    ExpandFinding = Table.ExpandRecordColumn(ExpandResults, "results",
        {"ruleId", "level", "message", "locations", "partialFingerprints"}
    ),
    AddMessage = Table.AddColumn(ExpandFinding, "MessageText", each [message][text]),
    AddFilePath = Table.AddColumn(AddMessage, "FilePath", each
        try [locations]{0}[physicalLocation][artifactLocation][uri] otherwise null
    ),
    AddLineNumber = Table.AddColumn(AddFilePath, "LineNumber", each
        try [locations]{0}[physicalLocation][region][startLine] otherwise null
    ),
    AddSeverity = Table.AddColumn(AddLineNumber, "Severity", each
        if [level] = "error" then "Critical"
        else if [level] = "warning" then "Medium"
        else if [level] = "note" then "Low"
        else "Info"
    )
in
    AddSeverity
```

## Gaps Identified

Research across both domains reveals four remaining parity gaps spanning domain-level parity, dual-platform workshops, and Power BI PBIP coverage.

### Gap 1: FinOps Workshop Has No Copilot Artifacts

The Accessibility workshop repository includes a workshop-specific agent and governance instructions. The FinOps workshop repository contains zero Copilot artifacts: no agents, prompts, instructions, or skills.

To close this gap, create a FinOps workshop agent in `.github/agents/` and add governance instructions to `.github/instructions/` in the `finops-scan-workshop` repository, following the patterns established in the Accessibility workshop.

### ~~Gap 2: FinOps Demo App Has No ADO Pipelines~~ — CLOSED

**Status: CLOSED** — The FinOps demo app repository now includes 5 pipelines (`finops-scan`, `finops-cost-gate`, `deploy-all`, `teardown-all`, `scan-and-store`), 2 templates (`deploy-app`, `teardown-app`), and 1 variables file (`common.yml`). ADO bootstrap scripts (`bootstrap-demo-apps-ado.ps1`, `setup-oidc-ado.ps1`) are also present. The ADO project `FinOps` in `MngEnvMCAP675646` has 5 Azure Repos, 3 variable groups, 6 WIF service connections, 1 environment, and 4 registered pipelines.

### Gap 3: Domain-Specific Power BI Pages Below Spec — PARTIALLY CLOSED

**Status: PARTIALLY CLOSED** — All three domains now have per-domain PBIPs (Accessibility: `A11yReport.pbip` with 1 page, Code Quality: `CodeQualityReport.pbip` with 4 pages planned, FinOps: `FinOpsReport.pbip` with 1 page). However, the spec calls for 5 pages (Accessibility), 4 pages (Code Quality), and 6 pages (FinOps).

To fully close this gap, add the remaining report pages to each domain's PBIP as specified in the domain-specific report pages table in [Desired Features to Compare](#desired-features-to-compare).

> **Note**: The centralized `advsec-pbi-report-ado` repo returns HTTP 404. The Security domain PBIP status is unknown. The per-domain PBIP approach may have fully replaced the centralized model.

### Gap 4: SARIF Generation Approach Differs Between Domains

The Accessibility scanner generates SARIF v2.1.0 natively through a built-in TypeScript generator (`src/lib/report/sarif-generator.ts`). The FinOps domain requires 2 Python converter scripts (`custodian-to-sarif.py` and `infracost-to-sarif.py`) because Cloud Custodian and Infracost do not produce SARIF natively. PSRule and Checkov produce SARIF natively without converters.

This is a design difference driven by tool capabilities rather than a gap requiring remediation. New domains should evaluate SARIF capabilities during tool selection (Step 2 of the contribution guide) and document any converters needed.

### ~~Gap 5: No ADO Workshop Labs~~ — CLOSED

**Status: CLOSED** — All 4 workshops (Agentic Accelerator, Accessibility, Code Quality, and FinOps) now include ADO-specific lab variants (`lab-06-ado-sarif-advsec.md` and `lab-07-ado-pipelines.md`). Every workshop supports 5 delivery tiers: half-day GitHub, half-day ADO, full-day GitHub, full-day ADO, and full-day dual-platform. Labs 00–05 remain platform-agnostic.

### ~~Gap 6: No Domain-Specific Power BI PBIPs~~ — CLOSED

**Status: CLOSED** — All three domains (Accessibility, Code Quality, and FinOps) now have per-domain PBIPs:

* Accessibility: `a11y-pbi-report/A11yReport.pbip` with full TMDL semantic model (`Fact_A11yViolations` + 7 dimensions)
* Code Quality: `power-bi/CodeQualityReport.pbip` with 4 planned report pages (Quality Overview, Coverage by Repository, Complexity Analysis, Test Generation Tracking)
* FinOps: `power-bi/FinOpsReport.pbip` with full TMDL semantic model (`Fact_FinOpsFindings` + 5 dimensions)

Both PBIPs source data from Azure Blob Storage (not ADLS Gen 2 as originally specified). The scan-and-store pipeline pattern feeds data into these PBIPs on a weekly schedule.

## Contributing a New Domain

This section provides a step-by-step guide for adding a new scanning domain to the framework. We use **Code Quality** as a concrete example.

> **Automated scaffolding**: Use the `DomainScaffolder` agent via the `/scaffold-domain` prompt to automate repo structure generation for new domains. The scaffolder loads `skills/domain-scaffolding/SKILL.md` for structural templates and produces both the demo-app and workshop repo structures with full parity to existing domains.

### Step 1: Define the Domain Scope

Identify:

* **What violations to detect** — code coverage gaps, cyclomatic complexity, code duplication, linting failures
* **What standards to reference** — coverage thresholds (≥ 80%), complexity limits (≤ 10), language-specific linting rules
* **SARIF category prefix** — `code-quality/coverage/`
* **Severity mapping** — below 50% coverage = CRITICAL, 50–70% = HIGH, 70–80% = MEDIUM, style issues = LOW

### Step 2: Select Open Source Tools

Choose 3–5 tools that complement each other (some produce native SARIF, others need converters):

| Tool | Language Coverage | Focus | SARIF Native |
|------|------------------|-------|--------------|
| **SonarScanner CLI** | C#, Java, Python, JS/TS, Go | Code quality + coverage aggregation | No (needs converter) |
| **ESLint** | JavaScript/TypeScript | Linting + style enforcement | Yes (with `@microsoft/eslint-formatter-sarif`) |
| **Checkstyle** | Java | Code style and complexity | No (needs converter) |
| **Pylint** | Python | Linting + complexity analysis | No (needs converter) |
| **dotnet-coverage / coverlet** | C# / .NET | Code coverage measurement | No (lcov/cobertura output) |
| **JaCoCo** | Java | Code coverage measurement | No (XML output) |
| **pytest-cov** | Python | Code coverage measurement | No (lcov output) |
| **go test -cover** | Go | Native coverage profiling | No (cover profile output) |

Write SARIF converters (Python scripts in `src/converters/`) for tools that do not produce native SARIF. Follow the patterns established in the FinOps domain:

```text
src/converters/
├── eslint-to-sarif.py       ← If not using @microsoft/eslint-formatter-sarif
├── checkstyle-to-sarif.py   ← Convert Checkstyle XML to SARIF
├── pylint-to-sarif.py       ← Convert Pylint JSON to SARIF
├── coverage-to-sarif.py     ← Convert lcov/cobertura to SARIF findings for < 80% functions
└── jacoco-to-sarif.py       ← Convert JaCoCo XML to SARIF
```

### Step 3: Create 5 Sample Apps with Intentional Violations

Each sample app should use a different popular language/framework and contain intentional code quality violations:

| App | Language | Framework | Violation Theme | Expected Findings |
|-----|----------|-----------|-----------------|-------------------|
| `quality-demo-app-001` | C# | ASP.NET 8 Minimal API | Low coverage (~40%), no unit tests, high complexity methods | Coverage, complexity |
| `quality-demo-app-002` | Python | Flask 3.0 | Untested error paths, Pylint violations, deeply nested functions | Coverage, linting, complexity |
| `quality-demo-app-003` | Java | Spring Boot 3.2 | Missing JUnit tests, Checkstyle violations, duplicated code | Coverage, style, duplication |
| `quality-demo-app-004` | TypeScript | Next.js 15 | Untested components, ESLint violations, complex reducers | Coverage, linting, complexity |
| `quality-demo-app-005` | Go | net/http (stdlib) | No table-driven tests, uncovered error branches, long functions | Coverage, complexity |

Each app includes:

```text
quality-demo-app-NNN/
├── infra/main.bicep          ← Azure App Service infrastructure
├── src/                      ← Application source with intentional violations
├── tests/                    ← Minimal/incomplete test suite (intentionally low coverage)
├── Dockerfile
├── start-local.ps1
├── stop-local.ps1
└── README.md                 ← Describes violations and expected findings
```

### Step 4: Create the Demo App Repository

Create `code-quality-scan-demo-app` with the following structure:

```text
code-quality-scan-demo-app/
├── .github/
│   ├── agents/
│   │   ├── code-quality-detector.agent.md
│   │   └── test-generator.agent.md
│   ├── instructions/
│   │   ├── code-quality.instructions.md
│   │   └── ado-workflow.instructions.md
│   ├── prompts/
│   │   ├── quality-scan.prompt.md
│   │   └── quality-fix.prompt.md
│   ├── skills/
│   │   └── code-quality-scan/SKILL.md
│   └── workflows/
│       ├── ci.yml
│       ├── quality-scan.yml            ← Central scan (matrix across 5 apps)
│       ├── quality-coverage-gate.yml   ← PR coverage gate (fail if < 80%)
│       ├── deploy-all.yml
│       └── scan-all.yml
├── .azuredevops/
│   └── pipelines/
│       ├── ci-cd.yml
│       ├── quality-scan.yml
│       ├── deploy-all.yml
│       └── templates/
│           ├── deploy-app-stage.yml
│           └── teardown-stage.yml
├── quality-demo-app-001/ through 005/
├── src/
│   ├── converters/
│   │   ├── coverage-to-sarif.py
│   │   ├── checkstyle-to-sarif.py
│   │   ├── pylint-to-sarif.py
│   │   └── jacoco-to-sarif.py
│   └── config/
│       ├── eslint.config.js
│       ├── .pylintrc
│       ├── checkstyle.xml
│       └── .coveragerc
├── scripts/
│   ├── bootstrap-demo-apps.ps1
│   └── setup-oidc.ps1
├── docs/
│   ├── power-bi-data-model.md
│   ├── power-bi-dashboard-design.md
│   └── power-query-quality-alerts.md
└── README.md
```

### Step 5: Build Copilot Artifacts

#### Agents

Copy the agent patterns from `agentic-accelerator-framework/agents/`:

* **code-quality-detector.agent.md** — Detector agent that parses coverage reports, identifies below-threshold functions, reports complexity violations, and generates SARIF output
* **test-generator.agent.md** — Resolver agent that reads uncovered functions, generates tests following existing patterns, and verifies coverage improvement

#### Instructions

* **code-quality.instructions.md** — Coverage thresholds (≥ 80% line, branch, function), complexity limits (cyclomatic ≤ 10), testing patterns (AAA), CI quality gate sequence
* **ado-workflow.instructions.md** — Standard ADO work item tracking and branching workflow

#### Prompts

* **quality-scan.prompt.md** — Runs code quality analysis on a target project or file via the Detector agent
* **quality-fix.prompt.md** — Generates tests and fixes for quality violations via the Test Generator agent

#### Skills

* **code-quality-scan/SKILL.md** — Domain knowledge package covering supported tools, coverage formats (lcov, cobertura, JaCoCo XML, Go cover), SARIF mapping rules, and multi-language testing patterns

Skills can exist in two locations: the domain's demo-app repository (for scanner-specific knowledge, as in the FinOps `finops-scan` skill) and the framework repository (for cross-domain reference, as in the `a11y-scan` and `security-scan` skills in `agentic-accelerator-framework/skills/`). Create the skill in the demo-app repo first, then consider adding a corresponding skill to the framework repo if the knowledge benefits users working across domains.

### Step 6: Implement SARIF Integration

All findings must output SARIF v2.1.0 for GitHub Security Overview and ADO Advanced Security. Each SARIF file must include:

* `partialFingerprints` for deduplication across runs
* `automationDetails.id` set to the domain category prefix (e.g., `code-quality/coverage/`)
* `runs[].tool.driver.name` populated with the scanner or agent name
* `runs[].tool.driver.rules[]` with unique `ruleId` values per finding type
* `runs[].results[].level` mapped from severity (CRITICAL/HIGH → `error`, MEDIUM → `warning`, LOW → `note`)

```text
SARIF Flow:
  Tool Output (lcov, XML, JSON)
    → Converter (Python script)
      → SARIF v2.1.0 file
        → Upload to GitHub Security Tab (codeql-action/upload-sarif@v4)
        → Upload to ADO Advanced Security (AdvancedSecurity-Publish@1)
          → Power BI Report (via REST API query)
```

For cross-repo SARIF upload (scanning from central repo to demo app repos), follow the FinOps pattern:

```bash
gh api -X POST \
  "repos/{owner}/{demo-app-repo}/code-scanning/sarifs" \
  -f "commit_sha=$(gh api repos/{owner}/{demo-app-repo}/git/ref/heads/main --jq '.object.sha')" \
  -f "ref=refs/heads/main" \
  -f "sarif=$(gzip -c results.sarif | base64 -w0)" \
  -f "tool_name=code-quality-scanner"
```

### Step 7: Create PowerShell Bootstrap Scripts

#### `bootstrap-demo-apps.ps1`

Follow the pattern from Accessibility, Code Quality, and FinOps domains:

1. Create 5 demo app repos from template directories
2. Enable code scanning on each repo
3. Configure OIDC secrets (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`)
4. Create `production` environment
5. Set domain-specific secrets (e.g., `SCANNER_URL`)
6. Enable wikis and set repository topics

#### `setup-oidc.ps1`

1. Create Azure AD app registration (`code-quality-scanner-github-actions`)
2. Add federated credentials for all 6 repos (scanner + 5 demo apps)
3. Create service principal and assign Contributor role
4. Output Client ID, Tenant ID, Subscription ID for GitHub Secrets

### Step 8: Create the Workshop Repository

The `code-quality-scan-workshop` GitHub template repository is fully implemented with bilingual (GitHub + ADO) lab support:

```text
code-quality-scan-workshop/
├── .devcontainer/
│   ├── Dockerfile              ← Node.js 20 + Python 3.12 + .NET 8 + Java 21 + Go + Charm freeze
│   └── post-create.sh          ← Clone/fork demo app repo, install tools
├── labs/
│   ├── lab-00-setup.md         ← Prerequisites and environment setup (30 min)
│   ├── lab-01.md               ← Explore demo apps and quality violations (25 min)
│   ├── lab-02.md               ← ESLint — JavaScript/TypeScript linting (35 min)
│   ├── lab-03.md               ← Pylint + pytest-cov — Python quality and coverage (30 min)
│   ├── lab-04.md               ← Checkstyle + JaCoCo — Java quality and coverage (35 min)
│   ├── lab-05.md               ← dotnet-coverage + coverlet — C# coverage (30 min)
│   ├── lab-06-github-sarif-security.md    ← GitHub Security Tab (30 min)
│   ├── lab-06-ado-sarif-advsec.md         ← ADO Advanced Security (35 min)
│   ├── lab-07-github-actions.md           ← GitHub Actions (45 min)
│   └── lab-07-ado-pipelines.md            ← ADO YAML Pipelines (50 min)
├── scripts/
│   └── capture-screenshots.ps1 ← Automated screenshot capture for all labs
├── images/lab-00/ through lab-07/
├── index.md                    ← GitHub Pages landing page
├── CONTRIBUTING.md             ← Lab authoring style guide
├── _config.yml                 ← Jekyll configuration
├── Gemfile
└── README.md
```

Workshop delivery tiers:

| Tier | Platform | Labs | Duration | Azure Required |
|------|----------|------|----------|----------------|
| Half-day (GitHub) | GitHub | 00, 01, 02, 03, 06-github | ~3 hours | No |
| Half-day (ADO) | ADO | 00, 01, 02, 03, 06-ado | ~3 hours | No |
| Full-day (GitHub) | GitHub | 00–05, 06-github, 07-github | ~6.5 hours | Yes |
| Full-day (ADO) | ADO | 00–05, 06-ado, 07-ado | ~7 hours | Yes |
| Full-day (Dual) | Both | 00–05, 06-github, 06-ado, 07-github, 07-ado | ~8.5 hours | Yes |

Screenshot scripts support both platforms via a `--platform github|ado` parameter for platform-specific labs.

### Step 9: Create Domain-Specific Power BI PBIP

Create a `power-bi/` directory in the domain's demo-app repository following the PBIP folder structure documented in [Desired Features to Compare](#desired-features-to-compare).

Key requirements:

* **Semantic model**: Star schema with domain-specific fact table + dimension tables (see existing implementations for reference)
* **Data source (target)**: ADLS Gen 2 via `AzureStorage.DataLake()` with OAuth2 Organizational Account
* **Data source (current pattern)**: Azure Blob Storage via `AzureBlobStorage()` with SAS token — both Accessibility (`a11yscan7yt3mwgxp3wiy`) and FinOps (`finopsscanstore2497`) use this pattern
* **Scan-and-store pipeline**: Create `scripts/scan-and-store.ps1` to transform scan results into fact table JSON and `scan-and-store.yml` pipeline for scheduled weekly uploads (Monday 06:00 UTC)
* **Domain filter**: Add a domain filter parameter in `expressions.tmdl` to scope data ingestion
* **Report pages**: Create domain-specific pages as documented in the domain-specific pages table in [Desired Features to Compare](#desired-features-to-compare)
* **CI/CD upload**: Add scan-and-store pipeline to upload results to Azure Blob Storage (both GitHub Actions and ADO YAML)
* **RBAC**: Assign `Storage Blob Data Contributor` for pipeline uploads, `Storage Blob Data Reader` for report consumers
* **Deployment scripts (optional)**: See Accessibility `a11y-pbi-report/scripts/deploy.ps1` for PBIP deployment using FabricPS-PBIP module

For Code Quality, create these report pages:

| Page | Content |
|------|---------|
| Quality Overview | Coverage distribution across repos, quality score trends |
| Coverage by Repository | Per-repo coverage percentages, below-threshold file counts |
| Complexity Analysis | Cyclomatic complexity distribution, high-complexity function list |
| Test Generation Tracking | Tests generated vs. coverage improvement correlation |

The centralized report (`advsec-pbi-report-ado`) returns HTTP 404 and may no longer be available. Refer to existing per-domain PBIPs (Accessibility: `a11y-pbi-report/`, FinOps: `power-bi/`) as implementation examples.

### Step 10: Ensure ADO First-Class Citizenship

Every GitHub Actions workflow must have an ADO YAML pipeline equivalent:

| GitHub Actions Workflow | ADO Pipeline Equivalent | Key Task Differences |
|------------------------|------------------------|---------------------|
| `ci.yml` | `ci-cd.yml` | `DotNetCoreCLI@2`, `Maven@3`, `UsePythonVersion@0` |
| `quality-scan.yml` | `quality-scan.yml` | `AdvancedSecurity-Publish@1` for SARIF upload |
| `quality-coverage-gate.yml` | `quality-coverage-gate.yml` | `PublishCodeCoverageResults@2` for coverage tab |
| `deploy-all.yml` | `deploy-all.yml` | Pipeline triggers replace `workflow_dispatch` |

Add a `quality-pipeline.yml` sample to `agentic-accelerator-framework/samples/azure-devops/` (one already exists as a sample).

## Domain Contribution Checklist

Use this checklist when contributing a new domain:

### Demo App Repository

- [ ] Create repository `{domain}-scan-demo-app`
- [ ] Add 5 sample apps with intentional violations in different languages
- [ ] Add Dockerfile per sample app
- [ ] Add `start-local.ps1` and `stop-local.ps1` per sample app
- [ ] Implement or integrate 3–5 open source scanning tools
- [ ] Write SARIF converters for tools without native SARIF output
- [ ] Create Copilot agents (detector + resolver pattern)
- [ ] Create Copilot prompts (scan + fix)
- [ ] Create Copilot instructions (domain rules + ado-workflow)
- [ ] Create Copilot skill (domain scanner knowledge)
- [ ] Create `bootstrap-demo-apps.ps1` (repo creation, OIDC, secrets)
- [ ] Create `setup-oidc.ps1` (Azure AD federation)
- [ ] Create `bootstrap-demo-apps-ado.ps1` (ADO project provisioning, repos, variable groups, WIF)
- [ ] Create `setup-oidc-ado.ps1` (ADO WIF federation for ADO Pipelines)
- [ ] Create GitHub Actions workflows (ci, scan, gate, deploy-all)
- [ ] Create reusable GitHub Action (composite action) for external CI use
- [ ] Create Azure DevOps pipelines (ci-cd, scan, deploy-all, templates)
- [ ] Create `scripts/scan-and-store.ps1` (transform scan results to fact table JSON for Power BI)
- [ ] Create `scan-and-store.yml` pipeline (scheduled weekly data upload to Azure Blob Storage)
- [ ] Document Power BI data model and dashboard design
- [ ] Document Power Query M expressions for data ingestion
- [ ] Write comprehensive README
- [ ] Create per-domain Power BI PBIP in `power-bi/` directory (or domain-specific name)
- [ ] Define TMDL semantic model with star schema (domain-specific fact table + dimension tables)
- [ ] Configure Azure Blob Storage connection in `expressions.tmdl` (SAS token or Entra ID)
- [ ] Create domain-specific report pages
- [ ] Add scan-and-store pipeline for scheduled data uploads to Azure Blob Storage

### Workshop Repository

- [ ] Create repository `{domain}-scan-workshop` as a GitHub template
- [ ] Write 8 labs (Lab 00–07) following the standard progression
- [ ] Create `capture-screenshots.ps1` for automated lab screenshots
- [ ] Set up dev container with all required tools
- [ ] Configure Jekyll for GitHub Pages
- [ ] Write contributing guide with lab authoring style
- [ ] Define half-day and full-day delivery tiers
- [ ] Create workshop Copilot agent for lab guidance
- [ ] Create workshop governance instructions
- [ ] Create Playwright helpers script for browser automation
- [ ] Create ADO-specific lab files (`lab-06-ado-sarif-advsec.md`, `lab-07-ado-pipelines.md`)
- [ ] Define 5 delivery tiers (half-day GH, half-day ADO, full-day GH, full-day ADO, full-day dual)
- [ ] Update `capture-screenshots.ps1` with `--platform` parameter support
- [ ] Add GitHub Pages platform selection guidance to `index.md`

### Framework Integration

- [ ] Add or update agents in `agentic-accelerator-framework/agents/`
- [ ] Add or update instructions in `agentic-accelerator-framework/instructions/`
- [ ] Add sample ADO pipeline in `agentic-accelerator-framework/samples/azure-devops/`
- [ ] Update `docs/implementation-roadmap.md` with domain status
- [ ] Add domain workshop to README Workshops section

### Power BI Report

- [ ] ~~Add report pages to `advsec-pbi-report-ado`~~ Create per-domain PBIP (centralized repo returns 404, may be deprecated)
- [ ] Add fact and dimension tables to semantic model
- [ ] Document Power Query M expressions and DAX measures
- [ ] Test with real data from scan-and-store pipeline output
- [ ] Add PBIP deployment scripts (optional — see Accessibility `deploy.ps1` pattern)

## Existing Framework Assets for Code Quality

The `agentic-accelerator-framework` already defines these Code Quality assets that should be reused in the new `code-quality-scan-demo-app` repository:

| Asset | Location | Description |
|-------|----------|-------------|
| Code Quality Detector agent | `agents/code-quality-detector.agent.md` | Parses coverage reports, identifies below-threshold functions, reports complexity violations |
| Test Generator agent | `agents/test-generator.agent.md` | Generates tests for uncovered functions, verifies coverage improvement |
| Code Quality instructions | `instructions/code-quality.instructions.md` | Coverage thresholds, complexity limits, testing patterns, CI quality gate |
| Quality ADO pipeline sample | `samples/azure-devops/quality-pipeline.yml` | Sample ADO pipeline for lint, type check, test, coverage |
| Code Quality Scan skill | `skills/code-quality-scan/SKILL.md` | 4-tool architecture, MegaLinter orchestration, SARIF output, severity mapping |
| Code Quality Scan prompt | `prompts/code-quality-scan.prompt.md` | Runs code quality analysis via CodeQualityDetector agent |
| Code Quality Fix prompt | `prompts/code-quality-fix.prompt.md` | Fixes code quality violations via TestGenerator agent |
| Domain Scaffolder agent | `agents/domain-scaffolder.agent.md` | Scaffolds new domain repos with full parity to existing domains |
| Domain Scaffolding skill | `skills/domain-scaffolding/SKILL.md` | Repo structure templates, bootstrap scripts, screenshot automation, PBIP schemas |
| Scaffold Domain prompt | `prompts/scaffold-domain.prompt.md` | Triggers domain scaffolding via DomainScaffolder agent |
| Domain Scaffolding instructions | `instructions/domain-scaffolding.instructions.md` | Conventions for scaffolding new domain repositories |
| Quality GH Actions sample | `samples/github-actions/code-quality-scan.yml` | GitHub Actions workflow for lint, complexity, duplication, coverage |
