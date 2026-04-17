---
title: "DIY: Build the APM Security Domain"
description: "Step-by-step guide for creating the APM Security scanner demo-app and workshop repositories from scratch using the framework's automation artifacts."
ms.date: 2026-04-16
ms.topic: how-to
---

# DIY: Build the APM Security Domain

This guide walks you through creating the APM Security domain's two repositories — `apm-security-scan-demo-app` (scanner platform) and `apm-security-scan-workshop` (hands-on labs) — using the automation artifacts already defined in this framework.

The APM Security domain secures the agent configuration files (`.agent.md`, `.instructions.md`, `.prompt.md`, `SKILL.md`, `copilot-instructions.md`, `apm.yml`, `mcp.json`) that AI coding agents auto-consume as trusted system instructions. It uses a 4-engine scanning architecture to detect hidden Unicode injection, lockfile integrity violations, semantic threat patterns, and MCP misconfigurations.

## Prerequisites

* GitHub CLI (`gh`) authenticated with `devopsabcs-engineering` org access
* Python 3.12+
* Azure CLI (`az`) authenticated with an active subscription
* VS Code with GitHub Copilot and the Agentic Accelerator Framework workspace open
* PowerShell 7+
* Microsoft APM CLI (`npm install -g @microsoft/apm` or via `npx`)

## Step 1: Create GitHub Repositories

Create both repositories in the `devopsabcs-engineering` organization:

**PowerShell:**

```powershell
# Scanner demo-app repository
gh repo create devopsabcs-engineering/apm-security-scan-demo-app `
  --public `
  --description "APM Security scanner demo-app with 5 sample apps, CI/CD, SARIF, and Power BI PBIP"

# Workshop repository (as template)
gh repo create devopsabcs-engineering/apm-security-scan-workshop `
  --public `
  --template `
  --description "Hands-on APM Security scanning workshop with 10 labs"
```

<details>
<summary>Bash equivalent</summary>

```bash
# Scanner demo-app repository
gh repo create devopsabcs-engineering/apm-security-scan-demo-app \
  --public \
  --description "APM Security scanner demo-app with 5 sample apps, CI/CD, SARIF, and Power BI PBIP"

# Workshop repository (as template)
gh repo create devopsabcs-engineering/apm-security-scan-workshop \
  --public \
  --template \
  --description "Hands-on APM Security scanning workshop with 10 labs"
