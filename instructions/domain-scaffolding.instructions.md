---
description: "Conventions and standards for scaffolding new domain scanner and workshop repositories in the Agentic Accelerator Framework"
applyTo: "**"
---

# Domain Scaffolding Conventions

These conventions apply when generating new domain scanner and workshop repositories. All scaffolded repos MUST follow these standards to maintain parity with existing Accessibility, Code Quality, and FinOps domains.

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

Every per-app deploy.yml MUST use **containerized deployment** (Web App for Containers). Do NOT use Oryx-based source deployment — it fails for Go and is fragile for other languages. The container approach works identically for all 5 languages and mirrors production deployment patterns.

Every per-app deploy.yml MUST include these stages:

1. **Azure Login** — OIDC federated credential login (`azure/login@v2`)
2. **Resource Group** — Create or verify resource group via `az group create`
3. **Infrastructure** — Deploy `infra/main.bicep` via `az deployment group create` (provisions ACR + Web App for Containers)
4. **Build & Push** — Build Docker image and push to ACR via `az acr build`
5. **Deploy** — Deploy container to Web App for Containers via `azure/webapps-deploy@v3` with `images:` parameter
6. **Health Check** — Verify the deployed app responds with HTTP 200
7. **Summary** — Write deployed URL and status to `$GITHUB_STEP_SUMMARY`

### Language-Specific Build Steps

Language-specific build steps are **no longer needed** in the deploy workflow because all apps are built via `docker build` using their `Dockerfile`. Each demo app MUST include a production-ready `Dockerfile`.

### Deploy Workflow Environment Name

All deploy workflows MUST use `environment: prod` (not `production`). This MUST match the OIDC federated credential subject: `repo:{org}/{repo}:environment:prod`. Mismatched environment names cause OIDC login failures.

### Workflow Permissions

```yaml
permissions:
  id-token: write
  contents: read
```

## Global Uniqueness via Bicep `uniqueString()`

Many workshop students deploy simultaneously to the same Azure subscription. All globally-scoped Azure resource names MUST include `uniqueString(resourceGroup().id)` in Bicep to avoid naming collisions.

### Resources Requiring Global Uniqueness

| Resource | Name Pattern | Bicep Expression |
|----------|-------------|-----------------|
| ACR | `acr{uniqueString}` | `'acr${uniqueString(resourceGroup().id)}'` |
| App Service | `{appName}-{uniqueString}` | `'${appName}-${uniqueString(resourceGroup().id)}'` |
| App Service Plan | `plan-{appName}-{uniqueString}` | `'plan-${appName}-${uniqueString(resourceGroup().id)}'` |
| Storage Account | `st{uniqueString}` | `'st${uniqueString(resourceGroup().id)}'` |

### Bicep Template Structure

Every `infra/main.bicep` MUST:

1. Accept a `appName` parameter for logical identification
2. Use `uniqueString(resourceGroup().id)` for all globally-scoped names
3. Provision **ACR** + **App Service Plan** (Linux) + **Web App for Containers**
4. Output the computed ACR name, app name, and default hostname for use by the deploy workflow
5. Use `linuxFxVersion: 'DOCKER|${acrName}.azurecr.io/${appName}:latest'` for container configuration

### Deploy Workflow Deriving Names from Bicep Outputs

Deploy workflows MUST read ACR name and app name from Bicep deployment outputs rather than hardcoding them:

```yaml
- name: Deploy Infrastructure
  id: infra
  run: |
    outputs=$(az deployment group create \
      --resource-group ${{ env.AZURE_RG }} \
      --template-file infra/main.bicep \
      --parameters appName=${{ env.APP_NAME }} \
      --query 'properties.outputs' -o json)
    echo "acrName=$(echo $outputs | jq -r '.acrName.value')" >> $GITHUB_OUTPUT
    echo "appServiceName=$(echo $outputs | jq -r '.appServiceName.value')" >> $GITHUB_OUTPUT
```

## Containerized Deployment Conventions

### Dockerfile Requirements

Every demo app MUST include a `Dockerfile` that:

1. Uses a multi-stage build where appropriate (e.g., build stage + runtime stage)
2. Exposes a PORT (default `3000` for Node, `5000` for Python, `8080` for Java/Go/.NET)
3. Sets a `HEALTHCHECK` instruction or relies on the App Service health probe
4. Is optimized for layer caching (dependencies before source code)

