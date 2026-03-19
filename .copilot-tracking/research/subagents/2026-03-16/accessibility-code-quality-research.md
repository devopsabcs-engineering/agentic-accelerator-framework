# Accessibility Compliance Agents & Code Quality Agents Research

## Research Status: Complete

---

## Part 1: Accessibility Compliance Agents

### 1.1 How the Accessibility Scanner Works

The `accessibility-scan-demo-app` is a full-stack Next.js application that scans web pages for WCAG 2.2 Level AA compliance. It uses a **three-engine architecture**:

| Engine | Role | Technology |
|---|---|---|
| **axe-core** (primary) | Runs axe-core directly on the page via `@axe-core/playwright` | `axe-core` v4.10+, Playwright |
| **IBM Equal Access** (secondary) | Runs IBM's `accessibility-checker` ACE engine in an isolated Playwright page | `accessibility-checker` |
| **Custom Playwright checks** (5 checks) | DOM inspection for patterns not covered by engines | Playwright `page.evaluate()` |

**Scan flow:**

1. Launch Playwright Chromium (headless)
2. Navigate to URL with `waitUntil: 'networkidle'`
3. Run axe-core with WCAG tags: `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']`
4. Run IBM Equal Access in isolated page context (prevents JS corruption)
5. Run 5 custom Playwright checks: ambiguous-link-text, aria-current-page, emphasis-strong-semantics, discount-price-accessibility, sticky-element-overlap
6. Normalize and deduplicate results across engines (by selector + WCAG tag, keeping higher severity)
7. Compute weighted score (critical=10, serious=7, moderate=3, minor=1) with POUR principle breakdown
8. Output in requested format (JSON, SARIF, JUnit XML, HTML, PDF)

**Key source files:**

- `src/lib/scanner/engine.ts` — Three-engine scanner with WCAG 2.2 tag support
- `src/lib/scanner/custom-checks.ts` — 5 custom Playwright checks
- `src/lib/scanner/result-normalizer.ts` — Multi-engine result merging and deduplication
- `src/lib/scoring/calculator.ts` — Weighted impact scoring, grades A–F
- `src/lib/scoring/wcag-mapper.ts` — Maps WCAG tags to POUR principles
- `src/lib/report/sarif-generator.ts` — SARIF 2.1.0 output generator

### 1.2 SARIF Output Format and Integration

#### How the Scanner Produces SARIF Results

The scanner generates SARIF v2.1.0 compliant output via `src/lib/report/sarif-generator.ts`:

**Core interfaces:**

```typescript
interface SarifLog {
  $schema: string;  // 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json'
  version: '2.1.0';
  runs: SarifRun[];
}

interface SarifRun {
  tool: {
    driver: {
      name: string;           // 'accessibility-scanner'
      version: string;
      informationUri: string;
      semanticVersion: string;
      rules: SarifRule[];
    };
  };
  automationDetails?: { id: string };  // 'accessibility-scan/<url>'
  results: SarifResult[];
}
```

**axe-core → SARIF mapping:**

| axe-core Field | SARIF Field |
|---|---|
| `violation.id` | `result.ruleId` + `rule.id` |
| `violation.impact` | `result.level` mapped: critical/serious → error, moderate → warning, minor → note |
| `violation.description` | `rule.fullDescription.text` |
| `violation.help` | `rule.shortDescription.text` |
| `violation.helpUrl` | `rule.helpUri` + embedded in `rule.help.markdown` |
| `violation.tags` | `rule.properties.tags` (includes `accessibility`, WCAG tags like `wcag143`) |
| `violation.nodes[].target` | `result.locations[].physicalLocation` using URL-to-artifact-path mapping |

**Impact → severity mapping:**

| axe-core Impact | SARIF Level | `problem.severity` | `security-severity` |
|---|---|---|---|
| critical | error | error | 9.0 |
| serious | error | error | 7.0 |
| moderate | warning | warning | 4.0 |
| minor | note | recommendation | 1.0 |

**Key SARIF enrichment fields:**

