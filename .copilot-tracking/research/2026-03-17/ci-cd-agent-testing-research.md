<!-- markdownlint-disable-file -->
# Task Research: CI/CD Automation for Agent Testing & Deployment

Comprehensive CI/CD pipeline design for the Agentic DevSecOps Framework, covering automated agent validation, sample-app testing, APM security scanning, and deployment to `.github-private` for org-wide distribution.

## Task Implementation Requests

* CI workflow triggered on every commit — full test coverage across all agents, all domains, and the sample app
* Agent testing leveraging APM, structural validation, and cross-reference integrity
* GitHub workflow summary output with proper grounding
* CD workflow deploying to `devopsabcs-engineering/.github-private` for org-wide defaults
* File integrity test: ensure critical files are identical between source and `.github-private`
* APM security scan for all `.md` agent files
* Full coverage testing across all 15 agents in all 4 domains (Security, Accessibility, Code Quality, FinOps)

## Scope and Success Criteria

* Scope: New CI workflow (`ci-full-test.yml`) + CD workflow (`deploy-to-github-private.yml`) + validation scripts + sample-app test fixes
* Assumptions:
  * `devopsabcs-engineering/.github-private` repository exists or will be created
  * GitHub App or PAT available for cross-repo deployment
  * `microsoft/apm-action@v1` is available in GitHub Actions marketplace
* Success Criteria:
  * Every push to `main` triggers full CI validation
  * All 15 agents validated structurally and by cross-reference
  * APM audit passes on all agent configuration files
  * Sample-app lint, type-check, and tests execute (with known intentional failures documented)
  * CD workflow syncs 25 files to `.github-private` with SHA-256 integrity verification
  * GitHub Actions Job Summary provides grounded, actionable output

## Outline

1. Repository Inventory (current state)
2. CI Workflow Design — `ci-full-test.yml`
3. Agent Validation Script Design
4. Sample-App Test Infrastructure Fixes
5. CD Workflow Design — `deploy-to-github-private.yml`
6. File Integrity Verification
7. GitHub Workflow Summary Output Design
8. Technical Scenarios (alternatives evaluated)
9. Selected Approach & Implementation Plan

## Research Executed

### File Analysis

* `.github/workflows/` — 5 existing workflows (security-scan, accessibility-scan, code-quality, finops-cost-gate, apm-security). All produce SARIF output. See subagent: `repo-structure-research.md`
* `agents/` — 15 agent files across 4 domains. Schema: name, description, tools (required); model, handoffs (optional). See subagent: `agent-testing-research.md`
* `apm.yml` — 22 dependency declarations (15 agents, 3 instructions, 2 prompts, 2 skills). Security audit on install/compile.
* `mcp.json` — Single ADO work items MCP server with env var interpolation.
* `sample-app/` — Next.js 14 with Jest. 12+ intentional security vulns, 8+ a11y violations, 5+ quality issues, 6+ FinOps issues. Only 3 unit tests (~5% coverage).
* `instructions/` — 3 files with `applyTo` glob patterns (WCAG, a11y remediation, code quality)
* `prompts/` — 2 files (a11y-scan, a11y-fix) referencing A11yDetector and A11yResolver agents
* `skills/` — 2 skill directories (a11y-scan, security-scan)

### Code Search Results

* `microsoft/apm-action@v1` — Used in `apm-security.yml` with `command: audit`. Supports: audit, compile, pack, bundle, audit-report modes.
* `gray-matter` — npm package for YAML frontmatter extraction. Standard for Markdown-based config parsing.
* `ajv` — JSON Schema validator for Node.js. Suitable for agent frontmatter schema enforcement.

### Project Conventions

* Standards referenced: SARIF v2.1.0, OWASP Top 10, WCAG 2.2, CWE
* Instructions followed: `.github/copilot-instructions.md` — SARIF output, severity mapping, report structure
* Workflow pattern: All workflows upload SARIF via `github/codeql-action/upload-sarif@v4` with distinct `automationDetails.id` categories

## Key Discoveries

### Currently Failing Workflows (Must Fix)

Two workflows are currently **invalid** and rejected by GitHub Actions at parse time:

#### `security-scan.yml` — Line 93: `hashFiles()` in job-level `if:`

```
Invalid workflow file: .github/workflows/security-scan.yml#L1
(Line: 93, Col: 9): Unrecognized function: 'hashFiles'.
Located at position 1 within expression: hashFiles('**/Dockerfile') != ''
```

