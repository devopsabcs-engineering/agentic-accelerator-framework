<!-- markdownlint-disable-file -->
# Implementation Details: Agentic DevSecOps Workshop Repository

## Context Reference

Sources: `.copilot-tracking/research/2026-03-18/agentic-devsecops-workshop-research.md`, `.copilot-tracking/research/subagents/2026-03-18/codebase-analysis-research.md`, `.copilot-tracking/research/subagents/2026-03-18/reference-workshop-research.md`, `.copilot-tracking/research/subagents/2026-03-18/workshop-module-design-research.md`

## Implementation Phase 1: ADO Work Items and Repository Bootstrap

<!-- parallelizable: false -->

### Step 1.1: Create ADO Epic "Agentic DevSecOps Workshop"

Create a new Epic work item in the `Agentic DevSecOps Framework` project.

Fields:
* Title: `Agentic DevSecOps Workshop`
* Description: `Design and build a comprehensive hands-on workshop repository that teaches developers to use AI-powered DevSecOps agents from zero to hero. Includes 12 progressive labs, GitHub Actions CI/CD integration, and SARIF visualization in GitHub Security tab.`
* Tags: `Agentic AI`
* State: `New`

Files:
* No file changes — ADO work item creation only

Success criteria:
* Epic work item exists in ADO with `Agentic AI` tag
* Epic ID recorded for use in child work items

Dependencies:
* ADO access to `MngEnvMCAP675646` / `Agentic DevSecOps Framework`

### Step 1.2: Create ADO Feature "Workshop Repository Setup" under the Epic

Create a Feature work item linked as child of the Epic from Step 1.1.

Fields:
* Title: `Workshop Repository Setup and Lab Content`
* Description: `Set up the agentic-devsecops-workshop template repository with copied framework assets, 12 lab modules, GitHub Actions workflows, and screenshot placeholders.`
* Tags: `Agentic AI`
* Parent: Epic from Step 1.1

Success criteria:
* Feature work item exists linked to the Epic

### Step 1.3: Create ADO User Story "Initialize workshop repository structure"

Create a User Story work item linked as child of the Feature from Step 1.2.

Fields:
* Title: `Initialize workshop repository structure with framework assets`
* Description: `As a workshop author, I want to set up the initial workshop repository structure with copied framework assets so that subsequent labs can be built on a working foundation. Fixes AB#{id}`
* Acceptance Criteria: Directory structure created, framework assets copied, workflows adapted, README.md with checklist created
* Tags: `Agentic AI`
* Parent: Feature from Step 1.2

Success criteria:
* User Story exists in ADO linked to Feature
* Work item ID available for branch naming and commit messages

### Step 1.4: Clone the empty workshop repo and create feature branch

Clone the workshop repository and create the initial feature branch.

```bash
cd c:\src\GitHub\devopsabcs-engineering
git clone https://github.com/devopsabcs-engineering/agentic-devsecops-workshop.git
cd agentic-devsecops-workshop
git checkout -b feature/{work-item-id}-init-workshop-structure
```

Files:
* New local clone of `agentic-devsecops-workshop`

Success criteria:
* Repository cloned locally
* Feature branch created with ADO work item ID

Dependencies:
* Step 1.3 (work item ID for branch name)
* Git access to `devopsabcs-engineering/agentic-devsecops-workshop`

### Step 1.5: Create workshop directory structure

Create the full directory tree for the workshop repository.

```text
agentic-devsecops-workshop/
├── labs/
├── images/
│   ├── lab-00/
│   ├── lab-01/
│   ├── lab-02/
│   ├── lab-03/
│   ├── lab-04/
│   ├── lab-05/
│   ├── lab-06/
│   ├── lab-07/
│   ├── lab-08/
│   ├── lab-09/
│   ├── lab-10/
│   └── lab-11/
├── agents/
├── instructions/
├── prompts/
├── skills/
├── sample-app/
├── solutions/
└── .github/
    └── workflows/
```

Create `.gitkeep` files in empty image directories to ensure they are tracked by Git.

Files:
* `labs/` — directory for lab markdown files
* `images/lab-00/` through `images/lab-11/` — 12 screenshot directories
* `solutions/` — optional completed lab solutions directory
* `.github/workflows/` — GitHub Actions workflows directory

Success criteria:
* All directories exist and are tracked by Git
* `.gitkeep` in each images/ subdirectory

Dependencies:
* Step 1.4 (local repo clone)

### Step 1.6: Copy framework assets from agentic-devsecops-framework

Copy the following directories and files from the framework repo into the workshop repo:

```bash
# From c:\src\GitHub\devopsabcs-engineering\agentic-devsecops-framework
# To   c:\src\GitHub\devopsabcs-engineering\agentic-devsecops-workshop

# Copy agent definitions (15 files)
cp -r ../agentic-devsecops-framework/agents/ ./agents/

# Copy instruction files (3 files)
cp -r ../agentic-devsecops-framework/instructions/ ./instructions/

# Copy prompt templates (2 files)
cp -r ../agentic-devsecops-framework/prompts/ ./prompts/

# Copy skill packages (2 directories)
cp -r ../agentic-devsecops-framework/skills/ ./skills/

# Copy sample app (entire directory)
cp -r ../agentic-devsecops-framework/sample-app/ ./sample-app/

# Copy supporting files
cp ../agentic-devsecops-framework/apm.yml ./apm.yml
cp ../agentic-devsecops-framework/validation-results.sarif ./validation-results.sarif
```

Files:
* `agents/` — 15 agent definition files (.agent.md)
* `instructions/` — 3 instruction files (.instructions.md)
* `prompts/` — 2 prompt template files (.prompt.md)
* `skills/` — 2 skill packages (a11y-scan/, security-scan/)
* `sample-app/` — Full Next.js 14 app with intentional issues
* `apm.yml` — Agent Policy Manager configuration
* `validation-results.sarif` — SARIF output file for Lab 06 deep dive

Verify after copy:
* 15 files in `agents/`
* `sample-app/package.json` exists
* `sample-app/src/` directory structure intact
* `skills/a11y-scan/SKILL.md` and `skills/security-scan/SKILL.md` exist

Success criteria:
* All framework assets copied with correct directory structure
* No missing files compared to source

Dependencies:
* Step 1.5 (directory structure exists)
* Framework repo at `c:\src\GitHub\devopsabcs-engineering\agentic-devsecops-framework`

