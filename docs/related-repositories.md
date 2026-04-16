---
title: "Related Repositories"
description: "Catalog of all repositories in the Agentic Accelerator Framework ecosystem, organized by domain with links and status tracking."
ms.date: 2026-04-02
ms.topic: reference
---

# Related Repositories

## Overview

The Agentic Accelerator Framework uses a multi-repo architecture. One central framework repository defines agents, skills, prompts, instructions, and documentation that apply across all domains. Each scanning domain follows a **two-repo pattern**: a demo-app repository that owns the scanner engine, sample apps, CI/CD pipelines, and Copilot artifacts, and a workshop repository that teaches practitioners through progressive hands-on labs.

```text
agentic-accelerator-framework          ← Framework (agents, skills, prompts, docs)
agentic-accelerator-workshop            ← Framework workshop
├── accessibility-scan-demo-app         ← Accessibility scanner + 5 demo apps
├── accessibility-scan-workshop         ← 8 labs teaching accessibility scanning
├── finops-scan-demo-app                ← FinOps scanner + 5 demo apps
├── finops-scan-workshop                ← 8 labs teaching FinOps scanning
├── code-quality-scan-demo-app          ← Code Quality scanner + 5 demo apps
└── code-quality-scan-workshop          ← 8 labs teaching code quality scanning
```

## Repository Catalog

| # | Repository | Type | Domain | Status | Primary Language |
|---|---|---|---|---|---|
| 1 | `agentic-accelerator-framework` | Framework | All | Active | Markdown/YAML |
| 2 | `agentic-accelerator-workshop` | Workshop | Framework | Active | TypeScript |
| 3 | `accessibility-scan-demo-app` | Scanner Demo | Accessibility | Active | TypeScript |
| 4 | `accessibility-scan-workshop` | Workshop | Accessibility | Active | PowerShell |
| 5 | `finops-scan-demo-app` | Scanner Demo | FinOps | Active | PowerShell |
| 6 | `finops-scan-workshop` | Workshop | FinOps | Active | PowerShell |
| 7 | `code-quality-scan-demo-app` | Scanner Demo | Code Quality | Active | TypeScript/Multi |
| 8 | `code-quality-scan-workshop` | Workshop | Code Quality | Active | PowerShell |

All repositories live under the `devopsabcs-engineering` GitHub organization.

## Accessibility Domain

### `accessibility-scan-demo-app`

Full-stack Next.js 15 accessibility scanner with Web UI, REST API, CLI, and GitHub Action. Ships as a Docker container deployed to Azure App Service.