**Root Cause:** The `container` job uses `if: hashFiles('**/Dockerfile') != ''` at the **job level**. The `hashFiles()` function requires access to the runner's workspace filesystem, but job-level `if:` conditions are evaluated **before** the runner starts and before any `actions/checkout`. Therefore `hashFiles()` is not available in `jobs.<job_id>.if` — only in step-level `if:` conditions after checkout.

**Location:** [.github/workflows/security-scan.yml](../../.github/workflows/security-scan.yml) line 93

**Fix:** Replace the job-level `hashFiles()` condition with a two-step approach:
1. Always start the `container` job (remove the `if:` condition or set `if: true`)
2. Add an early step that checks for Dockerfile existence after checkout
3. Use step-level conditions on subsequent steps to skip if no Dockerfile found

```yaml
container:
  name: Container — Trivy Image Scan
  runs-on: ubuntu-latest
  # Removed: if: hashFiles('**/Dockerfile') != ''
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Check for Dockerfile
      id: check
      run: |
        if find . -name 'Dockerfile' -type f | grep -q .; then
          echo "found=true" >> "$GITHUB_OUTPUT"
        else
          echo "found=false" >> "$GITHUB_OUTPUT"
          echo "No Dockerfile found — skipping container scan"
        fi

    - name: Build container image
      if: steps.check.outputs.found == 'true'
      run: |
        DOCKERFILE=$(find . -name 'Dockerfile' -type f | head -1)
        docker build -t scan-target:latest -f "$DOCKERFILE" .

    - name: Run Trivy container scan
      if: steps.check.outputs.found == 'true'
      uses: aquasecurity/trivy-action@0.28.0
      # ... (rest unchanged)

    - name: Upload container SARIF
      if: always() && steps.check.outputs.found == 'true'
      # ... (rest unchanged)
```

#### `finops-cost-gate.yml` — Line 24: `hashFiles()` in job-level `if:`

```
Invalid workflow file: .github/workflows/finops-cost-gate.yml#L1
(Line: 24, Col: 9): Unrecognized function: 'hashFiles'.
Located at position 1 within expression: hashFiles('**/*.tf') != '' || hashFiles('**/*.bicep') != ''
```

**Root Cause:** Same issue — the `cost-estimate` job uses `hashFiles()` in a job-level `if:` condition, which is evaluated before the runner has workspace access.

**Location:** [.github/workflows/finops-cost-gate.yml](../../.github/workflows/finops-cost-gate.yml) line 24-26

**Fix:** The workflow already has `paths:` trigger filters (`**/*.tf`, `**/*.bicep`, `**/*.json`) — the workflow only runs when IaC files change. The job-level `hashFiles()` check is redundant. Remove it entirely:

```yaml
jobs:
  cost-estimate:
    name: FinOps — IaC Cost Estimation
    runs-on: ubuntu-latest
    # Removed redundant hashFiles() check — workflow paths filter already ensures
    # this only runs when .tf/.bicep/.json files change
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      # ... (rest unchanged)
```

Alternatively, if stricter gating is needed (e.g., `.json` path trigger could match non-IaC files), add a post-checkout step:

```yaml
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Check for IaC files
        id: check-iac
        run: |
          if find . -name '*.tf' -o -name '*.bicep' | grep -q .; then
            echo "found=true" >> "$GITHUB_OUTPUT"
          else
            echo "found=false" >> "$GITHUB_OUTPUT"
            echo "No .tf or .bicep files found — skipping cost estimation"
          fi

      - name: Setup Infracost
        if: steps.check-iac.outputs.found == 'true'
        # ... (rest with step-level if conditions)
```

#### Note: Step-level `hashFiles()` in `security-scan.yml` DAST job (line ~150)

The DAST job's final step uses `hashFiles('zap-results.sarif')` in a **step-level** `if:` condition:
```yaml
if: always() && hashFiles('zap-results.sarif') != ''
```
This is **valid** because step-level `if:` runs after the runner has started and the workspace exists. No fix needed.

### Additional Gaps Requiring Fixes

