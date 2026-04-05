# Agentic Accelerator Framework — Branding Guide

## Logo

The framework logo features a gear/cog at center surrounded by orbital loops in deep blue (#1B5E90) and cyan (#2DD4BF), symbolizing the agentic automation and accelerating cycle of shift-left security.

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Blue | `#1B5E90` | Primary brand color, left orbital loop |
| Cyan | `#2DD4BF` | Accent color, right orbital loop |
| Dark Navy | `#0D1117` | Dark backgrounds, social preview |
| Dark Gear | `#1A2332` | Central gear element |

### Logo Files

All logo variants are in `assets/branding/`:

```text
assets/branding/
├── agentic-accelerator-framework-logo.png   # Original source (1024×1024, white bg)
├── logo/
│   ├── logo-transparent.png                  # 1024×1024, transparent background
│   ├── logo-1024.png                         # 1024×1024, transparent
│   ├── logo-512.png                          # 512×512, transparent (org avatar)
│   ├── logo-256.png                          # 256×256, transparent (README)
│   ├── logo-128.png                          # 128×128, transparent (inline)
│   ├── logo-64.png                           # 64×64, transparent (icon)
│   └── logo-32.png                           # 32×32, transparent (tiny)
├── social/
│   ├── social-preview-1280x640.png           # GitHub social preview
│   └── readme-banner.png                     # README header (800×200)
├── favicon/
│   ├── favicon.ico                           # Multi-size ICO (16, 32, 48)
│   ├── favicon-16x16.png                     # Web favicon
│   ├── favicon-32x32.png                     # Web favicon
│   ├── favicon-48x48.png                     # Web favicon
│   ├── favicon-180x180.png                   # Apple touch icon size
│   ├── favicon-192x192.png                   # Android icon
│   ├── favicon-512x512.png                   # PWA icon
│   └── apple-touch-icon.png                  # iOS bookmarks (180×180)
└── workshop/
    ├── workshop-logo-200.png                  # Workshop header logo
    └── workshop-header.png                    # Workshop header with text
```

## Where to Use the Logo

### Framework Repository (this repo)

| Location | Asset | How |
|----------|-------|-----|
| README.md header | `logo/logo-256.png` | Centered image at top of README |
| GitHub social preview | `social/social-preview-1280x640.png` | Settings → General → Social preview |

### Generated Domain Repos ({domain}-scan-demo-app)

| Location | Asset | How |
|----------|-------|-----|
| README.md header | `logo/logo-128.png` | Centered image, copy to `assets/branding/` |
| GitHub social preview | `social/social-preview-1280x640.png` | Upload in repo settings |

### Generated Workshop Repos ({domain}-scan-workshop)

| Location | Asset | How |
|----------|-------|-----|
| README.md header | `logo/logo-128.png` | Centered image in README |
| Workshop index.md | `logo/logo-128.png` | Header of GitHub Pages landing |
| Browser favicon | `favicon/favicon.ico` | Via `_includes/head-custom.html` |
| Apple touch icon | `favicon/apple-touch-icon.png` | Via `_includes/head-custom.html` |
| GitHub social preview | `social/social-preview-1280x640.png` | Upload in repo settings |
| Delivery guides | `logo/logo-128.png` | Header of half-day.md and full-day.md |

### GitHub Organization

| Location | Asset | How |
|----------|-------|-----|
| Org avatar | `logo/logo-512.png` | Organization Settings → Profile picture |

### Presentations and Documents

| Location | Asset | How |
|----------|-------|-----|
| PowerPoint title slide | `logo/logo-512.png` | With transparent background |
| Word document header | `logo/logo-128.png` | Top-left header position |

## Social Preview Setup

To set the social preview on a GitHub repository:

```powershell
# Via GitHub CLI (requires repo admin access)
# Note: gh CLI doesn't support social preview directly — upload via web UI
# Settings → General → Social preview → Edit → Upload image
```

The social preview image appears when the repo URL is shared on social media, Slack, Teams, etc. It should be set on:

- `agentic-accelerator-framework`
- `{domain}-scan-demo-app` (each domain)
- `{domain}-scan-workshop` (each domain)
- `agentic-accelerator-workshop` (main workshop)

## Favicon Setup for Workshops

Add these lines to the workshop `_includes/head-custom.html`:

```html
<link rel="icon" type="image/x-icon" href="{{ site.baseurl }}/assets/branding/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="{{ site.baseurl }}/assets/branding/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="{{ site.baseurl }}/assets/branding/apple-touch-icon.png">
```

## README Header Template

Use this pattern for all repository READMEs:

```markdown
<p align="center">
  <img src="assets/branding/logo-128.png" alt="Agentic Accelerator Framework" width="100">
</p>

<h1 align="center">{Repository Display Name}</h1>

<p align="center">
  <em>{One-line description}</em>
</p>
```