### ACR Build Pattern

Use `az acr build` instead of `docker build` + `docker push` — it avoids needing Docker-in-Docker in GitHub Actions runners:

```yaml
- name: Build and Push to ACR
  run: |
    az acr build \
      --registry ${{ steps.infra.outputs.acrName }} \
      --image ${{ env.APP_NAME }}:${{ github.sha }} \
      --image ${{ env.APP_NAME }}:latest \
      .
```

### Web App Container Deploy

```yaml
- name: Deploy to Web App
  uses: azure/webapps-deploy@v3
  with:
    app-name: ${{ steps.infra.outputs.appServiceName }}
    images: ${{ steps.infra.outputs.acrName }}.azurecr.io/${{ env.APP_NAME }}:${{ github.sha }}
```

## Codespace-First Philosophy

All demo apps MUST be runnable and testable inside GitHub Codespaces without Azure deployment. This provides a zero-cost, zero-config development experience for workshop participants.

### Requirements

1. Every demo app MUST include a `README.md` section titled "Run Locally" with:
   ```bash
   docker build -t {prefix}-demo-app-NNN .
   docker run -p 3000:3000 {prefix}-demo-app-NNN
   ```
2. Workshop lab instructions SHOULD include a "Run Locally in Codespace" alternative for each deploy step
3. The workshop `.devcontainer/devcontainer.json` MUST include Docker-in-Docker feature for local builds

## OIDC Script Conventions

### JSON Quoting Fix

When passing JSON to Azure CLI from PowerShell, NEVER use inline `ConvertTo-Json -Compress`. PowerShell mangles the quotes when interpolating. Always write to a temp file:

```powershell
$credParams = @{
    name      = $credName
    issuer    = "https://token.actions.githubusercontent.com"
    subject   = $subject
    audiences = @("api://AzureADTokenExchange")
}
$tempFile = [System.IO.Path]::GetTempFileName()
$credParams | ConvertTo-Json | Set-Content -Path $tempFile -Encoding UTF8
az ad app federated-credential create --id $appId --parameters "@$tempFile"
Remove-Item -Path $tempFile -Force
```

### Per-Domain OIDC App Registration

Azure AD federated identity credentials have a **maximum of 20 per app**. With 6+ repos × 3 subjects (main/dev/prod) = 18+, a shared OIDC app across domains will hit this limit. Each domain MUST create its own dedicated app registration.

### Scanner Repo Secrets

The `deploy-all.yml` workflow runs on the scanner repo (`{domain}-scan-demo-app`). The OIDC setup and bootstrap scripts MUST also:

1. Set `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` secrets on the scanner repo
2. Create the `prod` environment on the scanner repo
3. Add federated credentials for `repo:{org}/{domain}-scan-demo-app:environment:prod`

## GitHub Pages Configuration (Workshop)

Workshop repos use the **Just the Docs** Jekyll theme for professional sidebar navigation, search, and copy-to-clipboard code blocks.

### Jekyll Config

Workshop `_config.yml` MUST use these settings for project sites:

```yaml
title: "{Domain Display Name} Scan Workshop"
description: "Hands-on workshop description"
remote_theme: just-the-docs/just-the-docs
baseurl: "/{repo-name}"    # MUST be /{repo-name} for project sites, NOT empty string
url: "https://{org}.github.io"

nav_order_base: 0
heading_anchors: true

exclude:
  - scripts/
  - delivery/
  - .devcontainer/
  - node_modules/
  - package.json
  - package-lock.json
  - Gemfile.lock
```

Do NOT use `theme: just-the-docs` — it only works locally. Use `remote_theme` for GitHub Pages compatibility.

### Gemfile

Workshop `Gemfile` MUST use the `github-pages` gem:

```ruby
source "https://rubygems.org"
gem "github-pages", group: :jekyll_plugins
gem "webrick", "~> 1.8"
```

Do NOT use `gem "jekyll"` or `gem "just-the-docs"` directly — they may not be compatible with GitHub Pages.

### Sidebar Navigation

Just the Docs auto-generates sidebar navigation from all Markdown pages with a `title` in frontmatter. Navigation behavior:

