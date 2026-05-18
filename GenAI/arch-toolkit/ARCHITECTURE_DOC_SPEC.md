# Architecture Documentation Specification

---

## How this toolkit was built — lessons learned

This toolkit was created iteratively through a real project. Every rule below was written because something broke first. Read this before generating anything for a new project.

### Journey summary

| Iteration | Problem | Fix applied |
|-----------|---------|-------------|
| v1 | PDF first page showed only the header — all content pushed to page 2 | Header had `2.2rem` padding, cards had `1.8rem` padding. Switched all units to `px`, dramatically reduced all spacing |
| v2 | CI/CD pipeline boxes were unequal widths, overflowing or wrapping | Switched from CSS flexbox to HTML `<table>` with `table-layout: fixed` and equal `%` column widths |
| v3 | State machine boxes misaligned across rows | Switched from CSS flexbox `.state-row` to HTML `<table class="sm">` with fixed column widths |
| v4 | Puppeteer generated PDF at wrong scale — content too wide | Set viewport `width: 682px` = A4 210mm minus 15mm×2 margins at 96dpi. This makes the browser render at exactly the print width |
| v5 | LinkedIn image was needed as a single-page visual | Added `_IMAGE.html` + `generate-image.js` for 1920×1080 PNG output |
| v7 | Scripts were hardcoded to specific filenames | Added `process.argv[2]` / `process.argv[3]` CLI args — scripts now reusable across all projects |
| v8 | Generated outputs contained real employer/system names | Added mandatory privacy rule: silently substitute all project-specific identifiers with generic equivalents |

### Critical rules that must never be violated

1. **`px` only in `_ARCHITECTURE.html`** — `rem`/`em`/`vw` scale unpredictably in headless Chrome at 682px viewport and cause overflow or collapsed layout
2. **CI/CD = HTML table, NOT flexbox** — Puppeteer's PDF renderer does not honour flex `gap` and `flex: 1` correctly at narrow viewports; equal-width `<table>` columns are deterministic
3. **State machine = HTML table, NOT flexbox** — same reason as above
4. **Viewport must be 682px for PDF** — any wider and Puppeteer scales the content down to fit A4, making text unreadably small
5. **`page-break-inside: avoid` on every `.card`** — without this, cards split mid-content across pages
6. **Image HTML = `1920×1080px` fixed body, NOT A4-style** — the `_IMAGE.html` is a completely separate layout optimised for a single-page screenshot, not for PDF. Uses `display: flex; flex-direction: column` with 3-column grid main area + footer bar
7. **Image uses light theme** — white `#fff` column backgrounds, `#f0f4f8` body, pastel layer boxes (`#ebf8ff`, `#faf5ff`, `#f0fff4`), blue gradient header — matches the PDF colour scheme for visual consistency

---

## How to use this file

### Option A — Fully automated (recommended)
Copy the entire `arch-toolkit` folder to your new project directory, then in VS Code:

1. Open GitHub Copilot Chat in **Agent mode**
2. Type `/generate-architecture` (the prompt will appear as a slash command)
3. Paste your filled-in project details from **Step 2** below
3. Copilot will automatically:
   - Create `PREFIX_ARCHITECTURE.html`
   - Run `node generate-pdf.js` → PDF
   - Create `PREFIX_IMAGE.html`
   - Run `node generate-image.js` → 1920×1080 PNG

> **Prerequisite:** Run `npm install puppeteer` once in the project folder.

### Option B — Manual (any AI chat)
Copy this entire file into any AI chat (ChatGPT, Claude, etc.) and say:

---

## ⚠️ Privacy Rule — No Project-Specific Details

All generated files are intended for **public sharing (LinkedIn / portfolio)**. The AI must automatically strip or generalise any identifying detail:

