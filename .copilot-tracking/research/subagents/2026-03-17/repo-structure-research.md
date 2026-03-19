# Repository Structure Research — agentic-devsecops-framework

## Status: Complete

## Research Topics

1. GitHub workflow files — triggers, jobs, outputs
2. Agent files — name, description, model, tools, instructions
3. apm.yml — full contents and structure
4. mcp.json — full contents
5. sample-app — test infrastructure, dependencies, intentional issues
6. Instructions, prompts, skills files
7. Copilot instructions and CODEOWNERS
8. Existing test scripts and CI configurations
9. Gaps and recommendations

---

## 1. GitHub Workflow Files (`.github/workflows/`)

Five active workflows plus a `.gitkeep` placeholder.

### 1.1 `security-scan.yml`

- **Trigger:** `push` to `main`, `pull_request` to `main`
- **Permissions:** `security-events: write`, `contents: read`, `pull-requests: read`
- **Jobs (5):**
  1. **`sca`** — SCA / Dependency Review + SBOM. PR-only. Uses `actions/dependency-review-action@v4` (fail-on-severity: high) and `anchore/sbom-action@v0` (SPDX-JSON). Uploads SBOM as artifact.
  2. **`sast`** — CodeQL Analysis. Matrix: `[javascript-typescript]`. Init → Autobuild → Analyze. SARIF category: `codeql/<lang>`.
  3. **`iac`** — Microsoft Security DevOps (MSDO). Tools: checkov, trivy, terrascan. SARIF category: `iac-scanning/`.
  4. **`container`** — Trivy Image Scan. Conditional on `Dockerfile` existing. Builds image → trivy scan (CRITICAL, HIGH). SARIF category: `container-scanning/`.
  5. **`dast`** — ZAP Baseline Scan. Conditional on `vars.DAST_TARGET_URL` being set. Converts ZAP JSON to SARIF. Category: `dast/`.
- **SARIF:** All jobs upload SARIF via `github/codeql-action/upload-sarif@v4`.

### 1.2 `accessibility-scan.yml`

- **Trigger:** `pull_request` to `main`, weekly schedule (Monday 06:00 UTC)
- **Permissions:** `security-events: write`, `contents: read`
- **Env:** `A11Y_THRESHOLD: 80`, `A11Y_FAIL_THRESHOLD: 70`
- **Job:** `a11y-scan` — Three-Engine Scanner with matrix over scan URLs. Installs axe-core CLI + accessibility-checker + Playwright Chromium. Runs `npx a11y-scan`, uploads SARIF (`accessibility-scan/<label>`), applies threshold gate (fails if critical/serious > 0 or score < 70).

### 1.3 `code-quality.yml`

- **Trigger:** `pull_request` to `main`
- **Permissions:** `security-events: write`, `contents: read`
- **Env:** `COVERAGE_THRESHOLD: 80`
- **Jobs (3):**
  1. **`lint`** — `npm run lint`
  2. **`type-check`** — `npx tsc --noEmit`
  3. **`test`** — `npm run test:ci` (Jest with coverage). Coverage threshold check reads `coverage/coverage-summary.json`, fails if below 80%. Converts coverage to SARIF (`code-quality/coverage/`) via inline Node.js script. Rules: `coverage-threshold-violation`, `uncovered-function`.
- **Working Directory:** Runs at repo root (not `sample-app/` — this is a gap; see Gaps section).

### 1.4 `finops-cost-gate.yml`

- **Trigger:** `pull_request` to `main` on paths `**/*.tf`, `**/*.bicep`, `**/*.json`
- **Permissions:** `contents: read`, `pull-requests: write`, `security-events: write`
- **Env:** `MONTHLY_BUDGET` (from vars or default 500), `INFRACOST_API_KEY` (secret)
- **Job:** `cost-estimate` — Conditional on `.tf` or `.bicep` files existing. Steps: Setup Infracost → Baseline from PR base → Diff → PR comment → Convert to SARIF → Upload (`finops-finding/`). Budget gate fails if cost exceeds threshold.

### 1.5 `apm-security.yml`

- **Trigger:** `pull_request` on paths: `apm.yml`, `mcp.json`, `agents/**`, `instructions/**`, `prompts/**`, `skills/**`, `**/*.agent.md`, `**/*.instructions.md`, `**/*.prompt.md`, `**/AGENTS.md`, `**/SKILL.md`, `.github/copilot-instructions.md`
- **Permissions:** `contents: read`, `security-events: write`
- **Job:** `audit` — Runs `microsoft/apm-action@v1` with command `audit`. Scans agent configuration for prompt injection, excessive tool permissions, and unsafe patterns.