### Step 1.7: Adapt GitHub Actions workflows for workshop context

Copy 4 relevant workflows and adapt them for the workshop:

**Copy these workflows:**
1. `.github/workflows/security-scan.yml` — Security domain scanning
2. `.github/workflows/accessibility-scan.yml` — Accessibility scanning
3. `.github/workflows/code-quality.yml` — Code quality and coverage
4. `.github/workflows/finops-cost-gate.yml` — FinOps cost estimation

**Do NOT copy:**
* `deploy-to-github-private.yml` — Org-specific sync workflow
* `apm-security.yml` — Agent config validation (not relevant for students)
* `ci-full-test.yml` — May copy if useful for Lab 07, otherwise skip

**Adaptations per workflow:**
* Remove references to internal org secrets or variables
* Ensure SARIF upload steps use `github/codeql-action/upload-sarif@v3`
* Verify `category` prefixes match the SARIF Category Registry from research
* Add comments explaining what each workflow does for student learning
* Ensure triggers include `pull_request` so Labs 07–08 work correctly

Files:
* `.github/workflows/security-scan.yml` — adapted from framework
* `.github/workflows/accessibility-scan.yml` — adapted from framework
* `.github/workflows/code-quality.yml` — adapted from framework
* `.github/workflows/finops-cost-gate.yml` — adapted from framework

Context references:
* Research document (Lines 64-79) — GitHub Actions Workflows table
* Research document (Lines 222-226) — SARIF Category Registry

Success criteria:
* 4 workflow files in `.github/workflows/`
* No references to org-internal secrets
* SARIF upload steps present in all 4 workflows
* `pull_request` trigger configured

Dependencies:
* Step 1.5 (`.github/workflows/` directory exists)
* Framework workflow files for reference

### Step 1.8: Create supporting community files

Create standard community files for the template repository.

**CODE_OF_CONDUCT.md:**
* Use Microsoft Open Source Code of Conduct
* Link: https://opensource.microsoft.com/codeofconduct/

**CONTRIBUTING.md:**
* Explain this is a workshop template repo
* Note that contributions to lab content go here
* Contributions to the framework itself go to `agentic-devsecops-framework`
* Standard PR process

**LICENSE:**
* MIT License (matching the framework repo)

**_config.yml:**
* Jekyll theme configuration for GitHub Pages rendering
* Use `just-the-docs` or `minima` theme

```yaml
# _config.yml
theme: minima
title: "Agentic DevSecOps Workshop"
description: "Learn to use AI-powered DevSecOps agents — from zero to hero"
```

Files:
* `CODE_OF_CONDUCT.md` — Microsoft Open Source Code of Conduct
* `CONTRIBUTING.md` — Contribution guidelines
* `LICENSE` — MIT License
* `_config.yml` — Jekyll theme configuration

Success criteria:
* All 4 files created
* LICENSE matches MIT format

### Step 1.9: Create workshop README.md with module checklist

Write the main README.md following the gh-abcs-developer pattern with checkbox progress tracking.

Content structure:
1. Workshop banner image placeholder
2. Title: "Agentic DevSecOps Workshop"
3. One-paragraph description
4. "Who is this for?" section with audience tags
5. Prerequisites summary (VS Code, Node.js, GitHub account, Copilot access)
6. Module checklist with checkboxes, links, time estimates, and difficulty levels
7. Delivery tier table (Half-Day, Full-Day, Extended)
8. Lab dependency diagram (Mermaid)
9. "Getting Started" section with template creation instructions
10. Credits and references

Use the exact README template from research (Lines 228-259) with checkbox format:
```markdown
- [ ] [Lab 00 - Prerequisites and Environment Setup](labs/lab-00-setup.md) _(30 min, Beginner)_
```

Files:
* `README.md` — Workshop main entry point

Context references:
* Research document (Lines 228-259) — Complete README template
* Research document (Lines 305-355) — Delivery tiers and lab dependency diagram

Success criteria:
* README.md contains all 12 labs in checklist format
* Delivery tier table present
* Getting Started instructions reference "Use this template"
* Lab dependency diagram included

Dependencies:
* Step 1.8 (supporting files exist for consistent repo presence)

### Step 1.10: Commit, push, create PR, merge

Commit all Phase 1 changes and push to remote.

```bash
git add -A
git commit -m "feat: initialize workshop repository structure AB#{work-item-id}"
git push -u origin feature/{work-item-id}-init-workshop-structure
```

Create PR targeting `main` with description referencing `Fixes AB#{work-item-id}`.

After review and merge:
```bash
git checkout main
git pull origin main
git push origin --delete feature/{work-item-id}-init-workshop-structure
git branch -d feature/{work-item-id}-init-workshop-structure
```

Success criteria:
* PR merged to `main`
* Feature branch deleted (local and remote)

Dependencies:
* Steps 1.5–1.9 completed

## Implementation Phase 2: Foundation Labs (Labs 00–02)

<!-- parallelizable: false -->

### Step 2.1: Create ADO User Story "Write foundation labs (00-02)"

Create a User Story work item linked as child of the Feature from Phase 1.

Fields:
* Title: `Write foundation labs 00-02 (Setup, Explore, Understand)`
* Description: `As a workshop student, I want setup and orientation labs so that I can prepare my environment and understand the framework before running agents.`
* Tags: `Agentic AI`
* Parent: Feature from Step 1.2

Success criteria:
* User Story exists in ADO with work item ID for branch naming

### Step 2.2: Create feature branch for foundation labs

```bash
git checkout main
git pull origin main
git checkout -b feature/{work-item-id}-foundation-labs
```

Success criteria:
* Feature branch created from latest `main`

Dependencies:
* Phase 1 merged to `main`

### Step 2.3: Write Lab 00 — Prerequisites and Environment Setup (30 min, Beginner)

Create `labs/lab-00-setup.md` following the lab file template from research.

**Lab structure:**
* Duration: 30 minutes | Level: Beginner
* Learning Objectives:
  * Install required tools (VS Code, Node.js v20+, Git)
  * Install VS Code extensions (GitHub Copilot, Copilot Chat, SARIF Viewer, ESLint)
  * Create your own repository from the workshop template
  * Verify your environment is ready for the workshop

**Exercises:**

