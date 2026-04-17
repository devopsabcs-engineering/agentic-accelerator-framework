---
title: "Prompt File Security"
description: "Threat model, attack categories, and mitigation controls for AI agent configuration files — the blind spot in DevSecOps pipelines not covered by SAST, SCA, or DAST."
ms.date: 2026-03-17
ms.topic: concept
---

## The Blind Spot

AI coding agents (GitHub Copilot, Claude Code, Cursor, and similar) consume configuration from markdown-based files that are auto-loaded as trusted system instructions. These files include `.instructions.md`, `.agent.md`, `.prompt.md`, `copilot-instructions.md`, `AGENTS.md`, and `SKILL.md`.

Traditional DevSecOps pipelines focus scanning on source code (SAST), dependencies (SCA), container images, infrastructure as code, and runtime applications (DAST). None of these tools inspect agent configuration files for prompt injection, data exfiltration directives, or supply chain manipulation. The result is a critical blind spot: malicious instructions can be committed to a repository, pass every CI check, and silently alter how an AI agent generates code for every developer on the team.

Agent configuration files are:

- Checked into source control like regular code
- Auto-consumed by AI coding agents as system-level prompts
- Contributed via PRs from external contributors
- Not covered by standard SAST, SCA, or secret scanning tools
- Distributed through agent plugin marketplaces, introducing a new supply chain vector

## Attack Categories

Six attack categories target agent configuration files. Each exploits the gap between what human reviewers see in a markdown file and what an AI model interprets as instructions.

| # | Attack | Technique | Risk |
|---|--------|-----------|------|
| 1 | Prompt injection via Unicode homoglyphs | Zero-width characters (U+200B, U+200C, U+200D), bidi overrides (U+202A-E, U+2066-9), and variation selectors (U+E0100-E01EF, the Glassworm vector) embed invisible instructions that the model reads but humans cannot see | Agent follows hidden commands invisible to code reviewers |
| 2 | Hidden instructions via base64 encoding | Base64-encoded payloads or markdown comments (`<!-- ... -->`) carry directives that bypass casual review | Malicious behavior triggered on decode or model interpretation |
| 3 | Exfiltration via embedded URLs | Instructions directing the agent to include calls to external endpoints in generated code (error handlers, logging, telemetry) | Sensitive data sent to attacker-controlled servers |
| 4 | Tool manipulation via shell commands | Hook configurations (`post-test.json`, lifecycle hooks) execute arbitrary shell commands; agent profiles grant access to unauthorized tools or MCP servers | Arbitrary code execution on developer machines |
| 5 | Override patterns (system prompt overrides) | Instructions that tell the agent to "ignore previous instructions," bypass safety restrictions, or override output formatting | Security guardrails disabled, behavior altered |
| 6 | MCP server hijacking | Agent profiles declare `mcp-server` configurations connecting to attacker-controlled services; plugin marketplace entries mimic legitimate plugin names | External code execution, dependency confusion, data exfiltration |

## OWASP LLM Top 10 Alignment

These attack categories map directly to four entries in the OWASP Top 10 for LLM Applications (2025).

| OWASP Risk | ID | Relevance to Agent Config Files |
|------------|----|---------------------------------|
| Prompt Injection | LLM01 | Malicious instructions placed in configuration files alter coding agent behavior. Covers both direct injection (instructions in the file itself) and indirect injection (files that cause the agent to process external untrusted content). MITRE ATLAS: AML.T0051.000, AML.T0051.001 |
| Supply Chain | LLM03 | Agent configuration files are part of the LLM supply chain. Compromised PRs, plugin marketplace poisoning, and dependency confusion all apply. SBOM inventories typically do not include agent instruction files |
| Excessive Agency | LLM06 | Agent profiles define tool access, MCP server connections, and autonomy levels. Overly broad configurations grant excessive functionality, permissions, or autonomy beyond what the task requires |
| System Prompt Leakage | LLM07 | Agent configuration files are system prompts. If leaked, they reveal the application's security architecture, trust boundaries, and tool access patterns |

