/**
 * Executive Summary PowerPoint Generator
 * Agentic Accelerator Framework
 *
 * Run: node scripts/generate-exec-summary.cjs
 */
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const path = require("path");

// ── Icon rendering helpers ──────────────────────────────────────────────
function renderIconSvg(IconComponent, color, size) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// ── Color palette: Midnight Executive ───────────────────────────────────
const C = {
  navy:       "1E2761",
  iceBlue:    "CADCFC",
  white:      "FFFFFF",
  darkText:   "1A1A2E",
  lightText:  "B0B8D1",
  accent:     "3B82F6",   // bright blue accent
  accentTeal: "0D9488",
  accentGold: "F59E0B",
  accentRose: "F43F5E",
  cardBg:     "F0F4FF",
  sectionBg:  "E8EDFB",
  muted:      "64748B",
};

// ── Shared style factories (avoid object reuse pitfall) ─────────────────
const makeShadow = () => ({
  type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.12,
});

// ── Main ────────────────────────────────────────────────────────────────
async function main() {
  // Pre-render all icons
  const { FaShieldAlt, FaUniversalAccess, FaCode, FaChartLine, FaRobot,
    FaCogs, FaChartBar, FaCheckCircle, FaArrowRight, FaLock,
    FaCloud, FaFileCode, FaLayerGroup, FaProjectDiagram } = require("react-icons/fa");

  const icons = {
    shield:    await iconToBase64Png(FaShieldAlt, "#" + C.accent, 256),
    a11y:      await iconToBase64Png(FaUniversalAccess, "#" + C.accentTeal, 256),
    code:      await iconToBase64Png(FaCode, "#" + C.accentGold, 256),
    finops:    await iconToBase64Png(FaChartLine, "#" + C.accentRose, 256),
    robot:     await iconToBase64Png(FaRobot, "#" + C.white, 256),
    cogs:      await iconToBase64Png(FaCogs, "#" + C.iceBlue, 256),
    chart:     await iconToBase64Png(FaChartBar, "#" + C.accent, 256),
    check:     await iconToBase64Png(FaCheckCircle, "#" + C.accentTeal, 256),
    arrow:     await iconToBase64Png(FaArrowRight, "#" + C.white, 256),
    lock:      await iconToBase64Png(FaLock, "#" + C.accent, 256),
    cloud:     await iconToBase64Png(FaCloud, "#" + C.accentTeal, 256),
    fileCode:  await iconToBase64Png(FaFileCode, "#" + C.accentGold, 256),
    layers:    await iconToBase64Png(FaLayerGroup, "#" + C.accent, 256),
    diagram:   await iconToBase64Png(FaProjectDiagram, "#" + C.iceBlue, 256),
  };

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "devopsabcs-engineering";
  pres.title = "Agentic Accelerator Framework — Executive Summary";

  // ════════════════════════════════════════════════════════════════════════
  // SLIDE 1: Title
  // ════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };

    // Decorative top-right accent shape
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.5, y: 0, w: 2.5, h: 0.18, fill: { color: C.accent },
    });

    // Robot icon top-right
    s.addImage({ data: icons.robot, x: 8.8, y: 0.5, w: 0.8, h: 0.8 });

    // Title
    s.addText("Agentic Accelerator\nFramework", {
      x: 0.8, y: 1.1, w: 8.5, h: 2.4,
      fontSize: 42, fontFace: "Calibri", bold: true,
      color: C.white, lineSpacingMultiple: 1.1, margin: 0,
    });

    // Subtitle
    s.addText("Executive Summary", {
      x: 0.8, y: 3.4, w: 6, h: 0.6,
      fontSize: 22, fontFace: "Calibri Light", color: C.iceBlue, margin: 0,
    });

    // Tagline
    s.addText("Shift security and compliance left with custom GitHub Copilot agents,\nGitHub Advanced Security, and Microsoft Defender for Cloud.", {
      x: 0.8, y: 4.2, w: 7.5, h: 0.8,
      fontSize: 13, fontFace: "Calibri", color: C.lightText, margin: 0,
    });

    // Bottom bar
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 5.25, w: 10, h: 0.375, fill: { color: C.accent },
    });
    s.addText("devopsabcs-engineering  |  March 2026", {
      x: 0.8, y: 5.25, w: 8.4, h: 0.375,
      fontSize: 10, fontFace: "Calibri", color: C.white, valign: "middle", margin: 0,
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // SLIDE 2: The Core Formula
  // ════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.white };

    // Title bar
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy },
    });
    s.addText("The Core Formula", {
      x: 0.8, y: 0, w: 9, h: 0.9,
      fontSize: 24, fontFace: "Calibri", bold: true, color: C.white, valign: "middle", margin: 0,
    });

    // Formula banner
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.3, w: 8.4, h: 0.9,
      fill: { color: C.sectionBg }, shadow: makeShadow(),
    });
    s.addText("Agentic Accelerator  =  GitHub Advanced Security  +  GitHub Copilot Custom Agents  +  Microsoft Defender for Cloud", {
      x: 0.8, y: 1.3, w: 8.4, h: 0.9,
      fontSize: 14, fontFace: "Calibri", bold: true, color: C.navy,
      align: "center", valign: "middle", margin: 0,
    });

    // Four-step principle — icon + text rows
    const steps = [
      { icon: icons.arrow, label: "Shift Left", desc: "Custom GHCP agents run in VS Code before commit and on the GitHub platform during PR review." },
      { icon: icons.cogs,  label: "Automate",   desc: "CI/CD pipelines (GitHub Actions + Azure DevOps) run the same controls as automated gates." },
      { icon: icons.fileCode, label: "Report", desc: "All findings output SARIF v2.1.0 for unified consumption — GitHub Code Scanning + ADO Advanced Security." },
      { icon: icons.cloud, label: "Govern",     desc: "Security Overview + Defender for Cloud + Power BI dashboards provide centralized governance." },
    ];

    const stepY = 2.6;
    const stepH = 0.6;
    const gap = 0.15;
    steps.forEach((st, i) => {
      const y = stepY + i * (stepH + gap);
      // Number circle
      s.addShape(pres.shapes.OVAL, {
        x: 0.8, y: y + 0.05, w: 0.45, h: 0.45,
        fill: { color: C.accent },
      });
      s.addText(String(i + 1), {
        x: 0.8, y: y + 0.05, w: 0.45, h: 0.45,
        fontSize: 16, fontFace: "Calibri", bold: true, color: C.white,
        align: "center", valign: "middle", margin: 0,
      });
      // Label
      s.addText(st.label, {
        x: 1.45, y: y, w: 1.5, h: stepH,
        fontSize: 15, fontFace: "Calibri", bold: true, color: C.navy, valign: "middle", margin: 0,
      });
      // Description
      s.addText(st.desc, {
        x: 3.0, y: y, w: 6.2, h: stepH,
        fontSize: 12, fontFace: "Calibri", color: C.darkText, valign: "middle", margin: 0,
      });
    });

    // Footer accent
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 5.4, w: 10, h: 0.225, fill: { color: C.accent },
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // SLIDE 3: Agent Inventory (4 domain cards)
  // ════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.white };

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy },
    });
    s.addText("15 Custom Agents Across 4 Domains", {
      x: 0.8, y: 0, w: 9, h: 0.9,
      fontSize: 24, fontFace: "Calibri", bold: true, color: C.white, valign: "middle", margin: 0,
    });

    const domains = [
      {
        icon: icons.shield, color: C.accent, name: "Security", count: "6 Agents",
        items: "SecurityAgent, SecurityReviewerAgent,\nSecurityPlanCreator, PipelineSecurityAgent,\nIaCSecurityAgent, SupplyChainSecurityAgent",
      },
      {
        icon: icons.a11y, color: C.accentTeal, name: "Accessibility", count: "2 Agents",
        items: "A11yDetector, A11yResolver\n\nWCAG 2.2 Level AA compliance\ndetection and auto-remediation",
      },
      {
        icon: icons.code, color: C.accentGold, name: "Code Quality", count: "2 Agents",
        items: "CodeQualityDetector, TestGenerator\n\nCoverage ≥ 80% gate,\nauto-generated tests",
      },
      {
        icon: icons.finops, color: C.accentRose, name: "FinOps", count: "5 Agents",
        items: "CostAnalysisAgent, FinOpsGovernanceAgent,\nCostAnomalyDetector, CostOptimizerAgent,\nDeploymentCostGateAgent",
      },
    ];

    const cardW = 4.1;
    const cardH = 2.3;
    const startX = 0.6;
    const startY = 1.05;
    const gapX = 0.4;
    const gapY = 0.15;

    domains.forEach((d, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH / 2 + gapY + 0.9);

      // Card background
      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: cardH / 2 + 0.7,
        fill: { color: C.cardBg }, shadow: makeShadow(),
      });
      // Left accent bar
      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 0.08, h: cardH / 2 + 0.7,
        fill: { color: d.color },
      });
      // Icon
      s.addImage({ data: d.icon, x: x + 0.25, y: y + 0.15, w: 0.4, h: 0.4 });
      // Domain name
      s.addText(d.name, {
        x: x + 0.75, y: y + 0.12, w: 2, h: 0.45,
        fontSize: 16, fontFace: "Calibri", bold: true, color: C.navy, valign: "middle", margin: 0,
      });
      // Count badge
      s.addText(d.count, {
        x: x + cardW - 1.4, y: y + 0.15, w: 1.2, h: 0.35,
        fontSize: 11, fontFace: "Calibri", bold: true, color: C.white,
        fill: { color: d.color }, align: "center", valign: "middle", margin: 0,
      });
      // Agent list
      s.addText(d.items, {
        x: x + 0.25, y: y + 0.65, w: cardW - 0.5, h: cardH / 2 - 0.1,
        fontSize: 10, fontFace: "Calibri", color: C.muted, margin: 0,
      });
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 5.4, w: 10, h: 0.225, fill: { color: C.accent },
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // SLIDE 4: Architecture Overview
  // ════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.white };

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy },
    });
    s.addText("Architecture: Shift Left Then Scale", {
      x: 0.8, y: 0, w: 9, h: 0.9,
      fontSize: 24, fontFace: "Calibri", bold: true, color: C.white, valign: "middle", margin: 0,
    });

    // Flow blocks — left to right pipeline
    const blocks = [
      { label: "VS Code\nDeveloper", sub: "GHCP Agents\npre-screen code", color: C.accent, icon: icons.robot },
      { label: "Pull Request\nGitHub Platform", sub: "Coding Agent +\nCode Review", color: C.accentTeal, icon: icons.diagram },
      { label: "CI/CD Pipeline", sub: "9 Security Controls\nSARIF Upload", color: C.accentGold, icon: icons.lock },
      { label: "Governance", sub: "Security Overview\nDefender for Cloud", color: C.accentRose, icon: icons.cloud },
    ];

    const bW = 1.9;
    const bH = 1.3;
    const bStartX = 0.55;
    const bY = 1.4;
    const bGap = 0.35;

    blocks.forEach((b, i) => {
      const x = bStartX + i * (bW + bGap);
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: bY, w: bW, h: bH,
        fill: { color: b.color }, shadow: makeShadow(),
      });
      s.addImage({ data: b.icon, x: x + bW / 2 - 0.2, y: bY + 0.12, w: 0.4, h: 0.4 });
      s.addText(b.label, {
        x, y: bY + 0.5, w: bW, h: 0.45,
        fontSize: 11, fontFace: "Calibri", bold: true, color: C.white,
        align: "center", valign: "middle", margin: 0,
      });
      s.addText(b.sub, {
        x, y: bY + 0.9, w: bW, h: 0.35,
        fontSize: 9, fontFace: "Calibri", color: C.white,
        align: "center", valign: "top", margin: 0,
      });

      // Arrow between blocks
      if (i < blocks.length - 1) {
        const arrowX = x + bW + 0.04;
        s.addImage({ data: icons.arrow, x: arrowX, y: bY + bH / 2 - 0.12, w: 0.24, h: 0.24 });
      }
    });

    // Security Controls Pipeline — 9 items in a 3×3 grid
    const controls = [
      "Secrets Scanning", "SCA (Dependabot + SBOM)", "SAST (CodeQL + Autofix)",
      "IaC Scanning (MSDO)", "Container Image Scan", "DAST (ZAP)",
      "Accessibility (axe-core)", "Code Coverage ≥ 80%", "APM Audit",
    ];

    const gridStartX = 0.55;
    const gridStartY = 3.1;
    const cellW = 3.0;
    const cellH = 0.55;
    const cellGapX = 0.15;
    const cellGapY = 0.1;

    controls.forEach((ctrl, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = gridStartX + col * (cellW + cellGapX);
      const y = gridStartY + row * (cellH + cellGapY);

      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cellW, h: cellH,
        fill: { color: C.cardBg },
      });
      s.addText(ctrl, {
        x, y, w: cellW, h: cellH,
        fontSize: 10, fontFace: "Calibri", color: C.navy,
        align: "center", valign: "middle", margin: 0,
      });
    });

    s.addText("Security Controls Pipeline — all findings output SARIF v2.1.0", {
      x: 0.55, y: 5.0, w: 8.5, h: 0.3,
      fontSize: 10, fontFace: "Calibri", italic: true, color: C.muted, margin: 0,
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 5.4, w: 10, h: 0.225, fill: { color: C.accent },
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // SLIDE 5: CI/CD Workflows
  // ════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.white };

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy },
    });
    s.addText("7 CI/CD Workflows", {
      x: 0.8, y: 0, w: 9, h: 0.9,
      fontSize: 24, fontFace: "Calibri", bold: true, color: C.white, valign: "middle", margin: 0,
    });

    const workflows = [
      { name: "security-scan.yml",             trigger: "PR + push to main", purpose: "SCA, SAST (CodeQL), IaC, container, DAST scanning" },
      { name: "accessibility-scan.yml",        trigger: "PR + weekly schedule", purpose: "Three-engine a11y scan with threshold gating" },
      { name: "code-quality.yml",              trigger: "PR", purpose: "Lint, type check, test, 80% coverage gate" },
      { name: "finops-cost-gate.yml",          trigger: "PR (IaC changes)", purpose: "Infracost estimate against monthly budget" },
      { name: "apm-security.yml",              trigger: "PR (agent config)", purpose: "APM audit for prompt file supply chain attacks" },
      { name: "ci-full-test.yml",              trigger: "Push + PR to main", purpose: "Agent validation (structure, cross-refs, domains)" },
      { name: "deploy-to-github-private.yml",  trigger: "Push to main", purpose: "Sync agent config to org-wide .github-private repo" },
    ];

    // Table header
    const headerY = 1.15;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: headerY, w: 9, h: 0.45, fill: { color: C.navy },
    });
    s.addText("Workflow", {
      x: 0.6, y: headerY, w: 2.8, h: 0.45,
      fontSize: 11, fontFace: "Calibri", bold: true, color: C.white, valign: "middle", margin: 0,
    });
    s.addText("Trigger", {
      x: 3.4, y: headerY, w: 1.8, h: 0.45,
      fontSize: 11, fontFace: "Calibri", bold: true, color: C.white, valign: "middle", margin: 0,
    });
    s.addText("Purpose", {
      x: 5.2, y: headerY, w: 4.2, h: 0.45,
      fontSize: 11, fontFace: "Calibri", bold: true, color: C.white, valign: "middle", margin: 0,
    });

    const rowH = 0.5;
    workflows.forEach((wf, i) => {
      const y = headerY + 0.45 + i * rowH;
      const bgColor = i % 2 === 0 ? C.cardBg : C.white;
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y, w: 9, h: rowH, fill: { color: bgColor },
      });
      s.addText(wf.name, {
        x: 0.6, y, w: 2.8, h: rowH,
        fontSize: 10, fontFace: "Consolas", color: C.navy, valign: "middle", margin: 0,
      });
      s.addText(wf.trigger, {
        x: 3.4, y, w: 1.8, h: rowH,
        fontSize: 10, fontFace: "Calibri", color: C.muted, valign: "middle", margin: 0,
      });
      s.addText(wf.purpose, {
        x: 5.2, y, w: 4.2, h: rowH,
        fontSize: 10, fontFace: "Calibri", color: C.darkText, valign: "middle", margin: 0,
      });
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 5.4, w: 10, h: 0.225, fill: { color: C.accent },
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // SLIDE 6: Centralized Governance
  // ════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.white };

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy },
    });
    s.addText("Centralized Governance — Dual-Platform Visibility", {
      x: 0.8, y: 0, w: 9, h: 0.9,
      fontSize: 22, fontFace: "Calibri", bold: true, color: C.white, valign: "middle", margin: 0,
    });

    // Dashboard cards
    const dashboards = [
      { name: "GitHub Security\nOverview", desc: "Org-wide alerts, filtering,\nSecurity Campaigns, API access", color: C.accent },
      { name: "ADO Security\nOverview", desc: "Org-level risk & coverage,\ninline PR annotations", color: C.accentTeal },
      { name: "Power BI\nAdvSec Report", desc: "Star schema, DAX measures,\ntrend analysis, Mean Time to Fix", color: C.accentGold },
      { name: "Defender for\nCloud + DevOps", desc: "Unified cross-platform view,\nattack path analysis, runtime", color: C.accentRose },
    ];

    const dW = 2.0;
    const dH = 2.0;
    const dStartX = 0.45;
    const dY = 1.2;
    const dGap = 0.33;

    dashboards.forEach((db, i) => {
      const x = dStartX + i * (dW + dGap);
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: dY, w: dW, h: dH,
        fill: { color: C.cardBg }, shadow: makeShadow(),
      });
      // Top color bar
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: dY, w: dW, h: 0.08, fill: { color: db.color },
      });
      s.addText(db.name, {
        x: x + 0.15, y: dY + 0.2, w: dW - 0.3, h: 0.7,
        fontSize: 14, fontFace: "Calibri", bold: true, color: C.navy, margin: 0,
      });
      s.addText(db.desc, {
        x: x + 0.15, y: dY + 1.0, w: dW - 0.3, h: 0.9,
        fontSize: 10, fontFace: "Calibri", color: C.muted, margin: 0,
      });
    });

    // Convergence note
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 3.55, w: 8.4, h: 0.7,
      fill: { color: C.sectionBg }, shadow: makeShadow(),
    });
    s.addText("Both paths converge at Microsoft Defender for Cloud — providing a single pane of glass across GitHub, Azure DevOps, and GitLab for security, accessibility, code quality, and cost findings.", {
      x: 1.0, y: 3.55, w: 8.0, h: 0.7,
      fontSize: 11, fontFace: "Calibri", color: C.navy, valign: "middle", margin: 0,
    });

    // Standards bar
    s.addText("Standards: SARIF v2.1.0  |  OWASP Top 10  |  WCAG 2.2 AA  |  CIS Azure  |  NIST 800-53  |  PCI-DSS", {
      x: 0.8, y: 4.55, w: 8.4, h: 0.35,
      fontSize: 10, fontFace: "Calibri", italic: true, color: C.muted, margin: 0,
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 5.4, w: 10, h: 0.225, fill: { color: C.accent },
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // SLIDE 7: Implementation Roadmap
  // ════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.white };

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy },
    });
    s.addText("Implementation Roadmap — 5 Phases", {
      x: 0.8, y: 0, w: 9, h: 0.9,
      fontSize: 24, fontFace: "Calibri", bold: true, color: C.white, valign: "middle", margin: 0,
    });

    const phases = [
      { num: "1", name: "Security Agents", period: "Jan 2025 – Sep 2025", status: "Implemented", color: C.accent, statusColor: C.accentTeal },
      { num: "2", name: "Accessibility Agents", period: "Apr 2025 – Mar 2026", status: "Implemented", color: C.accentTeal, statusColor: C.accentTeal },
      { num: "3", name: "Code Quality Agents", period: "Jan 2026 – Sep 2026", status: "Active", color: C.accentGold, statusColor: C.accentGold },
      { num: "4", name: "FinOps Agents", period: "Apr 2026 – Dec 2026", status: "Active", color: C.accentRose, statusColor: C.accentGold },
      { num: "5", name: "Prompt Security (APM)", period: "Jun 2026 – Mar 2027", status: "Active", color: C.navy, statusColor: C.accentGold },
    ];

    const phStartY = 1.1;
    const phH = 0.7;
    const phGap = 0.08;

    phases.forEach((ph, i) => {
      const y = phStartY + i * (phH + phGap);

      // Card
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.6, y, w: 8.8, h: phH,
        fill: { color: C.cardBg }, shadow: makeShadow(),
      });
      // Left accent
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.6, y, w: 0.08, h: phH,
        fill: { color: ph.color },
      });

      // Phase number circle
      s.addShape(pres.shapes.OVAL, {
        x: 0.85, y: y + 0.13, w: 0.48, h: 0.48,
        fill: { color: ph.color },
      });
      s.addText(ph.num, {
        x: 0.85, y: y + 0.13, w: 0.48, h: 0.48,
        fontSize: 18, fontFace: "Calibri", bold: true, color: C.white,
        align: "center", valign: "middle", margin: 0,
      });

      // Name
      s.addText(ph.name, {
        x: 1.5, y, w: 2.5, h: phH,
        fontSize: 14, fontFace: "Calibri", bold: true, color: C.navy, valign: "middle", margin: 0,
      });

      // Period
      s.addText(ph.period, {
        x: 4.1, y, w: 2.5, h: phH,
        fontSize: 11, fontFace: "Calibri", color: C.muted, valign: "middle", margin: 0,
      });

      // Status badge
      s.addShape(pres.shapes.RECTANGLE, {
        x: 7.4, y: y + 0.2, w: 1.6, h: 0.35,
        fill: { color: ph.statusColor },
      });
      s.addText(ph.status, {
        x: 7.4, y: y + 0.2, w: 1.6, h: 0.35,
        fontSize: 11, fontFace: "Calibri", bold: true, color: C.white,
        align: "center", valign: "middle", margin: 0,
      });
    });

    // Cross-cutting note
    s.addText("Cross-cutting: Defender for Cloud + Dashboards span all phases (Jan 2025 – Mar 2027)", {
      x: 0.8, y: 4.95, w: 8.4, h: 0.3,
      fontSize: 10, fontFace: "Calibri", italic: true, color: C.muted, margin: 0,
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 5.4, w: 10, h: 0.225, fill: { color: C.accent },
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // SLIDE 8: Key Benefits & Call to Action
  // ════════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: C.navy };

    // Title
    s.addText("Why Agentic Accelerator?", {
      x: 0.8, y: 0.3, w: 8.5, h: 0.8,
      fontSize: 30, fontFace: "Calibri", bold: true, color: C.white, margin: 0,
    });

    // Benefits grid — 2×3
    const benefits = [
      { icon: icons.shield, title: "Shift Left", desc: "Catch issues in the IDE before they reach the PR — reducing cost and cycle time." },
      { icon: icons.layers, title: "Unified SARIF", desc: "All 4 domains output a single standard format — one pane of glass for all findings." },
      { icon: icons.check,  title: "Automated Gates", desc: "7 CI/CD workflows enforce security, a11y, quality, and cost policies automatically." },
      { icon: icons.cloud,  title: "Cross-Platform", desc: "GitHub preferred, Azure DevOps first-class citizen. Both converge at Defender for Cloud." },
      { icon: icons.lock,   title: "Supply Chain Safe", desc: "APM audit protects agent configuration files from prompt injection and poisoning." },
      { icon: icons.chart,  title: "Measurable ROI", desc: "Track Mean Time to Fix, coverage trends, and cost savings across Power BI dashboards." },
    ];

    const bCols = 3;
    const bCardW = 2.65;
    const bCardH = 1.55;
    const bGapX = 0.35;
    const bGapY = 0.3;
    const bStartX = 0.6;
    const bStartY = 1.4;

    benefits.forEach((b, i) => {
      const col = i % bCols;
      const row = Math.floor(i / bCols);
      const x = bStartX + col * (bCardW + bGapX);
      const y = bStartY + row * (bCardH + bGapY);

      // Card
      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: bCardW, h: bCardH,
        fill: { color: "2A3570" }, shadow: makeShadow(),
      });

      // Icon
      s.addImage({ data: b.icon, x: x + 0.2, y: y + 0.15, w: 0.35, h: 0.35 });

      // Title
      s.addText(b.title, {
        x: x + 0.65, y: y + 0.12, w: bCardW - 0.85, h: 0.4,
        fontSize: 14, fontFace: "Calibri", bold: true, color: C.white, valign: "middle", margin: 0,
      });

      // Desc
      s.addText(b.desc, {
        x: x + 0.2, y: y + 0.6, w: bCardW - 0.4, h: 0.85,
        fontSize: 10, fontFace: "Calibri", color: C.lightText, margin: 0,
      });
    });

    // Call to action
    s.addShape(pres.shapes.RECTANGLE, {
      x: 2.5, y: 4.65, w: 5, h: 0.55,
      fill: { color: C.accent }, shadow: makeShadow(),
    });
    s.addText("Get Started: Clone the repo  →  Review 15 agents  →  Enable workflows", {
      x: 2.5, y: 4.65, w: 5, h: 0.55,
      fontSize: 12, fontFace: "Calibri", bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    // Footer
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 5.25, w: 10, h: 0.375, fill: { color: C.accent },
    });
    s.addText("devopsabcs-engineering/agentic-accelerator-framework  |  MIT License", {
      x: 0.8, y: 5.25, w: 8.4, h: 0.375,
      fontSize: 10, fontFace: "Calibri", color: C.white, valign: "middle", margin: 0,
    });
  }

  // ── Write file ────────────────────────────────────────────────────────
  const outPath = path.join(__dirname, "..", "Agentic-Accelerator-Executive-Summary.pptx");
  await pres.writeFile({ fileName: outPath });
  console.log("Presentation saved to: " + outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
