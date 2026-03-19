---
applyTo: '.copilot-tracking/changes/2026-03-18/agentic-devsecops-workshop-changes.md'
---
<!-- markdownlint-disable-file -->
# Implementation Plan: Agentic DevSecOps Workshop Repository

## Overview

Build a complete hands-on workshop repository (`agentic-devsecops-workshop`) with 12 progressive labs that teach developers to set up, run, and extend AI-powered DevSecOps agents from the Agentic DevSecOps Framework — starting from zero experience and ending with custom agent authoring and CI/CD integration with GitHub Security tab.

## Objectives

### User Requirements

* Create a workshop repository at `devopsabcs-engineering/agentic-devsecops-workshop` — Source: User request (conversation)
* Design 12 lab modules with progressive difficulty (beginner → advanced) — Source: Research, Section "Task Implementation Requests"
* Students run each agent manually in VS Code and visualize findings — Source: Research, Section "Task Implementation Requests"
* Students set up GitHub Actions pipelines and view results in GitHub Security tab — Source: Research, Section "Task Implementation Requests"
* Include screenshot placeholders for each step — Source: Research, Section "Task Implementation Requests"
* Repository uses GitHub template pattern for student onboarding — Source: Research, Section "Repository Strategy"
* Workshop modeled after gh-abcs-developer with time estimates, learning objectives, and verification checkpoints — Source: Research, Section "Task Implementation Requests"

### Derived Objectives

* Copy framework assets (agents, instructions, prompts, skills, sample-app) into workshop repo — Derived from: Self-contained workshop requirement; agents must be discoverable by VS Code Copilot Chat in the student's repo
* Adapt 4 GitHub Actions workflows for the workshop context — Derived from: CI/CD labs require working pipelines; remove org-specific workflows (deploy-to-github-private, apm-security)
* Create images/ directory structure with 46 screenshot placeholders organized by lab — Derived from: Screenshot strategy research findings
* Write supporting community files (CODE_OF_CONDUCT.md, CONTRIBUTING.md, LICENSE) — Derived from: Template repository best practice from gh-abcs-developer and GitHub Skills patterns
* Create ADO work items (Epic → Feature → User Stories) following project conventions — Derived from: ADO workflow instructions require every commit to trace to a work item

## Context Summary

### Project Files

* `.copilot-tracking/research/2026-03-18/agentic-devsecops-workshop-research.md` — Primary research document with complete workshop design
* `.copilot-tracking/research/subagents/2026-03-18/codebase-analysis-research.md` — Framework inventory: 15 agents, 40+ issues, 7 workflows
* `.copilot-tracking/research/subagents/2026-03-18/reference-workshop-research.md` — gh-abcs-developer, MOAW, GitHub Skills patterns
* `.copilot-tracking/research/subagents/2026-03-18/workshop-module-design-research.md` — Repo strategy, 12-lab plan, screenshot inventory
* `agents/` — 15 agent definitions to copy (security, accessibility, code quality, FinOps)
* `instructions/` — 3 instruction files to copy
* `prompts/` — 2 prompt templates to copy
* `skills/` — 2 skill packages to copy
* `sample-app/` — Next.js 14 app with 40+ intentional vulnerabilities
* `.github/workflows/` — 7 GitHub Actions workflows (4 relevant for workshop)

### References

* https://github.com/devopsabcs-engineering/agentic-devsecops-workshop — Target workshop repository (empty)
* https://github.com/githubdevopsabcs/gh-abcs-developer — Reference workshop pattern
* `.github/copilot-instructions.md` — SARIF output standard, severity classification, agent output format
* `.github/instructions/ado-workflow.instructions.md` — ADO branching, commit messages, PR workflow

### Standards References

* `.github/instructions/ado-workflow.instructions.md` — ADO work item hierarchy and branching conventions
* `.github/copilot-instructions.md` — SARIF v2.1.0 output standard and agent conventions

## Implementation Checklist

