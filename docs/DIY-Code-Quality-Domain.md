---
title: "DIY: Build the Code Quality Domain"
description: "Step-by-step guide for creating the Code Quality scanner demo-app and workshop repositories from scratch using the framework's automation artifacts."
ms.date: 2026-04-02
ms.topic: how-to
---

# DIY: Build the Code Quality Domain

This guide walks you through creating the Code Quality domain's two repositories — `code-quality-scan-demo-app` (scanner platform) and `code-quality-scan-workshop` (hands-on labs) — using the automation artifacts already defined in this framework.

## Prerequisites

* GitHub CLI (`gh`) authenticated with `devopsabcs-engineering` org access
* Node.js 20+, Python 3.12+, .NET 8 SDK, Java 21, Go 1.22+
* Azure CLI (`az`) authenticated with an active subscription
* VS Code with GitHub Copilot and the Agentic Accelerator Framework workspace open
* PowerShell 7+

## Step 1: Create GitHub Repositories

Create both repositories in the `devopsabcs-engineering` organization:

**PowerShell:**

```powershell
# Scanner demo-app repository
gh repo create devopsabcs-engineering/code-quality-scan-demo-app `
  --public `
  --description "Code Quality scanner demo-app with 5 sample apps, CI/CD, SARIF, and Power BI PBIP"

# Workshop repository (as template)
gh repo create devopsabcs-engineering/code-quality-scan-workshop `
  --public `
  --template `
  --description "Hands-on Code Quality scanning workshop with 10 labs"
```

<details>
<summary>Bash equivalent</summary>

```bash
# Scanner demo-app repository
gh repo create devopsabcs-engineering/code-quality-scan-demo-app \
  --public \
  --description "Code Quality scanner demo-app with 5 sample apps, CI/CD, SARIF, and Power BI PBIP"

# Workshop repository (as template)
gh repo create devopsabcs-engineering/code-quality-scan-workshop \
  --public \
  --template \
  --description "Hands-on Code Quality scanning workshop with 10 labs"
```

</details>

## Step 2: Scaffold the Demo-App Repository

Use the `/scaffold-domain` prompt with `domain=code-quality` to generate the full repo structure. The `DomainScaffolder` agent loads `skills/domain-scaffolding/SKILL.md` and produces:

* 5 sample app directories with `infra/main.bicep` and `Dockerfile`
* GitHub Actions workflows (ci, scan, coverage gate, deploy-all)
* Azure DevOps YAML pipelines with templates
* SARIF converter stubs (`coverage-to-sarif.py`, `lizard-to-sarif.py`)
* Power BI PBIP directory with TMDL semantic model
* Bootstrap scripts (`setup-oidc.ps1`, `bootstrap-demo-apps.ps1`, ADO variants)
* Copilot artifacts (agents, instructions, prompts, skills)

```text
/scaffold-domain domain=code-quality
```

## Step 3: Scaffold the Workshop Repository

The same scaffolder generates the workshop structure:

* 10 lab directories (lab-00 through lab-08, plus lab-06-ado and lab-07-ado)
* Screenshot automation (`capture-screenshots.ps1`, `screenshot-manifest.json`)
* Dev container with all required tools
* Jekyll site configuration for GitHub Pages
* Delivery tier guides (half-day and full-day for GitHub, ADO, and dual)

## Step 4: Build the 5 Sample Apps

Implement intentional code quality violations in each language:

| App | Language | Framework | Violation Theme |
|-----|----------|-----------|-----------------|
| `code-quality-demo-app-001` | C# | ASP.NET 8 Minimal API | Low coverage (~40%), no unit tests, high complexity methods |
| `code-quality-demo-app-002` | Python | Flask 3.0 | Untested error paths, Pylint violations, deeply nested functions |
| `code-quality-demo-app-003` | Java | Spring Boot 3.2 | Missing JUnit tests, Checkstyle violations, duplicated code |
| `code-quality-demo-app-004` | TypeScript | Next.js 15 | Untested components, ESLint violations, complex reducers |
| `code-quality-demo-app-005` | Go | net/http (stdlib) | No table-driven tests, uncovered error branches, long functions |

Each app should produce 15+ findings when scanned and include:

* `infra/main.bicep` for Azure App Service deployment
* `Dockerfile` for containerized execution
* `start-local.ps1` and `stop-local.ps1` for local development
* A minimal or incomplete test suite (intentionally low coverage)

## Step 5: Write the SARIF Converters

Create two Python converter scripts in `src/converters/`:

* **`coverage-to-sarif.py`** — Accepts cobertura XML, JSON summary (jest), lcov, JaCoCo XML, and Go cover formats. Maps functions below 80% coverage to SARIF results with `ruleId: coverage-below-threshold`.
* **`lizard-to-sarif.py`** — Accepts Lizard CSV output. Maps functions exceeding CCN 10 to SARIF results with `ruleId: ccn-exceeded`.

Both converters must produce SARIF v2.1.0 with `automationDetails.id` prefixed with `code-quality/coverage/` and `partialFingerprints` for deduplication.

## Step 6: Run Bootstrap Scripts

Provision Azure AD federation, GitHub secrets, and environments:

**PowerShell:**

```powershell
# Set up Azure AD app registration and federated credentials
./scripts/setup-oidc.ps1