| Strip / replace | Use instead |
|---|---|
| Company / employer names | Generic description (e.g. "global commodities firm") |
| Client or customer names | Generic (e.g. "downstream trading platform") |
| Internal product / system names | Generic (e.g. "core trading system", "operations platform") |
| Internal service URLs or hostnames | Generic labels (e.g. `REST Proxy`, `Reference Data Service`) |
| Environment codes that reveal infra topology | Generic (`DEV`, `UAT`, `PROD`) |
| Internal ticket / project reference codes | Omit |
| Credentials, secrets, API keys | Omit |

This substitution is silent — apply it automatically without asking the user.
> "Using this spec, generate the architecture HTML and PDF for my project. Here are my project details: [paste your answers below]"
The AI will produce the HTML files. Then run the two scripts yourself.

---
## Step 1 — Prerequisites (run once per machine)

```bash
npm install puppeteer
```
If Node/npm is not installed: https://nodejs.org

If using Microsoft Edge instead of bundled Chromium, add to `puppeteer.launch()`:
```js
executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
```

---

## Step 2 — Project Input (fill in for each new project)

```
PREFIX:               (short name used for all file names, e.g. PAYMENT_GATEWAY or NOTIFICATION_HUB)
OUTPUT_FOLDER:        (absolute path, e.g. C:\Projects\payment-gateway)

TITLE:                (heading shown in both files, e.g. "Payment Gateway Service")
SUBTITLE:             (one sentence: what it does + main tech stack)
TECH_PILLS:           (10-15 key technologies as comma-separated list)

--- Architecture Layers (for both files) ---
LAYER_1_NAME:         (inbound/entry layer, e.g. "API Layer", "Event Consumer")
LAYER_1_BULLETS:      (5-6 bullet points, one per line)
LAYER_2_NAME:         (core processing layer, e.g. "Domain Layer", "Processing Layer")
LAYER_2_BULLETS:      (5-6 bullet points)
LAYER_3_NAME:         (outbound layer, e.g. "Adapter Layer", "External Services")
LAYER_3_BULLETS:      (5-6 bullet points)
KEY_INSIGHTS_4:       (4 design decisions as: "Short Title | one sentence explanation")

--- Section 2: Request / Event Lifecycle ---
LIFECYCLE_TITLE:      (e.g. "Async Request Lifecycle", "Event Processing Lifecycle")
LIFECYCLE_ASCII:      (ASCII flow diagram, lines <= 80 chars — see format guide below)
LIFECYCLE_NOTE:       (one sentence explaining the key non-obvious design choice)

--- Section 3: Background Jobs / Workers (omit if none) ---
JOB_1_NAME / JOB_1_TRIGGER / JOB_1_DESC
JOB_2_NAME / JOB_2_TRIGGER / JOB_2_DESC
JOB_3_NAME / JOB_3_TRIGGER / JOB_3_DESC

--- Section 4: Data Design & State Machine ---
DB_PARAGRAPH:         (1-2 sentences: DB type, schema management approach)
STATE_STEPS:          (ordered states, e.g. RECEIVED -> VALIDATING -> DONE / FAILED -> ARCHIVED)
STATE_COLORS:         (purple=initial, blue=in-flight, green=success, red=failed, grey=terminal)
DB_TABLES:            (TableName | Purpose | Key columns — one per line)

--- Section 5-6: Patterns & Decisions ---
PATTERNS:             (5-8 entries: emoji | Pattern Name | one-line description)
DECISIONS:            (5-8 rows: Decision | Choice | Rationale)

--- Section 7: CI/CD Pipeline ---
PIPELINE_STEPS:       (StepName(sub-label) in order, e.g. Build(mvn install), Test(H2), Deploy(Helm))
MANUAL_STEPS:         (which step names need a manual gate)
POST_DEPLOY_NOTE:     (one sentence)

--- Section 8: Observability (6 items) ---
OBS_1 through OBS_6:  (Title | description — one per line)

--- Section 9: Technology Stack ---
TECH_STACK:           (full list of all technologies, frameworks, tools, libraries)
```

---

## Step 3 — Run the scripts

```bash
cd C:\Projects\my-project

# Generate PDF from the architecture HTML:
node generate-pdf.js MY_PROJECT_ARCHITECTURE.html MY_PROJECT_ARCHITECTURE.pdf

# Generate 1920×1080 PNG from the image HTML:
node generate-image.js MY_PROJECT_IMAGE.html MY_PROJECT_IMAGE.png
```

