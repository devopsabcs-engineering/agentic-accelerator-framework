# Research: `.github-private` Deployment Model for Org-Wide Copilot Agent Distribution

**Status**: Complete
**Date**: 2026-03-17
**Target Org**: `devopsabcs-engineering`
**Source Repo**: `devopsabcs-engineering/agentic-devsecops-framework`
**Target Repo**: `devopsabcs-engineering/.github-private`

---

## Research Topics

1. How `.github-private` works for org-wide Copilot agent distribution
2. CD workflow design for deploying agent configuration files
3. Security considerations for cross-repo deployment
4. Rollback strategy and version management

---

## 1. How `.github-private` Works

### Overview

The `.github-private` repository is the official GitHub mechanism for sharing custom Copilot agents, instructions, skills, and prompts across an entire organization or enterprise. GitHub provides an official template repository at `docs/custom-agents-template` to bootstrap the setup.

**Source**: [Preparing to use custom agents in your organization](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/prepare-for-custom-agents)

### Three-Level Deployment Model

Custom agents deploy at three levels with **lowest-level-wins** precedence:

| Level | Location | Availability | Precedence |
|---|---|---|---|
| Enterprise | `agents/` in enterprise `.github-private` | All enterprise repos | Lowest |
| Organization | `agents/` in org `.github-private` | All org repos | Middle |
| Repository | `.github/agents/` in the repo | That repo only | Highest |
| User profile | `~/.copilot/agents/` | All user workspaces (VS Code) | Per-user |

When agents at different levels share the same filename, the **most specific** (lowest) level configuration takes precedence. This is based on filename deduplication — the configuration file's name (minus `.md` or `.agent.md`) determines the deduplication key.

**Source**: Framework docs [architecture.md](../../docs/architecture.md), [agent-patterns.md](../../docs/agent-patterns.md), [agent-extensibility.md](../../docs/agent-extensibility.md)

### Versioning

Custom agent versioning is based on **Git commit SHAs** for the agent profile file. Creating branches or tags allows different versions of custom agents. When assigned to a task, the agent instantiates using the latest version from the repository's default branch.

