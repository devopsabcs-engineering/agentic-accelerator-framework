<!-- markdownlint-disable-file -->
# Planning Log: CI/CD Automation for Agent Testing & Deployment

## Discrepancy Log

Gaps and differences identified between research findings and the implementation plan.

### Unaddressed Research Items

* DR-01: `security-scan.yml` job-level `hashFiles()` (line 93) — workflow currently invalid
  * Source: Research document (Lines 66-110)
  * Reason: Addressed in Phase 1, Step 1.1
  * Impact: high — workflow rejected by GitHub Actions

* DR-02: `finops-cost-gate.yml` job-level `hashFiles()` (lines 24-26) — workflow currently invalid
  * Source: Research document (Lines 112-150)
  * Reason: Addressed in Phase 1, Step 1.2
  * Impact: high — workflow rejected by GitHub Actions

* DR-03: 9 of 15 agents missing `model` field
  * Source: Subagent `agent-testing-research.md` §1 — Agent fields table
  * Reason: Advisory warning only in validation script — not blocking. Agents fall back to platform default model.
  * Impact: low — functional but may use unintended model

* DR-04: `samples/github-actions/` directory is empty
  * Source: Research document §Additional Gaps #8
  * Reason: Out of scope for CI/CD implementation — low priority reference material
  * Impact: low — incomplete documentation, no functional impact

* DR-05: `apm-agent-testing-research.md` subagent research incomplete
  * Source: `.copilot-tracking/research/subagents/2026-03-17/apm-agent-testing-research.md` — Status: In Progress
  * Reason: Duplicate coverage — main research document and `agent-testing-research.md` subagent already cover all APM topics comprehensively
  * Impact: low — no missing information

* DR-06: `.github-private` repository existence and branch protection not confirmed
  * Source: Research document §Potential Next Research
  * Reason: Deployment prerequisite — CD workflow will fail if repo does not exist. Documented as dependency.
  * Impact: medium — CD workflow non-functional until prerequisite met

* DR-07: GitHub App for cross-repo deployment not yet configured
  * Source: Subagent `github-private-deployment-research.md` §3 — Auth options
  * Reason: Infrastructure prerequisite outside code scope. Plan documents PAT fallback.
  * Impact: medium — CD workflow requires one of these auth methods

* DR-08: `apm compile --validate` not included in CI (only `apm audit`)
  * Source: Research document §APM Capabilities Summary — compile + validate mode
  * Reason: Deferred to follow-on work. Current `apm audit` covers security scanning. `compile --validate` adds structural validation but overlaps with custom validation script.
  * Impact: low — custom script provides equivalent structural validation

* DR-09: No `package-lock.json` for `scripts/` directory in plan
  * Source: Step 3.5 creates `scripts/package.json` but CI uses `npm ci` which requires lockfile
  * Reason: **RESOLVED** — Step 3.5 updated to include `npm install --package-lock-only` and commit both files
  * Impact: medium — resolved in plan revision

* DR-10: Step 5.3 verify job references `.github/deploy-manifest.txt` but no step creates it
  * Source: Plan-validator finding — Step 5.3 code references `cat source/.github/deploy-manifest.txt`
  * Reason: **RESOLVED** — Step 5.3 updated to use inline bash array manifest (25 files hardcoded) instead of external file. WI-07 remains as future maintainability improvement.
  * Impact: medium — resolved in plan revision

* DR-11: `.eslintrc.json` Derived Objective without implementation step
  * Source: Plan-validator finding — `next lint` requires ESLint config; without one it prompts interactively and fails in CI
  * Reason: **RESOLVED** — Step 2.3 added to Phase 2 creating `sample-app/.eslintrc.json` with `next/core-web-vitals`
  * Impact: medium — resolved in plan revision

* DR-12: `sample-app-security` CodeQL job from research Scenario B not in plan
  * Source: Plan-validator finding — research specifies 5 CI jobs, plan implements 4
  * Reason: Intentional omission. Existing `security-scan.yml` (after Phase 1 fix) provides equivalent SAST coverage. Note added to Phase 4 in plan.
  * Impact: low — documented deviation, no functional gap

