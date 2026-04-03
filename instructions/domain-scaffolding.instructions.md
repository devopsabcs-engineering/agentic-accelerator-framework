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

## Platform and Shell Conventions

All commands generated in screenshot manifests, lab instructions, bootstrap scripts, and CI/CD pipeline steps MUST use PowerShell Core syntax. This ensures cross-platform compatibility and consistency.

### Forbidden Unix Commands

| Unix Command | PowerShell Equivalent |
|-------------|----------------------|
| `head -n N` | `Select-Object -First N` |
| `tail -n N` | `Select-Object -Last N` |
| `cat file` | `Get-Content file` |
| `2>/dev/null` | `2>$null` |
| `/tmp/` | `$env:TEMP` |
| `./script` | `.\script` |
| `./gradlew` | `.\gradlew.bat` (Windows) or document both variants |

### Rules

1. Never use bash-specific syntax (`#!/bin/bash`, `$(command)` for subshells, `export VAR=value`).
2. Use PowerShell parameter syntax (`-ParameterName Value`) instead of flag syntax (`--flag value`) where the tool supports it.
3. For Gradle commands, always show the Windows variant (`.\gradlew.bat`) as primary and note the Unix variant in parentheses.
4. For Python commands, use `python` (not `python3`) and document virtual environment activation with PowerShell syntax.

## Bootstrap Script Idempotency

All bootstrap scripts (`bootstrap-demo-apps.ps1`, `bootstrap-demo-apps-ado.ps1`, `setup-oidc.ps1`, `setup-oidc-ado.ps1`) MUST be fully idempotent — safe to re-run at any point without errors or data loss.

### Required Guard Patterns

Every resource creation step MUST check for existing resources before creating. The following 11 guard patterns are required:

| # | Resource | Guard Command | Action on Exists |
|---|----------|---------------|------------------|
| 1 | GitHub repo | `gh repo view $fullRepo --json name` | Skip creation, continue with content push |
| 2 | Repo content | `gh api "repos/$fullRepo/commits?per_page=1" --jq 'length'` | Skip push if repo has commits |
| 3 | Topics | `gh repo edit --add-topic` | Additive — safe to repeat |
| 4 | Code scanning | `gh api repos/$fullRepo/code-scanning/default-setup -X PATCH -f state=configured` | Catch failure gracefully |
| 5 | OIDC secrets | `gh secret set` | Overwrite is safe |
| 6 | Environment | `gh api repos/$fullRepo/environments/$env --method PUT` | PUT is idempotent |
| 7 | Wiki | `git clone --depth 1 $wikiUrl` | If succeeds, wiki exists; otherwise collect for manual step |
| 8 | Azure AD app | `az ad app list --display-name $name --query "[0]"` | Reuse existing appId |
| 9 | Federated credential | `az ad app federated-credential list` then check `$existingCredNames -contains $credName` | Skip if exists |
| 10 | Service principal | `az ad sp list --filter "appId eq '$appId'" --query "[0]"` | Reuse existing SP |
| 11 | Role assignment | `az role assignment list --assignee $spId --role $role --scope $scope --query "[0]"` | Skip if assigned |

### Bootstrap Script Pattern

```powershell
# Guard pattern example — GitHub repo creation
$repoCheck = gh repo view "$Org/$RepoName" --json name 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating repository $Org/$RepoName..." -ForegroundColor Green
    gh repo create "$Org/$RepoName" --public --description "$Description"
} else {
    Write-Host "Repository $Org/$RepoName already exists — skipping creation." -ForegroundColor Yellow
}
```

### `$ErrorActionPreference`

Set `$ErrorActionPreference = "Stop"` at the top of every bootstrap script for fail-fast behavior. Guard patterns handle expected "already exists" scenarios explicitly.

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

## Individual Demo App Repositories

Each sample app directory (`{prefix}-demo-app-001` through `005`) is pushed to its own GitHub repository by the bootstrap script. Each individual repo MUST include a `.github/workflows/deploy.yml` workflow.

### Deploy Workflow Requirements

Every per-app deploy.yml MUST include these stages:

1. **Azure Login** — OIDC federated credential login (`azure/login@v2`)
2. **Resource Group** — Create or verify resource group via `az group create`
3. **Infrastructure** — Deploy `infra/main.bicep` via `az deployment group create`
4. **Build** — Language-specific build step (see table below)
5. **Deploy** — Deploy to Azure App Service or Container App
6. **Health Check** — Verify the deployed app responds with HTTP 200
7. **Summary** — Write deployed URL and status to `$GITHUB_STEP_SUMMARY`

### Language-Specific Build Steps

| Language | Build Command | Output |
|----------|---------------|--------|
| C# | `dotnet publish -c Release -o ./publish` | `./publish/` directory |
| Python | `pip install -r requirements.txt` | In-place |
| Java | `.\gradlew.bat build` (or `mvn package`) | `build/libs/*.jar` or `target/*.jar` |
| TypeScript | `npm ci && npm run build` | `dist/` or `.next/` directory |
| Go | `go build -o ./app .` | `./app` binary |

### Workflow Permissions

```yaml
permissions:
  id-token: write
  contents: read
```

## Repository Metadata

Both generated repositories MUST have metadata configured via bootstrap scripts or repository setup steps.

### Metadata Requirements