### [x] Implementation Phase 1: ADO Work Items and Repository Bootstrap

<!-- parallelizable: false -->

* [x] Step 1.1: Create ADO Epic "Agentic DevSecOps Workshop"
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 14-35)
* [x] Step 1.2: Create ADO Feature "Workshop Repository Setup" under the Epic
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 37-48)
* [x] Step 1.3: Create ADO User Story "Initialize workshop repository structure" under the Feature
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 50-60)
* [x] Step 1.4: Clone the empty workshop repo and create feature branch
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 62-75)
* [x] Step 1.5: Create workshop directory structure
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 77-107)
* [x] Step 1.6: Copy framework assets from agentic-devsecops-framework
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 109-140)
* [x] Step 1.7: Adapt GitHub Actions workflows for workshop context
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 142-177)
* [x] Step 1.8: Create supporting community files
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 179-207)
* [x] Step 1.9: Create workshop README.md with module checklist
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 209-260)
* [x] Step 1.10: Commit, push, create PR, merge
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 262-280)

### [x] Implementation Phase 2: Foundation Labs (Labs 00–02)

<!-- parallelizable: false -->

* [x] Step 2.1: Create ADO User Story "Write foundation labs (00-02)"
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 286-296)
* [x] Step 2.2: Create feature branch for foundation labs
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 298-305)
* [x] Step 2.3: Write Lab 00 — Prerequisites and Environment Setup (30 min, Beginner)
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 307-346)
* [x] Step 2.4: Write Lab 01 — Explore the Sample App (25 min, Beginner)
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 348-387)
* [x] Step 2.5: Write Lab 02 — Understanding Agents, Skills, and Instructions (20 min, Beginner)
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 389-430)
* [x] Step 2.6: Create images/ subdirectories and placeholders for Labs 00–02
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 432-453)
* [x] Step 2.7: Commit, push, create PR, merge
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 455-465)

### [x] Implementation Phase 3: Agent Scanning Labs (Labs 03–05)

<!-- parallelizable: true -->

* [x] Step 3.1: Create ADO User Story "Write agent scanning labs (03-05)"
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 471-481)
* [x] Step 3.2: Create feature branch for scanning labs
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 483-490)
* [x] Step 3.3: Write Lab 03 — Security Scanning with Copilot Agents (40 min, Intermediate)
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 492-537)
* [x] Step 3.4: Write Lab 04 — Accessibility Scanning with Copilot Agents (35 min, Intermediate)
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 539-581)
* [x] Step 3.5: Write Lab 05 — Code Quality Analysis with Copilot Agents (35 min, Intermediate)
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 583-624)
* [x] Step 3.6: Create images/ subdirectories and placeholders for Labs 03–05
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 626-645)
* [x] Step 3.7: Commit, push, create PR, merge
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 647-657)

### [x] Implementation Phase 4: SARIF and CI/CD Labs (Labs 06–08)

<!-- parallelizable: false -->

* [x] Step 4.1: Create ADO User Story "Write SARIF and CI/CD labs (06-08)"
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 663-673)
* [x] Step 4.2: Create feature branch for CI/CD labs
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 675-682)
* [x] Step 4.3: Write Lab 06 — Understanding SARIF Output (30 min, Intermediate)
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 684-722)
* [x] Step 4.4: Write Lab 07 — Setting Up GitHub Actions Pipelines (40 min, Intermediate)
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 724-769)
* [x] Step 4.5: Write Lab 08 — Viewing Results in GitHub Security Tab (25 min, Intermediate)
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 771-808)
* [x] Step 4.6: Create images/ subdirectories and placeholders for Labs 06–08
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 810-832)
* [x] Step 4.7: Commit, push, create PR, merge
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 834-844)

### [x] Implementation Phase 5: Advanced Labs (Labs 09–11)

<!-- parallelizable: true -->

