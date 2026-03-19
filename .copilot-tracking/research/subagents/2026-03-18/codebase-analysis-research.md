# Codebase Analysis Research — Agentic DevSecOps Framework

## Status: Complete

## Research Topics

- All 15 agents in `agents/` — purpose, invocation, dependencies
- Pipeline YAML files in `.github/workflows/` (7) and `samples/azure-devops/` (3)
- Sample app structure, tech stack, intentional vulnerabilities
- Skills (2), instructions (3), and prompts (2)
- Infrastructure as Code — Bicep with intentional IaC misconfigurations
- Architecture docs and design patterns
- Root configuration and validation scripts

---

## 1. Agent Inventory (15 Agents Across 4 Domains)

### 1.1 Security Domain (6 Agents)

#### SecurityAgent (Orchestrator)

- **Purpose**: Senior security architect that orchestrates holistic security assessments across application code, IaC, CI/CD, and supply chain.
- **Scans/Detects**: Delegates to 4 sub-agents; consolidates into a unified executive report.
- **Invocation**: Invoke via `@SecurityAgent` in VS Code Copilot Chat or as a GitHub.com agent.
- **Handoffs**: SecurityReviewerAgent (app code), PipelineSecurityAgent (CI/CD), IaCSecurityAgent (infra), SupplyChainSecurityAgent (supply chain).
- **Dependencies**: Requires all 4 sub-agents to be available.
- **Output**: `security-reports/security-assessment-report.md` with SARIF `security/` category.

#### SecurityReviewerAgent

- **Purpose**: Application security expert — OWASP Top 10 vulnerability detection in source code.
- **Scans/Detects**: SQL injection (CWE-89), XSS (CWE-79), hardcoded secrets (CWE-259), weak crypto (CWE-327/330), SSRF (CWE-918), insecure deserialization, auth failures.
- **Invocation**: `@SecurityReviewerAgent` or delegated from SecurityAgent.
- **Scope**: ASP.NET Core, Node.js, Python source code only.
- **Dependencies**: None beyond standard Copilot tools.

#### SecurityPlanCreator

- **Purpose**: Creates comprehensive security implementation plans from IaC blueprints.
- **Scans/Detects**: Security gaps in Terraform/Bicep/ARM against CIS Azure Benchmarks and Azure Security Benchmark.
- **Invocation**: `@SecurityPlanCreator` — typically pointed at IaC files.
- **Output**: `security-plan-outputs/security-plan-{blueprint-name}.md` with Mermaid architecture diagrams.
- **Threat categories**: Data Security, Network Security, Privileged Access, Identity Management, Data Protection, Posture/Vulnerability, Endpoint Security, Governance/Strategy.

#### PipelineSecurityAgent

- **Purpose**: CI/CD pipeline hardening — audits GitHub Actions and Azure DevOps YAML.
- **Scans/Detects**: Action version pinning (SHA vs tag), permissions minimization, script injection (`${{ github.event.* }}`), secret handling, `pull_request_target` misuse, self-hosted runner risks.
- **Invocation**: `@PipelineSecurityAgent` or delegated from SecurityAgent.
- **Scope**: `.github/workflows/*.yml`, `azure-pipelines.yml`, composite actions.
- **Output**: Hardened workflow diffs with change justification checklists.

#### IaCSecurityAgent

- **Purpose**: Infrastructure-as-Code security specialist.
- **Scans/Detects**: IAM misconfigurations, network exposure, missing encryption, logging gaps, container security, backup gaps across Terraform, Bicep, ARM, Kubernetes, Helm, Dockerfiles.
- **Invocation**: `@IaCSecurityAgent` or delegated from SecurityAgent.
- **Compliance**: CIS Azure, NIST 800-53, Azure Security Benchmark, PCI-DSS.
- **Complements**: MSDO tools (Checkov, Template Analyzer, tfsec, Trivy) by catching logic-level and architecture-level issues.

#### SupplyChainSecurityAgent

- **Purpose**: Supply chain security — secrets, dependencies, SBOM, licenses, repo governance.
- **Scans/Detects**: Hardcoded secrets (masked in output), vulnerable dependencies, license compliance, SBOM completeness, branch protection rules, CODEOWNERS.
- **Invocation**: `@SupplyChainSecurityAgent` or delegated from SecurityAgent.
- **Output**: 3 artifacts — Security Report, PR-Ready Changes, Engineering Backlog.

