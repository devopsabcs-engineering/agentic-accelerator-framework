<!-- markdownlint-disable-file -->
# Planning Log: Agentic DevSecOps Framework

## Discrepancy Log

Gaps and differences identified between research findings and the implementation plan.

### Unaddressed Research Items

* DR-01: Agent Skills open standard at agentskills.io
  * Source: Research — Potential Next Research section (Line ~875)
  * Reason: Exploratory research topic, not actionable for initial framework implementation
  * Impact: low

* DR-02: OWASP CycloneDX AI BOM for agent configuration tracking
  * Source: Research — Potential Next Research section (Line ~885)
  * Reason: Emerging standard, not yet mature enough for implementation
  * Impact: low

* DR-03: FOCUS (FinOps Open Cost and Usage Specification) for multi-cloud cost data
  * Source: Research — Potential Next Research section (Line ~886)
  * Reason: Framework targets Azure primarily; multi-cloud out of initial scope
  * Impact: low

* DR-04: SonarQube SARIF export for code quality metrics
  * Source: Research — Potential Next Research section (Line ~890)
  * Reason: Framework uses native coverage tools + SARIF conversion; SonarQube is an alternative path
  * Impact: medium

* DR-05: Azure Cost Management MCP server possibilities
  * Source: Research — Potential Next Research section (Line ~895)
  * Reason: MCP server authoring is future extensibility; FinOps agents use SDK directly
  * Impact: low

* DR-06: `protectai/llm-guard` and `deadbits/vigil-llm` semantic scanning
  * Source: Research §7 (Line ~505)
  * Reason: APM `apm audit` is the primary scanner; these are complementary tools for future evaluation
  * Impact: medium

* DR-07: ADO ↔ GitHub migration patterns
  * Source: Research — Potential Next Research section (Line ~882)
  * Reason: Migration is a separate concern outside framework authoring scope
  * Impact: low

* DR-08: Cross-language coverage aggregation for monorepos
  * Source: Research — Potential Next Research section (Line ~892)
  * Reason: Complex aggregation problem; initial implementation targets single-language repos
  * Impact: medium

* DR-09: `.github/skills/` directory and sample `SKILL.md` files
  * Source: User requirement #1 (agents, instructions, prompts, skills), Research §2 complementary artifacts table
  * Reason: Initially omitted from plan — **RESOLVED**: added `skills/a11y-scan/SKILL.md` to Phase 4 Step 4.0 and `skills/security-scan/SKILL.md` to Phase 5 Step 5.0; directory added to Phase 1 Step 1.4
  * Impact: major (resolved)

* DR-10: FinOps workflow SARIF upload for `finops-finding/` category
  * Source: Research §8 SARIF category table lists 10 categories including `finops-finding/`
  * Reason: Initially omitted from Step 8.5 success criteria — **RESOLVED**: added SARIF conversion and upload step to finops-cost-gate workflow
  * Impact: minor (resolved)

* DR-11: MCP server configuration for ADO work items
  * Source: User requirement — "we added mcp.json for ado work items"
  * Reason: Not in original research scope — **RESOLVED**: added `mcp.json` creation in Phase 1 Step 1.5, CODEOWNERS coverage, validation in Details Step 11.6
  * Impact: medium (resolved)

* DR-12: Plan Phase 11 step count mismatch with details file
  * Source: Plan Phase 11 (8 steps: 11.1-11.8) vs Details Phase 11 (9 steps: 11.1-11.9)
  * Reason: Details file added Step 11.6 (Validate mcp.json Configuration) when `mcp.json` was introduced, but the plan was not updated to include this step — **RESOLVED**: Plan Phase 11 now has 9 steps (11.1-11.9) with Step 11.6 for mcp.json validation, matching details file.
  * Impact: minor (resolved)

* DR-13: Plan line references to details file stale for Phase 2+ after Step 1.5 insertion
  * Source: Plan Steps 2.1-9.2 reference details file by line number
  * Reason: When Step 1.5 (mcp.json, ~24 lines) was inserted into the details file, Phase 2+ content shifted down but the plan's line references were not updated. Example: Step 2.1 references "Lines 151-189" but actual content is at approximately Lines 182-220.
  * Impact: minor — implementer can locate steps by heading; line references are a convenience aid

### Plan Deviations from Research

* DD-01: FinOps cost gate uses Infracost rather than raw Azure Pricing API
  * Research recommends: Azure Pricing API + Cost Management forecasts (Research §6)
  * Plan implements: Infracost as the primary cost estimation tool for CI/CD
  * Rationale: Infracost is a mature CI/CD-native tool with Terraform/Bicep support, PR comment integration, and established GitHub Action. Raw Azure Pricing API would require significant custom development for the same result.

* DD-02: Agent definitions designed for `.github-private` org-wide deployment from the start
  * Research recommends: Organization-wide deployment via `.github-private` as the final deployment target, with initial creation in repo-scoped `.github/agents/`
  * Plan implements: Repo-root layout (`agents/`, `instructions/`, `prompts/`, `skills/`) matching `.github-private` structure from the start
  * Rationale: User decision to design for org-wide deployment immediately. This eliminates the repo-to-org promotion step. The repository structure directly mirrors `.github-private` so it can be adopted as-is or mirrored. **Updated from original DD-02 based on user clarification.**

* DD-03: Code Quality and FinOps agents are new designs without proven implementation
  * Research recommends: Follow the proven Detector ↔ Resolver pattern from accessibility
  * Plan implements: Same pattern applied to new domains
  * Rationale: Pattern is validated in production for security and accessibility. Applying it to code quality and FinOps is a reasonable extension, but these agents lack the battle-testing of the security and a11y agents.

