<!-- markdownlint-disable-file -->
# Implementation Details: Agentic DevSecOps Framework

## Context Reference

Sources: `.copilot-tracking/research/2026-03-16/agentic-devsecops-framework-research.md` (primary), `.copilot-tracking/research/subagents/2026-03-16/github-private-agents-research.md`, `.copilot-tracking/research/subagents/2026-03-16/accessibility-code-quality-research.md`, `.copilot-tracking/research/subagents/2026-03-16/cost-analysis-finops-research.md`, `.copilot-tracking/research/subagents/2026-03-16/prompt-file-security-research.md`, `.copilot-tracking/research/subagents/2026-03-16/ghcp-agent-plugins-research.md`, `.copilot-tracking/research/subagents/2026-03-16/repo-structure-research.md`

## Implementation Phase 1: Repository Scaffolding

<!-- parallelizable: true -->

### Step 1.1: Create Root Documentation Files

Create `README.md` as the framework entry point. Include: project title, one-paragraph description of the Agentic DevSecOps formula (GHAS + GHCP + MDC), the Mermaid architecture diagram from Research §1, agent domain category table (Security/Accessibility/Code Quality/FinOps), quick-start instructions referencing VS Code + GitHub.com agent invocation, links to `docs/` for deep dives, badges for CI status.

Create `LICENSE` — MIT license (standard for Microsoft open-source frameworks).

Create `.gitignore` — include Python venv, Node modules, OS files, IDE files, coverage outputs, SARIF temp files. Base on GitHub's combined Python + Node templates.

Files:
* `README.md` - Framework overview, architecture diagram, quick-start guide
* `LICENSE` - MIT license
* `.gitignore` - Python, Node, OS, IDE, coverage, SARIF exclusions

Discrepancy references:
* Derived objective — greenfield repo needs scaffolding (repo-structure-research)

Success criteria:
* README.md contains the Mermaid architecture diagram from Research §1
* README.md contains agent domain category table with 4 domains
* LICENSE contains valid MIT text
* .gitignore covers Python, Node, coverage output directories

Context references:
* Research §1 (Lines 53-90) - Architecture diagram and core formula
* Research §1 (Lines 92-102) - Agent domain categories table

Dependencies:
* None — first step

### Step 1.2: Create `.github/copilot-instructions.md`

Create repo-wide Copilot instructions defining:
- Framework purpose and agent conventions
- SARIF output requirements for all agents (v2.1.0, `partialFingerprints`, `automationDetails.id` categories)
- Severity classification standard (CRITICAL/HIGH/MEDIUM/LOW)
- Agent output format conventions (Markdown reports with structured sections)
- Cross-references to domain-specific instruction files
- PR-ready output expectations (unified diff patches, fix packs)
- Reference to OWASP Top 10 and OWASP LLM Top 10

Files:
* `.github/copilot-instructions.md` - Repo-wide Copilot agent conventions

Discrepancy references:
* Derived objective — required for agent pattern consistency

Success criteria:
* File defines SARIF output standard for all agents
* File defines severity classification with CWE/OWASP mapping pattern
* File references domain-specific instruction files

Context references:
* Research §2 (Lines 104-185) - Agent file specification and body structure pattern
* Research §3 (Lines 230-250) - Security agent design patterns (severity, compliance)

Dependencies:
* Step 1.4 (directory structure) — but `.github/` directory creation is implicit

### Step 1.3: Create `.github/CODEOWNERS`

Protect agent configuration files from unauthorized modification. Map all agent-related paths to `@security-team` (placeholder for actual team handle). This is a critical supply chain defense per Research §7. Paths use repo-root layout matching `.github-private` org-wide structure.

```text
# Agent configuration file governance (.github-private org-wide layout)
.github/copilot-instructions.md @devopsabcs-engineering/security-team
agents/ @devopsabcs-engineering/security-team
instructions/ @devopsabcs-engineering/security-team
prompts/ @devopsabcs-engineering/security-team
skills/ @devopsabcs-engineering/security-team
**/AGENTS.md @devopsabcs-engineering/security-team
**/SKILL.md @devopsabcs-engineering/security-team
apm.yml @devopsabcs-engineering/security-team
mcp.json @devopsabcs-engineering/security-team
.github/workflows/ @devopsabcs-engineering/security-team
```

Files:
* `.github/CODEOWNERS` - Agent config file ownership for PR review enforcement

Discrepancy references:
* Research §7 (CODEOWNERS Protection) — implementing recommended control

Success criteria:
* All agent-related paths require security team review
* Workflow files require security team review
* `mcp.json` requires security team review

Context references:
* Research §7 (Lines 460-470) - CODEOWNERS protection pattern

Dependencies:
* None

### Step 1.4: Create Directory Structure

Create the following directory tree with `.gitkeep` placeholder files. This uses the `.github-private` org-wide layout where `agents/`, `instructions/`, `prompts/`, and `skills/` are at the repo root (not under `.github/`). When this repo is cloned into or mirrored as `.github-private`, these directories are automatically available org-wide.

```text
agents/             ← Custom GHCP agent definitions (repo root for .github-private)
instructions/       ← Path-specific instruction files (repo root for .github-private)
prompts/            ← Reusable prompt templates (repo root for .github-private)
skills/             ← On-demand domain knowledge (SKILL.md) (repo root for .github-private)
.github/
  workflows/        ← GitHub Actions CI/CD pipelines
docs/               ← Framework documentation
  images/           ← Diagrams and screenshots
sample-app/         ← Demo application with intentional issues for agent testing
samples/            ← Sample configurations and examples
  github-actions/   ← Sample GitHub Actions workflows
  azure-devops/     ← Sample ADO pipeline YAML
```

Files:
* `agents/.gitkeep` - Agent definitions directory
* `instructions/.gitkeep` - Instructions directory
* `prompts/.gitkeep` - Prompts directory
* `skills/.gitkeep` - Skills directory
* `.github/workflows/.gitkeep` - Workflows directory
* `docs/.gitkeep` - Documentation directory
* `docs/images/.gitkeep` - Images directory
* `sample-app/.gitkeep` - Sample application directory
* `samples/github-actions/.gitkeep` - Sample GH Actions directory
* `samples/azure-devops/.gitkeep` - Sample ADO pipelines directory

Success criteria:
* All directories exist and are tracked by Git
* Agent/instruction/prompt/skill directories are at repo root (`.github-private` layout)

Dependencies:
* None

### Step 1.5: Create `mcp.json`

Create MCP server configuration for ADO work items integration. This enables agents to read/write Azure DevOps work items for tracking findings, creating backlog items, and linking security/a11y/quality issues to ADO boards.

```json
{
  "mcpServers": {
    "ado-work-items": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-ado-work-items"],
      "env": {
        "ADO_ORG_URL": "${ADO_ORG_URL}",
        "ADO_PAT": "${ADO_PAT}",
        "ADO_PROJECT": "${ADO_PROJECT}"
      }
    }
  }
}
```

Files:
* `mcp.json` - MCP server configuration for ADO work items

Discrepancy references:
* User requirement — added `mcp.json` for ADO work items integration

Success criteria:
* Valid JSON with MCP server configuration
* Environment variables parameterized (not hardcoded credentials)
* ADO work items server configured for agent consumption

Context references:
* Research §10 (Lines 700-770) - MCP server integration patterns
* User input: "we added mcp.json for ado work items"

Dependencies:
* None (root-level file)

## Implementation Phase 2: Framework Documentation

<!-- parallelizable: true -->

### Step 2.1: Create `docs/architecture.md`

