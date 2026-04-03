---
description: "Scaffold a new domain's scanner demo-app and workshop repositories with full parity to existing domains"
agent: DomainScaffolder
argument-hint: "[domain=...] [tools=...]"
---

# Scaffold Domain

## Inputs

* ${input:domain}: (Required) Domain name in lowercase hyphenated format (e.g., code-quality, security).
* ${input:tools}: (Optional) Comma-separated list of scanning tools. Auto-detected from domain skill if omitted.
* ${input:output_dir}: (Optional) Output directory for generated repos. Defaults to parent of current workspace.

## Requirements

1. Load the domain scaffolding skill and the domain-specific scan skill.
2. Generate the complete `{domain}-scan-demo-app` repository structure with 5 sample apps, CI/CD pipelines, bootstrap scripts, SARIF converters, and Power BI PBIP.
3. Generate the complete `{domain}-scan-workshop` repository structure with 10 labs, screenshot automation, dev container, and Jekyll site.
4. Ensure structural parity with accessibility-scan-demo-app and finops-scan-demo-app.
5. Produce a scaffolding summary with file counts and next steps.
