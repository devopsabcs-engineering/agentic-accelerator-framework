<!-- markdownlint-disable-file -->
# Release Changes: Agentic DevSecOps Workshop

**Related Plan**: agentic-devsecops-workshop-plan.instructions.md
**Implementation Date**: 2026-03-18

## Summary

Build a complete hands-on workshop repository with 12 progressive labs teaching developers to use AI-powered DevSecOps agents from the Agentic DevSecOps Framework.

## Changes

### Added

* `README.md` — Workshop main entry point with 12-lab checklist, delivery tiers, Mermaid dependency diagram
* `LICENSE` — MIT License
* `CODE_OF_CONDUCT.md` — Microsoft Open Source Code of Conduct
* `CONTRIBUTING.md` — Workshop contribution guidelines
* `_config.yml` — Jekyll theme config for GitHub Pages
* `.gitignore` — Node.js, Next.js, coverage exclusions
* `.github/copilot-instructions.md` — Workshop-specific Copilot instructions
* `.github/workflows/security-scan.yml` — Security scanning workflow from framework
* `.github/workflows/accessibility-scan.yml` — Accessibility scanning workflow from framework
* `.github/workflows/code-quality.yml` — Code quality workflow from framework
* `.github/workflows/finops-cost-gate.yml` — FinOps cost gate workflow from framework
* `.devcontainer/devcontainer.json` — Codespaces config with Node.js 20, required extensions
* `agents/` — 15 agent definitions copied from framework (security, a11y, code quality, FinOps)
* `instructions/` — 3 instruction files copied from framework
* `prompts/` — 2 prompt template files copied from framework
* `skills/a11y-scan/SKILL.md` — Accessibility scan skill package
* `skills/security-scan/SKILL.md` — Security scan skill package
* `sample-app/` — Full Next.js 14 app with 40+ intentional vulnerabilities
* `apm.yml` — Agent Policy Manager configuration
* `validation-results.sarif` — SARIF output file for Lab 06 walkthrough
* `images/lab-00/` through `images/lab-11/` — 12 screenshot directories with .gitkeep and README placeholders
* `labs/lab-00-setup.md` — Lab 00: Prerequisites and Environment Setup (30 min, Beginner)
* `labs/lab-01.md` — Lab 01: Explore the Sample App (25 min, Beginner)
* `labs/lab-02.md` — Lab 02: Understanding Agents, Skills, and Instructions (20 min, Beginner)
* `labs/lab-03.md` — Lab 03: Security Scanning with Copilot Agents (40 min, Intermediate)
* `labs/lab-04.md` — Lab 04: Accessibility Scanning with Copilot Agents (35 min, Intermediate)
* `labs/lab-05.md` — Lab 05: Code Quality Analysis with Copilot Agents (35 min, Intermediate)
* `labs/lab-06.md` — Lab 06: Understanding SARIF Output (30 min, Intermediate)
* `labs/lab-07.md` — Lab 07: Setting Up GitHub Actions Pipelines (40 min, Intermediate)
* `labs/lab-08.md` — Lab 08: Viewing Results in GitHub Security Tab (25 min, Intermediate)
* `labs/lab-09.md` — Lab 09: FinOps Agents and Azure Cost Governance (45 min, Advanced, Optional)
* `labs/lab-10.md` — Lab 10: Agent Remediation Workflows (45 min, Advanced)
* `labs/lab-11.md` — Lab 11: Creating Your Own Custom Agent (45 min, Advanced)

### Modified

### Removed

* `sample-app/coverage/` — Removed build artifact from framework copy (students generate their own)

## Additional or Deviating Changes

* Phase 1 initial commit pushed directly to `main` instead of via PR because the repository was empty (no main branch existed)
  * Reason: GitHub cannot create a PR without a base branch
* Repository marked as GitHub Template via `gh repo edit --template`
* Default branch set to `main` via `gh repo edit --default-branch main`
* `apm.yml` and `validation-results.sarif` were not copied in Phase 1 subagent execution; added in Phase 4 commit
  * Reason: Phase 1 subagent copied directory-level assets but missed root-level individual files

## Release Summary

Total files affected: 76 files created across 6 phases in 5 PRs

**Files created:**
* 12 lab files in `labs/`
* 15 agent definitions in `agents/`
* 3 instruction files in `instructions/`
* 2 prompt files in `prompts/`
* 2 skill packages in `skills/`
* 4 GitHub Actions workflows in `.github/workflows/`
* 12 image directories with README placeholders
* 1 devcontainer config
* 1 copilot instructions file
* ~20 sample-app source files
* 6 community/config files (README, LICENSE, CODE_OF_CONDUCT, CONTRIBUTING, _config.yml, .gitignore)
* 2 framework assets (apm.yml, validation-results.sarif)

**ADO Work Items:** Epic #2094 → Feature #2095 → User Stories #2096, #2097, #2098, #2099, #2100, #2101

**GitHub PRs:** #1 (foundation labs), #2 (scanning labs), #3 (CI/CD labs), #4 (advanced labs), #5 (config/polish)

**Repository Configuration:** Template repository enabled, default branch set to `main`

**Deployment notes:** GitHub Pages can be enabled via Settings → Pages → main/root. The _config.yml is ready for minima theme.