Document the full framework architecture:
- Core formula: Agentic DevSecOps = GHAS + GHCP + MDC
- "Shift-left then scale" principle (4 steps: Shift Left → Automate → Report → Govern)
- Full Mermaid architecture diagram from Research §1 (Developer Workstation → GitHub Platform → Security Controls → Centralized Governance → Azure Cloud)
- Agent domain categories table (Security: 6 agents, Accessibility: 2, Code Quality: 2, FinOps: 5)
- Three-level agent deployment model (Enterprise → Organization → Repository → User profile)
- SARIF v2.1.0 as universal interchange format
- Dual-platform support (GitHub preferred, ADO first-class citizen)
- Data flow diagrams for both GitHub and ADO paths

Files:
* `docs/architecture.md` - Framework architecture documentation

Discrepancy references:
* User requirement: Define framework architecture and core patterns

Success criteria:
* Contains the Mermaid architecture diagram
* Documents all 4 agent domain categories with agent counts
* Explains the shift-left-then-scale principle
* Covers dual-platform (GitHub + ADO) data flows

Context references:
* Research §1 (Lines 41-102) - Full architecture section
* Research §9 (Lines 630-700) - Centralized governance data flows

Dependencies:
* None

### Step 2.2: Create `docs/agent-patterns.md`

Document the custom GHCP agent specification:
- Agent file naming conventions (`AGENT-NAME.md` or `AGENT-NAME.agent.md`)
- YAML frontmatter schema (name, description, model, tools, handoffs)
- Max prompt length: 30,000 characters
- Cross-platform compatibility (VS Code, GitHub.com, CLI, JetBrains)
- Body structure pattern (persona → responsibilities → domain sections → output format → review → severity → references → invocation)
- Tool namespace reference (vscode/, execute/, read/, edit/, search/, web/, agent/, todo)
- Complementary artifacts table (instructions, prompts, skills, copilot-instructions.md)
- Organization-wide sharing via `.github-private` with testing workflow
- Detector ↔ Resolver handoff pattern (used by Accessibility and Code Quality agents)

Files:
* `docs/agent-patterns.md` - Agent authoring reference guide

Success criteria:
* Covers full YAML frontmatter schema with examples
* Documents the Detector ↔ Resolver handoff pattern
* Includes tool namespace reference table
* Documents `.github-private` sharing model

Context references:
* Research §2 (Lines 104-202) - Core patterns full section
* Research §4 (Lines 360-400) - Detector ↔ Resolver handoff pattern

Dependencies:
* None

### Step 2.3: Create `docs/sarif-integration.md`

Document SARIF v2.1.0 integration across all domains:
- SARIF schema requirements ($schema, version, tool.driver, rules, results)
- Required fields per GitHub: `help.text`, `partialFingerprints`
- Recommended enrichment: `help.markdown`, `properties.tags`, `automationDetails.id`
- Category registry table (all 10 categories from Research §8)
- Limits: 10MB gzip, 25K results/run, 20 runs/file
- Domain-specific mappings:
  - axe-core impact → SARIF level (critical→error/9.0, serious→error/7.0, moderate→warning/4.0, minor→note/1.0)
  - Coverage → SARIF (uncovered-function, uncovered-branch, coverage-threshold-violation)
  - FinOps → SARIF (budget-overspend, cost-anomaly, untagged-resources, etc.)
- Upload patterns for GitHub Actions (`github/codeql-action/upload-sarif@v4`) and ADO (`AdvancedSecurity-Publish@1`)
- Strategy: report only regressions and below-threshold items to stay within 25K limit

Files:
* `docs/sarif-integration.md` - SARIF integration reference

Discrepancy references:
* Research §8 category registry — consolidating scattered SARIF information into one reference

Success criteria:
* Contains complete SARIF category registry (10 categories)
* Documents domain-specific mappings for all 4 domains
* Covers both GitHub and ADO SARIF upload methods

Context references:
* Research §4 (Lines 280-310) - Accessibility SARIF mapping
* Research §5 (Lines 410-430) - Coverage-to-SARIF mapping
* Research §6 (Lines 570-580) - FinOps finding schema
* Research §8 (Lines 588-610) - SARIF category table

Dependencies:
* None

### Step 2.4: Create `docs/platform-comparison.md`

Document GitHub vs Azure DevOps platform comparison:
- Full feature comparison table from Research §8 (30+ rows)
- Key differences: pipeline tasks vs Actions, Security Overview API gap, Copilot Autofix availability
- GHAzDO capabilities: Secret Protection, Code Security, PR annotations, hierarchical enablement
- ADO-specific patterns: `AdvancedSecurity-Codeql-Init@1`, `AdvancedSecurity-Publish@1`, `PublishCodeCoverageResults@2`
- Power BI `advsec-pbi-report-ado` as ADO Security Overview compensator
- Custom GHCP agents: work in VS Code for ADO repos but not on ADO platform
- ADO Advanced Security REST API reference (`advsec.dev.azure.com`, v7.2-preview.1)
- Defender for Cloud: unified view via both GitHub and ADO connectors

Files:
* `docs/platform-comparison.md` - GitHub vs ADO feature comparison

Success criteria:
* Contains the full platform feature comparison table
* Documents Power BI dashboard as ADO compensator
* Covers GHAzDO task names and configurations

Context references:
* Research §8 (Lines 610-750) - Full ADO section with feature comparison table
* Research §8 (Lines 750-810) - Power BI dashboards section

Dependencies:
* None

### Step 2.5: Create `docs/implementation-roadmap.md`

Document the 5-phase implementation roadmap:
- Phase 1: Security Agents (already proven in `.github-private`)
- Phase 2: Accessibility Agents (already proven with scanner)
- Phase 3: Code Quality Agents (new, pattern defined)
- Phase 4: FinOps Agents (new, reference implementation exists)
- Phase 5: Prompt File Security (new, APM tooling available)
- Cross-cutting: Centralized governance with MDC
- Proof-of-value examples for each phase (TT343 demo, a11y three-engine scanner, coverage gate, cost gate, APM audit)
- Gantt-style Mermaid diagram showing phase dependencies and parallelism

Files:
* `docs/implementation-roadmap.md` - Implementation roadmap with proof-of-value

Success criteria:
* All 5 phases documented with status indicators
* Proof-of-value examples for each domain
* Cross-cutting governance integration described

Context references:
* Research §11 (Lines 820-900) - Implementation roadmap section
* Research §1 (Lines 92-102) - Agent domain categories with repo references

Dependencies:
* None

## Implementation Phase 3: Security Agents (Proven Pattern)

<!-- parallelizable: true -->

### Step 3.1: Create `security-agent.agent.md`

Holistic security orchestrator. The top-level agent that delegates to specialized security agents.

Agent body structure:
- Persona: Senior security architect with expertise in ASP.NET Core, Azure, IaC, CI/CD
- Core responsibilities: comprehensive security assessment, OWASP Top 10, CIS Azure benchmarks
- Delegation map: routes to SecurityReviewer (app code), PipelineSecurity (CI/CD), IaCSecurity (infrastructure), SupplyChainSecurity (dependencies)
- Output: `security-reports/security-assessment-report.md` with executive summary, findings by domain, severity breakdown, recommended remediation priority
- Compliance mapping: CIS Azure, NIST 800-53, Azure Security Benchmark, PCI-DSS
- Severity: CRITICAL/HIGH/MEDIUM/LOW with CWE identifiers
- Invocation: autonomous, exit with full report