* [x] Step 5.1: Create ADO User Story "Write advanced labs (09-11)"
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 850-860)
* [x] Step 5.2: Create feature branch for advanced labs
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 862-869)
* [x] Step 5.3: Write Lab 09 — FinOps Agents and Azure Cost Governance (45 min, Advanced)
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 871-912)
* [x] Step 5.4: Write Lab 10 — Agent Remediation Workflows (45 min, Advanced)
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 914-958)
* [x] Step 5.5: Write Lab 11 — Creating Your Own Custom Agent (45 min, Advanced)
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 960-1006)
* [x] Step 5.6: Create images/ subdirectories and placeholders for Labs 09–11
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 1008-1027)
* [x] Step 5.7: Commit, push, create PR, merge
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 1029-1039)

### [x] Implementation Phase 6: Repository Configuration and Polish

<!-- parallelizable: false -->

* [x] Step 6.1: Create ADO User Story "Configure repository and enable template"
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 1045-1055)
* [x] Step 6.2: Mark repository as Template Repository in GitHub settings
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 1057-1065)
* [x] Step 6.3: Enable GitHub Pages with Jekyll theme
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 1067-1082)
* [x] Step 6.4: Add .copilot-instructions.md for workshop context
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 1084-1100)
* [x] Step 6.5: (Optional) Add devcontainer.json for Codespaces
  * Details: .copilot-tracking/details/2026-03-18/agentic-devsecops-workshop-details.md (Lines 1102-1134)

### [ ] Implementation Phase 7: Validation

<!-- parallelizable: false -->

* [ ] Step 7.1: Test complete student journey end-to-end
  * Create a new repo from the template using "Use this template"
  * Walk through Labs 00–08 as a student
  * Verify all agent invocation commands work
  * Verify GitHub Actions trigger and SARIF uploads appear in Security tab
* [ ] Step 7.2: Capture real screenshots during test walkthrough
  * Replace placeholder images with actual screenshots
  * Verify all image paths resolve correctly in rendered markdown
* [ ] Step 7.3: Review all labs for consistency
  * Verify lab numbering and cross-references
  * Verify time estimates are realistic
  * Check all prerequisite chains are correct
* [ ] Step 7.4: Fix minor validation issues
  * Iterate on broken links, typos, formatting
  * Apply fixes directly when corrections are straightforward
* [ ] Step 7.5: Report blocking issues
  * Document issues requiring additional research
  * Provide next steps for unresolved items

## Planning Log

See [agentic-devsecops-workshop-log.md](../../plans/logs/2026-03-18/agentic-devsecops-workshop-log.md) for discrepancy tracking, implementation paths considered, and suggested follow-on work.

## Dependencies

* Git and GitHub CLI for repository operations
* Node.js v20+ for sample-app validation
* VS Code with GitHub Copilot and Copilot Chat extensions for agent testing
* ADO access to `MngEnvMCAP675646` / `Agentic DevSecOps Framework` for work item creation
* GitHub admin access to `devopsabcs-engineering/agentic-devsecops-workshop` for template and Pages settings

## Success Criteria

* Workshop repository contains 12 lab files with consistent structure, time estimates, and learning objectives — Traces to: Research "12-Lab Progressive Plan"
* Framework assets (agents, instructions, prompts, skills, sample-app) are correctly copied and functional — Traces to: Research "Repository Strategy"
* 4 GitHub Actions workflows adapted and functional in workshop context — Traces to: Research "GitHub Actions Workflows"
* 46 screenshot placeholders organized in images/ directory by lab — Traces to: Research "Screenshot Strategy"
* README.md checklist matches gh-abcs-developer pattern with progress tracking — Traces to: Research "gh-abcs-developer repository"
* Repository marked as Template Repository on GitHub — Traces to: User requirement for template pattern
* Student can complete Labs 00–08 (core track) in ~4 hours 40 minutes — Traces to: Research "Delivery Tiers"
* All ADO work items created with proper hierarchy (Epic → Feature → User Stories) and `Agentic AI` tag — Traces to: ADO workflow instructions