> [!NOTE]
> LLM02 (Sensitive Information Disclosure) also applies when agent configuration files inadvertently contain API keys, internal URLs, or organizational secrets.

## APM as the Primary Defense

Daniel Meppiel ([@danielmeppiel](https://github.com/danielmeppiel)), creator of Microsoft's APM (Agent Package Manager), identified this gap and built content security scanning directly into APM as a first-class feature. His LinkedIn article ["Scan Your Coding Agent's Configuration for Hidden Supply Chain Attacks"](https://www.linkedin.com/pulse/how-scan-your-coding-agents-prompt-files-hidden-attacks-meppiel-2bsje/) details the threat model. APM's `apm audit` and install-time scanning represent the first dedicated tooling to address this attack surface.

### What APM Provides

APM (`microsoft/apm`, MIT license) is an open-source dependency manager for AI agents. It functions like `package.json` but for agent configurations: instructions, skills, prompts, agents, hooks, plugins, and MCP servers. The `apm.yml` manifest declares all agentic dependencies, enables transitive resolution, and supports installation from any Git host.

### `apm audit` Severity Levels

| Severity | Detections |
|----------|------------|
| Critical | Tag characters (U+E0001-E007F), bidi overrides (U+202A-E, U+2066-9), variation selectors 17-256 (U+E0100-E01EF, the Glassworm attack vector) |
| Warning | Zero-width spaces/joiners (U+200B-D), variation selectors 1-15 (U+FE00-FE0E), bidi marks (U+200E-F, U+061C), invisible operators (U+2061-4), annotation markers (U+FFF9-B), deprecated formatting (U+206A-F), soft hyphen (U+00AD), mid-file BOM |
| Info | Non-breaking spaces, unusual whitespace, emoji presentation selectors (U+FE0F). ZWJ between emoji characters is context-downgraded to info |

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Clean, no findings |
| 1 | Critical findings detected |
| 2 | Warnings only |

### CLI Examples

```bash
# Scan all installed packages
apm audit

# Scan a specific file (works on non-APM-managed files too)
apm audit --file .github/copilot-instructions.md

# Remove dangerous characters while preserving emoji
apm audit --strip

# Preview what --strip would remove without modifying files
apm audit --strip --dry-run
```

## Defense-in-Depth

Content security scanning runs at three points in the APM lifecycle, creating layered protection from installation through compilation.

```text
Install-time                  Audit                        Compile-time
─────────────────────────     ─────────────────────────    ─────────────────────────
apm install                   apm audit                    apm compile
│                             │                            │
├─ Blocks compromised         ├─ On-demand scanning of     ├─ Scans compiled output
│  packages before agents     │  installed packages or     │  before writing to disk
│  can read them              │  arbitrary files            │
│                             │                            │
└─ Critical findings block    └─ Full severity reporting   └─ Final gate before
   (use --force to override)                                  agent consumption
```

## CODEOWNERS Protection

Protect agent configuration directories with mandatory security team approval. This prevents unauthorized modifications from reaching the default branch without review.

```text
# .github/CODEOWNERS
.github/copilot-instructions.md  @devopsabcs-engineering/security-team
agents/                          @devopsabcs-engineering/security-team
instructions/                    @devopsabcs-engineering/security-team
prompts/                         @devopsabcs-engineering/security-team
skills/                          @devopsabcs-engineering/security-team
**/AGENTS.md                     @devopsabcs-engineering/security-team
**/SKILL.md                      @devopsabcs-engineering/security-team
apm.yml                          @devopsabcs-engineering/security-team
mcp.json                         @devopsabcs-engineering/security-team
```

> [!IMPORTANT]
> CODEOWNERS enforcement requires branch protection rules that mandate PR review. Without branch protection, CODEOWNERS entries are advisory only.

## CI Pipeline Scanning Checklist

Every PR that modifies agent configuration files should be scanned for the following patterns:

| Check | Pattern | Rationale |
|-------|---------|-----------|
| Base64 encoding | Strings matching `[A-Za-z0-9+/=]{40,}` | May contain hidden instructions decoded by the model |
| Unicode anomalies | Zero-width characters, bidi overrides, tag characters, variation selectors | Invisible text the model reads but reviewers cannot see |
| Embedded URLs | `http://` or `https://` links to external domains | Potential exfiltration endpoints injected into generated code |
| Shell commands | Patterns containing `&&`, `\|`, `;`, backticks, `$()` | Arbitrary code execution via hook configurations |
| Override patterns | Phrases like "ignore previous instructions," "override," "bypass" | Attempts to disable agent safety guardrails |
| MCP server allowlist | `mcp-server` configurations referencing servers not on the approved list | Unauthorized external service connections |

## CI/CD Integration with `microsoft/apm-action`

Add APM security scanning to your GitHub Actions pipeline using the official `microsoft/apm-action`:

```yaml
# .github/workflows/apm-security.yml
name: APM Security Scan
on:
  pull_request:
    paths:
      - 'apm.yml'
      - 'agents/**'
      - 'instructions/**'
      - 'prompts/**'
      - 'skills/**'
      - '**/*.agent.md'
      - '**/*.instructions.md'
      - '**/*.prompt.md'
      - '**/SKILL.md'
      - '.github/copilot-instructions.md'

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: microsoft/apm-action@v1
        with:
          command: audit
```

The workflow triggers on every PR that touches agent configuration files and fails the check when `apm audit` returns exit code 1 (critical findings).

## Supply Chain Parallels

The agent configuration supply chain mirrors traditional software supply chain attacks in structure and risk.

| Traditional Supply Chain Attack | Agent Config Equivalent |
|---------------------------------|-------------------------|
| Malicious npm package | Malicious agent plugin in a marketplace |
| Typosquatting package names | Agent plugin name confusion |
| Compromised dependency update | PR modifying `copilot-instructions.md` |
| Poisoned Docker image | Agent profile with unauthorized MCP server |
| Malicious GitHub Action | Hook configuration executing shell commands |
| Dependency confusion | Organization vs. repository instruction conflicts |

## APM Security Domain Artifacts

The threat model described in this document is operationalized by the **APM Security** domain. The following framework artifacts implement the 4-engine scanning architecture:

| Artifact | Path | Purpose |
|----------|------|---------|
| Detector agent | `agents/apm-security-detector.agent.md` | 4-engine scanner with OWASP LLM mapping |
| Resolver agent | `agents/apm-security-resolver.agent.md` | Automated remediation for all 4 engines |
| Instructions | `instructions/apm-security.instructions.md` | Scanning rules and CI gate thresholds |
| Scan prompt | `prompts/apm-security-scan.prompt.md` | Scan workflow entry point |
| Fix prompt | `prompts/apm-security-fix.prompt.md` | Remediation workflow entry point |
| Domain skill | `skills/apm-security-scan/SKILL.md` | Comprehensive domain knowledge package |
| GH Actions sample | `samples/github-actions/apm-security-scan.yml` | Reference CI pipeline |
| ADO pipeline sample | `samples/azure-devops/apm-security-pipeline.yml` | Reference ADO pipeline |
| DIY guide | `docs/DIY-APM-Security-Domain.md` | Step-by-step domain build guide |

## References

- [OWASP Top 10 for LLM Applications (2025)](https://genai.owasp.org/llm-top-10/)
- [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- [OWASP LLM03:2025 Supply Chain](https://genai.owasp.org/llmrisk/llm032025-supply-chain/)
- [OWASP LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
- [MITRE ATLAS AML.T0051 LLM Prompt Injection](https://atlas.mitre.org/techniques/AML.T0051)
- [microsoft/apm (Agent Package Manager)](https://github.com/microsoft/apm)
- [microsoft/apm-action (GitHub Action)](https://github.com/microsoft/apm-action)
- [GitHub Docs: About custom agents](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-custom-agents)
- [VS Code Docs: Agent plugins](https://code.visualstudio.com/docs/copilot/customization/agent-plugins)
- Daniel Meppiel, ["Scan Your Coding Agent's Configuration for Hidden Supply Chain Attacks"](https://www.linkedin.com/pulse/how-scan-your-coding-agents-prompt-files-hidden-attacks-meppiel-2bsje/) (LinkedIn, 2025)