Or use the defaults (if filenames match the defaults in the scripts):
```bash
node generate-pdf.js
node generate-image.js
```

---

## Output Specification — File 1: Architecture HTML (PDF source)

### Requirements
- **Self-contained** — all CSS inline in `<style>`, no external dependencies.
- **Print-first** — all units in `px` only (no `rem`, `vw`, `em`). Body `width: 100%` with no `max-width`.
- **Viewport**: 682px (= A4 210mm minus 15mm×2 margins at 96dpi).
- **`page-break-inside: avoid`** on every `.card`.
- **`-webkit-print-color-adjust: exact; print-color-adjust: exact`** on body.
- **Font**: `'Segoe UI', Arial, sans-serif` — no external fonts.

### CSS classes (use exactly — do not rename)
```
.hdr          header gradient box  (linear-gradient(135deg,#1a2e4a,#2b6cb0))
.pills        flex row of .pill chips inside header
.pill         white-translucent rounded pill
.card         section card (border:1px solid #d0dce8, border-radius:8px, padding:12px 14px, margin-bottom:8px)
.ctitle       card title (flex row: blue circle .num + text)
.num          blue circle number badge
.g3           3-column CSS grid (gap:7px)
.g2           2-column CSS grid (gap:7px)
.g6           3-column CSS grid for 6 obs items (gap:6px)
.box          coloured inner box (.b-blue / .b-purple / .b-green)
.b-blue       background:#ebf8ff
.b-purple     background:#faf5ff
.b-green      background:#f0fff4
.b-side       left-bordered insight box (border-left:3px solid #2b6cb0, background:#f7fafc)
.desc         grey body text (font-size:11px, color:#4a5568)
.small        grey footnote (font-size:9px, color:#718096)
.flow         monospace ASCII diagram (white-space:pre, font-size:8.5px, background:#f7fafc)
.note         blue left-border callout
.plist        pattern list (list-style:none, li = emoji icon + strong + span)
.tbl          data table (th background:#ebf4ff, border-collapse:collapse)
.job          batch job card
.obs          observability card
.techs / .tech tech pill grid
.pipe         CI/CD pipeline HTML table (table-layout:fixed)
.sm           state machine HTML table (table-layout:fixed)
State colours: .s-pur(purple) .s-blu(blue) .s-grn(green) .s-red(red) .s-gry(grey)
```

### Section structure — 9 cards
| # | Title |
|---|-------|
| 1 | System Overview |
| 2 | [Request/Event] Lifecycle |
| 3 | Background Jobs / Workers *(omit if none)* |
| 4 | Database Design & State Machine |
| 5 | Key Architecture Patterns |
| 6 | Architecture Decisions |
| 7 | CI/CD Pipeline |
| 8 | Observability |
| 9 | Technology Stack |

### Card layouts
- **Card 1**: `.desc` paragraph → `.g3` (3 layer boxes with `<h4>` + `<ul>`) → `.g2` (4 `.b-side` insight boxes)
- **Card 2**: `.flow` pre block (≤80 chars/line) → `.note` callout
- **Card 3**: `.g3` of 3 `.job` divs (`.jname`, `.jtag`, `.jdesc`)
- **Card 4**: `.desc` → `.sm` state machine HTML table → `.small` footnote → `.tbl` key tables
- **Card 5**: `.plist` `<ul>` (emoji + `<strong>` + `<span>`)
- **Card 6**: `.tbl` (Decision | Choice | Rationale)
- **Card 7**: `.pipe` HTML table (`table-layout:fixed`, step cols ~14% each, arrow cols ~3.5%); row 2 = Auto/Manual labels; manual gate steps use class `s m`
- **Card 8**: `.g6` grid of 6 `.obs` divs (`.otitle` + `.odesc`)
- **Card 9**: `.techs` flex-wrap of `.tech` spans

