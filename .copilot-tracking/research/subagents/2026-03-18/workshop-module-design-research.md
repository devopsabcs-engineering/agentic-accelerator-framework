# Workshop Module Design Research

## Research Topics and Questions

1. What is the optimal repository strategy for a workshop (1 repo, 2 repos, or fork-based)?
2. What should the lab module plan look like (8–12 labs, zero-to-hero progression)?
3. Where should placeholder screenshots go, naming conventions, and what to capture per lab?
4. What is the end-to-end student experience flow?
5. What prerequisite tools and extensions are required?
6. How do students invoke each agent domain in VS Code?
7. How do students configure and view SARIF in GitHub Security tab?
8. What is the framework's full agent, skill, instruction, and prompt inventory?

---

## Key Discoveries

### Framework Inventory (from codebase analysis)

| Category | Count | Items |
|---|---|---|
| Agents | 15 | SecurityAgent, SecurityReviewerAgent, SecurityPlanCreator, PipelineSecurityAgent, IaCSecurityAgent, SupplyChainSecurityAgent, A11yDetector, A11yResolver, CodeQualityDetector, TestGenerator, CostAnalysisAgent, FinOpsGovernanceAgent, CostAnomalyDetector, CostOptimizerAgent, DeploymentCostGateAgent |
| Skills | 2 | `security-scan/SKILL.md`, `a11y-scan/SKILL.md` |
| Instructions | 3 | `a11y-remediation.instructions.md`, `code-quality.instructions.md`, `wcag22-rules.instructions.md` |
| Prompts | 2 | `a11y-scan.prompt.md`, `a11y-fix.prompt.md` |
| GitHub Actions Workflows | 7 | `security-scan.yml`, `accessibility-scan.yml`, `code-quality.yml`, `finops-cost-gate.yml`, `apm-security.yml`, `ci-full-test.yml`, `deploy-to-github-private.yml` |
| ADO Pipeline Samples | 3 | `security-pipeline.yml`, `accessibility-pipeline.yml`, `quality-pipeline.yml` |
| Docs | 9 | architecture, agent-patterns, agent-extensibility, sarif-integration, platform-comparison, azure-devops-pipelines, centralized-governance, prompt-file-security, implementation-roadmap |

### Sample App Intentional Issues (from `sample-app/README.md`)

| Domain | Count | Key Files |
|---|---|---|
| Security | 18+ | `src/lib/auth.ts` (7 vulns), `src/lib/db.ts` (4 vulns), `src/app/products/[id]/page.tsx` (2), `src/components/ProductCard.tsx` (1), `infra/main.bicep` (5 IaC) |
| Accessibility | 8+ | `src/app/layout.tsx` (1), `src/app/page.tsx` (3), `src/app/products/page.tsx` (1), `src/app/products/[id]/page.tsx` (1), `src/components/Header.tsx` (1) |
| Code Quality | 5+ | `src/lib/utils.ts` (4 issues), `__tests__/placeholder.test.ts` (1 — ~5% coverage) |
| FinOps / IaC | 11+ | `infra/main.bicep` (9 issues), `infra/variables.bicep` (2 issues) |

### Agent Invocation Patterns (from agent files)

- Invoke via `@agent-name` in VS Code Copilot Chat (e.g., `@security-reviewer-agent scan src/lib/auth.ts`)
- Invoke via prompt files (e.g., `/a11y-scan url=http://localhost:3000`)
- Handoff pattern: Detector → Resolver (A11yDetector → A11yResolver, CodeQualityDetector → TestGenerator)
- All agents produce SARIF v2.1.0 output
- Skills loaded on-demand by agents for domain knowledge

### SARIF Category Registry

| Category Prefix | Scan Type |
|---|---|
| `security/` | Application and infrastructure security |
| `accessibility-scan/` | WCAG 2.2 Level AA |
| `code-quality/coverage/` | Code coverage and quality |
| `finops-finding/v1` | Azure cost findings |

### GitHub Actions Workflow Triggers

| Workflow | Trigger | Uploads SARIF |
|---|---|---|
| `security-scan.yml` | PR and push to `main` | Yes — CodeQL, IaC, DAST |
| `accessibility-scan.yml` | PR and weekly cron | Yes |
| `code-quality.yml` | PR | Yes (coverage-to-SARIF) |
| `finops-cost-gate.yml` | PR (IaC changes) | Yes |
| `apm-security.yml` | PR (agent config changes) | Yes |
| `ci-full-test.yml` | Push and PR to `main` | No (validation only) |

### Sample App Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database client**: Prisma (declared, simulated)
- **Testing**: Jest + Testing Library
- **IaC**: Azure Bicep (`infra/main.bicep`, `infra/variables.bicep`)
- **Package manager**: npm
- **Node.js**: v20+ (v22 in CI)

---

## Repository Strategy Analysis

### Option A: Single Workshop Repo (Sample App as Subfolder)

**Layout:**

```text
agentic-devsecops-workshop/
  README.md               ← Workshop overview
  docs/
    lab-01-setup.md
    lab-02-explore.md
    ...
  assets/
    screenshots/
  sample-app/             ← Copy of the sample app (with intentional issues)
  agents/                 ← Copy of agent definitions
  instructions/
  prompts/
  skills/
  .github/
    workflows/            ← Workshop-specific pipelines
```

**Pros:**