Exercise 0.1: Install Required Tools
* Check Node.js version: `node --version` (must be v20+)
* Check Git version: `git --version`
* Check VS Code: `code --version`
* Screenshot placeholder: `lab-00-node-version.png`

Exercise 0.2: Install VS Code Extensions
* Install from Extensions panel:
  * `github.copilot`
  * `github.copilot-chat`
  * `MS-SarifVSCode.sarif-viewer`
  * `dbaeumer.vscode-eslint`
* Screenshot placeholder: `lab-00-vscode-extensions.png`

Exercise 0.3: Create Your Workshop Repository
* Navigate to https://github.com/devopsabcs-engineering/agentic-devsecops-workshop
* Click "Use this template" → "Create a new repository"
* Name: `agentic-devsecops-workshop` (under personal account)
* Visibility: Public (required for GitHub Security tab features)
* Clone locally: `git clone https://github.com/{your-username}/agentic-devsecops-workshop.git`
* Open in VS Code: `code agentic-devsecops-workshop`

Exercise 0.4: Verify Copilot Chat
* Open Copilot Chat panel (Ctrl+Shift+I or Cmd+Shift+I)
* Type: "Hello, can you see the agents in this workspace?"
* Verify agents are listed (e.g., `@security-agent`, `@a11y-detector`)
* Screenshot placeholder: `lab-00-copilot-chat-verify.png`

**Verification checkpoint:** Node.js v20+, 4 extensions installed, repo created from template, Copilot Chat functional.

Files:
* `labs/lab-00-setup.md` — Lab 00 content

Success criteria:
* Lab file follows template structure
* All 4 exercises present with step-by-step instructions
* 3 screenshot placeholders included
* Verification checkpoint at end

### Step 2.4: Write Lab 01 — Explore the Sample App (25 min, Beginner)

Create `labs/lab-01.md` following the lab file template.

**Lab structure:**
* Duration: 25 minutes | Level: Beginner
* Prerequisites: Lab 00
* Learning Objectives:
  * Navigate the workshop repository structure
  * Identify the four agent domains (Security, Accessibility, Code Quality, FinOps)
  * Run the sample app locally
  * Discover intentional vulnerabilities in the sample app

**Exercises:**

Exercise 1.1: Explore the Repository Structure
* Open the workspace in VS Code explorer
* Identify: `agents/`, `instructions/`, `prompts/`, `skills/`, `sample-app/`
* Screenshot placeholder: `lab-01-folder-structure.png`

Exercise 1.2: Review Intentional Issues
* Open `sample-app/src/lib/auth.ts` — find `Math.random()` and `md5` usage
* Open `sample-app/src/lib/db.ts` — find raw SQL string concatenation
* Open `sample-app/src/components/ProductCard.tsx` — find `dangerouslySetInnerHTML`
* Open `sample-app/infra/main.bicep` — find oversized SKUs and public access
* Screenshot placeholder: `lab-01-issue-markers.png`

Exercise 1.3: Run the Sample App
* `cd sample-app && npm install`
* `npm run dev`
* Open http://localhost:3000
* Browse products page, click a product
* Screenshot placeholder: `lab-01-app-running.png`
* Stop dev server: Ctrl+C

Exercise 1.4: Create from Template
* Note: Include screenshot placeholder for the template creation dialog
* Screenshot placeholder: `lab-01-template-create.png`

**Verification checkpoint:** App runs locally at localhost:3000, student can identify 3+ intentional issues by file name.

Files:
* `labs/lab-01.md` — Lab 01 content

Success criteria:
* Lab references specific files from sample-app with intentional issues
* 4 screenshot placeholders
* Verification checkpoint present

Dependencies:
* Lab 00 completed (environment ready)

### Step 2.5: Write Lab 02 — Understanding Agents, Skills, and Instructions (20 min, Beginner)

Create `labs/lab-02.md` following the lab file template.

**Lab structure:**
* Duration: 20 minutes | Level: Beginner
* Prerequisites: Lab 01
* Learning Objectives:
  * Distinguish between agents, skills, instructions, and prompts
  * Read agent YAML frontmatter and understand agent configuration
  * Understand the orchestrator/sub-agent delegation pattern
  * Understand the detector/resolver handoff pattern

**Exercises:**

Exercise 2.1: Examine an Agent File
* Open `agents/security-reviewer-agent.agent.md`
* Identify YAML frontmatter fields: name, description, tools
* Read the agent persona and output format sections
* Note the SARIF output requirement

Exercise 2.2: Explore Agent Patterns
* Open `agents/security-agent.agent.md` — orchestrator that delegates to 4 sub-agents
* Open `agents/a11y-detector.agent.md` — detector that hands off to `a11y-resolver`
* Screenshot placeholder: `lab-02-agent-file-frontmatter.png`
* Diagram: Orchestrator → Sub-agents, Detector ↔ Resolver

Exercise 2.3: Explore Skills and Instructions
* Open `skills/security-scan/SKILL.md` — domain knowledge package
* Open `instructions/code-quality.instructions.md` — always-on rules
* Open `prompts/a11y-scan.prompt.md` — reusable prompt template
* Map the ecosystem: Agent invokes Skill for knowledge → Instructions apply always → Prompts are templates
* Screenshot placeholder: `lab-02-domain-diagram.png`

Exercise 2.4: Understand Handoff Patterns
* Explain: A11yDetector finds issues → offers handoff → A11yResolver applies fixes
* Explain: CodeQualityDetector finds gaps → offers handoff → TestGenerator writes tests
* Screenshot placeholder: `lab-02-handoff-pattern.png`

**Verification checkpoint:** Student can explain the difference between agents, skills, instructions, and prompts. Student can identify orchestrator and detector/resolver patterns.

Files:
* `labs/lab-02.md` — Lab 02 content

Success criteria:
* All four artifact types explained with concrete file examples
* 3 screenshot placeholders
* Two design patterns documented (orchestrator, detector/resolver)

### Step 2.6: Create images/ subdirectories and placeholders for Labs 00–02

Create placeholder README files in each image directory explaining the screenshot to capture.

Files:
* `images/lab-00/README.md` — Lists 3 screenshots to capture
* `images/lab-01/README.md` — Lists 4 screenshots to capture
* `images/lab-02/README.md` — Lists 3 screenshots to capture

Screenshot inventory for Labs 00–02 (10 total):