### Complete CSS block (copy verbatim into every _ARCHITECTURE.html)
```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px;
  color: #2d3748; line-height: 1.5; background: #fff;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; width: 100%;
}
.hdr { background: linear-gradient(135deg,#1a2e4a,#2b6cb0); color:#fff; padding:14px 18px 12px; border-radius:8px; margin-bottom:9px; }
.hdr h1 { font-size:20px; font-weight:700; margin-bottom:4px; }
.hdr p  { font-size:11px; opacity:0.88; margin-bottom:8px; }
.pills  { display:flex; flex-wrap:wrap; gap:4px; }
.pill   { background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.35); border-radius:20px; padding:2px 8px; font-size:9px; font-weight:600; }
.card   { border:1px solid #d0dce8; border-radius:8px; padding:12px 14px; margin-bottom:8px; page-break-inside:avoid; background:#fff; }
.ctitle { font-size:13px; font-weight:700; color:#1a2e4a; border-bottom:2px solid #ebf4ff; padding-bottom:5px; margin-bottom:9px; display:flex; align-items:center; gap:7px; }
.num    { background:#2b6cb0; color:#fff; border-radius:50%; width:18px; height:18px; font-size:9px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
.g3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:7px; }
.g2 { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
.g6 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; }
.box { border-radius:6px; padding:9px; }
.box h4 { font-size:10px; font-weight:700; color:#1a2e4a; margin-bottom:5px; }
.box ul { list-style:none; }
.box ul li { font-size:9px; color:#4a5568; padding:1.5px 0; border-bottom:1px solid rgba(0,0,0,0.05); }
.box ul li:last-child { border-bottom:none; }
.b-blue   { background:#ebf8ff; }
.b-purple { background:#faf5ff; }
.b-green  { background:#f0fff4; }
.b-side   { background:#f7fafc; border-left:3px solid #2b6cb0; border-radius:0 6px 6px 0; padding:8px 10px; }
.b-side .bt { font-size:9px; font-weight:700; color:#1a2e4a; margin-bottom:2px; }
.b-side .bd { font-size:8.5px; color:#4a5568; }
.desc  { font-size:11px; color:#4a5568; margin-bottom:8px; }
.small { font-size:9px; color:#718096; margin-top:4px; }
.flow  { background:#f7fafc; border:1px solid #d0dce8; border-radius:6px; padding:9px 11px; font-family:'Consolas','Courier New',monospace; font-size:8.5px; line-height:1.75; white-space:pre; overflow:hidden; margin-bottom:7px; }
.note  { background:#ebf8ff; border-left:3px solid #2b6cb0; border-radius:0 6px 6px 0; padding:7px 10px; font-size:10px; }
.note strong { color:#1a2e4a; }
.plist { list-style:none; }
.plist li { display:flex; gap:8px; padding:4px 0; border-bottom:1px solid #f0f4f8; }
.plist li:last-child { border-bottom:none; }
.plist .ic { font-size:11px; width:14px; flex-shrink:0; margin-top:1px; }
.plist strong { font-size:10px; color:#1a2e4a; display:block; }
.plist span   { font-size:9px; color:#4a5568; }
.tbl { width:100%; border-collapse:collapse; font-size:9.5px; }
.tbl th { background:#ebf4ff; color:#1a2e4a; font-weight:700; padding:5px 7px; text-align:left; border-bottom:2px solid #bee3f8; }
.tbl td { padding:4px 7px; border-bottom:1px solid #e2e8f0; vertical-align:top; }
.tbl tr:last-child td { border-bottom:none; }
.tbl td:first-child { font-weight:600; color:#2b6cb0; }
.job   { background:#f7fafc; border:1px solid #e2e8f0; border-radius:6px; padding:9px; }
.jname { font-size:10px; font-weight:700; color:#2b6cb0; margin-bottom:3px; }
.jtag  { display:inline-block; background:#ebf4ff; border-radius:10px; padding:1px 7px; font-size:8px; font-weight:600; color:#2b6cb0; margin-bottom:4px; }
.jdesc { font-size:9px; color:#4a5568; line-height:1.5; }
.obs   { background:#f7fafc; border:1px solid #e2e8f0; border-radius:6px; padding:9px; }
.otitle { font-size:10px; font-weight:700; color:#2b6cb0; margin-bottom:3px; }
.odesc  { font-size:9px; color:#4a5568; }
.techs { display:flex; flex-wrap:wrap; gap:4px; }
.tech  { background:#ebf4ff; color:#1a365d; border:1px solid #bee3f8; border-radius:12px; padding:2px 8px; font-size:9px; font-weight:600; }
.pipe  { width:100%; border-collapse:separate; border-spacing:0; table-layout:fixed; margin-bottom:5px; }
.pipe td.s  { background:#ebf4ff; border:2px solid #bee3f8; border-radius:5px; text-align:center; padding:6px 3px; font-size:9px; font-weight:700; color:#1a2e4a; }
.pipe td.s.m{ background:#fffbeb; border-color:#f6e05e; color:#7b5e00; }
.pipe td.a  { border:none; background:none; text-align:center; color:#a0aec0; font-size:10px; }
.pipe td.lb { border:none; background:none; text-align:center; font-size:8px; color:#718096; padding:2px 0 0; }
.sm    { width:100%; border-collapse:separate; border-spacing:5px 0; table-layout:fixed; margin:8px 0 4px; }
.sm td.b  { border-radius:5px; text-align:center; padding:6px 2px; font-size:9px; font-weight:700; }
.sm td.ar { border:none; background:none; text-align:center; color:#a0aec0; font-size:8px; line-height:1.3; }
.s-pur { background:#faf5ff; border:2px solid #d6bcfa; color:#553c9a; }
.s-blu { background:#ebf4ff; border:2px solid #bee3f8; color:#1a2e4a; }
.s-grn { background:#f0fff4; border:2px solid #9ae6b4; color:#276749; }
.s-red { background:#fff5f5; border:2px solid #feb2b2; color:#c0392b; }
.s-gry { background:#f7fafc; border:2px solid #e2e8f0; color:#718096; }
```