| # | Gap | Impact | Fix |
|---|---|---|---|
| 1 | `security-scan.yml` job-level `hashFiles()` | **Workflow invalid** — entire workflow rejected by GitHub | Replace with step-level file existence check |
| 2 | `finops-cost-gate.yml` job-level `hashFiles()` | **Workflow invalid** — entire workflow rejected by GitHub | Remove redundant check (paths filter suffices) or use step-level check |
| 3 | `code-quality.yml` runs at repo root but `package.json` is in `sample-app/` | Workflow fails — npm ci finds no package.json | Add `defaults.run.working-directory: sample-app` or create wrapper |
| 4 | No `package-lock.json` committed | `npm ci` fails without lockfile | Generate and commit lockfile |
| 5 | No Jest config | Tests may not resolve `@/` aliases or use jsdom | Add `jest.config.ts` with proper module resolution |
| 6 | 9 of 15 agents missing `model` field | May fall back to unintended default | Advisory warning (not blocking) |
| 7 | No programmatic agent behavior testing | Cannot invoke agents in CI | Use structural + cross-reference + APM validation instead |
| 8 | `samples/github-actions/` empty | Incomplete reference material | Low priority |

### Agent Validation — Five-Tier Strategy

| Tier | What | Speed | Automatable | CI Gate |
|---|---|---|---|---|
| 1 | YAML frontmatter linting (required fields, types, format) | < 30s | Yes | Blocking |
| 2 | Cross-reference integrity (handoff targets, prompt→agent, apm.yml paths) | < 60s | Yes | Blocking |
| 3 | APM ecosystem (`apm audit` + `apm compile --validate`) | < 2min | Yes | Blocking |
| 4 | Domain content rules (OWASP/CWE for security, WCAG for a11y, SARIF compliance) | < 2min | Yes | Warning |
| 5 | Behavioral smoke testing (manual invocation in VS Code) | Manual | No | N/A |

### Deployment File Manifest (.github-private)

25 files to sync across 7 directories:

| Category | Count | Files |
|---|---|---|
| Agents | 15 | `agents/*.agent.md` |
| Instructions | 3 | `instructions/*.instructions.md` |
| Prompts | 2 | `prompts/*.prompt.md` |
| Skills | 2 | `skills/*/SKILL.md` |
| Config | 3 | `apm.yml`, `mcp.json`, `.github/copilot-instructions.md` |

Files NOT synced: `sample-app/`, `samples/`, `docs/`, `assets/`, `.github/workflows/`, `README.md`, `LICENSE`.

### APM Capabilities Summary

| Command | Purpose | Available in CI |
|---|---|---|
| `apm audit` | Hidden Unicode / prompt injection scanning | Yes via `microsoft/apm-action@v1` |
| `apm audit -f sarif` | SARIF report for Code Scanning | Yes with `audit-report: true` |
| `apm compile --validate` | Frontmatter + structure validation | Yes |
| `apm compile --dry-run` | Preview compilation | Yes |
| `apm pack` | Bundle for deployment | Yes |

## Technical Scenarios

### Scenario A: Single Monolithic CI Workflow

One `ci-full-test.yml` workflow with all jobs.

**Requirements:**
* Single trigger on push/PR to main
* All validation in one workflow file

**Approach:**

```text
ci-full-test.yml
├── job: agent-validation (Tier 1+2 — custom Node.js script)
├── job: apm-security (Tier 3 — microsoft/apm-action@v1)
├── job: domain-content-validation (Tier 4 — custom script)
├── job: sample-app-lint
├── job: sample-app-typecheck
├── job: sample-app-test
└── job: summary (depends on all — writes Job Summary)
```

**Advantages:**
- Single file to maintain
- Clear dependency graph between jobs
- One workflow run = one status check

**Limitations:**
- Large file, harder to read
- Can't selectively re-run individual checks

### Scenario B: Separate CI + CD Workflows (Selected)

Two workflows: `ci-full-test.yml` for CI and `deploy-to-github-private.yml` for CD.

**Requirements:**
* CI runs on push and PR to main
* CD runs only on push to main (after merge) when agent config paths change
* Clear separation of concerns

**Approach:**