- Single clone, single repo — simplest student experience
- All workshop content and sample code in one place
- Students can enable GitHub Actions immediately
- No cross-repo coordination needed
- GitHub Security tab shows ALL findings for the single repo

**Cons:**

- Workshop docs + sample app co-mingled
- Students cannot easily fork JUST the sample app for their own projects later
- Larger repo than needed if students only want the app

### Option B: Two Repos (Workshop + Template)

**Layout:**

```text
Repo 1: agentic-devsecops-workshop/
  README.md
  docs/
    lab-01-setup.md
    ...
  assets/
    screenshots/

Repo 2: agentic-devsecops-sample-app/   ← Template repo
  sample-app code + agents + instructions + prompts + skills + workflows
```

**Pros:**

- Clean separation of concerns
- Template repo can be reused independently
- Students get a standalone app repo with proper GitHub Security tab
- Workshop docs don't pollute the student's working repo

**Cons:**

- Two repos to manage and keep in sync
- Students must clone/fork two repos
- Cross-repo references add complexity to lab instructions
- Template repo diverges from framework repo over time

### Option C: Workshop Repo + Fork Main Framework Repo

**Pros:**

- Students work with the real framework repo
- Pull upstream changes easily

**Cons:**

- Framework repo is designed for org-wide deployment, not workshop learning
- Fork includes all docs, scripts, validation tooling — overwhelming for students
- Students cannot push to the original, and fork PRs go to the wrong place
- GitHub Actions may not run on forks without configuration
- Most complex student experience

### Recommendation: Option A (Single Workshop Repo)

**Rationale:**

1. **Simplest student experience**: One `git clone`, one repo, one GitHub Security tab. Workshop content and exercise code live together.
2. **Self-contained**: Students have everything they need without cross-repo coordination.
3. **GitHub Security tab works immediately**: SARIF uploads from workflows appear in the same repo where students view results.
4. **Template-ready**: The repo itself can be marked as a GitHub Template repo, so students click "Use this template" and get their own copy with full Actions support.
5. **Agent configs work at repo level**: Agents placed in `.github/agents/` or root `agents/` are picked up by VS Code and GitHub.com for that repo.

**Mitigations for Cons:**

- Use a clean folder structure separating `docs/` (workshop labs) from `sample-app/`, `agents/`, etc.
- Include a `.gitignore` that keeps workshop docs out of the development flow
- Add a `CONTRIBUTING.md` explaining the repo is for workshop use
- Add branch protection rules in the template instructions

---

## Module / Lab Plan

### Target Audience

- Developers, DevOps engineers, and security champions
- Familiar with VS Code, Git, and GitHub basics
- Some exposure to web development (HTML, CSS, JavaScript/TypeScript)
- No prior experience with GitHub Copilot custom agents required

### Total Workshop Duration

- **Core labs (1–8)**: ~4 hours 30 minutes (half-day workshop)
- **All labs (1–10)**: ~6 hours 30 minutes (full-day workshop)
- **With optional advanced labs (1–12)**: ~8 hours 30 minutes (extended workshop)

---

### Lab 01: Prerequisites and Environment Setup

| Attribute | Detail |
|---|---|
| **Title** | Prerequisites and Environment Setup |
| **Time** | 30 minutes |
| **Difficulty** | Beginner |
| **Prerequisites** | None |
| **Learning Objectives** | Install required tools; configure VS Code extensions; verify GitHub Copilot access; validate Node.js and npm setup |

**Student Tasks:**

1. Install VS Code (latest stable)
2. Install required VS Code extensions:
   - GitHub Copilot (`github.copilot`)
   - GitHub Copilot Chat (`github.copilot-chat`)
   - SARIF Viewer (`MS-SarifVSCode.sarif-viewer`)
   - ESLint (`dbaeumer.vscode-eslint`)
3. Install Node.js v20+ and npm
4. Install Git
5. Verify GitHub account with Copilot access (Copilot Individual, Business, or Enterprise)
6. Verify Copilot Chat works: open Chat panel, type "Hello" and confirm response
7. (Optional) Install Azure CLI if planning to do FinOps labs

**Verification Checkpoint:**

- [ ] VS Code opens with all extensions active
- [ ] `node --version` returns v20+
- [ ] `git --version` returns v2.40+
- [ ] Copilot Chat responds to a test message

**Screenshots needed:**

- `lab-01-vscode-extensions.png` — Extensions panel with required extensions installed
- `lab-01-copilot-chat-verify.png` — Copilot Chat responding to test message
- `lab-01-node-version.png` — Terminal showing node and npm versions

---

### Lab 02: Clone the Workshop Repository and Explore the Sample App

| Attribute | Detail |
|---|---|
| **Title** | Clone the Repository and Explore the Sample App |
| **Time** | 25 minutes |
| **Difficulty** | Beginner |
| **Prerequisites** | Lab 01 |
| **Learning Objectives** | Clone the workshop repo using "Use this template"; understand the repo structure; explore the sample Next.js app; identify intentional issue markers; run the app locally |

**Student Tasks:**

1. Navigate to the workshop repo on GitHub
2. Click "Use this template" → "Create a new repository" (public or private)
3. Clone the new repo locally: `git clone <url>`
4. Open in VS Code: `code agentic-devsecops-workshop`
5. Explore the folder structure:
   - `agents/` — 15 agent definitions
   - `instructions/` — Agent behavior rules
   - `prompts/` — Reusable prompt templates
   - `skills/` — Domain knowledge packages
   - `sample-app/` — Next.js app with intentional issues
