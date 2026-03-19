<!-- markdownlint-disable-file -->
# Planning Log: Agentic DevSecOps Workshop Repository

## Discrepancy Log

Gaps and differences identified between research findings and the implementation plan.

### Unaddressed Research Items

* DR-01: FinOps agents require Azure subscription — not all students will have one
  * Source: agentic-devsecops-workshop-research.md (Lines 458-460 — Lab 09 prerequisites)
  * Reason: Lab 09 is marked as optional/advanced; students without Azure can skip it. IaC cost analysis can be demonstrated without a live subscription using static analysis.
  * Impact: low

* DR-02: `INTENTIONAL-VULNERABILITY` code markers not confirmed in source
  * Source: agentic-devsecops-workshop-research.md (Lines 156-157 — Code Search Results)
  * Reason: Implementation should verify whether sample-app code contains `INTENTIONAL-VULNERABILITY` comments. If absent, Lab 01 should guide students by file name and code pattern rather than searching for markers.
  * Impact: low

* DR-03: GitHub Codespaces devcontainer.json for zero-install workshops
  * Source: agentic-devsecops-workshop-research.md (Lines 17-18 — Potential Next Research)
  * Reason: Included as optional Step 6.5 in the plan. Not a core requirement — students can use local VS Code install. Prioritize after core labs are written.
  * Impact: low

* DR-04: Instructor guide with talking points and time management
  * Source: agentic-devsecops-workshop-research.md (Lines 19-20 — Potential Next Research)
  * Reason: Excluded from current plan scope. Workshop is designed for both instructor-led and self-paced delivery; instructor guide is follow-on work.
  * Impact: medium

* DR-05: Assessment rubric (pass/fail criteria per lab)
  * Source: agentic-devsecops-workshop-research.md (Lines 21-22 — Potential Next Research)
  * Reason: Verification checkpoints in each lab serve as informal pass/fail criteria. Formal rubric is follow-on work.
  * Impact: low

* DR-06: Azure DevOps parallel track
  * Source: agentic-devsecops-workshop-research.md (Lines 23-25 — Potential Next Research)
  * Reason: Explicitly out of scope per research. Framework includes 3 ADO pipeline samples, but workshop targets GitHub Actions path. ADO path documented as follow-on work.
  * Impact: medium

* DR-07: Detailed step-by-step command sequences and expected outputs per lab
  * Source: agentic-devsecops-workshop-research.md (Lines 14-16 — Potential Next Research)
  * Reason: The plan includes lab outlines with exercises and verification checkpoints. Exact command outputs will be captured during Phase 7 (Validation) when screenshots are taken. Not a gap — it is addressed by the validation phase.
  * Impact: low

* DR-08: `validation-results.sarif` not included in framework asset copy step — **RESOLVED**
  * Source: agentic-devsecops-workshop-research.md (Lab 06, Exercise 6.1 — "Open `validation-results.sarif` from the repo root"); agentic-devsecops-workshop-details.md (Step 1.6 — copy manifest)
  * Reason: Lab 06 Exercise 6.1 references this file at repo root. Initially omitted from Step 1.6. **Fix applied**: Added `validation-results.sarif` to the copy manifest in the implementation details.
  * Impact: medium (resolved)

### Plan Deviations from Research

* DD-01: One Feature instead of multiple Features under the Epic
  * Research recommends: Research does not specify ADO work item granularity below Epic level
  * Plan implements: One Feature with multiple User Stories (one per phase batch)
  * Rationale: Reduces ADO overhead while maintaining traceability. Each phase gets its own User Story and feature branch.

* DD-02: Phase 1 combines repo bootstrap and README into one PR
  * Research recommends: Sequential steps (create repo → copy assets → adapt workflows → write README)
  * Plan implements: All bootstrap steps in a single feature branch and PR
  * Rationale: These steps are tightly coupled and form one logical unit. Splitting into multiple PRs adds unnecessary branch management overhead for what is essentially initial scaffolding.

* DD-03: Solutions directory left empty
  * Research recommends: "(Optional) completed lab solutions" in `solutions/`
  * Plan implements: `solutions/` directory created but left empty
  * Rationale: Solutions can be added as follow-on work after all labs are tested. Including partial solutions could confuse students if incomplete.

* DD-04: Phase 1 initial commit pushed directly to main instead of via PR
  * Plan specifies: Create PR targeting main, merge, delete branch
  * Implementation differs: Pushed feature branch directly to main because the repository was empty (no base branch existed for PR)
  * Rationale: GitHub requires a base branch to create a PR; empty repos have no branches

* DD-05: apm.yml and validation-results.sarif missed in Phase 1 copy
  * Plan specifies: Copy these files in Step 1.6
  * Implementation differs: Files were added in Phase 4 commit instead
  * Rationale: Phase 1 subagent copied directory-level assets but missed root-level individual files; corrected when discovered during Phase 4 SARIF lab creation

* DD-06: GitHub Pages not explicitly enabled via API
  * Plan specifies: Step 6.3 — Enable GitHub Pages via Settings → Pages
  * Implementation differs: _config.yml created but Pages enablement requires manual action in GitHub Settings UI
  * Rationale: GitHub CLI and API do not support enabling Pages directly; the _config.yml is ready for manual enablement