| Lab | File | Description |
|-----|------|-------------|
| 00 | `lab-00-vscode-extensions.png` | VS Code extensions panel with 4 required extensions installed |
| 00 | `lab-00-copilot-chat-verify.png` | Copilot Chat panel showing successful agent list |
| 00 | `lab-00-node-version.png` | Terminal showing Node.js v20+ version |
| 01 | `lab-01-template-create.png` | GitHub "Use this template" dialog |
| 01 | `lab-01-folder-structure.png` | VS Code explorer showing repo directory tree |
| 01 | `lab-01-issue-markers.png` | Code editor showing intentional vulnerability |
| 01 | `lab-01-app-running.png` | Browser showing sample app at localhost:3000 |
| 02 | `lab-02-agent-file-frontmatter.png` | Agent file with YAML frontmatter highlighted |
| 02 | `lab-02-domain-diagram.png` | Diagram showing agents/skills/instructions/prompts |
| 02 | `lab-02-handoff-pattern.png` | Detector → Resolver handoff in Copilot Chat |

Success criteria:
* README.md in each images/lab-NN/ directory
* Matches screenshot inventory from research

### Step 2.7: Commit, push, create PR, merge

```bash
git add -A
git commit -m "feat: add foundation labs 00-02 AB#{work-item-id}"
git push -u origin feature/{work-item-id}-foundation-labs
```

Create PR targeting `main` with `Fixes AB#{work-item-id}`.
After merge, delete feature branch (local and remote).

Success criteria:
* PR merged, branch cleaned up

## Implementation Phase 3: Agent Scanning Labs (Labs 03–05)

<!-- parallelizable: true -->

### Step 3.1: Create ADO User Story "Write agent scanning labs (03-05)"

Create a User Story for the scanning labs.

Fields:
* Title: `Write agent scanning labs 03-05 (Security, A11y, Code Quality)`
* Description: `As a workshop student, I want hands-on labs running Copilot agents so that I can see how AI-powered scanning finds real vulnerabilities.`
* Tags: `Agentic AI`
* Parent: Feature from Step 1.2

Success criteria:
* User Story in ADO with work item ID

### Step 3.2: Create feature branch for scanning labs

```bash
git checkout main
git pull origin main
git checkout -b feature/{work-item-id}-scanning-labs
```

Success criteria:
* Branch created from latest `main`

Dependencies:
* Phase 2 merged to `main`

### Step 3.3: Write Lab 03 — Security Scanning with Copilot Agents (40 min, Intermediate)

Create `labs/lab-03.md`.

**Lab structure:**
* Duration: 40 minutes | Level: Intermediate
* Prerequisites: Labs 00–02
* Learning Objectives:
  * Run the security-reviewer-agent to find OWASP Top 10 vulnerabilities
  * Run the iac-security-agent to find infrastructure misconfigurations
  * Run the supply-chain-security-agent to find dependency risks
  * Interpret security findings with CWE IDs and severity levels

**Exercises:**

Exercise 3.1: Source Code Security Scanning
* Open Copilot Chat
* Type: `@security-reviewer-agent Scan sample-app/src/ for OWASP Top 10 vulnerabilities. Report findings with CWE IDs and severity.`
* Review findings: SQL injection (CWE-89), XSS (CWE-79), hardcoded secrets, weak crypto (CWE-328)
* Screenshot placeholder: `lab-03-security-agent-findings.png`

Exercise 3.2: Infrastructure Security Scanning
* Type: `@iac-security-agent Scan sample-app/infra/main.bicep for security misconfigurations`
* Review IaC findings: public blob access, TLS 1.0 allowed, overly permissive firewall
* Screenshot placeholder: `lab-03-iac-scan.png`

Exercise 3.3: Supply Chain Security
* Type: `@supply-chain-security-agent Analyze sample-app/package.json for dependency vulnerabilities and license risks`
* Review: dependency vulnerabilities, missing lockfile integrity
* Screenshot placeholder: `lab-03-supply-chain.png`

Exercise 3.4: Compare Findings
* Open `sample-app/README.md` intentional issues table (or reference Lab 01 discoveries)
* Compare agent findings against known issues
* Discuss: What did the agents find that you missed? What did you find that agents missed?
* Screenshot placeholder: `lab-03-comparison.png`

**Verification checkpoint:** Security agents found ≥5 vulnerabilities with CWE IDs.

Files:
* `labs/lab-03.md` — Lab 03 content

Context references:
* Research document — Sample App Intentional Issues table (18+ security issues)
* Research document — Agent invocation examples

Success criteria:
* All 3 security agents covered (reviewer, IaC, supply chain)
* 4 screenshot placeholders
* Verification: ≥5 vulnerabilities found

### Step 3.4: Write Lab 04 — Accessibility Scanning with Copilot Agents (35 min, Intermediate)

Create `labs/lab-04.md`.

**Lab structure:**
* Duration: 35 minutes | Level: Intermediate
* Prerequisites: Labs 00–02
* Learning Objectives:
  * Run the a11y-detector to find WCAG 2.2 Level AA violations
  * Use the a11y-scan prompt template for targeted scanning
  * Try the a11y-resolver handoff for automated fixes
  * Understand WCAG success criteria references

**Exercises:**

Exercise 4.1: Full Accessibility Scan
* Type: `@a11y-detector Scan sample-app/src/ for WCAG 2.2 Level AA violations`
* Review findings: missing lang attribute, low contrast, missing form labels, small touch targets
* Screenshot placeholder: `lab-04-a11y-findings.png`

Exercise 4.2: Targeted Component Scan with Prompt File
* Type: `/a11y-scan component=sample-app/src/app/page.tsx`
* Compare to the full scan — targeted scan focuses on one component
* Screenshot placeholder: `lab-04-prompt-file.png`

Exercise 4.3: Handoff to Resolver
* From detector output, try: `@a11y-resolver Fix the missing lang attribute in sample-app/src/app/layout.tsx`
* Review proposed fix — resolver should add `lang="en"` to the `<html>` tag
* Screenshot placeholder: `lab-04-resolver-handoff.png`

Exercise 4.4: WCAG Reference
* For each finding, note the WCAG success criterion (e.g., 3.1.1 Language of Page, 1.4.3 Contrast)
* Discuss: Why accessibility matters for compliance and user experience
* Screenshot placeholder: `lab-04-wcag-criteria.png`