```text
ci-full-test.yml (on: push + pull_request to main)
├── job: agent-validation
│   ├── step: Checkout
│   ├── step: Setup Node.js
│   ├── step: Run validate-agents.mjs (Tier 1+2+4)
│   └── step: Upload validation SARIF
├── job: apm-security
│   ├── step: Checkout
│   ├── step: microsoft/apm-action@v1 (audit + audit-report)
│   └── step: Upload APM SARIF
├── job: sample-app-quality
│   ├── step: Checkout
│   ├── step: npm ci (in sample-app/)
│   ├── step: Lint
│   ├── step: Type check
│   └── step: Test with coverage
├── job: sample-app-security (reuse existing security-scan patterns)
│   └── step: CodeQL on sample-app/
└── job: summary (depends on all)
    └── step: Generate GitHub Actions Job Summary markdown

deploy-to-github-private.yml (on: push to main, paths filter)
├── job: deploy
│   ├── step: Checkout source + target repos
│   ├── step: Selective file sync (25 files)
│   ├── step: SHA-256 integrity validation
│   ├── step: Commit + push to .github-private
│   └── step: Tag source repo
└── job: verify
    ├── step: Re-checkout .github-private
    ├── step: Full hash comparison
    └── step: Generate deployment summary
```

**Advantages:**
- Clear separation of CI (test) and CD (deploy)
- CD only triggers when agent config changes
- Each concern independently maintainable
- CD can be re-run manually via `workflow_dispatch`

**Limitations:**
- Two workflow files to maintain (acceptable trade-off)

### Scenario C: Reusable Workflows with Caller Pattern

Use `workflow_call` for reusable job definitions.

**Advantages:** DRY, composable
**Limitations:** Over-engineered for this scale, adds indirection

#### Considered Alternatives

**Scenario A** rejected: monolithic file harder to maintain; CI and CD have different triggers and concerns.
**Scenario C** rejected: over-engineered at this repo's scale; reusable workflows add complexity without proportional benefit for 2 workflows.

## Selected Approach: Scenario B — Separate CI + CD Workflows

### Rationale

1. **Separation of concerns**: CI validation (every commit) vs. CD deployment (main merges with path filter)
2. **Independent triggers**: CI runs on PRs; CD runs only on push to main
3. **Maintainability**: Two focused files vs. one large file
4. **Re-runnability**: CD via `workflow_dispatch` for manual deployments/rollbacks

### Implementation Plan

#### Existing Workflows to Fix

| File | Issue | Fix |
|---|---|---|
| `.github/workflows/security-scan.yml` | `hashFiles()` in job-level `if:` (line 93) — workflow invalid | Replace with step-level file existence check after checkout |
| `.github/workflows/finops-cost-gate.yml` | `hashFiles()` in job-level `if:` (line 24) — workflow invalid | Remove redundant check (paths filter already gates) or use step-level check |

#### New Files to Create

| File | Purpose |
|---|---|
| `.github/workflows/ci-full-test.yml` | CI workflow — agent validation + APM + sample-app testing + summary |
| `scripts/validate-agents.mjs` | Node.js validation script (Tier 1+2+4) for all agents, instructions, prompts, skills |
| `.github/workflows/deploy-to-github-private.yml` | CD workflow — sync to .github-private + integrity verification |

#### CI Workflow Jobs

**Job 1: `agent-validation`** — Tier 1+2+4 structural/cross-reference/domain validation
- Parses all 15 agent files, 3 instructions, 2 prompts, 2 skills
- Validates YAML frontmatter schema (required fields, types, format)
- Cross-reference checks (handoff targets, prompt→agent, apm.yml path resolution)
- Domain content rules (OWASP refs in security agents, WCAG refs in a11y agents)
- Outputs: structured JSON results + GitHub Job Summary table

**Job 2: `apm-security`** — Tier 3 APM audit
- `microsoft/apm-action@v1` with `audit` + `audit-report: true`
- SARIF upload to Code Scanning (`apm-audit/`)
- Blocks on prompt injection / hidden Unicode findings

**Job 3: `sample-app-quality`** — Sample app lint, type-check, test
- Working directory: `sample-app/`
- Lint → Type check → Jest with coverage
- JUnit XML + coverage report as artifacts
- Known intentional failures documented in summary

**Job 4: `summary`** — Consolidated GitHub Actions Job Summary
- Depends on all previous jobs
- Generates Markdown summary table with pass/fail per category
- Agent inventory table (15 agents × validation status)
- Domain coverage matrix
- File count and hash summary

#### CD Workflow Jobs

**Job 1: `deploy`** — Selective sync to `.github-private`
- Trigger: push to main with paths filter on agent config directories
- Auth: GitHub App token (preferred) or PAT
- Sync 25 files using rsync + cp
- SHA-256 integrity validation
- Commit with source SHA reference
- Tag source repo with deployment marker