YAML frontmatter:
```yaml
name: SecurityAgent
description: "Holistic security review orchestrator — ASP.NET Core, IaC, CI/CD, supply chain"
model: Claude Sonnet 4.5 (copilot)
tools: [full 40-tool whitelist per Research §3]
handoffs:
  - label: "Review Application Code"
    agent: SecurityReviewerAgent
  - label: "Review CI/CD Pipelines"
    agent: PipelineSecurityAgent
  - label: "Review Infrastructure Code"
    agent: IaCSecurityAgent
  - label: "Review Supply Chain"
    agent: SupplyChainSecurityAgent
```

Files:
* `agents/security-agent.agent.md` - Holistic security orchestrator

Discrepancy references:
* Implements proven pattern from `.github-private` (github-private-agents-research)

Success criteria:
* YAML frontmatter has name, description, model, tools, handoffs
* Body follows persona → responsibilities → output format → invocation pattern
* Contains delegation map to 4 specialized agents
* Total character count ≤ 30,000

Context references:
* Research §3 (Lines 207-268) - Security agent inventory and design patterns
* Subagent research: github-private-agents-research.md - Proven agent patterns

Dependencies:
* Phase 1 Step 1.4 (directory structure)

### Step 3.2: Create `security-reviewer-agent.agent.md`

OWASP Top 10 code-level vulnerability detection agent. Focuses exclusively on application source code.

Agent body:
- Persona: Application security expert specializing in OWASP Top 10 detection
- Scope: application source code only (not IaC, not CI/CD, not supply chain)
- Checklist: SQL injection, XSS, CSRF, broken access control, cryptographic failures, SSRF, insecure deserialization, security misconfiguration in app code
- Technology focus: ASP.NET Core, Node.js, Python (match common Azure app stacks)
- Output: inline findings with file/line references, severity, CWE ID, remediation
- Severity: CRITICAL/HIGH/MEDIUM/LOW with CWE mapping

Files:
* `agents/security-reviewer-agent.agent.md` - Application code security reviewer

Success criteria:
* Covers OWASP Top 10 categories
* Scope boundary explicitly excludes IaC, CI/CD, supply chain
* Output includes CWE identifiers

Context references:
* Research §3 (Lines 207-220) - SecurityReviewerAgent purpose
* Research §3 (Lines 235-250) - Cross-reference map (scope boundaries)

Dependencies:
* Phase 1 Step 1.4

### Step 3.3: Create `security-plan-creator.agent.md`

Cloud security plan generator from IaC blueprints.

Agent body:
- Persona: Cloud security architect creating security implementation plans
- Input: Terraform/Bicep/ARM files representing infrastructure
- Output: `security-plan-outputs/security-plan-{name}.md` with network security, identity/access, encryption, monitoring, compliance mapping
- Standards: CIS Azure, Azure Security Benchmark, Zero Trust principles

Files:
* `agents/security-plan-creator.agent.md` - Cloud security plan generator

Success criteria:
* Takes IaC input and produces structured security plan
* Maps recommendations to CIS/ASB controls

Context references:
* Research §3 (Lines 207-220) - SecurityPlanCreatorAgent purpose

Dependencies:
* Phase 1 Step 1.4

### Step 3.4: Create `pipeline-security-agent.agent.md`

CI/CD pipeline hardening agent for GitHub Actions and Azure DevOps.

Agent body:
- Persona: CI/CD security specialist for GitHub Actions and Azure DevOps Pipelines
- Scope: workflow YAML files only (`.github/workflows/`, `azure-pipelines.yml`)
- Checks: pinned action versions, secret handling, permissions minimization, self-hosted runner risks, workflow injection, environment protection
- Output: hardened workflow diffs with justification
- ADO-specific: pipeline variables, service connections, environment approvals

Files:
* `agents/pipeline-security-agent.agent.md` - CI/CD pipeline hardening

Success criteria:
* Covers both GitHub Actions and ADO Pipelines
* Checks action version pinning (SHA vs tag)
* Validates `permissions` block minimization

Context references:
* Research §3 (Lines 207-220) - PipelineSecurityAgent purpose

Dependencies:
* Phase 1 Step 1.4

### Step 3.5: Create `iac-security-agent.agent.md`

Infrastructure-as-Code misconfiguration scanner for Terraform, Bicep, K8s, Helm.

Agent body:
- Persona: IaC security specialist
- Scope: infrastructure code only (Terraform, Bicep, ARM, Kubernetes manifests, Helm charts)
- Checks: public endpoints, missing encryption, overly permissive IAM, missing NSG rules, insecure defaults, non-compliant resource configurations
- Output: PR-ready fix packs (unified diffs + justification)
- Tool alignment: complements MSDO automated scanning (Checkov, Trivy, tfsec, Template Analyzer)

Files:
* `agents/iac-security-agent.agent.md` - IaC misconfiguration scanner

Success criteria:
* Covers Terraform, Bicep, K8s, Helm
* Output is PR-ready unified diffs

Context references:
* Research §3 (Lines 207-220) - IaCSecurityAgent purpose
* Research §3 (Lines 255-270) - CI/CD pipeline tools (MSDO)

Dependencies:
* Phase 1 Step 1.4

### Step 3.6: Create `supply-chain-security-agent.agent.md`

Supply chain security agent covering secrets, dependencies, SBOM, governance.

Agent body:
- Persona: Supply chain security analyst
- Scope: secrets management, dependency analysis, SBOM generation, license compliance, governance policies
- Scope boundary: explicitly out-of-scope for app code, CI/CD pipelines, IaC (delegates to those specialized agents)
- Checks: hardcoded secrets, vulnerable dependencies, license conflicts, missing SBOM, outdated lockfiles
- Output: Security Report + PR Changes + Backlog items
- Tools: Dependabot integration, SBOM tools (Anchore Syft, Microsoft SBOM)

Files:
* `agents/supply-chain-security-agent.agent.md` - Supply chain security

Success criteria:
* Clear scope boundaries excluding app code, CI/CD, IaC
* Covers secrets, dependencies, SBOM, license compliance
* References Dependabot and SBOM tooling

Context references:
* Research §3 (Lines 207-220) - SupplyChainSecurityAgent purpose
* Research §3 (Lines 235-250) - Cross-reference map

Dependencies:
* Phase 1 Step 1.4

## Implementation Phase 4: Accessibility Agents (Proven Pattern)

<!-- parallelizable: true -->

### Step 4.0: Create `skills/a11y-scan/SKILL.md`

Create an accessibility scanning skill providing domain knowledge that agents load progressively.

Content: WCAG 2.2 AA scanning methodology, three-engine architecture overview (axe-core + IBM Equal Access + Playwright), SARIF output format requirements, severity mapping (critical→9.0, serious→7.0, moderate→4.0, minor→1.0), compliance thresholds (score ≥70, 0 critical/serious), common violation patterns and remediation hints.

Files:
* `skills/a11y-scan/SKILL.md` - Accessibility scanning domain knowledge

Success criteria:
* SKILL.md describes scanner architecture
* Covers SARIF severity mapping
* References WCAG 2.2 specific criteria

Context references:
* Research §4 (Lines 280-395) - Full accessibility section
* Research §2 (Lines 170-185) - Complementary artifacts table (skills)

Dependencies:
* Phase 1 Step 1.4 (skills directory)

### Step 4.1: Create `a11y-detector.agent.md`

WCAG 2.2 compliance detector implementing 5-step protocol.

Agent body:
- Persona: Accessibility expert specializing in WCAG 2.2 Level AA compliance
- 5-step protocol:
  1. Scope: identify target pages/components
  2. Static Analysis: HTML/JSX/TSX (missing alt, labels, heading hierarchy, ARIA usage)
  3. Runtime Scanning: invoke `npx a11y-scan` CLI for axe-core + IBM Equal Access + custom Playwright checks
  4. Report: POUR principle breakdown (Perceivable, Operable, Understandable, Robust) with weighted scoring
  5. Handoff: pass findings to A11y Resolver