- `help.markdown` — Includes rule description, WCAG mapping, remediation guidance, and learn-more links (GitHub does NOT render `helpUri` — URLs must be embedded in markdown)
- `properties.precision` — Mapped from engine: axe-core → `very-high`, IBM → `high`
- `properties.tags` — Includes `accessibility` tag plus WCAG SC tags for GitHub filtering
- `partialFingerprints` — Hash of `ruleId:target` for deduplication across runs
- `automationDetails.id` — Includes category prefix for multi-tool scenarios

**Two generator functions:**

- `generateSarif(url, violations, toolVersion)` — Single-page SARIF with one run
- `generateSiteSarif(pages[], toolVersion)` — Multi-run SARIF for site crawls (one run per page)

#### How SARIF Results Are Consumed by GitHub Security Overview

1. SARIF files are uploaded via `github/codeql-action/upload-sarif@v4` in GitHub Actions
2. Requires `security-events: write` permission on the workflow
3. Results appear in **Security Tab > Code Scanning Alerts**
4. GitHub uses `partialFingerprints.primaryLocationLineHash` for deduplication
5. `automationDetails.id` categorizes results (format: `category/run-id`)
6. Rules displayed with `help.markdown` content inline
7. Results filterable by `properties.tags` (e.g., filter by `accessibility` tag)

**GitHub SARIF limits:**

| Constraint | Limit |
|---|---|
| Max gzip-compressed file size | 10 MB |
| Results per run | 25,000 (top 5,000 displayed, prioritized by severity) |
| Rules per run | 25,000 |
| Runs per file | 20 |
| Tags per rule | 20 (10 displayed) |
| Locations per result | 1,000 (100 displayed) |
| Alert limit | 1,000,000 |

**Required SARIF properties for GitHub display:**

- `$schema` and `version: '2.1.0'` — required
- `tool.driver.name` and `tool.driver.rules[]` — required
- `results[].ruleId`, `results[].message.text`, `results[].locations[]` — required
- `physicalLocation.artifactLocation.uri` — required (relative to repo root preferred)
- `physicalLocation.region.startLine` — required for inline display
- `help.text` — required; `help.markdown` recommended (displayed instead of text when available)
- `partialFingerprints` — required for deduplication

### 1.3 WCAG 2.2 Scanning Implementation

**axe-core tag configuration:**

```typescript
.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
```

| Tag | WCAG Version | Level |
|---|---|---|
| `wcag2a` | 2.0 | A |
| `wcag2aa` | 2.0 | AA |
| `wcag21a` | 2.1 | A |
| `wcag21aa` | 2.1 | AA |
| `wcag22aa` | 2.2 | AA |
| `best-practice` | N/A | N/A |

**WCAG 2.2 new success criteria (Level AA):**

| SC | Title | Automatable |
|---|---|---|
| 2.4.11 | Focus Not Obscured (Minimum) | Partially — custom check for `position: sticky/fixed` |
| 2.5.7 | Dragging Movements | Manual review required |
| 2.5.8 | Target Size (Minimum) | Partially — check min 24×24 CSS pixels |
| 3.2.6 | Consistent Help | Manual review required |
| 3.3.7 | Redundant Entry | Manual review required |
| 3.3.8 | Accessible Authentication (Minimum) | Manual review required |

**AODA context:** Ontario's AODA legally requires WCAG 2.0 Level AA. Conforming to WCAG 2.2 Level AA automatically satisfies AODA requirements and anticipates future policy updates.

**Automated detection coverage:** axe-core can automatically find ~57% of WCAG issues. Another ~25% are partially automatable. Remaining ~35-40% require manual testing.

### 1.4 CI/CD Workflow Integration

#### GitHub Actions Workflow

The scanner provides a **composite GitHub Action** at `action/action.yml`:

```yaml
- uses: devopsabcs-engineering/accessibility-scan-demo-app@main
  with:
    url: https://example.com
    mode: single          # or "crawl"
    threshold: 70
    max-pages: 50         # crawl mode only
    output-format: sarif  # json, sarif, or junit
    output-directory: ./a11y-results
```

**Outputs:** `score` (0–100), `passed` (true/false), `report-path`

**Complete workflow pattern (from `a11y-scan.yml`):**

