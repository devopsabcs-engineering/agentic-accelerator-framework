# Agent Testing Research — Copilot Custom Agent CI/CD Validation

**Date:** 2026-03-17
**Status:** Complete
**Researcher:** Researcher Subagent

---

## Research Topics

1. Understand the full `.agent.md` file format and YAML frontmatter schema
2. Understand the `apm.yml` manifest and its role in agent configuration
3. Research `microsoft/apm-action@v1` capabilities in CI/CD
4. Identify what validations can be performed on `.agent.md` files
5. Research programmatic agent invocation / behavior testing
6. Define a "full coverage testing" strategy for agent files

---

## Key Findings

### 1. Agent File Format (`.agent.md`)

All 15 agent files in this repository follow the same structure:

**YAML Frontmatter Fields (observed across all agents):**

| Field | Required | Present In | Type | Description |
|---|---|---|---|---|
| `name` | Yes | All 15 agents | string | PascalCase agent identifier (e.g., `SecurityAgent`, `A11yDetector`) |
| `description` | Yes | All 15 agents | quoted string | One-line description of agent purpose |
| `model` | No | 4 of 15 | string | LLM model specification (e.g., `Claude Sonnet 4.5 (copilot)`) |
| `tools` | Yes | All 15 agents | list of strings | Tools the agent can use, using `category/toolName` format |
| `handoffs` | No | 7 of 15 | list of objects | Delegation targets with `label`, `agent`, optional `prompt` and `send` |

**Agents by Domain and Fields:**

| Domain | Agents | Has `model` | Has `handoffs` |
|---|---|---|---|
| Security | SecurityAgent, SecurityReviewerAgent, PipelineSecurityAgent, IaCSecurityAgent, SupplyChainSecurityAgent, SecurityPlanCreator | 4/6 | 1/6 (SecurityAgent) |
| Accessibility | A11yDetector, A11yResolver | 0/2 | 2/2 |
| Code Quality | CodeQualityDetector, TestGenerator | 0/2 | 2/2 |
| FinOps | CostAnalysisAgent, FinOpsGovernanceAgent, CostAnomalyDetector, CostOptimizerAgent, DeploymentCostGateAgent | 0/5 | 0/5 |

**Tool Categories Used Across Agents:**

- `vscode/*` — VS Code tools (getProjectSetupInfo, memory, runCommand, askQuestions, etc.)
- `execute/*` — Terminal execution (runInTerminal, getTerminalOutput, awaitTerminal, killTerminal, etc.)
- `read/*` — File reading (readFile, problems, terminalLastCommand, terminalSelection, etc.)
- `edit/*` — File editing (editFiles, createFile, createDirectory)
- `search/*` — Search tools (textSearch, fileSearch, codebase, listDirectory, changes, usages)
- `web/*` — Web access (fetch, githubRepo)
- `browser/*` — Browser (openBrowserPage)
- `agent/*` — Sub-agent delegation (runSubagent)
- `todo` — Task tracking

**Handoff Object Schema:**

```yaml
handoffs:
  - label: "Display label with emoji"
    agent: AgentName          # required
    prompt: "Context prompt"  # optional
    send: false               # optional, boolean
```

**Markdown Body:**

After the YAML frontmatter, each agent has a Markdown body containing:
- Role description paragraph
- Core Responsibilities list
- Detection/Assessment Protocol (numbered steps)
- Domain-specific rules tables (CWE mappings, WCAG criteria, coverage thresholds, cost analysis patterns)
- Output Format specification (typically SARIF v2.1.0 or Markdown)
- Report template with example structure

### 2. `apm.yml` Manifest Structure

The project's `apm.yml` file declares all 15 agents, 3 instruction files, 2 prompts, and 2 skills as dependencies with local paths. It uses a flat `dependencies` map (not the `apm`/`mcp` list structure from the official APM manifest schema).

**Key difference:** This project's `apm.yml` uses a non-standard structure:
```yaml
dependencies:
  security-agent:
    path: agents/security-agent.agent.md
    description: "..."
```

Versus the standard APM schema which uses:
```yaml
dependencies:
  apm:
    - owner/repo
  mcp:
    - registry/server
```

This means the project treats `apm.yml` as an internal manifest/registry rather than a dependency resolver. The `security` section at the bottom configures APM audit behavior.

**Security Configuration in `apm.yml`:**
```yaml
security:
  audit:
    on-install: true
    on-compile: true
    severity-threshold: critical
```

### 3. `microsoft/apm-action@v1` Capabilities