### HTML skeleton (_ARCHITECTURE.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{TITLE}}</title>
  <style>/* paste full CSS block above */</style>
</head>
<body>

<div class="hdr">
  <h1>{{TITLE}}</h1>
  <p>{{SUBTITLE}}</p>
  <div class="pills"><!-- <span class="pill">X</span> per tech pill --></div>
</div>

<!-- Card 1: System Overview -->
<div class="card">
  <div class="ctitle"><span class="num">1</span> System Overview</div>
  <p class="desc">{{OVERVIEW_PARAGRAPH}}</p>
  <div class="g3" style="margin-bottom:7px;">
    <div class="box b-blue"><h4>{{LAYER_1_NAME}}</h4><ul><!-- li per bullet --></ul></div>
    <div class="box b-purple"><h4>{{LAYER_2_NAME}}</h4><ul><!-- li per bullet --></ul></div>
    <div class="box b-green"><h4>{{LAYER_3_NAME}}</h4><ul><!-- li per bullet --></ul></div>
  </div>
  <div class="g2">
    <!-- 4x: <div class="b-side"><div class="bt">Title</div><div class="bd">Explanation</div></div> -->
  </div>
</div>

<!-- Card 2: Lifecycle -->
<div class="card">
  <div class="ctitle"><span class="num">2</span> {{LIFECYCLE_TITLE}}</div>
  <div class="flow">{{LIFECYCLE_ASCII}}</div>
  <div class="note"><strong>Key design note:</strong> {{LIFECYCLE_NOTE}}</div>
</div>

<!-- Card 3: Jobs (omit entire card if not applicable) -->
<div class="card">
  <div class="ctitle"><span class="num">3</span> Background Jobs / Workers</div>
  <div class="g3">
    <!-- 3x: <div class="job"><div class="jname">Name</div><div class="jtag">Trigger</div><div class="jdesc">Desc</div></div> -->
  </div>
</div>