1. Matrix strategy scans multiple target URLs independently
2. Each site scanned via deployed app's CI API (`POST /api/ci/scan` with `format=sarif`)
3. SARIF uploaded via `github/codeql-action/upload-sarif@v4` with per-site categories
4. Schedule: weekly (Monday 06:00 UTC) + manual dispatch
5. Permissions: `contents: read`, `security-events: write`

**CI threshold gating:**

- Minimum score (0-100, default 70)
- Per-impact maximum violation counts: `{ critical: 0, serious: 2, moderate: 10, minor: 999 }`
- Rule fail list (specific rules that must not have violations)
- Exit codes: 0 = passed, 1 = failed, 2 = error

**Self-testing CI pattern:**

The scanner scans *itself* in CI using Playwright e2e tests with a strict threshold (90 score, 0 critical/serious):

```yaml
- name: Install Playwright Chromium
  run: npx playwright install --with-deps chromium
- name: Self-scan accessibility tests
  run: npm run test:a11y
```

#### Azure DevOps Pipeline

Ready-to-use pipeline YAML with JUnit format for native ADO test results:

```yaml
- script: npx a11y-scan scan --url "$(SCAN_URL)" --threshold 80 --format junit --output results.xml
- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'JUnit'
    failTaskOnFailedTests: true
```

### 1.5 Custom GHCP Agents for Accessibility

Two declarative `.agent.md` agents exist in `devopsabcs-engineering/.github-private`:

#### A11y Detector Agent (`a11y-detector.agent.md`)

- **Purpose:** Detects AODA WCAG 2.2 violations through static code analysis and runtime scanning
- **Coverage:** ~35-40% of WCAG 2.2 criteria fully automated, ~25% partially automatable
- **Capabilities:**
  1. Static HTML/JSX/TSX analysis (missing alt, labels, heading hierarchy, lang, ARIA patterns)
  2. CSS/Tailwind analysis (contrast, focus styles, target sizes, zoom restrictions)
  3. Runtime scanning via CLI (`npx a11y-scan scan --url <url>` or `crawl`)
  4. WCAG 2.2 specific checks (focus obscured, drag alternatives, target sizes)
  5. Structured reporting by POUR principle and impact severity
- **Tools:** `read_file`, `grep_search`, `semantic_search`, `file_search`, `list_dir`, `run_in_terminal`
- **Handoff:** Offers handoff to A11y Resolver for automated fixes
- **Top 10 violations checked:** color-contrast, image-alt, link-name, button-name, label, html-has-lang, heading-order, empty-heading, document-title, aria-hidden-focus
- **Grep patterns used:** `<img(?![^>]*alt)`, `<Image(?![^>]*alt)`, `<html(?![^>]*lang)`, `<div[^>]*onClick`, `maximum-scale`, `aria-hidden`

#### A11y Resolver Agent (`a11y-resolver.agent.md`)

- **Purpose:** Resolves AODA WCAG 2.2 violations with standards-compliant code fixes
- **Fix prioritization:** critical → serious → moderate → minor
- **Capabilities:**
  1. Accepts violations from Detector handoff, scan results, or user description
  2. 18-row remediation lookup table mapping violation IDs to WCAG SC and standard fixes
  3. React/Next.js specific patterns: `useId()` for unique IDs, `<Image alt>`, layout.tsx lang
  4. WCAG 2.2 specific fixes: `scroll-padding-top` for focus obscured, min 24×24 targets
  5. Verification via re-scan and test execution
- **Tools:** `read_file`, `replace_string_in_file`, `multi_replace_string_in_file`, `create_file`, `grep_search`, `run_in_terminal`, `get_errors`
- **Handoff:** Offers re-scan via A11y Detector for verification

#### Supporting Files

| File | Purpose |
|---|---|
| `instructions/wcag22-rules.instructions.md` | WCAG 2.2 Level AA rules by POUR principle, auto-applied to TSX/JSX/TS/HTML/CSS |
| `instructions/a11y-remediation.instructions.md` | 19-row remediation lookup table with React/Next.js code examples |
| `prompts/a11y-scan.prompt.md` | Quick scan prompt delegating to A11y Detector |
| `prompts/a11y-fix.prompt.md` | Quick fix prompt delegating to A11y Resolver |

