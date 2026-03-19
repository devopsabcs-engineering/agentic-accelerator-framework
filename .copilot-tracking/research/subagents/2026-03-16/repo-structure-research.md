# Repository Structure Research: agentic-devsecops-framework

## Status: Complete

## Research Topics and Questions

1. What files exist in `.github/` (copilot-instructions.md, agents, instructions, prompts, workflows)?
2. What files exist in the root (README, LICENSE, etc.)?
3. What is the current state of the repository — new/empty or has implementation code?
4. Are there existing GitHub Actions workflows?
5. Are there existing agent files, instruction files, or prompt files?

## Sources

- Direct filesystem inspection of `c:\src\GitHub\devopsabcs-engineering\agentic-devsecops-framework`
- Git history (`git log`, `git remote -v`)
- File search across all file types (`.md`, `.yml`, `.yaml`, `.py`, `.js`, `.ts`, `.json`, `.toml`)

---

## 1. Repository Overview

| Property | Value |
|---|---|
| **Remote** | `https://github.com/devopsabcs-engineering/agentic-devsecops-framework.git` |
| **Default Branch** | `main` |
| **Total Commits** | 6 |
| **First Commit** | 2026-03-16 ("initial commit") |
| **Latest Commit** | 2026-03-17 ("Enhance documentation to clarify Azure DevOps integration...") |
| **Repo Age** | 1-2 days old |
| **State** | **Early-stage research/planning — no implementation code exists** |

### Commit History

| Hash | Date | Message |
|---|---|---|
| `5ff5e23` | 2026-03-16 | initial commit |
| `a42518b` | 2026-03-16 | added key assets |
| `ed8e7e6` | 2026-03-16 | add PDF asset for scanning configuration against supply chain attacks |
| `2171471` | 2026-03-17 | Add comprehensive research document on scanning coding agent configuration files |
| `38c3ba3` | 2026-03-17 | Update references to Daniel Meppiel in prompt file security research documentation |
| `9679481` | 2026-03-17 | Enhance documentation to clarify Azure DevOps integration and security features |

---

## 2. Root Directory Inventory

### Top-Level Structure

```text
agentic-devsecops-framework/
├── .copilot-tracking/       ← Research documents (planning phase)
├── .git/                    ← Git metadata
├── .github/                 ← GitHub config (skills only — no workflows/agents/instructions)
├── .venv/                   ← Python virtual environment (empty — no packages installed)
├── assets/                  ← Reference presentation and PDF assets
```

### What EXISTS in Root

| Item | Exists? |
|---|---|
| README.md | **NO** |
| LICENSE | **NO** (only LICENSE.txt inside skills directories) |
| .gitignore | **NO** (only inside `.venv/`) |
| AGENTS.md | **NO** |
| CLAUDE.md | **NO** |
| apm.yml | **NO** |
| package.json | **NO** |
| requirements.txt | **NO** |
| pyproject.toml | **NO** |
| Any source code (.py, .js, .ts) | **NO** (only inside `.github/skills/` helper scripts) |

---

## 3. `.github/` Directory Analysis

### Current Structure

```text
.github/
└── skills/                  ← 9 skill directories (HVE-installed, not project-specific)
    ├── docx/                ← Word document skill (LICENSE.txt, SKILL.md, scripts/)
    ├── pdf/                 ← PDF skill (forms.md, reference.md, LICENSE.txt, SKILL.md, scripts/)
    ├── power-bi-dax-optimization/    ← SKILL.md
    ├── power-bi-model-design-review/ ← SKILL.md
    ├── power-bi-performance-troubleshooting/ ← SKILL.md
    ├── power-bi-report-design-consultation/  ← SKILL.md
    ├── powerbi-modeling/    ← SKILL.md, references/ (5 .md files)
    ├── pptx/                ← PowerPoint skill (editing.md, pptxgenjs.md, LICENSE.txt, SKILL.md, scripts/)
    └── xlsx/                ← Excel skill (LICENSE.txt, SKILL.md, scripts/)
```

### What DOES NOT EXIST in `.github/`