# Create demo app repos, push content, configure secrets and environments
./scripts/bootstrap-demo-apps.ps1

# (Optional) Set up ADO project, repos, variable groups, and WIF
./scripts/setup-oidc-ado.ps1
./scripts/bootstrap-demo-apps-ado.ps1
```

<details>
<summary>Bash equivalent</summary>

```bash
# Set up Azure AD app registration and federated credentials
pwsh ./scripts/setup-oidc.ps1

# Create demo app repos, push content, configure secrets and environments
pwsh ./scripts/bootstrap-demo-apps.ps1

# (Optional) Set up ADO project, repos, variable groups, and WIF
pwsh ./scripts/setup-oidc-ado.ps1
pwsh ./scripts/bootstrap-demo-apps-ado.ps1
```

</details>

## Step 7: Write the 10 Workshop Labs

Create lab content following the standard progression:

| Lab | Topic | Duration |
|-----|-------|----------|
| Lab 00 | Prerequisites and environment setup | 30 min |
| Lab 01 | Explore demo apps and quality violations | 25 min |
| Lab 02 | ESLint — JavaScript/TypeScript linting | 35 min |
| Lab 03 | Pylint + pytest-cov — Python quality and coverage | 30 min |
| Lab 04 | Checkstyle + JaCoCo — Java quality and coverage | 35 min |
| Lab 05 | dotnet-coverage + Coverlet — C# coverage | 30 min |
| Lab 06 (GitHub) | GitHub Security Tab and SARIF output | 30 min |
| Lab 06 (ADO) | ADO Advanced Security | 35 min |
| Lab 07 (GitHub) | GitHub Actions pipelines | 45 min |
| Lab 07 (ADO) | ADO YAML Pipelines | 50 min |

Labs 00–05 are platform-agnostic. Labs 06 and 07 have GitHub and ADO variants.

## Step 8: Build the Power BI PBIP

Create a star schema semantic model in `power-bi/`:

* **Fact table**: `Fact_CodeQualityFindings` with finding_id, repo_name, rule_id, severity, tool_name, scan_date, file_path, line_number, coverage_percent, ccn_value
* **Dimensions**: Dim_Date, Dim_Repository, Dim_ScanTool, Dim_Language, Dim_Severity
* **Data source**: ADLS Gen2 via `AzureStorage.DataLake()` with OAuth (Organizational Account), or Azure Blob Storage with SAS token (matching existing domain pattern)
* **Report pages**: Quality Overview, Coverage by Repository, Complexity Analysis, Test Generation Tracking
* **Pipeline**: `scan-and-store.ps1` transforms scan results to fact table JSON, `scan-and-store.yml` uploads weekly (Monday 06:00 UTC)

## Step 9: Create Screenshot Automation

Build `capture-screenshots.ps1` with manifest-driven capture:

* Define screenshots in `screenshot-manifest.json` with lab, name, phase, method, and capture parameters
* Support 4 capture methods: `freeze-execute` (Charm), `playwright-navigate`, `playwright-auth`, `script`
* Include `--platform github|ado` parameter for platform-specific labs
* Include `--lab` and `--phase` filters for selective capture
* Target 45–50 screenshots covering all labs

## Step 10: Set Up ADO Pipelines

Mirror every GitHub Actions workflow in ADO YAML:

| GitHub Actions Workflow | ADO Pipeline Equivalent |
|------------------------|------------------------|
| `ci.yml` | `ci-cd.yml` |
| `quality-scan.yml` | `quality-scan.yml` |
| `quality-coverage-gate.yml` | `quality-coverage-gate.yml` |
| `deploy-all.yml` | `deploy-all.yml` |
| `scan-and-store.yml` | `scan-and-store.yml` |

Use `AdvancedSecurity-Publish@1` for SARIF upload in ADO pipelines.

## Validation

After completing all steps, verify:

* All 5 demo apps produce 15+ findings when scanned
* Coverage gate fails when coverage drops below 80%
* SARIF files upload to GitHub Security Tab and ADO Advanced Security
* Workshop labs render on GitHub Pages
* Screenshot script captures all expected images
* Power BI PBIP connects to data source and renders all 4 pages

## References

* [Domain Parity and Contribution Guide](domain-parity-and-contribution.md) — Full contribution checklist and parity comparison
* [Related Repositories](related-repositories.md) — Repository catalog across all domains
* [Implementation Roadmap](implementation-roadmap.md) — Phase 3 status for Code Quality domain
* [Code Quality Scan Skill](../skills/code-quality-scan/SKILL.md) — 4-tool architecture and SARIF mapping
* [Domain Scaffolding Skill](../skills/domain-scaffolding/SKILL.md) — Repo structure templates and conventions
