<!-- markdownlint-disable-file -->
# Release Changes: CI/CD Automation for Agent Testing & Deployment

**Related Plan**: ci-cd-agent-testing-plan.instructions.md
**Implementation Date**: 2026-03-17

## Summary

Implements full CI/CD automation for agent testing and deployment: fixes 3 broken existing workflows, configures sample-app test infrastructure, creates an agent validation script (structural + cross-reference + domain checks), builds a CI workflow with 4 jobs covering all 15 agents across 4 domains, and adds a CD workflow deploying 25 files to `.github-private` with SHA-256 integrity verification.

## Changes

### Added

* `sample-app/package-lock.json` — Generated lockfile for `npm ci` in CI workflows
* `sample-app/jest.config.ts` — Jest configuration with jsdom environment, `@/` alias mapping, coverage reporters
* `sample-app/.eslintrc.json` — ESLint config extending `next/core-web-vitals` for `next lint` in CI
* `scripts/validate-agents.mjs` — Agent validation script: Tier 1 structural, Tier 2 cross-reference, Tier 4 domain content checks with SARIF + JSON + Job Summary output (749 lines)
* `scripts/package.json` — Dependencies for validation script (gray-matter, minimatch)
* `scripts/package-lock.json` — Lockfile for validation script dependencies
* `.github/workflows/ci-full-test.yml` — CI workflow with 4 jobs: agent-validation, apm-security, sample-app-quality, summary; triggers on push/PR to main
* `.github/workflows/deploy-to-github-private.yml` — CD workflow with deploy + verify jobs; syncs 25 files to .github-private with SHA-256 integrity verification

### Modified

* `.github/workflows/security-scan.yml` — Replaced invalid job-level `hashFiles()` on container job with step-level Dockerfile existence check; gated Build, Trivy scan, and SARIF upload steps
* `.github/workflows/finops-cost-gate.yml` — Removed redundant job-level `hashFiles()` check; workflow-level `paths:` filter provides equivalent gating
* `.github/workflows/code-quality.yml` — Added `defaults.run.working-directory: sample-app` to lint, type-check, and test jobs; added `cache-dependency-path` for npm cache
* `sample-app/package.json` — Added `eslint`, `eslint-config-next`, `@types/jest`, `ts-node` to devDependencies (required for CI commands)
* `.gitignore` — Added `validation-results.json` and `validation-results.sarif` to ignore; un-ignored `scripts/package-lock.json`

### Removed

## Additional or Deviating Changes

* Security domain keyword check in `validate-agents.mjs` broadened beyond OWASP/CWE to also accept CIS, NIST, and OpenSSF references
  * 3 security agents (IaCSecurityAgent, PipelineSecurityAgent, SecurityPlanCreator) use CIS Azure benchmarks, NIST 800-53, and OpenSSF standards — agent files are the source of truth
* `sample-app/package.json` required 4 additional devDependencies not in the original plan: `eslint`, `eslint-config-next`, `@types/jest`, `ts-node`
  * These were infrastructure gaps discovered during Phase 2 validation — all required for CI commands to succeed
* Deployment tagging step (tagging source repo with `deploy/github-private/YYYYMMDD-HHMMSS-{run_number}`) deferred to follow-on work
  * The CD workflow commits and pushes to `.github-private` but does not tag the source repo

## Release Summary

Total files affected: 15 (8 added, 6 modified, 0 removed)

Files created:
* `sample-app/package-lock.json` — Lockfile enabling `npm ci` in CI
* `sample-app/jest.config.ts` — Jest configuration for sample-app testing
* `sample-app/.eslintrc.json` — ESLint configuration for `next lint`
* `scripts/validate-agents.mjs` — Agent validation script (749 lines, Tier 1+2+4)
* `scripts/package.json` — Validation script dependencies
* `scripts/package-lock.json` — Validation script lockfile
* `.github/workflows/ci-full-test.yml` — CI workflow (4 jobs, triggers on push/PR to main)
* `.github/workflows/deploy-to-github-private.yml` — CD workflow (2 jobs, syncs 25 files with SHA-256 verification)

Files modified:
* `.github/workflows/security-scan.yml` — Fixed invalid `hashFiles()` at job level
* `.github/workflows/finops-cost-gate.yml` — Removed redundant `hashFiles()` check
* `.github/workflows/code-quality.yml` — Added working directory for sample-app
* `sample-app/package.json` — Added 4 missing devDependencies
* `.gitignore` — Updated ignore patterns for validation outputs
* `.copilot-tracking/` — Planning and tracking artifacts updated

Dependency changes:
* `gray-matter` ^4.0.3 and `minimatch` ^9.0.0 added to `scripts/package.json`
* `eslint` ^8.57.0, `eslint-config-next` ^14.2.0, `@types/jest` ^29.5.0, `ts-node` ^10.9.0 added to `sample-app/package.json`

Deployment prerequisites (not in this change):
* GitHub App with `contents: write` on `devopsabcs-engineering/.github-private`
* Secrets `DEPLOY_APP_ID` and `DEPLOY_APP_PRIVATE_KEY` in source repo settings
