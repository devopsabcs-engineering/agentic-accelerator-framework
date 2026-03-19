---
applyTo: '.copilot-tracking/changes/2026-03-17/agentic-devsecops-framework-changes.md'
---
<!-- markdownlint-disable-file -->
# Implementation Plan: Agentic DevSecOps Framework

## Overview

Build a comprehensive, repeatable Agentic DevSecOps Framework repository — structured for `.github-private` org-wide deployment from the start — that leverages custom GitHub Copilot agents, GitHub Advanced Security, and Microsoft Defender for Cloud to shift security and compliance left — covering security, accessibility, code quality, FinOps, and prompt file security domains with SARIF-based CI/CD integration across GitHub Actions and Azure DevOps. Includes a sample/demo application with intentional issues for agent testing and validation.

## Objectives

### User Requirements

* Define the framework architecture and core patterns (custom GHCP agents, instructions, prompts, skills) — Source: Task implementation requests in research document
* Document security custom agents (from `.github-private` repo patterns) — Source: Research §3
* Document accessibility compliance agents (a11y detector/resolver, WCAG 2.2, SARIF output) — Source: Research §4
* Define code quality agents (code coverage ≥80%, SARIF reporting) — Source: Research §5
* Define cost analysis / FinOps agents (Azure SDK cost APIs, spending visualization) — Source: Research §6
* Address prompt/instruction file security (supply chain attack scanning of `.md` agent files) — Source: Research §7
* Integrate CI/CD pipelines (GitHub Actions + Azure DevOps) with SARIF → Security Overview → Defender for DevOps — Source: Research §8
* Define agent plugin/extensibility model (VS Code agent plugins, organization-wide skills) — Source: Research §10
* Provide implementation roadmap and proof-of-value examples — Source: Research §11
* **GitHub is the preferred platform; Azure DevOps is a first-class citizen** — Source: Research scope

### Derived Objectives

* Create repository scaffolding (README.md, LICENSE, .gitignore, directory structure) using `.github-private` org-wide layout with `agents/` at repo root — Derived from: user decision to design for org-wide deployment from the start
* Create `.github/copilot-instructions.md` for repo-wide agent conventions — Derived from: GHCP agent deployment model requiring base instructions
* Create `.github/CODEOWNERS` for security governance of agent config files — Derived from: Research §7 prompt file security recommendations
* Create `apm.yml` manifest for agent dependency management — Derived from: Research §7 APM adoption (included immediately per user decision)
* Create `mcp.json` for ADO work items MCP server configuration — Derived from: user requirement to integrate ADO work item tracking
* Create reusable GitHub Actions workflows as CI/CD reference implementations — Derived from: Research §8 pipeline patterns
* Create Power BI dashboard documentation for ADO Security Overview gaps — Derived from: Research §8 ADO platform parity
* Create sample/demo application with intentional security, a11y, quality, and cost issues for agent testing — Derived from: user decision that framework needs a sample app

## Context Summary

### Project Files

* `.copilot-tracking/research/2026-03-16/agentic-devsecops-framework-research.md` - Primary research document (900+ lines) covering all 11 framework sections
* `.copilot-tracking/research/subagents/2026-03-16/github-private-agents-research.md` - 8 proven agents from `.github-private` repo
* `.copilot-tracking/research/subagents/2026-03-16/accessibility-code-quality-research.md` - A11y scanner architecture and code quality patterns
* `.copilot-tracking/research/subagents/2026-03-16/cost-analysis-finops-research.md` - Azure Cost Management APIs and FinOps agent design
* `.copilot-tracking/research/subagents/2026-03-16/prompt-file-security-research.md` - APM audit and supply chain attack vectors
* `.copilot-tracking/research/subagents/2026-03-16/ghcp-agent-plugins-research.md` - Agent plugin extensibility model
* `.copilot-tracking/research/subagents/2026-03-16/repo-structure-research.md` - Current repo state assessment (greenfield)
* `assets/TT343 - Agentic AI for DevSecOps - Transforming Security with GHAS and GHCP with NOTES.pptx` - Presentation source for security agents
* `assets/Accessibility Compliance at Scale as a Frontier Firm.pptx` - Presentation source for a11y scanner
* `assets/Scan Your Coding Agent's Configuration for Hidden Supply Chain Attacks.pdf` - Daniel Meppiel's article on APM

### References

