<!-- markdownlint-disable-file -->
# Release Changes: Agentic DevSecOps Framework

**Related Plan**: agentic-devsecops-framework-plan.instructions.md
**Implementation Date**: 2026-03-17

## Summary

Build a comprehensive Agentic DevSecOps Framework repository structured for `.github-private` org-wide deployment, leveraging custom GitHub Copilot agents, GitHub Advanced Security, and Microsoft Defender for Cloud across security, accessibility, code quality, and FinOps domains with SARIF-based CI/CD integration.

## Changes

### Added

* `README.md` - Repository overview with architecture diagram and domain descriptions
* `LICENSE` - MIT license
* `.gitignore` - Python, Node.js, IDE, coverage, SARIF ignore patterns
* `.github/copilot-instructions.md` - Repo-wide GHCP agent conventions (SARIF, severity, output format)
* `.github/CODEOWNERS` - Security governance for agent config paths
* `mcp.json` - MCP server configuration for ADO work items
* `apm.yml` - Agent Package Manager manifest declaring all agent dependencies
* `agents/security-agent.agent.md` - Holistic security orchestrator (AB#2047)
* `agents/security-reviewer-agent.agent.md` - OWASP Top 10 vulnerability detection (AB#2048)
* `agents/security-plan-creator.agent.md` - Cloud security plan from IaC (AB#2049)
* `agents/pipeline-security-agent.agent.md` - CI/CD pipeline hardening (AB#2050)
* `agents/iac-security-agent.agent.md` - Terraform/Bicep/K8s scanning (AB#2051)
* `agents/supply-chain-security-agent.agent.md` - Secrets, dependencies, SBOM (AB#2052)
* `agents/a11y-detector.agent.md` - WCAG 2.2 compliance detector (AB#2054)
* `agents/a11y-resolver.agent.md` - Accessibility fix agent (AB#2055)
* `agents/code-quality-detector.agent.md` - Coverage analysis, lint, complexity (AB#2060)
* `agents/test-generator.agent.md` - Auto-generate tests for uncovered code (AB#2061)
* `agents/cost-analysis-agent.agent.md` - Azure cost queries and reporting (AB#2063)
* `agents/finops-governance-agent.agent.md` - Tag compliance monitoring (AB#2064)
* `agents/cost-anomaly-detector.agent.md` - Cost anomaly detection (AB#2065)
* `agents/cost-optimizer-agent.agent.md` - Azure Advisor recommendations (AB#2066)
* `agents/deployment-cost-gate-agent.agent.md` - Deployment budget gating (AB#2067)
* `instructions/wcag22-rules.instructions.md` - Auto-applied WCAG 2.2 rules (AB#2056)
* `instructions/a11y-remediation.instructions.md` - A11y remediation patterns (AB#2057)
* `instructions/code-quality.instructions.md` - Coverage thresholds and testing patterns (AB#2062)
* `prompts/a11y-scan.prompt.md` - Accessibility scan prompt (AB#2058)
* `prompts/a11y-fix.prompt.md` - Accessibility fix prompt (AB#2058)
* `skills/a11y-scan/SKILL.md` - Accessibility scanning domain knowledge (AB#2053)
* `skills/security-scan/SKILL.md` - Security scanning domain knowledge (AB#2059)
* `docs/architecture.md` - Framework architecture with Mermaid diagrams (AB#2042)
* `docs/agent-patterns.md` - Agent file specification and deployment model (AB#2043)
* `docs/sarif-integration.md` - SARIF v2.1.0 mapping for all domains (AB#2044)
* `docs/platform-comparison.md` - GitHub vs Azure DevOps feature matrix (AB#2045)
* `docs/implementation-roadmap.md` - 5-phase rollout plan (AB#2046)
* `docs/prompt-file-security.md` - Threat model and APM controls (AB#2069)
* `docs/azure-devops-pipelines.md` - ADO pipeline equivalents documentation (AB#2075)
* `docs/agent-extensibility.md` - Plugin model and org-scale sharing (AB#2076)
* `docs/centralized-governance.md` - Security Overview, MDC, Defender for DevOps (AB#2077)
* `.github/workflows/security-scan.yml` - SAST + SCA + IaC + secrets + DAST pipeline (AB#2070)
* `.github/workflows/accessibility-scan.yml` - Three-engine a11y scanner (AB#2071)
* `.github/workflows/code-quality.yml` - Coverage enforcement with SARIF (AB#2072)
* `.github/workflows/apm-security.yml` - APM audit on PRs (AB#2073)
* `.github/workflows/finops-cost-gate.yml` - IaC cost estimation gate (AB#2074)
* `samples/azure-devops/security-pipeline.yml` - ADO security pipeline sample (AB#2075)
* `samples/azure-devops/accessibility-pipeline.yml` - ADO accessibility pipeline sample (AB#2075)
* `samples/azure-devops/quality-pipeline.yml` - ADO quality pipeline sample (AB#2075)
* `sample-app/package.json` - Next.js project with intentional issues (AB#2078)
* `sample-app/tsconfig.json` - TypeScript configuration (AB#2078)
* `sample-app/next.config.js` - Next.js configuration (AB#2078)
* `sample-app/tailwind.config.ts` - Tailwind CSS configuration (AB#2078)
* `sample-app/postcss.config.js` - PostCSS configuration (AB#2078)
* `sample-app/src/app/layout.tsx` - Root layout with missing lang attribute (AB#2080)
* `sample-app/src/app/page.tsx` - Home page with low contrast, missing labels (AB#2080)
* `sample-app/src/app/globals.css` - Tailwind CSS imports (AB#2078)
* `sample-app/src/app/products/page.tsx` - Product listing with missing alt text (AB#2080)
* `sample-app/src/app/products/[id]/page.tsx` - Product detail with SQL injection (AB#2079)
* `sample-app/src/lib/db.ts` - Database module with hardcoded secrets (AB#2079)
* `sample-app/src/lib/auth.ts` - Auth module with weak crypto (AB#2079)
* `sample-app/src/lib/utils.ts` - Utility functions with high complexity (AB#2081)
* `sample-app/src/components/Header.tsx` - Header with broken heading hierarchy (AB#2080)
* `sample-app/src/components/ProductCard.tsx` - Product card with XSS (AB#2079)
* `sample-app/infra/main.bicep` - IaC with missing tags and security issues (AB#2082)
* `sample-app/infra/variables.bicep` - Oversized SKU parameters (AB#2082)
* `sample-app/__tests__/placeholder.test.ts` - Minimal test file (AB#2081)
* `sample-app/README.md` - Testing guide documenting all intentional issues (AB#2083)

### Modified

* `.gitignore` - Added exception for `sample-app/src/lib/` path

### Removed

* `sample-app/.gitkeep` - Replaced by actual sample application files
* `samples/azure-devops/.gitkeep` - Replaced by actual pipeline samples

## Additional or Deviating Changes

* `.gitignore` had a `lib/` pattern that excluded `sample-app/src/lib/`; added `!sample-app/src/lib/` exception

## Release Summary

All 11 implementation phases completed across 60+ files:

* **15 agent files** in `agents/` with valid YAML frontmatter (all under 10K chars)
* **3 instruction files** in `instructions/` with correct applyTo patterns
* **2 prompt files** in `prompts/` delegating to a11y agents
* **2 skill files** in `skills/` for security and accessibility domains
* **8 documentation files** in `docs/` covering architecture, patterns, SARIF, platform comparison, roadmap, security, extensibility, and governance
* **5 GitHub Actions workflows** in `.github/workflows/` with distinct SARIF categories
* **3 ADO pipeline samples** in `samples/azure-devops/`
* **1 apm.yml** manifest declaring all agent dependencies
* **1 mcp.json** for ADO work items MCP server
* **18 sample-app files** with intentional issues across security (15), accessibility (7), code quality (5), and FinOps (10) domains
* All validation checks passed: YAML frontmatter, glob patterns, link integrity, SARIF uniqueness, Unicode safety, mcp.json validity