#### VS Code vs GitHub Platform

Both agents work cross-platform:

- **VS Code:** `.agent.md` files in `.github/agents/` load in the VS Code agent picker. Tools mapped to VS Code tool IDs. Agents run locally.
- **GitHub.com:** Same `.agent.md` files read from `.github/agents/` in the repository. GitHub Copilot resolves agents server-side. No server infrastructure needed — purely declarative.
- **Key constraint:** Omitting the `target` field from frontmatter enables cross-platform compatibility.

### 1.6 Pushing Results to Microsoft Defender for DevOps

**Microsoft Defender for Cloud DevOps security** provides:

1. **Unified visibility** into DevOps security posture across Azure DevOps, GitHub, and GitLab
2. **Code scanning findings** (code, secrets, dependency, IaC) grouped by severity
3. **Pull request annotations** for remediation guidance
4. **DevOps environment posture management** recommendations

**Integration path for accessibility scan results:**

1. SARIF results uploaded to GitHub Code Scanning via `upload-sarif` action
2. GitHub repositories onboarded to Defender for Cloud via the GitHub connector
3. Defender for Cloud ingests Code Scanning alerts from onboarded repositories
4. Accessibility findings appear in the DevOps Security console alongside other scan types
5. Security teams see accessibility violations alongside code vulnerabilities, secret leaks, and IaC misconfigurations

**Requirements:**

- GitHub Advanced Security (GHAS) enabled or public repository
- GitHub organization connected to Defender for Cloud
- `security-events: write` permission in workflows
- SARIF files compliant with GitHub's supported subset

### 1.7 Patterns for Turning Accessibility Checks into Compliance Controls

| Pattern | Implementation |
|---|---|
| **Threshold gating** | CI fails when score < threshold or critical/serious violations > 0 |
| **SARIF → Security Overview** | Upload SARIF to GitHub Code Scanning for organization-wide visibility |
| **Scheduled scanning** | Weekly cron job scans production URLs, publishes SARIF |
| **PR annotations** | SARIF results annotate PR diffs with inline a11y violations |
| **Self-testing** | App scans itself in CI (strict 90+ score, 0 critical/serious) |
| **Multi-site matrix** | Matrix strategy scans multiple URLs with per-site SARIF categories |
| **Config-as-code** | `.a11yrc.json` defines per-project standards (WCAG2A/AA/AAA), thresholds, and output |
| **Agent-assisted triage** | A11y Detector agent detects issues; A11y Resolver agent applies fixes with verification |
| **Dual-engine validation** | axe-core + IBM Equal Access cross-validate findings for higher coverage |
| **Defender for Cloud rollup** | GitHub → Defender for Cloud aggregates across all repositories |

---

## Part 2: Code Quality Agents

### 2.1 Code Coverage Enforcement Agents

**Existing pattern in accessibility-scan-demo-app (CI workflow):**

```
Unit tests with Vitest and coverage (thresholds: 80% lines, 80% statements, 80% functions, 65% branches)
```

The CI uses `vitest run --coverage` with `davelosert/vitest-coverage-report-action@v2` to post coverage reports on PRs.

**Agent pattern for code coverage enforcement:**

An agent-based approach would:

1. **Detect:** Read coverage reports (lcov, cobertura, JSON) and identify files/functions below threshold
2. **Report:** Generate structured findings showing uncovered code areas with priority
3. **Resolve:** Use Copilot to generate tests for uncovered code paths
4. **Gate:** Fail CI if coverage drops below configured threshold

**Agent definition pattern (analogous to A11y agents):**

```yaml
---
name: Coverage Enforcer
description: 'Enforces code coverage thresholds and generates tests for uncovered code'
tools:
  - read_file
  - grep_search
  - semantic_search
  - run_in_terminal
  - create_file
  - replace_string_in_file
handoffs:
  - label: "Generate Tests"
    agent: Test Generator
    prompt: "Generate tests for the uncovered code identified above"
---
```

### 2.2 Code Coverage Results in SARIF Format

SARIF is primarily designed for **static analysis findings** (violations, warnings) rather than coverage metrics. However, code coverage gaps can be reported as SARIF results:

**Mapping coverage to SARIF:**