* Research §1: Framework architecture — core formula, Mermaid architecture diagram, agent domain categories
* Research §2: Core patterns — agent deployment model, file specification, YAML frontmatter, complementary artifacts
* Research §3: Security agents — 6 proven agents, cross-reference map, design patterns, CI/CD 8-domain pipeline
* Research §4: Accessibility agents — three-engine scanner, SARIF mapping, Detector/Resolver pair, compliance controls
* Research §5: Code quality agents — coverage-to-SARIF mapping, multi-language tools, quality gate pattern
* Research §6: FinOps agents — 5-agent family, Azure Cost Management APIs, finding schema, repo-to-cost attribution
* Research §7: Prompt file security — APM audit, attack categories, OWASP LLM alignment, recommended controls
* Research §8: CI/CD integration — GitHub Actions SARIF pipeline, Azure DevOps pipeline, platform feature comparison, Power BI dashboards
* Research §9: Centralized governance — data flow, Security Overview, MDC, Defender for DevOps, complementary dashboards
* Research §10: Agent plugin extensibility — plugin architecture, marketplaces, extensibility comparison, org-scale sharing
* Research §11: Implementation roadmap — 5-phase rollout, cross-cutting governance

### Standards References

* SARIF v2.1.0: OASIS SARIF specification
* WCAG 2.2 Level AA: W3C accessibility standard
* OWASP Top 10: Application security risks
* OWASP LLM Top 10: AI/LLM security risks
* CIS Azure Benchmarks, NIST 800-53, PCI-DSS: Compliance frameworks
* GitHub Agent specification: Custom agent YAML frontmatter schema

## Implementation Checklist

### [x] Implementation Phase 1: Repository Scaffolding

<!-- parallelizable: true -->

* [x] Step 1.1: Create root documentation files (README.md, LICENSE, .gitignore)
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 15-66)
* [x] Step 1.2: Create `.github/copilot-instructions.md` with repo-wide conventions
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 68-95)
* [x] Step 1.3: Create `.github/CODEOWNERS` for agent config governance
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 97-118)
* [x] Step 1.4: Create directory structure — `.github-private`-compatible layout with `agents/`, `instructions/`, `prompts/`, `skills/` at repo root + `.github/workflows/`, `docs/`, `sample-app/`
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 120-155)
* [x] Step 1.5: Create `mcp.json` — MCP server configuration for ADO work items integration
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 157-180)

### [x] Implementation Phase 2: Framework Documentation

<!-- parallelizable: true -->

* [x] Step 2.1: Create `docs/architecture.md` — framework architecture, Mermaid diagrams, core formula
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 151-189)
* [x] Step 2.2: Create `docs/agent-patterns.md` — agent file specification, YAML frontmatter schema, deployment model
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 191-229)
* [x] Step 2.3: Create `docs/sarif-integration.md` — SARIF v2.1.0 mapping for all domains, upload patterns, limits
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 231-274)
* [x] Step 2.4: Create `docs/platform-comparison.md` — GitHub vs Azure DevOps feature matrix, dual-platform governance
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 276-313)
* [x] Step 2.5: Create `docs/implementation-roadmap.md` — 5-phase rollout, proof-of-value examples, cross-cutting governance
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 315-358)

### [x] Implementation Phase 3: Security Agents (Proven Pattern)

<!-- parallelizable: true -->

All agent files created in `agents/` at repo root (`.github-private` org-wide layout).

* [x] Step 3.1: Create `agents/security-agent.agent.md` — holistic security orchestrator
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 364-404)
* [x] Step 3.2: Create `agents/security-reviewer-agent.agent.md` — OWASP Top 10 code-level vulnerability detection
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 406-430)
* [x] Step 3.3: Create `agents/security-plan-creator.agent.md` — cloud security plan from IaC blueprints
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 432-455)
* [x] Step 3.4: Create `agents/pipeline-security-agent.agent.md` — CI/CD pipeline hardening
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 457-480)
* [x] Step 3.5: Create `agents/iac-security-agent.agent.md` — Terraform/Bicep/K8s misconfiguration scanning
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 482-505)
* [x] Step 3.6: Create `agents/supply-chain-security-agent.agent.md` — secrets, dependencies, SBOM, governance
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 507-531)

### [x] Implementation Phase 4: Accessibility Agents (Proven Pattern)

<!-- parallelizable: true -->

* [x] Step 4.0: Create `skills/a11y-scan/SKILL.md` — accessibility scanning domain knowledge skill (repo root `skills/` for `.github-private` layout)
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 535-555)
* [x] Step 4.1: Create `agents/a11y-detector.agent.md` — WCAG 2.2 compliance detector with 5-step protocol
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 557-597)
* [x] Step 4.2: Create `agents/a11y-resolver.agent.md` — accessibility fix agent with 6-step protocol
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 579-613)
* [x] Step 4.3: Create `instructions/wcag22-rules.instructions.md` — auto-applied WCAG rules (repo root `instructions/` for `.github-private` layout)
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 615-640)
* [x] Step 4.4: Create `instructions/a11y-remediation.instructions.md` — remediation patterns
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 642-662)
* [x] Step 4.5: Create `prompts/a11y-scan.prompt.md` and `prompts/a11y-fix.prompt.md`
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 664-690)