- CSS/Tailwind analysis: contrast ratios, focus styles, target sizes (24×24px minimum)
- SARIF output: impact-to-severity mapping (critical→9.0, serious→7.0, moderate→4.0, minor→1.0)
- 5 custom Playwright checks: ambiguous-link-text, aria-current-page, emphasis-strong-semantics, discount-price-accessibility, sticky-element-overlap

YAML frontmatter:
```yaml
name: A11yDetector
description: "WCAG 2.2 Level AA compliance detector — axe-core, IBM Equal Access, custom checks"
tools: [read/readFile, search/textSearch, search/fileSearch, execute/runInTerminal, agent/runSubagent, todo]
handoffs:
  - label: "Fix Accessibility Issues"
    agent: A11yResolver
    prompt: "Fix the accessibility issues identified in the report above"
    send: false
```

Files:
* `agents/a11y-detector.agent.md` - Accessibility compliance detector

Discrepancy references:
* Implements proven pattern from `.github-private` + `accessibility-scan-demo-app`

Success criteria:
* Implements 5-step protocol (Scope → Static → Runtime → Report → Handoff)
* Contains POUR principle breakdown
* Handoff to A11yResolver agent defined in YAML
* References 3-engine scanner architecture

Context references:
* Research §4 (Lines 280-395) - Full accessibility section
* Subagent research: accessibility-code-quality-research.md

Dependencies:
* Phase 1 Step 1.4

### Step 4.2: Create `a11y-resolver.agent.md`

Accessibility fix agent implementing 6-step protocol.

Agent body:
- Persona: Accessibility remediation expert
- 6-step protocol:
  1. Identify: parse detector findings
  2. Analyze: determine root cause for each violation
  3. Apply Fixes: implement standard remediation patterns
  4. Verify: run targeted re-scan on fixed components
  5. Report: document changes made with before/after
  6. Handoff: pass back to A11y Detector for full re-scan verification
- 18-row remediation lookup table (violation ID → WCAG SC → standard fix)
- React/Next.js patterns: `useId()`, `<Image alt>`, `layout.tsx` lang attribute
- Output: PR-ready code changes with unified diffs

YAML frontmatter:
```yaml
name: A11yResolver
description: "Accessibility fix agent — WCAG 2.2 remediation with verification re-scan"
tools: [read/readFile, edit/editFiles, edit/createFile, execute/runInTerminal, search/textSearch, agent/runSubagent, todo]
handoffs:
  - label: "Verify Fixes"
    agent: A11yDetector
    prompt: "Re-scan the fixed components to verify accessibility compliance"
    send: false
```

Files:
* `agents/a11y-resolver.agent.md` - Accessibility remediation agent

Success criteria:
* Implements 6-step protocol
* Contains remediation lookup table
* Handoff back to A11yDetector for verification
* Covers React/Next.js specific patterns

Context references:
* Research §4 (Lines 355-395) - Resolver pattern
* Subagent research: accessibility-code-quality-research.md

Dependencies:
* Phase 1 Step 1.4

### Step 4.3: Create `instructions/wcag22-rules.instructions.md`

Auto-applied WCAG 2.2 rules for web component files.

YAML frontmatter:
```yaml
description: "WCAG 2.2 Level AA compliance rules for accessible web development"
applyTo: "**/*.tsx,**/*.jsx,**/*.ts,**/*.html,**/*.css"
```

Content: WCAG 2.2 AA requirements organized by POUR principles. Key rules for images (alt text), forms (labels, error messages), navigation (heading hierarchy, skip links), ARIA (correct roles, states), color (contrast ratios ≥ 4.5:1/3:1), focus (visible indicators, logical order), touch targets (24×24px minimum).

Files:
* `instructions/wcag22-rules.instructions.md` - WCAG 2.2 auto-applied rules

Success criteria:
* `applyTo` covers TSX, JSX, TS, HTML, CSS
* Rules organized by POUR principles
* Covers key WCAG 2.2 SC requirements

Context references:
* Research §4 (Lines 380-395) - Supporting files

Dependencies:
* Phase 1 Step 1.4

### Step 4.4: Create `instructions/a11y-remediation.instructions.md`

Remediation patterns auto-applied when editing web files.

YAML frontmatter:
```yaml
description: "Accessibility remediation patterns for common WCAG violations"
applyTo: "**/*.tsx,**/*.jsx,**/*.ts,**/*.html,**/*.css"
```

Content: Standard fix patterns for top violations: missing alt → add descriptive alt; missing form label → associate `<label>` with `htmlFor`; low contrast → specify compliant color values; missing skip-link → add skip-to-main; heading skip → correct hierarchy; small touch target → increase to 24×24px.

Files:
* `instructions/a11y-remediation.instructions.md` - Remediation patterns

Success criteria:
* Contains standard fix patterns for common violations
* Matches `applyTo` with detector instruction file

Context references:
* Research §4 (Lines 380-395) - Supporting files

Dependencies:
* Phase 1 Step 1.4

### Step 4.5: Create Accessibility Prompt Files

Create `prompts/a11y-scan.prompt.md`:
- Description: "Quick accessibility scan of target URL or component"
- Input variables: `$url` or `$component`
- Invokes A11y Detector agent workflow

Create `prompts/a11y-fix.prompt.md`:
- Description: "Fix accessibility issues in target component"
- Input variables: `$component` or `$report`
- Invokes A11y Resolver agent workflow

Files:
* `prompts/a11y-scan.prompt.md` - Quick a11y scan shortcut
* `prompts/a11y-fix.prompt.md` - Quick a11y fix shortcut

Success criteria:
* Each prompt has valid YAML frontmatter with description
* Input variables documented
* Clear invocation flow

Context references:
* Research §4 (Lines 380-395) - Prompt file references

Dependencies:
* Phase 1 Step 1.4

## Implementation Phase 5: Code Quality Agents (New)

<!-- parallelizable: true -->

### Step 5.0: Create `skills/security-scan/SKILL.md`

Create a security scanning skill providing domain knowledge for security agents.

Content: OWASP Top 10 vulnerability categories with CWE mappings, ASP.NET Core security patterns, IaC security checklist (Terraform, Bicep, K8s), CI/CD pipeline hardening checklist, supply chain security controls, SARIF output format for security findings, severity classification (CRITICAL/HIGH/MEDIUM/LOW).

Files:
* `skills/security-scan/SKILL.md` - Security scanning domain knowledge

Success criteria:
* SKILL.md covers OWASP Top 10 categories
* Includes CWE mapping table
* References compliance frameworks

Context references:
* Research §3 (Lines 207-270) - Security agent design patterns
* Research §2 (Lines 170-185) - Complementary artifacts table (skills)

Dependencies:
* Phase 1 Step 1.4 (skills directory)

### Step 5.1: Create `code-quality-detector.agent.md`

Coverage analysis agent following the Detector pattern.

Agent body:
- Persona: Code quality analyst specializing in test coverage and code health
- Core responsibilities:
  - Read coverage reports (lcov, cobertura, JSON)
  - Identify files/functions below 80% threshold
  - Report complexity metrics (cyclomatic complexity)
  - Detect code duplication
  - Identify lint violations
  - Generate structured findings by priority
- Multi-language support: JavaScript/TypeScript (Vitest/Jest/c8), Python (coverage.py/pytest-cov), .NET (coverlet), Java (JaCoCo), Go (go test)
- Coverage-to-SARIF mapping:
  - `uncovered-function` → result
  - `uncovered-branch` → result
  - `coverage-threshold-violation` → result
  - `physicalLocation.region` for uncovered line ranges