### 1.2 Accessibility Domain (2 Agents — Detector/Resolver Pattern)

#### A11yDetector

- **Purpose**: WCAG 2.2 Level AA compliance detector using three-engine architecture.
- **Scans/Detects**: Static HTML/JSX/TSX/CSS analysis + runtime scanning via axe-core, IBM Equal Access, and 5 custom Playwright checks.
- **Invocation**: `@A11yDetector` or via prompt file `prompts/a11y-scan.prompt.md`.
- **Handoff**: Delegates to A11yResolver for automated remediation.
- **Output**: SARIF v2.1.0 with POUR-principle scoring, `accessibility-scan/` category.

#### A11yResolver

- **Purpose**: Accessibility remediation expert — applies WCAG-compliant code fixes.
- **Scans/Detects**: Processes violation reports from A11yDetector.
- **Invocation**: `@A11yResolver` or via prompt file `prompts/a11y-fix.prompt.md`, or handoff from A11yDetector.
- **Fixes**: 17+ remediation patterns in lookup table (image-alt, color-contrast, label, heading-order, html-has-lang, focus-visible, target-size, etc.).
- **Handoff**: Returns to A11yDetector for verification re-scan.

### 1.3 Code Quality Domain (2 Agents — Detector/Resolver Pattern)

#### CodeQualityDetector

- **Purpose**: Code quality analyst — coverage analysis, complexity detection, lint violations.
- **Scans/Detects**: Coverage below 80% threshold (line/branch/function), cyclomatic complexity > 10, code duplication, lint violations.
- **Invocation**: `@CodeQualityDetector`.
- **Multi-language**: JavaScript/TypeScript (Vitest/Jest), Python (pytest), .NET (coverlet), Java (JaCoCo), Go.
- **Handoff**: Delegates to TestGenerator for uncovered functions.
- **Output**: SARIF with `code-quality/coverage/` category.

#### TestGenerator

- **Purpose**: Automated test generation for uncovered code.
- **Scans/Detects**: Processes coverage findings from CodeQualityDetector.
- **Invocation**: `@TestGenerator` or handoff from CodeQualityDetector.
- **Generates**: Happy path, error path, and edge case tests matching existing codebase patterns.
- **Handoff**: Returns to CodeQualityDetector for coverage verification.

### 1.4 FinOps Domain (5 Agents)

#### CostAnalysisAgent

- **Purpose**: Azure cost query and reporting via Cost Management API.
- **Scans/Detects**: Cost by resource group, service, tag, with trend analysis.
- **Invocation**: `@CostAnalysisAgent`.
- **Dependencies**: Azure RBAC — Cost Management Reader role, `azure-mgmt-costmanagement>=4.0.1`.
- **Tags**: Requires 7 governance tags (ProjectName, Environment, CostCenter, Owner, Department, Application, CreatedDate).

#### CostAnomalyDetector

- **Purpose**: Cost anomaly detection using Azure's WaveNet-based detection.
- **Scans/Detects**: Cost spikes by drilling into resource, service, region, and tag dimensions.
- **Invocation**: `@CostAnomalyDetector` or triggered by webhook/daily schedule.
- **Produces**: Investigation reports with root cause analysis.

#### CostOptimizerAgent

- **Purpose**: Azure cost optimization — Advisor recommendations, right-sizing, reserved instances.
- **Scans/Detects**: Right-sizing opportunities, idle resources, spot VM candidates, storage tier optimization.
- **Invocation**: `@CostOptimizerAgent`.
- **Dependencies**: Azure Reader RBAC role.

#### DeploymentCostGateAgent

- **Purpose**: FinOps gatekeeper for IaC pull requests.
- **Scans/Detects**: Estimates monthly cost of IaC changes (Terraform/Bicep/ARM) via Azure Retail Prices API; compares to budget; approves or blocks.
- **Invocation**: `@DeploymentCostGateAgent` — triggers on IaC file changes in PRs.
- **Output**: PR comment with cost impact summary + SARIF findings.

#### FinOpsGovernanceAgent

- **Purpose**: Tag compliance and governance monitor.
- **Scans/Detects**: Missing governance tags, compliance scoring by resource group, Azure Policy verification.
- **Invocation**: `@FinOpsGovernanceAgent`.
- **Dependencies**: Azure Resource Graph queries.

