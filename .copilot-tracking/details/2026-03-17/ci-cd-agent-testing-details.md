<!-- markdownlint-disable-file -->
# Implementation Details: CI/CD Automation for Agent Testing & Deployment

## Context Reference

Sources: `.copilot-tracking/research/2026-03-17/ci-cd-agent-testing-research.md`, `.copilot-tracking/research/subagents/2026-03-17/repo-structure-research.md`, `.copilot-tracking/research/subagents/2026-03-17/agent-testing-research.md`, `.copilot-tracking/research/subagents/2026-03-17/github-private-deployment-research.md`

## Implementation Phase 1: Fix Broken Existing Workflows

<!-- parallelizable: true -->

### Step 1.1: Fix `security-scan.yml` — Replace job-level `hashFiles()` with step-level file existence check

The `container` job at line 93 uses `if: hashFiles('**/Dockerfile') != ''` at the job level, which is evaluated before the runner starts — `hashFiles()` is unavailable there.

**Fix:** Remove the job-level `if:` condition. Add a step after checkout to check for Dockerfile existence, then gate all subsequent steps with `if: steps.check.outputs.found == 'true'`.

Files:
* `.github/workflows/security-scan.yml` — Replace `container` job `if:` condition (line 93) with step-level approach

Discrepancy references:
* Addresses DR-01 (security-scan.yml invalid workflow)

Success criteria:
* `container` job no longer uses `hashFiles()` at job level
* Job starts unconditionally, early step checks for Dockerfile
* Subsequent steps (build, trivy scan, SARIF upload) gated on `steps.check.outputs.found == 'true'`
* Workflow passes GitHub Actions YAML validation

Context references:
* Research document (Lines 66-110) — Root cause analysis and fix pattern
* `.github/workflows/security-scan.yml` (Line 93) — Current invalid condition

Dependencies:
* None — independent fix

### Step 1.2: Fix `finops-cost-gate.yml` — Remove redundant job-level `hashFiles()` check

The `cost-estimate` job at lines 24-26 uses `hashFiles()` in a job-level `if:` condition. The workflow already has `paths:` trigger filters (`**/*.tf`, `**/*.bicep`, `**/*.json`) that ensure it only runs when IaC files change — the `hashFiles()` check is redundant.

**Fix:** Remove the job-level `if:` condition entirely. The workflow-level `paths:` filter already provides the gating.

Files:
* `.github/workflows/finops-cost-gate.yml` — Remove `if:` block at lines 24-26

Discrepancy references:
* Addresses DR-02 (finops-cost-gate.yml invalid workflow)

Success criteria:
* `cost-estimate` job no longer uses `hashFiles()` at job level
* Workflow passes GitHub Actions YAML validation
* Behavior unchanged — workflow still only triggers on IaC file changes via `paths:` filter

Context references:
* Research document (Lines 112-150) — Root cause analysis and fix options
* `.github/workflows/finops-cost-gate.yml` (Lines 24-26) — Current invalid condition

Dependencies:
* None — independent fix

### Step 1.3: Fix `code-quality.yml` — Add `defaults.run.working-directory: sample-app`

The workflow runs `npm ci`, `npm run lint`, `npx tsc --noEmit`, and `npm run test:ci` at the repo root, but `package.json` is in `sample-app/`. All three jobs fail immediately.

**Fix:** Add `defaults: run: working-directory: sample-app` at the workflow level (or per-job). This ensures all `run:` steps execute within `sample-app/`.

Files:
* `.github/workflows/code-quality.yml` — Add working directory default

Success criteria:
* All `npm` and `npx` commands execute within `sample-app/` directory
* Lint, type-check, and test jobs find `package.json` and `node_modules/`
* Coverage SARIF upload path references `sample-app/coverage/`

Context references:
* Subagent `repo-structure-research.md` §1.3 — code-quality.yml gap analysis
* Research document §Additional Gaps #3 — working directory mismatch

Dependencies:
* Step 2.1 (package-lock.json) must be committed for `npm ci` to succeed

### Step 1.4: Validate all fixed workflows pass schema check

Run YAML schema validation or `actionlint` against the three modified workflow files to confirm they pass validation.

