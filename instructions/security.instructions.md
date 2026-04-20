---
description: "Security standards — OWASP Top 10, CWE mappings, IaC hardening, pipeline security, supply chain controls"
applyTo: "**/*.ts,**/*.js,**/*.py,**/*.cs,**/*.java,**/*.go,**/*.bicep,**/*.tf,**/*.yml,**/*.yaml"
---

# Security Standards

These rules apply automatically when editing application code and infrastructure files. Follow these standards to ensure code is free from OWASP Top 10 vulnerabilities, infrastructure is hardened to CIS benchmarks, and the software supply chain is protected.

## OWASP Top 10 Vulnerability Categories

Scan and enforce against the following OWASP Top 10 (2021) categories. Map every finding to its primary CWE identifier for SARIF enrichment.

| # | OWASP Category | Primary CWEs | Detection Approach |
|---|---|---|---|
| A01 | Broken Access Control | CWE-200, CWE-201, CWE-352, CWE-639, CWE-862, CWE-863 | SAST (authorization checks), code review (RBAC patterns) |
| A02 | Cryptographic Failures | CWE-259, CWE-261, CWE-327, CWE-328, CWE-330, CWE-522 | SAST (weak algorithms), secret scanning |
| A03 | Injection | CWE-20, CWE-77, CWE-78, CWE-79, CWE-89, CWE-94 | SAST (taint analysis), DAST (fuzzing) |
| A04 | Insecure Design | CWE-209, CWE-256, CWE-501, CWE-522 | Architecture review, threat modeling |
| A05 | Security Misconfiguration | CWE-2, CWE-11, CWE-16, CWE-611 | IaC scanning, configuration audit |
| A06 | Vulnerable and Outdated Components | CWE-1104 | SCA (Dependabot, Dependency Review), SBOM |
| A07 | Identification and Authentication Failures | CWE-255, CWE-287, CWE-384, CWE-613 | SAST (session management), DAST (auth flows) |
| A08 | Software and Data Integrity Failures | CWE-345, CWE-426, CWE-494, CWE-502, CWE-829 | CI/CD integrity checks, artifact attestations |
| A09 | Security Logging and Monitoring Failures | CWE-117, CWE-223, CWE-532, CWE-778 | Code review (logging patterns), monitoring audit |
| A10 | Server-Side Request Forgery (SSRF) | CWE-918 | SAST (URL construction), DAST (SSRF payloads) |

## CWE ID Mapping Conventions

Every finding MUST include a CWE identifier. Use the following common CWE-to-rule mapping for automated detection.

| CWE ID | Name | Rule Pattern | OWASP Category |
|---|---|---|---|
| CWE-79 | Cross-site Scripting (XSS) | Unescaped user input in HTML output | A03 |
| CWE-89 | SQL Injection | String concatenation in SQL queries | A03 |
| CWE-78 | OS Command Injection | User input in shell commands | A03 |
| CWE-352 | Cross-Site Request Forgery | Missing anti-forgery tokens on state-changing actions | A01 |
| CWE-522 | Insufficiently Protected Credentials | Hardcoded secrets, weak password storage | A02 |
| CWE-327 | Use of a Broken Crypto Algorithm | MD5, SHA-1 for integrity, DES/RC4 encryption | A02 |
| CWE-862 | Missing Authorization | Endpoints without authorization checks | A01 |
| CWE-918 | Server-Side Request Forgery | User-controlled URLs in server-side requests | A10 |
| CWE-502 | Deserialization of Untrusted Data | Unsafe deserialization without type filtering | A08 |
| CWE-611 | Improper Restriction of XML External Entity Reference | XML parsing without disabling external entities | A05 |

## SARIF Output Requirements

All security scan results MUST produce SARIF v2.1.0 compliant output.

- Include `partialFingerprints` for deduplication across runs.
- Set `automationDetails.id` using the prefix `security/` (e.g., `security/sast`, `security/iac`).
- Populate `runs[].tool.driver.name` with the agent name (`SecurityAgent`).
- Include `runs[].tool.driver.rules[]` with unique `ruleId` values per finding type.
- Set `runs[].results[].level` using the severity mapping below.
- Include `runs[].results[].taxa[]` referencing CWE identifiers.

## Severity Classification

Map all findings to the following severity levels.

| Severity | SARIF Level | Description |
|---|---|---|
| CRITICAL | `error` | Immediate risk — active exploitation possible, data exposure, or compliance violation |
| HIGH | `error` | Significant risk — must be remediated before merge |
| MEDIUM | `warning` | Moderate risk — should be addressed in current sprint |
| LOW | `note` | Minor risk — track for future improvement |

### Severity Assignment Guidelines