### [x] Implementation Phase 5: Code Quality Agents (New)

<!-- parallelizable: true -->

* [x] Step 5.0: Create `skills/security-scan/SKILL.md` — security scanning domain knowledge skill (repo root `skills/` for `.github-private` layout)
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 694-714)
* [x] Step 5.1: Create `agents/code-quality-detector.agent.md` — coverage analysis, lint violations, complexity
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 716-756)
* [x] Step 5.2: Create `agents/test-generator.agent.md` — auto-generate tests for uncovered code
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 738-770)
* [x] Step 5.3: Create `instructions/code-quality.instructions.md` — coverage thresholds and testing patterns (repo root `instructions/`)
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 772-795)

### [x] Implementation Phase 6: FinOps / Cost Analysis Agents (New)

<!-- parallelizable: true -->

* [x] Step 6.1: Create `agents/cost-analysis-agent.agent.md` — Azure cost queries and report generation
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 801-835)
* [x] Step 6.2: Create `agents/finops-governance-agent.agent.md` — tag compliance monitoring
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 837-862)
* [x] Step 6.3: Create `agents/cost-anomaly-detector.agent.md` — anomaly detection and investigation
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 864-888)
* [x] Step 6.4: Create `agents/cost-optimizer-agent.agent.md` — Azure Advisor recommendations
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 890-912)
* [x] Step 6.5: Create `agents/deployment-cost-gate-agent.agent.md` — block deployments exceeding budget
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 914-942)

### [x] Implementation Phase 7: Prompt File Security & APM

<!-- parallelizable: true -->

* [x] Step 7.1: Create `apm.yml` manifest — declare all agent dependencies
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 948-982)
* [x] Step 7.2: Create `docs/prompt-file-security.md` — threat model, attack categories, mitigation controls
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 984-1020)

### [x] Implementation Phase 8: CI/CD Workflows

<!-- parallelizable: false -->

Depends on: Phase 1 (directory structure), Phase 3-7 (agent files referenced in workflows)

* [x] Step 8.1: Create `.github/workflows/security-scan.yml` — SAST + SCA + IaC + secrets + DAST pipeline with SARIF upload
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 1026-1072)
* [x] Step 8.2: Create `.github/workflows/accessibility-scan.yml` — three-engine a11y scanner with SARIF + threshold gating
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 1074-1110)
* [x] Step 8.3: Create `.github/workflows/code-quality.yml` — coverage enforcement with SARIF + quality gate
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 1112-1147)
* [x] Step 8.4: Create `.github/workflows/apm-security.yml` — APM audit of agent config files on PR (covers repo-root `agents/`, `instructions/`, `prompts/` paths)
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 1149-1180)
* [x] Step 8.5: Create `.github/workflows/finops-cost-gate.yml` — cost estimation gate for IaC PRs with SARIF upload (`finops-finding/`)
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 1182-1220)
* [x] Step 8.6: Create `docs/azure-devops-pipelines.md` — ADO pipeline equivalents with GHAzDO tasks
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 1217-1260)

### [x] Implementation Phase 9: Agent Extensibility & Governance Documentation

<!-- parallelizable: true -->

* [x] Step 9.1: Create `docs/agent-extensibility.md` — plugin model, marketplace, MCP servers, org-scale sharing
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 1266-1300)
* [x] Step 9.2: Create `docs/centralized-governance.md` — Security Overview + MDC + Defender for DevOps + Power BI data flows
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 1302-1342)

### [x] Implementation Phase 10: Sample/Demo Application

<!-- parallelizable: false -->

Depends on: Phase 1 (directory structure), Phase 3-6 (agents to test against)

* [x] Step 10.1: Create `sample-app/` — Next.js web application scaffold with intentional issues across all 4 domains
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 1348-1395)
* [x] Step 10.2: Inject intentional security vulnerabilities — hardcoded secrets, SQL injection, XSS, insecure IaC
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 1397-1425)
* [x] Step 10.3: Inject intentional accessibility violations — missing alt text, no labels, low contrast, broken heading hierarchy
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 1427-1450)
* [x] Step 10.4: Inject intentional code quality issues — functions below 80% coverage, high complexity, no tests
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 1452-1475)
* [x] Step 10.5: Create sample IaC with cost governance gaps — untagged resources, oversized SKUs, missing budgets
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 1477-1500)
* [x] Step 10.6: Create `sample-app/README.md` — documents intentional issues and expected agent findings per domain
  * Details: .copilot-tracking/details/2026-03-17/agentic-devsecops-framework-details.md (Lines 1502-1520)