| Aspect | Detail |
|---|---|
| Scanner engines | axe-core 4.11, IBM Equal Access 4.0, 5 custom Playwright checks |
| Sample apps | 5 web apps (Rust, C#, Java, Python, Go) with 15+ WCAG violations each |
| SARIF generation | Native (built-in TypeScript SARIF v2.1.0 generator) |
| Copilot artifacts | 2 agents, 2 prompts, 3 instructions, 0 skills |
| GitHub Actions | 5 workflows (ci, deploy, a11y-scan, deploy-all, scan-all) |
| ADO pipelines | 10 pipelines + 5 templates |
| Power BI PBIP | `a11y-pbi-report/A11yReport.pbip` (1 page) |
| Bootstrap scripts | `bootstrap-demo-apps.ps1`, `bootstrap-demo-apps-ado.ps1`, `setup-oidc.ps1`, `setup-oidc-ado.ps1` |

### `accessibility-scan-workshop`

Eight hands-on labs teaching WCAG 2.2 Level AA accessibility scanning using the demo-app scanner. Delivered as a GitHub Pages site with a dev container for zero-setup environments.

| Aspect | Detail |
|---|---|
| Labs | 8 labs (Lab 00–07), platform-agnostic through Lab 05 |
| Delivery tiers | Half-day (3 h), Full-day GitHub (6.5 h), Full-day ADO (7 h), Full-day Dual (8.5 h) |
| Screenshot script | `capture-screenshots.ps1` (~900+ lines, 47 PNGs, 3 phases) |
| Workshop agent | Yes (workshop-specific agent in `.github/agents/`) |
| Template repo | Yes |

## FinOps Domain

### `finops-scan-demo-app`

Central `finops-scan.yml` workflow with matrix strategy scanning 5 IaC sample apps for cost governance violations using PSRule for Azure, Checkov, Cloud Custodian, and Infracost.

| Aspect | Detail |
|---|---|
| Scanner tools | PSRule for Azure, Checkov, Cloud Custodian, Infracost |
| Sample apps | 5 IaC apps (Bicep + HTML) with cost governance violations |
| SARIF generation | Mixed: PSRule and Checkov native; Cloud Custodian and Infracost via Python converters |
| Copilot artifacts | 5 agents, 2 prompts, 2 instructions, 1 skill |
| GitHub Actions | 4 workflows (finops-scan, finops-cost-gate, deploy-all, teardown-all) |
| ADO pipelines | 5 pipelines + 2 templates |
| Power BI PBIP | `power-bi/FinOpsReport.pbip` (1 page) |
| Bootstrap scripts | `bootstrap-demo-apps.ps1`, `bootstrap-demo-apps-ado.ps1`, `setup-oidc.ps1`, `setup-oidc-ado.ps1` |

### `finops-scan-workshop`

Eight hands-on labs teaching FinOps scanning and cost governance. Delivered as a GitHub Pages site with a dev container.

| Aspect | Detail |
|---|---|
| Labs | 8 labs (Lab 00–07), platform-agnostic through Lab 05 |
| Delivery tiers | Half-day (3.5 h), Full-day GitHub (7.25 h), Full-day ADO (7 h), Full-day Dual (8.5 h) |
| Screenshot script | `capture-screenshots.ps1` (~710+ lines, 46 PNGs) |
| Workshop agent | No |
| Template repo | Yes |

## Code Quality Domain

### `code-quality-scan-demo-app`

Multi-language code quality scanner using MegaLinter, jscpd, Lizard, and per-language coverage tools. Follows the 4-tool architecture defined in the framework's [code-quality-scan skill](../skills/code-quality-scan/SKILL.md).

| Aspect | Detail |
|---|---|
| Scanner tools | MegaLinter (orchestrator), jscpd, Lizard, per-language coverage (jest, pytest-cov, Coverlet, JaCoCo, go test) |
| Sample apps | 5 apps (C#, Python, Java, TypeScript, Go) with intentional quality violations |
| SARIF generation | Mixed: MegaLinter and jscpd native; Lizard via `lizard-to-sarif.py`, coverage via `coverage-to-sarif.py` |
| Copilot artifacts | 2 agents (CodeQualityDetector, TestGenerator), 2 prompts, instructions, 1 skill |
| SARIF category | `code-quality/coverage/` |
| Power BI PBIP | `power-bi/` (4 pages: Quality Overview, Coverage by Repository, Complexity Analysis, Test Generation Tracking) |

### `code-quality-scan-workshop`

Eight hands-on labs teaching code quality scanning across multiple languages.

| Aspect | Detail |
|---|---|
| Labs | 8 labs (Lab 00–07) covering ESLint, Pylint, Checkstyle, dotnet-coverage, SARIF, CI/CD |
| Delivery tiers | 5 tiers following the standard half-day/full-day/dual pattern |
| Dual platform | GitHub Actions (Lab 06-github, Lab 07-github) and ADO Pipelines (Lab 06-ado, Lab 07-ado) |
| Template repo | Yes |

## Two-Repo Pattern

Each domain follows the two-repo pattern documented in [Domain Parity and Contribution Guide](domain-parity-and-contribution.md). The demo-app repo owns scanning logic, Copilot artifacts, and infrastructure. The workshop repo is a GitHub template that teaches practitioners through progressive labs.

## Adding New Domains

Use the **DomainScaffolder** agent ([agents/domain-scaffolder.agent.md](../agents/domain-scaffolder.agent.md)) and the **scaffold-domain** prompt ([prompts/scaffold-domain.prompt.md](../prompts/scaffold-domain.prompt.md)) to automate new domain creation. The scaffolding system generates both the demo-app and workshop repositories with full structural parity to existing domains, including:

- 5 sample apps with intentional violations
- Copilot artifacts (agents, prompts, instructions, skills)
- CI/CD pipelines for GitHub Actions and Azure DevOps
- Bootstrap and OIDC setup scripts
- Power BI PBIP with star schema semantic model
- Workshop labs with automated screenshot capture

See [instructions/domain-scaffolding.instructions.md](../instructions/domain-scaffolding.instructions.md) for the complete scaffolding conventions and [skills/domain-scaffolding/SKILL.md](../skills/domain-scaffolding/SKILL.md) for the domain knowledge package.
