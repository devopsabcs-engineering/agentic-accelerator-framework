---
applyTo: '.copilot-tracking/changes/2026-03-17/ci-cd-agent-testing-changes.md'
---
<!-- markdownlint-disable-file -->
# Implementation Plan: CI/CD Automation for Agent Testing & Deployment

## Overview

Create a CI workflow (`ci-full-test.yml`) and CD workflow (`deploy-to-github-private.yml`) with a custom agent validation script (`scripts/validate-agents.mjs`), fix two broken existing workflows, and configure sample-app test infrastructure — delivering full automated validation of all 15 agents across 4 domains with org-wide deployment to `devopsabcs-engineering/.github-private`.

## Objectives

### User Requirements

* CI workflow triggered on every commit — full test coverage across all agents, all domains, and the sample app — Source: Task implementation requests in research document
* Agent testing leveraging APM, structural validation, and cross-reference integrity — Source: Research §Agent Validation — Five-Tier Strategy
* GitHub workflow summary output with proper grounding — Source: Research §GitHub Actions Job Summary Design
* CD workflow deploying to `devopsabcs-engineering/.github-private` for org-wide defaults — Source: Research §CD Workflow Design
* File integrity test: ensure critical files are identical between source and `.github-private` — Source: Research §Deployment File Manifest
* APM security scan for all `.md` agent files — Source: Research §APM Capabilities Summary
* Full coverage testing across all 15 agents in all 4 domains (Security, Accessibility, Code Quality, FinOps) — Source: Task implementation requests

### Derived Objectives

* Fix `security-scan.yml` invalid `hashFiles()` at job level (line 93) — workflow currently rejected by GitHub Actions — Derived from: Research §Currently Failing Workflows
* Fix `finops-cost-gate.yml` invalid `hashFiles()` at job level (line 24-26) — workflow currently rejected by GitHub Actions — Derived from: Research §Currently Failing Workflows
* Fix `code-quality.yml` working directory (runs at repo root but `package.json` is in `sample-app/`) — Derived from: Research §Additional Gaps
* Generate and commit `package-lock.json` for `sample-app/` (required for `npm ci`) — Derived from: Research §Additional Gaps
* Create `jest.config.ts` for module resolution (`@/` aliases, jsdom environment) — Derived from: Research §Additional Gaps
* Create `.eslintrc.json` for `sample-app/` if missing — Derived from: code-quality.yml lint step dependency

## Context Summary

### Project Files

* `.copilot-tracking/research/2026-03-17/ci-cd-agent-testing-research.md` — Primary research document (500+ lines) covering CI/CD design, workflow fixes, validation strategy, and deployment model
* `.copilot-tracking/research/subagents/2026-03-17/repo-structure-research.md` — Full repository inventory: 5 workflows, 15 agents, apm.yml, sample-app stack and intentional issues
* `.copilot-tracking/research/subagents/2026-03-17/agent-testing-research.md` — Agent file format specification, validation taxonomy (Tiers 1-4), cross-reference integrity tests, APM CLI capabilities
* `.copilot-tracking/research/subagents/2026-03-17/github-private-deployment-research.md` — `.github-private` deployment model, 25-file manifest, CD workflow design, auth strategy (GitHub App vs PAT)
* `.github/workflows/security-scan.yml` — Broken: `hashFiles()` in job-level `if:` at line 93
* `.github/workflows/finops-cost-gate.yml` — Broken: `hashFiles()` in job-level `if:` at lines 24-26
* `.github/workflows/code-quality.yml` — Working directory gap: expects `package.json` at repo root
* `.github/workflows/apm-security.yml` — Existing APM audit workflow (PR-triggered, reference pattern)
* `sample-app/package.json` — Next.js 14.2, Jest 29.7, no lockfile committed, no jest.config
* `apm.yml` — 22 dependency declarations (15 agents, 3 instructions, 2 prompts, 2 skills)

### References

* Research §Scenario B — Selected approach: separate CI + CD workflows with independent triggers
* Research §Validation Script Design — Five-function architecture for `validate-agents.mjs`
* Research §Deployment File Manifest — 25 files across 7 directories to sync to `.github-private`
* Research §GitHub Actions Job Summary Design — Markdown summary with agent inventory table and domain coverage matrix
* Subagent `agent-testing-research.md` §Validation Taxonomy — Tiers 1-4 with technology recommendations (gray-matter, ajv, minimatch)
* Subagent `github-private-deployment-research.md` §CD Workflow Design — Selective file sync with SHA-256 integrity verification

### Standards References

* #file:../../.github/copilot-instructions.md — SARIF output standard, severity classification, agent output format
* #file:../../.github/instructions/ado-workflow.instructions.md — ADO work item tracking, branching, PR workflow

## Implementation Checklist

### [x] Implementation Phase 1: Fix Broken Existing Workflows

<!-- parallelizable: true -->

* [x] Step 1.1: Fix `security-scan.yml` — Replace job-level `hashFiles()` with step-level file existence check
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 15-56)
* [x] Step 1.2: Fix `finops-cost-gate.yml` — Remove redundant job-level `hashFiles()` check
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 58-88)
* [x] Step 1.3: Fix `code-quality.yml` — Add `defaults.run.working-directory: sample-app`
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 90-115)
* [x] Step 1.4: Validate all fixed workflows pass `actionlint` or YAML schema check
  * Skip if validation conflicts with parallel phases

### [x] Implementation Phase 2: Sample-App Test Infrastructure

<!-- parallelizable: true -->