- **CRITICAL:** Remote code execution, authentication bypass, SQL injection in production paths, exposed secrets in source control.
- **HIGH:** XSS in user-facing paths, missing authorization on sensitive endpoints, weak cryptography for sensitive data.
- **MEDIUM:** Missing security headers, overly permissive CORS, verbose error messages exposing internals.
- **LOW:** Informational findings, best practice deviations without direct exploitability.

## IaC Hardening Patterns

Infrastructure-as-Code files (Bicep, Terraform, ARM) MUST comply with CIS Azure Benchmark controls.

| Control Area | Requirement | Severity |
|---|---|---|
| Storage accounts | Require HTTPS, disable public blob access, enable soft delete | HIGH |
| Key Vault | Enable soft delete and purge protection, use RBAC access model | HIGH |
| Network security groups | Deny inbound from `0.0.0.0/0` on management ports (22, 3389) | CRITICAL |
| App Service | Enforce HTTPS-only, set minimum TLS 1.2, disable FTP | HIGH |
| SQL databases | Enable Transparent Data Encryption, configure auditing | HIGH |
| Container registries | Enable content trust, disable admin user, use private endpoints | MEDIUM |
| Managed identities | Prefer system-assigned identities over shared keys or passwords | MEDIUM |

### IaC Scanning Rules

| Rule ID | Check | CIS Reference |
|---|---|---|
| IAC-001 | Storage account allows HTTP | CIS 3.1 |
| IAC-002 | Storage account allows public blob access | CIS 3.5 |
| IAC-003 | Key Vault missing purge protection | CIS 8.4 |
| IAC-004 | NSG allows unrestricted inbound on port 22 or 3389 | CIS 6.2 |
| IAC-005 | App Service does not enforce HTTPS | CIS 9.2 |
| IAC-006 | SQL database TDE disabled | CIS 4.1.2 |
| IAC-007 | Container registry admin user enabled | CIS 3.8 |

## Pipeline Security Controls

CI/CD pipeline configurations MUST enforce security controls.

| Control | Requirement | Severity |
|---|---|---|
| Least-privilege runners | Use minimal permissions; avoid admin-level service connections | HIGH |
| Secret management | Use pipeline secret variables or Key Vault references; never hardcode secrets | CRITICAL |
| Signed commits | Require commit signing for protected branches | MEDIUM |
| Artifact attestation | Sign build artifacts and container images with provenance metadata | MEDIUM |
| Dependency review | Run SCA checks before merging dependency updates | HIGH |
| SARIF upload | Upload scan results to GitHub Advanced Security or equivalent dashboard | MEDIUM |

### Pipeline Configuration Checks

| Rule ID | Check | Applies To |
|---|---|---|
| PIPE-001 | Pipeline uses hardcoded credentials | YAML workflows |
| PIPE-002 | Pipeline runs with elevated permissions without justification | YAML workflows |
| PIPE-003 | Pipeline does not pin action/task versions | GitHub Actions, Azure Pipelines |
| PIPE-004 | Pipeline allows self-hosted runner on public repo | GitHub Actions |
| PIPE-005 | Pipeline skips dependency review on PRs | GitHub Actions, Azure Pipelines |

## Supply Chain Security

Dependency management MUST follow supply chain security controls.

| Control | Requirement | Severity |
|---|---|---|
| Lockfile integrity | Lockfiles must be committed and verified in CI | HIGH |
| Dependency pinning | Pin exact versions in production dependencies | MEDIUM |
| Vulnerability scanning | Run SCA on every PR; block merge on CRITICAL/HIGH CVEs | HIGH |
| License compliance | Verify dependency licenses against approved list | MEDIUM |
| SBOM generation | Generate Software Bill of Materials for release artifacts | LOW |
| Transitive dependency audit | Review transitive dependencies for known vulnerabilities | MEDIUM |

### SCA Integration

- Run `npm audit`, `pip audit`, `dotnet list package --vulnerable`, or equivalent per ecosystem.
- Block merge when CRITICAL or HIGH vulnerabilities are found with available patches.
- Allow merge with MEDIUM/LOW vulnerabilities if tracked in a remediation backlog.

## CI/CD Quality Gate

The following checks MUST pass in CI before merge for application and infrastructure changes.

```text
1. SAST scan passes with no CRITICAL/HIGH findings
2. IaC scan validates against CIS Azure Benchmarks
3. Pipeline configuration checks pass
4. SCA dependency scan shows no unpatched CRITICAL/HIGH CVEs
5. SARIF upload succeeds for all scan types
6. Code coverage meets minimum threshold per code-quality standards
```

## References

- [OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/)
- [OWASP LLM Top 10 (2025)](https://genai.owasp.org/llm-top-10/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/archive/2023/2023_top25_list.html)
- [CIS Azure Foundations Benchmark](https://www.cisecurity.org/benchmark/azure)
- [SARIF v2.1.0 Specification](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html)
- [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security)