Validation commands:
* `actionlint .github/workflows/security-scan.yml` (if installed)
* `actionlint .github/workflows/finops-cost-gate.yml`
* `actionlint .github/workflows/code-quality.yml`
* Alternative: push to a branch and verify GitHub Actions does not reject the workflow files

## Implementation Phase 2: Sample-App Test Infrastructure

<!-- parallelizable: true -->

### Step 2.1: Generate and commit `sample-app/package-lock.json`

`npm ci` (used in CI workflows) requires a `package-lock.json`. Without it, the command fails immediately.

**Action:** Run `cd sample-app && npm install --package-lock-only` to generate the lockfile without installing `node_modules/`.

Files:
* `sample-app/package-lock.json` — New file, generated from `package.json`

Success criteria:
* `package-lock.json` exists in `sample-app/`
* `npm ci` succeeds in `sample-app/` using the committed lockfile
* File is committed to version control

Context references:
* Research document §Additional Gaps #4 — no lockfile committed
* `sample-app/package.json` — 12 dependencies + 10 devDependencies

Dependencies:
* Node.js 20+ and npm installed locally

### Step 2.2: Create `sample-app/jest.config.ts`

Jest needs configuration for:
- `jsdom` test environment (React component testing)
- `@/` module alias resolution (matches `tsconfig.json` paths)
- Coverage thresholds and directories
- Transform rules for TypeScript

**Configuration:**

```typescript
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}',
  ],
};

export default createJestConfig(config);
```

Files:
* `sample-app/jest.config.ts` — New file

Success criteria:
* `npm test` resolves `@/` imports
* Tests run in `jsdom` environment
* Coverage output to `sample-app/coverage/` with `json-summary` reporter (needed for CI coverage gate)

Context references:
* Research document §Additional Gaps #5 — no Jest config
* `sample-app/tsconfig.json` — path alias definition
* `sample-app/__tests__/placeholder.test.ts` — existing test importing from `../src/lib/utils`

Dependencies:
* Step 2.1 (package-lock.json) completed first for dependency resolution

### Step 2.3: Create `sample-app/.eslintrc.json`

`next lint` requires an ESLint configuration file. Without one, it prompts interactively and fails in CI.

**Action:** Create `sample-app/.eslintrc.json`:

```json
{
  "extends": "next/core-web-vitals"
}
```

Files:
* `sample-app/.eslintrc.json` — New file

Success criteria:
* `npm run lint` executes without interactive prompt in CI
* ESLint checks Next.js core-web-vitals rules

Context references:
* Research document §Additional Gaps — lint step dependency
* `sample-app/package.json` — `lint` script runs `next lint`

Dependencies:
* None

### Step 2.4: Verify sample-app commands execute locally

Run the three commands that the CI workflow will execute:

```bash
cd sample-app
npm ci
npm run lint
npx tsc --noEmit
npm test
```

**Expected outcomes:**
- `npm ci` — succeeds with lockfile
- `npm run lint` — may produce warnings for intentional issues (not blocking)
- `npx tsc --noEmit` — may produce type errors for intentional `any` types (document in summary)
- `npm test` — 3 passing tests, low coverage (~5%), known intentional test gap

Files:
* No file changes — validation step only

Success criteria:
* All commands execute without infrastructure errors (missing files, module resolution failures)
* Failures are only from intentional issues, not missing configuration

Dependencies:
* Steps 2.1 and 2.2 completed

## Implementation Phase 3: Agent Validation Script

<!-- parallelizable: false -->

### Step 3.1: Create `scripts/validate-agents.mjs` — Tier 1 structural validation

Core validation script implementing frontmatter parsing and schema validation for all agent file types.

**Architecture:**
- ESM module (`.mjs`) for native `import` support in Node.js 20+
- `gray-matter` for YAML frontmatter extraction
- Pure JavaScript schema validation (no `ajv` dependency — simpler for the number of schemas)
- Exit code 1 on any blocking error

**Functions:**

1. `loadInventory()` — Discover all `.agent.md`, `.instructions.md`, `.prompt.md`, and `SKILL.md` files using `fs.readdirSync` with recursive option
2. `validateAgentFrontmatter(filePath)` — Parse frontmatter, check required fields (`name`, `description`, `tools`), validate `tools` format (`category/name`), validate `handoffs` schema (`label` + `agent` required), warn if `model` missing
3. `validateInstructionFrontmatter(filePath)` — Check required fields (`description`, `applyTo`), validate `applyTo` is valid glob syntax
4. `validatePromptFrontmatter(filePath)` — Check required fields (`description`, `agent`), validate `agent` references existing agent
5. `validateSkillFrontmatter(filePath)` — Check directory contains `SKILL.md`, validate has name/description