**Verification checkpoint:** Detector found ≥5 WCAG violations, Resolver proposed ≥2 fixes.

Files:
* `labs/lab-04.md` — Lab 04 content

Context references:
* Research document — 8+ accessibility issues in sample app
* Research document — Detector/Resolver handoff pattern

Success criteria:
* Both detector and resolver covered
* Prompt file usage demonstrated
* 4 screenshot placeholders
* WCAG success criteria referenced

### Step 3.5: Write Lab 05 — Code Quality Analysis with Copilot Agents (35 min, Intermediate)

Create `labs/lab-05.md`.

**Lab structure:**
* Duration: 35 minutes | Level: Intermediate
* Prerequisites: Labs 00–02
* Learning Objectives:
  * Run test coverage and understand the coverage gap
  * Run the code-quality-detector to find quality issues
  * Use the test-generator to create tests for uncovered code
  * Observe coverage improvement after applying generated tests

**Exercises:**

Exercise 5.1: Measure Current Coverage
* `cd sample-app && npm test -- --coverage`
* Observe: ~5% coverage (only placeholder test)
* Screenshot placeholder: `lab-05-coverage-before.png`

Exercise 5.2: Code Quality Detection
* Type: `@code-quality-detector Analyze sample-app/ for code quality issues including coverage, complexity, and maintainability`
* Review findings: low coverage, high complexity in utils.ts, `any` types, code duplication
* Screenshot placeholder: `lab-05-quality-findings.png`

Exercise 5.3: Generate Tests
* Type: `@test-generator Generate unit tests for sample-app/src/lib/utils.ts to improve coverage`
* Review generated test file
* Screenshot placeholder: `lab-05-test-generator.png`

Exercise 5.4: Apply Tests and Re-measure (Optional)
* Copy generated tests to `sample-app/__tests__/utils.test.ts`
* Run: `npm test -- --coverage`
* Observe improved coverage percentage
* Screenshot placeholder: `lab-05-coverage-after.png`

**Verification checkpoint:** CodeQualityDetector identified low coverage, TestGenerator produced tests for utils.ts.

Files:
* `labs/lab-05.md` — Lab 05 content

Success criteria:
* Coverage before/after demonstrated
* Both detector and test generator covered
* 4 screenshot placeholders

### Step 3.6: Create images/ subdirectories and placeholders for Labs 03–05

Screenshot inventory for Labs 03–05 (12 total):

| Lab | File | Description |
|-----|------|-------------|
| 03 | `lab-03-security-agent-findings.png` | Security reviewer agent output in Copilot Chat |
| 03 | `lab-03-iac-scan.png` | IaC security agent findings for main.bicep |
| 03 | `lab-03-supply-chain.png` | Supply chain agent findings |
| 03 | `lab-03-comparison.png` | Findings compared to known issues |
| 04 | `lab-04-a11y-findings.png` | Accessibility detector full scan output |
| 04 | `lab-04-prompt-file.png` | a11y-scan prompt file targeted scan |
| 04 | `lab-04-resolver-handoff.png` | A11y resolver applying fix |
| 04 | `lab-04-wcag-criteria.png` | WCAG success criteria references |
| 05 | `lab-05-coverage-before.png` | Terminal showing ~5% test coverage |
| 05 | `lab-05-quality-findings.png` | Code quality detector findings |
| 05 | `lab-05-test-generator.png` | Test generator output for utils.ts |
| 05 | `lab-05-coverage-after.png` | Terminal showing improved coverage |

Files:
* `images/lab-03/README.md`, `images/lab-04/README.md`, `images/lab-05/README.md`

Success criteria:
* README in each directory listing screenshots to capture

### Step 3.7: Commit, push, create PR, merge

```bash
git add -A
git commit -m "feat: add agent scanning labs 03-05 AB#{work-item-id}"
git push -u origin feature/{work-item-id}-scanning-labs
```

Create PR, merge, delete branch.

## Implementation Phase 4: SARIF and CI/CD Labs (Labs 06–08)

<!-- parallelizable: false -->

### Step 4.1: Create ADO User Story "Write SARIF and CI/CD labs (06-08)"

Fields:
* Title: `Write SARIF and CI/CD integration labs 06-08`
* Description: `As a workshop student, I want to understand SARIF output and set up GitHub Actions pipelines so that I can automate agent scanning and view results in the GitHub Security tab.`
* Tags: `Agentic AI`
* Parent: Feature from Step 1.2

Success criteria:
* User Story in ADO

### Step 4.2: Create feature branch for CI/CD labs

```bash
git checkout main
git pull origin main
git checkout -b feature/{work-item-id}-cicd-labs
```

Dependencies:
* Phase 3 merged (Labs 03–05 exist for SARIF reference)

### Step 4.3: Write Lab 06 — Understanding SARIF Output (30 min, Intermediate)

Create `labs/lab-06.md`.

**Lab structure:**
* Duration: 30 minutes | Level: Intermediate
* Prerequisites: At least one of Labs 03, 04, or 05 completed
* Learning Objectives:
  * Understand the SARIF v2.1.0 JSON structure
  * Navigate SARIF findings using the SARIF Viewer extension
  * Understand category prefixes and severity mapping
  * Connect SARIF output to GitHub Security tab ingestion

**Exercises:**

Exercise 6.1: Examine Raw SARIF
* Open `validation-results.sarif` from the repo root
* Identify key SARIF fields: `$schema`, `version`, `runs[]`, `tool.driver`, `results[]`
* Find: `automationDetails.id`, `partialFingerprints`, `level`, `ruleId`
* Screenshot placeholder: `lab-06-sarif-raw.png`

Exercise 6.2: Use SARIF Viewer Extension
* Right-click `validation-results.sarif` → "Open with SARIF Viewer"
* Navigate the findings tree — click to jump to source code
* Screenshot placeholder: `lab-06-sarif-viewer.png`
* Screenshot placeholder: `lab-06-navigate-source.png`

Exercise 6.3: SARIF Category Prefixes
* Explain the category prefix system:
  * `security/` → Security domain
  * `accessibility-scan/` → Accessibility domain
  * `code-quality/coverage/` → Code quality domain
  * `finops-finding/v1` → FinOps domain
