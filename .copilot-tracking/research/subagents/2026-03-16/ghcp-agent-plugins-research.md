# GitHub Copilot Agent Plugins & Custom Agent Extensibility Research

## Status: Complete

## Research Topics & Questions

1. How do VS Code agent plugins work? What is an agent plugin vs a custom agent vs an extension?
2. How are custom agents deployed at the organization level in GitHub?
3. How can agents be shared across repositories in an organization?
4. What is the relationship between .github-private repo agents and VS Code agents? Can the same agents work in both?
5. What are the emerging patterns for agent extensibility (MCP servers, tool use, etc.)?
6. How do GitHub Copilot Custom Agents work with the coding agent?
7. What is the agent.md file specification?
8. How can organizations create and manage agent rulesets?

---

## Findings

### 1. VS Code Agent Plugins: Architecture & Taxonomy

**Agent plugins** are prepackaged bundles of chat customizations that can be discovered and installed from plugin marketplaces in VS Code. A single plugin can provide any combination of:

- **Slash commands** — additional commands invocable with `/` in chat
- **Skills** — agent skills with instructions, scripts, and resources (loaded on-demand)
- **Agents** — custom agents with specialized personas and tool configurations
- **Hooks** — shell commands executed at agent lifecycle points
- **MCP servers** — external tool integrations via Model Context Protocol

**Plugin directory structure:**

```text
my-testing-plugin/
  plugin.json              # Plugin metadata and configuration
  skills/
    test-runner/
      SKILL.md             # Testing skill instructions
      run-tests.sh         # Supporting script
  agents/
    test-reviewer.agent.md # Code review agent
  hooks/
    post-test.json         # Hook to run after tests
```

**Plugin marketplaces** — VS Code discovers plugins from `github/copilot-plugins` and `github/awesome-copilot` by default. Additional marketplaces can be added via the `chat.plugins.marketplaces` setting (supports `owner/repo` shorthand, HTTPS `.git` URLs, SCP-style git remotes, and `file:///` URIs). Private repositories are supported.

**Local plugins** — Registered via `chat.plugins.paths` setting (maps directories to enabled/disabled state).

**Browsing and installing** — Available via `@agentPlugins` search in the Extensions view, or More Actions > Views > Agent Plugins. Installed plugins appear in the "Agent Plugins - Installed" view.

**Key distinction: Agent Plugin vs Custom Agent vs Extension vs Skill:**

| Concept | What It Is | Distribution | Scope |
|---------|-----------|--------------|-------|
| **Agent Plugin** | A bundle of skills + agents + hooks + MCP servers + slash commands | Plugin marketplaces (Git repos) | Installable per user in VS Code |
| **Custom Agent** | A `.agent.md` file defining a persona with tools, instructions | Workspace, user profile, or org `.github-private` | Single workspace, user, or org |
| **VS Code Extension** | A full VS Code extension with APIs | VS Code Marketplace | User-installed |
| **Agent Skill** | A `SKILL.md` folder with instructions, scripts, resources | Project `.github/skills/` or personal `~/.copilot/skills/` | On-demand loading |

### 2. Custom Agents: Organization-Level Deployment

**Repository structure for org-level agents:**