**Job 2: `verify`** — Post-deployment integrity check
- Full re-checkout of `.github-private`
- Hash comparison of all 25 files
- Generate deployment summary in Job Summary

#### Validation Script Design (`scripts/validate-agents.mjs`)

```text
validate-agents.mjs
├── loadInventory()
│   ├── Discover all .agent.md files
│   ├── Discover all .instructions.md files
│   ├── Discover all .prompt.md files
│   └── Discover all SKILL.md files
├── validateAgentFrontmatter(file)
│   ├── Parse YAML frontmatter (gray-matter)
│   ├── Check required: name, description, tools
│   ├── Validate tools format: category/name
│   ├── Validate handoffs schema: label + agent required
│   └── Warn if model missing
├── validateInstructionFrontmatter(file)
│   ├── Check required: description, applyTo
│   └── Validate applyTo is valid glob
├── validatePromptFrontmatter(file)
│   ├── Check required: description, agent
│   └── Validate agent references existing agent
├── validateSkillFrontmatter(file)
│   └── Check required: name, description (in YAML or heading)
├── crossReferenceChecks()
│   ├── All handoff targets → existing agent names
│   ├── All prompt agent refs → existing agent names
│   ├── All apm.yml paths → existing files
│   ├── All instruction applyTo → matches ≥1 repo file
│   └── No orphaned agents (all in apm.yml)
├── domainContentChecks()
│   ├── Security agents → mention OWASP or CWE
│   ├── A11y agents → mention WCAG
│   ├── All agents → mention SARIF
│   └── Severity mappings → consistent with CRITICAL/HIGH/MEDIUM/LOW
└── generateReport()
    ├── Console output (CI log)
    ├── JSON results file
    └── GitHub Actions Job Summary markdown
```

### GitHub Actions Job Summary Design

The summary step writes to `$GITHUB_STEP_SUMMARY`:

```markdown
## 🔬 CI Full Test Results

### Agent Validation (15 agents)
| Domain | Agent | Frontmatter | Cross-Refs | Domain Rules | Status |
|---|---|---|---|---|---|
| Security | SecurityAgent | ✅ | ✅ | ✅ | PASS |
| Security | SecurityReviewerAgent | ✅ | ✅ | ✅ | PASS |
| ... | ... | ... | ... | ... | ... |

### APM Security Audit
| Check | Result |
|---|---|
| Hidden Unicode scan | ✅ No findings |
| Prompt injection vectors | ✅ Clean |
| SARIF report | Uploaded to Code Scanning |

### Sample App Quality
| Check | Result | Details |
|---|---|---|
| Lint | ✅ / ⚠️ | N warnings |
| Type Check | ✅ / ❌ | N errors |
| Tests | ✅ / ❌ | N passed, N failed |
| Coverage | ⚠️ | X% (threshold: 80%) |

### File Inventory
| Category | Count | Status |
|---|---|---|
| Agents | 15 | All validated |
| Instructions | 3 | All validated |
| Prompts | 2 | All validated |
| Skills | 2 | All validated |
| Total | 22 | ✅ |
```

### Deployment Summary Design

```markdown
## 🚀 Deployment to .github-private

### Sync Results
| Category | Files | Status |
|---|---|---|
| Agents | 15 | ✅ Synced |
| Instructions | 3 | ✅ Synced |
| Prompts | 2 | ✅ Synced |
| Skills | 2 | ✅ Synced |
| Config | 3 | ✅ Synced |
| **Total** | **25** | **✅ All verified** |

### Integrity Verification
All 25 files verified by SHA-256 hash comparison.

Source: `agentic-devsecops-framework@abc1234`
Target: `devopsabcs-engineering/.github-private`
Tag: `deploy/github-private/20260317-143000-42`
```

## Potential Next Research

* Verify `devopsabcs-engineering/.github-private` exists — if not, needs creation from GitHub template
* Determine if `.github-private` has branch protection requiring PR-based deployment instead of direct push
* Investigate GitHub App availability for cross-repo deployment
* Confirm `instructions/` and `prompts/` at `.github-private` root are resolved org-wide by Copilot (confirmed for `agents/`, less clear for others)
* Test `apm compile --validate` against this repo's non-standard `apm.yml` format
* Research `gray-matter` + `ajv` for the validation script implementation
* Fix `security-scan.yml` `hashFiles()` job-level usage → step-level file existence check
* Fix `finops-cost-gate.yml` `hashFiles()` job-level usage → remove or use step-level check
