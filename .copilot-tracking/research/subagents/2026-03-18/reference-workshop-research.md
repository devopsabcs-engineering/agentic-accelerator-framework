# Reference Workshop Research

## Research Topics

- Structure and organization of `githubdevopsabcs/gh-abcs-developer` workshop repository
- Module organization and teaching approach
- Screenshot conventions and asset management
- Lab file structure and progressive difficulty patterns
- General best practices for GitHub-based developer workshops (MOAW, GitHub Skills)

## Research Questions

1. How is the `gh-abcs-developer` repository structured?
2. What module/lab numbering and naming conventions are used?
3. How are screenshots organized and referenced?
4. What setup/prerequisite instructions exist?
5. What is the student workflow (fork/clone)?
6. What are industry best practices for workshop repositories on GitHub?

---

## Findings: gh-abcs-developer Repository Analysis

### Repository Overview

- **Repo**: `githubdevopsabcs/gh-abcs-developer`
- **Description**: "The GitHub ABCs developer training with templates, examples, hands-on labs and additional learning resources."
- **License**: MIT
- **Template repo**: Yes (marked as a GitHub template repository)
- **26 forks**, 2 contributors (CalinL, emmanuelknafo)
- **GitHub Pages**: Uses Jekyll theme `jekyll-theme-architect` via `_config.yml`
- **Topics**: `github`, `training`, `developer`

### Directory Structure

```text
gh-abcs-developer/
├── .github/
│   └── workflows/
│       └── use-github-apis.yml      # Pre-built workflow for Lab 05
├── labs/
│   ├── setup.md                     # Setup/prerequisites
│   ├── lab01.md                     # Module 1: Webhooks & Events
│   ├── lab02.md                     # Module 2: GitHub Templates
│   ├── lab03.md                     # Module 3: Branch Protection Rules
│   ├── lab04.md                     # Module 4: GitHub Apps
│   ├── lab05.md                     # Module 5: GitHub API (REST & GraphQL)
│   └── lab06.md                     # Module 6: Automate GitHub Releases
├── .gitignore
├── _config.yml                      # Jekyll theme config
├── CODEOWNERS
├── CODE_OF_CONDUCT.md
├── LICENSE
└── README.md                        # Main entry point with module index
```

**Key observation**: No `images/`, `screenshots/`, or `assets/` folder exists. The workshop is entirely text-based with no screenshots.

### README Structure (Main Entry Point)

The README serves as the module index with:

1. **Banner description**: One-line blockquote describing the workshop
2. **Checklist-style module index**: Each module listed with `- [ ]` checkboxes so students can track progress
3. **Setup link**: First item links to `labs/setup.md`
4. **Module links**: Each module links to its lab file (`labs/labNN.md`)
5. **Additional Resources**: Curated links organized by topic category

README module listing pattern:
```markdown
### Module N: Module Title
- [ ]  _Hands-on Lab:_ > [Activity N](/labs/labNN.md)
```

### Lab File Structure Pattern

Every lab file follows a consistent template:

```markdown
# N - Lab Title
Description of what the student will do in this lab.
> Duration: X-Y minutes

References:
- [Reference Name](URL)
- [Reference Name](URL)

## N.1 First Exercise Title

1. Step-by-step numbered instructions
2. With inline code blocks for YAML/JSON/commands
3. Sequential steps with clear actions

## N.2 Second Exercise Title (if applicable)

1. More numbered steps...
```

### Lab Content Details

| Lab | Title | Duration | Exercises | Difficulty |
|-----|-------|----------|-----------|------------|
| setup | Hands-on Labs Setup | 5 min | 2 (Fork + Template) | Beginner |
| lab01 | Repository Webhooks and Events | 5-10 min | 1 exercise (15 steps) | Beginner |
| lab02 | GitHub Templates | 5-10 min | 3 exercises (issue, PR, template repo) | Beginner |
| lab03 | Repository Branch Protection Rules | 5-10 min | 1 exercise (10 steps) | Beginner |
| lab04 | GitHub Apps | 15-20 min | 1 exercise (9 steps, code) | Intermediate |
| lab05 | GitHub API (REST & GraphQL) | 15-20 min | 2 exercises (REST + GraphQL) | Intermediate |
| lab06 | Automate GitHub Releases | 15-20 min | 1 exercise (26 steps) | Intermediate |

**Progressive difficulty pattern**: Labs 1-3 are UI/config-focused (5-10 min), Labs 4-6 involve code/YAML and API work (15-20 min).