1. **Labs appear automatically** — every lab README with a `title` in frontmatter appears in the sidebar, sorted alphabetically by title.
2. **No `parent`/`nav_order`/`has_children` needed** — the flat lab structure works naturally with alphabetical sorting since lab titles start with `Lab 00:`, `Lab 01:`, etc.
3. **Screenshot inventory pages MUST be excluded** — add `nav_exclude: true` to `images/lab-NN/README.md` frontmatter to prevent screenshot inventory pages from appearing in the sidebar. These are not relevant for workshop participants.
4. **Home page** — `index.md` MUST have `nav_order: 0` to appear first in the sidebar.
5. The `exclude` list in `_config.yml` prevents `scripts/`, `delivery/`, and other non-content directories from being processed by Jekyll.

### Code Block Copy Buttons

Just the Docs automatically adds a copy-to-clipboard button on every fenced code block that has a language tag. To ensure all commands are easily copyable:

1. Always use a language identifier on fenced code blocks: `powershell`, `json`, `yaml`, `text`, `html`, `bash`, etc.
2. Never use bare triple-backtick fences without a language tag.
3. Place each copyable command in its own code block — do not mix commands with output in the same block.
4. Use `powershell` as the language tag for all CLI commands (not `bash` or `shell`).

## Bilingual Workshop Content (English / French)

All workshop repositories MUST include bilingual English/French content. No i18n plugins are used — bilingual support is implemented through directory structure, frontmatter conventions, and a custom sidebar override.

### Directory Structure

English content lives at the repository root. French content lives under a `fr/` directory with identical filenames.

```text
{domain}-scan-workshop/
├── index.md                      # English home (permalink: /)
├── labs/
│   ├── lab-00-setup.md           # English labs
│   ├── lab-01.md
│   └── ...
├── fr/
│   ├── index.md                  # French home (permalink: /fr/)
│   └── labs/
│       ├── lab-00-setup.md       # French labs (same filenames)
│       ├── lab-01.md
│       └── ...
├── images/                       # Shared images (NOT duplicated)
│   ├── lab-00/
│   └── ...
└── _includes/
    └── components/
        └── sidebar.html          # Bilingual sidebar override
```

There is NO `/en/` directory. English is always the root.

### Frontmatter Requirements

| Field | English Pages | French Pages |
|-------|---------------|--------------|
| `nav_exclude` | Not set (default false) | `true` |
| `lang` | Not set | `fr` |
| `layout` | `default` (on index only) | `default` (on index only) |
| `permalink` | `/labs/lab-XX` | `/fr/labs/lab-XX` |
| `title` | English title | French title |
| `description` | English description | French description |

### Language Switcher Convention

Every page MUST include a flag emoji language switcher as the FIRST line of body content, appearing above the logo image.

English pages:

```markdown
> 🇫🇷 **[Version française](fr/)**
```

French pages:

```markdown
> 🇬🇧 **[English version](../)**
```

For lab pages, use the appropriate permalink path (e.g., `> 🇫🇷 **[Version française](/fr/labs/lab-XX)**`).

The language switcher is pure Markdown — no HTML, CSS, or JavaScript is required.

### Custom Sidebar Override

Create `_includes/components/sidebar.html` to provide language-aware sidebar navigation. This overrides the default Just the Docs sidebar component.

When `page.lang == 'fr'`:

- Query all pages with `lang: fr` frontmatter
- Sort by permalink
- Render a flat navigation list with French titles

When English (default):

- Use the standard Just the Docs `site_nav.html` include

Full template:

```html
{%- comment -%}
  Override of just-the-docs sidebar component.
  French pages (lang: fr) get a French navigation sidebar.
  English pages get the original theme sidebar.
{%- endcomment -%}

{%- if page.lang == 'fr' -%}
<header class="side-bar">
  <div class="site-header">
    <a href="{{ '/fr/' | relative_url }}" class="site-title lh-tight">
      {{ site.title }}
    </a>
    <button id="menu-button" class="site-button btn-reset" aria-label="Menu" aria-expanded="false">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><use xlink:href="#svg-menu"></use></svg>
    </button>
  </div>
  <nav aria-label="Main" id="site-nav" class="site-nav">
    <ul class="nav-list">
      {%- assign fr_pages = site.pages | where: "lang", "fr" | sort: "permalink" -%}
      {%- for p in fr_pages -%}
      <li class="nav-list-item">
        <a href="{{ p.permalink | prepend: site.baseurl }}" class="nav-list-link{% if page.permalink == p.permalink %} active{% endif %}">
          {{ p.title }}
        </a>
      </li>
      {%- endfor -%}
    </ul>
  </nav>
  <div class="d-md-block d-none site-footer">
    {%- capture nav_footer_custom -%}{%- include nav_footer_custom.html -%}{%- endcapture -%}
    {%- if nav_footer_custom != "" -%}
      {{ nav_footer_custom }}
    {%- else -%}
      This site uses <a href="https://github.com/just-the-docs/just-the-docs">Just the Docs</a>, a documentation theme for Jekyll.
    {%- endif -%}
  </div>
</header>

{%- else -%}

<header class="side-bar">
  <div class="site-header">
    <a href="{{ '/' | relative_url }}" class="site-title lh-tight">{%- include title.html -%}</a>
    <button id="menu-button" class="site-button btn-reset" aria-label="Menu" aria-expanded="false">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><use xlink:href="#svg-menu"></use></svg>
    </button>
  </div>
  {%- include_cached components/site_nav.html -%}
  <div class="d-md-block d-none site-footer">
    {%- capture nav_footer_custom -%}{%- include nav_footer_custom.html -%}{%- endcapture -%}
    {%- if nav_footer_custom != "" -%}
      {{ nav_footer_custom }}
    {%- else -%}
      This site uses <a href="https://github.com/just-the-docs/just-the-docs">Just the Docs</a>, a documentation theme for Jekyll.
    {%- endif -%}
  </div>
</header>

{%- endif -%}
```

### Translation Conventions

| Translate | Keep in English |
|-----------|-----------------|
| Lab titles and descriptions | Code blocks and commands |
| Prose instructions | YAML frontmatter keys |
| Exercise headers | File paths and tool names |
| Summary and next-steps text | Screenshot alt text |
| Table headers and cell text | URLs and API endpoints |

Common translations:

- Lab → Labo
- Exercise → Exercice
- Checkpoint → Point de vérification
- Next Steps → Prochaines étapes
- Prerequisites → Prérequis

### Image References

English labs reference images from one level up:

```markdown
![Description](../images/lab-XX/screenshot.png)
```

French labs reference images from two levels up (shared, not duplicated):

```markdown
![Description](../../images/lab-XX/screenshot.png)
```

NEVER duplicate images under `fr/`. All screenshots are language-neutral and shared.

## Cross-Workshop Navigation

Each workshop `index.md` and `fr/index.md` MUST include a "Related Repositories" table linking to ALL other domain workshops. When scaffolding a new domain, update all existing workshop repos to add the new domain link.

### Related Repositories Table Template

```markdown
## Related Repositories

| Repository | Description |
|------------|-------------|
| [agentic-accelerator-framework](https://github.com/devopsabcs-engineering/agentic-accelerator-framework) | Framework agents, instructions, and skills |
| [{domain}-scan-demo-app](https://github.com/devopsabcs-engineering/{domain}-scan-demo-app) | Scanner platform and demo applications |
| [agentic-accelerator-workshop](https://github.com/devopsabcs-engineering/agentic-accelerator-workshop) | Main workshop (all domains) |
| [accessibility-scan-workshop](https://devopsabcs-engineering.github.io/accessibility-scan-workshop/) | Accessibility scanning workshop |
| [code-quality-scan-workshop](https://devopsabcs-engineering.github.io/code-quality-scan-workshop/) | Code quality scanning workshop |
| [finops-scan-workshop](https://devopsabcs-engineering.github.io/finops-scan-workshop/) | FinOps scanning workshop |
| [apm-security-scan-workshop](https://devopsabcs-engineering.github.io/apm-security-scan-workshop/) | APM Security scanning workshop |
```

The French `fr/index.md` MUST include the same table with French descriptions.

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

## Bidirectional Repository Linking

Every scaffolded domain MUST establish bidirectional links between the framework, workshop, and scanner repos. This ensures discoverability: a user landing on any one repo can navigate to all related repos.

### Framework README Links

The `agentic-accelerator-framework/README.md` MUST contain two sections referencing all domains:

1. **Workshops section** — links to each domain's GitHub Pages site:

   ```markdown
   ## Workshops

   | Domain | Workshop Site |
   |--------|---------------|
   | Accessibility | [Accessibility Scan Workshop](https://devopsabcs-engineering.github.io/accessibility-scan-workshop/) |
   | Code Quality | [Code Quality Scan Workshop](https://devopsabcs-engineering.github.io/code-quality-scan-workshop/) |
   | FinOps | [FinOps Scan Workshop](https://devopsabcs-engineering.github.io/finops-scan-workshop/) |
   ```

