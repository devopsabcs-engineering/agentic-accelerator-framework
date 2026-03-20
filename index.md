---
layout: default
title: Agentic Accelerator Framework
---

## Overview

**Agentic Accelerator = GitHub Advanced Security + GitHub Copilot Custom Agents + Microsoft Defender for Cloud**

*(GitHub preferred; Azure DevOps first-class citizen)*

The Agentic Accelerator Framework provides a repeatable, org-wide approach to shifting security and compliance left using custom GitHub Copilot agents. It covers four domains — Security, Accessibility, Code Quality, and FinOps — with SARIF-based CI/CD integration across GitHub Actions and Azure DevOps.

## Quick Links

- [Architecture](docs/architecture.md)
- [SARIF Integration](docs/sarif-integration.md)
- [Platform Comparison](docs/platform-comparison.md)
- [Implementation Roadmap](docs/implementation-roadmap.md)
- [Centralized Governance](docs/centralized-governance.md)
- [Azure DevOps Pipelines](docs/azure-devops-pipelines.md)
- [Agent Extensibility](docs/agent-extensibility.md)
- [Agent Patterns](docs/agent-patterns.md)
- [Prompt File Security](docs/prompt-file-security.md)

## Agent Domains

| Domain | Agents | Description |
|--------|--------|-------------|
| Security | 6 | OWASP Top 10, IaC scanning, pipeline hardening, supply chain |
| Accessibility | 2 | WCAG 2.2 Level AA detection and auto-remediation |
| Code Quality | 2 | Coverage gates, test generation, complexity analysis |
| FinOps | 5 | Cost analysis, anomaly detection, optimization, governance |

## Getting Started

1. Clone the repository
2. Open in VS Code with GitHub Copilot enabled
3. Invoke any agent from the Copilot Chat panel
4. Enable CI/CD workflows for automated scanning