### Student Workflow

From `setup.md`:
1. **Fork** the repository (primary method)
2. **OR** use "Use this template" to create from template (optional)
3. Name convention: `gh-abcs-developer-[USERNAME]`
4. Students work on their own fork/copy

### Lab Instruction Patterns

- **Numbered steps**: All labs use numbered lists (1, 2, 3...) for step-by-step instructions
- **Code blocks**: YAML, JavaScript, and Markdown snippets embedded inline with fenced code blocks (triple backticks)
- **References section**: Every lab includes 3-6 reference links at the top
- **Optional steps**: Marked with `_(Optional)_` italic notation
- **Branch naming convention**: Labs that involve branching use `feature/labNN` (e.g., `feature/lab03`, `feature/lab06`)
- **Commit pattern**: Students commit to `main` for simple labs; create feature branches for more complex labs
- **Pre-built files**: `.github/workflows/use-github-apis.yml` is provided as starter code for Lab 05
- **No screenshots**: Entirely text-based, relying on navigation descriptions ("Navigate to Settings > Branches")

### What's Missing (Gaps Identified)

1. **No screenshots or images** — Navigation relies on text descriptions only
2. **No `images/` or `assets/` folder** — No visual aids whatsoever
3. **No prerequisites section** (other than having a GitHub account implied)
4. **No estimated total workshop duration** in README
5. **No difficulty labels** per module in README
6. **No learning objectives** per lab
7. **No verification/validation steps** ("you should see X" appears rarely)
8. **No troubleshooting sections**
9. **No summary/recap** at end of each lab

---

## Findings: Industry Best Practices (MOAW, GitHub Skills)

### Microsoft MOAW (Mother Of All Workshops)

**Repository**: `microsoft/moaw` — 140 stars, 100 forks, used extensively by Microsoft for developer workshops.

**Workshop format**:
- Single `workshop.md` file with YAML front matter metadata
- Sections separated by `---` (three dashes)
- Content rendered via custom web platform

**Front matter metadata standard**:
```yaml
published: true/false
type: workshop
title: Full workshop title
short_title: Short title for header
description: This is a workshop for...
level: beginner/intermediate/advanced
authors: [Name]
contacts: [email/twitter]
duration_minutes: 20
tags: javascript, api, node.js
banner_url: assets/banner.jpg           # 1280x640px
video_url: https://youtube.com/link
audience: students
sections_title: [custom section titles]
navigation_numbering: true
```

**Key conventions**:
- **Assets in `/assets` folder** inside workshop directory
- **Levels**: beginner, intermediate, advanced (required metadata)
- **Duration**: Required field in minutes
- **Admonitions**: Special div classes for info, warning, important, tip, task boxes
- **Translations**: `translations/` subfolder pattern
- **Separate repos for code**: Sample code in separate repositories, linked as templates
- **Additional pages**: proctor instructions, prerequisites as separate `.md` files

### GitHub Skills Pattern

**Repository**: `skills/introduction-to-github` — 10k stars, 15.9k forks

**Key conventions**:
- **Template repository** — students click "Use this template" to get their own copy
- **Audience tag**: "Who is this for: New developers, new GitHub users, and students"
- **Learning objectives listed**: "What you'll learn" and "What you'll build" sections
- **Prerequisites stated explicitly**: "None" or specific requirements
- **Duration estimate**: "This exercise takes less than one hour to complete"
- **Numbered outcomes**: 1. Create a branch, 2. Commit a file, etc.
- **Automation-driven**: GitHub Actions detect student actions and advance lessons automatically

### General Workshop Repository Best Practices

#### Module/Lab Numbering

- Use zero-padded numbers: `lab-01.md`, `lab-02.md` (ensures proper sorting)
- Group by module folders if >10 labs: `modules/01-setup/`, `modules/02-basics/`
- Include module number in the H1 heading: `# 1 - Module Title`

#### Each Lab Should Include

1. **Title with number** — `# N - Lab Title`
2. **Description** — One-sentence summary of what student will do
3. **Duration estimate** — `> Duration: X-Y minutes` or front matter
4. **Prerequisites** — What labs must be completed first
5. **Learning objectives** — What the student will learn/be able to do
6. **References** — Official docs and guides
7. **Numbered steps** — Clear, unambiguous instructions
8. **Verification steps** — "You should see..." after key actions
9. **Code blocks** — Fenced code blocks with language hints
10. **Optional/stretch goals** — Extended exercises for faster students
11. **Summary/recap** — Key takeaways at end

