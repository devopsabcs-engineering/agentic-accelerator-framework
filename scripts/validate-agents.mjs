#!/usr/bin/env node

/**
 * Agent Validation Script — Tier 1–4 structural, cross-reference, and domain checks.
 * Validates all .agent.md, .instructions.md, .prompt.md, and SKILL.md files
 * in the Agentic Accelerator Framework repository.
 *
 * Usage: node scripts/validate-agents.mjs
 * Exit code 1 on any blocking error, 0 on pass.
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { minimatch } from 'minimatch';
import { createHash } from 'node:crypto';

// ── Constants ────────────────────────────────────────────────────────────────

const ROOT = process.cwd();

const DOMAIN_MAP = {
  Security: [
    'SecurityAgent',
    'SecurityReviewerAgent',
    'SecurityPlanCreator',
    'PipelineSecurityAgent',
    'IaCSecurityAgent',
    'SupplyChainSecurityAgent',
  ],
  Accessibility: ['A11yDetector', 'A11yResolver'],
  'Code Quality': ['CodeQualityDetector', 'TestGenerator'],
  FinOps: [
    'CostAnalysisAgent',
    'CostAnomalyDetector',
    'CostOptimizerAgent',
    'DeploymentCostGateAgent',
    'FinOpsGovernanceAgent',
  ],
  Scaffolding: ['DomainScaffolder'],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function severity(level) {
  return level; // 'error' | 'warning' | 'info'
}

function finding(file, rule, level, message) {
  return { file, rule, level: severity(level), message };
}

function fingerprint(f) {
  const data = `${f.file}:${f.rule}:${f.message}`;
  return createHash('sha256').update(data).digest('hex').slice(0, 16);
}

function collectRepoFiles(dir, base) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.posix.join(base, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules, .git, coverage, .venv
      if (['node_modules', '.git', 'coverage', '.venv', '.copilot-tracking'].includes(entry.name)) continue;
      results.push(...collectRepoFiles(full, rel));
    } else {
      results.push(rel);
    }
  }
  return results;
}

// ── Tier 1: Inventory & Structural Validation ───────────────────────────────

function loadInventory() {
  const inventory = { agents: [], instructions: [], prompts: [], skills: [] };

  // Agents
  const agentsDir = path.join(ROOT, 'agents');
  if (fs.existsSync(agentsDir)) {
    for (const f of fs.readdirSync(agentsDir)) {
      if (f.endsWith('.agent.md')) {
        const filePath = path.join(agentsDir, f);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = matter(raw);
        inventory.agents.push({
          file: `agents/${f}`,
          filePath,
          data: parsed.data,
          content: parsed.content,
        });
      }
    }
  }

  // Instructions
  const instrDir = path.join(ROOT, 'instructions');
  if (fs.existsSync(instrDir)) {
    for (const f of fs.readdirSync(instrDir)) {
      if (f.endsWith('.instructions.md')) {
        const filePath = path.join(instrDir, f);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = matter(raw);
        inventory.instructions.push({
          file: `instructions/${f}`,
          filePath,
          data: parsed.data,
          content: parsed.content,
        });
      }
    }
  }

  // Prompts
  const promptsDir = path.join(ROOT, 'prompts');
  if (fs.existsSync(promptsDir)) {
    for (const f of fs.readdirSync(promptsDir)) {
      if (f.endsWith('.prompt.md')) {
        const filePath = path.join(promptsDir, f);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = matter(raw);
        inventory.prompts.push({
          file: `prompts/${f}`,
          filePath,
          data: parsed.data,
          content: parsed.content,
        });
      }
    }
  }

  // Skills
  const skillsDir = path.join(ROOT, 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const d of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (d.isDirectory()) {
        const skillFile = path.join(skillsDir, d.name, 'SKILL.md');
        if (fs.existsSync(skillFile)) {
          const raw = fs.readFileSync(skillFile, 'utf-8');
          const parsed = matter(raw);
          inventory.skills.push({
            file: `skills/${d.name}/SKILL.md`,
            filePath: skillFile,
            data: parsed.data,
            content: parsed.content,
          });
        }
      }
    }
  }

  return inventory;
}

function validateAgentFrontmatter(item) {
  const results = [];
  const { file, data } = item;

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    results.push(finding(file, 'missing-frontmatter', 'error', 'Agent file has no YAML frontmatter'));
    return results;
  }

  // Required: name
  if (!data.name || typeof data.name !== 'string') {
    results.push(finding(file, 'missing-required-field', 'error', 'Missing required field: name'));
  }

  // Required: description
  if (!data.description || typeof data.description !== 'string') {
    results.push(finding(file, 'missing-required-field', 'error', 'Missing required field: description'));
  }

  // Optional but recommended: model
  if (!data.model) {
    results.push(finding(file, 'missing-model', 'warning', 'Missing optional field: model'));
  }

  // Validate handoffs schema if present
  if (data.handoffs) {
    if (!Array.isArray(data.handoffs)) {
      results.push(finding(file, 'invalid-handoffs-schema', 'error', 'handoffs must be an array'));
    } else {
      for (let i = 0; i < data.handoffs.length; i++) {
        const h = data.handoffs[i];
        if (!h.label || typeof h.label !== 'string') {
          results.push(finding(file, 'invalid-handoffs-schema', 'error', `handoffs[${i}] missing required field: label`));
        }
        if (!h.agent || typeof h.agent !== 'string') {
          results.push(finding(file, 'invalid-handoffs-schema', 'error', `handoffs[${i}] missing required field: agent`));
        }
      }
    }
  }

  return results;
}

function validateInstructionFrontmatter(item) {
  const results = [];
  const { file, data } = item;

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    results.push(finding(file, 'missing-frontmatter', 'error', 'Instruction file has no YAML frontmatter'));
    return results;
  }

  if (!data.description || typeof data.description !== 'string') {
    results.push(finding(file, 'missing-required-field', 'error', 'Missing required field: description'));
  }

  if (!data.applyTo) {
    results.push(finding(file, 'missing-required-field', 'error', 'Missing required field: applyTo'));
  } else {
    // applyTo can be a string or an array of strings
    const patterns = Array.isArray(data.applyTo) ? data.applyTo : [data.applyTo];
    for (const p of patterns) {
      if (typeof p !== 'string') {
        results.push(finding(file, 'invalid-applyto', 'error', `applyTo value must be a string, got ${typeof p}`));
      }
    }
  }

  return results;
}

function validatePromptFrontmatter(item, agentNames) {
  const results = [];
  const { file, data } = item;

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    results.push(finding(file, 'missing-frontmatter', 'error', 'Prompt file has no YAML frontmatter'));
    return results;
  }

  if (!data.description || typeof data.description !== 'string') {
    results.push(finding(file, 'missing-required-field', 'error', 'Missing required field: description'));
  }

  // agent is optional, but if present must reference an existing agent
  if (data.agent && typeof data.agent === 'string') {
    if (!agentNames.includes(data.agent)) {
      results.push(finding(file, 'broken-agent-reference', 'error', `Prompt references unknown agent: ${data.agent}`));
    }
  }

  return results;
}

function validateSkillFrontmatter(item) {
  const results = [];
  const { file, data } = item;

  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    // SKILL.md files may use heading-based metadata — treat as warning
    results.push(finding(file, 'missing-frontmatter', 'warning', 'Skill file has no YAML frontmatter (may use heading-based metadata)'));
    return results;
  }

  if (!data.description || typeof data.description !== 'string') {
    results.push(finding(file, 'missing-required-field', 'error', 'Missing required field: description'));
  }

  return results;
}

// ── Tier 2: Cross-Reference Integrity ───────────────────────────────────────

function loadApmDataSync() {
  const apmPath = path.join(ROOT, 'apm.yml');
  if (!fs.existsSync(apmPath)) {
    return null;
  }
  const raw = fs.readFileSync(apmPath, 'utf-8');
  // apm.yml is just a YAML file without frontmatter delimiters
  // gray-matter can parse it if we add delimiters, or use matter with options
  // Since gray-matter needs --- delimiters, let's wrap it
  const wrapped = `---\n${raw}\n---`;
  const parsed = matter(wrapped);
  return parsed.data;
}

function crossReferenceChecks(inventory, apmData) {
  const results = [];
  const agentNames = inventory.agents
    .map((a) => a.data?.name)
    .filter(Boolean);

  // 1. Handoff targets must match an existing agent name
  for (const agent of inventory.agents) {
    if (agent.data?.handoffs && Array.isArray(agent.data.handoffs)) {
      for (const h of agent.data.handoffs) {
        if (h.agent && !agentNames.includes(h.agent)) {
          results.push(
            finding(agent.file, 'broken-cross-reference', 'error',
              `Handoff target "${h.agent}" does not match any agent name`)
          );
        }
      }
    }
  }

  // 2. Prompt agent references must match an existing agent name
  for (const prompt of inventory.prompts) {
    if (prompt.data?.agent && typeof prompt.data.agent === 'string') {
      if (!agentNames.includes(prompt.data.agent)) {
        results.push(
          finding(prompt.file, 'broken-cross-reference', 'error',
            `Prompt agent reference "${prompt.data.agent}" does not match any agent name`)
        );
      }
    }
  }

  // 3. apm.yml dependency paths must resolve to existing files
  if (apmData?.dependencies) {
    for (const [key, dep] of Object.entries(apmData.dependencies)) {
      if (dep?.path) {
        const fullPath = path.join(ROOT, dep.path);
        if (!fs.existsSync(fullPath)) {
          results.push(
            finding('apm.yml', 'broken-apm-path', 'error',
              `Dependency "${key}" path "${dep.path}" does not resolve to a file`)
          );
        }
      }
    }
  }

  // 4. Instruction applyTo patterns must match at least 1 file in the repo
  const repoFiles = collectRepoFiles(ROOT, '');
  for (const instr of inventory.instructions) {
    if (instr.data?.applyTo) {
      const patterns = Array.isArray(instr.data.applyTo)
        ? instr.data.applyTo
        : instr.data.applyTo.split(',').map((s) => s.trim());
      let anyMatch = false;
      for (const pattern of patterns) {
        for (const f of repoFiles) {
          if (minimatch(f, pattern, { dot: true })) {
            anyMatch = true;
            break;
          }
        }
        if (anyMatch) break;
      }
      if (!anyMatch) {
        results.push(
          finding(instr.file, 'no-matching-files', 'warning',
            `applyTo pattern "${instr.data.applyTo}" does not match any file in the repo`)
        );
      }
    }
  }

  // 5. Orphan check: every agent file in agents/ should be in apm.yml
  if (apmData?.dependencies) {
    const apmPaths = new Set(
      Object.values(apmData.dependencies)
        .filter((d) => d?.path)
        .map((d) => d.path.replace(/\\/g, '/'))
    );
    for (const agent of inventory.agents) {
      const agentRelPath = agent.file.replace(/\\/g, '/');
      if (!apmPaths.has(agentRelPath)) {
        results.push(
          finding(agent.file, 'orphaned-agent', 'warning',
            `Agent file is not listed in apm.yml dependencies`)
        );
      }
    }
  }

  return results;
}

// ── Tier 4: Domain Content Validation ───────────────────────────────────────

function domainContentChecks(inventory) {
  const results = [];

  // Build name → domain lookup
  const nameToDomain = {};
  for (const [domain, names] of Object.entries(DOMAIN_MAP)) {
    for (const n of names) {
      nameToDomain[n] = domain;
    }
  }

  for (const agent of inventory.agents) {
    const name = agent.data?.name;
    if (!name) continue;

    const body = agent.content || '';
    const domain = nameToDomain[name];

    // Security agents must mention recognized security frameworks
    if (domain === 'Security') {
      if (!/owasp/i.test(body) && !/cwe/i.test(body) && !/cis/i.test(body) && !/nist/i.test(body) && !/openssf/i.test(body)) {
        results.push(
          finding(agent.file, 'missing-domain-keyword', 'error',
            `Security agent "${name}" body must mention a recognized security framework (OWASP, CWE, CIS, NIST, or OpenSSF)`)
        );
      }
    }

    // Accessibility agents must mention WCAG
    if (domain === 'Accessibility') {
      if (!/wcag/i.test(body)) {
        results.push(
          finding(agent.file, 'missing-domain-keyword', 'error',
            `Accessibility agent "${name}" body must mention WCAG`)
        );
      }
    }

    // All agents should mention SARIF
    if (!/sarif/i.test(body)) {
      results.push(
        finding(agent.file, 'missing-sarif-reference', 'warning',
          `Agent "${name}" body does not mention SARIF`)
      );
    }

    // Check severity mapping keywords
    if (!/critical/i.test(body) && !/high/i.test(body) && !/medium/i.test(body) && !/low/i.test(body)) {
      results.push(
        finding(agent.file, 'missing-severity-mapping', 'info',
          `Agent "${name}" body does not reference severity levels (CRITICAL/HIGH/MEDIUM/LOW)`)
      );
    }
  }

  return results;
}

// ── Report Generation ───────────────────────────────────────────────────────

function generateConsoleReport(allResults, inventory) {
  const errors = allResults.filter((r) => r.level === 'error');
  const warnings = allResults.filter((r) => r.level === 'warning');
  const infos = allResults.filter((r) => r.level === 'info');

  console.log('\n══════════════════════════════════════════════════════');
  console.log('  Agent Validation Results');
  console.log('══════════════════════════════════════════════════════\n');

  console.log(`  Agents:       ${inventory.agents.length}`);
  console.log(`  Instructions: ${inventory.instructions.length}`);
  console.log(`  Prompts:      ${inventory.prompts.length}`);
  console.log(`  Skills:       ${inventory.skills.length}`);
  console.log('');

  // Per-file status
  const fileStatus = new Map();
  for (const item of [
    ...inventory.agents,
    ...inventory.instructions,
    ...inventory.prompts,
    ...inventory.skills,
  ]) {
    fileStatus.set(item.file, { errors: 0, warnings: 0, infos: 0 });
  }
  fileStatus.set('apm.yml', { errors: 0, warnings: 0, infos: 0 });
  // Cross-reference results
  for (const r of allResults) {
    if (!fileStatus.has(r.file)) {
      fileStatus.set(r.file, { errors: 0, warnings: 0, infos: 0 });
    }
    const s = fileStatus.get(r.file);
    if (r.level === 'error') s.errors++;
    else if (r.level === 'warning') s.warnings++;
    else s.infos++;
  }

  for (const [file, status] of fileStatus) {
    const icon = status.errors > 0 ? '✗' : '✓';
    const counts = [];
    if (status.errors > 0) counts.push(`${status.errors} error(s)`);
    if (status.warnings > 0) counts.push(`${status.warnings} warning(s)`);
    if (status.infos > 0) counts.push(`${status.infos} info(s)`);
    const detail = counts.length > 0 ? ` — ${counts.join(', ')}` : '';
    console.log(`  ${icon} ${file}${detail}`);
  }

  console.log('');
  console.log('──────────────────────────────────────────────────────');
  console.log(`  Errors:   ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  console.log(`  Info:     ${infos.length}`);
  console.log('──────────────────────────────────────────────────────');

  if (errors.length > 0) {
    console.log('\n  ERRORS:\n');
    for (const e of errors) {
      console.log(`    [ERROR] ${e.file}: ${e.message} (${e.rule})`);
    }
  }

  if (warnings.length > 0) {
    console.log('\n  WARNINGS:\n');
    for (const w of warnings) {
      console.log(`    [WARN]  ${w.file}: ${w.message} (${w.rule})`);
    }
  }

  const passed = errors.length === 0;
  console.log('');
  console.log(passed ? '  ✓ PASSED — no blocking errors' : '  ✗ FAILED — blocking errors found');
  console.log('');
}

function generateJsonReport(allResults, inventory) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      agents: inventory.agents.length,
      instructions: inventory.instructions.length,
      prompts: inventory.prompts.length,
      skills: inventory.skills.length,
      errors: allResults.filter((r) => r.level === 'error').length,
      warnings: allResults.filter((r) => r.level === 'warning').length,
      infos: allResults.filter((r) => r.level === 'info').length,
      passed: allResults.filter((r) => r.level === 'error').length === 0,
    },
    results: allResults,
  };
  fs.writeFileSync(
    path.join(ROOT, 'validation-results.json'),
    JSON.stringify(report, null, 2),
    'utf-8'
  );
}

function generateSarifReport(allResults) {
  const ruleMap = new Map();
  for (const r of allResults) {
    if (!ruleMap.has(r.rule)) {
      ruleMap.set(r.rule, {
        id: r.rule,
        shortDescription: { text: r.rule.replace(/-/g, ' ') },
      });
    }
  }

  const levelMap = { error: 'error', warning: 'warning', info: 'note' };

  const sarif = {
    version: '2.1.0',
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    runs: [
      {
        tool: {
          driver: {
            name: 'agent-validator',
            version: '1.0.0',
            informationUri: 'https://github.com/devopsabcs-engineering/agentic-accelerator-framework',
            rules: [...ruleMap.values()],
          },
        },
        automationDetails: {
          id: 'agent-validation/',
        },
        results: allResults.map((r) => ({
          ruleId: r.rule,
          level: levelMap[r.level] || 'note',
          message: { text: r.message },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: r.file,
                  uriBaseId: '%SRCROOT%',
                },
              },
            },
          ],
          partialFingerprints: {
            primaryLocationFingerprint: fingerprint(r),
          },
        })),
      },
    ],
  };

  fs.writeFileSync(
    path.join(ROOT, 'validation-results.sarif'),
    JSON.stringify(sarif, null, 2),
    'utf-8'
  );
}

function generateGitHubSummary(allResults, inventory) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;

  const nameToDomain = {};
  for (const [domain, names] of Object.entries(DOMAIN_MAP)) {
    for (const n of names) {
      nameToDomain[n] = domain;
    }
  }

  const errorsByFile = new Map();
  for (const r of allResults) {
    if (!errorsByFile.has(r.file)) errorsByFile.set(r.file, []);
    errorsByFile.get(r.file).push(r);
  }

  let md = '## 🔬 Agent Validation Results\n\n';

  // Agent Inventory
  md += `### Agent Inventory (${inventory.agents.length} agents)\n\n`;
  md += '| Domain | Agent | Frontmatter | Cross-Refs | Domain Rules | Status |\n';
  md += '|---|---|---|---|---|---|\n';
  for (const agent of inventory.agents) {
    const name = agent.data?.name || '?';
    const domain = nameToDomain[name] || 'Unknown';
    const fileResults = errorsByFile.get(agent.file) || [];
    const hasError = fileResults.some((r) => r.level === 'error');
    const fmOk = !fileResults.some((r) => r.rule === 'missing-required-field' || r.rule === 'missing-frontmatter');
    const crOk = !fileResults.some((r) => r.rule === 'broken-cross-reference');
    const domOk = !fileResults.some((r) => r.rule === 'missing-domain-keyword' && r.level === 'error');
    md += `| ${domain} | ${name} | ${fmOk ? '✅' : '❌'} | ${crOk ? '✅' : '❌'} | ${domOk ? '✅' : '❌'} | ${hasError ? 'FAIL' : 'PASS'} |\n`;
  }

  // Instructions
  md += `\n### Instruction Files (${inventory.instructions.length})\n\n`;
  md += '| File | Description | applyTo | Status |\n';
  md += '|---|---|---|---|\n';
  for (const instr of inventory.instructions) {
    const desc = instr.data?.description || '—';
    const applyTo = instr.data?.applyTo || '—';
    const fileResults = errorsByFile.get(instr.file) || [];
    const hasError = fileResults.some((r) => r.level === 'error');
    md += `| ${instr.file} | ${desc} | ${applyTo} | ${hasError ? 'FAIL' : 'PASS'} |\n`;
  }

  // Prompts
  md += `\n### Prompt Files (${inventory.prompts.length})\n\n`;
  md += '| File | Description | Agent | Status |\n';
  md += '|---|---|---|---|\n';
  for (const prompt of inventory.prompts) {
    const desc = prompt.data?.description || '—';
    const agent = prompt.data?.agent || '—';
    const fileResults = errorsByFile.get(prompt.file) || [];
    const hasError = fileResults.some((r) => r.level === 'error');
    md += `| ${prompt.file} | ${desc} | ${agent} | ${hasError ? 'FAIL' : 'PASS'} |\n`;
  }

  // Skills
  md += `\n### Skill Files (${inventory.skills.length})\n\n`;
  md += '| File | Description | Status |\n';
  md += '|---|---|---|\n';
  for (const skill of inventory.skills) {
    const desc = skill.data?.description || '—';
    const fileResults = errorsByFile.get(skill.file) || [];
    const hasError = fileResults.some((r) => r.level === 'error');
    md += `| ${skill.file} | ${desc} | ${hasError ? 'FAIL' : 'PASS'} |\n`;
  }

  // Cross-reference summary
  const xrefResults = allResults.filter((r) =>
    ['broken-cross-reference', 'broken-apm-path', 'no-matching-files', 'orphaned-agent', 'broken-agent-reference'].includes(r.rule)
  );
  md += '\n### Cross-Reference Integrity\n\n';
  md += '| Check | Status |\n';
  md += '|---|---|\n';
  const handoffErrors = xrefResults.filter((r) => r.rule === 'broken-cross-reference' && r.message.includes('Handoff'));
  const promptRefErrors = xrefResults.filter((r) => r.rule === 'broken-cross-reference' && r.message.includes('Prompt'));
  const apmPathErrors = xrefResults.filter((r) => r.rule === 'broken-apm-path');
  const applyToWarnings = xrefResults.filter((r) => r.rule === 'no-matching-files');
  const orphanWarnings = xrefResults.filter((r) => r.rule === 'orphaned-agent');
  md += `| Handoff targets resolved | ${handoffErrors.length === 0 ? '✅' : '❌ ' + handoffErrors.length + ' broken'} |\n`;
  md += `| Prompt agent refs resolved | ${promptRefErrors.length === 0 ? '✅' : '❌ ' + promptRefErrors.length + ' broken'} |\n`;
  md += `| apm.yml paths resolved | ${apmPathErrors.length === 0 ? '✅' : '❌ ' + apmPathErrors.length + ' broken'} |\n`;
  md += `| Instruction applyTo matches | ${applyToWarnings.length === 0 ? '✅' : '⚠️ ' + applyToWarnings.length + ' unmatched'} |\n`;
  md += `| No orphaned agents | ${orphanWarnings.length === 0 ? '✅' : '⚠️ ' + orphanWarnings.length + ' orphaned'} |\n`;

  // Summary counts
  const errors = allResults.filter((r) => r.level === 'error').length;
  const warnings = allResults.filter((r) => r.level === 'warning').length;
  const total =
    inventory.agents.length +
    inventory.instructions.length +
    inventory.prompts.length +
    inventory.skills.length;
  md += '\n### Summary\n\n';
  md += `- Total files validated: ${total}\n`;
  md += `- Errors: ${errors}\n`;
  md += `- Warnings: ${warnings}\n`;

  fs.appendFileSync(summaryPath, md, 'utf-8');
}

function generateReport(allResults, inventory) {
  generateConsoleReport(allResults, inventory);
  generateJsonReport(allResults, inventory);
  generateSarifReport(allResults);
  generateGitHubSummary(allResults, inventory);
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  // Step 1: Load inventory
  const inventory = loadInventory();
  console.log(`Discovered ${inventory.agents.length} agents, ${inventory.instructions.length} instructions, ${inventory.prompts.length} prompts, ${inventory.skills.length} skills`);

  const allResults = [];

  // Step 2: Tier 1 — Structural validation
  const agentNames = inventory.agents
    .map((a) => a.data?.name)
    .filter(Boolean);

  for (const agent of inventory.agents) {
    allResults.push(...validateAgentFrontmatter(agent));
  }
  for (const instr of inventory.instructions) {
    allResults.push(...validateInstructionFrontmatter(instr));
  }
  for (const prompt of inventory.prompts) {
    allResults.push(...validatePromptFrontmatter(prompt, agentNames));
  }
  for (const skill of inventory.skills) {
    allResults.push(...validateSkillFrontmatter(skill));
  }

  // Step 3: Tier 2 — Cross-reference checks
  const apmData = loadApmDataSync();
  if (apmData) {
    allResults.push(...crossReferenceChecks(inventory, apmData));
  } else {
    allResults.push(finding('apm.yml', 'missing-apm', 'error', 'Could not parse apm.yml'));
  }

  // Step 4: Tier 4 — Domain content checks
  allResults.push(...domainContentChecks(inventory));

  // Step 5: Generate all reports
  generateReport(allResults, inventory);

  // Step 6: Exit code
  const hasErrors = allResults.some((r) => r.level === 'error');
  process.exit(hasErrors ? 1 : 0);
}

main();