---

## 2. Sample Application

### 2.1 Tech Stack

- **Framework**: Next.js 14.2+ (App Router)
- **Language**: TypeScript 5.3+
- **UI**: React 18.3+, Tailwind CSS 3.4+
- **Database**: Prisma Client 5.10+ (PostgreSQL)
- **Testing**: Jest 29.7 with @testing-library/react, jest-junit for CI
- **Linting**: ESLint 8.57 with eslint-config-next
- **Build**: `npm run build` (Next.js)
- **Dev server**: `npm run dev` (port 3000)
- **Test**: `npm test` (Jest with coverage) or `npm run test:ci` (JUnit + coverage output)

### 2.2 Intentional Vulnerabilities (for Agent Demo)

#### Security Vulnerabilities (in `src/lib/`)

| File | Vulnerability | OWASP | CWE |
|---|---|---|---|
| `auth.ts` | Hardcoded JWT secret | A02 | CWE-259 |
| `auth.ts` | Hardcoded API key | A02 | CWE-259 |
| `auth.ts` | MD5 password hashing | A02 | CWE-328 |
| `auth.ts` | No timing-safe comparison | A02 | CWE-208 |
| `auth.ts` | `Math.random()` for session tokens | A02 | CWE-330 |
| `auth.ts` | No rate limiting on authentication | A04 | CWE-307 |
| `auth.ts` | No input validation | A03 | CWE-20 |
| `auth.ts` | Predictable API token generation | A02 | CWE-330 |
| `auth.ts` | Token validation only checks length | A07 | CWE-287 |
| `db.ts` | Hardcoded database connection string | A02 | CWE-259 |
| `db.ts` | SSL disabled in connection | A02 | CWE-319 |
| `db.ts` | SQL injection in `getProductById()` | A03 | CWE-89 |
| `db.ts` | SQL injection in `searchProducts()` | A03 | CWE-89 |
| `db.ts` | Connection string exposed via getter | A02 | CWE-200 |
| `ProductCard.tsx` | XSS via `dangerouslySetInnerHTML` | A03 | CWE-79 |
| `products/[id]/page.tsx` | SQL injection via URL parameter | A03 | CWE-89 |
| `products/[id]/page.tsx` | XSS via `dangerouslySetInnerHTML` | A03 | CWE-79 |
| `products/page.tsx` | XSS payload in sample data (`<script>alert('xss')</script>`) | A03 | CWE-79 |

#### Accessibility Violations (in `src/`)

| File | Violation | WCAG SC |
|---|---|---|
| `layout.tsx` | Missing `lang` attribute on `<html>` | 3.1.1 |
| `page.tsx` | Low contrast text (`#999999` on white) | 1.4.3 |
| `page.tsx` | Missing form label for search input | 1.3.1 |
| `page.tsx` | Small touch targets (10px font, 2px padding) | 2.5.8 |
| `page.tsx` | Low contrast secondary text (`#aaaaaa`) | 1.4.3 |
| `Header.tsx` | Broken heading hierarchy (h1→h3, skips h2) | 1.3.1 |
| `products/page.tsx` | Images without alt text | 1.1.1 |
| `products/[id]/page.tsx` | Image without alt text | 1.1.1 |

#### Code Quality Issues (in `src/lib/utils.ts`)

| Issue | Description |
|---|---|
| High cyclomatic complexity | `formatPrice()`, `categorizeProduct()` with deeply nested conditionals |
| Extensive `any` type usage | All function parameters use `any` |
| Missing error handling | No try/catch on async operations |
| Duplicate code patterns | `formatPrice()` and `formatDiscount()` duplicate logic |
| Functions > 50 lines | Multiple functions exceed recommended length |

### 2.3 Infrastructure Vulnerabilities (Bicep — `sample-app/infra/`)