2. **Domain Repositories table** — links to both scanner and workshop repos for each domain:

   ```markdown
   ## Domain Repositories

   | Domain | Scanner Platform | Workshop |
   |--------|------------------|----------|
   | Accessibility | [accessibility-scan-demo-app](https://github.com/devopsabcs-engineering/accessibility-scan-demo-app) | [accessibility-scan-workshop](https://github.com/devopsabcs-engineering/accessibility-scan-workshop) |
   | Code Quality | [code-quality-scan-demo-app](https://github.com/devopsabcs-engineering/code-quality-scan-demo-app) | [code-quality-scan-workshop](https://github.com/devopsabcs-engineering/code-quality-scan-workshop) |
   | FinOps | [finops-scan-demo-app](https://github.com/devopsabcs-engineering/finops-scan-demo-app) | [finops-scan-workshop](https://github.com/devopsabcs-engineering/finops-scan-workshop) |
   ```

When scaffolding a new domain, add a row to both tables.

### Workshop `index.md` Links

The workshop landing page (`{domain}-scan-workshop/index.md`) MUST include:

1. A `> [!NOTE]` callout near the top of the page (after the heading):

   ```markdown
   > [!NOTE]
   > This workshop is part of the [Agentic Accelerator Framework](https://github.com/devopsabcs-engineering/agentic-accelerator-framework).
   ```

2. A "Related Repositories" table at the bottom:

   ```markdown
   ## Related Repositories

   | Repository | Description |
   |------------|-------------|
   | [agentic-accelerator-framework](https://github.com/devopsabcs-engineering/agentic-accelerator-framework) | Framework agents, instructions, and skills |
   | [{domain}-scan-demo-app](https://github.com/devopsabcs-engineering/{domain}-scan-demo-app) | Scanner platform and demo applications |
   | [agentic-accelerator-workshop](https://github.com/devopsabcs-engineering/agentic-accelerator-workshop) | Main workshop (all domains) |
   ```

### Scanner README Links

The scanner repo (`{domain}-scan-demo-app/README.md`) MUST include a "Related Repositories" section at the bottom:

```markdown
## Related Repositories

| Repository | Description |
|------------|-------------|
| [agentic-accelerator-framework](https://github.com/devopsabcs-engineering/agentic-accelerator-framework) | Framework agents, instructions, and skills |
| [{domain}-scan-workshop](https://devopsabcs-engineering.github.io/{domain}-scan-workshop/) | Hands-on workshop (GitHub Pages) |
| [agentic-accelerator-workshop](https://github.com/devopsabcs-engineering/agentic-accelerator-workshop) | Main workshop (all domains) |
```

### Workshop `_config.yml` Image Path Exclusion

The workshop `_config.yml` MUST include a `defaults:` scope that sets `nav_exclude: true` for the `images` path. This prevents screenshot inventory pages from appearing in the sidebar navigation without requiring `nav_exclude: true` frontmatter on every individual `images/lab-NN/README.md`:

```yaml
defaults:
  - scope:
      path: "images"
    values:
      nav_exclude: true
```

### Mermaid Initialization Pattern

The workshop `_includes/head_custom.html` MUST use `startOnLoad: false` with an explicit `await mermaid.run()` call. Do NOT use `startOnLoad: true` — it causes race conditions where the code-block-to-div conversion happens after Mermaid's initial scan:

```html
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: false });
  document.querySelectorAll('pre > code.language-mermaid').forEach(el => {
    const div = document.createElement('div');
    div.className = 'mermaid';
    div.textContent = el.textContent;
    el.parentElement.replaceWith(div);
  });
  await mermaid.run();
</script>
<style>
  .mermaid { text-align: center; }
</style>
```

## Workshop Copilot Artifacts

Workshop repositories MUST include a `.github/` directory with Copilot customization artifacts. These artifacts enable GitHub Copilot to provide domain-aware assistance to workshop participants.

### Required Directory Structure

```text
{domain}-scan-workshop/
└── .github/
    ├── agents/
    │   └── {domain}-workshop.agent.md           # Workshop-specific Copilot agent
    ├── instructions/
    │   └── {domain}-workshop.instructions.md    # Workshop-specific Copilot instructions
    └── copilot-instructions.md                  # Repo-wide Copilot instructions
```

### Minimum Artifacts