* [x] Step 2.1: Generate and commit `sample-app/package-lock.json` via `npm install --package-lock-only`
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 119-133)
* [x] Step 2.2: Create `sample-app/jest.config.ts` — jsdom environment, `@/` module alias, coverage thresholds
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 135-170)
* [x] Step 2.3: Create `sample-app/.eslintrc.json` with `next/core-web-vitals` extends (required for `next lint` in CI)
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 172-190)
* [x] Step 2.4: Verify `npm run lint`, `npx tsc --noEmit`, and `npm test` execute from `sample-app/`
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 192-210)

### [x] Implementation Phase 3: Agent Validation Script

<!-- parallelizable: false -->

* [x] Step 3.1: Create `scripts/validate-agents.mjs` — Tier 1 structural validation (frontmatter parsing, required fields, schema)
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 194-260)
* [x] Step 3.2: Add Tier 2 cross-reference integrity checks (handoff targets, prompt→agent, apm.yml paths, applyTo coverage)
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 262-310)
* [x] Step 3.3: Add Tier 4 domain content validation (OWASP/CWE for security, WCAG for a11y, SARIF compliance)
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 312-355)
* [x] Step 3.4: Add report generation — console output, JSON results, GitHub Actions Job Summary markdown
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 357-400)
* [x] Step 3.5: Add `scripts/package.json` with `gray-matter` and `minimatch` dependencies + generate `scripts/package-lock.json`
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 402-420)
* [x] Step 3.6: Test script locally against all 15 agents, 3 instructions, 2 prompts, 2 skills
  * Expected: all pass structural + cross-reference; 9 agents generate `model` missing advisory warnings

### [x] Implementation Phase 4: CI Workflow — `ci-full-test.yml`

<!-- parallelizable: false -->

* [x] Step 4.1: Create `.github/workflows/ci-full-test.yml` with triggers (`push` + `pull_request` to `main`)
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 424-450)
* [x] Step 4.2: Add `agent-validation` job — checkout, setup Node.js, install script deps, run `validate-agents.mjs`, upload SARIF
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 452-500)
* [x] Step 4.3: Add `apm-security` job — `microsoft/apm-action@v1` with `audit` + `audit-report: true`, upload SARIF
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 502-535)
* [x] Step 4.4: Add `sample-app-quality` job — npm ci, lint, type-check, test with coverage, upload JUnit + coverage artifacts
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 537-585)
* [x] Step 4.5: Add `summary` job — depends on all, generates consolidated GitHub Actions Job Summary markdown
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 587-635)
* Note: `sample-app-security` CodeQL job omitted from this workflow — existing `security-scan.yml` (fixed in Phase 1) provides equivalent SAST coverage for the sample app.

### [x] Implementation Phase 5: CD Workflow — `deploy-to-github-private.yml`

<!-- parallelizable: false -->

* [x] Step 5.1: Create `.github/workflows/deploy-to-github-private.yml` with triggers (push to `main`, paths filter on agent config dirs)
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 639-670)
* [x] Step 5.2: Add `deploy` job — checkout source + target, generate GitHub App token, selective file sync (25 files), SHA-256 integrity, commit + push
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 672-740)
* [x] Step 5.3: Add `verify` job — re-checkout `.github-private`, full hash comparison, deployment summary
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 742-785)
* [x] Step 5.4: Add `workflow_dispatch` trigger for manual deployments/rollbacks
  * Details: .copilot-tracking/details/2026-03-17/ci-cd-agent-testing-details.md (Lines 787-800)

### [x] Implementation Phase 6: Validation

<!-- parallelizable: false -->

* [x] Step 6.1: Run full project validation
  * Verify all YAML workflow files pass schema validation
  * Execute `node scripts/validate-agents.mjs` locally — all 22 items pass
  * Execute `npm run lint`, `npx tsc --noEmit`, `npm test` in `sample-app/`
  * Verify no regressions in existing workflows
* [x] Step 6.2: Fix minor validation issues
  * Iterate on lint errors and build warnings
  * Apply fixes directly when corrections are straightforward
* [x] Step 6.3: Report blocking issues
  * Document issues requiring additional research
  * Provide user with next steps and recommended planning
  * Avoid large-scale fixes within this phase

## Planning Log

See [ci-cd-agent-testing-log.md](../logs/2026-03-17/ci-cd-agent-testing-log.md) for discrepancy tracking, implementation paths considered, and suggested follow-on work.

## Dependencies

* Node.js 20+ (GitHub Actions runner default)
* `gray-matter` npm package — YAML frontmatter parsing for validation script
* `minimatch` npm package — glob pattern validation for instruction `applyTo` fields
* `microsoft/apm-action@v1` — APM audit and compile in CI
* `actions/checkout@v4` — repository checkout
* `actions/setup-node@v4` — Node.js setup
* `github/codeql-action/upload-sarif@v4` — SARIF upload to Code Scanning
* `actions/create-github-app-token@v1` — GitHub App token for cross-repo deployment (CD)
* GitHub App or PAT with `contents: write` on `devopsabcs-engineering/.github-private` (CD prerequisite)

## Success Criteria

* Every push to `main` triggers CI — all 4 jobs execute — Traces to: User requirement "CI workflow triggered on every commit"
* All 15 agents validated: frontmatter schema, cross-references, domain content — Traces to: User requirement "full coverage testing across all 15 agents"
* APM audit passes on all agent configuration files with SARIF upload — Traces to: User requirement "APM security scan"
* Sample-app lint, type-check, and tests execute (known intentional failures documented in summary) — Traces to: Derived objective "fix code-quality.yml working directory"
* CD workflow syncs 25 files to `.github-private` with SHA-256 integrity verification on push to main — Traces to: User requirement "CD workflow deploying to .github-private"
* GitHub Actions Job Summary provides agent inventory table, domain coverage matrix, and file count — Traces to: User requirement "GitHub workflow summary output"
* Two broken workflows (`security-scan.yml`, `finops-cost-gate.yml`) fixed and valid — Traces to: Derived objective from research §Currently Failing Workflows
