# GitHub Private Repository - Custom Copilot Security Agents Research

## Status: Complete

## Research Topics

- All agent definition files (.agent.md and .md files in `agents/` directory)
- All instruction files (.instructions.md files in `instructions/` directory)
- Custom agent patterns, especially security-related agents
- copilot-instructions.md or AGENTS.md files
- Agent structure patterns (YAML frontmatter, tool restrictions, descriptions)
- Security-specific agents
- Accessibility agents
- SARIF-related patterns
- Prompt files in `prompts/` directory

---

## Repository Overview

**Repository:** `devopsabcs-engineering/.github-private`
**License:** MIT (Copyright 2025 GitHub Docs)
**Purpose:** Custom agents template for enterprise/organization Copilot custom agents

The repository is based on the [GitHub custom agents template](https://docs.github.com/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents). Organization owners create a `.github-private` repo to make custom agents available across all repos in the org.

### Directory Structure

```text
.github-private/
├── README.md
├── LICENSE
├── agents/
│   ├── example-agent.md              (template - commented out)
│   ├── security-agent.md
│   ├── security-reviewer-agent.md
│   ├── security-plan-creator.agent.md
│   ├── pipeline-security-agent.md
│   ├── iac-security-agent.md
│   ├── supply-chain-security-agent.md
│   ├── a11y-detector.agent.md
│   └── a11y-resolver.agent.md
├── instructions/
│   ├── wcag22-rules.instructions.md
│   └── a11y-remediation.instructions.md
└── prompts/
    ├── a11y-scan.prompt.md
    └── a11y-fix.prompt.md
```

---

## Complete Agent Inventory

### 1. SecurityAgent

| Property | Value |
|----------|-------|
| **File** | `agents/security-agent.md` |
| **Name** | `SecurityAgent` |
| **Description** | Security Agent - Reviews this repository (ASP.NET Core Razor Pages + IaC) for security issues and produces a security report |
| **Model** | Claude Sonnet 4.5 (copilot) |
| **Role** | Broad security reviewer — the "main" holistic security agent |
| **Output** | `security-reports/security-assessment-report.md` |
| **Handoffs** | None |

**Key behaviors:**

- Scans `src/webapp01` (ASP.NET Core Razor Pages), IaC, CI/CD workflows
- Performs SAST (code analysis), SCA (dependency analysis), IaC review, CI/CD review
- Produces structured security assessment report with severity-ranked findings
- Maps findings to OWASP/CWE standards
- Includes mandatory "THIS ASSESSMENT CONTAINS A CRITICAL VULNERABILITY" message for critical findings
- Autonomous: completes analysis and exits without waiting for user input

### 2. SecurityReviewerAgent

| Property | Value |
|----------|-------|
| **File** | `agents/security-reviewer-agent.md` |
| **Name** | `SecurityReviewerAgent` |
| **Description** | Security-focused code reviewer that checks for common vulnerabilities |
| **Model** | Claude Sonnet 4.5 (copilot) |
| **Role** | Focused code-level security reviewer |
| **Handoffs** | None |

**Key behaviors:**

- OWASP Top 10 vulnerability detection
- Input validation and sanitization checks
- Authentication/authorization logic review
- Injection vulnerability detection (SQL, XSS, command injection)
- Cryptographic practices review
- Severity levels: CRITICAL, HIGH, MEDIUM, LOW, INFO
- Direct, constructive communication style with code examples for fixes

### 3. SecurityPlanCreatorAgent

| Property | Value |
|----------|-------|
| **File** | `agents/security-plan-creator.agent.md` |
| **Name** | `SecurityPlanCreatorAgent` |
| **Description** | Expert security architect for creating comprehensive cloud security plans - Brought to you by microsoft/hve-core |
| **Model** | Claude Sonnet 4.5 (copilot) |
| **Role** | Security plan architect for blueprints |
| **Output** | `security-plan-outputs/security-plan-{blueprint-name}.md` |
| **Handoffs** | None |

**Key behaviors:**

- 5-phase workflow: Blueprint Selection → Architecture Analysis → Threat Assessment → Plan Generation → Validation
- Examines Terraform/Bicep infrastructure blueprints
- Applies threat categories framework (DS, NS, PA, IM, DP, PV, ES, GS)
- Generates Mermaid architecture diagrams
- Interactive: generates section-by-section, collects user feedback
- Creates tracking plan at `.copilot-tracking/plans/security-plan-{blueprint-name}.plan.md`

### 4. PipelineSecurityAgent

| Property | Value |
|----------|-------|
| **File** | `agents/pipeline-security-agent.md` |
| **Name** | `PipelineSecurityAgent` |
| **Description** | Pipeline & CI Workflow Hardening Agent - Audits GitHub Actions and Azure DevOps YAML for security weaknesses and produces hardened workflow patches |
| **Model** | Claude Sonnet 4.5 (copilot) |
| **Role** | CI/CD pipeline hardening specialist |
| **Handoffs** | None |

**Key behaviors:**

- 7 security focus areas: Permissions, Action Pinning, Script Injection, Event Triggers, Secrets, Shell Security, Environment/Runner Security
- Covers both GitHub Actions and Azure DevOps pipelines
- Produces hardened workflow diffs (unified diff format)
- Generates change justification checklists
- Optional org-wide policy profile generation
- SHA-pinning recommendations for all actions
- Autonomous: exits with complete report

### 5. IaCSecurityAgent

| Property | Value |
|----------|-------|
| **File** | `agents/iac-security-agent.md` |
| **Name** | `IaCSecurityAgent` |
| **Description** | IaC & Cloud Configuration Guard - Scans Terraform, Bicep, ARM, Kubernetes manifests, and Helm charts for misconfigurations and insecure defaults |
| **Model** | Claude Sonnet 4.5 (copilot) |
| **Role** | Infrastructure-as-Code security scanner |
| **Handoffs** | None |

**Key behaviors:**

- Supports: Terraform, Bicep, ARM, Kubernetes, Helm, Dockerfile
- 6 security categories: IAM, Network Security, Data Protection, Logging, Container Security, Backup/DR
- Maps findings to compliance frameworks: CIS Azure, NIST 800-53, Azure Security Benchmark, PCI-DSS
- MSDO analyzer integration (Checkov, Template Analyzer, tfsec/Trivy, Kubesec)
- Produces PR-ready fix packs with minimal diffs
- SARIF output format recommended for CI tools
- Autonomous: exits with complete report

### 6. SupplyChainSecurityAgent

| Property | Value |
|----------|-------|
| **File** | `agents/supply-chain-security-agent.md` |
| **Name** | `SupplyChainSecurityAgent` |
| **Description** | Supply Chain Security Agent - Detects secrets exposure, dependency vulnerabilities, and repo governance gaps; produces supply-chain hardening reports and PR-ready baseline fixes |
| **Model** | Claude Sonnet 4.5 (copilot) |
| **Role** | Software supply chain security specialist |
| **Handoffs** | None |

**Key behaviors:**

- 4 security domains: Secrets Detection, Dependency Security (SCA), Provenance & SBOM, Repository Governance
- Critical guardrail: Never expose actual secret values
- Multi-ecosystem dependency coverage (npm, Python, .NET, Java, Go, Rust, Ruby)
- GHAS integration (CodeQL, Dependabot, secret scanning)
- SLSA framework alignment for release integrity
- Produces 3 output artifacts: Security Report, PR-Ready Changes, Engineering Backlog
- Cross-references other agents for out-of-scope items:
  - Application code → SecurityReviewerAgent
  - CI/CD → PipelineSecurityAgent
  - IaC → IaCSecurityAgent
- Autonomous: exits with complete report

### 7. A11y Detector

| Property | Value |
|----------|-------|
| **File** | `agents/a11y-detector.agent.md` |
| **Name** | `A11y Detector` |
| **Description** | Detects AODA WCAG 2.2 accessibility violations through static code analysis and runtime scanning |
| **Model** | Not specified (uses default) |
| **Role** | Accessibility violation detector |
| **Handoffs** | `→ A11y Resolver` ("Fix Violations") |

**Key behaviors:**

- AODA WCAG 2.2 Level AA compliance focus
- 5-step workflow: Scope → Static Analysis → Runtime Scanning (optional) → Report → Handoff
- Top 10 React/Next.js violations tracked
- Weighted scoring system (Critical=10, Serious=7, Moderate=3, Minor=1)
- POUR principle breakdown (Perceivable, Operable, Understandable, Robust)
- Uses `npx a11y-scan` CLI for runtime scanning (axe-core, IBM Equal Access, custom Playwright checks)
- Grade scale: A ≥ 90, B ≥ 70, C ≥ 50, D ≥ 30, F < 30
- Hands off to A11y Resolver for automated fixes

### 8. A11y Resolver

| Property | Value |
|----------|-------|
| **File** | `agents/a11y-resolver.agent.md` |
| **Name** | `A11y Resolver` |
| **Description** | Resolves AODA WCAG 2.2 accessibility violations with standards-compliant code fixes |
| **Model** | Not specified (uses default) |
| **Role** | Accessibility violation fixer |
| **Handoffs** | `→ A11y Detector` ("Re-scan") |

**Key behaviors:**

- 6-step workflow: Identify Violations → Analyze Code → Apply Fixes → Verify → Report → Handoff
- Accepts input from A11y Detector handoff, JSON scan results, or user description
- Comprehensive remediation patterns lookup table
- React/Next.js specific fix patterns
- Anti-pattern awareness (tabIndex > 0, role="button" without keyboard handlers, etc.)
- Produces remediation summary with before/after violation counts
- Hands off back to A11y Detector for verification re-scan

---

## Instruction Files

### 1. wcag22-rules.instructions.md

| Property | Value |
|----------|-------|
| **File** | `instructions/wcag22-rules.instructions.md` |
| **Description** | AODA WCAG 2.2 Level AA compliance rules for accessibility in web components |
| **applyTo** | `**/*.tsx, **/*.jsx, **/*.ts, **/*.html, **/*.css` |

**Content:** AODA/WCAG 2.2 context, Perceivable rules, Operable rules, Understandable rules, Robust rules, React/Next.js specific rules, scoring system reference.

### 2. a11y-remediation.instructions.md

| Property | Value |
|----------|-------|
| **File** | `instructions/a11y-remediation.instructions.md` |

**Content:** Fix prioritization by impact severity, remediation lookup table mapping violation IDs to WCAG success criteria and fixes, React/Next.js code patterns, common anti-patterns to avoid.

---

## Prompt Files

### 1. a11y-scan.prompt.md

| Property | Value |
|----------|-------|
| **File** | `prompts/a11y-scan.prompt.md` |
| **Description** | Run an AODA WCAG 2.2 accessibility scan on the current project |
| **Agent** | A11y Detector |
| **Argument Hint** | `[url=http://localhost:3000] [scope=page|site]` |

### 2. a11y-fix.prompt.md

| Property | Value |
|----------|-------|
| **File** | `prompts/a11y-fix.prompt.md` |
| **Description** | Fix accessibility violations in the current file or project |
| **Agent** | A11y Resolver |
| **Argument Hint** | `[file=current] [violations=...]` |

---

## Agent File Structure Pattern

### YAML Frontmatter Schema

All agents share identical frontmatter structure with these fields:

```yaml
---
name: AgentName                    # PascalCase or display name
description: "Description text"    # One-line summary
model: Claude Sonnet 4.5 (copilot) # Optional — omitted on a11y agents
tools:                             # Extensive tool whitelist
  # VS Code tools
  - vscode/getProjectSetupInfo
  - vscode/installExtension
  - vscode/memory
  - vscode/newWorkspace
  - vscode/runCommand
  - vscode/vscodeAPI
  - vscode/extensions
  - vscode/askQuestions
  # Execution tools
  - execute/runNotebookCell
  - execute/testFailure
  - execute/getTerminalOutput
  - execute/awaitTerminal
  - execute/killTerminal
  - execute/createAndRunTask
  - execute/runInTerminal
  - execute/runTests
  # Read tools
  - read/getNotebookSummary
  - read/problems
  - read/readFile
  - read/readNotebookCellOutput
  - read/terminalSelection
  - read/terminalLastCommand
  # Agent tools
  - agent/runSubagent
  # Edit tools
  - edit/createDirectory
  - edit/createFile
  - edit/createJupyterNotebook
  - edit/editFiles
  - edit/editNotebook
  - edit/rename
  # Search tools
  - search/changes
  - search/codebase
  - search/fileSearch
  - search/listDirectory
  - search/searchResults
  - search/textSearch
  - search/usages
  # Web tools
  - web/fetch
  - web/githubRepo
  - browser/openBrowserPage
  # Task tools
  - todo
handoffs:                          # Optional — agent-to-agent handoff
  - label: "Button Label"
    agent: TargetAgentName
    prompt: "Contextual prompt"
    send: false
---
```

### Body Structure Pattern

After frontmatter, agents follow this Markdown pattern:

```markdown
# Agent Display Name

{One-paragraph expert persona description}

## Core Responsibilities
- {bullet list of primary duties}

## Scope & Non-Goals          # Optional
## Security Focus Areas        # Domain-specific sections
## Output Format / Requirements
## Review Process
## Severity Classification     # Consistent 4-level system
## Reference Standards
## Invocation                  # Autonomous execution instructions
```

**Common patterns across agents:**

1. **Expert persona introduction** — First paragraph establishes the agent's identity and expertise
2. **Core Responsibilities** — Bullet list of 5-8 primary duties
3. **Domain-specific deep sections** — Detailed checklists, examples, severity tables
4. **Output format specification** — Exact Markdown templates for reports
5. **Review process** — Numbered step-by-step workflow
6. **Severity classification** — CRITICAL / HIGH / MEDIUM / LOW with criteria/examples
7. **Reference standards** — Links to authoritative sources
8. **Invocation section** — Autonomous execution: "Exit with a complete report. Do not wait for user input."

### File Naming Conventions

Two naming patterns observed:

1. **`.agent.md`** — Used for: `security-plan-creator.agent.md`, `a11y-detector.agent.md`, `a11y-resolver.agent.md`
2. **`.md`** (plain) — Used for: `security-agent.md`, `security-reviewer-agent.md`, `pipeline-security-agent.md`, `iac-security-agent.md`, `supply-chain-security-agent.md`

Both are recognized as agent definitions by GitHub Copilot when placed in the `agents/` directory.

---

## SARIF-Related Patterns

SARIF (Static Analysis Results Interchange Format) appears in the IaC Security Agent's MSDO Analyzer Integration section:

1. **Checkov** → `output_format: sarif`, `output_file_path: results.sarif`
2. **Trivy** → `format: 'sarif'`, `output: 'trivy-results.sarif'`
3. **Microsoft Security DevOps (MSDO)** → `microsoft/security-devops-action@v1`

SARIF is used as the CI integration format for automated security scanning, not as an agent output format. No dedicated SARIF parser agent exists in the repository.

---

## Agent Cross-Reference Map

```text
SecurityAgent (holistic)
├── references → SecurityReviewerAgent (code review)
├── references → PipelineSecurityAgent (CI/CD)
├── references → IaCSecurityAgent (infrastructure)
└── references → SupplyChainSecurityAgent (supply chain)

SupplyChainSecurityAgent
├── out-of-scope → SecurityReviewerAgent (app code)
├── out-of-scope → PipelineSecurityAgent (CI/CD YAML)
└── out-of-scope → IaCSecurityAgent (IaC misconfig)

A11y Detector ←→ A11y Resolver (bi-directional handoffs)
```

---

## VS Code and GitHub Platform Integration

### How Agents Are Discovered

1. Repository must be named `.github-private` in the organization
2. Agent files go in the `agents/` directory
3. GitHub Copilot automatically discovers agents via the YAML frontmatter
4. Agents appear in the Copilot Chat `@` mention dropdown across all org repos

### Tool Namespace Mapping

The `tools:` list in frontmatter maps to VS Code Copilot tool namespaces:

| Agent Tool | VS Code Capability |
|------------|-------------------|
| `vscode/*` | VS Code commands, extensions, memory, settings |
| `execute/*` | Terminal execution, notebook cells, task running |
| `read/*` | File reading, error checking, terminal output |
| `edit/*` | File creation, editing, renaming |
| `search/*` | Codebase search, file search, text search, usage finding |
| `web/*` | URL fetching, GitHub repo search |
| `agent/runSubagent` | Launch sub-agents for delegated tasks |
| `todo` | TODO list management |
| `browser/openBrowserPage` | Browser integration |

### Handoff Mechanism

The `handoffs:` frontmatter field creates UI buttons in Copilot Chat allowing agent-to-agent delegation:

```yaml
handoffs:
  - label: "Fix Violations"    # Button text shown to user
    agent: A11y Resolver       # Target agent name
    prompt: "Fix the..."       # Context passed to target
    send: false                # User must confirm before sending
```

---

## Recommended Patterns for Creating New Agents

Based on the analyzed agents, follow these conventions:

### 1. File Structure

```text
agents/{domain}-{function}-agent.md    # or .agent.md
```

### 2. Frontmatter Template

```yaml
---
name: NewAgentName
description: "Concise one-line description of agent purpose"
model: Claude Sonnet 4.5 (copilot)
tools:
  # Include the full standard toolset (see schema above)
handoffs:  # Optional
  - label: "Action Label"
    agent: TargetAgent
    prompt: "Context for handoff"
    send: false
---
```

### 3. Body Template

```markdown
# Agent Display Name

{Expert persona paragraph establishing identity, specialization, and mission.}

## Core Responsibilities

- {Primary duty 1}
- {Primary duty 2}
- ...

## Scope & Non-Goals

**In Scope:**
- {Area 1}

**Out of Scope (handled by other agents):**
- {Area} → {Other Agent Name}

## {Domain-Specific Sections}

### {Category 1}

**Common Issues:**
- {Issue pattern}

**Severity Levels:**
- CRITICAL: {criteria}
- HIGH: {criteria}
- MEDIUM: {criteria}
- LOW: {criteria}

**Example:**
{Code examples with INSECURE and SECURE patterns}

## Output Format

{Exact Markdown template for generated reports}

## Review Process

When {triggering action}:

1. {Step 1}
2. {Step 2}
...

## Severity Classification

| Severity | Criteria | Examples |
|----------|----------|----------|
| CRITICAL | ... | ... |
| HIGH | ... | ... |
| MEDIUM | ... | ... |
| LOW | ... | ... |

## Reference Standards

- [{Standard}]({URL})

## Invocation

To {action} in this repository:

1. {Step 1}
2. {Step 2}
...

Exit with a complete report. Do not wait for user input unless clarification is needed.
```

### 4. Key Design Principles

1. **Autonomous execution** — Agents complete their task and exit without waiting for input
2. **Structured output** — Reports use consistent Markdown templates with severity tables
3. **Cross-agent awareness** — Agents declare what is out of scope and reference the responsible agent
4. **PR-ready output** — Agents produce diffs, fix packs, and backlog items ready for engineering action
5. **Security guardrails** — Critical safety rules (never expose secrets, etc.)
6. **Compliance mapping** — Findings mapped to frameworks (CIS, NIST, OWASP, WCAG)
7. **Severity consistency** — CRITICAL/HIGH/MEDIUM/LOW with clear criteria and examples

---

## References

| Source | URL |
|--------|-----|
| Repository | `https://github.com/devopsabcs-engineering/.github-private` |
| security-agent.md | `agents/security-agent.md` |
| security-reviewer-agent.md | `agents/security-reviewer-agent.md` |
| security-plan-creator.agent.md | `agents/security-plan-creator.agent.md` |
| pipeline-security-agent.md | `agents/pipeline-security-agent.md` |
| iac-security-agent.md | `agents/iac-security-agent.md` |
| supply-chain-security-agent.md | `agents/supply-chain-security-agent.md` |
| a11y-detector.agent.md | `agents/a11y-detector.agent.md` |
| a11y-resolver.agent.md | `agents/a11y-resolver.agent.md` |
| wcag22-rules.instructions.md | `instructions/wcag22-rules.instructions.md` |
| a11y-remediation.instructions.md | `instructions/a11y-remediation.instructions.md` |
| a11y-scan.prompt.md | `prompts/a11y-scan.prompt.md` |
| a11y-fix.prompt.md | `prompts/a11y-fix.prompt.md` |
| GitHub Custom Agents Docs | `https://docs.github.com/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents` |

---

## Discovered Topics (Fully Researched)

- [x] Agent handoff mechanism between A11y Detector ↔ A11y Resolver
- [x] Cross-agent scope delegation pattern (SupplyChain → Pipeline → IaC → Code Review)
- [x] SARIF integration in IaC agent for CI tooling
- [x] Prompt file pattern for reusable agent invocations
- [x] Instructions file `applyTo` glob pattern for automatic context injection
- [x] Weighted accessibility scoring system across POUR principles
- [x] No `copilot-instructions.md` or `AGENTS.md` file found (not needed with `.github-private` setup)

## Clarifying Questions

None — all provided and discovered research topics were fully answered through the repository search.