| File | Issue Type | Description |
|---|---|---|
| `main.bicep` | Security | SQL admin password as plaintext parameter (no `@secure()`) |
| `main.bicep` | Security | App Service allows HTTP, TLS 1.0 |
| `main.bicep` | Security | Storage: public blob access, shared keys, HTTP, TLS 1.0 |
| `main.bicep` | Security | SQL Server: TLS 1.0, public access, no Azure AD auth |
| `main.bicep` | Security | Firewall rule allows ALL IPs (0.0.0.0–255.255.255.255) |
| `main.bicep` | FinOps | All resources missing required tags |
| `main.bicep` | FinOps | Oversized App Service Plan (P1v3 × 3 instances) |
| `main.bicep` | FinOps | GRS storage for non-critical data |
| `main.bicep` | FinOps | SQL GP_Gen5_8 for minimal data |
| `variables.bicep` | FinOps | Oversized defaults (~$1,270/mo vs right-sized ~$30/mo) |
| `main.bicep` | FinOps | No budget resource defined |

---

## 3. CI/CD Pipelines

### 3.1 GitHub Actions Workflows (7 workflows in `.github/workflows/`)

| Workflow | Trigger | Purpose |
|---|---|---|
| `security-scan.yml` | PR + push to `main` | SCA (Dependency Review + SBOM), SAST (CodeQL), IaC (MSDO), container (Trivy), DAST (ZAP) |
| `accessibility-scan.yml` | PR + weekly cron | Three-engine a11y scan, SARIF upload, threshold gating |
| `code-quality.yml` | PR | Lint, type check, Jest tests with 80% coverage gate, SARIF upload |
| `finops-cost-gate.yml` | PR (IaC changes) | Infracost estimate vs monthly budget, PR comment |
| `apm-security.yml` | PR (agent config changes) | APM audit for prompt file supply chain attacks |
| `ci-full-test.yml` | PR + push to `main` | Agent validation (structure, cross-refs, domain rules) via `validate-agents.mjs` |
| `deploy-to-github-private.yml` | Push to `main` | Syncs agents/instructions/prompts/skills/configs to org `.github-private` repo |

### 3.2 Azure DevOps Pipelines (3 samples in `samples/azure-devops/`)

| Pipeline | Purpose | GHAzDO Tasks |
|---|---|---|
| `security-pipeline.yml` | SAST (CodeQL), SCA, IaC (MSDO), Container (Trivy), DAST (ZAP) | `AdvancedSecurity-Codeql-Init@1`, `AdvancedSecurity-Codeql-Analyze@1`, `AdvancedSecurity-Dependency-Scanning@1`, `MicrosoftSecurityDevOps@1`, `AdvancedSecurity-Publish@1` |
| `accessibility-pipeline.yml` | Three-engine a11y scan with SARIF publish and threshold gate | `AdvancedSecurity-Publish@1` |
| `quality-pipeline.yml` | Lint, type check, test + JUnit/Cobertura publish, coverage-to-SARIF | `PublishTestResults@2`, `PublishCodeCoverageResults@2`, `AdvancedSecurity-Publish@1` |

### 3.3 GitHub Security Tab Integration

- All SARIF uploads use `github/codeql-action/upload-sarif@v4` with `security-events: write` permission.
- Each domain uses a distinct `automationDetails.id` category prefix for filtering in Security Overview.
- Categories: `secret-scanning/`, `dependency-review/`, `codeql/`, `iac-scanning/`, `container-scanning/`, `dast/`, `accessibility-scan/`, `code-quality/coverage/`, `agent-config-scan/`, `finops-finding/`.
- Results appear in repository Security tab → Code Scanning alerts.

### 3.4 GitHub Actions vs ADO Comparison

| Aspect | GitHub Actions | Azure DevOps |
|---|---|---|
| SARIF Upload | `github/codeql-action/upload-sarif@v4` | `AdvancedSecurity-Publish@1` |
| CodeQL | `github/codeql-action/init@v4` + `analyze@v4` | `AdvancedSecurity-Codeql-Init@1` + `Analyze@1` |
| SCA | `actions/dependency-review-action@v4` | `AdvancedSecurity-Dependency-Scanning@1` |
| IaC | MSDO action | `MicrosoftSecurityDevOps@1` |
| Test Results | GitHub summary | `PublishTestResults@2` (JUnit) |
| Coverage | SARIF upload | `PublishCodeCoverageResults@2` (Cobertura) |
| Secret Scanning | GitHub native (repo settings) | GHAzDO (project settings) |

---

## 4. Skills

### a11y-scan Skill (`skills/a11y-scan/SKILL.md`)