* Explain severity mapping: `error` = CRITICAL/HIGH, `warning` = MEDIUM, `note` = LOW
* Screenshot placeholder: `lab-06-category-diagram.png`

Exercise 6.4: How GitHub Ingests SARIF
* Explain: GitHub Actions `upload-sarif` step → GitHub Code Scanning → Security tab
* Preview what Labs 07–08 will demonstrate

**Verification checkpoint:** Student can identify the 5 key SARIF fields and explain the category prefix system.

Files:
* `labs/lab-06.md` — Lab 06 content

Success criteria:
* SARIF structure explained with specific field references
* SARIF Viewer extension usage shown
* 4 screenshot placeholders
* Category prefix table present

### Step 4.4: Write Lab 07 — Setting Up GitHub Actions Pipelines (40 min, Intermediate)

Create `labs/lab-07.md`.

**Lab structure:**
* Duration: 40 minutes | Level: Intermediate
* Prerequisites: Labs 00–06
* Learning Objectives:
  * Understand the workshop GitHub Actions workflows
  * Enable GitHub Actions in your repository
  * Create a branch, make changes, and open a PR to trigger workflows
  * Monitor workflow execution in the Actions tab

**Exercises:**

Exercise 7.1: Review Workflow Files
* Open `.github/workflows/security-scan.yml`
* Identify: trigger events, job steps, SARIF upload action
* Review the other 3 workflows briefly
* Screenshot placeholder: `lab-07-workflow-files.png`

Exercise 7.2: Enable GitHub Actions
* Navigate to repo → Settings → Actions → General
* Ensure "Allow all actions and reusable workflows" is enabled
* Ensure "Read and write permissions" for GITHUB_TOKEN under Workflow permissions

Exercise 7.3: Trigger Workflows with a PR
* Create branch: `git checkout -b feature/test-pipeline`
* Edit `sample-app/src/app/page.tsx` — add a comment or change text
* Commit: `git commit -am "test: trigger pipeline scan"`
* Push: `git push -u origin feature/test-pipeline`
* Open PR in GitHub UI targeting `main`
* Screenshot placeholder: `lab-07-pr-created.png`

Exercise 7.4: Monitor Workflow Execution
* Navigate to repo → Actions tab
* Watch the triggered workflows run
* Click a workflow run to see job details and logs
* Screenshot placeholder: `lab-07-actions-running.png`
* Wait for completion
* Screenshot placeholder: `lab-07-actions-complete.png`

**Verification checkpoint:** ≥2 workflows triggered by PR, can see workflow logs in Actions tab.

Files:
* `labs/lab-07.md` — Lab 07 content

Success criteria:
* Step-by-step PR creation flow
* Actions tab navigation documented
* 4 screenshot placeholders
* workflow permissions guidance included

### Step 4.5: Write Lab 08 — Viewing Results in GitHub Security Tab (25 min, Intermediate)

Create `labs/lab-08.md`.

**Lab structure:**
* Duration: 25 minutes | Level: Intermediate
* Prerequisites: Lab 07 (workflows completed)
* Learning Objectives:
  * Navigate the GitHub Security tab
  * Filter Code Scanning alerts by tool, severity, and category
  * View finding details with source code location
  * Manage alerts (dismiss, create issues)

**Exercises:**

Exercise 8.1: Navigate to Security Tab
* Go to repo → Security tab → Code scanning alerts
* Screenshot placeholder: `lab-08-security-tab.png`

Exercise 8.2: Filter and Explore Alerts
* Filter by tool (e.g., SecurityReviewerAgent)
* Filter by severity (Error, Warning, Note)
* Filter by category prefix
* Screenshot placeholder: `lab-08-code-scanning.png`

Exercise 8.3: View Finding Details
* Click a finding to see detail view
* See: rule description, severity, file path, line number, code snippet
* Screenshot placeholder: `lab-08-finding-detail.png`

Exercise 8.4: Explore Dependabot Alerts
* Navigate to Security tab → Dependabot alerts
* Review any dependency vulnerability alerts
* Screenshot placeholder: `lab-08-dependabot.png`

Exercise 8.5: Manage Alerts
* Dismiss a finding as "Won't fix" or "False positive"
* Create a GitHub Issue from another finding
* Screenshot placeholder: `lab-08-alert-management.png`

**Verification checkpoint:** Student can navigate Security tab, filter by category, and view finding details.

Files:
* `labs/lab-08.md` — Lab 08 content

Success criteria:
* Security tab navigation documented step-by-step
* 5 screenshot placeholders
* Alert management exercise included

### Step 4.6: Create images/ subdirectories and placeholders for Labs 06–08

Screenshot inventory for Labs 06–08 (13 total):

| Lab | File | Description |
|-----|------|-------------|
| 06 | `lab-06-sarif-raw.png` | SARIF JSON file open in VS Code editor |
| 06 | `lab-06-sarif-viewer.png` | SARIF Viewer extension showing findings tree |
| 06 | `lab-06-navigate-source.png` | SARIF Viewer jumping to source code location |
| 06 | `lab-06-category-diagram.png` | Diagram of category prefixes and domains |
| 07 | `lab-07-workflow-files.png` | Workflow YAML file in VS Code |
| 07 | `lab-07-pr-created.png` | GitHub PR creation page |
| 07 | `lab-07-actions-running.png` | Actions tab showing running workflows |
| 07 | `lab-07-actions-complete.png` | Actions tab showing completed workflows |
| 08 | `lab-08-security-tab.png` | GitHub Security tab overview |
| 08 | `lab-08-code-scanning.png` | Code scanning alerts filtered view |
| 08 | `lab-08-finding-detail.png` | Individual finding detail page |
| 08 | `lab-08-dependabot.png` | Dependabot alerts page |
| 08 | `lab-08-alert-management.png` | Alert dismiss/issue creation dialog |

Files:
* `images/lab-06/README.md`, `images/lab-07/README.md`, `images/lab-08/README.md`

Success criteria:
* README in each directory listing screenshots to capture

### Step 4.7: Commit, push, create PR, merge

```bash
git add -A
git commit -m "feat: add SARIF and CI/CD labs 06-08 AB#{work-item-id}"
git push -u origin feature/{work-item-id}-cicd-labs
```

Create PR, merge, delete branch.

## Implementation Phase 5: Advanced Labs (Labs 09–11)

<!-- parallelizable: true -->