- Strategy: report only regressions and below-threshold (not full coverage) to stay under 25K limit
- Handoff to Test Generator Agent

YAML frontmatter:
```yaml
name: CodeQualityDetector
description: "Code quality and coverage analysis — identifies below-threshold functions and quality issues"
tools: [read/readFile, search/textSearch, search/fileSearch, execute/runInTerminal, agent/runSubagent, todo]
handoffs:
  - label: "Generate Tests"
    agent: TestGenerator
    prompt: "Generate tests for the uncovered functions identified in the report above"
    send: false
```

Files:
* `agents/code-quality-detector.agent.md` - Code quality detector

Discrepancy references:
* New agent — follows proven Detector pattern from A11y

Success criteria:
* Follows Detector pattern (scope → analyze → report → handoff)
* Supports multiple languages and coverage formats
* Documents coverage-to-SARIF mapping
* 80% threshold documented as default

Context references:
* Research §5 (Lines 400-460) - Code quality section
* Subagent research: accessibility-code-quality-research.md

Dependencies:
* Phase 1 Step 1.4

### Step 5.2: Create `test-generator.agent.md`

Test generation agent following the Resolver pattern.

Agent body:
- Persona: Test engineering expert
- 5-step protocol:
  1. Read source code for uncovered functions (from detector findings)
  2. Analyze existing test patterns in the codebase
  3. Generate tests: happy path + error paths + edge cases
  4. Run tests and re-measure coverage
  5. Handoff back to Quality Detector for verification
- Framework-aware: Vitest, Jest, pytest, xUnit, JUnit, Go testing
- Output: test files following existing naming conventions

YAML frontmatter:
```yaml
name: TestGenerator
description: "Auto-generates tests for uncovered code — happy path, error paths, edge cases"
tools: [read/readFile, edit/editFiles, edit/createFile, execute/runInTerminal, search/textSearch, search/codebase, todo]
handoffs:
  - label: "Verify Coverage"
    agent: CodeQualityDetector
    prompt: "Re-analyze coverage to verify the generated tests meet the threshold"
    send: false
```

Files:
* `agents/test-generator.agent.md` - Test generation agent

Success criteria:
* Follows Resolver pattern (identify → analyze → fix → verify → handoff)
* Generates tests matching existing codebase patterns
* Handoff back to CodeQualityDetector

Context references:
* Research §5 (Lines 400-430) - Test Generator proposal

Dependencies:
* Phase 1 Step 1.4

### Step 5.3: Create `instructions/code-quality.instructions.md`

Auto-applied code quality rules.

YAML frontmatter:
```yaml
description: "Code quality standards — coverage thresholds, testing patterns, complexity limits"
applyTo: "**/*.ts,**/*.js,**/*.py,**/*.cs,**/*.java,**/*.go"
```

Content: Coverage threshold ≥80% for functions and branches. Testing patterns: unit tests for all public functions, integration tests for API endpoints, error path coverage. Complexity limits: cyclomatic complexity ≤ 10 per function. Naming conventions for test files.

Files:
* `instructions/code-quality.instructions.md` - Code quality auto-applied rules

Success criteria:
* `applyTo` covers major languages
* Defines 80% coverage threshold
* Documents testing patterns

Context references:
* Research §5 (Lines 435-460) - Quality gate pattern

Dependencies:
* Phase 1 Step 1.4

## Implementation Phase 6: FinOps / Cost Analysis Agents (New)

<!-- parallelizable: true -->

### Step 6.1: Create `cost-analysis-agent.agent.md`

Azure cost query and reporting agent.

Agent body:
- Persona: FinOps analyst specializing in Azure Cost Management
- Core responsibilities:
  - Query Azure Cost Management API (`Microsoft.CostManagement/query`)
  - Generate cost reports by resource group, service, tag
  - Produce trend analysis (daily/weekly/monthly)
  - Format output as Markdown tables and charts
- Authentication: Managed Identity with Cost Management Reader role
- SDK: `azure-mgmt-costmanagement>=4.0.1`
- Tag governance: assumes `ProjectName`, `Environment`, `CostCenter`, `Owner`, `Department`, `Application`, `CreatedDate` tags

Files:
* `agents/cost-analysis-agent.agent.md` - Cost analysis and reporting

Discrepancy references:
* Leverages existing `cost-analysis-ai` reference implementation

Success criteria:
* References Azure Cost Management Query API
* Documents required Azure RBAC role
* Covers tag-based cost attribution

Context references:
* Research §6 (Lines 465-575) - Full FinOps section
* Subagent research: cost-analysis-finops-research.md

Dependencies:
* Phase 1 Step 1.4

### Step 6.2: Create `finops-governance-agent.agent.md`

Tag compliance monitoring agent.

Agent body:
- Persona: Cloud governance specialist
- Monitors 7 required tags across Azure resources
- Generates tag compliance scoring (% tagged by resource group)
- Reports untagged resources as findings
- Integrates with Azure Policy tag inheritance

Files:
* `agents/finops-governance-agent.agent.md` - Tag compliance monitoring

Success criteria:
* Lists 7 required tags
* Generates compliance score
* References Azure Policy integration

Context references:
* Research §6 (Lines 530-545) - FinOps governance agent

Dependencies:
* Phase 1 Step 1.4

### Step 6.3: Create `cost-anomaly-detector.agent.md`

Cost anomaly detection and investigation agent.

Agent body:
- Persona: FinOps anomaly analyst
- Monitors Azure Cost Management anomaly detection (WaveNet on 60-day history)
- Investigates cost spikes: identifies resource, service, region, tag
- Generates investigation report with root cause analysis
- Triggers: anomaly webhook, daily scheduled check

Files:
* `agents/cost-anomaly-detector.agent.md` - Cost anomaly detection

Success criteria:
* References Azure anomaly detection mechanism
* Defines investigation workflow
* Documents trigger patterns

Context references:
* Research §6 (Lines 530-545) - Anomaly detector agent

Dependencies:
* Phase 1 Step 1.4

### Step 6.4: Create `cost-optimizer-agent.agent.md`

Azure Advisor recommendation surfacing agent.

Agent body:
- Persona: Cloud cost optimization specialist
- Queries Azure Advisor for cost recommendations
- Categories: right-sizing, reserved instances, shutdown schedules, storage tier optimization
- Generates prioritized recommendation report with estimated savings
- Weekly scheduled execution

Files:
* `agents/cost-optimizer-agent.agent.md` - Cost optimization recommendations

Success criteria:
* References Azure Advisor API
* Categorizes recommendations by type
* Includes estimated savings

Context references:
* Research §6 (Lines 530-545) - Optimizer agent

Dependencies:
* Phase 1 Step 1.4

### Step 6.5: Create `deployment-cost-gate-agent.agent.md`

Deployment cost gating agent for IaC PRs.

Agent body:
- Persona: FinOps gatekeeper for infrastructure deployments
- Trigger: PR containing IaC changes (Terraform, Bicep)
- Analysis: estimate resource costs using Azure Pricing API + Cost Management forecasts
- Gate logic: compare estimated monthly cost against remaining budget
- Output: cost estimate report with approve/block recommendation
- SARIF output: `finops-finding/v1` category for budget violations

Files:
* `agents/deployment-cost-gate-agent.agent.md` - Deployment cost gate

Discrepancy references:
* New pattern — no proven reference; design based on Research §6 proposals

Success criteria:
* Analyzes IaC for cost estimation
* Compares against budget thresholds
* Produces SARIF-compatible findings
* Clear approve/block recommendation

Context references:
* Research §6 (Lines 550-575) - Cost gate pattern

Dependencies:
* Phase 1 Step 1.4