---

## 2. Agent Files (`agents/`)

15 agent definition files, all using YAML frontmatter + Markdown body format.

### 2.1 Security Domain (6 agents)

| Agent | Name | Model | Handoffs | Focus |
|---|---|---|---|---|
| `security-agent.agent.md` | SecurityAgent | Claude Sonnet 4.5 (copilot) | SecurityReviewerAgent, PipelineSecurityAgent, IaCSecurityAgent, SupplyChainSecurityAgent | Orchestrator — holistic security assessment, delegates to 4 sub-agents |
| `security-reviewer-agent.agent.md` | SecurityReviewerAgent | Claude Sonnet 4.5 (copilot) | — | App code OWASP Top 10 review, CWE mapping |
| `security-plan-creator.agent.md` | SecurityPlanCreator | Claude Sonnet 4.5 (copilot) | — | IaC blueprint → security plan (CIS Azure, NIST 800-53) |
| `pipeline-security-agent.agent.md` | PipelineSecurityAgent | Claude Sonnet 4.5 (copilot) | — | CI/CD YAML hardening (GitHub Actions + Azure Pipelines) |
| `iac-security-agent.agent.md` | IaCSecurityAgent | Claude Sonnet 4.5 (copilot) | — | Terraform/Bicep/ARM/K8s/Helm misconfigurations |
| `supply-chain-security-agent.agent.md` | SupplyChainSecurityAgent | Claude Sonnet 4.5 (copilot) | — | Secrets detection, SCA, SBOM, license, repo governance |

### 2.2 Accessibility Domain (2 agents)

| Agent | Name | Model | Handoffs | Focus |
|---|---|---|---|---|
| `a11y-detector.agent.md` | A11yDetector | (not specified — implicit default) | A11yResolver | WCAG 2.2 AA detection — static + runtime 3-engine |
| `a11y-resolver.agent.md` | A11yResolver | (not specified — implicit default) | A11yDetector (re-scan) | WCAG remediation with fix lookup table |

### 2.3 Code Quality Domain (2 agents)

| Agent | Name | Model | Handoffs | Focus |
|---|---|---|---|---|
| `code-quality-detector.agent.md` | CodeQualityDetector | (not specified — implicit default) | TestGenerator | Coverage analysis, complexity, lint, SARIF output |
| `test-generator.agent.md` | TestGenerator | (not specified — implicit default) | CodeQualityDetector (verify) | Auto-generate tests for uncovered code paths |

### 2.4 FinOps Domain (5 agents)

| Agent | Name | Model | Handoffs | Focus |
|---|---|---|---|---|
| `cost-analysis-agent.agent.md` | CostAnalysisAgent | (not specified) | — | Azure Cost Management API queries, reports |
| `cost-anomaly-detector.agent.md` | CostAnomalyDetector | (not specified) | — | WaveNet anomaly detection investigation |
| `cost-optimizer-agent.agent.md` | CostOptimizerAgent | (not specified) | — | Azure Advisor cost recommendations |
| `deployment-cost-gate-agent.agent.md` | DeploymentCostGateAgent | (not specified) | — | IaC PR cost estimation vs budget |
| `finops-governance-agent.agent.md` | FinOpsGovernanceAgent | (not specified) | — | Tag compliance (7 required tags) |

### Agent Tool Pattern

All agents share common tool categories: `read/*`, `search/*`, `execute/*`, `edit/*`. Security agents additionally have `web/*`, `browser/*`, and `vscode/*` tools. The orchestrator `SecurityAgent` has the broadest tool set including `agent/runSubagent`.

---

## 3. `apm.yml` — Agent Package Manager Manifest

- **Name:** `agentic-devsecops-framework`
- **Version:** `1.0.0`
- **Author:** `devopsabcs-engineering`
- **Dependencies:** 15 agents + 3 instructions + 2 prompts + 2 skills = **22 total entries**
- **Security block:**
  ```yaml
  security:
    audit:
      on-install: true
      on-compile: true
  ```
  APM audit runs on install and compile events.

---

## 4. `mcp.json` — MCP Server Configuration

Single server configured:

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

Uses environment variable interpolation for Azure DevOps credentials.

---

## 5. Sample App (`sample-app/`)

### 5.1 Stack