### Step 5.1: Create ADO User Story "Write advanced labs (09-11)"

Fields:
* Title: `Write advanced labs 09-11 (FinOps, Remediation, Custom Agent)`
* Description: `As a workshop student, I want advanced labs so that I can learn FinOps governance, agent remediation workflows, and custom agent authoring.`
* Tags: `Agentic AI`
* Parent: Feature from Step 1.2

Success criteria:
* User Story in ADO

### Step 5.2: Create feature branch for advanced labs

```bash
git checkout main
git pull origin main
git checkout -b feature/{work-item-id}-advanced-labs
```

Dependencies:
* Phase 4 merged (Labs 06–08 exist)

### Step 5.3: Write Lab 09 — FinOps Agents and Azure Cost Governance (45 min, Advanced)

Create `labs/lab-09.md`.

**Lab structure:**
* Duration: 45 minutes | Level: Advanced (Optional)
* Prerequisites: Labs 00–02 + Azure subscription with Cost Management Reader role
* Learning Objectives:
  * Run the cost-analysis-agent to estimate IaC deployment costs
  * Use the finops-governance-agent to check tag compliance
  * Use the deployment-cost-gate-agent for budget enforcement
  * Understand right-sizing recommendations

**Exercises:**

Exercise 9.1: Cost Analysis
* Type: `@cost-analysis-agent Analyze sample-app/infra/main.bicep for estimated monthly costs`
* Review: P1v3 App Service ($420/mo), GP_Gen5_8 database ($800/mo), Premium storage
* Discuss: Total ~$1,270/mo for a sample app
* Screenshot placeholder: `lab-09-cost-analysis.png`

Exercise 9.2: Tag Governance
* Type: `@finops-governance-agent Check sample-app/infra/main.bicep for tag compliance`
* Review: Missing `costCenter`, `environment`, `owner` tags
* Screenshot placeholder: `lab-09-tag-governance.png`

Exercise 9.3: Cost Gate
* Type: `@deployment-cost-gate-agent Evaluate sample-app/infra/ against a $100/month budget`
* Review: Budget exceeded by ~$1,170/mo
* Screenshot placeholder: `lab-09-cost-gate.png`

Exercise 9.4: Right-Sizing (Optional)
* Open `sample-app/infra/variables.bicep`
* Change `appServicePlanSku` from `P1v3` to `B1`
* Change `sqlServerSku` from `GP_Gen5_8` to `Basic`
* Re-run cost analysis agent to see reduced estimate (~$30/mo)
* Screenshot placeholder: `lab-09-right-sized.png`

**Verification checkpoint:** Cost analysis found ≥3 optimization opportunities, cost gate identified budget breach.

Files:
* `labs/lab-09.md` — Lab 09 content

Discrepancy references:
* DR-01: FinOps agents require Azure subscription — lab marked as optional with clear prerequisites

Success criteria:
* Azure prerequisite clearly stated as optional
* All 3 FinOps agents demonstrated
* 4 screenshot placeholders

### Step 5.4: Write Lab 10 — Agent Remediation Workflows (45 min, Advanced)

Create `labs/lab-10.md`.

**Lab structure:**
* Duration: 45 minutes | Level: Advanced
* Prerequisites: Labs 03, 04, or 05 (at least one scanning lab)
* Learning Objectives:
  * Complete a full Detect → Fix → Verify cycle for security
  * Complete a full Detect → Fix → Verify cycle for accessibility
  * Complete a full Detect → Fix → Verify cycle for code quality
  * Understand the remediation feedback loop

**Exercises:**

Exercise 10.1: Security Remediation Cycle
* Scan: `@security-reviewer-agent Scan sample-app/src/lib/auth.ts`
* Find: MD5 hashing vulnerability (CWE-328)
* Fix: Replace `md5` with `bcrypt` or `argon2` (with agent guidance)
* Re-scan: Verify the finding is resolved
* Screenshot placeholder: `lab-10-security-fix.png`

Exercise 10.2: Accessibility Remediation Cycle
* Scan: `@a11y-detector Scan sample-app/src/app/layout.tsx`
* Find: Missing `lang` attribute on `<html>` tag
* Fix: `@a11y-resolver Fix the missing lang attribute in layout.tsx`
* Re-scan: Verify the violation is resolved
* Screenshot placeholder: `lab-10-a11y-fix.png`

Exercise 10.3: Code Quality Remediation Cycle
* Scan: `@code-quality-detector Analyze sample-app/src/lib/utils.ts`
* Find: No tests, high complexity
* Fix: `@test-generator Generate tests for utils.ts`
* Apply generated tests and run: `npm test -- --coverage`
* Screenshot placeholder: `lab-10-test-fix.png`

Exercise 10.4: Commit Fixes
* Stage all remediation changes
* Commit with descriptive message: `fix: remediate security and a11y issues`
* Discuss: How remediation fits into the PR workflow
* Screenshot placeholder: `lab-10-coverage-comparison.png`

**Verification checkpoint:** Completed ≥1 full Detect → Fix → Verify cycle.

Files:
* `labs/lab-10.md` — Lab 10 content

Success criteria:
* Three remediation cycles documented (one per domain)
* 4 screenshot placeholders

### Step 5.5: Write Lab 11 — Creating Your Own Custom Agent (45 min, Advanced)

Create `labs/lab-11.md`.

**Lab structure:**
* Duration: 45 minutes | Level: Advanced
* Prerequisites: Labs 00–08
* Learning Objectives:
  * Design a custom agent for a new domain
  * Write agent YAML frontmatter following framework conventions
  * Write the agent persona, scope, and output format
  * Test the custom agent in Copilot Chat
  * (Optional) Create a companion skill file

**Exercises:**

Exercise 11.1: Choose a Domain
* Suggest domains: performance analysis, documentation quality, licensing compliance, API security
* Student selects one domain for their custom agent

Exercise 11.2: Create Agent File
* Create `agents/my-custom-agent.agent.md`
* Write YAML frontmatter:
  * `name`, `description`, `tools`
* Write body sections:
  * Agent Persona and Role
  * Scope (what to scan/analyze)
  * Detection Protocol (how to find issues)
  * Output Format (SARIF structure)
  * Severity Classification
* Reference existing agents as templates
* Screenshot placeholder: `lab-11-agent-file.png`