**Severity levels:**
- `error` — blocking, fails CI (missing required field, invalid schema)
- `warning` — non-blocking, reported (missing `model`, no `handoffs`)
- `info` — advisory (file count, validation summary)

Files:
* `scripts/validate-agents.mjs` — New file (~250 lines)

Success criteria:
* Parses all 15 agent files without errors
* Validates 3 instruction files, 2 prompt files, 2 skill files
* Reports 9 agents with missing `model` field as warnings
* Returns structured results object for report generation

Context references:
* Subagent `agent-testing-research.md` §Validation Taxonomy Layer 1 — Required fields and schema rules
* Subagent `agent-testing-research.md` §1 — Agent file format and YAML frontmatter fields table

Dependencies:
* `gray-matter` npm package
* `minimatch` npm package (used in Step 3.2)

### Step 3.2: Add Tier 2 cross-reference integrity checks

Add cross-file validation to `validate-agents.mjs`:

**Functions:**

6. `crossReferenceChecks(inventory)`:
   - All `handoffs[].agent` names → must match a `name` field in another `.agent.md`
   - All `.prompt.md` `agent` fields → must match an agent `name`
   - All `apm.yml` dependency `path` values → must resolve to existing files
   - All `.instructions.md` `applyTo` patterns → must match at least 1 file in repo (using `minimatch`)
   - No orphaned agents (every agent in `agents/` present in `apm.yml`)

**Cross-reference map from research:**

| Source | Reference | Target | Count |
|---|---|---|---|
| `handoffs[].agent` | Agent name | `*.agent.md` name field | 7 agents with handoffs |
| `.prompt.md` `agent` | Agent name | `*.agent.md` name field | 2 prompts |
| `apm.yml` `path` | File path | Filesystem | 22 paths |
| `.instructions.md` `applyTo` | Glob pattern | Repo files | 3 instructions |

Files:
* `scripts/validate-agents.mjs` — Extend with cross-reference functions

Success criteria:
* All 7 handoff targets resolve to existing agents
* Both prompt agent references resolve
* All 22 apm.yml paths resolve to existing files
* All 3 instruction applyTo patterns match at least 1 repo file
* 0 orphaned agents (all 15 in apm.yml)

Context references:
* Subagent `agent-testing-research.md` §Validation Taxonomy Layer 2 — Reference integrity tests
* Subagent `repo-structure-research.md` §2 — Agent domain/handoff mapping
* `apm.yml` — Full dependency manifest

Dependencies:
* Step 3.1 completed (inventory loaded, frontmatter parsed)

### Step 3.3: Add Tier 4 domain content validation

Add domain-specific content rules to `validate-agents.mjs`:

**Functions:**

7. `domainContentChecks(inventory)`:
   - Security agents (6) → body must mention `OWASP` or `CWE`
   - Accessibility agents (2) → body must mention `WCAG`
   - All agents → body should mention `SARIF` (warning if missing)
   - Severity mappings → consistent with `CRITICAL`/`HIGH`/`MEDIUM`/`LOW` (from copilot-instructions.md)

**Domain classification:**
- Security: SecurityAgent, SecurityReviewerAgent, SecurityPlanCreator, PipelineSecurityAgent, IaCSecurityAgent, SupplyChainSecurityAgent
- Accessibility: A11yDetector, A11yResolver
- Code Quality: CodeQualityDetector, TestGenerator
- FinOps: CostAnalysisAgent, CostAnomalyDetector, CostOptimizerAgent, DeploymentCostGateAgent, FinOpsGovernanceAgent

Files:
* `scripts/validate-agents.mjs` — Extend with domain content functions

Success criteria:
* All 6 security agents contain OWASP or CWE references
* Both a11y agents contain WCAG references
* All agents mention SARIF in body
* Domain classification matches the 4-domain inventory

Context references:
* Subagent `agent-testing-research.md` §Validation Taxonomy Layer 3 — Domain-specific rules
* `.github/copilot-instructions.md` — Severity classification table