6. Open `sample-app/README.md` — review the intentional issues table
7. Search for `INTENTIONAL-VULNERABILITY` markers in `src/lib/auth.ts`
8. Install dependencies: `cd sample-app && npm install`
9. Run the app: `npm run dev`
10. Open `http://localhost:3000` in browser to see the running app

**Verification Checkpoint:**

- [ ] Repo cloned and opened in VS Code
- [ ] Can identify at least 3 comment markers in the source code
- [ ] App runs locally at `http://localhost:3000`

**Screenshots needed:**

- `lab-02-template-create.png` — "Use this template" dialog on GitHub
- `lab-02-folder-structure.png` — VS Code Explorer showing repo structure
- `lab-02-issue-markers.png` — Editor showing `INTENTIONAL-VULNERABILITY` comments in auth.ts
- `lab-02-app-running.png` — Browser showing the running sample app

---

### Lab 03: Understanding Agents, Skills, and Instructions

| Attribute | Detail |
|---|---|
| **Title** | Understanding Agents, Skills, Instructions, and Prompts |
| **Time** | 20 minutes |
| **Difficulty** | Beginner |
| **Prerequisites** | Lab 02 |
| **Learning Objectives** | Understand the agent file format (YAML frontmatter + markdown body); learn the difference between agents, skills, instructions, and prompts; explore the four agent domains |

**Student Tasks:**

1. Open `agents/security-reviewer-agent.agent.md` and examine:
   - YAML frontmatter: name, description, model, tools, handoffs
   - Body: persona, scope, core responsibilities, detection checklist
2. Open `agents/a11y-detector.agent.md` — note the handoff to A11yResolver
3. Open `skills/security-scan/SKILL.md` — domain knowledge loaded by agents
4. Open `instructions/a11y-remediation.instructions.md` — always-on rules for accessibility files
5. Open `prompts/a11y-scan.prompt.md` — reusable prompt template with arguments
6. Map the ecosystem:
   - **Agents** = Personas with tools and behavior (invoked via `@agent-name`)
   - **Skills** = Domain knowledge packages (loaded automatically by agents)
   - **Instructions** = Always-on rules applied to matching file paths
   - **Prompts** = Reusable prompt templates (invoked via `/prompt-name`)

**Verification Checkpoint:**

- [ ] Can explain the difference between agents, skills, instructions, and prompts
- [ ] Can identify the YAML frontmatter fields in an agent file
- [ ] Understands the Detector → Resolver handoff pattern

**Screenshots needed:**

- `lab-03-agent-file.png` — Security reviewer agent file open in editor showing frontmatter
- `lab-03-agent-domains.png` — Diagram or table showing 4 domains and 15 agents
- `lab-03-handoff-pattern.png` — A11yDetector file showing handoff to A11yResolver

---

### Lab 04: Security Scanning with Copilot Agents

| Attribute | Detail |
|---|---|
| **Title** | Running Security Agents in VS Code |
| **Time** | 40 minutes |
| **Difficulty** | Intermediate |
| **Prerequisites** | Labs 01–03 |
| **Learning Objectives** | Invoke the SecurityReviewerAgent via Copilot Chat; scan application source code for OWASP Top 10 vulnerabilities; understand SARIF severity classifications; invoke the IaCSecurityAgent for Bicep infrastructure scanning |

**Student Tasks:**

1. Open Copilot Chat panel in VS Code
2. Invoke the security reviewer agent:
   ```
   @security-reviewer-agent Scan the sample-app/src/ directory for OWASP Top 10 vulnerabilities. Report findings with CWE IDs, severity, file, and line references.
   ```
3. Review the findings — expect to see:
   - SQL injection in `db.ts` (CWE-89)
   - XSS in `ProductCard.tsx` and `products/[id]/page.tsx` (CWE-79)
   - Hardcoded secrets in `auth.ts` (CWE-259, CWE-798)
   - MD5 hashing in `auth.ts` (CWE-328)
   - Weak token generation (CWE-330)
4. Invoke the IaC security agent:
   ```
   @iac-security-agent Scan sample-app/infra/main.bicep for security misconfigurations. Map findings to CIS Azure Benchmarks.
   ```
5. Review IaC findings — expect:
   - Public blob access enabled
   - TLS 1.0 allowed
   - HTTP traffic allowed
   - Overly permissive firewall rules
   - Plaintext SQL password
6. Compare findings against the `sample-app/README.md` intentional issues table
7. (Exercise) Try invoking `@supply-chain-security-agent` against `sample-app/package.json`

**Verification Checkpoint:**

- [ ] Security reviewer agent returned findings with CWE IDs and severity levels
- [ ] IaC security agent found at least 3 Bicep misconfigurations
- [ ] Student can map agent findings to the intentional issues table

**Screenshots needed:**

- `lab-04-invoke-security-agent.png` — Copilot Chat with security agent invocation
- `lab-04-security-findings.png` — Agent output showing vulnerability findings with CWE IDs
- `lab-04-iac-scan.png` — IaC agent output showing Bicep misconfigurations
- `lab-04-compare-findings.png` — Side-by-side view of agent output and README issues table

---

### Lab 05: Accessibility Scanning with Copilot Agents