## Implementation Phase 7: Prompt File Security & APM

<!-- parallelizable: true -->

### Step 7.1: Create `apm.yml` Manifest

APM manifest declaring all agent dependencies for this framework repository.

Content: Declare all agents, instructions, prompts, and skills as managed dependencies. Enable `apm audit` scanning. Define package metadata (name, version, description, author).

```yaml
name: agentic-devsecops-framework
version: 1.0.0
description: "Agentic DevSecOps Framework — GHAS + GHCP + MDC"
author: devopsabcs-engineering

dependencies:
  # Security agents (from .github-private patterns)
  # Accessibility agents
  # Code Quality agents
  # FinOps agents
  # Instructions and prompts

security:
  audit:
    on-install: true
    on-compile: true
    severity-threshold: critical
```

Files:
* `apm.yml` - APM manifest for agent dependency management

Discrepancy references:
* Research §7 recommends APM adoption — implementing `apm.yml` manifest

Success criteria:
* Valid APM YAML schema
* Declares all agent categories
* Security scanning enabled on install and compile

Context references:
* Research §7 (Lines 432-500) - APM section
* Subagent research: prompt-file-security-research.md

Dependencies:
* None (root-level file)

### Step 7.2: Create `docs/prompt-file-security.md`

Comprehensive documentation on prompt file security threats and mitigations.

Content:
- The blind spot: agent config files as trusted system instructions not covered by SAST/SCA/DAST
- Attack categories table (6 attacks from Research §7)
- OWASP LLM Top 10 alignment (LLM01, LLM03, LLM06, LLM07)
- APM as the primary defense: `apm audit` capabilities, severity levels, exit codes
- Defense-in-depth: install-time → audit → compile-time scanning
- CODEOWNERS protection pattern
- CI pipeline scanning checklist (base64, Unicode, URLs, shell commands, override patterns, MCP allowlist)
- `microsoft/apm-action` CI/CD integration
- Daniel Meppiel's contribution and LinkedIn article reference

Files:
* `docs/prompt-file-security.md` - Prompt file security documentation

Success criteria:
* Documents all 6 attack categories
* Maps to OWASP LLM Top 10
* APM integration documented with CLI examples
* CI/CD scanning workflow pattern included

Context references:
* Research §7 (Lines 400-510) - Full prompt security section
* Subagent research: prompt-file-security-research.md

Dependencies:
* None

## Implementation Phase 8: CI/CD Workflows

<!-- parallelizable: false -->

### Step 8.1: Create `.github/workflows/security-scan.yml`

Unified security scanning pipeline with SARIF upload for all 8 security domains.

Workflow triggers: `push` to main, `pull_request` to main.

Jobs:
- `secrets`: GitHub Secret Protection (auto — no workflow step needed, just document)
- `sca`: Dependabot + Dependency Review Action + SBOM generation
- `sast`: CodeQL init → autobuild → analyze (default + advanced setup options)
- `iac`: MSDO action (`microsoft/security-devops-action@v1`) with Checkov, Trivy, tfsec
- `container`: Trivy container scan (conditional on Dockerfile existence)
- `dast`: ZAP baseline scan (conditional on deployment URL)

Each job uploads SARIF via `github/codeql-action/upload-sarif@v4` with distinct categories:
- `secret-scanning/`, `dependency-review/`, `codeql/`, `iac-scanning/`, `container-scanning/`, `dast/`

Example structure with proper `permissions: security-events: write`.

Files:
* `.github/workflows/security-scan.yml` - Unified security scanning pipeline

Success criteria:
* Covers all applicable security domains
* Each SARIF upload has unique `automationDetails.id` category
* Proper `permissions` block with minimal scope
* Action versions pinned to SHA or specific version

Context references:
* Research §3 (Lines 255-270) - CI/CD security pipeline (8 domains)
* Research §8 (Lines 588-610) - SARIF category table

Dependencies:
* Phase 1 Step 1.4 (workflows directory)

### Step 8.2: Create `.github/workflows/accessibility-scan.yml`

Accessibility scanning workflow with three-engine scanner and SARIF upload.

Workflow triggers: `pull_request`, `schedule` (weekly cron).

Jobs:
- Install Node.js + Playwright + axe-core + IBM Equal Access
- Run `npx a11y-scan scan --url "$SCAN_URL" --threshold 80 --format sarif --output a11y-results.sarif`
- Upload SARIF with category `accessibility-scan/`
- Threshold gate: fail if score < 70 or critical/serious > 0
- Matrix strategy for multi-site scanning

Files:
* `.github/workflows/accessibility-scan.yml` - Accessibility scanning pipeline

Success criteria:
* Invokes three-engine scanner
* SARIF upload with `accessibility-scan/` category
* Threshold gating implemented
* Supports matrix strategy for multiple URLs

Context references:
* Research §4 (Lines 390-400) - Compliance control patterns
* Research §8 (Lines 588-610) - SARIF category table

Dependencies:
* Phase 1 Step 1.4
* Phase 4 (a11y agents, for documentation reference)

### Step 8.3: Create `.github/workflows/code-quality.yml`

Code quality enforcement workflow with coverage-to-SARIF conversion.

Workflow triggers: `pull_request` to main.

Jobs:
- Run lint (`npm run lint` or language equivalent)
- Run type checking (`npx tsc --noEmit` or equivalent)
- Run tests with coverage (`npm run test:ci` producing lcov/cobertura)
- Coverage threshold check (fail if < 80%)
- Convert coverage to SARIF (report below-threshold functions)
- Upload SARIF with category `code-quality/coverage/`

Files:
* `.github/workflows/code-quality.yml` - Code quality enforcement pipeline

Success criteria:
* Lint + type check + test + coverage stages
* 80% threshold gate
* SARIF upload with `code-quality/coverage/` category
* Coverage-to-SARIF conversion step

Context references:
* Research §5 (Lines 435-460) - Quality gate pattern

Dependencies:
* Phase 1 Step 1.4

### Step 8.4: Create `.github/workflows/apm-security.yml`

APM security scanning on PRs modifying agent config files.

Workflow triggers: `pull_request` with path filters for agent config files (repo-root layout for `.github-private`).

```yaml
on:
  pull_request:
    paths:
      - 'apm.yml'
      - 'mcp.json'
      - 'agents/**'
      - 'instructions/**'
      - 'prompts/**'
      - 'skills/**'
      - '**/*.agent.md'
      - '**/*.instructions.md'
      - '**/*.prompt.md'
      - '**/AGENTS.md'
      - '**/SKILL.md'
      - '.github/copilot-instructions.md'
```

Jobs:
- Checkout repository
- Run `microsoft/apm-action@v1` with `command: audit`
- Fail on critical findings (exit code 1)

Files:
* `.github/workflows/apm-security.yml` - APM agent config security scan

Discrepancy references:
* Implements Research §7 recommended CI/CD integration

Success criteria:
* Path filters cover all agent config file patterns
* Uses `microsoft/apm-action@v1`
* Fails on critical findings

Context references:
* Research §7 (Lines 475-500) - APM CI/CD workflow
* Subagent research: prompt-file-security-research.md

Dependencies:
* Phase 7 Step 7.1 (apm.yml exists)

### Step 8.5: Create `.github/workflows/finops-cost-gate.yml`

Cost estimation gate for IaC PRs.

Workflow triggers: `pull_request` with path filters for IaC files.

```yaml
on:
  pull_request:
    paths:
      - '**/*.tf'
      - '**/*.bicep'
      - '**/*.json'  # ARM templates
```