#### Screenshot Conventions

- Store in `images/` or `assets/screenshots/` directory
- Name with lab prefix: `lab01-step03-webhook-settings.png`
- Or organized by lab folder: `images/lab01/step03-webhook-settings.png`
- Use descriptive alt text: `![Webhook settings page showing Payload URL field](images/lab01/webhook-settings.png)`
- Placeholder convention: `![TODO: Screenshot of settings page](images/lab01/placeholder.png)`
- Keep screenshots 800-1200px wide for readability
- Use annotation tools (arrows, highlights) for complex UIs

#### Student Fork/Clone Workflow

1. **Template repository** (preferred) — Student clicks "Use this template"
2. **Fork** (alternative) — Student forks, gets all branches and history
3. **Naming convention**: `repo-name-[username]` or `repo-name`
4. **Setup lab first** — Always provide a setup/getting-started lab as step 0

#### Progressive Difficulty Patterns

- **Tier 1 (Beginner, 5-10 min)**: UI-only, click-through configuration
- **Tier 2 (Intermediate, 15-20 min)**: Code editing, YAML configuration
- **Tier 3 (Advanced, 20-30 min)**: Building from scratch, API integration, multi-step workflows
- Number modules to reflect difficulty progression
- Mark optional advanced sections clearly

#### Hands-on Exercise Patterns

- **Guided exercises**: Step-by-step with exact values to enter
- **Scaffolded exercises**: Provide starter code, student fills in gaps
- **Semi-guided**: Provide requirements, student figures out implementation
- **Challenge exercises**: Open-ended problems with suggested approach
- **Verify-as-you-go**: Include validation checkpoints after each major step

---

## References

| Source | URL | What Was Gathered |
|--------|-----|-------------------|
| gh-abcs-developer README | https://github.com/githubdevopsabcs/gh-abcs-developer | Module index, structure, links |
| gh-abcs-developer labs/ | https://github.com/githubdevopsabcs/gh-abcs-developer/tree/main/labs | All 7 lab files analyzed |
| gh-abcs-developer setup.md | labs/setup.md (raw) | Student workflow (fork/template) |
| gh-abcs-developer lab01-06 | labs/lab01.md through lab06.md (raw) | Lab structure patterns |
| gh-abcs-developer workflows | .github/workflows/use-github-apis.yml | Pre-built starter code |
| Microsoft MOAW | https://github.com/microsoft/moaw | Workshop template standard |
| MOAW CONTRIBUTING.md | CONTRIBUTING.md (raw) | Workshop format specification |
| MOAW template | template/workshop/workshop.md | Front matter, section separators |
| GitHub Skills | https://github.com/skills/introduction-to-github | Template repo pattern, metadata |

---

## Discovered Research Topics

1. Whether the new workshop should use MOAW format or the simpler gh-abcs pattern
2. Whether to include a `docs/` folder for extended reading vs. inline references
3. Whether screenshots should be added now or as placeholders for future population
4. Whether to use GitHub Pages (Jekyll) for rendered workshop pages
5. How to handle Copilot-specific screenshots that may change frequently

---

## Recommendations for New Workshop Structure

### Adopt from gh-abcs-developer

1. **`labs/` folder with flat file structure** — Simple and effective for <15 modules
2. **`setup.md` as first lab** — Establishes student environment
3. **Checklist-style README** — `- [ ]` checkboxes for student progress tracking
4. **Template repository** — Students use "Use this template" button
5. **Numbered labs** — `lab01.md`, `lab02.md` with number in H1 heading
6. **Duration estimates** — Blockquote format `> Duration: X-Y minutes`
7. **References section** per lab — Links to official docs at top of each lab
8. **Optional steps with `_(Optional)_`** — For stretch/advanced content
9. **Feature branch naming** — `feature/labNN-description` for exercises needing branches

### Improve Over gh-abcs-developer

1. **Add screenshots** — Create `images/` folder with `images/labNN/` subfolders
2. **Add learning objectives** — "In this lab you will learn to..." section per lab
3. **Add prerequisites per lab** — "Prerequisites: Complete Lab 01" notes
4. **Add verification steps** — "You should see..." after key navigation/actions
5. **Add summary sections** — Recap at end of each lab
6. **Add difficulty labels** — Beginner/Intermediate/Advanced in README index
7. **Add total duration** — Show estimated total workshop time in README
8. **Add troubleshooting tips** — Common issues section per lab
9. **Use zero-padded numbers** — `lab-01.md` instead of `lab01.md` for clarity