```

</details>

## Step 2: Scaffold the Demo-App Repository

Use the domain scaffolder to generate the repository structure:

```text
/scaffold-domain domain=apm-security
```

**Expected output structure:**

```text
apm-security-scan-demo-app/
├── .github/
│   ├── agents/
│   │   ├── apm-security-detector.agent.md
│   │   └── apm-security-resolver.agent.md
│   ├── instructions/
│   │   ├── apm-security.instructions.md
│   │   └── ado-workflow.instructions.md
│   ├── prompts/
│   │   ├── apm-security-scan.prompt.md
│   │   └── apm-security-fix.prompt.md
│   ├── skills/apm-security-scan/SKILL.md
│   └── workflows/
│       ├── apm-security-scan.yml        (3-job scan: unicode + semantic + mcp)
│       ├── apm-security-gate.yml        (PR gate)
│       ├── deploy-all.yml
│       └── teardown-all.yml
├── .azuredevops/pipelines/
│   ├── apm-security-scan.yml
│   ├── apm-security-gate.yml
│   ├── deploy-all.yml
│   ├── teardown-all.yml
│   └── scan-and-store.yml
├── apm-demo-app-001/ through 005/
├── src/converters/
│   ├── semantic-to-sarif.py
│   └── mcp-to-sarif.py
├── src/config/
│   ├── mcp-allowlist.json
│   └── apm-policy.yml
├── scripts/
│   ├── setup-oidc.ps1
│   ├── setup-oidc-ado.ps1
│   ├── bootstrap-demo-apps.ps1
│   ├── bootstrap-demo-apps-ado.ps1
│   └── scan-and-store.ps1
├── power-bi/
│   └── APMSecurityReport.pbip (+ Report/ + SemanticModel/)
└── docs/
```

## Step 3: Scaffold the Workshop Repository

**Expected structure:**

```text
apm-security-scan-workshop/
├── .devcontainer/        ← Dev container with Python 3.12, APM CLI, VS Code extensions
├── labs/
│   ├── lab-00-setup.md
│   ├── lab-01-explore-violations.md
│   ├── lab-02-apm-audit-unicode.md
│   ├── lab-03-apm-audit-lockfile.md
│   ├── lab-04-semantic-scanner.md
│   ├── lab-05-mcp-validation.md
│   ├── lab-06-github-sarif-security.md
│   ├── lab-06-ado-sarif-advsec.md
│   ├── lab-07-github-actions.md
│   └── lab-07-ado-pipelines.md
├── scripts/
│   └── capture-screenshots.ps1
├── images/lab-00/ through lab-07/
├── index.md              ← GitHub Pages landing page
├── CONTRIBUTING.md
└── _config.yml           ← Jekyll configuration (just-the-docs theme)
```

## Step 4: Build the 5 Sample Apps

Each demo app uses a different tech stack and contains 15+ intentional agent configuration security violations targeting a specific scanning engine:

| App | Tech Stack | Violation Theme | Primary Engine |
|-----|-----------|----------------|---------------|
| `apm-demo-app-001` | Next.js 15 + Copilot agents | Unicode injection (Glassworm, bidi, zero-width in `.agent.md` and `.instructions.md`) | Engine 1: `apm audit` |
| `apm-demo-app-002` | Python Flask + Claude agents | Base64-encoded payloads and embedded exfiltration URLs in `AGENTS.md` and `CLAUDE.md` | Engine 3: Semantic scanner |
| `apm-demo-app-003` | ASP.NET 8 + MCP servers | Unauthorized MCP servers, overly broad tool permissions, missing transport validation in `mcp.json` | Engine 4: MCP validator |
| `apm-demo-app-004` | Java Spring Boot + Copilot skills | Shell command injection in hook configs, system prompt overrides in `SKILL.md` | Engine 3: Semantic scanner |
| `apm-demo-app-005` | Go stdlib + multi-agent | Unpinned dependencies in `apm.yml`, missing lockfile, compromised transitive deps, no CODEOWNERS | Engine 2: `apm audit --ci` |

Each app includes:

```text
apm-demo-app-NNN/
├── .github/agents/           ← Agent config files with intentional violations
├── apm.yml                   ← APM manifest (with intentional misconfigs)
├── mcp.json                  ← MCP configuration (with intentional violations)
├── infra/main.bicep          ← Azure infrastructure
├── Dockerfile
└── README.md                 ← Describes violations and expected findings
```

> **Supply Chain Case Study: LiteLLM (April 2026)**
>
> Three critical vulnerabilities in LiteLLM v1.83.0 illustrate why agent infrastructure security matters:
>
> | CVE | CVSS | Vulnerability |
> |-----|------|--------------|
> | CVE-2026-35030 | 9.4 | OIDC cache key collision — `token[:20]` enables identity takeover |
> | CVE-2026-35029 | 8.7 | Missing admin auth on `/config/update` — RCE, file read, account takeover |
> | — | 8.6 | Unsalted SHA-256 + hash exposure + pass-the-hash |
>
> **Key lesson:** AI-specific security does not replace traditional security fundamentals. The `apm audit --ci` lockfile checks help detect when dependencies like LiteLLM have known vulnerabilities. Use this case study in Lab 01 as motivation for the domain.

## Step 5: Write the SARIF Converters

Two custom SARIF converters are needed (Engines 1 and 2 use `apm audit` which produces SARIF natively):

**`src/converters/semantic-to-sarif.py`** — Scans agent config files for:
- Base64-encoded payloads (`[A-Za-z0-9+/=]{40,}`)
- Embedded external URLs (against domain allowlist)
- Shell command injection patterns (`&&`, `|`, `;`, backticks, `$()`)
- System prompt override phrases ("ignore previous instructions", "override", "bypass")
- Secrets patterns (API keys, tokens, passwords)

Output: SARIF v2.1.0 with `automationDetails.id: apm-security/semantic` and rule IDs `APM-SEC-001` through `APM-SEC-008`.

**`src/converters/mcp-to-sarif.py`** — Validates `mcp.json` against:
- Server allowlist (`src/config/mcp-allowlist.json`)
- Transport security (require TLS for remote servers)
- Permission scope (least-privilege tool lists)
- Authentication requirements

Output: SARIF v2.1.0 with `automationDetails.id: apm-security/mcp`.

## Step 6: Run Bootstrap Scripts

Execute the bootstrap scripts to provision Azure resources and configure CI/CD:

```powershell
# GitHub OIDC federation
./scripts/setup-oidc.ps1