| Artifact | File | Purpose |
|----------|------|---------|
| Agent | `.github/agents/{domain}-workshop.agent.md` | Defines a workshop-aware Copilot agent with domain context, lab navigation, and troubleshooting capabilities |
| Instructions | `.github/instructions/{domain}-workshop.instructions.md` | Provides domain-specific conventions, lab structure, and coding patterns for Copilot |
| Copilot Instructions | `.github/copilot-instructions.md` | Repo-wide Copilot instructions referencing the domain agent and instructions files |

### Agent File Conventions

The workshop agent MUST:

1. Reference the domain scan skill for scanning methodology context.
2. Include tools for reading files, searching the codebase, and running terminal commands.
3. Provide guidance on lab completion, troubleshooting common errors, and navigating the workshop structure.

### Instructions File Conventions

The workshop instructions MUST:

1. Define the lab numbering scheme and directory structure.
2. Specify the domain-specific tool stack and configuration.
3. Reference the demo-app repository as the working directory for scanning labs.

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

### Centralized Dashboard Integration

In addition to per-domain PBIPs, the framework provides a centralized `advsec-pbi-report-ado` dashboard that aggregates Advanced Security findings across all domains. New domain PBIPs MUST integrate with this centralized dashboard:

1. **Shared `Repositories` dimension** — use the `scan_domain` column to identify the domain (e.g., `Accessibility`, `CodeQuality`, `FinOps`). This enables cross-domain filtering in the centralized report.
2. **Consistent fact table schema** — align `finding_id`, `repo_name`, `rule_id`, `severity`, `tool_name`, and `scan_date` columns with the centralized schema so the AdvSec report can union findings across domains.
3. **ADLS Gen2 path convention** — store scan results in `{domain}/{yyyy}/{MM}/{dd}/{appId}-{tool}.json` so the centralized report's Power Query expressions can discover data from all domains.
4. **Three-tier architecture** — the centralized `advsec-pbi-report-ado` provides the Advanced Security cross-domain view, while per-domain PBIPs provide domain-specific deep dives. Together they offer a holistic view across all scanning domains.

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

1. **YAML frontmatter** — Add before the heading. The `title` field drives sidebar navigation in Just the Docs (no `parent` or `nav_order` needed — labs sort alphabetically by title):

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

Screenshot inventory READMEs MUST include `nav_exclude: true` in YAML frontmatter to prevent them from appearing in the Just the Docs sidebar navigation:

```yaml
---
nav_exclude: true
---
```

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

1. Include `_includes/head_custom.html` with Mermaid v11 ESM import.
2. The script converts `language-mermaid` code blocks to `<div class="mermaid">` elements at runtime.
3. Use the Mermaid support template from the scaffolding skill.
4. Labs MAY use fenced code blocks with `mermaid` language identifier for architecture diagrams, flow charts, and sequence diagrams.

## Branding Conventions

All scaffolded repositories MUST include framework branding for visual consistency across the ecosystem.

### Branding Assets to Copy

Copy from the framework repo `assets/branding/` to each generated repository's `assets/branding/`:

| Asset | Source Path | Target Repos |
|-------|-----------|--------------|
| `logo-128.png` | `logo/logo-128.png` | Scanner + Workshop |
| `favicon.ico` | `favicon/favicon.ico` | Workshop only |
| `favicon-32x32.png` | `favicon/favicon-32x32.png` | Workshop only |
| `apple-touch-icon.png` | `favicon/apple-touch-icon.png` | Workshop only |

### README Logo Header

Both scanner and workshop READMEs MUST include a centered logo at the top:

```markdown
<p align="center">
  <img src="assets/branding/logo-128.png" alt="Agentic Accelerator Framework" width="100">
</p>
```

### Workshop index.md Logo

The workshop `index.md` landing page MUST include the same centered logo between the YAML frontmatter and the H1 heading.

### Workshop Favicon Links

The workshop `_includes/head_custom.html` MUST include favicon links before the Mermaid script:

```html
<link rel="icon" type="image/x-icon" href="{{ site.baseurl }}/assets/branding/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="{{ site.baseurl }}/assets/branding/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="{{ site.baseurl }}/assets/branding/apple-touch-icon.png">
```

### Social Preview (Manual Step)

Each generated repository SHOULD have its social preview set to `social-preview-1280x640.png` via Settings → General → Social preview. Document this as a manual next step in the scaffolding summary.

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