| Item | Exists? | Priority |
|---|---|---|
| `copilot-instructions.md` | **NO** | **HIGH** — repo-wide Copilot instructions |
| `agents/` directory | **NO** | **HIGH** — custom agent definitions |
| `instructions/` directory | **NO** | **HIGH** — path-specific instructions |
| `prompts/` directory | **NO** | **MEDIUM** — reusable prompt templates |
| `workflows/` directory | **NO** | **HIGH** — GitHub Actions CI/CD |
| `CODEOWNERS` | **NO** | **HIGH** — security review governance |
| `dependabot.yml` | **NO** | **MEDIUM** — dependency updates |
| `FUNDING.yml` | **NO** | LOW |
| `ISSUE_TEMPLATE/` | **NO** | LOW |
| `PULL_REQUEST_TEMPLATE.md` | **NO** | **MEDIUM** |

**Key finding**: The 9 skills in `.github/skills/` are **HVE (Hyper-Velocity Engineering) extension-installed skills** for document editing (docx, pdf, pptx, xlsx) and Power BI — they are **not framework-specific agents**. They were installed by the `ise-hve-essentials.hve-core` VS Code extension.

---

## 4. `.copilot-tracking/` (Existing Research)

### Structure

```text
.copilot-tracking/
└── research/
    ├── 2026-03-16/
    │   └── agentic-devsecops-framework-research.md   ← Main research document (~900+ lines)
    └── subagents/
        └── 2026-03-16/
            ├── accessibility-code-quality-research.md
            ├── cost-analysis-finops-research.md
            ├── ghcp-agent-plugins-research.md
            ├── github-private-agents-research.md
            └── prompt-file-security-research.md
```

### Main Research Document Summary

The main document (`agentic-devsecops-framework-research.md`) is a comprehensive 900+ line research plan covering:

1. Framework architecture (Agentic DevSecOps = GHAS + GHCP Custom Agents + MDC)
2. Core patterns for custom GHCP agents (file spec, YAML frontmatter, tools, handoffs)
3. Security agents (6 agents from `.github-private` patterns)
4. Accessibility agents (axe-core + IBM + custom Playwright, SARIF integration)
5. Code quality agents (coverage-to-SARIF, multi-language)
6. FinOps agents (5 agents, Azure Cost Management APIs)
7. Prompt file security (APM scanning, supply chain attacks)
8. CI/CD integration (GitHub Actions SARIF pipeline, Azure DevOps)
9. Centralized governance (Security Overview, MDC, Defender for DevOps)
10. Agent plugin extensibility
11. Implementation roadmap

### Subagent Research Documents

| Document | Topic |
|---|---|
| `prompt-file-security-research.md` | APM scanning, Unicode attacks, OWASP LLM risks |
| `github-private-agents-research.md` | `.github-private` agent deployment patterns |
| `ghcp-agent-plugins-research.md` | VS Code agent plugin system extensibility |
| `cost-analysis-finops-research.md` | Azure Cost Management APIs, FinOps agent design |
| `accessibility-code-quality-research.md` | axe-core SARIF integration, code quality patterns |

---

## 5. `assets/` Directory

Contains 3 reference files (presentations and a PDF):

| File | Type | Purpose |
|---|---|---|
| `Accessibility Compliance at Scale as a Frontier Firm.pptx` | PowerPoint | Accessibility compliance reference |
| `Scan Your Coding Agent's Configuration for Hidden Supply Chain Attacks.pdf` | PDF | Daniel Meppiel's supply chain security article |
| `TT343 - Agentic AI for DevSecOps - Transforming Security with GHAS and GHCP with NOTES.pptx` | PowerPoint | Main framework presentation with speaker notes |

---

## 6. Python Virtual Environment (`.venv/`)

- Standard Python venv exists but appears to have **no project-specific packages installed**
- Contains only default venv scaffolding (`Include/`, `Lib/`, `Scripts/`, `pyvenv.cfg`)
- No `requirements.txt` or `pyproject.toml` exists in the repo

---

## 7. Key Findings: What Exists vs. What Needs to Be Created

### EXISTS (Foundation)

| Category | Items |
|---|---|
| **Research** | Comprehensive 900+ line research document with full framework design |
| **Subagent research** | 5 completed deep-dive research documents |
| **Reference assets** | 3 presentations/PDFs in `assets/` |
| **HVE skills** | 9 pre-installed skills (docx, pdf, pptx, xlsx, Power BI) — utility, not framework |
| **Git repo** | Initialized, remote connected to GitHub |
| **Python venv** | Empty venv scaffolding |

### NEEDS TO BE CREATED (Framework Implementation)

#### Critical (Core Framework Files)