* DD-04: FinOps cost gate SARIF upload alongside PR comment
  * Research recommends: SARIF as universal output format for all scan domains (Research §8)
  * Plan implements: Both Infracost PR comment and SARIF upload with `finops-finding/` category
  * Rationale: PR comment provides developer-facing cost visibility; SARIF upload enables Security Overview and Defender for Cloud governance. Both are needed for full framework coverage. **RESOLVED**: Step 8.5 success criteria now include SARIF upload with `finops-finding/` category.

## Implementation Paths Considered

### Selected: Comprehensive Framework Repository with `.github-private` Org-Wide Layout + Sample App

* Approach: Create all 15+ agents, 5+ workflows, comprehensive documentation, APM integration, `mcp.json` for ADO work items, and a sample/demo Next.js application — all structured with repo-root `agents/`/`instructions/`/`prompts/`/`skills/` layout matching `.github-private` org-wide deployment from the start
* Rationale: User decisions confirm org-wide deployment from the start (eliminating repo-to-org promotion), all agents in first pass (research maturity supports this), sample app needed for testing (validation requires testable targets), and APM + `mcp.json` included immediately
* Evidence: Research document covers all 11 sections with implementation-ready detail; proven patterns exist for 8/15 agents; user confirmed all 5 clarifying questions with clear direction

### IP-01: Incremental Domain Rollout (One Domain at a Time)

* Approach: Implement one agent domain at a time (security first, then a11y, then quality, then FinOps), with separate PRs and validation per domain
* Trade-offs: Lower risk per PR, easier to review, but slower to complete and harder to validate cross-cutting concerns (SARIF categories, CODEOWNERS, governance docs)
* Rejection rationale: The framework needs to demonstrate the full pattern to be useful as a reference. Security and accessibility agents are already proven patterns; the incremental approach adds overhead without proportional risk reduction given the research maturity.

### IP-02: Minimal Viable Framework (Security + Governance Only)

* Approach: Implement only security agents (proven) + CI/CD workflows + governance documentation. Defer accessibility, code quality, FinOps, and APM to follow-on work.
* Trade-offs: Fastest to deliver, lowest risk, but doesn't demonstrate the multi-domain Agentic DevSecOps vision that makes the framework distinctive
* Rejection rationale: The user's requirements explicitly cover all 4 domains. The research document has ready-to-implement specifications for all domains. A security-only framework already exists in `.github-private`; this repo's value is the comprehensive multi-domain approach.

### IP-03: Documentation-First with Sample Agent Stubs

* Approach: Create full documentation set but only stub agent files (YAML frontmatter + skeleton body) with TODO annotations for detailed prompt engineering
* Trade-offs: Complete documentation faster, but agents aren't immediately usable
* Rejection rationale: Research contains enough detail (persona, protocols, checklists, severity frameworks) to create fully functional agent definitions. Stubs would be incomplete deliverables.

## Suggested Follow-On Work

Items identified during planning that fall outside current scope.

* WI-01: Mirror/adopt this repo as `.github-private` for org-wide deployment — Configure the organization's `.github-private` repo to use this repository's `agents/`, `instructions/`, `prompts/`, `skills/` directories (high priority)
  * Source: Research §2 deployment model — repo now structured for direct adoption
  * Dependency: Implementation Phase 11 validation must pass

* WI-02: ~~Create sample/demo application for agent testing~~ — **PROMOTED TO PLAN**: Now Implementation Phase 10. Build a Next.js web app with intentional security, a11y, quality, and cost issues for agent validation.
  * Source: User decision — framework needs a sample app
  * Dependency: N/A — in plan

* WI-03: Investigate APM enterprise governance features — Research APM Security Model, Governance & Compliance, and Teams features for enterprise-scale agent management (medium priority)
  * Source: Research — Potential Next Research section
  * Dependency: Phase 7 (APM integration)

* WI-04: Build coverage-to-SARIF converter script — Create a reusable script that converts lcov/cobertura coverage reports to SARIF v2.1.0 with proper ruleIds and physicalLocations (high priority)
  * Source: Research §5 coverage-to-SARIF mapping
  * Dependency: Phase 5 (Code Quality agents) + Phase 8 Step 8.3 (quality workflow)

* WI-05: Integrate Azure Cost Management MCP server — Author or adopt an MCP server exposing Azure Cost Management API as tools for FinOps agents (low priority)
  * Source: DR-05 unaddressed research item
  * Dependency: Phase 6 (FinOps agents)

* WI-06: Evaluate semantic prompt injection scanners — Test `protectai/llm-guard` and `deadbits/vigil-llm` as complementary scanning alongside APM audit (medium priority)
  * Source: DR-06 unaddressed research item
  * Dependency: Phase 7 (APM integration)

* WI-07: Create Power BI dashboard integration documentation — Document how to connect `advsec-pbi-report-ado` to the framework's ADO Advanced Security findings (medium priority)
  * Source: Research §8 Power BI section
  * Dependency: Phase 9 Step 9.2 (governance docs)

* WI-08: Cross-language coverage aggregation for monorepos — Research and implement aggregation of coverage reports from multiple languages into a single SARIF upload (low priority)
  * Source: DR-08 unaddressed research item
  * Dependency: WI-04 (coverage-to-SARIF converter)

* WI-09: Agent configuration GitHub Rulesets — Configure GitHub Rulesets to protect agent configuration file paths alongside CODEOWNERS (medium priority)
  * Source: Research §7 — APM + GitHub Rulesets integration
  * Dependency: Phase 1 Step 1.3 (CODEOWNERS) + Phase 7 (APM)

* WI-10: ADO Advanced Security REST API custom reporting — Build automation beyond Power BI using the ADO AdvSec REST API at `advsec.dev.azure.com` (low priority)
  * Source: Research — Potential Next Research section
  * Dependency: Phase 9 Step 9.2 (governance docs)