**What it is:** A GitHub Action that installs APM (Agent Package Manager) and deploys agent primitives into CI workflows.

**Current Workflow (`apm-security.yml`):**
- Triggers on PR changes to agent/instruction/prompt/skill files
- Runs `microsoft/apm-action@v1` with `command: audit`
- The `audit` command scans for hidden Unicode characters (prompt injection vectors)

**APM Action Modes:**

| Mode | Purpose | CI/CD Use |
|---|---|---|
| Install (default) | Read `apm.yml`, install dependencies | Dependency resolution |
| `audit` | Scan for hidden Unicode characters | **Security gate** |
| `pack` | Bundle primitives into `.tar.gz` | Artifact creation |
| `bundle` (restore) | Unpack bundle without APM installation | Zero-install deployment |
| `compile` | Generate AGENTS.md from primitives | Context compilation |
| `audit-report: true` | Generate SARIF audit report | Code Scanning integration |

**APM Action Outputs:**
- `success` — Boolean pass/fail
- `primitives-path` — Deployed file location
- `bundle-path` — Pack artifact path
- `audit-report-path` — SARIF report path (for upload to Code Scanning)

**APM CLI Validation Commands:**
- `apm audit` — Scans for hidden Unicode (critical: tag chars, bidi overrides, variation selectors)
- `apm compile --validate` — Validates primitive structure and frontmatter completeness
- `apm compile --dry-run` — Preview compilation without writing
- `apm deps list` / `apm deps tree` — List/visualize dependencies

### 4. Instruction and Prompt File Formats

**Instructions (`.instructions.md`):**
```yaml
---
description: "Human-readable description"
applyTo: "**/*.tsx,**/*.jsx,**/*.ts,**/*.html,**/*.css"  # glob pattern
---
# Markdown body with rules
```

**Prompts (`.prompt.md`):**
```yaml
---
description: "Human-readable description"
agent: AgentName              # which agent handles this prompt
argument-hint: "[url=...]"    # usage hint
---
# Markdown body with input/requirements
```

**Skills (`SKILL.md`):**
```yaml
---
name: skill-name
description: "Human-readable description"
---
# Markdown body with domain knowledge
```

### 5. Validation Taxonomy — What Can Be Tested

#### Layer 1: Structural Validation (Static Analysis — No External Dependencies)

| Test | Description | Tool/Approach |
|---|---|---|
| YAML frontmatter parsing | Verify `---` delimited YAML is parseable | `js-yaml` / `gray-matter` / Python `pyyaml` |
| Required fields presence | `name` and `description` must exist in all `.agent.md` | Custom linter |
| `tools` field type | Must be a list of strings | JSON Schema validation |
| `handoffs` field schema | Each entry must have `label` and `agent` | JSON Schema validation |
| `model` field values | If present, must be a known/valid model string | Allowlist validation |
| `applyTo` glob syntax | In `.instructions.md`, must be valid glob | `minimatch` or `picomatch` validation |
| `agent` reference in prompts | `.prompt.md` `agent` field must name a real agent | Cross-reference check |
| Markdown well-formedness | Body should parse as valid Markdown | `remark` / `markdownlint` |
| File naming convention | Files must match `*.agent.md`, `*.instructions.md`, `*.prompt.md`, `SKILL.md` | Glob + regex |

#### Layer 2: Reference Integrity (Cross-File Validation)

| Test | Description | Approach |
|---|---|---|
| apm.yml → file existence | Every `path` in `apm.yml` dependencies must resolve to an existing file | File existence check |
| Agent handoff targets | `handoffs[].agent` names must match a `name` in another `.agent.md` | Cross-reference map |
| Prompt → agent reference | `agent` field in `.prompt.md` must match an agent's `name` | Cross-reference check |
| Instruction `applyTo` coverage | `applyTo` patterns should match at least one file in the repo | Glob execution |
| Tool name validity | Tools listed must follow `category/name` format | Regex validation |
| Markdown link integrity | Internal links (`[text](path)`) must resolve to existing files | Link checker |
| SARIF output path references | Output paths mentioned in agent bodies should follow conventions | Regex/pattern check |

#### Layer 3: Domain-Specific Rules

| Domain | Validation | Approach |
|---|---|---|
| Security | Agents must reference OWASP Top 10 or CWE categories | Content pattern matching |
| Security | SARIF output sections must specify `automationDetails.id` with `security/` prefix | Content search |
| Accessibility | Agents must reference WCAG 2.2 success criteria | Content pattern matching |
| Accessibility | Findings must map to POUR principles | Content search |
| Code Quality | Coverage threshold references should match `instructions/code-quality.instructions.md` | Value cross-check |
| FinOps | Cost agents must reference Azure Cost Management API patterns | Content search |
| All | SARIF v2.1.0 format compliance in output templates | Schema snippet validation |