| Coverage Concept | SARIF Mapping |
|---|---|
| Uncovered function | `result` with `ruleId: "uncovered-function"` |
| Uncovered branch | `result` with `ruleId: "uncovered-branch"` |
| File below threshold | `result` with `ruleId: "coverage-threshold-violation"` |
| Uncovered line range | `physicalLocation.region` with startLine/endLine |

**Example SARIF rule for coverage:**

```json
{
  "id": "coverage-below-threshold",
  "name": "CoverageBelowThreshold",
  "shortDescription": { "text": "Function has coverage below 80% threshold" },
  "fullDescription": { "text": "Code coverage for this function is below the required 80% threshold" },
  "defaultConfiguration": { "level": "warning" },
  "properties": {
    "tags": ["code-quality", "coverage"],
    "precision": "very-high",
    "problem.severity": "warning"
  }
}
```

**Considerations:**

- Each uncovered code region becomes a SARIF `result` with `physicalLocation` pointing to the file and line range
- Coverage percentage can be embedded in `message.text`
- GitHub Code Scanning would display uncovered regions as alerts inline in PRs
- `partialFingerprints` based on file path + function name for deduplication
- `automationDetails.id` with category `code-coverage/` for separation from other tools

**Alternative approach:** Rather than converting full coverage to SARIF, only report **coverage regressions** or **files/functions below threshold** as SARIF findings. This keeps the result count manageable within GitHub's 25,000-result limit.

### 2.3 Tools for Measuring Code Coverage Across Multiple Languages

| Language | Coverage Tool | Output Formats |
|---|---|---|
| **JavaScript/TypeScript** | Vitest, Jest, c8, Istanbul/nyc | lcov, cobertura, JSON, HTML, clover |
| **Python** | coverage.py, pytest-cov | lcov, XML (cobertura), JSON, HTML |
| **.NET/C#** | dotnet test + coverlet | cobertura, opencover, lcov, JSON |
| **Java** | JaCoCo, Cobertura, Clover | XML, HTML, CSV |
| **Go** | `go test -coverprofile` | Go cover profile, convertible to lcov |
| **Rust** | cargo-llvm-cov, tarpaulin | lcov, cobertura, HTML, JSON |
| **Ruby** | SimpleCov | JSON, HTML, lcov |
| **PHP** | PHPUnit | Clover XML, Cobertura, HTML |

**Universal report formats for CI integration:**

- **lcov** — Most widely supported, text-based line coverage
- **Cobertura XML** — Standard for Azure DevOps `PublishCodeCoverageResults`
- **JUnit XML** — Test results (not coverage), but widely supported for pass/fail

**GitHub Actions coverage tools:**

| Tool | Purpose |
|---|---|
| `davelosert/vitest-coverage-report-action` | Posts Vitest coverage reports as PR comments |
| `irongut/CodeCoverageSummary` | Creates summary from Cobertura XML |
| `codecov/codecov-action` | Uploads to Codecov for trend tracking |
| `coverallsapp/github-action` | Uploads to Coveralls |
| `MishaKav/jest-coverage-comment` | Posts Jest coverage as PR comment |

### 2.4 GitHub Copilot for Increasing Code Coverage

**Patterns for using Copilot to improve coverage:**

1. **Direct test generation:** Ask Copilot to "write tests for uncovered functions in [file]"
2. **Coverage-gap analysis:** Ask Copilot to read coverage reports and identify critical gaps
3. **Edge case discovery:** Copilot can identify untested edge cases from code analysis
4. **Test fixture generation:** Generate realistic test data for complex scenarios
5. **Agent-based workflow:**
   - Agent reads coverage report → identifies lowest-covered files
   - Generates test skeletons for uncovered functions
   - Runs tests to verify they pass
   - Re-measures coverage to confirm improvement

**Custom agent pattern:**

```markdown
## Test Generator Agent

### Step 1: Analyze Coverage
Read coverage report and identify files/functions below threshold.

### Step 2: Prioritize
Rank uncovered code by:
1. Critical business logic paths
2. Error handling branches
3. Edge cases in public APIs

### Step 3: Generate Tests
For each uncovered function/branch:
1. Read the source code
2. Identify inputs, outputs, and side effects
3. Generate test cases covering happy path + error paths
4. Use existing test patterns from the codebase

### Step 4: Verify
Run the test suite and re-check coverage.
```