- Three-engine architecture: axe-core (primary), IBM Equal Access (secondary), 5 custom Playwright checks.
- SARIF v2.1.0 output with severity mapping (critical→error/9.0, serious→error/7.0, moderate→warning/4.0, minor→note/1.0).
- Weighted scoring formula: `100 - Σ(impact_weight × count)`, grading A–F.
- Compliance thresholds: min score 70, 0 critical/serious, 10 moderate max.
- Top 10 violations list and CI/CD integration snippets.
- Loaded by A11yDetector and A11yResolver agents.

### security-scan Skill (`skills/security-scan/SKILL.md`)

- OWASP Top 10 + OWASP LLM Top 10 mappings with primary CWEs.
- ASP.NET Core security patterns (JWT, CORS, anti-forgery, rate limiting).
- IaC security checklists (Terraform, Bicep, ARM, Kubernetes/Helm).
- CI/CD pipeline hardening checklist.
- Supply chain security controls reference.
- SARIF output format specification with severity classification.
- Loaded by all security domain agents.

---

## 5. Instructions

### a11y-remediation.instructions.md

- Auto-applies to `**/*.tsx, **/*.jsx, **/*.ts, **/*.html, **/*.css`.
- Standard fix patterns for: missing alt text, missing form labels, low contrast, skip navigation, heading hierarchy, small touch targets, missing page language.
- Code examples for React/Next.js and Tailwind patterns.

### code-quality.instructions.md

- Auto-applies to `**/*.ts, **/*.js, **/*.py, **/*.cs, **/*.java, **/*.go`.
- Coverage thresholds: ≥80% line/branch/function, ≥90% new code.
- Complexity limits: cyclomatic ≤10, nesting ≤4, function length ≤50 lines.
- Testing patterns: AAA structure, minimal mocking, framework-specific conventions.
- CI quality gate: lint → type check → tests → coverage → SARIF upload.

### wcag22-rules.instructions.md

- Auto-applies to `**/*.tsx, **/*.jsx, **/*.ts, **/*.html, **/*.css`.
- Complete WCAG 2.2 Level AA rules organized by POUR principles.
- Covers all Level A and AA success criteria with implementation guidance.
- Includes WCAG 2.2 new criteria (2.4.11 Focus Not Obscured, 2.5.8 Target Size).

---

## 6. Prompts

### a11y-scan.prompt.md

- Quick accessibility scan of a URL or component.
- Routes to `A11yDetector` agent.
- Inputs: `url` (runtime scan) or `component` (static analysis).
- Usage: Open command palette → "Accessibility Scan" or reference in chat.

### a11y-fix.prompt.md

- Fix accessibility issues from scan results or in a component.
- Routes to `A11yResolver` agent.
- Inputs: `component` (file path) and/or `report` (SARIF file path).
- Usage: Open command palette → "Accessibility Fix" or reference in chat.

---

## 7. Root Configuration

### apm.yml

- APM (Agent Package Manager) manifest declaring all 15 agents as dependencies.
- Version 1.0.0 of `agentic-devsecops-framework`.
- Enables `apm audit` for supply chain scanning of agent config files.

### mcp.json

- Configures an MCP server for Azure DevOps work items.
- Server: `@anthropic/mcp-server-ado-work-items` via npx.
- Environment variables: `ADO_ORG_URL`, `ADO_PAT`, `ADO_PROJECT`.

### package.json (root)

- Dev dependencies: `pptxgenjs`, `react`, `react-dom`, `react-icons`, `sharp` — used by `scripts/generate-exec-summary.cjs` to create PowerPoint presentations.

### scripts/validate-agents.mjs

- Tier 1–4 structural validation of all agent, instruction, prompt, and skill files.
- Checks YAML frontmatter, cross-references, domain rules.
- Produces SARIF output (`validation-results.sarif`).
- Dependencies: `gray-matter`, `minimatch` (in `scripts/package.json`).

### scripts/generate-exec-summary.cjs

- Generates executive summary PowerPoint slides using pptxgenjs.
- Uses React server-side rendering to create icon SVGs converted to PNG via sharp.
- "Midnight Executive" color palette.

---

## 8. Architecture Summary

### Core Formula

**Agentic DevSecOps = GitHub Advanced Security + GitHub Copilot Custom Agents + Microsoft Defender for Cloud**

### Shift-Left Then Scale

1. **Shift Left** — Agents run in VS Code before commit and during PR review.
2. **Automate** — CI/CD pipelines run the same controls as automated gates.
3. **Report** — All findings output SARIF v2.1.0.
4. **Govern** — Security Overview + Defender for Cloud + Power BI dashboards.