#### Layer 4: APM Ecosystem Validation (Requires APM CLI)

| Test | Description | Tool |
|---|---|---|
| `apm compile --validate` | Validate primitives structure and frontmatter | APM CLI |
| `apm audit` | Scan for hidden Unicode/prompt injection | APM CLI |
| `apm audit -f sarif` | Generate SARIF audit report for Code Scanning | APM CLI + upload |
| `apm install --dry-run` | Verify dependency resolution succeeds | APM CLI |
| `apm compile --dry-run` | Verify compilation succeeds without writing | APM CLI |

### 6. Programmatic Agent Behavior Testing

**Current State (March 2026):**

There is **no public API or SDK** to programmatically invoke GitHub Copilot custom agents (`.agent.md` files) outside of VS Code or GitHub Copilot Chat. Key findings:

- **No CLI invocation:** GitHub Copilot does not expose a CLI command to "run" an agent definition against test inputs and capture outputs.
- **No REST API:** There is no public API endpoint to submit a prompt to a custom agent and get structured results.
- **VS Code only:** Custom agents are activated only within VS Code Copilot Chat context when a user types `@AgentName` or the agent is triggered by a prompt file.
- **`apm run` (Experimental):** APM has experimental prompt execution via `apm run`, but this requires a runtime (`copilot`, `codex`, or `llm`) and is designed for interactive workflows, not automated testing.
- **No assertion framework:** There is no built-in way to assert that an agent produces specific outputs, follows its protocol, or generates valid SARIF.

**Implication:** Behavior testing of agents is limited to:
1. **Manual testing** — Invoke agents in VS Code and manually verify outputs
2. **Output validation** — If agents produce files (SARIF, reports), validate those files post-hoc
3. **Prompt regression testing** — Use `apm preview` to verify prompts render correctly with parameters, then manually verify with LLM
4. **Integration testing via GitHub Agentic Workflows** — GitHub's experimental agentic workflow feature can trigger Copilot as an actor in GitHub Actions, but this is not designed for test assertions

### 7. Existing CI/CD Workflows in the Repository

| Workflow | File | What It Tests |
|---|---|---|
| APM Security Scan | `apm-security.yml` | `apm audit` on agent/instruction/prompt/skill file changes |
| Security Scan | `security-scan.yml` | SCA (Dependency Review), SAST (CodeQL), IaC (MSDO), Container (Trivy) |
| Accessibility Scan | `accessibility-scan.yml` | Three-engine a11y scanner with SARIF upload |
| Code Quality | `code-quality.yml` | Lint, type check, test coverage with SARIF conversion |
| FinOps Cost Gate | `finops-cost-gate.yml` | Infracost estimation with budget gating |

**Gap:** None of these workflows validate the agent file structure, cross-references, or domain-specific content.

---

## Recommended Testing Strategy

### Tier 1: Fast Static Linting (Every PR — < 30 seconds)

**Implementation:** Custom Node.js or Python script in CI

```
Tests:
├── YAML frontmatter parsing for all .agent.md files
├── Required fields: name, description, tools
├── Tools format validation (category/name pattern)
├── Handoff schema validation (label + agent required)
├── Instruction file applyTo glob syntax
├── Prompt file agent field present
├── Skill file name + description present
└── apm.yml path existence verification
```

**Technology options:**
- **Node.js:** `gray-matter` (frontmatter parsing) + `ajv` (JSON Schema) + `minimatch` (glob validation) + `markdownlint`
- **Python:** `python-frontmatter` + `jsonschema` + `pathlib` (glob) + `pyyaml`

### Tier 2: Cross-Reference Integrity (Every PR — < 60 seconds)

**Implementation:** Custom script building a dependency graph

```
Tests:
├── Agent handoff targets resolve to existing agents
├── Prompt agent references resolve to existing agents
├── apm.yml paths all resolve to existing files
├── Markdown internal links resolve
├── Instruction applyTo patterns match at least one repo file
└── No orphaned agents (every agent referenced by apm.yml)
```

### Tier 3: APM Ecosystem Validation (Every PR — < 2 minutes)

**Implementation:** APM CLI commands in GitHub Actions

```yaml
- uses: microsoft/apm-action@v1
  with:
    command: audit
    audit-report: true

- name: Validate primitives
  run: apm compile --validate

- name: Dry-run compilation
  run: apm compile --dry-run
```