**Source**: [Custom agents configuration reference](https://docs.github.com/en/copilot/reference/custom-agents-configuration)

### Directory Structure `.github-private` Expects

Based on the official GitHub template (`docs/custom-agents-template`) and framework documentation:

```text
.github-private/                        # Repository root
├── README.md                           # Setup guide and compliance guidelines
├── agents/                             # Org-wide agents (released, available to all org repos)
│   ├── security-agent.agent.md
│   ├── security-reviewer-agent.agent.md
│   ├── security-plan-creator.agent.md
│   ├── pipeline-security-agent.agent.md
│   ├── iac-security-agent.agent.md
│   ├── supply-chain-security-agent.agent.md
│   ├── a11y-detector.agent.md
│   ├── a11y-resolver.agent.md
│   ├── code-quality-detector.agent.md
│   ├── cost-analysis-agent.agent.md
│   ├── cost-anomaly-detector.agent.md
│   ├── cost-optimizer-agent.agent.md
│   ├── deployment-cost-gate-agent.agent.md
│   ├── finops-governance-agent.agent.md
│   └── test-generator.agent.md
├── instructions/                       # Org-wide custom instructions
│   ├── a11y-remediation.instructions.md
│   ├── code-quality.instructions.md
│   └── wcag22-rules.instructions.md
├── prompts/                            # Org-wide reusable prompt templates
│   ├── a11y-fix.prompt.md
│   └── a11y-scan.prompt.md
├── skills/                             # Org-wide agent skills
│   ├── a11y-scan/
│   │   └── SKILL.md
│   └── security-scan/
│       └── SKILL.md
├── .github/
│   ├── copilot-instructions.md         # Repo-wide instructions for .github-private itself
│   └── agents/                         # Test-only agents (scoped to .github-private repo)
│       └── (staging area for testing before release)
├── apm.yml                             # APM manifest (agent dependency declarations)
└── mcp.json                            # MCP server configuration
```

**Key structural rules**:

- **`agents/`** (root level) = org-wide release. Available to all org repos after merge to default branch.
- **`.github/agents/`** = test-only. Scoped to the `.github-private` repo itself. Used as staging area.
- **`instructions/`** (root level) = org-wide custom instructions with `applyTo` glob patterns.
- **`prompts/`** (root level) = org-wide reusable prompt templates.
- **`skills/<skill-name>/SKILL.md`** = org-wide agent skills loaded on demand by the model.
- **`copilot-instructions.md`** at `.github/copilot-instructions.md` = repo-wide conventions for the `.github-private` repo itself.

### Testing and Release Workflow (Official GitHub Flow)

1. Create test agent in `.github-private/.github/agents/` (scoped to the repo only).
2. Test through the agents tab at `github.com/copilot/agents`.
3. Iterate and refine.
4. Release by moving from `.github/agents/` to `agents/` (root directory).
5. Merge to the default branch to activate organization-wide.

**Source**: [Testing and releasing custom agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/test-custom-agents)

---

## 2. Deployment File Manifest

### Files to Sync from Source to `.github-private`

The following is the complete file manifest from the source repository (`agentic-devsecops-framework`) that must be synced to `devopsabcs-engineering/.github-private`:

#### Agents (15 files)

| Source Path | Target Path | Domain |
|---|---|---|
| `agents/security-agent.agent.md` | `agents/security-agent.agent.md` | Security |
| `agents/security-reviewer-agent.agent.md` | `agents/security-reviewer-agent.agent.md` | Security |
| `agents/security-plan-creator.agent.md` | `agents/security-plan-creator.agent.md` | Security |
| `agents/pipeline-security-agent.agent.md` | `agents/pipeline-security-agent.agent.md` | Security |
| `agents/iac-security-agent.agent.md` | `agents/iac-security-agent.agent.md` | Security |
| `agents/supply-chain-security-agent.agent.md` | `agents/supply-chain-security-agent.agent.md` | Security |
| `agents/a11y-detector.agent.md` | `agents/a11y-detector.agent.md` | Accessibility |
| `agents/a11y-resolver.agent.md` | `agents/a11y-resolver.agent.md` | Accessibility |
| `agents/code-quality-detector.agent.md` | `agents/code-quality-detector.agent.md` | Code Quality |
| `agents/test-generator.agent.md` | `agents/test-generator.agent.md` | Code Quality |
| `agents/cost-analysis-agent.agent.md` | `agents/cost-analysis-agent.agent.md` | FinOps |
| `agents/cost-anomaly-detector.agent.md` | `agents/cost-anomaly-detector.agent.md` | FinOps |
| `agents/cost-optimizer-agent.agent.md` | `agents/cost-optimizer-agent.agent.md` | FinOps |
| `agents/deployment-cost-gate-agent.agent.md` | `agents/deployment-cost-gate-agent.agent.md` | FinOps |
| `agents/finops-governance-agent.agent.md` | `agents/finops-governance-agent.agent.md` | FinOps |

#### Instructions (3 files)

| Source Path | Target Path |
|---|---|
| `instructions/a11y-remediation.instructions.md` | `instructions/a11y-remediation.instructions.md` |
| `instructions/code-quality.instructions.md` | `instructions/code-quality.instructions.md` |
| `instructions/wcag22-rules.instructions.md` | `instructions/wcag22-rules.instructions.md` |

#### Prompts (2 files)

| Source Path | Target Path |
|---|---|
| `prompts/a11y-fix.prompt.md` | `prompts/a11y-fix.prompt.md` |
| `prompts/a11y-scan.prompt.md` | `prompts/a11y-scan.prompt.md` |

#### Skills (2 directories, 2 files)

| Source Path | Target Path |
|---|---|
| `skills/a11y-scan/SKILL.md` | `skills/a11y-scan/SKILL.md` |
| `skills/security-scan/SKILL.md` | `skills/security-scan/SKILL.md` |

#### Configuration Files (3 files)

| Source Path | Target Path | Notes |
|---|---|---|
| `apm.yml` | `apm.yml` | APM manifest — agent dependency declarations |
| `mcp.json` | `mcp.json` | MCP server configuration |
| `.github/copilot-instructions.md` | `.github/copilot-instructions.md` | Repo-wide custom instructions |

**Total**: 25 files across 7 directories.

### Files NOT to Sync

The following source files and directories are **excluded** from deployment:

- `sample-app/` — demo application, not agent config
- `samples/` — CI/CD pipeline samples for reference only
- `docs/` — framework documentation
- `assets/` — static assets
- `.github/workflows/` — CI/CD workflows for the source repo
- `.github/instructions/` — deployment-scoped instructions (use `instructions/` root for org-wide)
- `README.md` — source repo README (`.github-private` has its own)
- `LICENSE` — source repo license
- `__tests__/` — test files

---

## 3. CD Workflow Design

### Recommended Workflow: `deploy-to-github-private.yml`

#### Trigger

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'agents/**'
      - 'instructions/**'
      - 'prompts/**'
      - 'skills/**'
      - 'apm.yml'
      - 'mcp.json'
      - '.github/copilot-instructions.md'
```

This ensures the workflow only runs when agent configuration files actually change on `main` (after PR merge).

#### Sync Strategy: Selective File Sync (Recommended)

**Recommended over full mirror** because:

1. The source repo contains `sample-app/`, `docs/`, `samples/`, etc., that must NOT be deployed.
2. Selective sync provides an explicit allowlist of deployable artifacts.
3. Easier to audit — the manifest is declarative in the workflow.
4. `.github-private` may contain its own `README.md`, `CODEOWNERS`, and branch protection config that must not be overwritten.

#### Authentication

**Option A: GitHub App (Recommended)**

- Create a GitHub App owned by the `devopsabcs-engineering` organization.
- Grant permissions: `contents: write` on `devopsabcs-engineering/.github-private`.
- Install the app on the `.github-private` repository.
- Store the App ID and private key as repository secrets (`APP_ID`, `APP_PRIVATE_KEY`) in the source repo.
- Use `actions/create-github-app-token` to generate an installation token at workflow runtime.
- **Advantages**: Scoped permissions, auditable, rotatable, no personal token dependency.

**Option B: Personal Access Token (PAT)**

- Create a fine-grained PAT scoped to `devopsabcs-engineering/.github-private` with `contents: write`.
- Store as `GITHUB_PRIVATE_DEPLOY_TOKEN` in source repo secrets.
- **Disadvantages**: Tied to a personal account, expires, harder to audit.

#### Workflow Structure

```yaml
name: Deploy Agent Config to .github-private

on:
  push:
    branches: [main]
    paths:
      - 'agents/**'
      - 'instructions/**'
      - 'prompts/**'
      - 'skills/**'
      - 'apm.yml'
      - 'mcp.json'
      - '.github/copilot-instructions.md'

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # 1. Checkout source repo
      - name: Checkout source
        uses: actions/checkout@v4
        with:
          path: source

      # 2. Generate GitHub App token
      - name: Generate token
        id: app-token
        uses: actions/create-github-app-token@v1
        with:
          app-id: ${{ secrets.DEPLOY_APP_ID }}
          private-key: ${{ secrets.DEPLOY_APP_PRIVATE_KEY }}
          owner: devopsabcs-engineering
          repositories: .github-private

      # 3. Checkout target repo
      - name: Checkout .github-private
        uses: actions/checkout@v4
        with:
          repository: devopsabcs-engineering/.github-private
          token: ${{ steps.app-token.outputs.token }}
          path: target

      # 4. Sync files (selective)
      - name: Sync agent configuration files
        run: |
          # Define sync manifest
          SYNC_DIRS="agents instructions prompts skills"
          SYNC_FILES="apm.yml mcp.json"
          SYNC_DOTGITHUB=".github/copilot-instructions.md"

          # Sync directories (mirror mode — delete files in target not in source)
          for dir in $SYNC_DIRS; do
            mkdir -p "target/$dir"
            rsync -av --delete "source/$dir/" "target/$dir/"
          done

          # Sync individual files
          for file in $SYNC_FILES; do
            cp "source/$file" "target/$file"
          done

          # Sync .github/copilot-instructions.md
          mkdir -p "target/.github"
          cp "source/$SYNC_DOTGITHUB" "target/$SYNC_DOTGITHUB"

      # 5. Validate file integrity (hash comparison)
      - name: Validate deployment integrity
        run: |
          SYNC_DIRS="agents instructions prompts skills"
          SYNC_FILES="apm.yml mcp.json .github/copilot-instructions.md"
          ERRORS=0

          # Validate directory contents
          for dir in $SYNC_DIRS; do
            for file in $(find "source/$dir" -type f); do
              relpath="${file#source/}"
              if [ ! -f "target/$relpath" ]; then
                echo "::error::Missing file in target: $relpath"
                ERRORS=$((ERRORS + 1))
              else
                SOURCE_HASH=$(sha256sum "source/$relpath" | cut -d' ' -f1)
                TARGET_HASH=$(sha256sum "target/$relpath" | cut -d' ' -f1)
                if [ "$SOURCE_HASH" != "$TARGET_HASH" ]; then
                  echo "::error::Hash mismatch for $relpath"
                  echo "  Source: $SOURCE_HASH"
                  echo "  Target: $TARGET_HASH"
                  ERRORS=$((ERRORS + 1))
                else
                  echo "✓ $relpath (SHA-256: $SOURCE_HASH)"
                fi
              fi
            done
          done

          # Validate individual files
          for file in $SYNC_FILES; do
            SOURCE_HASH=$(sha256sum "source/$file" | cut -d' ' -f1)
            TARGET_HASH=$(sha256sum "target/$file" | cut -d' ' -f1)
            if [ "$SOURCE_HASH" != "$TARGET_HASH" ]; then
              echo "::error::Hash mismatch for $file"
              ERRORS=$((ERRORS + 1))
            else
              echo "✓ $file (SHA-256: $SOURCE_HASH)"
            fi
          done

          if [ $ERRORS -gt 0 ]; then
            echo "::error::$ERRORS file integrity errors detected"
            exit 1
          fi
          echo "All files validated successfully."

      # 6. Commit and push to .github-private
      - name: Commit and push
        working-directory: target
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -A
          if git diff --cached --quiet; then
            echo "No changes to deploy."
          else
            SOURCE_SHA="${{ github.sha }}"
            SHORT_SHA="${SOURCE_SHA:0:7}"
            git commit -m "chore: sync agent config from agentic-devsecops-framework@${SHORT_SHA}"
            git push
            echo "Deployment complete: agentic-devsecops-framework@${SHORT_SHA}"
          fi

      # 7. Create deployment tag in source repo
      - name: Tag source deployment
        run: |
          cd source
          git tag "deploy/github-private/$(date +%Y%m%d-%H%M%S)-${{ github.run_number }}"
          git push origin --tags
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 4. Security Considerations

### Secrets Management

| Secret | Purpose | Stored In |
|---|---|---|
| `DEPLOY_APP_ID` | GitHub App ID for cross-repo access | Source repo → Settings → Secrets |
| `DEPLOY_APP_PRIVATE_KEY` | GitHub App private key | Source repo → Settings → Secrets |
| `GITHUB_TOKEN` | Default token for source repo tagging | Auto-provided by Actions |

**Recommendations**:

- Use a **GitHub App** instead of a PAT. GitHub Apps provide scoped, auditable, and rotatable credentials without dependency on a personal account.
- The GitHub App should be installed **only** on `.github-private` with `contents: write` permission.
- Use `actions/create-github-app-token@v1` to generate short-lived installation tokens at runtime.
- Never store PATs as repository secrets if a GitHub App is available.

### Branch Protection on `.github-private`

Configure branch protection on `.github-private`'s default branch:

- Require pull request reviews before merge (minimum 1 reviewer).
- Require status checks to pass (if `.github-private` has CI).
- Restrict who can push directly — allow only the GitHub App and org owners.
- Enable "Require signed commits" if possible.
- **For the CD workflow**: The GitHub App token allows direct pushes. If branch protection restricts pushes, add the GitHub App to the bypass list or use the workflow to create a PR instead of direct push.

**Alternative: PR-based deployment**:

Instead of direct push, the workflow can create a PR in `.github-private` and auto-merge it. This preserves the full review trail and respects branch protection rules.

### CODEOWNERS Enforcement

Create a `CODEOWNERS` file in `.github-private`:

```text
# All agent configuration changes require approval from the DevSecOps team
* @devopsabcs-engineering/devsecops-admins

# Security agents require security team review
agents/security-*.agent.md @devopsabcs-engineering/security-team
agents/iac-security-agent.agent.md @devopsabcs-engineering/security-team
agents/pipeline-security-agent.agent.md @devopsabcs-engineering/security-team
agents/supply-chain-security-agent.agent.md @devopsabcs-engineering/security-team

# Accessibility agents require a11y team review
agents/a11y-*.agent.md @devopsabcs-engineering/accessibility-team
```

### Enterprise Rulesets

Enterprise owners can create rulesets to restrict agent profile editing to enterprise owners only. Members with write access can still propose changes via PRs, but only users with ruleset bypass permissions can merge them.

**Source**: [GitHub docs — enterprise rulesets for custom agents](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/prepare-for-custom-agents)

### APM Security Scanning

The framework uses `microsoft/apm` for dependency management. Integrate `apm audit` into CI to scan agent configuration files against known supply chain attacks (hidden Unicode characters, prompt injection patterns) before deployment.

---

## 5. Rollback Strategy

### Immediate Rollback

Since `.github-private` is a Git repository, rollback is straightforward:

```bash
# In .github-private repo
git revert HEAD    # Revert the last deployment commit
git push
```

Or reset to a known-good state:

```bash
git log --oneline  # Find the last-known-good commit
git revert <bad-commit-sha>
git push
```

### Version Tagging

The CD workflow creates deployment tags in the source repo:

```text
deploy/github-private/20260317-143022-42
```

Format: `deploy/github-private/{YYYYMMDD-HHMMSS}-{run-number}`

This enables:

- Auditing which source commit was deployed and when.
- Bisecting to identify which deployment introduced a problem.
- Re-deploying a specific version by checking out the tagged commit and re-running the workflow.

### Emergency Rollback Procedure

1. Identify the bad deployment tag in the source repo: `git tag -l "deploy/github-private/*"`.
2. In `.github-private`, find the corresponding commit: `git log --oneline`.
3. Revert: `git revert <bad-commit>` and push.
4. Alternatively, force-redeploy a known-good version from the source repo by triggering the workflow manually on a tagged commit.

### Manual Workflow Dispatch (Optional Enhancement)

Add `workflow_dispatch` trigger with a `ref` input to allow manual deployment of any commit/tag:

```yaml
on:
  workflow_dispatch:
    inputs:
      ref:
        description: 'Git ref (branch, tag, or SHA) to deploy'
        required: false
        default: 'main'
```

---

## 6. Discovered Topics and Follow-On Research

### `.github-private` Visibility

The `.github-private` repository should be configured as **Internal** (if organization supports it) or **Private** with appropriate access grants. Internal visibility grants read access to all organization members, which is required for agents to be discovered.

### Cross-Platform Compatibility

The same `.agent.md` files work across:

- VS Code (agent mode)
- GitHub.com (coding agent, agents tab)
- GitHub CLI
- JetBrains IDEs (public preview)
- Eclipse and Xcode (public preview)

Properties `argument-hint` and `handoffs` are VS Code-only and ignored on GitHub.com.

### Custom Instructions Scope

- `instructions/*.instructions.md` at the root of `.github-private` applies org-wide.
- `.github/copilot-instructions.md` applies as repo-wide instructions for `.github-private` itself.
- Path-specific instructions use `applyTo` glob patterns in YAML frontmatter.

### MCP Server Secrets

If agents reference MCP servers requiring secrets, those secrets must be configured in the **Copilot environment** of each repository where the agent runs — not in `.github-private` itself. The `.github-private` repo only distributes the configuration; runtime secrets are resolved per-repo.

---

## 7. Assumptions

1. **Org `.github-private` already exists** or will be created from the `docs/custom-agents-template` template before the CD workflow runs.
2. **GitHub App will be created** with `contents: write` permission on `.github-private`.
3. **Direct push strategy** is used for the CD workflow. If `.github-private` has branch protection requiring PRs, the workflow must be adapted to create a PR instead.
4. **`rsync --delete` behavior**: Files removed from the source repo will also be removed from `.github-private`. This is intentional — the source repo is the single source of truth.
5. **No conflicting agents in `.github-private`**: The CD workflow manages all files in the synced directories. Manual edits to those directories in `.github-private` will be overwritten on next deployment.
6. **Default branch is `main`** for both source and target repositories.

---

## 8. References

### GitHub Official Documentation

- [Preparing to use custom agents in your organization](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/prepare-for-custom-agents)
- [Testing and releasing custom agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/test-custom-agents)
- [About custom agents](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-custom-agents)
- [Custom agents configuration reference](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [Copilot customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet)

### GitHub Template Repository

- [docs/custom-agents-template](https://github.com/docs/custom-agents-template) — Official template for `.github-private`

### Framework Documentation (Local)

- [docs/agent-patterns.md](../../docs/agent-patterns.md) — Agent file spec, deployment model, testing workflow
- [docs/architecture.md](../../docs/architecture.md) — Three-level deployment model, SARIF integration
- [docs/agent-extensibility.md](../../docs/agent-extensibility.md) — Organization-scale sharing, enterprise rulesets, MCP integration
- [.github/copilot-instructions.md](../../.github/copilot-instructions.md) — Repo-wide conventions

### GitHub Actions

- [actions/checkout@v4](https://github.com/actions/checkout)
- [actions/create-github-app-token@v1](https://github.com/actions/create-github-app-token)

## Discovered Topics

_Placeholder — research in progress_

## Next Research

_Placeholder — research in progress_

## Clarifying Questions

_Placeholder — research in progress_