### [x] Implementation Phase 11: Validation

<!-- parallelizable: false -->

* [x] Step 11.1: Validate all agent files have well-formed YAML frontmatter
  * Verify `name`, `description`, `tools`, optional `model` and `handoffs` fields
  * Verify character count ≤ 30,000 per agent
* [x] Step 11.2: Validate all instruction files have correct `applyTo` glob patterns
  * Verify glob patterns match intended file types
* [x] Step 11.3: Validate all Markdown files for link integrity
  * Check cross-references between docs files
  * Verify Mermaid diagram syntax
* [x] Step 11.4: Validate SARIF category uniqueness across all workflow files
  * Ensure no duplicate `automationDetails.id` categories
* [x] Step 11.5: Run APM audit dry-run on all agent config files
  * `apm audit` to verify no hidden Unicode in committed files
* [x] Step 11.6: Validate `mcp.json` configuration
  * Valid JSON schema
  * No hardcoded credentials (uses environment variable references)
  * MCP server command is valid
* [x] Step 11.7: Test agents against sample-app — verify each domain's agents can detect the intentional issues
  * Security agents find injected vulnerabilities
  * A11y agents find injected WCAG violations
  * Code quality agents identify below-threshold coverage
  * FinOps agents flag untagged/oversized IaC resources
* [x] Step 11.8: Fix minor validation issues iteratively
  * Apply fixes directly for straightforward corrections
* [x] Step 11.9: Report blocking issues requiring additional research

## Planning Log

See [agentic-devsecops-framework-log.md](../../plans/logs/2026-03-17/agentic-devsecops-framework-log.md) for discrepancy tracking, implementation paths considered, and suggested follow-on work.

## Dependencies

* GitHub Copilot with custom agent support (VS Code + GitHub.com)
* GitHub Advanced Security (GHAS) — for code scanning, secret scanning, Dependabot
* GitHub Advanced Security for Azure DevOps (GHAzDO) — for ADO platform parity
* Microsoft Defender for Cloud with GitHub + ADO connectors
* APM (Agent Package Manager) — `microsoft/apm` v0.8.0+ for `apm audit` and dependency management
* `microsoft/apm-action` — GitHub Action for CI/CD APM scanning
* `github/codeql-action/upload-sarif@v4` — SARIF upload action
* MSDO (Microsoft Security DevOps) — for IaC scanning tools
* axe-core + IBM Equal Access + Playwright — accessibility scanning engines
* Azure Cost Management SDK (`azure-mgmt-costmanagement>=4.0.1`) — FinOps API access
* Power BI Desktop — for `advsec-pbi-report-ado` dashboard
* Node.js + Next.js — sample application runtime
* MCP server for ADO work items — configured via `mcp.json`

## Success Criteria

* Repository structured for `.github-private` org-wide deployment: `agents/`, `instructions/`, `prompts/`, `skills/` at repo root — Traces to: user decision for org-wide deployment from the start
* All 15+ agent files created in `agents/` with valid YAML frontmatter and ≤30,000 character prompts — Traces to: Research §2 agent specification
* 6 security agents match `.github-private` proven patterns — Traces to: Research §3 + subagent github-private-agents-research
* 2 accessibility agents implement Detector ↔ Resolver handoff — Traces to: Research §4 agent pair pattern
* 2 code quality agents implement coverage-to-SARIF pipeline — Traces to: Research §5 proposed architecture
* 5 FinOps agents cover cost analysis through deployment gating — Traces to: Research §6 agent family
* 5+ GitHub Actions workflows produce SARIF with distinct `automationDetails.id` categories — Traces to: Research §8 unified SARIF pipeline
* `apm.yml` manifest declares all agent dependencies — Traces to: Research §7 APM adoption (immediate)
* `mcp.json` configures ADO work items MCP server — Traces to: user requirement for ADO work item integration
* `.github/CODEOWNERS` protects all agent config paths (repo-root `agents/`, `instructions/`, `prompts/`, `skills/`) — Traces to: Research §7 security controls
* ADO pipeline documentation provides equivalent patterns for all GitHub workflows — Traces to: Research §8 Azure DevOps first-class citizen
* Framework architecture documented with Mermaid diagrams and domain category table — Traces to: Research §1
* Sample application in `sample-app/` contains intentional issues across all 4 domains — Traces to: user decision for demo app
* Agents successfully detect intentional issues in sample-app during validation — Traces to: Phase 11 validation
* Implementation roadmap with 5 phases documented with proof-of-value examples — Traces to: Research §11