### Four-Level Deployment Model

1. Enterprise `.github-private` → all enterprise repos
2. Organization `.github-private` → all org repos
3. Repository `.github/agents/` → that repo only
4. User profile `~/.copilot/agents/` → all user workspaces

### Key Design Patterns

- **Detector/Resolver Handoff**: A11y and Code Quality domains use paired agents — Detector finds issues, Resolver fixes them, Detector re-scans.
- **Orchestrator Delegation**: SecurityAgent delegates to 4 specialized sub-agents.
- **SARIF Universal Format**: All 4 domains produce SARIF v2.1.0 for a unified view.
- **Dual Platform**: Every GitHub Actions workflow has an equivalent ADO YAML pipeline.

### Implementation Roadmap (5 Phases)

| Phase | Domain | Status |
|---|---|---|
| Phase 1 | Security Agents | Implemented |
| Phase 2 | Accessibility Agents | Implemented, multi-site rollout active |
| Phase 3 | Code Quality Agents | Active — agents defined, coverage gate implemented |
| Phase 4 | FinOps Agents | Active — agents defined, cost gate workflow implemented |
| Phase 5 | Prompt File Security (APM) | Active — APM audit workflow implemented |

---

## 9. Gaps and Issues Found

1. **No GitHub Actions workflow files in `samples/github-actions/`** — The directory contains only a `.gitkeep` file. All actual GitHub Actions workflows live in `.github/workflows/`. The `samples/github-actions/` directory appears to be a placeholder.

2. **Sample app has placeholder test only** — `__tests__/placeholder.test.ts` exists but no substantive tests; coverage is likely very low. This is intentional to demonstrate the CodeQualityDetector agent's purpose.

3. **No Dockerfile in sample-app** — The container scanning stage in security pipelines checks for a Dockerfile; the sample app doesn't have one, so that stage would be skipped.

4. **Products page uses `<img>` not Next.js `<Image>`** — Intentional a11y violation but also means the app doesn't benefit from Next.js image optimization.

5. **No `.env.example` file** — The sample app references database URLs and secrets in source code (intentionally) but there's no `.env.example` showing expected environment variables.

6. **APM action reference (`microsoft/apm-action@v1`)** — This action may not be publicly available yet; it's part of the framework's roadmap for Phase 5.

7. **FinOps agents require Azure connectivity** — All 5 FinOps agents need Azure RBAC (Cost Management Reader or Reader) and `azure-mgmt-*` SDKs. Students without Azure subscriptions cannot test these interactively.

8. **No `samples/github-actions/` content** — The framework documents GitHub Actions equivalents in `.github/workflows/` directly, not as samples. The ADO samples exist as separate files since they can't be auto-triggered from the repo.

---

## References

- [README.md](README.md) — Repository overview and quick start
- [docs/architecture.md](docs/architecture.md) — Framework architecture and Mermaid diagrams
- [docs/agent-patterns.md](docs/agent-patterns.md) — Agent file specification, YAML frontmatter schema, handoff pattern
- [docs/agent-extensibility.md](docs/agent-extensibility.md) — Plugin architecture, MCP integration, APM
- [docs/sarif-integration.md](docs/sarif-integration.md) — SARIF v2.1.0 category registry and upload patterns
- [docs/azure-devops-pipelines.md](docs/azure-devops-pipelines.md) — ADO YAML pipeline equivalents
- [docs/implementation-roadmap.md](docs/implementation-roadmap.md) — Five-phase rollout plan

---

## Discovered Topics

- **APM (Agent Package Manager)** — `microsoft/apm` tool for dependency management and supply chain security scanning of agent config files.
- **Glassworm attack vector** — Hidden Unicode variation selectors 17–256 in agent config files; detected by `apm audit`.
- **OWASP LLM Top 10** — AI/LLM-specific security risks relevant to agent configuration (prompt injection, excessive agency, supply chain).
- **GHAzDO** — GitHub Advanced Security for Azure DevOps; enables the same scanning capabilities in ADO pipelines.
- **Power BI AdvSec Report** — Compensates for ADO Security Overview API limitations with star schema analytics.

---

## Clarifying Questions

None — all research topics were fully answerable from the repository contents.
