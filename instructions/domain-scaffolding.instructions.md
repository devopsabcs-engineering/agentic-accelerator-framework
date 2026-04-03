---
description: "Conventions and standards for scaffolding new domain scanner and workshop repositories in the Agentic Accelerator Framework"
applyTo: "**"
---

# Domain Scaffolding Conventions

These conventions apply when generating new domain scanner and workshop repositories. All scaffolded repos MUST follow these standards to maintain parity with existing Accessibility and FinOps domains.

## Naming Conventions

### Repository Names

| Pattern | Example | Description |
|---------|---------|-------------|
| `{domain}-scan-demo-app` | `code-quality-scan-demo-app` | Scanner platform and demo app hub |
| `{domain}-scan-workshop` | `code-quality-scan-workshop` | Hands-on workshop content |

### Demo App Directories

Use a short domain prefix followed by `-demo-app-{NNN}`:

| Domain | Prefix | App Directories |
|--------|--------|-----------------|
| Accessibility | `a11y` | `a11y-demo-app-001` through `005` |
| FinOps | `finops` | `finops-demo-app-001` through `005` |
| Code Quality | `cq` | `cq-demo-app-001` through `005` |

### Agent Names

Follow PascalCase naming with domain-specific prefixes:

| Role | Pattern | Example |
|------|---------|---------|
| Detector | `{Domain}Detector` | `CodeQualityDetector` |
| Resolver | `{Domain}Resolver` | `A11yResolver` |
| Scaffolder | `DomainScaffolder` | `DomainScaffolder` (shared) |

### Copilot Artifact Files

| Artifact | Pattern | Example |
|----------|---------|---------|
| Agent | `{domain}-{role}.agent.md` | `code-quality-detector.agent.md` |
| Instruction | `{domain}.instructions.md` | `code-quality.instructions.md` |
| Prompt | `{domain}-{action}.prompt.md` | `code-quality-scan.prompt.md` |
| Skill | `{domain}-scan/SKILL.md` | `code-quality-scan/SKILL.md` |

## SARIF Standards

All scanning output MUST comply with SARIF v2.1.0 per `.github/copilot-instructions.md`.

### automationDetails.id Prefix

Each domain uses a unique prefix for `automationDetails.id`:

| Domain | Prefix | Example |
|--------|--------|---------|
| Accessibility | `accessibility-scan/` | `accessibility-scan/https://example.com` |
| FinOps | `finops-finding/v1` | `finops-finding/v1` |
| Code Quality | `code-quality/` | `code-quality/coverage/` |
| Security | `security/` | `security/sast/` |

### partialFingerprints

Include `partialFingerprints` for deduplication across runs. Hash the combination of `ruleId` and `target` (file path or URL).

### Severity Mapping

Map tool-native severities to SARIF levels per the framework standard:

| Severity | SARIF Level | Description |
|----------|-------------|-------------|
| CRITICAL | `error` | Immediate risk — must fix before merge |
| HIGH | `error` | Significant risk — block merge |
| MEDIUM | `warning` | Moderate risk — address in current sprint |
| LOW | `note` | Minor risk — track for improvement |

## Bootstrap Script Conventions

### Script Names

Every domain uses exactly 4 bootstrap scripts plus a data pipeline script:

| Script | Purpose |
|--------|---------|
| `setup-oidc.ps1` | Azure AD app + federated credentials for GitHub Actions |
| `setup-oidc-ado.ps1` | Azure AD app for ADO Workload Identity Federation |
| `bootstrap-demo-apps.ps1` | Create GitHub repos, push content, set secrets |
| `bootstrap-demo-apps-ado.ps1` | Create ADO repos, variable groups, pipelines |
| `scan-and-store.ps1` | Parse SARIF results and upload to ADLS Gen2 |

### Azure AD App Naming

| Platform | Pattern | Example |
|----------|---------|---------|
| GitHub | `{domain}-scan-demo-app-oidc` | `code-quality-scan-demo-app-oidc` |
| ADO | `{domain}-scan-demo-app-ado-oidc` | `code-quality-scan-demo-app-ado-oidc` |

### Secret Names (GitHub)

| Secret | Value |
|--------|-------|
| `AZURE_CLIENT_ID` | Azure AD application client ID |
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |

### Variable Group Names (ADO)

| Variable Group | Content |
|----------------|---------|
| `{domain}-common` | Shared variables (resource group, location, subscription) |
| `{domain}-oidc` | OIDC credentials (client ID, tenant ID, subscription ID) |

## CI/CD Pipeline Conventions

### Pipeline Naming

| Platform | Pattern | Example |
|----------|---------|---------|
| GitHub Actions | `{domain}-scan.yml` | `code-quality-scan.yml` |
| GitHub Actions | `{domain}-lint-gate.yml` | `code-quality-lint-gate.yml` |
| ADO Pipelines | `{domain}-scan.yml` | `code-quality-scan.yml` |
| ADO Pipelines | `scan-and-store.yml` | `scan-and-store.yml` |