Dependencies:
* Step 3.1 completed (inventory and frontmatter available)

### Step 3.4: Add report generation

Add output generation to `validate-agents.mjs`:

**Functions:**

8. `generateReport(results)`:
   - Console output — structured log with pass/fail per file and per check
   - JSON results file — `validation-results.json` for programmatic consumption
   - GitHub Actions Job Summary — Markdown table written to `$GITHUB_STEP_SUMMARY` env file

**Job Summary format:**

```markdown
## 🔬 Agent Validation Results

### Agent Inventory (15 agents)
| Domain | Agent | Frontmatter | Cross-Refs | Domain Rules | Status |
|---|---|---|---|---|---|
| Security | SecurityAgent | ✅ | ✅ | ✅ | PASS |
...

### Instruction Files (3)
| File | Description | applyTo | Status |
|---|---|---|---|
...

### Cross-Reference Integrity
| Check | Count | Status |
|---|---|---|
| Handoff targets resolved | 7/7 | ✅ |
| Prompt agent refs resolved | 2/2 | ✅ |
| apm.yml paths resolved | 22/22 | ✅ |
...

### Summary
- Total files validated: 22
- Errors: 0
- Warnings: N (model field missing)
```

Files:
* `scripts/validate-agents.mjs` — Extend with report generation

Success criteria:
* Console output shows per-file validation status
* JSON file written with structured results
* Markdown summary properly formatted for GitHub Actions Job Summary
* Exit code 0 when all blocking checks pass, exit code 1 when any error exists

Context references:
* Research document §GitHub Actions Job Summary Design — Full summary template
* GitHub docs — `$GITHUB_STEP_SUMMARY` file writing

Dependencies:
* Steps 3.1-3.3 completed (all validation data available)

### Step 3.5: Add `scripts/package.json` with dependencies

Create a minimal `package.json` for the validation script's dependencies.

```json
{
  "name": "agentic-devsecops-scripts",
  "private": true,
  "type": "module",
  "dependencies": {
    "gray-matter": "^4.0.3",
    "minimatch": "^9.0.0"
  }
}
```

Files:
* `scripts/package.json` — New file
* `scripts/package-lock.json` — New file, generated via `npm install --package-lock-only`

**Action:** After creating `package.json`, run:
```bash
cd scripts && npm install --package-lock-only
```
Commit both `package.json` and `package-lock.json`.

Success criteria:
* `cd scripts && npm ci` succeeds (CI uses `npm ci`, not `npm install`)
* `node validate-agents.mjs` resolves `gray-matter` and `minimatch` imports

Context references:
* Subagent `agent-testing-research.md` §Tier 1 — Technology options (gray-matter + minimatch)

Dependencies:
* None

### Step 3.6: Test script locally against all 22 items

Run the complete validation script against the repository:

```bash
cd scripts && npm install && node validate-agents.mjs
```

**Expected results:**
- 15 agents: all pass structural + cross-reference; 9 generate `model` missing warnings
- 3 instructions: all pass
- 2 prompts: all pass
- 2 skills: all pass
- Cross-references: all 22 apm.yml paths resolve, all handoffs resolve, all prompt refs resolve
- Domain content: all security agents have OWASP/CWE, all a11y agents have WCAG

Validation commands:
* `node scripts/validate-agents.mjs` — Full validation run

## Implementation Phase 4: CI Workflow — `ci-full-test.yml`

<!-- parallelizable: false -->

### Step 4.1: Create workflow file with triggers

Create `.github/workflows/ci-full-test.yml` with:

```yaml
name: CI Full Test
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  security-events: write
  contents: read
  actions: read
```

Trigger on both push and PR to `main`. Permissions include `security-events: write` for SARIF uploads and `actions: read` for job summary access.

Files:
* `.github/workflows/ci-full-test.yml` — New file

Success criteria:
* Workflow triggers on push to main and PRs targeting main
* Permissions are minimal and sufficient

Context references:
* Research document §Scenario B — Separate CI + CD workflow design
* `.github/workflows/security-scan.yml` — Reference pattern for triggers and permissions

Dependencies:
* None

### Step 4.2: Add `agent-validation` job

Job runs Tier 1+2+4 validation using the custom script:

```yaml
agent-validation:
  name: Agent Validation — Structure, Cross-Refs, Domain Rules
  runs-on: ubuntu-latest
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install validation dependencies
      working-directory: scripts
      run: npm ci

    - name: Run agent validation
      id: validate
      run: node scripts/validate-agents.mjs

    - name: Upload validation SARIF
      if: always()
      uses: github/codeql-action/upload-sarif@v4
      with:
        sarif_file: validation-results.sarif
        category: agent-validation/
```

Files:
* `.github/workflows/ci-full-test.yml` — Add agent-validation job

Success criteria:
* Job installs `gray-matter` and `minimatch` from `scripts/package.json`
* Runs validation script against all 22 files
* Uploads SARIF with `agent-validation/` category
* Job summary includes agent inventory table

Context references:
* Research document §CI Workflow Jobs — Job 1 design
* Subagent `agent-testing-research.md` §Recommended Testing Strategy Tier 1-2

Dependencies:
* Phase 3 (validation script) completed

### Step 4.3: Add `apm-security` job

Job runs APM Tier 3 audit:

```yaml
apm-security:
  name: APM — Agent Config Security Audit
  runs-on: ubuntu-latest
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Run APM audit
      uses: microsoft/apm-action@v1
      with:
        command: audit
        audit-report: true

    - name: Upload APM SARIF
      if: always()
      uses: github/codeql-action/upload-sarif@v4
      with:
        sarif_file: apm-audit.sarif
        category: apm-audit/
```

Files:
* `.github/workflows/ci-full-test.yml` — Add apm-security job

Success criteria:
* APM audit scans all agent configuration files for hidden Unicode / prompt injection
* SARIF report uploaded with `apm-audit/` category
* Job blocks on critical findings

Context references:
* `.github/workflows/apm-security.yml` — Existing APM workflow pattern (reference)
* Research document §APM Capabilities Summary — audit + audit-report modes
* Subagent `agent-testing-research.md` §3 — APM Action modes table

Dependencies:
* `microsoft/apm-action@v1` available in GitHub Actions marketplace

### Step 4.4: Add `sample-app-quality` job

Job runs lint, type-check, and tests for the sample app:

```yaml
sample-app-quality:
  name: Sample App — Lint, Type Check, Test
  runs-on: ubuntu-latest
  defaults:
    run:
      working-directory: sample-app
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: npm
        cache-dependency-path: sample-app/package-lock.json

    - name: Install dependencies
      run: npm ci

    - name: Lint
      run: npm run lint
      continue-on-error: true

    - name: Type check
      run: npx tsc --noEmit
      continue-on-error: true

    - name: Test with coverage
      run: npm run test:ci
      continue-on-error: true

    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: test-results
        path: |
          sample-app/junit.xml
          sample-app/coverage/
```

**Note:** `continue-on-error: true` on lint, type-check, and test because the sample app has intentional issues. The summary job will report actual results.

Files:
* `.github/workflows/ci-full-test.yml` — Add sample-app-quality job

Success criteria:
* `npm ci` succeeds with committed lockfile
* Lint, type-check, and test commands execute (may have expected failures from intentional issues)
* JUnit XML and coverage artifacts uploaded
* Job does not fail the workflow due to intentional issues

Context references:
* `sample-app/package.json` — Scripts: `lint`, `test:ci`
* Research document §CI Workflow Jobs — Job 3 design
* Subagent `repo-structure-research.md` §5 — Sample app stack and intentional issues

Dependencies:
* Phase 2 (sample-app infrastructure) completed — lockfile and jest.config exist

### Step 4.5: Add `summary` job

Job depends on all previous jobs and generates consolidated GitHub Actions Job Summary:

```yaml
summary:
  name: CI Summary
  runs-on: ubuntu-latest
  if: always()
  needs: [agent-validation, apm-security, sample-app-quality]
  steps:
    - name: Download artifacts
      uses: actions/download-artifact@v4
      continue-on-error: true

    - name: Generate summary
      run: |
        cat >> "$GITHUB_STEP_SUMMARY" << 'EOF'
        ## 🔬 CI Full Test Results
        ...consolidated markdown from job outputs...
        EOF
```

The summary step reads job outcomes from `needs` context and artifact data to produce the final markdown report.

Files:
* `.github/workflows/ci-full-test.yml` — Add summary job