### Tier 4: Domain-Specific Content Validation (Weekly / Release)

**Implementation:** Custom content analysis script

```
Tests:
├── Security agents reference OWASP/CWE categories
├── A11y agents reference WCAG 2.2 success criteria
├── All agents specify SARIF output format
├── Report templates follow copilot-instructions.md structure
├── Severity mappings consistent with SARIF levels
└── Domain knowledge in skills matches agent references
```

### Tier 5: Behavioral Smoke Testing (Manual / Milestone)

**Approach:** Manual invocation checklist, not automatable today

```
For each agent:
├── Invoke in VS Code with sample repository
├── Verify agent follows its documented protocol
├── Verify output matches expected format
├── Verify handoffs work correctly
└── Verify SARIF output validates against schema
```

---

## Discovered Research Topics

### APM Manifest Schema Mismatch

The project's `apm.yml` uses a flat `dependencies` map with `path` and `description` fields, which differs from the official APM manifest schema (which uses `dependencies.apm` as a list of git references). This may mean:
- The project uses a local/internal convention
- `apm compile --validate` may report issues
- Custom validation logic may be needed

### `apm compile --validate` Capability

APM's `apm compile --validate` validates primitive structure and frontmatter completeness but does **not** validate:
- Cross-references between agents
- Domain-specific content requirements
- SARIF output format compliance in agent body text
- Markdown link integrity

### Hidden Unicode Scanning Scope

APM's `apm audit` is specifically designed for hidden Unicode character detection (prompt injection prevention). It does **not** perform:
- YAML schema validation
- Content quality analysis
- Reference integrity checking
- Domain rule enforcement

---

## References and Evidence

| Source | URL / Path | Key Information |
|---|---|---|
| APM CLI Reference | https://microsoft.github.io/apm/reference/cli-commands/ | `audit`, `compile --validate`, `pack` commands |
| APM Security Model | https://microsoft.github.io/apm/enterprise/security/ | Hidden Unicode scanning, pre-deployment gates |
| APM Manifest Schema | https://microsoft.github.io/apm/reference/manifest-schema/ | YAML schema spec (name, version required) |
| APM Primitive Types | https://microsoft.github.io/apm/reference/primitive-types/ | Discovery, source tracking, conflict detection |
| APM Action README | https://github.com/microsoft/apm-action | GitHub Action inputs/outputs, modes |
| Local `apm.yml` | `apm.yml` | 15 agents, 3 instructions, 2 prompts, 2 skills |
| Local `apm-security.yml` | `.github/workflows/apm-security.yml` | Existing APM audit workflow |
| All 15 agent files | `agents/*.agent.md` | Frontmatter schema, tool lists, handoff patterns |
| Instruction files | `instructions/*.instructions.md` | applyTo patterns, WCAG/quality rules |
| Prompt files | `prompts/*.prompt.md` | agent field, argument-hint |
| Skill files | `skills/*/SKILL.md` | name, description, domain knowledge |

---

## Clarifying Questions

1. **Is the `apm.yml` format intentionally non-standard?** The project uses `dependencies.<name>.path` instead of the official `dependencies.apm` list format. Is this an internal convention, or should it be migrated?

2. **Should `model` be required?** Only 4 of 15 agents specify a `model`. Should this be standardized, or is omission intentional (letting the runtime choose)?

3. **What is the acceptable tool allowlist?** Should we validate `tools` values against a known set of Copilot tool categories, or just validate the `category/name` format?

4. **Should domain content rules be strict or advisory?** For example, should a security agent that doesn't mention OWASP fail CI, or just produce a warning?

5. **Is behavioral testing via `apm run` acceptable?** APM's experimental `apm run` + `apm runtime setup copilot` could potentially enable automated prompt execution, but it requires Copilot runtime access in CI — is this feasible in the project's CI environment?

---

## Next Research (Not Completed)

- [ ] Investigate `apm compile --validate` output format (does it produce machine-parseable results?)
- [ ] Research GitHub Agentic Workflows (experimental) for automated agent invocation in CI
- [ ] Explore `gray-matter` npm package for frontmatter extraction and JSON Schema validation in Node.js
- [ ] Research `python-frontmatter` package for Python-based validation scripts
- [ ] Investigate SARIF schema validation tools (e.g., `sarif-tools`, Microsoft SARIF SDK)
- [ ] Research GitHub Rulesets integration with APM for branch protection on agent file changes
- [ ] Prototype a minimal validation script for Tier 1 + Tier 2 testing
