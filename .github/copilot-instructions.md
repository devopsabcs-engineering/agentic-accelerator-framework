---
description: "Repo-wide conventions for all GitHub Copilot custom agents in the Agentic Accelerator Framework"
applyTo: "**"
---

## Framework Purpose

This repository defines custom GitHub Copilot agents for the Agentic Accelerator Framework. All agents, instructions, prompts, and skills follow the conventions below to ensure consistency across the Security, Accessibility, Code Quality, and FinOps domains.

## SARIF Output Standard

All agents that produce findings MUST output SARIF v2.1.0 compliant results:

* Include `partialFingerprints` for deduplication across runs.
* Set `automationDetails.id` using the domain category prefix (e.g., `security/`, `accessibility-scan/`, `code-quality/coverage/`, `finops-finding/v1`).
* Populate `runs[].tool.driver.name` with the agent name.
* Include `runs[].tool.driver.rules[]` with unique `ruleId` values per finding type.
* Set `runs[].results[].level` using the severity mapping below.

## Severity Classification

All findings MUST use one of the following severity levels, mapped to SARIF levels:

| Severity | SARIF Level | Description |
|----------|-------------|-------------|
| CRITICAL | `error` | Immediate risk — active exploitation possible, data exposure, or compliance violation |
| HIGH | `error` | Significant risk — must be remediated before merge |
| MEDIUM | `warning` | Moderate risk — should be addressed in current sprint |
| LOW | `note` | Minor risk — track for future improvement |

When applicable, map findings to:

* **CWE IDs** for security findings (e.g., CWE-79 for XSS)
* **OWASP Top 10** categories for application security
* **OWASP LLM Top 10** categories for AI/LLM-related findings
* **WCAG 2.2** success criteria for accessibility findings

## Agent Output Format

Agents producing Markdown reports MUST follow this structure:

1. **Summary**: One-paragraph overview of findings count and severity distribution.
2. **Findings Table**: Tabular list with columns: Severity, Rule ID, File, Line, Description.
3. **Remediation Guidance**: Grouped by severity, with code fix suggestions where possible.
4. **References**: Links to relevant standards (OWASP, WCAG, CWE).

## PR-Ready Output

Agents supporting automated remediation SHOULD produce:

* Unified diff patches for direct application
* Fix packs grouped by finding type
* PR description templates with `Fixes AB#` work item references

## Domain-Specific Instructions

Refer to the following instruction files for domain-specific conventions:

* `instructions/` — Path-specific instruction files for agent behavior
* `agents/` — Custom GHCP agent definitions with YAML frontmatter
* `prompts/` — Reusable prompt templates for common operations
* `skills/` — On-demand domain knowledge packages (SKILL.md files)

## Standards References

* [SARIF v2.1.0 Specification](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html)
* [OWASP Top 10](https://owasp.org/www-project-top-ten/)
* [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
* [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
* [CIS Azure Benchmarks](https://www.cisecurity.org/benchmark/azure)