# Bootstrap 5 demo app repos with secrets and OIDC
./scripts/bootstrap-demo-apps.ps1

# ADO OIDC federation
./scripts/setup-oidc-ado.ps1

# Bootstrap ADO project with repos, variable groups, service connections
./scripts/bootstrap-demo-apps-ado.ps1
```

## Step 7: Write the 10 Workshop Labs

| Lab | Topic | Duration | Platform |
|-----|-------|----------|----------|
| Lab 00 | Prerequisites: APM CLI, Python 3.12+, VS Code | 30 min | Agnostic |
| Lab 01 | Explore 5 demo apps and embedded violations (includes LiteLLM case study) | 25 min | Agnostic |
| Lab 02 | `apm audit` — Unicode content security scanning | 35 min | Agnostic |
| Lab 03 | `apm audit --ci` — Lockfile integrity and policy checks | 30 min | Agnostic |
| Lab 04 | Semantic pattern scanner — base64, URLs, shell, overrides | 35 min | Agnostic |
| Lab 05 | MCP configuration validation — allowlists, transport, permissions | 30 min | Agnostic |
| Lab 06 (GitHub) | GitHub Security Tab — SARIF upload, findings triage | 30 min | GitHub |
| Lab 06 (ADO) | ADO Advanced Security — SARIF upload, findings triage | 35 min | ADO |
| Lab 07 (GitHub) | GitHub Actions — multi-engine scan pipeline | 45 min | GitHub |
| Lab 07 (ADO) | ADO YAML Pipelines — multi-engine scan pipeline | 50 min | ADO |

Labs 00–05 are platform-agnostic and cover tool exploration and scanning. Labs 06 and 07 have GitHub and ADO variants for platform-specific SARIF upload and CI/CD pipeline authoring.

## Step 8: Build the Power BI PBIP

**Star schema:**

| Table | Type | Key Columns |
|-------|------|-------------|
| `Fact_APMSecurityFindings` | Fact | finding_id, repo_name, rule_id, severity, engine_name, scan_date, file_path, line_number |
| `Dim_Date` | Dimension | date_key, date, year, month, day, week, quarter |
| `Dim_Repository` | Dimension | repo_key, repo_name, org_name, platform, language |
| `Dim_Engine` | Dimension | engine_key, engine_name, engine_version, category |
| `Dim_Severity` | Dimension | severity_key, severity_name, sarif_level, sort_order |
| `Dim_AttackCategory` | Dimension | category_key, category_name, owasp_llm_id, mitre_atlas_id |
| `Dim_Rule` | Dimension | rule_key, rule_id, rule_name, description, cwe_id |

**4 report pages:**

1. **Security Overview** — Total findings by severity, findings trend over time, top violated rules
2. **Unicode Analysis** — Glassworm/bidi/zero-width findings by repository, file type distribution
3. **Attack Category Distribution** — Findings mapped to 6 attack categories and OWASP LLM Top 10
4. **Engine Comparison** — Findings by scanning engine, unique detections per engine, overlap analysis

**Data source:** Azure Blob Storage via `scan-and-store.ps1` (weekly schedule).

## Step 9: Create Screenshot Automation

Create `capture-screenshots.ps1` with manifest-driven capture:

- `screenshot-manifest.json` with 45–55 screenshots covering all labs
- Support `--platform github|ado`, `--lab`, `--phase` filters
- Charm freeze for terminal output capture
- Playwright for web UI screenshots

## Step 10: Set Up ADO Pipelines

Mirror every GitHub Actions workflow in ADO YAML pipelines:

| GitHub Actions | ADO Pipeline |
|---------------|-------------|
| `apm-security-scan.yml` | `apm-security-scan.yml` |
| `apm-security-gate.yml` | `apm-security-gate.yml` |
| `deploy-all.yml` | `deploy-all.yml` |
| `teardown-all.yml` | `teardown-all.yml` |
| — | `scan-and-store.yml` |

Use `AdvancedSecurity-Publish@1` for SARIF upload in ADO pipelines.

## Step 11: Add Bilingual French Content

All workshop repositories in the Agentic Accelerator Framework include bilingual English/French support using a directory-based approach with no i18n plugins.

### French Directory Structure

Create a `fr/` directory at the workshop root with the following structure:

```text
fr/
├── index.md                      # French home (permalink: /fr/)
└── labs/
    ├── lab-00-prerequisites.md   # French labs (same filenames as English)
    ├── lab-01-explore-violations.md
    ├── lab-02-unicode-scanning.md
    ├── lab-03-lockfile-integrity.md
    ├── lab-04-semantic-patterns.md
    ├── lab-05-mcp-validation.md
    ├── lab-06-github-security-tab.md
    ├── lab-06-ado-advanced-security.md
    ├── lab-07-github-actions.md
    └── lab-07-ado-pipelines.md