### Matrix Strategy

Central scan workflows MUST use matrix strategy for multi-app scanning:

```yaml
strategy:
  matrix:
    app: [001, 002, 003, 004, 005]
```

### SARIF Upload

| Platform | Method | Action/Task |
|----------|--------|-------------|
| GitHub | CodeQL upload | `github/codeql-action/upload-sarif@v4` |
| ADO | Advanced Security publish | `AdvancedSecurity-Publish@1` |

### SARIF Category

Use domain-prefixed categories for multi-tool result separation:

```yaml
category: "{domain}-scan/${{ matrix.app }}"
```

## Power BI PBIP Conventions

### Directory Structure

Place PBIP files in `power-bi/` at the repo root:

```text
power-bi/
├── {Domain}Report.pbip
├── {Domain}Report.Report/
└── {Domain}Report.SemanticModel/
```

### Star Schema

- Fact table: `Fact_{Domain}Findings`
- Shared dimension: `Repositories` with `scan_domain` column
- Tool dimension: `ScanTools`
- Date dimension: `Dim_Date` (DAX-generated)
- Domain-specific dimensions as needed

### TMDL Files

One `.tmdl` file per table in `definition/tables/`. Use descriptive table names matching the star schema.

### Data Source

Connect to Azure Data Lake Storage Gen2 via `AzureStorage.DataLake()` with OAuth (Organizational Account). Store scan results in date-partitioned paths: `{yyyy}/{MM}/{dd}/{appId}-{tool}.json`.

## Workshop Lab Conventions

### Lab Numbering

| Lab | Content | Notes |
|-----|---------|-------|
| lab-00 | Prerequisites and setup | Always first |
| lab-01 | Explore demo apps and violations | Introduction |
| lab-02 through lab-05 | Tool-specific labs | Domain-dependent |
| lab-06 (GitHub) | GitHub Actions + Security tab | Platform-specific |
| lab-06 (ADO) | ADO Pipelines + Advanced Security | ADO variant |
| lab-07 (GitHub) | Remediation via GitHub | Platform-specific |
| lab-07 (ADO) | Remediation via ADO | ADO variant |
| lab-08 | Power BI dashboard | Always last |

### ADO-Specific Labs

ADO variants use the `-ado` suffix in directory names:

- `lab-06-ado-pipelines/` (not `lab-06-ado/`)
- `lab-07-ado-remediation/` (not `lab-07-ado/`)

### Lab README Structure

Each lab README MUST include:

1. **Objective** — what the learner achieves.
2. **Prerequisites** — prior labs and tools needed.
3. **Steps** — numbered instructions with screenshots.
4. **Validation** — how to verify completion.
5. **Summary** — key takeaways.

## Demo App Violation Requirements

Each sample app MUST contain intentional violations producing a minimum of **15 findings** across all scanning tools.

### Violation Categories by Domain

| Domain | Required Violations |
|--------|---------------------|
| Accessibility | WCAG 2.2 Level AA failures (color contrast, missing alt text, missing labels) |
| FinOps | Cost governance failures (oversized SKUs, missing tags, no autoscale) |
| Code Quality | Coverage < 80%, CCN > 10, code duplication, lint violations |
| Security | OWASP Top 10 violations (injection, auth failures, misconfigurations) |

### Code Quality Specific Violations

For code quality domain apps, include:

- **Coverage**: Intentionally low test coverage (< 50% line coverage).
- **Complexity**: Functions with cyclomatic complexity > 10 (deeply nested conditionals, switch statements).
- **Duplication**: Copied code blocks across multiple files.
- **Lint**: Unused variables, missing type annotations, inconsistent formatting.

## Screenshot Conventions

### Manifest-Driven Capture

All screenshot capture MUST be driven by `scripts/screenshot-manifest.json`. Adding a new screenshot means adding a JSON entry, not modifying PowerShell code.

### Phase Definitions

| Phase | Name | Dependency |
|-------|------|------------|
| 1 | Offline | None — CLI output, local files |
| 2 | App-dependent | Deployed demo apps |
| 3 | GitHub Web UI | GitHub authentication |
| 4 | ADO Web UI | ADO authentication |

### Image Naming

Follow the pattern `lab-{NN}-{description}.png`:

- Use the lab number with zero padding (e.g., `01`, `02`).
- Use lowercase hyphenated descriptions (e.g., `eslint-results`, `security-tab`).
- Place images in the corresponding `images/lab-{NN}/` directory.

### Screenshot Inventory

Each `images/lab-{NN}/` directory MUST contain a `README.md` listing all screenshots with descriptions, used for tracking completeness.