### 2.5 Code Quality Agent Patterns

**Quality dimensions an agent can enforce:**

| Dimension | Detection Method | Enforcement |
|---|---|---|
| **Code coverage** | Coverage reports (lcov, cobertura) | Fail if < 80% |
| **Lint compliance** | ESLint, Prettier, Stylelint | Fail on any error |
| **Type safety** | TypeScript strict mode, `tsc --noEmit` | Fail on type errors |
| **Complexity** | Cyclomatic complexity via ESLint rules | Warn if function > 10 |
| **Duplication** | jscpd, SonarQube | Warn if duplication > 5% |
| **Dependency health** | npm audit, Dependabot | Fail on critical vuln |
| **Accessibility** | axe-core, IBM Equal Access (see Part 1) | SARIF → Security Overview |
| **Security** | CodeQL, Semgrep, Snyk | SARIF → Security Overview |

**Agent architecture (modeled on A11y Detector/Resolver pattern):**

1. **Code Quality Detector Agent** — Scans codebase for quality issues (coverage, complexity, duplication, lint)
2. **Code Quality Resolver Agent** — Applies fixes (auto-fix lint, generate tests, reduce complexity)
3. **Handoff workflow:** Detector → Resolver → Re-scan verification

### 2.6 CI/CD Quality Gate Integration

**Multi-layer quality gate pattern:**

```yaml
# .github/workflows/ci.yml quality gate pattern
jobs:
  quality:
    steps:
      - name: Lint
        run: npm run lint
      - name: Type check
        run: npx tsc --noEmit
      - name: Unit tests + coverage
        run: npm run test:ci  # vitest run --coverage
      - name: Coverage threshold check
        run: |
          # Check coverage meets 80% threshold
          node -e "const c = require('./coverage/coverage-summary.json'); 
          if (c.total.lines.pct < 80) process.exit(1);"
      - name: Build
        run: npm run build
      - name: Accessibility self-scan
        run: npm run test:a11y
      - name: Upload SARIF (accessibility)
        uses: github/codeql-action/upload-sarif@v4
        with:
          sarif_file: ./a11y-results/results.sarif
          category: accessibility-scan
      - name: Upload SARIF (coverage-quality)
        uses: github/codeql-action/upload-sarif@v4
        with:
          sarif_file: ./quality-results/coverage.sarif
          category: code-quality
```

### 2.7 SARIF-Based Quality Reporting to Security Overview

**Strategy for unified quality + security reporting:**

1. **Each quality tool produces SARIF** with distinct `automationDetails.id` categories:
   - `accessibility-scan/` — accessibility violations
   - `code-quality/coverage/` — coverage gaps
   - `code-quality/complexity/` — complexity warnings
   - `security/codeql/` — code vulnerabilities
   - `security/secrets/` — secret scanning

2. **Upload all SARIF files** via `github/codeql-action/upload-sarif@v4` with `category` parameter

3. **GitHub Security Overview** aggregates all categories:
   - Filter by tool name, severity, tag
   - Track trends over time
   - Export to Defender for Cloud via GitHub connector

4. **Rule tagging strategy:**
   - `accessibility` tag for a11y findings
   - `code-quality` tag for coverage/complexity
   - `security` tag for vulnerability findings
   - Enables cross-cutting views in Security Overview

---

## References and Evidence

### Accessibility Scanner Repository

- `devopsabcs-engineering/accessibility-scan-demo-app` — Full-stack WCAG 2.2 scanner
  - `src/lib/report/sarif-generator.ts` — SARIF v2.1.0 generator with `generateSarif()` and `generateSiteSarif()`
  - `src/lib/scanner/engine.ts` — Three-engine scanner (axe-core + IBM + custom)
  - `src/lib/ci/formatters/sarif.ts` — CI SARIF formatter (thin wrapper)
  - `src/lib/ci/threshold.ts` — Threshold evaluation for CI quality gates
  - `action/action.yml` — Composite GitHub Action
  - `.github/workflows/a11y-scan.yml` — Scheduled SARIF scanning workflow
  - `.copilot-tracking/research/2026-03-12/sarif-github-code-scanning-research.md` — SARIF gap analysis
  - `.copilot-tracking/research/subagents/2026-03-06/cicd-integration-research.md` — CI/CD integration research
  - `.copilot-tracking/research/2026-03-08/copilot-a11y-agents-research.md` — Custom Copilot agents research