<!-- Card 4: Database -->
<div class="card">
  <div class="ctitle"><span class="num">4</span> Database Design &amp; State Machine</div>
  <p class="desc">{{DB_PARAGRAPH}}</p>
  <table class="sm">
    <colgroup><!-- alternate col.b(15%) and col.ar(6%) --></colgroup>
    <tr><!-- <td class="b s-xxx">State<br><small>note</small></td><td class="ar">&#8594;</td> --></tr>
  </table>
  <p class="small">{{startup recovery note}}</p>
  <table class="tbl" style="margin-top:7px;">
    <tr><th>Table</th><th>Purpose</th><th>Key Fields</th></tr>
    <!-- one tr per table -->
  </table>
</div>

<!-- Card 5: Patterns -->
<div class="card">
  <div class="ctitle"><span class="num">5</span> Key Architecture Patterns</div>
  <ul class="plist">
    <!-- <li><span class="ic">emoji</span><div><strong>Name</strong><span>desc</span></div></li> -->
  </ul>
</div>

<!-- Card 6: Decisions -->
<div class="card">
  <div class="ctitle"><span class="num">6</span> Architecture Decisions</div>
  <table class="tbl">
    <tr><th>Decision</th><th>Choice</th><th>Rationale</th></tr>
    <!-- one tr per decision -->
  </table>
</div>

<!-- Card 7: CI/CD -->
<div class="card">
  <div class="ctitle"><span class="num">7</span> CI/CD Pipeline</div>
  <table class="pipe">
    <colgroup><!-- alternate col.s(~14%) and col.a(~3.5%) --></colgroup>
    <tr><!-- <td class="s [m]">Step<br><span style="font-weight:400;font-size:8px;">label</span></td><td class="a">&#8594;</td> --></tr>
    <tr><!-- <td class="lb">Auto/Manual</td><td></td> --></tr>
  </table>
  <p class="small">{{POST_DEPLOY_NOTE}}</p>
</div>

<!-- Card 8: Observability -->
<div class="card">
  <div class="ctitle"><span class="num">8</span> Observability</div>
  <div class="g6">
    <!-- 6x: <div class="obs"><div class="otitle">Title</div><div class="odesc">Desc</div></div> -->
  </div>
</div>

<!-- Card 9: Tech Stack -->
<div class="card">
  <div class="ctitle"><span class="num">9</span> Technology Stack</div>
  <div class="techs"><!-- <span class="tech">Name</span> per technology --></div>
</div>

</body>
</html>
```

---

## Diagram & Format Guides

### ASCII Lifecycle Diagram (≤80 chars per line)
```
Caller ──POST /endpoint──► Component
                              |
                  ┌───────────┼───────────┐
                  ▼           ▼           ▼
           ComponentA   ComponentB   ComponentC
                  |
            Next Step
              ├─ sub-step A
              ├─ sub-step B
              └─ sub-step C ──► Result
```

### State Machine Colour Guide
| State type        | CSS class | Background | Border    |
|-------------------|-----------|------------|-----------|
| Initial / Entry   | `s-pur`   | `#faf5ff`  | `#d6bcfa` |
| In-flight / Active| `s-blu`   | `#ebf4ff`  | `#bee3f8` |
| Success / Done    | `s-grn`   | `#f0fff4`  | `#9ae6b4` |
| Failed / Error    | `s-red`   | `#fff5f5`  | `#feb2b2` |
| Terminal / Purged | `s-gry`   | `#f7fafc`  | `#e2e8f0` |

### CI/CD colgroup width formula
For N pipeline steps: `col.s width = (100 / (N_steps * 1 + N_arrows * 0.25))%`
Arrow columns are ~3.5% each. Step columns share the rest equally.

---

## Output Specification — File 2: Architecture Image HTML (PNG source)

### Requirements
- **Self-contained** — all CSS inline in `<style>`, no external dependencies.
- **Fixed viewport**: body `width: 1920px; height: 1080px; overflow: hidden`.
- **Light theme** — white backgrounds, blue gradient header, pastel layer boxes.
- **Layout**: flexbox column — Header → 3-column grid main → Footer bar.
- **Font**: `'Segoe UI', Arial, sans-serif` — no external fonts.
- **No print styles** — this file is rendered to PNG via Puppeteer screenshot, not printed.