### Adopt from MOAW

1. **Front matter metadata** — Level, duration, tags, description in YAML header (optional if not using MOAW platform)
2. **Assets folder convention** — `assets/` or `images/` per workshop
3. **Admonition-style callouts** — Info, warning, tip, task blocks using blockquotes or HTML
4. **Banner image** — 1280x640px banner for each workshop

### Proposed New Workshop Directory Structure

```text
workshop-repo-name/
├── README.md                        # Workshop overview + module checklist
├── images/
│   ├── banner.png                   # Workshop banner (1280x640)
│   ├── lab-01/                      # Screenshots per lab
│   │   ├── step-01-create-repo.png
│   │   └── step-03-settings.png
│   ├── lab-02/
│   └── ...
├── labs/
│   ├── setup.md                     # Lab 00: Setup & prerequisites
│   ├── lab-01.md                    # Lab 01: Title (Beginner, 10 min)
│   ├── lab-02.md                    # Lab 02: Title (Beginner, 15 min)
│   ├── lab-03.md                    # Lab 03: Title (Intermediate, 20 min)
│   └── ...
├── solutions/                       # Optional: completed code/configs
│   ├── lab-03/
│   └── lab-05/
├── .github/
│   ├── workflows/                   # Pre-built workflows for labs
│   └── ISSUE_TEMPLATE/
├── _config.yml                      # Jekyll theme (if using GitHub Pages)
├── CODEOWNERS
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
└── LICENSE
```

### Proposed Lab File Template

```markdown
# Lab NN - Lab Title

> **Duration**: X-Y minutes | **Level**: Beginner/Intermediate/Advanced

## Overview

One-paragraph description of what the student will accomplish.

## Learning Objectives

- Objective 1
- Objective 2

## Prerequisites

- Complete [Lab NN-1](lab-NN-1.md)
- Requirement 2

## References

- [Reference 1](URL)
- [Reference 2](URL)

## Exercise N.1: Exercise Title

### Step 1: Action Description

1. Navigate to...
2. Click on...

![Description of what the screenshot shows](../images/lab-NN/step-01-description.png)

3. You should see...

> **Tip**: If you encounter X, try Y.

### Step 2: Next Action

...

## Exercise N.2: Second Exercise (Optional)

...

## Summary

In this lab you learned:
- Key takeaway 1
- Key takeaway 2

## Next Lab

Continue to [Lab NN+1: Next Title](lab-NN+1.md)
```

---

## Next Research

- [ ] Research Copilot-specific workshop repos for AI-assisted coding workshop patterns
- [ ] Investigate GitHub Codespaces devcontainer setup for workshop environments
- [ ] Explore automated screenshot generation tools (Playwright, Puppeteer)
- [ ] Research how to handle version-sensitive screenshots (Copilot UI changes frequently)

---

## Key Discoveries

1. **gh-abcs-developer is a proven, simple structure** — Flat `labs/` folder with numbered markdown files is effective for workshops with <15 modules
2. **No screenshots exist** — This is the biggest gap; text-only navigation descriptions work but reduce accessibility
3. **Template repo + fork workflow is standard** — Both gh-abcs and GitHub Skills use this pattern
4. **Checklist README is a strong UX pattern** — `- [ ]` checkboxes give students a sense of progress
5. **Duration estimates per lab are essential** — All reference workshops include them prominently
6. **Progressive difficulty (5min → 20min)** — Simple-to-complex ordering is well-established
7. **Pre-built starter code** — Providing partial workflow files (.github/workflows/) that students extend is an effective scaffolding technique
8. **MOAW provides the gold standard for metadata** — Front matter with level, duration, tags, audience fields
9. **Feature branch naming convention `feature/labNN`** — Used in the reference repo for labs involving PR workflows

---

## Clarifying Questions

1. Should the new workshop use GitHub Pages (Jekyll) for a rendered web experience, or keep it as raw Markdown on GitHub?
2. What is the target audience level — beginner, intermediate, or mixed?
3. Should screenshots be created now (requiring UI access) or added as placeholder references?
4. Will the workshop use GitHub Codespaces for a zero-setup student experience?
5. How many total modules/labs are planned for the new workshop?
