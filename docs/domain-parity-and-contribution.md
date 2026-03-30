# Domain Parity and Contribution Guide

This document compares the feature parity across the Accessibility and FinOps domains and provides a step-by-step guide for contributing a new domain to the Agentic Accelerator Framework.

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
│   └── setup-oidc.ps1
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

| Feature | Accessibility (`accessibility-scan-demo-app`) | FinOps (`finops-scan-demo-app`) |
|---------|-----------------------------------------------|----------------------------------|
| **Sample apps** | 5 web apps (Rust, C#, Java, Python, Go) with 15+ WCAG violations each | 5 IaC apps (Bicep + HTML) with cost governance violations |
| **Centralized scanner** | Full-stack Next.js 15 app (Web UI, REST API, CLI, GitHub Action) | Central `finops-scan.yml` workflow with matrix strategy |
| **Scanner deployment** | Azure App Service (Docker container) | GitHub Actions only (no deployed scanner app) |
| **Open source tools** | axe-core 4.11, IBM Equal Access 4.0 | PSRule for Azure, Checkov, Cloud Custodian, Infracost |
| **Custom tools** | 5 custom Playwright checks, CLI, SARIF generator, scoring engine, PDF/HTML reports | 2 Python SARIF converters, 4 Cloud Custodian policies |
| **SARIF generation** | Native (built-in SARIF v2.1.0 generator) | Mixed: PSRule and Checkov native; Cloud Custodian and Infracost via Python converters |
| **SARIF upload** | `codeql-action/upload-sarif@v4` (same-repo) | Cross-repo upload via GitHub REST API (`gh api`) |
| **Copilot agents** | 2 (a11y-detector, a11y-resolver) | 5 (CostAnalysis, FinOpsGovernance, CostAnomalyDetector, CostOptimizer, DeploymentCostGate) |
| **Copilot prompts** | 2 (a11y-scan, a11y-fix) | 2 (finops-scan, finops-fix) |
| **Copilot instructions** | 3 (wcag22-rules, a11y-remediation, ado-workflow) | 2 (finops-governance, ado-workflow) |
| **Copilot skills** | 0 | 1 (finops-scan) |
| **Bootstrap script** | `bootstrap-demo-apps.ps1` — creates 5 repos, OIDC, secrets | `bootstrap-demo-apps.ps1` — creates 5 repos, OIDC, secrets, Infracost key |
| **OIDC setup script** | `setup-oidc.ps1` — Azure AD federation for GitHub Actions | `setup-oidc.ps1` — Azure AD federation for 6 repos |
| **GitHub Actions** | 5 workflows (ci, deploy, a11y-scan, deploy-all, scan-all) | 4 workflows (finops-scan, finops-cost-gate, deploy-all, teardown-all) |
| **Azure DevOps pipelines** | 8 pipelines (ci-cd, deploy-all, a11y-scan variants, scan-all, adv-sec-scan, 2 templates) | Not yet implemented |
| **Power BI docs** | None | 5 docs (data model, dashboard design, Power Query M, Resource Graph, FinOps Toolkit) |
| **Primary language** | TypeScript 81.8% | PowerShell 41.7%, Bicep 26.4%, Python 24.1% |

### Workshop Repos

| Feature | Accessibility (`accessibility-scan-workshop`) | FinOps (`finops-scan-workshop`) |
|---------|------------------------------------------------|----------------------------------|
| **Labs** | 8 labs (Lab 00–07) | 8 labs (Lab 00–07) |
| **Full-day duration** | ~6.5 hours | ~7.25 hours |
| **Half-day duration** | ~3 hours (Labs 00, 01, 02, 03, 05) | ~3.5 hours (Labs 00, 01, 02, 03, 06) |
| **Delivery tiers** | Half-day and full-day | Half-day and full-day |
| **Workshop agent** | Yes (workshop-specific agent in `.github/agents/`) | No |
| **Copilot artifacts** | Workshop agent + governance instructions | None |
| **Screenshot script** | `capture-screenshots.ps1` (~900+ lines, 47 PNGs, 3 phases) | `capture-screenshots.ps1` (~710+ lines, 46 PNGs) |
| **Playwright helpers** | `playwright-helpers.js` (screenshot, scan, auth-screenshot) | Not present |
| **Dev container** | Yes (Node.js 20 + Charm freeze) | Yes |
| **GitHub Pages** | Yes (Jekyll) | Yes (Jekyll) |
| **Template repo** | Yes | Yes |
| **Contributing guide** | Yes (lab authoring style guide) | Yes (lab authoring style guide) |
| **License** | MIT | MIT |

### Power BI Report (`advsec-pbi-report-ado`)

| Aspect | Current State | Gap |
|--------|---------------|-----|
| **Security pages** | 3 pages (Overview, Alerts by Type, Trend Analysis) | Fully implemented |
| **Accessibility pages** | None | Need pages for WCAG compliance trends, violation severity distribution |
| **FinOps pages** | None (specs exist in `finops-scan-demo-app/docs/`) | Need 6 pages per FinOps dashboard design spec |
| **Code Quality pages** | None | Need coverage trends, complexity metrics, test generation tracking |
| **Data source** | ADO Advanced Security REST API (`advsec.dev.azure.com`) | Non-security domains need pipeline artifact ingestion (SARIF/lcov) |
| **Format** | PBIP (Power BI Project) — extensible, code-based | Supports adding pages as folder structures |

### ADO First-Class Citizen Status

Making Azure DevOps a first-class citizen means every GitHub Actions workflow has an equivalent ADO YAML pipeline. Current status:

| Domain | GitHub Actions | ADO Pipelines | ADO Pipeline Status |
|--------|---------------|---------------|---------------------|
| **Security** | `security-scan.yml` | `security-pipeline.yml` (sample) | Implemented |
| **Accessibility** | `accessibility-scan.yml` | `accessibility-pipeline.yml` (sample) + 8 full pipelines in demo-app | Implemented |
| **Code Quality** | `code-quality.yml` | `quality-pipeline.yml` (sample) | Sample only |
| **FinOps** | `finops-scan.yml`, `finops-cost-gate.yml` | None | Not implemented |
| **APM Security** | `apm-security.yml` | Inline pattern in docs | Not implemented |

## Contributing a New Domain

This section provides a step-by-step guide for adding a new scanning domain to the framework. We use **Code Quality** as a concrete example.

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

### Step 6: Implement SARIF Integration

All findings must output SARIF v2.1.0 for GitHub Security Overview and ADO Advanced Security:

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

Follow the pattern from Accessibility and FinOps domains:

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

Create `code-quality-scan-workshop` as a GitHub template repository:

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
│   ├── lab-06.md               ← SARIF output and GitHub Security Tab (30 min)
│   └── lab-07.md               ← GitHub Actions pipelines and coverage gates (45 min)
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

| Tier | Labs | Duration | Azure Required |
|------|------|----------|----------------|
| Half-day | 00, 01, 02, 03, 06 | ~3 hours | No |
| Full-day | 00–07 (all) | ~6.5 hours | Yes |

### Step 9: Add Power BI Pages

Add report pages to the [advsec-pbi-report-ado](https://github.com/devopsabcs-engineering/advsec-pbi-report-ado) repository:

For Code Quality, add these pages:

| Page | Content |
|------|---------|
| Code Quality Overview | Coverage distribution across repos, quality score trends |
| Coverage by Repository | Per-repo coverage percentages, below-threshold file counts |
| Complexity Analysis | Cyclomatic complexity distribution, high-complexity function list |
| Test Generation Tracking | Tests generated vs. coverage improvement correlation |

Data model additions:

* `Fact_QualityFindings` — one row per quality finding (from SARIF via Code Scanning API)
* `Dim_QualityRule` — rule types (coverage-gap, complexity, duplication, lint-violation)
* `Dim_Language` — programming language dimension

Document Power Query M expressions for ingesting Code Quality SARIF from the GitHub Code Scanning API in `docs/power-query-quality-alerts.md`.

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
- [ ] Implement or integrate 3–5 open source scanning tools
- [ ] Write SARIF converters for tools without native SARIF output
- [ ] Create Copilot agents (detector + resolver pattern)
- [ ] Create Copilot prompts (scan + fix)
- [ ] Create Copilot instructions (domain rules + ado-workflow)
- [ ] Create Copilot skill (domain scanner knowledge)
- [ ] Create `bootstrap-demo-apps.ps1` (repo creation, OIDC, secrets)
- [ ] Create `setup-oidc.ps1` (Azure AD federation)
- [ ] Create GitHub Actions workflows (ci, scan, gate, deploy-all)
- [ ] Create Azure DevOps pipelines (ci-cd, scan, deploy-all, templates)
- [ ] Document Power BI data model and dashboard design
- [ ] Document Power Query M expressions for data ingestion
- [ ] Write comprehensive README

### Workshop Repository

- [ ] Create repository `{domain}-scan-workshop` as a GitHub template
- [ ] Write 8 labs (Lab 00–07) following the standard progression
- [ ] Create `capture-screenshots.ps1` for automated lab screenshots
- [ ] Set up dev container with all required tools
- [ ] Configure Jekyll for GitHub Pages
- [ ] Write contributing guide with lab authoring style
- [ ] Define half-day and full-day delivery tiers

### Framework Integration

- [ ] Add or update agents in `agentic-accelerator-framework/agents/`
- [ ] Add or update instructions in `agentic-accelerator-framework/instructions/`
- [ ] Add sample ADO pipeline in `agentic-accelerator-framework/samples/azure-devops/`
- [ ] Update `docs/implementation-roadmap.md` with domain status
- [ ] Add domain workshop to README Workshops section

### Power BI Report

- [ ] Add report pages for domain findings in `advsec-pbi-report-ado`
- [ ] Add fact and dimension tables to semantic model
- [ ] Document Power Query M expressions and DAX measures
- [ ] Test with real SARIF data from GitHub Code Scanning API

## Existing Framework Assets for Code Quality

The `agentic-accelerator-framework` already defines these Code Quality assets that should be reused in the new `code-quality-scan-demo-app` repository:

| Asset | Location | Description |
|-------|----------|-------------|
| Code Quality Detector agent | `agents/code-quality-detector.agent.md` | Parses coverage reports, identifies below-threshold functions, reports complexity violations |
| Test Generator agent | `agents/test-generator.agent.md` | Generates tests for uncovered functions, verifies coverage improvement |
| Code Quality instructions | `instructions/code-quality.instructions.md` | Coverage thresholds, complexity limits, testing patterns, CI quality gate |
| Quality ADO pipeline sample | `samples/azure-devops/quality-pipeline.yml` | Sample ADO pipeline for lint, type check, test, coverage |