### Layout structure (3 sections)
```
┌─────────────────── HEADER (flex-shrink:0) ───────────────────┐
│  Title (42px) · Subtitle (18px) · Tech Pills row             │
├──────────┬──────────┬──────────┤
│  COL 1   │  COL 2   │  COL 3   │  ← main (flex:1, grid 38%|28%|34%)
│  Flow    │  Layers  │ Patterns │
│  Diagram │  3 boxes │ 6-8 items│
├──────────┴──────────┴──────────┤
│  FOOTER: State Machine │ Observability │ CI/CD Pipeline       │
└──────────────────────────────────────────────────────────────┘
```

### Colour scheme (light theme — must match PDF colours)
| Element | Background | Border | Text |
|---------|-----------|--------|------|
| Body | `#f0f4f8` | — | `#2d3748` |
| Header | `linear-gradient(135deg, #1a2e4a, #2b6cb0)` | — | `#fff` |
| Columns | `#fff` | `#d0dce8` right border | `#2d3748` |
| Flow box | `#f7fafc` | `#d0dce8` | `#4a5568` / highlights |
| Inbound layer | `#ebf8ff` | `#bee3f8` | `#1a2e4a` |
| Processing layer | `#faf5ff` | `#d6bcfa` | `#1a2e4a` |
| Outbound layer | `#f0fff4` | `#9ae6b4` | `#1a2e4a` |
| Footer | `#fff` | `#ebf4ff` top | `#2b6cb0` labels |
| State: pending | `#ebf4ff` | `#bee3f8` | `#1a2e4a` |
| State: in-progress | `#fffbeb` | `#f6e05e` | `#7b5e00` |
| State: success | `#f0fff4` | `#9ae6b4` | `#276749` |
| State: failed | `#fff5f5` | `#feb2b2` | `#c0392b` |
| State: terminal | `#f7fafc` | `#e2e8f0` | `#718096` |

### CSS classes (use exactly — do not rename)
```
body           1920×1080, flex column, #f0f4f8 background
.hdr           header gradient box (same gradient as PDF)
.hdr h1        42px white title
.hdr-sub       18px subtitle with 0.78 opacity
.pills/.pill   tech pill row (white-translucent, 15px, 20px border-radius)
.main          flex:1, CSS grid 38%|28%|34%, overflow hidden
.col           white column with right border, 20px 24px padding
.ctitle        16px uppercase section title, blue, bottom border
.flow          monospace pre block, #f7fafc bg, 15px font, 1.85 line-height
.hi            blue highlight in flow (#2b6cb0)
.gr            green highlight (#276749)
.ye            yellow/amber highlight (#b7791f)
.re            red highlight (#c0392b)
.layer         rounded box with 14px 16px padding
.l-in          blue layer (#ebf8ff bg, #bee3f8 border)
.l-int         purple layer (#faf5ff bg, #d6bcfa border)
.l-out         green layer (#f0fff4 bg, #9ae6b4 border)
.pat           pattern item with bottom border separator
.footer        white bar, #ebf4ff top border, flex row with separators
.flabel        uppercase blue label (14px)
.sep           1px vertical divider (#d0dce8)
.sm-flow       flex row of state boxes
.sm-box        state machine box (rounded, padded, bold)
.s-pend/s-prog/s-succ/s-fail/s-term  state colour classes
.obs-list      flex row of observability items
.cicd          flex row of CI/CD steps with arrows
```

### Content mapping (from PDF → Image)
| PDF Section | Image Location | What to include |
|-------------|---------------|-----------------|
| Card 2: Lifecycle | Column 1 (flow) | ASCII diagram, condensed to fit column |
| Card 1: System Overview (layers) | Column 2 (layers) | 3 layer boxes with 4-5 bullets each |
| Card 5: Patterns | Column 3 (patterns) | 6-8 patterns with emoji + title + 1-line desc |
| Card 4: State Machine | Footer left | State boxes in flow order |
| Card 8: Observability | Footer middle | 5-6 items as label + value pairs |
| Card 7: CI/CD | Footer right | Pipeline steps with arrows |