* DR-10: Step 5.3 verify job references `.github/deploy-manifest.txt` but no step creates it
  * Source: Details Step 5.3 (Line 767) — `cat source/.github/deploy-manifest.txt`
  * Reason: WI-07 defers manifest creation to follow-on work, but Step 5.3 code depends on the file at runtime. The verify job will fail unless the manifest is created in-scope or the code uses an inline file list.
  * Impact: medium — verify job will fail at runtime; either move WI-07 into Phase 5 or change Step 5.3 to use an inline file list

* DR-11: `.eslintrc.json` listed as Derived Objective but no implementation step exists
  * Source: Plan §Derived Objectives — "Create `.eslintrc.json` for `sample-app/` if missing"
  * Reason: No corresponding step in Phase 2 or any other phase. `next lint` in CI requires an ESLint config file; without one, the command prompts interactively (fails in CI) or errors. No `.eslintrc*` or `eslint.config.*` exists in `sample-app/`.
  * Impact: medium — `npm run lint` step in Phase 4 Step 4.4 will fail in CI without an ESLint config; Phase 2 needs a step to create it

* DR-12: `sample-app-security` CodeQL job from research Scenario B not included in plan
  * Source: Research document (Line 290-291) — Scenario B includes `sample-app-security` job with CodeQL
  * Reason: Plan Phase 4 implements 4 CI jobs but the selected research approach specifies 5. The existing `security-scan.yml` (after Phase 1 fix) runs CodeQL separately, providing equivalent coverage through a different workflow.
  * Impact: low — coverage is provided by existing workflow; however, the plan does not document why the 5th job was omitted from the selected approach

### Plan Deviations from Research

* DD-01: GitHub App token assumed for CD deployment
  * Research recommends: Both GitHub App (Option A) and PAT (Option B) documented
  * Plan implements: GitHub App as primary, with PAT documented as fallback in planning log
  * Rationale: GitHub App provides scoped permissions, auditability, and rotatable credentials — preferred for production cross-repo access

* DD-02: Custom validation script instead of dedicated JSON Schema (`ajv`) library
  * Research recommends: `ajv` for JSON Schema validation (Subagent `agent-testing-research.md` §Tier 1)
  * Plan implements: Pure JavaScript property checks without `ajv` dependency
  * Rationale: Only 5 distinct schemas (agent, instruction, prompt, skill, apm.yml entry) — `ajv` adds dependency weight without proportional benefit at this scale

* DD-03: Tier 3 APM validation separated from custom script
  * Research recommends: Five-tier strategy with Tiers 1-4 in custom script
  * Plan implements: Tiers 1+2+4 in custom script, Tier 3 in separate `apm-security` job using `microsoft/apm-action@v1`
  * Rationale: APM action provides official, maintained scanning with SARIF output — more reliable than reimplementing audit logic in custom script

* DD-04: `continue-on-error: true` for sample-app quality checks
  * Research recommends: Quality checks as CI gates
  * Plan implements: `continue-on-error: true` for lint, type-check, and test in sample-app job
  * Rationale: Sample app has intentional issues by design — these checks document the issues in the summary rather than blocking the CI pipeline

* DD-05: `sample-app-security` CodeQL job omitted from `ci-full-test.yml`
  * Research recommends: 5 jobs in CI workflow including `sample-app-security` with CodeQL on `sample-app/` (Scenario B, Line 290)
  * Plan implements: 4 jobs — relies on existing `security-scan.yml` workflow for CodeQL coverage after Phase 1 fix
  * Rationale: Existing `security-scan.yml` already runs CodeQL analysis across the repository. Duplicating CodeQL in the new CI workflow adds overhead without additional coverage. The fix in Phase 1 Step 1.1 restores the existing workflow to a valid state.

## Implementation Paths Considered

### Selected: Scenario B — Separate CI + CD Workflows

* Approach: Two independent workflows — `ci-full-test.yml` for validation (push + PR to main) and `deploy-to-github-private.yml` for deployment (push to main with paths filter)
* Rationale: Clear separation of CI (test) and CD (deploy) concerns; independent triggers; each workflow maintainable independently; CD supports manual re-runs via `workflow_dispatch`
* Evidence: Research document §Scenario B analysis and §Selected Approach rationale