| File/Directory | Purpose | Designed In Research? |
|---|---|---|
| `README.md` | Project overview, architecture diagram, quick start | Yes (Section 1) |
| `LICENSE` | Open-source license | No |
| `.gitignore` | Git ignore patterns | No |
| `.github/copilot-instructions.md` | Repo-wide Copilot custom instructions | Yes (Section 2) |
| `.github/agents/` | Custom agent definitions directory | Yes (Sections 3-6) |
| `.github/instructions/` | Path-specific instruction files | Yes (Section 4) |
| `.github/prompts/` | Reusable prompt templates | Yes (Sections 4, 5) |
| `.github/workflows/` | GitHub Actions CI/CD pipelines | Yes (Section 8) |
| `.github/CODEOWNERS` | Security review governance for agent files | Yes (Section 7) |

#### Agent Files (From Research Design)

| Agent | File | Domain |
|---|---|---|
| SecurityAgent | `.github/agents/security-agent.md` | Security |
| SecurityReviewerAgent | `.github/agents/security-reviewer-agent.md` | Security |
| SecurityPlanCreatorAgent | `.github/agents/security-plan-creator.agent.md` | Security |
| PipelineSecurityAgent | `.github/agents/pipeline-security-agent.md` | Security |
| IaCSecurityAgent | `.github/agents/iac-security-agent.md` | Security |
| SupplyChainSecurityAgent | `.github/agents/supply-chain-security-agent.md` | Security |
| A11y Detector | `.github/agents/a11y-detector.agent.md` | Accessibility |
| A11y Resolver | `.github/agents/a11y-resolver.agent.md` | Accessibility |
| Code Quality Detector | `.github/agents/code-quality-detector.agent.md` | Code Quality |
| Test Generator | `.github/agents/test-generator.agent.md` | Code Quality |
| CostAnalysisAgent | `.github/agents/cost-analysis-agent.md` | FinOps |
| FinOpsGovernanceAgent | `.github/agents/finops-governance-agent.md` | FinOps |
| CostAnomalyDetectorAgent | `.github/agents/cost-anomaly-detector.agent.md` | FinOps |
| CostOptimizerAgent | `.github/agents/cost-optimizer.agent.md` | FinOps |
| DeploymentCostGateAgent | `.github/agents/deployment-cost-gate.agent.md` | FinOps |

#### Instruction Files

| File | Purpose |
|---|---|
| `.github/instructions/wcag22-rules.instructions.md` | WCAG 2.2 rules (auto-applied to TSX/JSX/HTML/CSS) |
| `.github/instructions/a11y-remediation.instructions.md` | Accessibility remediation patterns |
| `.github/instructions/security-review.instructions.md` | Security review standards |

#### Prompt Files

| File | Purpose |
|---|---|
| `.github/prompts/a11y-scan.prompt.md` | Quick accessibility scan invocation |
| `.github/prompts/a11y-fix.prompt.md` | Quick accessibility fix invocation |
| `.github/prompts/security-review.prompt.md` | Security review prompt template |

#### Workflow Files

| File | Purpose |
|---|---|
| `.github/workflows/apm-security.yml` | APM agent config security scanning |
| `.github/workflows/sarif-pipeline.yml` | Unified SARIF upload pipeline |
| `.github/workflows/accessibility-scan.yml` | Accessibility CI scanning |
| `.github/workflows/code-quality.yml` | Code quality and coverage gates |

#### Other

| File | Purpose |
|---|---|
| `apm.yml` | APM manifest for agent dependency management |
| `docs/` directory | Extended documentation (architecture, getting started, agent catalog) |

---

## 8. Discovered Research Topics and Questions

All discovery topics were answered through direct filesystem inspection:

- **No additional agent frameworks** found — the repo is purely in planning/research phase
- **No CI/CD configuration** exists — workflows need to be created from scratch
- **HVE skills are utility tools**, not framework agents — they handle document generation (docx/pdf/pptx/xlsx) and Power BI, installed by the HVE VS Code extension

---

## 9. Clarifying Questions

1. **License type**: What open-source license should be used? (MIT, Apache 2.0, etc.)
2. **Implementation priority**: Should agents be implemented repository-scoped first (`.github/agents/`) or designed for `.github-private` org-wide deployment from the start?
3. **Scope of initial implementation**: Should all 15+ agents be created in the first pass, or start with a subset (e.g., 1 per domain)?
4. **Sample application**: Does the framework need a sample/demo application to test agents against, or will agents be designed generically?
5. **APM adoption**: Should `apm.yml` and APM workflow be included immediately, or deferred?