### HTML skeleton (_IMAGE.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>/* paste full IMAGE CSS block from EXAMPLE_IMAGE.html */</style>
</head>
<body>

<div class="hdr">
  <h1>{{TITLE}}</h1>
  <div class="hdr-sub">{{SUBTITLE}}</div>
  <div class="pills"><!-- <span class="pill">X</span> per tech --></div>
</div>

<div class="main">
  <!-- COL 1: Lifecycle -->
  <div class="col">
    <div class="ctitle">{{LIFECYCLE_TITLE}}</div>
    <div class="flow">{{LIFECYCLE_ASCII with <span class="hi/gr/ye/re"> highlights}}</div>
  </div>

  <!-- COL 2: Layers -->
  <div class="col">
    <div class="ctitle">Architecture Layers</div>
    <div class="layer l-in"><h4>▲ {{LAYER_1}}</h4><ul><!-- li per bullet --></ul></div>
    <div class="layer l-int"><h4>▶ {{LAYER_2}}</h4><ul><!-- li per bullet --></ul></div>
    <div class="layer l-out"><h4>▼ {{LAYER_3}}</h4><ul><!-- li per bullet --></ul></div>
  </div>

  <!-- COL 3: Patterns -->
  <div class="col">
    <div class="ctitle">Key Patterns</div>
    <!-- 6-8x: <div class="pat"><strong>emoji Name</strong><span>description</span></div> -->
  </div>
</div>

<div class="footer">
  <span class="flabel">State</span>
  <div class="sm-flow">
    <!-- <div class="sm-box s-xxx">STATE</div><span class="sm-arr">→</span> -->
  </div>
  <div class="sep"></div>
  <span class="flabel">Observability</span>
  <div class="obs-list">
    <!-- <div class="obs-item"><b>Label</b> Value</div> -->
  </div>
  <div class="sep"></div>
  <span class="flabel">CI/CD</span>
  <div class="cicd">
    <!-- <span class="cs">Step</span><span class="ca">→</span> -->
  </div>
</div>

</body>
</html>
```

---

## Quality Checklist (AI must verify before outputting)

### _ARCHITECTURE.html
- [ ] All units are `px` or `%` — no `rem`, `vw`, `em`
- [ ] Body has no `max-width` set
- [ ] Every `.card` has `page-break-inside: avoid`
- [ ] ASCII diagram lines are ≤ 80 characters
- [ ] State machine uses HTML `<table>` (not flexbox)
- [ ] CI/CD pipeline uses HTML `<table>` with `table-layout: fixed`
- [ ] `print-color-adjust: exact` on body

### generate-pdf.js
- [ ] Script uses `process.argv[2]` and `process.argv[3]` for filenames
- [ ] Viewport set to `width:682, height:1123`
- [ ] Uses `process.cwd()` not `__dirname`

### _IMAGE.html (1920×1080 PNG source)
- [ ] Body is exactly `width: 1920px; height: 1080px; overflow: hidden`
- [ ] Light theme: white columns, `#f0f4f8` body, pastel layer boxes
- [ ] Header uses same blue gradient as PDF (`#1a2e4a → #2b6cb0`)
- [ ] 3-column grid layout (38%|28%|34%) — flow | layers | patterns
- [ ] Footer has state machine + observability + CI/CD in single row
- [ ] No print-specific styles (`page-break-inside`, `print-color-adjust`)
- [ ] All content fits within 1080px height — no overflow

### generate-image.js
- [ ] Script uses `process.argv[2]` and `process.argv[3]` for filenames
- [ ] Viewport set to `width:1920, height:1080, deviceScaleFactor:1`
- [ ] Uses `clip` mode (not `fullPage`) for screenshot
- [ ] Uses `process.cwd()` not `__dirname`