Exercise 11.3: Test Your Agent
* Open Copilot Chat
* Type: `@my-custom-agent Analyze sample-app/src/ for [domain] issues`
* Iterate on the agent definition for better output quality
* Screenshot placeholder: `lab-11-agent-test.png`

Exercise 11.4: (Optional) Create Companion Skill
* Create `skills/my-custom-scan/SKILL.md`
* Add domain knowledge that the agent references
* Re-test: Agent output should be more domain-aware
* Screenshot placeholder: `lab-11-agent-output.png`

**Verification checkpoint:** Custom agent responds with structured output when invoked in Copilot Chat.

Files:
* `labs/lab-11.md` — Lab 11 content

Success criteria:
* Complete agent authoring workflow documented
* YAML frontmatter example provided
* 3 screenshot placeholders

### Step 5.6: Create images/ subdirectories and placeholders for Labs 09–11

Screenshot inventory for Labs 09–11 (11 total):

| Lab | File | Description |
|-----|------|-------------|
| 09 | `lab-09-cost-analysis.png` | Cost analysis agent output |
| 09 | `lab-09-tag-governance.png` | Tag governance findings |
| 09 | `lab-09-cost-gate.png` | Cost gate budget evaluation |
| 09 | `lab-09-right-sized.png` | Right-sized cost re-analysis |
| 10 | `lab-10-security-fix.png` | Security fix applied |
| 10 | `lab-10-a11y-fix.png` | Accessibility fix applied |
| 10 | `lab-10-test-fix.png` | Test generation and coverage |
| 10 | `lab-10-coverage-comparison.png` | Before/after coverage |
| 11 | `lab-11-agent-file.png` | Custom agent file in editor |
| 11 | `lab-11-agent-test.png` | Custom agent invocation in Chat |
| 11 | `lab-11-agent-output.png` | Custom agent structured output |

Files:
* `images/lab-09/README.md`, `images/lab-10/README.md`, `images/lab-11/README.md`

Success criteria:
* README in each directory listing screenshots to capture

### Step 5.7: Commit, push, create PR, merge

```bash
git add -A
git commit -m "feat: add advanced labs 09-11 AB#{work-item-id}"
git push -u origin feature/{work-item-id}-advanced-labs
```

Create PR, merge, delete branch.

## Implementation Phase 6: Repository Configuration and Polish

<!-- parallelizable: false -->

### Step 6.1: Create ADO User Story "Configure repository and enable template"

Fields:
* Title: `Configure workshop repo as template with Pages and Copilot config`
* Tags: `Agentic AI`
* Parent: Feature from Step 1.2

### Step 6.2: Mark repository as Template Repository in GitHub settings

Navigate to `devopsabcs-engineering/agentic-devsecops-workshop` → Settings → General.

* Check "Template repository" checkbox
* Verify "Use this template" button appears on repo home page

Success criteria:
* "Use this template" button visible on the repo page

### Step 6.3: Enable GitHub Pages with Jekyll theme

Navigate to Settings → Pages.

* Source: Deploy from a branch
* Branch: `main` / `/ (root)`
* Theme applied via `_config.yml` (created in Phase 1)

Verify the Pages URL renders the README and lab links.

Files:
* Verify `_config.yml` exists from Phase 1

Success criteria:
* GitHub Pages published and accessible
* Lab links work from the rendered Pages site

### Step 6.4: Add .copilot-instructions.md for workshop context

Create a `.github/copilot-instructions.md` tailored to the workshop repo.

Content should include:
* Workshop purpose statement
* Note that sample-app contains intentional vulnerabilities for learning
* SARIF output standard reference (same as framework)
* Instructions for agents to be helpful for learning
* No org-specific deployment or operational references

Files:
* `.github/copilot-instructions.md` — Workshop-specific Copilot instructions

Success criteria:
* Workshop-appropriate Copilot instructions in place
* No references to framework-specific operational tooling

### Step 6.5: (Optional) Add devcontainer.json for Codespaces

Create `.devcontainer/devcontainer.json` for zero-install Codespaces experience.

```json
{
  "name": "Agentic DevSecOps Workshop",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "github.copilot",
        "github.copilot-chat",
        "MS-SarifVSCode.sarif-viewer",
        "dbaeumer.vscode-eslint"
      ]
    }
  },
  "postCreateCommand": "cd sample-app && npm install"
}
```

Files:
* `.devcontainer/devcontainer.json` — Codespaces configuration

Success criteria:
* Codespace launches with all required extensions pre-installed
* `npm install` runs automatically in sample-app

## Implementation Phase 7: Validation

<!-- parallelizable: false -->

### Step 7.1: Test complete student journey end-to-end

Create a new repo from the template using "Use this template" under a test account or personal account.
Walk through Labs 00–08 as a student.
Verify all agent invocation commands work in Copilot Chat.
Verify GitHub Actions trigger on PR and SARIF uploads appear in Security tab.

### Step 7.2: Capture real screenshots during test walkthrough

Replace placeholder images with actual screenshots captured during Step 7.1.
Verify all image paths resolve correctly in rendered markdown.
Resize screenshots to consistent width (e.g., 800px or 1200px max).

### Step 7.3: Review all labs for consistency

Verify lab numbering and cross-references are correct.
Verify time estimates are realistic based on the test walkthrough.
Check all prerequisite chains match the lab dependency diagram.
Verify markdown formatting and heading structure.

### Step 7.4: Fix minor validation issues

Iterate on broken links, typos, formatting inconsistencies.
Apply fixes directly when corrections are straightforward and isolated.

### Step 7.5: Report blocking issues

When validation failures require changes beyond minor fixes:
* Document the issues and affected files.
* Provide next steps for resolution.
* Recommend additional research and planning if needed.

## Dependencies

* Git, GitHub CLI, Node.js v20+
* VS Code with GitHub Copilot extensions
* ADO access to `MngEnvMCAP675646` / `Agentic DevSecOps Framework`
* GitHub admin access to `devopsabcs-engineering/agentic-devsecops-workshop`
* Framework repo at `c:\src\GitHub\devopsabcs-engineering\agentic-devsecops-framework`

## Success Criteria

* 12 lab files in `labs/` with consistent structure and formatting
* 46 screenshot placeholders organized in `images/` directories
* 4 adapted GitHub Actions workflows
* Repository marked as template on GitHub
* Full student journey tested end-to-end