## Suggested Follow-On Work

* WI-01: Capture real screenshots during test walkthrough — Replace placeholder images with actual screenshots during a complete student journey test (Priority: high)
  * Source: Phase 7, Step 7.2
  * Dependency: Template repo must be fully functional

* WI-02: Enable GitHub Pages — Navigate to Settings → Pages and enable deployment from main branch (Priority: medium)
  * Source: Phase 6, Step 6.3
  * Dependency: None

* WI-03: End-to-end student journey validation — Create repo from template, walk through Labs 00-08, verify commands and workflows (Priority: high)
  * Source: Phase 7, Step 7.1
  * Dependency: Pages enabled, workflows functional

* WI-04: Instructor guide with talking points for instructor-led delivery (Priority: low)
  * Source: Research "Potential Next Research"
  * Dependency: Labs finalized

* WI-05: Azure DevOps parallel track — ADO pipeline labs as alternative to GitHub Actions (Priority: low)
  * Source: Research "Potential Next Research"
  * Dependency: GitHub Actions track validated

## Implementation Paths Considered

### Selected: Single Template Repository (Option A)

* Approach: One new repository (`agentic-devsecops-workshop`) containing labs, sample-app, agents, workflows, and screenshots as a GitHub template.
* Rationale: Simplest student experience — one clone, one Security tab, no cross-repo coordination. Matches proven patterns (gh-abcs-developer, GitHub Skills). All framework assets are self-contained.
* Evidence: agentic-devsecops-workshop-research.md (Lines 307-365 — Repository Strategy)

### IP-01: Two Repositories (Workshop + Template App)

* Approach: Separate repos for workshop documentation and template sample app + agents
* Trade-offs: Better separation of concerns but adds significant student friction (two repos to manage, cross-repo links break, Security tab in different repo from lab instructions)
* Rejection rationale: Research evidence shows single-repo pattern is standard for workshops. Added complexity provides no student benefit.

### IP-02: Fork Main Framework Repo

* Approach: Students fork `agentic-devsecops-framework` directly
* Trade-offs: No new repo needed, always up-to-date with framework, but includes operational tooling, GitHub Actions may not run on forks, designed for production not learning
* Rejection rationale: Framework repo includes exec summary generators, ADO MCP config, deploy workflows, and other operational content that confuses workshop students. Workshop needs curated content.

### IP-03: 8-Lab Minimal Plan

* Approach: Compress scanning labs into one mega-lab, skip SARIF deep dive, no advanced labs
* Trade-offs: Shorter workshop but cognitive overload (90+ min mega-lab), loses domain-specific learning
* Rejection rationale: Research found that 40-minute labs with focused topics and domain-specific verification checkpoints produce better learning outcomes than long unfocused sessions.

### IP-04: 16-Lab Granular Plan

* Approach: Split each domain into separate scan and remediation labs (16 total)
* Trade-offs: Very granular progression but too many small labs, increased overhead per lab
* Rejection rationale: Per-lab overhead (setup, summary, transitions) exceeds benefit. 12-lab plan groups appropriately and keeps half-day core track under 5 hours.

## Suggested Follow-On Work

Items identified during planning that fall outside current scope.

* WI-01: Instructor guide with talking points and pacing — Create a proctor/instructor companion document with session timing, talking points per lab, Q&A suggestions, and break recommendations for instructor-led delivery (medium priority)
  * Source: DR-04, Research "Potential Next Research"
  * Dependency: All labs completed (Phase 5)

* WI-02: Azure DevOps parallel lab track — Create parallel versions of Labs 07–08 using Azure DevOps Pipelines instead of GitHub Actions, using the 3 ADO pipeline samples already in the framework (medium priority)
  * Source: DR-06, Research "Potential Next Research"
  * Dependency: GitHub Actions labs completed (Phase 4)

* WI-03: Assessment rubric per lab — Formalize verification checkpoints into a grading rubric with pass/fail criteria for each lab exercise, suitable for academic or certification use (low priority)
  * Source: DR-05, Research "Potential Next Research"
  * Dependency: All labs completed, at least one full student walkthrough

* WI-04: Completed solutions in `solutions/` directory — Provide reference solutions for each lab showing expected agent outputs, fixed code, and generated tests, so students can self-check or instructors can demo (low priority)
  * Source: DD-03, Research "Repository Structure"
  * Dependency: All labs tested in Phase 7

* WI-05: Add `INTENTIONAL-VULNERABILITY` code markers to sample-app — Add inline code comments marking each intentional vulnerability by category (Security, A11y, Quality, FinOps) so students can search for them (low priority)
  * Source: DR-02, Research "Code Search Results"
  * Dependency: None — can be done in framework repo first, then copied

* WI-06: GitHub Codespaces full support — Create devcontainer.json, test end-to-end in Codespaces, update Lab 00 with Codespaces alternative path (low priority)
  * Source: DR-03, Research "Potential Next Research"
  * Dependency: Phase 1 completed (repo structure exists)