### IP-01: Scenario A — Single Monolithic CI Workflow

* Approach: One `ci-full-test.yml` with all validation + deployment jobs
* Trade-offs: Single file, clear dependency graph, one workflow run = one status check. But larger file harder to maintain, CI and CD have fundamentally different trigger patterns (PR vs. push+paths), cannot selectively re-run deployment
* Rejection rationale: CI and CD have different triggers and life cycles; monolithic file harder to maintain; deployment should not trigger on PRs

### IP-02: Scenario C — Reusable Workflows with Caller Pattern

* Approach: `workflow_call` for reusable job definitions across multiple caller workflows
* Trade-offs: DRY, composable, good for scale. But over-engineered for 2 workflows; adds indirection and complexity without proportional benefit
* Rejection rationale: Over-engineered at this repo's scale (2 workflows, 7 total jobs). Reusable workflows add maintenance overhead without benefit until the workflow count grows significantly

## Suggested Follow-On Work

Items identified during planning that fall outside current scope.

* WI-01: Populate `samples/github-actions/` with reference workflow files — Low priority reference docs (low)
  * Source: Research §Additional Gaps #8, DR-04
  * Dependency: None

* WI-02: Add `model` field to 9 agents missing it — Advisory improvement (low)
  * Source: DR-03, Subagent `agent-testing-research.md` §1
  * Dependency: None

* WI-03: Create `devopsabcs-engineering/.github-private` repository if it does not exist — CD prerequisite (high)
  * Source: DR-06, Research §Potential Next Research
  * Dependency: Must complete before CD workflow can execute

* WI-04: Configure GitHub App for cross-repo deployment to `.github-private` — CD prerequisite (high)
  * Source: DR-07, Subagent `github-private-deployment-research.md` §3
  * Dependency: WI-03 (.github-private must exist first)

* WI-05: Add `apm compile --validate` step to CI or CD workflow — Enhanced validation (low)
  * Source: DR-08, Research §APM Capabilities Summary
  * Dependency: Phase 4 (CI workflow) completed

* WI-06: Increase sample-app test coverage beyond 5% — Quality improvement (medium)
  * Source: Research §sample-app §5.3 — only 3 unit tests
  * Dependency: Phase 2 (sample-app infrastructure) completed

* WI-07: Create deploy manifest file (`.github/deploy-manifest.txt`) listing all 25 deployment files — Improves CD maintainability (low)
  * Source: Phase 5 Step 5.3 references manifest file for hash comparison
  * Dependency: None

* WI-08: Confirm `instructions/` and `prompts/` at `.github-private` root are resolved org-wide by Copilot — Verification (medium)
  * Source: Research §Potential Next Research
  * Dependency: WI-03 (.github-private deployment complete)

* WI-09: Add `concurrency` group to CI/CD workflows — Prevents parallel runs on same branch (low)
  * Source: Phase 4 and Phase 5 subagent suggestions
  * Dependency: None

* WI-10: Add deployment tagging step to CD workflow — Tag source repo with deployment marker (low)
  * Source: Details Step 5.2 item 9, Phase 5 subagent report
  * Dependency: WI-04 (GitHub App needs additional permissions)

* WI-11: Add SARIF body references to SecurityPlanCreator and TestGenerator agents (low)
  * Source: Phase 3 and Phase 6 validation reports — 2 missing-sarif-reference warnings
  * Dependency: None

## Implementation Decisions

* ID-01: Security domain keyword broadening — Broadened check to accept CIS, NIST, OpenSSF in addition to OWASP/CWE because 3 security agents use those frameworks instead. Agent files are the source of truth.
* ID-02: Additional devDependencies in sample-app — Added `eslint`, `eslint-config-next`, `@types/jest`, `ts-node` not in original plan because CI commands required them to run.
* ID-03: Deployment tagging deferred — CD workflow commits/pushes to .github-private but does not tag the source repo. Tracked as WI-10.