Jobs:
- Parse IaC files for Azure resource definitions
- Estimate monthly cost using Azure Pricing Calculator API or Infracost
- Compare against configured budget threshold
- Convert cost findings to SARIF format with `finops-finding/` category
- Upload SARIF via `github/codeql-action/upload-sarif@v4`
- Post cost estimate as PR comment
- Fail if estimated cost exceeds budget

Files:
* `.github/workflows/finops-cost-gate.yml` - IaC cost estimation gate

Discrepancy references:
* DD-01: Uses Infracost as practical tool; research mentions Azure Pricing API but Infracost is more mature for CI/CD
* DR-10: SARIF upload added to address finops-finding/ category requirement

Success criteria:
* Triggers on IaC file changes
* Posts cost estimate as PR comment
* Gates on budget threshold
* Uploads SARIF with `finops-finding/` category

Context references:
* Research §6 (Lines 550-575) - Cost gate pattern

Dependencies:
* Phase 1 Step 1.4

### Step 8.6: Create `docs/azure-devops-pipelines.md`

ADO pipeline equivalents documentation.

Content:
- Equivalent ADO YAML for each GitHub Actions workflow
- GHAzDO task names: `AdvancedSecurity-Codeql-Init@1`, `AdvancedSecurity-Codeql-Analyze@1`, `AdvancedSecurity-Dependency-Scanning@1`, `AdvancedSecurity-Publish@1`
- Custom SARIF publishing to ADO Advanced Security
- JUnit test results: `PublishTestResults@2`
- Code coverage: `PublishCodeCoverageResults@2` with Cobertura
- ADO variable groups for budget thresholds
- ADO environment approvals for cost gates
- Sample `azure-pipelines.yml` fragments for each domain

Also create sample pipeline files in `samples/azure-devops/`:
- `security-pipeline.yml`
- `accessibility-pipeline.yml`
- `quality-pipeline.yml`

Files:
* `docs/azure-devops-pipelines.md` - ADO pipeline documentation
* `samples/azure-devops/security-pipeline.yml` - ADO security pipeline sample
* `samples/azure-devops/accessibility-pipeline.yml` - ADO accessibility pipeline sample
* `samples/azure-devops/quality-pipeline.yml` - ADO quality pipeline sample

Success criteria:
* Every GitHub workflow has an ADO equivalent documented
* GHAzDO-specific task names correct
* Sample YAML files are valid ADO pipeline syntax

Context references:
* Research §8 (Lines 615-750) - ADO pipeline section with feature comparison

Dependencies:
* Phase 8 Steps 8.1-8.5 (need to know what to create ADO equivalents for)

## Implementation Phase 9: Agent Extensibility & Governance Documentation

<!-- parallelizable: true -->

### Step 9.1: Create `docs/agent-extensibility.md`

Agent plugin and extensibility model documentation.

Content:
- Agent plugin architecture (VS Code): `plugin.json`, skills, agents, hooks bundle structure
- Plugin marketplaces: default (`github/copilot-plugins`, `github/awesome-copilot`), custom, local
- Extensibility comparison table (Custom Agent vs Skill vs Plugin vs MCP Server vs Instructions vs APM Package)
- Organization-scale sharing mechanisms (Enterprise `.github-private`, org `.github-private`, plugins, reusable workflows)
- MCP server integration patterns for external tool extensibility
- APM as the dependency manager for agent configurations

Files:
* `docs/agent-extensibility.md` - Agent extensibility documentation

Success criteria:
* Covers all extensibility mechanisms
* Contains the extensibility comparison table
* Documents org-scale sharing hierarchy

Context references:
* Research §10 (Lines 700-770) - Full extensibility section
* Subagent research: ghcp-agent-plugins-research.md

Dependencies:
* None

### Step 9.2: Create `docs/centralized-governance.md`

Centralized governance documentation.

Content:
- Dual-platform data flow diagrams (GitHub path + ADO path → Defender for Cloud)
- GitHub Security Overview: capabilities, filtering, Security Campaigns + Copilot Autofix
- ADO Security Overview: UI-only limitations, compensated by Power BI
- Microsoft Defender for Cloud: GenAI workload protection, attack path analysis, cross-platform DevOps insights
- Defender for DevOps Console: unified vulnerability management
- Complementary dashboards table (Security Overview, ADO Security Overview, Power BI AdvSec, Defender for Cloud, Defender for DevOps)
- Integration requirements: GHAS, GHAzDO, connectors, permissions
- Power BI `advsec-pbi-report-ado` deployment and architecture

Files:
* `docs/centralized-governance.md` - Centralized governance documentation

Success criteria:
* Contains dual-platform data flow diagrams (Mermaid)
* Documents all 5 complementary dashboards
* Covers Defender for Cloud + Defender for DevOps integration
* References Power BI report for ADO gap compensation

Context references:
* Research §9 (Lines 630-700) - Full governance section
* Research §8 (Lines 750-810) - Power BI dashboards

Dependencies:
* None

## Implementation Phase 10: Sample/Demo Application

<!-- parallelizable: false -->

### Step 10.1: Create `sample-app/` — Next.js Web Application Scaffold

Create a minimal Next.js application with intentional issues across all 4 agent domains. The app represents a typical Azure-deployed web application with a product catalog, user authentication, and infrastructure-as-code.

Tech stack: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Prisma (for database), Bicep/Terraform for IaC.

Structure:
```text
sample-app/
├── package.json
├── tsconfig.json
├── next.config.js
├── src/
│   ├── app/
│   │   ├── layout.tsx       ← Missing lang attribute (a11y)
│   │   ├── page.tsx         ← Low contrast text (a11y)
│   │   └── products/
│   │       ├── page.tsx     ← No alt text on images (a11y)
│   │       └── [id]/page.tsx ← SQL injection in query (security)
│   ├── lib/
│   │   ├── db.ts            ← Hardcoded connection string (security)
│   │   ├── auth.ts          ← Weak crypto, no rate limiting (security)
│   │   └── utils.ts         ← High complexity, no tests (quality)
│   └── components/
│       ├── Header.tsx        ← Broken heading hierarchy (a11y)
│       └── ProductCard.tsx   ← XSS vulnerability (security)
├── infra/
│   ├── main.bicep           ← Missing tags, public endpoints, no encryption (FinOps + security)
│   └── variables.bicep      ← Oversized SKUs (FinOps)
├── __tests__/
│   └── placeholder.test.ts  ← Only 1 test, <30% coverage (quality)
└── README.md                ← Documents all intentional issues
```

Files:
* `sample-app/package.json` - Next.js project configuration
* `sample-app/tsconfig.json` - TypeScript configuration
* `sample-app/next.config.js` - Next.js configuration
* `sample-app/src/app/layout.tsx` - Root layout with a11y issues
* `sample-app/src/app/page.tsx` - Home page with a11y issues
* `sample-app/src/app/products/page.tsx` - Product listing with a11y issues
* `sample-app/src/app/products/[id]/page.tsx` - Product detail with SQL injection
* `sample-app/src/lib/db.ts` - Database module with hardcoded secrets
* `sample-app/src/lib/auth.ts` - Auth module with weak crypto
* `sample-app/src/lib/utils.ts` - Utility functions with high complexity, no tests
* `sample-app/src/components/Header.tsx` - Header with broken heading hierarchy
* `sample-app/src/components/ProductCard.tsx` - Product card with XSS
* `sample-app/infra/main.bicep` - IaC with missing tags and security issues
* `sample-app/infra/variables.bicep` - Variables with oversized SKUs

Success criteria:
* Valid Next.js project that can be installed and built
* Contains at least 3 intentional issues per domain

Context references:
* Research §11 - Proof-of-value examples per domain
* Research §3 (security patterns), §4 (a11y patterns), §5 (quality patterns), §6 (FinOps patterns)