| Attribute | Detail |
|---|---|
| **Title** | Running Accessibility Agents in VS Code |
| **Time** | 35 minutes |
| **Difficulty** | Intermediate |
| **Prerequisites** | Labs 01–03 |
| **Learning Objectives** | Invoke the A11yDetector agent for WCAG 2.2 scanning; understand POUR principles and violation severity; use the A11y Resolver handoff for automated fixes; use prompt files for accessibility scanning |

**Student Tasks:**

1. Invoke the A11y Detector agent:
   ```
   @a11y-detector Scan sample-app/src/ for WCAG 2.2 Level AA violations. Report findings organized by POUR principles.
   ```
2. Review the findings — expect:
   - Missing `lang` attribute on `<html>` in `layout.tsx` (WCAG 3.1.1)
   - Low contrast text (#999 on white) in `page.tsx` (WCAG 1.4.3)
   - Missing form label in `page.tsx` (WCAG 1.3.1)
   - Small touch targets in `page.tsx` (WCAG 2.5.8)
   - Missing alt text on images in `products/page.tsx` (WCAG 1.1.1)
   - Broken heading hierarchy in `Header.tsx` (WCAG 1.3.1)
3. Try the handoff: click "🔧 Fix Accessibility Issues" in the agent output
   - Or manually invoke: `@a11y-resolver Fix the accessibility issues identified above`
4. Review the proposed fixes
5. Try the prompt file approach:
   ```
   /a11y-scan component=sample-app/src/app/page.tsx
   ```
6. Compare findings against the `sample-app/README.md` accessibility issues table

**Verification Checkpoint:**

- [ ] A11y Detector found at least 5 WCAG violations with WCAG SC references
- [ ] A11y Resolver proposed code fixes for at least 2 violations
- [ ] Student can explain the POUR principles (Perceivable, Operable, Understandable, Robust)

**Screenshots needed:**

- `lab-05-invoke-a11y-agent.png` — Copilot Chat with A11y Detector invocation
- `lab-05-a11y-findings.png` — Agent output showing WCAG violations with SC references
- `lab-05-a11y-handoff.png` — Handoff button and A11y Resolver proposing fixes
- `lab-05-prompt-file.png` — Using the `/a11y-scan` prompt file

---

### Lab 06: Code Quality Analysis with Copilot Agents

| Attribute | Detail |
|---|---|
| **Title** | Running Code Quality Agents in VS Code |
| **Time** | 35 minutes |
| **Difficulty** | Intermediate |
| **Prerequisites** | Labs 01–03 |
| **Learning Objectives** | Run tests and generate coverage reports; invoke the CodeQualityDetector agent; understand coverage-to-SARIF mapping; use the TestGenerator handoff for automated test creation |

**Student Tasks:**

1. Run the test suite with coverage:
   ```bash
   cd sample-app
   npm test -- --coverage
   ```
2. Review the coverage report — expect ~5% overall coverage
3. Open `coverage/coverage-summary.json` to see per-file metrics
4. Invoke the Code Quality Detector:
   ```
   @code-quality-detector Analyze sample-app/ for code quality issues. Check coverage reports, cyclomatic complexity, and code duplication.
   ```
5. Review findings — expect:
   - Low test coverage (~5% vs 80% threshold) across all files
   - High cyclomatic complexity in `utils.ts` (`formatPrice`, `categorizeProduct`)
   - `any` type usage in `utils.ts`
   - Duplicate code patterns in `utils.ts`
6. Try the handoff: TestGenerator for uncovered functions
   ```
   @test-generator Generate tests for the uncovered functions in sample-app/src/lib/utils.ts
   ```
7. (Exercise) Apply generated tests and re-run coverage to see improvement

**Verification Checkpoint:**

- [ ] Test suite runs with coverage output showing ~5%
- [ ] Code Quality Detector identified low coverage and complexity issues
- [ ] Test Generator produced test code for at least one uncovered function

**Screenshots needed:**

- `lab-06-coverage-output.png` — Terminal showing jest coverage output table
- `lab-06-quality-findings.png` — Code Quality Detector output with findings
- `lab-06-test-generator.png` — Test Generator producing test code for utils.ts
- `lab-06-coverage-improved.png` — (Optional) Re-run coverage showing improvement

---

### Lab 07: Understanding SARIF Output

| Attribute | Detail |
|---|---|
| **Title** | Understanding and Viewing SARIF Output |
| **Time** | 30 minutes |
| **Difficulty** | Intermediate |
| **Prerequisites** | Labs 04–06 (at least one) |
| **Learning Objectives** | Understand the SARIF v2.1.0 schema structure; read a SARIF file manually; view SARIF in the VS Code SARIF Viewer extension; understand `automationDetails.id` category prefixes and `partialFingerprints` |

**Student Tasks:**

1. Open the existing `validation-results.sarif` in the repo root
2. Examine the SARIF structure:
   - `$schema` and `version`
   - `runs[].tool.driver.name` and `rules[]`
   - `runs[].results[]` with `ruleId`, `level`, `message`, `locations[]`
   - `automationDetails.id` category prefix
   - `partialFingerprints` for deduplication
3. Open the file with the SARIF Viewer extension (right-click → "Open with SARIF Viewer")
4. Navigate findings using the SARIF Viewer: click a result → jumps to file and line
5. Understand the four SARIF category prefixes:
   - `security/` — Security findings
   - `accessibility-scan/` — Accessibility findings
   - `code-quality/coverage/` — Code quality findings
   - `finops-finding/v1` — FinOps findings
6. Review the SARIF severity mapping:
   - `error` → CRITICAL / HIGH
   - `warning` → MEDIUM
   - `note` → LOW
7. (Exercise) Ask a security agent to output findings in SARIF format and view the result

**Verification Checkpoint:**

- [ ] Can identify the key fields in a SARIF file
- [ ] Can open SARIF files in the SARIF Viewer and navigate to findings
- [ ] Understands the four category prefixes

**Screenshots needed:**

- `lab-07-sarif-raw.png` — SARIF file open in editor showing JSON structure
- `lab-07-sarif-viewer.png` — SARIF Viewer extension showing findings list
- `lab-07-sarif-navigate.png` — Clicking a finding in SARIF Viewer jumps to source line
- `lab-07-sarif-categories.png` — Diagram showing the four SARIF category prefixes

---

### Lab 08: Setting Up GitHub Actions Pipelines

| Attribute | Detail |
|---|---|
| **Title** | Setting Up CI/CD Pipelines with GitHub Actions |
| **Time** | 40 minutes |
| **Difficulty** | Intermediate |
| **Prerequisites** | Labs 01–07 |
| **Learning Objectives** | Enable GitHub Actions workflows for automated scanning; understand the seven workflow files and their triggers; push a change and observe pipeline execution; view SARIF uploads in GitHub Code Scanning |

**Student Tasks:**

1. Review the seven workflow files in `.github/workflows/`:
   - `security-scan.yml` — SAST (CodeQL), SCA, IaC, container, DAST
   - `accessibility-scan.yml` — Three-engine a11y scan
   - `code-quality.yml` — Lint, type check, test, coverage gate
   - `finops-cost-gate.yml` — Infracost + budget gate
   - `apm-security.yml` — Agent config supply chain audit
   - `ci-full-test.yml` — Agent validation (structure, cross-refs)
   - `deploy-to-github-private.yml` — Org-wide distribution
2. Enable GitHub Actions in the repo settings (if using template)
3. Ensure repository has `security-events: write` permissions
4. Create a feature branch:
   ```bash
   git checkout -b feature/test-pipeline
   ```
5. Make a small change (e.g., add a comment to `sample-app/src/app/page.tsx`)
6. Commit and push:
   ```bash
   git add .
   git commit -m "test: trigger CI pipeline"
   git push origin feature/test-pipeline
   ```
7. Open a Pull Request against `main`
8. Observe the GitHub Actions workflows running:
   - Security Scan (SAST, SCA, IaC)
   - Code Quality (lint, type check, test)
   - (Optional) Accessibility Scan
9. Wait for workflows to complete and review the Actions tab results

**Verification Checkpoint:**

- [ ] At least two workflows triggered on the PR
- [ ] Can see workflow logs in the Actions tab
- [ ] Understands which workflows produce SARIF output

**Screenshots needed:**

- `lab-08-workflows-list.png` — VS Code showing workflow files in `.github/workflows/`
- `lab-08-pr-created.png` — Pull Request page showing CI checks running
- `lab-08-actions-running.png` — GitHub Actions tab with workflows in progress
- `lab-08-actions-complete.png` — Completed workflows with status indicators

---

### Lab 09: Viewing Results in GitHub Security Tab

| Attribute | Detail |
|---|---|
| **Title** | Viewing Scan Results in GitHub Security Tab |
| **Time** | 25 minutes |
| **Difficulty** | Intermediate |
| **Prerequisites** | Lab 08 |
| **Learning Objectives** | Navigate the GitHub Security tab; filter findings by tool, severity, and category; understand the Code Scanning alerts interface; review Dependabot alerts and secret scanning |

**Student Tasks:**

1. Navigate to the repository on GitHub.com
2. Click the **Security** tab
3. Explore **Code scanning alerts**:
   - Filter by tool: CodeQL, MSDO, accessibility-scanner
   - Filter by severity: error, warning, note
   - Click a finding to see the full detail including code location
4. Explore **Dependabot alerts** (if SCA ran):
   - Review vulnerable dependency alerts
   - Note the suggested remediation (version upgrade)
5. Explore **Secret scanning** (if secrets were committed):
   - Review any detected secrets
   - Understand push protection
6. Review the **Security Overview** (if visible at org level):
   - Find the repo in the overview dashboard
   - Filter by category prefix (`security/`, `accessibility-scan/`, `code-quality/coverage/`)
7. (Exercise) Dismiss a finding as "won't fix" and create a GitHub Issue from another finding

**Verification Checkpoint:**

- [ ] Can navigate the Security tab and find Code Scanning alerts
- [ ] Can filter findings by tool and severity
- [ ] Can click through to the source code location of a finding

**Screenshots needed:**

- `lab-09-security-tab.png` — GitHub Security tab overview
- `lab-09-code-scanning.png` — Code scanning alerts list with filters applied
- `lab-09-finding-detail.png` — Expanded finding showing code location and help text
- `lab-09-dependabot.png` — Dependabot alerts (if visible)
- `lab-09-security-overview.png` — Organization Security Overview dashboard

---

### Lab 10: FinOps Agents and Azure Cost Governance (Optional — Requires Azure)

| Attribute | Detail |
|---|---|
| **Title** | FinOps Agents and Azure Cost Governance |
| **Time** | 45 minutes |
| **Difficulty** | Advanced |
| **Prerequisites** | Labs 01–03; Azure subscription with Cost Management Reader role |
| **Learning Objectives** | Invoke FinOps agents for IaC cost analysis; understand the seven required governance tags; review Infracost estimates; understand the Deployment Cost Gate workflow |

**Student Tasks:**

1. Invoke the Cost Analysis Agent:
   ```
   @cost-analysis-agent Analyze sample-app/infra/main.bicep for cost optimization opportunities. Compare current SKUs against right-sized alternatives.
   ```
2. Review findings — expect:
   - Oversized App Service Plan (P1v3 ~$420/mo vs B1 ~$13/mo)
   - Oversized SQL Database (GP_Gen5_8 ~$800/mo vs Basic ~$5/mo)
   - GRS storage replication (Standard_GRS vs Standard_LRS)
3. Invoke the FinOps Governance Agent:
   ```
   @finops-governance-agent Check sample-app/infra/ for governance tag compliance. Required tags: ProjectName, Environment, CostCenter, Owner, Department, Application.
   ```
4. Review tag governance findings — all 5 resources missing tags
5. Invoke the Deployment Cost Gate Agent:
   ```
   @deployment-cost-gate-agent Estimate the monthly cost of deploying sample-app/infra/main.bicep. Budget limit: $100/month.
   ```
6. Review the cost gate verdict — expect: FAIL (estimated cost >> $100 budget)
7. Review the `finops-cost-gate.yml` workflow to understand CI/CD integration
8. (Exercise) Modify `infra/variables.bicep` to use right-sized defaults and re-run cost analysis

**Verification Checkpoint:**

- [ ] Cost Analysis Agent identified at least 3 cost optimization opportunities
- [ ] FinOps Governance Agent found missing tags on all resources
- [ ] Deployment Cost Gate Agent returned a cost estimate exceeding the budget

**Screenshots needed:**

- `lab-10-cost-analysis.png` — Cost Analysis Agent output with SKU comparisons
- `lab-10-tag-governance.png` — FinOps Governance Agent showing missing tags
- `lab-10-cost-gate.png` — Deployment Cost Gate Agent with budget verdict
- `lab-10-cost-gate-workflow.png` — finops-cost-gate.yml workflow file

---

### Lab 11: Agent Remediation Workflows (Optional — Advanced)

| Attribute | Detail |
|---|---|
| **Title** | Agent-to-Agent Remediation Workflows |
| **Time** | 45 minutes |
| **Difficulty** | Advanced |
| **Prerequisites** | Labs 04–06 |
| **Learning Objectives** | Use the Detector → Resolver handoff pattern end-to-end; apply agent-generated fixes; re-scan to verify remediation; commit fixes with ADO work item references |

**Student Tasks:**

1. **Security Remediation Cycle:**
   - Run `@security-reviewer-agent` on `sample-app/src/lib/auth.ts`
   - Ask the agent to fix the MD5 hashing vulnerability
   - Review and apply the proposed fix (bcrypt/argon2)
   - Re-scan to verify the fix
2. **Accessibility Remediation Cycle:**
   - Run `@a11y-detector` on `sample-app/src/app/layout.tsx`
   - Click the handoff "🔧 Fix Accessibility Issues"
   - `@a11y-resolver` proposes adding `lang="en"` to the `<html>` tag
   - Apply the fix, re-scan to verify
3. **Code Quality Remediation Cycle:**
   - Run `@code-quality-detector` on `sample-app/`
   - Click the handoff "🧪 Generate Tests"
   - `@test-generator` produces tests for uncovered functions in `utils.ts`
   - Apply tests, re-run `npm test -- --coverage` to verify improvement
4. Commit all fixes:
   ```bash
   git add .
   git commit -m "fix: remediate security, a11y, and quality issues AB#1234"
   git push
   ```

**Verification Checkpoint:**

- [ ] Completed at least one full Detect → Fix → Re-scan cycle
- [ ] Coverage improved after applying generated tests
- [ ] Committed fixes with proper AB# work item reference

**Screenshots needed:**

- `lab-11-security-fix.png` — Agent proposing bcrypt fix for MD5 hashing
- `lab-11-a11y-fix.png` — A11y Resolver adding lang attribute
- `lab-11-test-generation.png` — Test Generator producing tests
- `lab-11-coverage-before-after.png` — Coverage comparison before and after fixes

---

### Lab 12: Extending the Framework (Optional — Advanced)

| Attribute | Detail |
|---|---|
| **Title** | Creating Your Own Custom Agent |
| **Time** | 45 minutes |
| **Difficulty** | Advanced |
| **Prerequisites** | Labs 01–09 |
| **Learning Objectives** | Author a custom `.agent.md` file from scratch; define YAML frontmatter with appropriate tools; write agent persona and behavior instructions; test the custom agent in VS Code Copilot Chat |

**Student Tasks:**

1. Choose a domain for a custom agent (e.g., performance, licensing, documentation quality)
2. Create a new agent file: `agents/my-custom-agent.agent.md`
3. Define the YAML frontmatter:
   ```yaml
   ---
   name: MyCustomAgent
   description: "One-line description"
   tools:
     - read/readFile
     - search/codebase
     - search/textSearch
   ---
   ```
4. Write the agent body:
   - Persona definition ("You are a ... expert")
   - Scope (in-scope / out-of-scope)
   - Detection checklist or analysis protocol
   - Output format (Markdown table, SARIF snippet)
5. Test the agent: `@my-custom-agent Analyze the sample-app for [your domain]`
6. Iterate on the prompt based on output quality
7. (Exercise) Add a handoff to an existing resolver agent
8. (Exercise) Create a companion skill file in `skills/my-domain/SKILL.md`

**Verification Checkpoint:**

- [ ] Custom agent file follows the YAML frontmatter schema
- [ ] Agent responds when invoked in Copilot Chat
- [ ] Agent produces structured output relevant to the chosen domain

**Screenshots needed:**

- `lab-12-agent-file.png` — Custom agent file in editor
- `lab-12-agent-invoke.png` — Copilot Chat with custom agent invocation
- `lab-12-agent-output.png` — Custom agent producing structured findings

---

## Screenshot Strategy

### Directory Structure

```text
assets/
  screenshots/
    lab-01/
      lab-01-vscode-extensions.png
      lab-01-copilot-chat-verify.png
      lab-01-node-version.png
    lab-02/
      lab-02-template-create.png
      lab-02-folder-structure.png
      lab-02-issue-markers.png
      lab-02-app-running.png
    lab-03/
      lab-03-agent-file.png
      lab-03-agent-domains.png
      lab-03-handoff-pattern.png
    lab-04/
      lab-04-invoke-security-agent.png
      lab-04-security-findings.png
      lab-04-iac-scan.png
      lab-04-compare-findings.png
    lab-05/
      lab-05-invoke-a11y-agent.png
      lab-05-a11y-findings.png
      lab-05-a11y-handoff.png
      lab-05-prompt-file.png
    lab-06/
      lab-06-coverage-output.png
      lab-06-quality-findings.png
      lab-06-test-generator.png
      lab-06-coverage-improved.png
    lab-07/
      lab-07-sarif-raw.png
      lab-07-sarif-viewer.png
      lab-07-sarif-navigate.png
      lab-07-sarif-categories.png
    lab-08/
      lab-08-workflows-list.png
      lab-08-pr-created.png
      lab-08-actions-running.png
      lab-08-actions-complete.png
    lab-09/
      lab-09-security-tab.png
      lab-09-code-scanning.png
      lab-09-finding-detail.png
      lab-09-dependabot.png
      lab-09-security-overview.png
    lab-10/
      lab-10-cost-analysis.png
      lab-10-tag-governance.png
      lab-10-cost-gate.png
      lab-10-cost-gate-workflow.png
    lab-11/
      lab-11-security-fix.png
      lab-11-a11y-fix.png
      lab-11-test-generation.png
      lab-11-coverage-before-after.png
    lab-12/
      lab-12-agent-file.png
      lab-12-agent-invoke.png
      lab-12-agent-output.png
```

### Naming Convention

- Pattern: `lab-{NN}-{descriptive-slug}.png`
- Use lowercase, hyphens, no spaces
- Two-digit lab number with leading zero
- Slug describes the screenshot content
- All PNGs, captured at 1920×1080 or 2x retina

### Total Screenshot Count

| Lab | Count |
|---|---|
| Lab 01 | 3 |
| Lab 02 | 4 |
| Lab 03 | 3 |
| Lab 04 | 4 |
| Lab 05 | 4 |
| Lab 06 | 4 |
| Lab 07 | 4 |
| Lab 08 | 4 |
| Lab 09 | 5 |
| Lab 10 | 4 |
| Lab 11 | 4 |
| Lab 12 | 3 |
| **Total** | **46** |

### Placeholder Strategy

Each lab guide markdown file includes image references using standard markdown:

```markdown
![VS Code extensions panel](../assets/screenshots/lab-01/lab-01-vscode-extensions.png)
```

Until screenshots are captured, create a placeholder image (gray box with text label) or use a `<!-- TODO: Capture screenshot lab-01-vscode-extensions.png -->` comment.

---

## Student Experience Flow (End-to-End)

### Phase 1: Setup (Labs 01–02) — 55 minutes

```text
Student → Installs VS Code + Extensions + Node.js
       → Verifies GitHub Copilot access
       → Creates repo from template ("Use this template")
       → Clones locally, opens in VS Code
       → Explores folder structure and sample app
       → Runs sample app locally (npm run dev)
       → Browses http://localhost:3000
```

### Phase 2: Learn the Framework (Lab 03) — 20 minutes

```text
Student → Opens agent files, reads YAML frontmatter
       → Opens skills, instructions, prompts
       → Draws the Agent → Skill → Instruction → Prompt diagram
       → Understands the 4 domains: Security, A11y, Code Quality, FinOps
       → Understands the Detector → Resolver handoff pattern
```

### Phase 3: Hands-On Agent Scanning (Labs 04–06) — 110 minutes

```text
Student → Invokes @security-reviewer-agent → gets vulnerability report
       → Invokes @iac-security-agent → gets Bicep misconfig report
       → Invokes @a11y-detector → gets WCAG violation report
       → Tries handoff to @a11y-resolver → sees proposed fixes
       → Runs npm test --coverage → sees 5% coverage
       → Invokes @code-quality-detector → gets quality findings
       → Tries @test-generator → gets generated tests
```

### Phase 4: SARIF Deep Dive (Lab 07) — 30 minutes

```text
Student → Opens SARIF file in editor → reads JSON structure
       → Opens in SARIF Viewer extension → navigates findings
       → Learns category prefixes and severity mapping
       → Connects: "This is what the agents produce for CI/CD"
```

### Phase 5: CI/CD Integration (Labs 08–09) — 65 minutes

```text
Student → Reviews workflow files in .github/workflows/
       → Creates branch, makes change, opens PR
       → Watches GitHub Actions run: security, quality, a11y
       → Waits for SARIF uploads to complete
       → Navigates to Security tab → Code Scanning alerts
       → Filters by tool, severity, category
       → Clicks through to finding details and source code
       → "Aha!" moment: IDE agents + CI scanners + Security tab = unified
```

### Phase 6: Advanced (Optional, Labs 10–12) — 135 minutes

```text
Student → (Lab 10) Invokes FinOps agents against Bicep infra
       → Sees cost optimization opportunities and tag violations
       → (Lab 11) Runs full Detect → Fix → Re-scan cycles
       → Commits fixes with AB# references
       → (Lab 12) Authors a custom agent from scratch
       → Tests the custom agent in Copilot Chat
```

### Key "Aha!" Moments in the Student Journey

1. **Lab 04**: "The agent found the SQL injection I saw in the comments — it actually works!"
2. **Lab 05**: "It found the missing alt text AND proposed a fix automatically via handoff!"
3. **Lab 06**: "The test generator wrote tests that actually pass and improve coverage!"
4. **Lab 07**: "SARIF is the universal format — every domain speaks the same language."
5. **Lab 09**: "The same findings I saw in VS Code now appear in the GitHub Security tab!"
6. **Lab 11**: "I can go from finding → fix → verify in one conversation!"
7. **Lab 12**: "I can build my own agent in 20 minutes!"

---

## Discovered Research Topics

### Addressed During This Session

- [x] Full framework inventory (15 agents, 2 skills, 3 instructions, 2 prompts, 7 workflows)
- [x] Sample app intentional issue counts by domain
- [x] Agent invocation patterns (`@agent-name`, `/prompt-name`, handoff)
- [x] SARIF schema requirements and category registry
- [x] GitHub Actions workflow triggers and SARIF upload patterns
- [x] Repository structure and deployment model
- [x] VS Code extension requirements for the workshop

### Future Research for Implementation Phase

- [ ] Detailed step-by-step for each lab (exact commands, expected outputs)
- [ ] Template repo setup automation (GitHub CLI script to create template)
- [ ] Instructor guide with talking points per lab
- [ ] Assessment rubric (what constitutes "passed" each lab)
- [ ] Workshop slide deck outline
- [ ] Video recording strategy for each lab
- [ ] Accessibility of workshop materials (accessible lab docs, alt text for screenshots)
- [ ] Localization considerations (i18n for lab content)
- [ ] Azure DevOps lab variant (parallel track using ADO pipelines instead of GitHub Actions)

---

## Clarifying Questions

1. **Workshop delivery format**: Is this instructor-led (live), self-paced (async), or both? This affects pacing and how checkpoints are structured.
2. **GitHub tier**: Do students have GitHub Enterprise with Advanced Security, or GitHub Pro/Team? This affects whether Secret Scanning and Security Overview are available.
3. **Azure requirement**: Should FinOps labs (Lab 10) be mandatory or strictly optional? Some workshops may not have Azure access.
4. **Template repo ownership**: Should the template repo live under `devopsabcs-engineering` org or a dedicated workshop org?
5. **Assessment method**: Are there quizzes, hands-on checkpoints, or both? Do students receive certificates?
6. **Max class size**: Affects whether we need rate limiting considerations for Copilot API and GitHub Actions minutes.

---

## References and Evidence

| Source | Location | Key Information |
|---|---|---|
| Framework README | `README.md` | Agent inventory, repo structure, 7 workflows, quick start |
| Architecture doc | `docs/architecture.md` | Core formula, deployment model, SARIF requirements |
| Sample App README | `sample-app/README.md` | 40+ intentional issues by domain with file/line references |
| Agent files | `agents/*.agent.md` | YAML frontmatter schema, tool declarations, handoff patterns |
| Skills | `skills/*/SKILL.md` | Domain knowledge for security and accessibility |
| Instructions | `instructions/*.instructions.md` | Fix patterns for accessibility remediation |
| Prompts | `prompts/*.prompt.md` | Reusable templates for a11y scanning and fixing |
| SARIF reference | `docs/sarif-integration.md` | Category registry, required fields, platform limits |
| Agent patterns | `docs/agent-patterns.md` | File naming, frontmatter schema, tool namespaces |
| Agent extensibility | `docs/agent-extensibility.md` | Plugin architecture, sharing hierarchy, APM |
| Implementation roadmap | `docs/implementation-roadmap.md` | Phased rollout, proof-of-value per domain |
| GitHub workflows | `.github/workflows/*.yml` | CI/CD pipeline definitions with SARIF upload |
| ADO pipelines | `samples/azure-devops/*.yml` | ADO equivalents for security, a11y, quality |
| Sample app source | `sample-app/src/` | Intentional vulnerabilities with comment markers |
| Bicep infrastructure | `sample-app/infra/` | IaC with security and FinOps misconfigurations |