- Organization: Create a `.github-private` repository using [GitHub's template repository](https://github.com/docs/custom-agents-template)
  - Name: `.github-private` (required)
  - Visibility: **Internal** (all org/enterprise members get read access) or **Private** (manual access grants)
  - Agent profiles go in `/agents/CUSTOM-AGENT-NAME.md` (root `agents/` directory = released to org)

**Steps to prepare for org-level custom agents:**

1. Create `.github-private` repo from the template in the organization
2. Set visibility to Internal or Private
3. Update README with creation guidelines and compliance considerations
4. Create agent profiles in the `agents/` directory
5. Merge to default branch to make available org-wide

**Enterprise-level custom agents:**

- Enterprise owners choose one organization to host the `.github-private` repository
- Enterprise settings under "AI controls" > "Custom agents" allow selecting the source organization
- Enterprise owners can auto-create rulesets to restrict who can edit agent profiles

### 3. Cross-Repository Agent Sharing Patterns

**Sharing hierarchy (lowest level wins on conflicts):**

| Level | Location | Availability |
|-------|----------|-------------|
| Repository | `.github/agents/AGENT-NAME.md` | That repository only |
| Organization | `agents/AGENT-NAME.md` in org `.github-private` | All org repos |
| Enterprise | `agents/AGENT-NAME.md` in enterprise org's `.github-private` | All enterprise repos |
| User profile | `~/.copilot/agents/` or VS Code profile folder | All user's workspaces |

**Name-based deduplication:** When agents at different levels have the same filename, the lowest-level (most specific) configuration takes precedence (repo > org > enterprise).

**VS Code settings for org-level agents:** Set `github.copilot.chat.organizationCustomAgents.enabled` to `true` to auto-discover org-level agents in VS Code.

**Additional sharing via `chat.agentFilesLocations`:** VS Code allows configuring custom directories where it searches for agent files, enabling sharing from central locations outside the workspace.

**devopsabcs-engineering/.github-private patterns observed:**
The repo contains a comprehensive set of org-level agents:

- `a11y-detector.agent.md` — WCAG 2.2 accessibility violation detection
- `a11y-resolver.agent.md` — WCAG 2.2 accessibility fix application
- `security-agent.md` — Full security review (ASP.NET Core + IaC)
- `security-plan-creator.agent.md` — Cloud security plan architecture
- `security-reviewer-agent.md` — Security-focused code review
- `pipeline-security-agent.md` — CI/CD workflow hardening
- `iac-security-agent.md` — Terraform/Bicep/K8s misconfiguration scanning
- `supply-chain-security-agent.md` — Secrets, dependencies, governance, SBOM

All agents follow a consistent pattern with:

- YAML frontmatter: `name`, `description`, `model`, `tools` list
- Model specification: `Claude Sonnet 4.5 (copilot)` (common across all)
- Comprehensive tool declarations (30+ tools per agent)
- Detailed Markdown body with structured instructions, phases, output templates

### 4. .github-private Agents and VS Code Agent Compatibility

**Yes, the same agent files work in both environments.** Custom agents defined in `.github-private/agents/` are available to:

- **Copilot coding agent on GitHub.com** — agents tab, issue assignment, PR creation
- **Copilot coding agent in IDEs** — VS Code, JetBrains, Eclipse, Xcode
- **GitHub Copilot CLI**

**Environment-specific behavior:**

- Some YAML properties function differently or are ignored between environments
- `argument-hint` and `handoffs` properties from VS Code are ignored on GitHub.com
- `mcp-servers` in YAML frontmatter is primarily for GitHub.com (VS Code uses its own MCP configuration)
- The `target` property (`vscode` or `github-copilot`) can restrict an agent to a specific environment
- Unrecognized tool names are silently ignored (enables cross-environment compatibility)

**VS Code-only features not available on GitHub.com:**

- `argument-hint`, `handoffs`, `hooks`
- `user-invocable`, `disable-model-invocation` (fine-grained subagent controls)
- Claude agent format support (`.claude/agents/` with comma-separated tool strings)

**GitHub.com-only features not available in VS Code:**

- `mcp-servers` in agent YAML (VS Code uses its own MCP config approach)
- `metadata` property
- `infer` (deprecated, replaced by `disable-model-invocation`)

### 5. Emerging Extensibility Patterns

#### MCP Servers (Model Context Protocol)

MCP is the primary extensibility mechanism for external tool integration:

- **Agent-level MCP:** Configured in the `mcp-servers` property of agent YAML (GitHub.com only)
- **Repository-level MCP:** Configured in repository settings JSON
- **Out-of-the-box MCP servers:** `github` (read-only tools, scoped to source repo) and `playwright` (localhost only)
- **MCP processing order:** Out-of-the-box > Agent config > Repo settings (each level can override)
- **Environment variable support:** `${{ secrets.VAR }}`, `${{ vars.VAR }}`, `${VAR}`, and `${VAR:-default}` syntax

**Example MCP-enabled agent profile:**

```yaml
---
name: my-custom-agent-with-mcp
description: Custom agent description
tools: ['tool-a', 'tool-b', 'custom-mcp/tool-1']
mcp-servers:
  custom-mcp:
    type: 'local'
    command: 'some-command'
    args: ['--arg1', '--arg2']
    tools: ["*"]
    env:
      ENV_VAR_NAME: ${{ secrets.COPILOT_MCP_ENV_VAR_VALUE }}
---
```

#### Agent Skills (Open Standard)

Agent Skills follow the open standard at [agentskills.io](https://agentskills.io/):

- Work across VS Code, Copilot CLI, and Copilot coding agent
- Progressive loading: name/description → instructions → resources
- Can be contributed by VS Code extensions via `chatSkills` contribution point
- Invocable as `/` slash commands or auto-discovered by the model
- Project skills: `.github/skills/`, `.claude/skills/`, `.agents/skills/`
- Personal skills: `~/.copilot/skills/`, `~/.claude/skills/`

#### Subagents

- Separate agents spawned by the main agent for delegated work in isolated context
- Can run custom agents as subagents (experimental in VS Code)
- Not user-configured files — runtime processes
- Controlled via `agents` property in agent YAML (VS Code)

#### Handoffs (VS Code)

Sequential workflow transitions between agents:

```yaml
handoffs:
  - label: Start Implementation
    agent: implementation
    prompt: Now implement the plan outlined above.
    send: false
    model: GPT-5.2 (copilot)
```

#### Hooks (VS Code Preview)

Shell commands scoped to agent lifecycle:

- Can be defined in agent YAML frontmatter
- Only run when the specific agent is active
- Require `chat.useCustomAgentHooks` to be enabled

### 6. GitHub Copilot Custom Agents with the Coding Agent

Custom agents integrate deeply with the coding agent:

- **Issue assignment:** Select a custom agent from the dropdown when assigning Copilot to an issue
- **PR creation:** When Copilot opens a PR, it notes which custom agent was used in the description
- **Agents tab:** Available at `github.com/copilot/agents` for browsing and managing
- **Task prompting:** Use the dropdown in the agents panel/tab to select a custom agent for a task
- **CLI integration:** Use `/agent` slash command or reference the agent in prompts/arguments
- **Versioning:** Based on Git commit SHAs — branches/tags can have different agent versions
- **Consistency:** Interactions within a PR use the same agent version for consistency

### 7. agent.md File Specification

**File naming:** `AGENT-NAME.md` or `AGENT-NAME.agent.md`
**Filename constraints:** Only `.`, `-`, `_`, `a-z`, `A-Z`, `0-9` allowed
**Max prompt length:** 30,000 characters

**YAML Frontmatter Properties:**

| Property | Type | Description | Environment |
|----------|------|-------------|-------------|
| `name` | string | Display name (defaults to filename if unset) | Both |
| `description` | string (required) | Agent purpose and capabilities | Both |
| `target` | string | `vscode` or `github-copilot` (defaults to both) | Both |
| `tools` | list/string | Tool names or aliases (defaults to all tools) | Both |
| `model` | string | AI model to use | Both |
| `mcp-servers` | object | MCP server configurations | GitHub.com |
| `disable-model-invocation` | boolean | Prevent auto-use by coding agent | Both |
| `user-invocable` | boolean | Controls visibility in agent dropdown | VS Code |
| `metadata` | object | Annotation data (name/value pairs) | GitHub.com |
| `argument-hint` | string | Input hint text | VS Code |
| `handoffs` | list | Workflow transitions to other agents | VS Code |
| `hooks` | object | Lifecycle shell commands | VS Code (Preview) |
| `agents` | list | Subagent allow-list (`*` for all, `[]` for none) | VS Code |

**Tool aliases (case-insensitive):**

| Alias | Alternates | Description |
|-------|-----------|-------------|
| `execute` | `shell`, `Bash`, `powershell` | Shell execution |
| `read` | `Read`, `NotebookRead`, `view` | File reading |
| `edit` | `Edit`, `MultiEdit`, `Write`, `NotebookEdit` | File editing |
| `search` | `Grep`, `Glob` | File/text search |
| `agent` | `custom-agent`, `Task` | Subagent invocation |
| `web` | `WebSearch`, `WebFetch` | Web fetching (VS Code) |
| `todo` | `TodoWrite` | Task list management (VS Code) |

**Tool namespacing for MCP servers:**

- `server-name/tool-name` — specific tool from an MCP server
- `server-name/*` — all tools from an MCP server
- `azure.some-extension/some-tool` — tools from VS Code extensions

### 8. Organization & Enterprise Agent Rulesets

**Enterprise-level rulesets:**

1. Navigate to Enterprise > AI controls > Custom agents
2. Select the organization containing the `.github-private` repo
3. Click "Create ruleset" in the "Protect agent files using rulesets" section
4. This auto-configures a ruleset that restricts agent profile editing to enterprise owners only

**Ruleset behavior:**

- Members with write access can still create PRs proposing changes
- Members with bypass access to the ruleset can merge those PRs
- Creating the ruleset also blocks org owners from creating/editing org-level agents
- Ruleset can be edited to target only the specific org containing enterprise agents (to prevent blocking other orgs)

**Testing workflow (org/enterprise):**

1. Create test agent in `.github-private/.github/agents/` (scoped to repo only)
2. Test via agents tab at `github.com/copilot/agents`
3. Iterate and refine agent profile
4. Release by moving from `.github/agents/` → `agents/` (root directory)
5. Merge to default branch to make available

**Monitoring:**

- Organization audit log: filter by `actor:Copilot`
- Enterprise: "Monitoring agentic activity" dashboard
- AI managers can be delegated for agent management

### 9. devopsabcs-engineering/.github-private Organization Patterns

The `.github-private` repo follows a mature pattern for organization-wide agent deployment:

**Structural pattern:**

```text
.github-private/
  README.md              # Template instructions
  agents/
    security-agent.md    # Full security review
    security-plan-creator.agent.md
    security-reviewer-agent.md
    pipeline-security-agent.md
    iac-security-agent.md
    supply-chain-security-agent.md
    a11y-detector.agent.md
    a11y-resolver.agent.md
  prompts/
    a11y-scan.prompt.md  # Reusable prompt file
```

**Agent design patterns observed:**

1. **Comprehensive tool declarations:** All agents declare 30+ tools explicitly (read, edit, search, execute, web, etc.)
2. **Model pinning:** All agents specify `model: Claude Sonnet 4.5 (copilot)` for consistency
3. **Domain separation:** Agents have clear scope boundaries with explicit "out of scope" sections referencing other agents
4. **Structured output:** Each agent defines specific output file paths, report templates, and naming conventions
5. **PR-ready changesets:** Security agents produce diff-format patches ready for PR creation
6. **Prompt-to-agent binding:** Prompt files reference agents via `agent:` frontmatter property (e.g., `agent: A11y Detector`)
7. **Severity frameworks:** Agents use consistent severity classifications (CRITICAL/HIGH/MEDIUM/LOW)
8. **Phased execution:** Complex agents define multi-phase workflows with progression gates

### 10. Customization Feature Comparison Matrix

| Feature | Trigger | Portability | Content | Scope |
|---------|---------|-------------|---------|-------|
| **Custom instructions** | Automatic (always-on) | VS Code + GitHub.com | Instructions only | Repo-wide or path-specific |
| **Prompt files** | Manual (reference in chat) | VS Code, JetBrains (P), CLI, GitHub.com | Focused tasks with input variables | Per-invocation |
| **Custom agents** | Manual (agent dropdown) | VS Code, JetBrains (P), Eclipse (P), Xcode (P), CLI, GitHub.com | Persona + tools + instructions | Persistent per-session |
| **Subagents** | Automatic or manual | VS Code, JetBrains (P), Eclipse (P), Xcode (P), GitHub.com | Delegated work in isolation | Runtime process |
| **Agent skills** | Automatic (on-demand) | VS Code, CLI, GitHub.com | Instructions + scripts + resources | On-demand per-task |
| **MCP servers** | Automatic or by name | All IDEs, CLI, GitHub.com | External tool connections | Tool-level |
| **Agent plugins** | Install from marketplace | VS Code only | Bundle of all above | Per-user installation |

(P) = Preview

### 11. Claude Agent Format Compatibility

VS Code also detects `.md` files in the `.claude/agents` folder, following the Claude sub-agents format:

| Property | Claude Format | VS Code Format |
|----------|--------------|----------------|
| `tools` | Comma-separated string (e.g., `"Read, Grep, Glob, Bash"`) | YAML array |
| `disallowedTools` | Comma-separated string | Not supported (use explicit tool list instead) |

VS Code maps Claude-specific tool names to corresponding VS Code tools, enabling the same agent definitions to work across VS Code and Claude Code.

---

## References

| Source | URL | Notes |
|--------|-----|-------|
| VS Code Agent Plugins | https://code.visualstudio.com/docs/copilot/customization/agent-plugins | Plugin architecture, marketplace config, local plugins |
| About Custom Agents | https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-custom-agents | Conceptual overview, profile format, scope hierarchy |
| Prepare for Custom Agents (Org) | https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/prepare-for-custom-agents | `.github-private` repo setup for org |
| Prepare for Custom Agents (Enterprise) | https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/prepare-for-custom-agents | Enterprise config, rulesets, AI managers |
| Creating Custom Agents | https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents | Step-by-step creation across IDEs and GitHub.com |
| Custom Agents Configuration | https://docs.github.com/en/copilot/reference/custom-agents-configuration | Full YAML specification, tool aliases, MCP config, processing order |
| Testing and Releasing Custom Agents | https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/test-custom-agents | Test/release workflow, `.github/agents/` vs `agents/` staging |
| Customization Cheat Sheet | https://docs.github.com/en/copilot/reference/customization-cheat-sheet | Feature comparison matrix, IDE support matrix |
| Custom Agents in VS Code | https://code.visualstudio.com/docs/copilot/customization/custom-agents | VS Code-specific features: handoffs, hooks, Claude format, subagents |
| Agent Skills in VS Code | https://code.visualstudio.com/docs/copilot/customization/agent-skills | SKILL.md spec, open standard (agentskills.io), extension contribution |
| Managing Agents in Enterprise | https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents | Enterprise agent management overview |
| devopsabcs-engineering/.github-private | GitHub repo | Organization-level agent patterns (security, a11y, pipeline agents) |

---

## Discovered Topics & Questions

1. **Agent Skills open standard (agentskills.io):** An emerging portable standard for AI skills across multiple agents.
2. **Subagent orchestration:** VS Code supports running custom agents as subagents (experimental), enabling multi-agent workflows.
3. **Handoff workflows:** VS Code supports sequential agent transitions with pre-filled prompts and optional auto-submit.
4. **Claude Code compatibility:** VS Code supports Claude agent format in `.claude/agents/` for cross-tool portability.
5. **AI managers delegation:** Enterprise can establish AI manager teams to delegate agent creation/management.
6. **Audit logging for agents:** Both org and enterprise levels support audit log filtering by `actor:Copilot`.
7. **Plugin marketplaces as Git repos:** Plugin distribution uses Git repositories rather than a centralized marketplace.
8. **Agent versioning via Git SHA:** Ensures reproducible agent behavior tied to specific commits.

---

## Next Research & Outstanding Questions

### Recommended next research (not completed this session)

- [ ] Fetch and analyze the Agent Skills specification from agentskills.io for the full formal spec
- [ ] Research `awesome-copilot` repository for community agent patterns and examples
- [ ] Research `copilot-plugins` repository for official plugin catalog and contribution guidelines
- [ ] Investigate MCP server authoring patterns for custom tool development
- [ ] Research the GitHub Copilot CLI agent integration (`/agent` slash command)
- [ ] Investigate the "Customization Library" at `docs.github.com/en/copilot/tutorials/customization-library`
- [ ] Research agent subagent orchestration patterns and the `agent/runSubagent` tool
- [ ] Investigate hooks authoring (lifecycle event types, JSON format, security model)
- [ ] Research the `chat.plugins.enabled` setting behavior and rollout timeline
- [ ] Investigate differences in agent behavior across different LLM models specified in `model:` property

### Clarifying questions that require more information

- What is the current rollout status of agent plugins in VS Code stable vs Insiders?
- Are there rate limits or quotas on custom agent invocations at org/enterprise level?
- Can MCP servers in agent YAML be used with VS Code (or is it strictly GitHub.com only)?
- How do agent rulesets interact with branch protection rules and CODEOWNERS?