Dependencies:
* Phase 1 Step 1.4 (sample-app directory)

### Step 10.2: Inject Intentional Security Vulnerabilities

Embed realistic but clearly-commented security issues for agents to detect:
- **SQL injection**: Raw string concatenation in database query (`[id]/page.tsx`)
- **Hardcoded secrets**: Database connection string in source code (`db.ts`)
- **Weak cryptography**: MD5 password hashing (`auth.ts`)
- **XSS**: Unescaped user input rendered via `dangerouslySetInnerHTML` (`ProductCard.tsx`)
- **Insecure IaC**: Public blob storage, no HTTPS enforcement, missing NSG rules (`main.bicep`)
- **Missing SBOM**: No `@anchore/sbom-action` in CI
- Add `// INTENTIONAL-VULNERABILITY: <description>` comments for documentation

Files:
* Files listed in Step 10.1 containing security issues

Success criteria:
* SecurityReviewerAgent can detect SQL injection, XSS, weak crypto
* IaCSecurityAgent can detect insecure Bicep configurations
* SupplyChainSecurityAgent can detect hardcoded secrets

Dependencies:
* Step 10.1

### Step 10.3: Inject Intentional Accessibility Violations

Embed WCAG 2.2 violations across components:
- **Missing alt text**: `<img>` tags without `alt` attribute on product images
- **Missing form labels**: Search input without associated `<label>`
- **Low contrast**: Light gray text (#999) on white background
- **Broken heading hierarchy**: `<h1>` → `<h3>` (skipping `<h2>`)
- **Missing lang attribute**: `<html>` without `lang` prop in `layout.tsx`
- **Small touch targets**: Navigation links with 16px click area
- Add `{/* INTENTIONAL-A11Y-VIOLATION: <description> */}` comments

Files:
* Files listed in Step 10.1 containing a11y issues

Success criteria:
* A11yDetector can identify all 6 violation categories
* SARIF output maps correctly to WCAG SC references

Dependencies:
* Step 10.1

### Step 10.4: Inject Intentional Code Quality Issues

Create code with measurable quality gaps:
- **Low coverage**: Only 1 test file covering <30% of code
- **High complexity**: `utils.ts` with cyclomatic complexity >15 functions
- **No type safety**: `any` types in multiple locations
- **Missing error handling**: Async functions without try/catch
- **Duplicate code**: Similar functions in multiple files
- Add `// INTENTIONAL-QUALITY-ISSUE: <description>` comments

Files:
* `sample-app/src/lib/utils.ts` - Complex utility functions
* `sample-app/__tests__/placeholder.test.ts` - Minimal test file

Success criteria:
* CodeQualityDetector reports coverage <80%
* Multiple uncovered functions identified
* Complexity violations surfaced

Dependencies:
* Step 10.1

### Step 10.5: Create Sample IaC with Cost Governance Gaps

Create Bicep infrastructure with FinOps issues:
- **Untagged resources**: App Service, Storage, SQL without `ProjectName`/`Environment`/`CostCenter` tags
- **Oversized SKUs**: Premium tier where Basic suffices
- **No budget**: Missing budget resource definition
- **Public endpoints**: Resources with public access enabled (overlaps security)
- Add `// INTENTIONAL-FINOPS-ISSUE: <description>` comments

Files:
* `sample-app/infra/main.bicep` - Infrastructure with cost governance gaps
* `sample-app/infra/variables.bicep` - Variables with oversized SKU parameters

Success criteria:
* FinOpsGovernanceAgent detects untagged resources
* DeploymentCostGateAgent identifies oversized SKUs
* Cost estimate exceeds reasonable budget threshold

Dependencies:
* Step 10.1

### Step 10.6: Create `sample-app/README.md`

Document all intentional issues by domain as a testing guide:
- Table of issues: domain, file, line, description, expected agent finding
- Instructions for running each agent against the sample app
- Expected SARIF output categories per scan
- Verification checklist for agent testing

Files:
* `sample-app/README.md` - Sample app testing guide

Success criteria:
* Documents all intentional issues with file/line references
* Provides agent invocation instructions per domain

Dependencies:
* Steps 10.1-10.5

## Implementation Phase 11: Validation

<!-- parallelizable: false -->

### Step 11.1: Validate Agent File Integrity

Execute validation across all `agents/*.agent.md` files:
* YAML frontmatter parses correctly (name, description, tools are present)
* Character count ≤ 30,000
* Body follows expected structure (persona, responsibilities, output, invocation)
* Handoff references point to agents that exist

### Step 11.2: Validate Instruction Files

Check all `instructions/*.instructions.md`:
* YAML frontmatter has `description` and `applyTo`
* `applyTo` glob patterns are syntactically valid
* No overlapping glob patterns with conflicting rules

### Step 11.3: Validate Markdown Link Integrity

Run link checks across all `docs/*.md` and `README.md`:
* Internal cross-references resolve to existing files
* Mermaid diagram syntax is valid (no rendering errors)
* No broken anchor links

### Step 11.4: Validate SARIF Category Uniqueness

Scan all `.github/workflows/*.yml` for `category:` values:
* No duplicate `automationDetails.id` categories across workflows
* Categories match the 10-entry registry in `docs/sarif-integration.md`

### Step 11.5: Run APM Audit Dry-Run

Execute `apm audit` on all agent config files (repo-root `agents/`, `instructions/`, `prompts/`, `skills/`):
* Verify no hidden Unicode characters
* Verify no bidi overrides or tag characters

### Step 11.6: Validate mcp.json Configuration

Verify `mcp.json`:
* Valid JSON schema
* No hardcoded credentials (uses environment variable references)
* MCP server command is valid

### Step 11.7: Test Agents Against Sample App

Run each domain's agents against `sample-app/` and verify:
* Security agents detect injected vulnerabilities
* A11y agents detect WCAG violations
* Code quality agents identify below-threshold coverage
* FinOps agents flag untagged/oversized IaC resources
* Compare findings against `sample-app/README.md` issue catalog

### Step 11.8: Fix Minor Validation Issues

Iterate on any validation failures:
* Fix YAML frontmatter syntax errors
* Correct broken cross-references
* Fix Mermaid diagram syntax
* Resolve category conflicts

### Step 11.9: Report Blocking Issues

Document any issues requiring additional research:
* Agent specification changes from GitHub
* SARIF schema version updates
* APM compatibility issues
* Provide user with next steps and recommended planning

## Dependencies

* GitHub Copilot with custom agent support
* GitHub Advanced Security (GHAS)
* GitHub Advanced Security for Azure DevOps (GHAzDO)
* Microsoft Defender for Cloud
* APM (`microsoft/apm`) v0.8.0+
* `microsoft/apm-action` GitHub Action
* `github/codeql-action/upload-sarif@v4`
* MSDO (`microsoft/security-devops-action@v1`)
* axe-core, IBM Equal Access, Playwright
* Azure Cost Management SDK
* Power BI Desktop (for `advsec-pbi-report-ado`)
* Node.js + Next.js (sample application)
* MCP server for ADO work items (configured via `mcp.json`)

## Success Criteria

* Repository structured for `.github-private` org-wide deployment: `agents/`, `instructions/`, `prompts/`, `skills/` at repo root
* All 15+ agent files have valid YAML frontmatter in `agents/`
* All workflow files produce SARIF with unique categories
* All docs files have valid cross-references
* CODEOWNERS covers all agent config paths (repo-root layout)
* `mcp.json` configures ADO work items MCP server with no hardcoded credentials
* APM audit passes clean on all agent config files
* Sample application in `sample-app/` has intentional issues across all 4 domains
* Agents detect intentional issues in sample-app during validation phase