- **Framework:** Next.js 14.2 with App Router
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS 3.4
- **Database:** Prisma Client 5.10 (ORM, not connected)
- **Testing:** Jest 29.7, @testing-library/react 14.2, jest-junit 16.0, ts-jest 29.1, jest-environment-jsdom 29.7

### 5.2 Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | Development server |
| `build` | `next build` | Production build |
| `lint` | `next lint` | ESLint |
| `test` | `jest --coverage` | Local test with coverage |
| `test:ci` | `jest --coverage --ci --reporters=default --reporters=jest-junit` | CI test with JUnit + coverage |

### 5.3 File Inventory

#### Source Files

| File | Purpose | Intentional Issues |
|---|---|---|
| `src/app/layout.tsx` | Root layout | A11Y: Missing `lang` attribute on `<html>` |
| `src/app/page.tsx` | Home page | A11Y: Low contrast (#999999), missing form label, small touch targets |
| `src/app/products/page.tsx` | Products listing | A11Y: `<img>` without `alt`, XSS in sample data (`<script>alert('xss')</script>`) |
| `src/app/products/[id]/page.tsx` | Product detail | VULN: SQL injection via `getProductById(params.id)`, XSS via `dangerouslySetInnerHTML` |
| `src/components/Header.tsx` | Navigation header | A11Y: Broken heading hierarchy (h1→h3 skipping h2), nav without `aria-label` |
| `src/components/ProductCard.tsx` | Product card | VULN: XSS via `dangerouslySetInnerHTML` with user-supplied description |
| `src/lib/utils.ts` | Utility functions | QUALITY: High cyclomatic complexity, `any` types, duplicate code |
| `src/lib/auth.ts` | Authentication | VULN: Hardcoded JWT secret, hardcoded API key, MD5 password hashing, `Math.random()` tokens, no rate limiting |
| `src/lib/db.ts` | Database queries | VULN: Hardcoded connection string with plaintext password, SQL injection, SSL disabled |
| `src/app/globals.css` | Global styles | Tailwind imports |

#### Infrastructure Files

| File | Purpose | Intentional Issues |
|---|---|---|
| `infra/main.bicep` | Azure deployment | VULN: Plaintext SQL password param, TLS 1.0, no HTTPS, public blob access. FINOPS: P1v3 x3 ($420/mo), GRS storage, GP_Gen5_8 SQL ($800/mo), no tags |
| `infra/variables.bicep` | Parameter defaults | FINOPS: All defaults are oversized (estimated $1,270/mo vs $30/mo right-sized) |

#### Test Files

| File | Purpose | Coverage |
|---|---|---|
| `__tests__/placeholder.test.ts` | Single test file | Tests only `add()` from `utils.ts`. 3 tests total. ~5% coverage. Explicitly documents that formatPrice, formatDiscount, categorizeProduct, fetchExternalData, fetchProductData, processOrder, db.ts, auth.ts, and all components are untested. |

### 5.4 Intentional Issue Summary

The sample app is designed as a testing target with intentional issues across every domain:

| Domain | Count | Issue Types |
|---|---|---|
| Security | 12+ | Hardcoded secrets, SQL injection, XSS, MD5 hashing, weak tokens, no HTTPS, TLS 1.0, public access |
| Accessibility | 8+ | Missing `lang`, low contrast, missing `alt`, missing labels, heading hierarchy, small targets |
| Code Quality | 5+ | High cyclomatic complexity, `any` types, duplicate code, ~5% coverage (target 80%) |
| FinOps | 6+ | Oversized SKUs, missing tags, no budget enforcement, GRS for non-critical data |

---

## 6. Instruction Files (`instructions/`)

### Repo-level (`instructions/`)

| File | `applyTo` | Content |
|---|---|---|
| `wcag22-rules.instructions.md` | `**/*.tsx,**/*.jsx,**/*.ts,**/*.html,**/*.css` | WCAG 2.2 AA rules organized by POUR. Covers: non-text content, info/relationships, contrast, resize, reflow, keyboard access, focus, headings, target size. Applied automatically when editing web files. |
| `a11y-remediation.instructions.md` | `**/*.tsx,**/*.jsx,**/*.ts,**/*.html,**/*.css` | Fix patterns for: missing alt, missing labels, low contrast, broken heading hierarchy, missing lang, missing focus indicators, small targets. Includes React/Next.js specific patterns. |
| `code-quality.instructions.md` | `**/*.ts,**/*.js,**/*.py,**/*.cs,**/*.java,**/*.go` | Coverage thresholds (80% line/branch/function, 90% new code), testing patterns (unit/integration/error path), complexity limits (cyclomatic ≤10, nesting ≤4, function ≤50 lines), lint/style rules. |

### `.github/instructions/`

| File | Content |
|---|---|
| `ado-workflow.instructions.md` | ADO organization (`MngEnvMCAP675646`), project (`Agentic DevSecOps Framework`), hierarchy (Epic→Feature→Story/Bug), branching strategy (`feature/{id}-description`), commit message format (`AB#{id}`), PR workflow, post-merge cleanup. All items must have `Agentic AI` tag. |

---

## 7. Prompt Files (`prompts/`)

| File | Agent | Inputs | Purpose |
|---|---|---|---|
| `a11y-scan.prompt.md` | A11yDetector | `${input:url}`, `${input:component}` | Quick WCAG 2.2 AA scan of URL or component. 3-engine architecture, POUR report, SARIF output. |
| `a11y-fix.prompt.md` | A11yResolver | `${input:component}`, `${input:report}` | Fix accessibility issues from scan report. Priority fixup, remediation patterns, PR-ready diffs, re-scan offer. |

---

## 8. Skill Files (`skills/`)

### Repo-level skills

| Skill | File | Content |
|---|---|---|
| `a11y-scan` | `skills/a11y-scan/SKILL.md` | Scanner architecture (axe-core + IBM Equal Access + 5 custom Playwright checks). SARIF format spec, severity mapping, WCAG 2.2 coverage matrix, compliance thresholds, dedup logic. |
| `security-scan` | `skills/security-scan/SKILL.md` | OWASP Top 10 + LLM Top 10 mappings with CWE IDs. ASP.NET Core security patterns (auth, validation, secrets, headers). IaC security checklists (Terraform, Bicep). CI/CD security patterns. SARIF format spec. |

### `.github/skills/` (Installed via extensions)

9 extension-provided skills: `docx`, `pdf`, `power-bi-*` (5 variants), `pptx`, `xlsx`. These are general-purpose Office and Power BI skills, not directly relevant to DevSecOps CI/CD.

---

## 9. `.github/copilot-instructions.md`

Global Copilot instructions for all agents:

- **SARIF v2.1.0 mandatory** — `partialFingerprints`, `automationDetails.id`, `tool.driver.name/rules`, severity mapping
- **Severity classification** — CRITICAL/HIGH → `error`, MEDIUM → `warning`, LOW → `note`
- **Compliance mapping** — CWE, OWASP Top 10, OWASP LLM Top 10, WCAG 2.2
- **Report structure** — Summary → Findings Table → Remediation Guidance → References
- **PR-ready output** — Unified diffs, fix packs, `Fixes AB#` references

---

## 10. `.github/CODEOWNERS`

All agent-related paths require `@devopsabcs-engineering/security-team` review:

- `.github/copilot-instructions.md`
- `agents/`
- `instructions/`
- `prompts/`
- `skills/`
- `**/AGENTS.md`, `**/SKILL.md`
- `apm.yml`, `mcp.json`
- `.github/workflows/`

---

## 11. Azure DevOps Sample Pipelines (`samples/azure-devops/`)

Three reference pipelines mirroring the GitHub Actions workflows:

| File | Equivalent GH Workflow | Stages |
|---|---|---|
| `security-pipeline.yml` | `security-scan.yml` | SAST (CodeQL via GHAzDO), SCA (AdvancedSecurity-Dependency-Scanning), IaC (MSDO), Container (Trivy), DAST (ZAP), Secret scanning (notes only) |
| `accessibility-pipeline.yml` | `accessibility-scan.yml` | Single stage: Install → Scan → Publish SARIF → Threshold gate |
| `quality-pipeline.yml` | `code-quality.yml` | Lint, TypeCheck, TestCoverage stages. JUnit + Cobertura + SARIF publishing |

All use `AdvancedSecurity-Publish@1` for SARIF publishing (GHAzDO). Work item: `AB#2075`.

### `samples/github-actions/`

Contains only `.gitkeep` — empty placeholder.

---

## 12. Documentation (`docs/`)

9 documentation files + images directory:

| File | Topic |
|---|---|
| `architecture.md` | Framework architecture overview |
| `agent-extensibility.md` | How to extend and create custom agents |
| `agent-patterns.md` | Agent design patterns |
| `azure-devops-pipelines.md` | ADO pipeline integration guide |
| `centralized-governance.md` | Governance model for agent configurations |
| `implementation-roadmap.md` | Phased implementation plan |
| `platform-comparison.md` | GitHub vs Azure DevOps feature comparison |
| `prompt-file-security.md` | Security considerations for prompt files |
| `sarif-integration.md` | SARIF output format and integration guide |

---

## 13. Identified Gaps and Issues

### CI/CD Gaps

1. **`code-quality.yml` working directory:** Runs `npm ci` and `npm run lint` at repo root, but `package.json` is in `sample-app/`. The workflow needs `defaults.run.working-directory: sample-app` or explicit `cd sample-app` to function correctly.

2. **No Jest config file:** The sample-app has no `jest.config.js` or `jest.config.ts`. Jest configuration is likely expected in `package.json` but none is present. Tests may not run correctly without module resolution config (tsconfig paths, `@/` alias resolution, jsdom environment).

3. **No `package-lock.json`:** No lockfile is committed. `npm ci` in workflows will fail without a lockfile. This needs to be generated and committed, or workflows should use `npm install`.

4. **No test for React components:** Only `utils.ts` `add()` function is tested. Zero coverage for 2 components, 4 pages, and 2 service modules (auth, db).

5. **No ESLint config:** No `.eslintrc.*` or `eslint.config.*` file. `npm run lint` (which runs `next lint`) will work with Next.js defaults, but explicit rules are missing.

6. **No `tsconfig.json` path aliases verified:** The `@/` import alias used in all source files requires path mapping in `tsconfig.json`. The file exists but was not read in detail.

7. **`samples/github-actions/` is empty:** Only contains `.gitkeep`. If sample GitHub Actions workflows are planned, they have not been created yet.

### Agent Gaps

8. **Model not specified on 9 agents:** Only the 6 security agents specify `model: Claude Sonnet 4.5 (copilot)`. The accessibility, code quality, and FinOps agents do not specify a model in their frontmatter.

9. **No FinOps prompt templates:** The `prompts/` directory has accessibility prompts but no FinOps or security prompt templates.

10. **No FinOps skill file:** The `skills/` directory has `a11y-scan` and `security-scan` but no `finops-scan` or cost analysis skill.

11. **No code-quality skill file:** No skill for code quality domain knowledge.

### Testing Gaps

12. **Intentional ~5% coverage:** By design, the sample app has deliberate low coverage to test the CodeQualityDetector and TestGenerator agents. This is correct for demo purposes but means CI will fail on coverage gates.

13. **No integration or E2E tests:** Only unit tests exist. No Playwright, Cypress, or other E2E test setup.

14. **No test configuration for component tests:** `@testing-library/react` and `jest-environment-jsdom` are in devDependencies but no component tests exist.

### Infrastructure Gaps

15. **No Dockerfile:** The `security-scan.yml` container job will be skipped since no Dockerfile exists.

16. **No `.env.example`:** Several intentional vulnerabilities use hardcoded secrets. A `.env.example` file documenting required environment variables would be useful for contributors.

---

## 14. File Inventory Summary

| Category | Count | Location |
|---|---|---|
| GitHub workflows | 5 | `.github/workflows/` |
| Agent definitions | 15 | `agents/` |
| Instruction files | 4 | `instructions/` + `.github/instructions/` |
| Prompt templates | 2 | `prompts/` |
| Skill packages | 2 | `skills/` |
| Sample-app source files | 10 | `sample-app/src/` |
| Sample-app test files | 1 | `sample-app/__tests__/` |
| Sample-app infra files | 2 | `sample-app/infra/` |
| ADO sample pipelines | 3 | `samples/azure-devops/` |
| Documentation files | 9 | `docs/` |
| Config files | 5 | `apm.yml`, `mcp.json`, `CODEOWNERS`, `copilot-instructions.md`, `package.json` |
| **Total tracked files** | **~58** | |

---

## 15. Discovered Research Topics (Completed)

- [x] All workflow triggers, jobs, SARIF categories documented
- [x] All 15 agent files read — name, description, model, tools, handoffs captured
- [x] All instruction, prompt, and skill files read and summarized
- [x] Sample-app intentional issues catalogued by domain
- [x] ADO sample pipelines compared with GitHub Actions equivalents
- [x] CODEOWNERS governance structure documented
- [x] APM manifest and MCP config fully documented
- [x] CI/CD gaps and testing infrastructure gaps identified

## 16. Clarifying Questions

None — all research topics were answerable through file system analysis.