### Custom GHCP Agents

- `devopsabcs-engineering/.github-private`
  - `agents/a11y-detector.agent.md` — A11y Detector agent (8,484 chars, 5-step protocol)
  - `agents/a11y-resolver.agent.md` — A11y Resolver agent (7,820 chars, 6-step protocol)
  - `instructions/wcag22-rules.instructions.md` — WCAG 2.2 Level AA rules by POUR principle
  - `instructions/a11y-remediation.instructions.md` — 19-row remediation lookup table
  - `prompts/a11y-scan.prompt.md` — Quick scan prompt
  - `prompts/a11y-fix.prompt.md` — Quick fix prompt

### External References

- [GitHub SARIF Support for Code Scanning](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning) — Supported properties, file limits, fingerprinting
- [SARIF v2.1.0 OASIS Spec](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html) — Full specification
- [Microsoft Defender for Cloud DevOps Security](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-devops-introduction) — GitHub integration, DevOps security console
- [axe-core (Deque Systems)](https://github.com/dequelabs/axe-core) — 6.9k stars, 13M+ dependents, WCAG 2.2 AA
- [IBM Equal Access](https://github.com/IBMa/equal-access) — 737 stars, WCAG 2.0/2.1/2.2 support
- [microsoft/accessibility-insights-action](https://github.com/microsoft/accessibility-insights-action) — Microsoft's a11y CI action (ADO only, GitHub decommissioned)

---

## Discovered Topics

1. **SARIF for non-source-code findings:** Accessibility violations lack `region.startLine` because they come from DOM scanning (not source code). The scanner maps URLs to artifact paths instead — this is an accepted pattern but means inline PR annotations are limited.
2. **Multi-category SARIF uploads:** Using `automationDetails.id` with category prefixes enables multiple tools to upload SARIF to the same repository without conflicts. This pattern extends to quality tools.
3. **Defender for Cloud ingestion:** GitHub Code Scanning alerts flow automatically to Defender for Cloud when the GitHub connector is configured — no additional SARIF upload needed.
4. **Agent-to-agent handoff:** The A11y Detector → A11y Resolver handoff pattern is reusable for any detect → fix workflow (coverage detection → test generation, security scan → fix).
5. **Self-testing pattern:** Having the application scan *itself* in CI creates a continuous compliance loop — this pattern applies to code quality self-checks as well.

## Recommended Next Research

- [ ] Research specific tools for converting code coverage reports (lcov/cobertura) to SARIF format
- [ ] Investigate Codecov/Coveralls integration patterns for multi-repo coverage dashboards
- [ ] Research SonarQube SARIF export capabilities for code quality metrics
- [ ] Explore GitHub Copilot Extensions API for building custom quality enforcement extensions
- [ ] Research Azure DevOps `PublishCodeCoverageResults` → Defender for Cloud integration path
- [ ] Investigate Semgrep custom rules for accessibility-specific code patterns
- [ ] Research patterns for cross-language coverage aggregation in monorepos
- [ ] Explore GitHub Actions reusable workflow patterns for quality gate standardization across repos

## Clarifying Questions

1. **Scope of code quality agents:** Should the framework define agents for all quality dimensions (coverage, complexity, duplication, security) or focus on a specific subset?
2. **Coverage-to-SARIF tool:** Is there a preferred existing tool for converting coverage reports to SARIF, or should the framework include a custom converter?
3. **Multi-language support:** Which specific languages does the framework need coverage enforcement for? This affects tool selection.
4. **Defender for Cloud tier:** Is GitHub Advanced Security (GHAS) available on the target repositories? SARIF upload to Code Scanning requires GHAS on private repos.
5. **Agent hosting:** Should quality agents live in `.github-private` (org-wide) or per-repository `.github/agents/`?