```

### French Index Page

Create `fr/index.md` with:

```yaml
---
nav_exclude: true
lang: fr
layout: default
title: Accueil
nav_order: 0
permalink: /fr/
---

> 🇬🇧 **[English version](../)**
```

### French Lab Frontmatter

Every French lab file MUST include:

```yaml
---
nav_exclude: true
lang: fr
permalink: /fr/labs/lab-XX
title: "Labo XX : Titre en français"
description: "Description en français"
---

> 🇬🇧 **[English version](../../labs/lab-XX)**
```

### Language Switcher

Add a flag emoji language switcher as the FIRST line of body content on EVERY page:

- **English pages**: `> 🇫🇷 **[Version française](fr/)**` (on `index.md`) or `> 🇫🇷 **[Version française](/fr/labs/lab-XX)**` (on labs)
- **French pages**: `> 🇬🇧 **[English version](../)**` (on `fr/index.md`) or appropriate relative path

This line appears ABOVE the logo image, making it the topmost visible content element.

### Custom Sidebar Override

Create `_includes/components/sidebar.html` to provide language-aware sidebar navigation:

- When `page.lang == 'fr'`: renders a French-only sidebar by querying pages with `lang: fr`, sorted by permalink
- When English (default): uses the standard Just the Docs `site_nav.html` auto-generation

This ensures French users see only French lab titles in the sidebar and English users see only English lab titles. The sidebar template is documented in `skills/domain-scaffolding/SKILL.md`.

### Translation Conventions

- Translate lab titles, descriptions, prose instructions, and exercise headers
- Keep code blocks, commands, YAML, file paths, tool names, and URLs in English
- Screenshots are shared (not duplicated) — French labs reference `../../images/lab-XX/`
- Common translations: Lab → Labo, Exercise → Exercice, Checkpoint → Point de vérification, Next Steps → Prochaines étapes

## Step 12: Add Cross-Workshop Links

Each workshop in the ecosystem links to all other domain workshops for discoverability.

### Related Repositories Table

Add a "Related Repositories" table to both `index.md` and `fr/index.md`:

```markdown
## Related Repositories