Success criteria:
* Summary job runs even when previous jobs fail (`if: always()`)
* GitHub Actions Job Summary contains agent validation table, APM audit status, sample-app quality results
* Domain coverage matrix (Security: 6, Accessibility: 2, Code Quality: 2, FinOps: 5)

Context references:
* Research document §GitHub Actions Job Summary Design — Full template with agent inventory and domain table
* GitHub docs — `$GITHUB_STEP_SUMMARY` usage

Dependencies:
* All previous jobs in this phase provide outputs

## Implementation Phase 5: CD Workflow — `deploy-to-github-private.yml`

<!-- parallelizable: false -->

### Step 5.1: Create workflow file with triggers

Create `.github/workflows/deploy-to-github-private.yml`:

```yaml
name: Deploy Agent Config to .github-private

on:
  push:
    branches: [main]
    paths:
      - 'agents/**'
      - 'instructions/**'
      - 'prompts/**'
      - 'skills/**'
      - 'apm.yml'
      - 'mcp.json'
      - '.github/copilot-instructions.md'
  workflow_dispatch:

permissions:
  contents: read
```

Triggers only on push to `main` when agent config files change, plus manual dispatch.

Files:
* `.github/workflows/deploy-to-github-private.yml` — New file

Success criteria:
* Workflow triggers only when agent config paths change on main
* Manual trigger via `workflow_dispatch` available for rollbacks

Context references:
* Subagent `github-private-deployment-research.md` §3 — CD Workflow Design triggers
* Research document §CD Workflow Jobs — Trigger design

Dependencies:
* None

### Step 5.2: Add `deploy` job

Selective file sync of 25 files to `.github-private`:

**Steps:**
1. Checkout source repo
2. Generate GitHub App token via `actions/create-github-app-token@v1`
3. Checkout `devopsabcs-engineering/.github-private` using the app token
4. Sync directories: `agents/`, `instructions/`, `prompts/`, `skills/` (rsync --delete for mirror mode)
5. Sync individual files: `apm.yml`, `mcp.json`
6. Sync dotgithub: `.github/copilot-instructions.md`
7. SHA-256 integrity validation — compute hashes for all 25 files in source and target, compare
8. Commit and push to `.github-private` with message referencing source SHA
9. Tag source repo with deployment marker: `deploy/github-private/YYYYMMDD-HHMMSS-{run_number}`

**File manifest (25 files):**
- Agents: 15 files (`agents/*.agent.md`)
- Instructions: 3 files (`instructions/*.instructions.md`)
- Prompts: 2 files (`prompts/*.prompt.md`)
- Skills: 2 files (`skills/*/SKILL.md`)
- Config: 3 files (`apm.yml`, `mcp.json`, `.github/copilot-instructions.md`)

Files:
* `.github/workflows/deploy-to-github-private.yml` — Add deploy job

Discrepancy references:
* DD-01: GitHub App token approach assumes app exists — PAT fallback documented in planning log

Success criteria:
* All 25 files synced from source to target
* SHA-256 hashes match between source and target for all 25 files
* Commit in `.github-private` references source SHA
* Directories in target that should not receive files (sample-app/, docs/) are untouched

Context references:
* Subagent `github-private-deployment-research.md` §2 — Full file manifest
* Subagent `github-private-deployment-research.md` §3 — Sync strategy and auth options

Dependencies:
* GitHub App configured with `contents: write` on `.github-private` (deployment prerequisite)
* Secrets `DEPLOY_APP_ID` and `DEPLOY_APP_PRIVATE_KEY` configured in source repo

### Step 5.3: Add `verify` job

Post-deployment integrity verification:

```yaml
verify:
  name: Verify Deployment
  runs-on: ubuntu-latest
  needs: deploy
  steps:
    - name: Checkout source
      uses: actions/checkout@v4
      with:
        path: source

    - name: Checkout .github-private
      uses: actions/checkout@v4
      with:
        repository: devopsabcs-engineering/.github-private
        token: ${{ steps.app-token.outputs.token }}
        path: target

    - name: Full hash comparison
      run: |
        # Compare SHA-256 of all 25 files (inline manifest — no external file dependency)
        MANIFEST=(
          agents/security-agent.agent.md
          agents/security-reviewer-agent.agent.md
          agents/security-plan-creator.agent.md
          agents/pipeline-security-agent.agent.md
          agents/iac-security-agent.agent.md
          agents/supply-chain-security-agent.agent.md
          agents/a11y-detector.agent.md
          agents/a11y-resolver.agent.md
          agents/code-quality-detector.agent.md
          agents/test-generator.agent.md
          agents/cost-analysis-agent.agent.md
          agents/cost-anomaly-detector.agent.md
          agents/cost-optimizer-agent.agent.md
          agents/deployment-cost-gate-agent.agent.md
          agents/finops-governance-agent.agent.md
          instructions/a11y-remediation.instructions.md
          instructions/code-quality.instructions.md
          instructions/wcag22-rules.instructions.md
          prompts/a11y-fix.prompt.md
          prompts/a11y-scan.prompt.md
          skills/a11y-scan/SKILL.md
          skills/security-scan/SKILL.md
          apm.yml
          mcp.json
          .github/copilot-instructions.md
        )
        FAIL=0
        for file in "${MANIFEST[@]}"; do
          SRC_HASH=$(sha256sum "source/$file" | cut -d' ' -f1)
          TGT_HASH=$(sha256sum "target/$file" | cut -d' ' -f1)
          if [ "$SRC_HASH" != "$TGT_HASH" ]; then
            echo "❌ MISMATCH: $file"
            FAIL=1
          fi
        done
        if [ "$FAIL" -eq 1 ]; then exit 1; fi

    - name: Generate deployment summary
      run: |
        cat >> "$GITHUB_STEP_SUMMARY" << EOF
        ## 🚀 Deployment to .github-private
        ...deployment summary...
        EOF
```

Files:
* `.github/workflows/deploy-to-github-private.yml` — Add verify job

Success criteria:
* All 25 file hashes match between source and `.github-private`
* Deployment summary written to GitHub Actions Job Summary
* Job fails if any hash mismatch detected

Context references:
* Subagent `github-private-deployment-research.md` §3 — Verification approach
* Research document §Deployment Summary Design — Summary template

Dependencies:
* Deploy job completed successfully

### Step 5.4: Add `workflow_dispatch` trigger for manual deployments

Already included in Step 5.1 triggers. Ensure the `deploy` job handles `workflow_dispatch` input for optional version tagging or force-push flag.

Files:
* `.github/workflows/deploy-to-github-private.yml` — Verify `workflow_dispatch` included

Success criteria:
* Manual workflow trigger available in GitHub Actions UI
* Deploy job executes on manual trigger without path filter constraint

Context references:
* Research document §Selected Approach rationale #4 — Re-runnability via workflow_dispatch

Dependencies:
* Step 5.1 includes the trigger

## Implementation Phase 6: Validation

<!-- parallelizable: false -->

### Step 6.1: Run full project validation

Execute all validation commands for the project:
* `actionlint .github/workflows/*.yml` — Verify all 7 workflow files valid
* `node scripts/validate-agents.mjs` — Verify all 22 agent config files pass
* `cd sample-app && npm ci && npm run lint && npx tsc --noEmit && npm test` — Verify sample-app commands execute
* Manual review of workflow triggers, permissions, and SARIF categories for uniqueness

### Step 6.2: Fix minor validation issues

Iterate on lint errors, build warnings, and test failures. Apply fixes directly when corrections are straightforward and isolated.

### Step 6.3: Report blocking issues

When validation failures require changes beyond minor fixes:
* Document the issues and affected files.
* Provide the user with next steps.
* Recommend additional research and planning rather than inline fixes.
* Avoid large-scale refactoring within this phase.

## Dependencies

* Node.js 20+ — validation script and sample-app
* `gray-matter` ^4.0.3 — YAML frontmatter parsing
* `minimatch` ^9.0.0 — glob pattern validation
* `microsoft/apm-action@v1` — APM audit in CI
* GitHub App or PAT with cross-repo access to `devopsabcs-engineering/.github-private`

## Success Criteria

* Two broken workflows fixed and valid
* All 22 agent config files pass structural + cross-reference + domain validation
* CI workflow with 4 jobs triggers on every push/PR to main
* CD workflow syncs 25 files to `.github-private` with SHA-256 integrity verification
* GitHub Actions Job Summary provides agent inventory, domain matrix, and quality results