| Setting | Demo App Repo | Workshop Repo |
|---------|---------------|---------------|
| Description | Required — scanner purpose and scope | Required — workshop purpose |
| Topics | Required — domain tags array | Required — domain tags + `workshop` |
| Template flag | No | Yes — `gh repo edit --template` |
| GitHub Pages | No | Yes — branch: `main`, folder: `/` |
| Website URL | No | Yes — GitHub Pages URL |

### Topics Array

Include domain-relevant topics in the bootstrap script. Example for Code Quality:

```powershell
$topics = @('code-quality', 'sarif', 'eslint', 'coverage', 'complexity', 'demo-app')
foreach ($topic in $topics) {
    gh repo edit "$Org/$RepoName" --add-topic $topic
}
```

### GitHub Pages Setup

For workshop repos, enable GitHub Pages after pushing content:

```powershell
gh api "repos/$Org/$WorkshopRepo/pages" --method POST -f source='{"branch":"main","path":"/"}'
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

1. **YAML frontmatter** — Add before the heading:

   ```yaml
   ---
   permalink: /labs/lab-NN-description/
   title: "Lab NN: Title"
   description: "One-sentence lab description"
   ---
   ```

2. **Metadata table** — Add immediately after the `# Lab NN:` heading:

   ```markdown
   | Duration | Level | Prerequisites |
   |----------|-------|---------------|
   | NN min | Beginner/Intermediate/Advanced | Lab NN-1 |
   ```

3. **Working directory callout** — Required for labs that run commands in a different repo:

   ```markdown
   > **Working Directory**: Run the following commands from the `{domain}-scan-demo-app` repository root.
   ```

4. **Learning Objectives** — First section after metadata, listing 3-5 bullet points of what the learner will accomplish.
5. **Objective** — What the learner achieves.
6. **Prerequisites** — Prior labs and tools needed.
7. **Steps** — Numbered instructions with screenshots embedded using:

   ```markdown
   ![Step description](../images/lab-NN/lab-NN-step-description.png)
   ```

8. **Verification Checkpoint** — Learner self-check between Steps and Summary to confirm expected outcomes.
9. **Validation** — How to verify completion.
10. **Summary** — Key takeaways.
11. **Screenshot embedding** — All screenshots referenced in Steps MUST use relative paths to the `images/lab-NN/` directory.

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

## ESLint Configuration Requirements

All JavaScript and TypeScript sample apps MUST include ESLint configuration to ensure the code quality scanner can produce lint findings.

### ESLint v9+ Flat Config

Use the flat config format (`eslint.config.mjs`) for ESLint v9 and above. Do NOT use legacy `.eslintrc.*` files.

### Required Configuration

1. Import `@eslint/eslintrc` for `FlatCompat` bridge when using framework-specific plugins.
2. Include `@typescript-eslint/recommended` for TypeScript apps.
3. Add framework-specific extends (e.g., `next/core-web-vitals` for Next.js).
4. Configure intentional violations (e.g., `"prefer-const": "warn"`) so the scanner produces findings.

### Template Reference

Use the ESLint configuration template from the scaffolding skill (`skills/domain-scaffolding/SKILL.md`) for the complete flat config pattern.

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

### PowerShell Mandate

All `command` values in screenshot manifests MUST use PowerShell Core syntax. See the Forbidden Unix Commands table in the Platform and Shell Conventions section for required translations.

### `workingDir` Field

Manifest entries for commands that run inside demo app directories MUST include `"workingDir": "demo-app"`. The capture script resolves this to the sibling `{domain}-scan-demo-app` directory.

### PATH Forwarding

The capture script MUST forward the current `$env:PATH` (including Python Scripts directory) to child processes spawned for `freeze-execute` commands. Use `$env:PATH = "$env:USERPROFILE\AppData\Local\Programs\Python\Python312\Scripts;$env:PATH"` or equivalent.

### `DemoAppDir` Parameter

The capture script MUST accept a `-DemoAppDir` parameter for explicitly specifying the sibling demo-app repo path instead of assuming a relative path.

## Mermaid Diagram Support

Workshop repositories MUST support Mermaid diagrams in lab markdown rendered via GitHub Pages (Jekyll).

### Requirements

1. Include `_includes/head-custom.html` with Mermaid v11 ESM import.
2. The script converts `language-mermaid` code blocks to `<div class="mermaid">` elements at runtime.
3. Use the Mermaid support template from the scaffolding skill.
4. Labs MAY use fenced code blocks with `mermaid` language identifier for architecture diagrams, flow charts, and sequence diagrams.

## Playwright Authentication State

Workshop screenshot manifests reference `github-auth.json` and `ado-auth.json` for authenticated page captures (Phase 3 and Phase 4 screenshots). These auth state files MUST be bootstrapped before running the capture script.

### Auth State Setup Workflow

1. Run `npx playwright codegen --save-storage=github-auth.json github.com` to interactively log in and save browser state.
2. For ADO: Run `npx playwright codegen --save-storage=ado-auth.json dev.azure.com` similarly.
3. Store auth state files in the workshop `scripts/` directory (gitignored).

### Requirements

1. The workshop `.gitignore` MUST include `*-auth.json` to prevent credential leakage.
2. Lab 00 (Prerequisites) MUST include auth state setup instructions.
3. The screenshot manifest MUST reference auth state files via the `storageState` field.
4. The capture script MUST emit a clear error message if the auth state file is missing when processing Phase 3 or Phase 4 screenshots.