| Repository | Description |
|------------|-------------|
| [agentic-accelerator-framework](https://github.com/devopsabcs-engineering/agentic-accelerator-framework) | Framework agents, instructions, and skills |
| [apm-security-scan-demo-app](https://github.com/devopsabcs-engineering/apm-security-scan-demo-app) | Scanner platform and demo applications |
| [agentic-accelerator-workshop](https://github.com/devopsabcs-engineering/agentic-accelerator-workshop) | Main workshop (all domains) |
| [accessibility-scan-workshop](https://devopsabcs-engineering.github.io/accessibility-scan-workshop/) | Accessibility scanning workshop |
| [code-quality-scan-workshop](https://devopsabcs-engineering.github.io/code-quality-scan-workshop/) | Code quality scanning workshop |
| [finops-scan-workshop](https://devopsabcs-engineering.github.io/finops-scan-workshop/) | FinOps scanning workshop |
```

### Update Existing Workshops

When the APM Security workshop is published, update the "Related Repositories" tables in all existing workshop repos to add:

```markdown
| [apm-security-scan-workshop](https://devopsabcs-engineering.github.io/apm-security-scan-workshop/) | APM Security scanning workshop |
```

## Validation Checklist

Before considering the domain complete, verify:

- [ ] All 5 demo apps produce 15+ findings when scanned
- [ ] `apm audit` returns exit code 1 on apps with Unicode violations (apps 001)
- [ ] `apm audit --ci` detects lockfile issues on app 005
- [ ] Semantic scanner detects base64, URLs, shell commands, and override patterns (apps 002, 004)
- [ ] MCP validator flags unauthorized servers and transport misconfigs (app 003)
- [ ] SARIF files upload to GitHub Security Tab with `apm-security/` category prefix
- [ ] SARIF files upload to ADO Advanced Security via `AdvancedSecurity-Publish@1`
- [ ] Workshop labs render correctly on GitHub Pages
- [ ] Power BI PBIP connects to data source and renders all 4 pages
- [ ] Bootstrap scripts complete without errors for both GitHub and ADO
- [ ] Language switcher (`> 🇫🇷` / `> 🇬🇧`) appears above logo on every page
- [ ] French sidebar shows only French lab titles; English sidebar shows only English
- [ ] Cross-workshop links present in both English and French `index.md`
- [ ] French labs reference shared images via `../../images/lab-XX/` paths

## References

- [Domain Parity and Contribution Guide](domain-parity-and-contribution.md)
- [Related Repositories](related-repositories.md)
- [Implementation Roadmap](implementation-roadmap.md)
- [APM Security Scan Skill](../skills/apm-security-scan/SKILL.md)
- [Domain Scaffolding Skill](../skills/domain-scaffolding/SKILL.md)
- [Microsoft APM](https://github.com/microsoft/apm) — Agent Package Manager
- [Microsoft APM Action](https://github.com/microsoft/apm-action) — GitHub Action
- [APM Documentation](https://microsoft.github.io/apm/)
- [Agentic SDLC Handbook](https://danielmeppiel.github.io/agentic-sdlc-handbook/)
- [OWASP Top 10 for LLM Applications (2025)](https://genai.owasp.org/llm-top-10/)
- [GHSA-jjhc-v7c2-5hh6](https://github.com/BerriAI/litellm/security/advisories/GHSA-jjhc-v7c2-5hh6) — LiteLLM OIDC collision
- [GHSA-53mr-6c8q-9789](https://github.com/BerriAI/litellm/security/advisories/GHSA-53mr-6c8q-9789) — LiteLLM config RCE
- [GHSA-69x8-hrgq-fjj8](https://github.com/BerriAI/litellm/security/advisories/GHSA-69x8-hrgq-fjj8) — LiteLLM pass-the-hash
