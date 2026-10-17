# ⚡ Token Saver for VS Code & Agentic IDEs

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenVSX](https://img.shields.io/badge/Open%20VSX-available-blue.svg)](https://open-vsx.org/extension/terenceooi/token-saver-rtk-ide)
[![Sponsor on Wise](https://img.shields.io/badge/Sponsor-Wise-9fe870?logo=wise&logoColor=black)](https://wise.com/pay/me/terenceooit)
[![VS Code](https://img.shields.io/badge/VS%20Code-Compatible-007ACC.svg)](https://code.visualstudio.com)
[![Cursor](https://img.shields.io/badge/Cursor%20IDE-Compatible-black.svg)](https://cursor.com)
[![Windsurf](https://img.shields.io/badge/Windsurf%20IDE-Compatible-00E5FF.svg)](https://codeium.com/windsurf)
[![Antigravity](https://img.shields.io/badge/Antigravity%20IDE-Compatible-purple.svg)](https://github.com/terenceooi99/token-saver-rtk-ide)

**Token Saver (RTK, Headroom, Ponytail, Anti-Slop, OmniRoute, JevGraph, CodeGraphContext, fastCRW & Lightpanda Browser)** is an all-in-one token optimization, semantic code & knowledge graph extraction, hybrid web search/scraping, and AI quality suite with CLI output compression proxy. Powered by [RTK (Rust Token Killer)](https://www.rtk-ai.app), [Headroom context compression](https://github.com/headroomlabs-ai/headroom), [Ponytail YAGNI mode](https://github.com/DietrichGebert/ponytail), [Anti-Slop AI Quality Framework](https://github.com/miqdadbadjuber/anti-slop), [OmniRoute AI Gateway](https://github.com/diegosouzapw/OmniRoute), [JevGraph Engine](https://github.com/chenmingtang830/jevgraph) (for non-code specs & docs), [CodeGraphContext](https://github.com/CodeGraphContext/CodeGraphContext) (for semantic code graphs), [fastCRW](https://github.com/fastcrw/crw) (fast markdown web scraper), and [Lightpanda Browser](https://github.com/lightpanda-io/browser) (headless agent browser via MCP), it slashes AI context window token consumption by **60% - 95%** during terminal command execution, code exploration, web research, and document ingestion across **all major Agentic AI IDEs and coding assistants**.

<p align="center">
  <img src="resources/dashboard-preview.png" alt="Token Saver Interactive Glassmorphic Dashboard" width="100%" />
</p>

---

## 🏗️ Architectural Flowchart

The following flowchart illustrates how **Token Saver** bridges multiple AI IDEs, coordinates seven specialized optimization & quality engines, and optimizes terminal output, document context & prompt context before hitting LLM models:

```mermaid
flowchart TD
    subgraph IDEs ["Supported IDEs & AI Agents"]
        VSCode["VS Code / GitHub Copilot"]
        Cursor["Cursor AI Agent"]
        Windsurf["Windsurf Cascade"]
        ClineRoo["Cline & Roo Code"]
        Claude["Claude Code CLI"]
        Antigravity["Google Antigravity IDE"]
    end

    subgraph TokenSaver ["Token Saver Core Extension Layer"]
        RuleSync["Multi-IDE Rule Synchronizer<br/>(Safe Delimiter System)"]
        WebviewDash["Interactive Webview Dashboard<br/>(Live Counters, Breakdown & Controls)"]
        StatusBar["Dynamic Status Bar Meter<br/>(Real-Time Savings & Cost Gauge)"]
        SlashSkills["Chat Skills & Commands Engine<br/>(/rtk-*, /ponytail-*, /antislop-*, /omniroute, /jevgraph-*, /codegraph-*)"]
        CodeWatcher["Real-Time Code Watcher<br/>(Continuous Semantic Graph Auto-Update)"]
    end

    subgraph OptimEngines ["Token Optimization, Quality & Routing Engines"]
        RTK["RTK (Rust Token Killer)<br/>CLI Output Compression (60-90% Reduction)"]
        Headroom["Headroom Context Compression<br/>(CCR / Large Log & JSON Compression)"]
        Ponytail["Ponytail YAGNI Engine<br/>(Terse Directives, Compact Diffs, AST Outlines)"]
        AntiSlop["Anti-Slop AI Framework<br/>(UI, Copywriting, Code & Mobile Anti-Slop)"]
        OmniRoute["OmniRoute AI Gateway (:20128)<br/>(Multi-Model Routing & Auto-Failover)"]
        JevGraph["JevGraph Engine (Docs / Non-Code)<br/>(Doc Spec Candidate Graphs, 80-95% Reduction)"]
        CodeGraph["CodeGraphContext (Code AST & Calls)<br/>(Semantic Graph-First Queries, 80-90% Reduction)"]
    end

    subgraph ContextOptimization ["Context Window & Execution Flow"]
        TerminalOut["Condensed Terminal Output<br/>(git, npm, cargo, pytest, rg, etc.)"]
        DocGraphs["Schema-Guided Doc Graphs<br/>(Bounded Subgraphs with Page Evidence)"]
        CodeGraphs["Pre-Indexed Semantic Code Graph<br/>(Symbols, Call Graph & Dependencies)"]
        AgentPrompt["Optimized AI Prompt & Context<br/>(Zero Noise, High-Signal & Slop-Free)"]
        LLMModels["LLM Providers & Models<br/>(Claude 3.7 / GPT-4o / Gemini / DeepSeek)"]
    end

    %% Connections
    IDEs <-->|"Rule Sync & Injections"| RuleSync
    IDEs -->|"Slash Commands & Chat"| SlashSkills
    IDEs -->|"User Configuration"| WebviewDash
    IDEs -->|"Code File Edits"| CodeWatcher
    WebviewDash -->|"Status Bar Updates"| StatusBar

    SlashSkills -->|"Executes Shell Commands"| RTK
    SlashSkills -->|"Compresses Large Payloads"| Headroom
    SlashSkills -->|"Enforces Terse Code Diff"| Ponytail
    SlashSkills -->|"Enforces Quality Standards"| AntiSlop
    SlashSkills -->|"Routes AI Queries"| OmniRoute
    SlashSkills -->|"Queries Non-Code Graphs"| JevGraph
    SlashSkills -->|"Queries Code Semantic Graph"| CodeGraph
    CodeWatcher -->|"Auto-Indexes on Save"| CodeGraph

    RTK -->|"Filters Verbosity"| TerminalOut
    JevGraph -->|"Converts Raw Specs/Docs to Graphs"| DocGraphs
    CodeGraph -->|"Indexes AST, Hierarchy & Calls"| CodeGraphs
    Headroom -->|"Compresses JSON/Logs"| AgentPrompt
    Ponytail -->|"Prunes Boilerplate"| AgentPrompt
    AntiSlop -->|"Eliminates AI Hallucinations & Generic Slop"| AgentPrompt
    OmniRoute -->|"Routes AI Requests"| LLMModels

    TerminalOut -->|"Feeds Condensed Signal"| AgentPrompt
    DocGraphs -->|"Feeds Bounded Evidence Graphs"| AgentPrompt
    CodeGraphs -->|"Graph-First Context Before File Read"| AgentPrompt
    AgentPrompt -->|"Consumes 60-95% Fewer Tokens"| LLMModels
    LLMModels -.->|"Telemetry & Savings Data"| WebviewDash
```

<p align="center">
  <img src="resources/flowchart-architecture.png" alt="Token Saver Architectural Flowchart" width="100%" />
</p>



---

## 🌐 Supported IDEs & AI Agent Ecosystem

| IDE / AI Agent | Rule / Configuration Target | How Token Saver Integrates |
| :--- | :--- | :--- |
| **VS Code (GitHub Copilot)** | `.github/copilot-instructions.md` | Injects RTK command rules & terse generation directives for Copilot Chat & agent mode |
| **Cursor IDE** | `.cursorrules` & `.cursor/rules/rtk.mdc` | Automatically instructs Cursor Agent to route CLI tasks via RTK & optimize context |
| **Windsurf IDE (Cascade)** | `.windsurfrules` | Instructs Cascade agent to prefix shell executions with RTK |
| **Cline & Roo Code** | `.clinerules` | Directs autonomous agents to use RTK for zero token waste |
| **Claude Code (Anthropic)** | `CLAUDE.md` | Configures Claude CLI agent with RTK execution & Headroom guidelines |
| **Universal Agents** | `AGENTS.md` | Standard cross-agent markdown format for OpenCode, Aider, etc. |
| **Google Antigravity IDE** | `~/.gemini/config/` & `.agents/` | Global & workspace rules plus native slash commands (`/rtk-*`) |

---

## 🎯 Dual-Mode Simultaneous Architecture & Interactive Dashboard

> ⚡ **Zero-Setup Out-of-the-Box**: Immediately after installing this plugin, **Way 1 (Chat / Slash Commands)** and **Way 2 (GUI Status Bar & Webview Dashboard)** are **both automatically active and available simultaneously**.

```
┌────────────────────────────────────────────────────────────────────────┐
│             TOKEN SAVER (RTK) SIMULTANEOUS DUAL-MODE ARCHITECTURE      │
├───────────────────────────────────┬────────────────────────────────────┤
│ WAY 1: Chat / Slash Commands      │ WAY 2: Extension & Dashboard       │
│ (In-Chat / Direct Agent Control)  │ (GUI Status Bar & Webview Panel)   │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Ready immediately upon install  │ • Live Status Bar: 48k saved (72%) │
│ • Type / in chat for instant menu │ • Interactive Webview Dashboard    │
│ • /rtk-update (GitHub Sync)       │ • Multi-IDE & Agent Sync Hub       │
│ • /rtk-savedtokenon (Enable)      │ • Upstream GitHub RTK auto-sync    │
│ • /rtk-savedtokenoff (Disable)    │ • Automatic rules synchronization  │
│ • /rtk-gain (View Scoreboard)     │ • Real-time token savings gauge    │
│ • /rtk-doctor (Diagnostics)       │ • Ponytail & Headroom controls     │
│ • /rtk-outline (AST / Symbols)    │ • Compact Diff & AST Outliner      │
│ • /rtk-diff (Compact Diffs)       │ • 1-Click AI Agent installer       │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 🚀 Way 1: Chat & Slash Commands (Antigravity & Agent Skills)

**Automatically configured upon plugin install!** Trigger commands directly in your AI assistant chat simply by typing `/`:

| Slash Command | Action |
| :--- | :--- |
| **`/rtk-savedtokenon`** | **Enables automated RTK compression**. AI routes all terminal/shell actions through `rtk` (e.g. `rtk git status`, `rtk cargo test`, `rtk npm test`). |
| **`/rtk-savedtokenoff`** | **Disables RTK mode**. Reverts to standard unproxied command execution. |
| **`/rtk-gain`** | **Displays live token savings scoreboard** and efficiency metrics. |
| **`/rtk-roi`** | **Calculates estimated dollar cost savings** and model-by-model ROI. |
| **`/rtk-diff`** | **Inspects compact git diffs** (`-U1`) to save 50-70% diff tokens. |
| **`/rtk-outline`** | **Generates AST / symbol outlines** (classes, signatures) before reading full file contents. |
| **`/rtk-tree`** | **Generates token-optimized project structure map**, filtering vendor/cache bloat. |
| **`/rtk-compress`** | **Compresses large JSON payloads, stack traces, and verbose logs** using Headroom CCR. |
| **`/rtk-doctor`** | **Runs health checks & diagnostics** for RTK, Headroom, and environment configs. |
| **`/rtk-sync`** | **1-Click syncs RTK & Headroom rules** across all AI agent files. |
| **`/rtk-run <cmd>`** | **Runs arbitrary shell command** through RTK output compression proxy. |
| **`/rtk-update`** | **Checks and updates RTK, Headroom, Ponytail, Anti-Slop, OmniRoute & JevGraph** from upstream GitHub releases. |
| **`/crw-search`** | **Hybrid web search & scraping with fastCRW** (70–90% token reduction over raw browser HTML). |
| **`/codegraph-query`** | **Queries pre-indexed semantic code graph** (symbols, call trees, callers/callees). |
| **`/codegraph-index`** | **Indexes workspace code into semantic AST property graph** with CodeGraphContext. |
| **`/jevgraph-build`** | **Builds schema-guided candidate knowledge graphs** from documents, specs, and PDFs (80–95% token savings). |
| **`/jevgraph-query`** | **Extracts bounded subgraphs & evidence spans** by entity or query for precise LLM context injection. |
| **`/ponytail`** | **Configures Ponytail YAGNI mode** for concise code diffs & terse generation. |
| **`/ponytail-audit`** | **Whole-repo audit for over-engineering** and speculative code. |
| **`/ponytail-debt`** | **Tracks shortcut debt ledger** marked with `ponytail:` comments. |
| **`/ponytail-gain`** | **Displays measured-impact scoreboard** from benchmarks. |
| **`/ponytail-help`** | **Displays Ponytail reference card** and intensity levels. |
| **`/ponytail-review`** | **Reviews diffs exclusively for over-engineering**. |
| **`/antislop`** | **Configures Anti-Slop AI rules** & review mode (`during`, `after`, `ask`, `off`). |
| **`/antislop-ui`** | **Enforces Anti-Slop UI standards**: human-designed layouts, real spacing, typography & contrast. |
| **`/antislop-copywriting`** | **Enforces Anti-Slop copywriting**: eliminates AI filler words ("delve", "testament", "tapestry"). |
| **`/antislop-human`** | **Applies human UX principles** with automated WCAG contrast checker scripts. |
| **`/antislop-layoutmobile`** | **Validates mobile-first constraints** and touch target compliance. |
| **`/antislop-code`** | **Enforces clean, maintainable, anti-slop code structure** without AI bloat. |
| **`/publishtokensaverlocal`** | **Builds local `.vsix`** for immediate internal IDE testing. |
| **`/publishtokensavernow`** | **Automates release tagging and publishing** to Open VSX & GitHub Releases. |

*(Optional Manual Re-install)*:
- **Command Palette**: `Token Saver: 1-Click Skill Installation (/rtk-*, /ponytail, /antislop, /jevgraph)`
- **Windows (PowerShell)**: `.\scripts\install-skills.ps1`
- **Linux / macOS (Bash)**: `./scripts/install-skills.sh`

---

## 🧩 Way 2: Primary Sidebar & Webview Dashboard (Multi-IDE Hub)

The extension provides full graphical and automated control directly from your **Primary Sidebar** and editor for **VS Code**, **Cursor**, **Windsurf**, **Antigravity**, and all OpenVSX-compatible editors.

### 🌟 Key Features:
1. **Primary Sidebar Interactive Dashboard**:
   - Click the **RTK Meter icon** on the Activity Bar / Primary Side Bar to instantly view and manage RTK optimization in a compact, sleek view.
   - Includes a **Pop Out to Editor Tab** button (`⤢`) to expand into a full-width dashboard at any time.
   - Includes an **Update from Open VSX** button (`🢁`) right in the sidebar title bar for 1-click extension updates.
2. **Multi-IDE & AI Agent Synchronization Hub**:
   - 1-Click sync to `.github/copilot-instructions.md`, `.cursorrules`, `.windsurfrules`, `.clinerules`, `CLAUDE.md`, `AGENTS.md`, and `~/.gemini/config/`.
   - **Safe Delimiter System**: Preserves existing project instructions using `<!-- RTK_TOKEN_SAVER_START -->` blocks.
3. **Interactive Glassmorphic Dashboard**:
   - Live Token Savings Counter with animated visual meters.
   - Compression Efficiency Gauge (%) and Estimated Dollar Savings ($).
   - Per-tool visual savings charts (`git`, `cargo`, `npm`, `pytest`, `vitest`, `rg`, `ls`, etc.).
   - Action center with 1-click skill sync, Ponytail & Anti-Slop GitHub sync, GitHub release update check, and proxy latency test.
   - Diagnostics panel displaying local binary path, version, and active target counts.

<p align="center">
  <img src="resources/dashboard-breakdown.png" alt="Token Saver Real-time Compression Scoreboard & Savings Breakdown" width="100%" />
</p>

4. **🗑️ Uninstall Skills & OS Recycle Bin Recovery**:
   - Safely removes individual skills or preset bundles (`RTK Core`, `Ponytail`, `Anti-Slop`, `JevGraph`, `CodeGraph`, or `All 31 Skills`) from either **Global IDE Config** (`~/.gemini/config/skills/`) or **Project Workspace** (`.agents/skills/`).
   - **Zero Data Loss / Recycle Bin First**: Deleted skills are moved directly into the native OS Recycle Bin / Trash (`shell:RecycleBinFolder` on Windows, `~/.Trash` on macOS, `trash:///` on Linux) with an instant option to view/open the folder.
   - **1-Click Skill Recovery**: Includes built-in options to immediately restore / re-install uninstalled skills to Global IDE, Project Workspace, or both scopes without manual cloning.

<p align="center">
  <img src="resources/dashboard-uninstalledskillwindow.png" alt="Token Saver Uninstall Skills & Recovery Pop-up Window" width="100%" />
</p>

5. **⏸️ Temporary Disable Skills (Agent Quarantine Mode)**:
   - Temporarily removes selected skills from AI agent `@` mention auto-completes and `/` chat action menus without permanently deleting files.
   - **🤖 Agent Decide (AI Prompt Mode)**: Copies an intelligent context-pruning prompt for your agent to automatically ignore irrelevant skill sets for your current session.
   - **✋ Manual Quarantine**: Quarantine specific skills into a isolated `.disabled-skills/` directory while keeping rules and configurations intact.
   - **🔄 Re-Enable All Skills**: Instantly un-quarantines and restores all temporarily disabled skills across global and workspace targets in one click.

<p align="center">
  <img src="resources/dashboard-disableskillwindow.png" alt="Token Saver Temporary Disable Skills Pop-up Window" width="100%" />
</p>

6. **Upstream GitHub 9-Way Core Sync (RTK, Headroom, Ponytail, Anti-Slop, OmniRoute, JevGraph, CodeGraphContext, fastCRW & Lightpanda)**:
   - Automatic non-intrusive update checks against official GitHub releases (`rtk-ai/rtk`, `headroomlabs-ai/headroom`, `DietrichGebert/ponytail`, `miqdadbadjuber/anti-slop`, `diegosouzapw/OmniRoute`, `chenmingtang830/jevgraph`, `CodeGraphContext/CodeGraphContext`, `fastcrw/crw` & `lightpanda-io/browser`).
   - 1-click update trigger for Windows (`winget`), macOS (`brew`), and Linux (`curl`), plus GitHub skill fetch for Ponytail, Anti-Slop, JevGraph, CodeGraph, fastCRW, and Lightpanda.
7. **Dynamic Live Status Bar**:
   - Shows real-time savings: `⚡ Token Saver: 48.2k saved (72%)` or `⚪ Token Saver: OFF`.
   - Rich hover tooltips with cost savings and direct 1-click enable when OFF or interactive dashboard when ON.
8. **Commands in Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)**:
   - `Token Saver: Open Interactive Dashboard`
   - `Token Saver: Sync Rules to All AI Agents (VS Code, Cursor, Windsurf, Cline, Claude, Antigravity)`
   - `Token Saver: Configure Target Agentic IDEs / AI Rules`
   - `Token Saver: Toggle Token Saver Mode`
   - `Token Saver: Enable Token Saver`
   - `Token Saver: Disable Token Saver`
   - `Token Saver: Check for Upstream GitHub Updates`
   - `Token Saver: Update from Upstream GitHub`
   - `Token Saver: Fetch & Sync Ponytail from GitHub`
   - `Token Saver: Fetch & Sync Anti-Slop from GitHub`
   - `Token Saver: Fetch & Sync JevGraph from GitHub`
   - `Token Saver: Build Knowledge Graph with JevGraph`
   - `Token Saver: Toggle JevGraph Context Optimization`
   - `Token Saver: Uninstall JevGraph Engine`
   - `Token Saver: Configure Anti-Slop Mode (during / after / ask / off)`
   - `Token Saver: Toggle Headroom Context Compression`
   - `Token Saver: Configure Ponytail Mode (YAGNI & Output Token Saver)`
   - `Token Saver: Run Compact Diff (rtk git diff -U1)`
   - `Token Saver: Generate AST / Symbol Outline for Current File`
   - `Token Saver: Start OmniRoute AI Gateway (Port 20128)`
   - `Token Saver: Stop OmniRoute AI Gateway`
   - `Token Saver: Open OmniRoute Web Dashboard`
   - `Token Saver: Toggle OmniRoute AI Gateway Integration`
   - `Token Saver: 1-Click Skill Installation (/rtk-*, /ponytail, /antislop, /jevgraph)`
   - `Token Saver: Sync Global Antigravity Rules (~/.gemini)`
   - `Token Saver: Show Token Savings Scoreboard (rtk gain)`
   - `Token Saver: Install RTK CLI Tool`
   - `Token Saver: Copy AI Agent Install Prompt`
   - `Token Saver: Copy Raw Shell Install Commands`

---

## ⚙️ Extension Settings

| Setting | Default | Description |
| :--- | :--- | :--- |
| `tokenSaver.enableOnStartup` | `true` | Automatically enable RTK token compression when opening a project. |
| `tokenSaver.headroomEnabled` | `true` | Enable Headroom context compression (CCR / SmartCrusher / CodeCompressor). |
| `tokenSaver.antiSlopEnabled` | `true` | Enable Anti-Slop AI quality and slop elimination framework. |
| `tokenSaver.antiSlopMode` | `"during"` | Anti-Slop review execution mode (`during`, `after`, `ask`, `off`). |
| `tokenSaver.omniRouteEnabled` | `true` | Enable OmniRoute AI Gateway integration and model routing. |
| `tokenSaver.omniRoutePort` | `20128` | Local port for OmniRoute AI Gateway proxy server. |
| `tokenSaver.omniRouteAutoStart` | `false` | Automatically start OmniRoute AI Gateway on IDE startup. |
| `tokenSaver.omniRouteEndpoint` | `"http://localhost:20128/v1"` | OpenAI-compatible endpoint URL for OmniRoute local proxy. |
| `tokenSaver.jevGraphEnabled` | `true` | Enable JevGraph evidence-backed knowledge graph context compression. |
| `tokenSaver.jevGraphProvider` | `"keyword"` | JevGraph relation extraction pipeline provider (`keyword`, `jev`, `local`). |
| `tokenSaver.autoInstallSkills` | `true` | Automatically install Antigravity & Agent chat skills (`/rtk-*`, `/ponytail-*`, `/antislop-*`, `/jevgraph-*`) on startup. |
| `tokenSaver.targetScope` | `"all"` | Target IDE / Agent rule scope (`all`, `global`, `workspace`, `copilot`, `cursor`, `windsurf`, `cline`, `claude`, `agents`). |
| `tokenSaver.checkForUpdatesOnStartup` | `true` | Check for newer RTK & Headroom releases on startup. |
| `tokenSaver.weeklyAutoSync` | `true` | Weekly background check and sync for upstream releases. |
| `tokenSaver.tokenPricePerMillion` | `3.00` | Estimated USD price per 1M tokens for dollar savings calculation. |
| `tokenSaver.statusMetricDisplay` | `"compact"` | Format of live metrics in status bar (`compact`, `verbose`, `iconOnly`). |
| `tokenSaver.ponytailMode` | `"full"` | Ponytail YAGNI mode (`full`, `lite`, `ultra`, `off`). |
| `tokenSaver.terseAgentMode` | `true` | Instruct agents to drop conversational filler to maximize output token savings. |
| `tokenSaver.compactDiffContext` | `true` | Direct AI agents to use `-U1` compact context for git diffs. |
| `tokenSaver.astOutlineContext` | `true` | Direct AI agents to inspect symbol outlines before reading full files. |

---

## 📦 Prerequisites: Installing RTK CLI

Token Saver functions best with the `rtk` binary installed on your system.

### Windows:
```powershell
winget install --id rtk-ai.rtk --accept-source-agreements --accept-package-agreements
```

### macOS / Linux:
```bash
brew install rtk-ai/tap/rtk
# or
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/main/install.sh | bash
```

### Verify Installation:
```bash
rtk --version
rtk gain
```

---

## 🛠 Multi-IDE Rule Sync via Terminal

You can also synchronize rules directly from terminal:

- **Windows PowerShell**:
  ```powershell
  .\scripts\install-all-ide-rules.ps1
  ```
- **macOS / Linux Bash**:
  ```bash
  ./scripts/install-all-ide-rules.sh
  ```

---

## 📦 Packaging & Publishing

1. **Package Local VSIX**:
   ```bash
   npm run package
   # or
   npx @vscode/vsce package
   ```

2. **Publish to Open VSX**:
   ```bash
   npx ovsx publish token-saver-rtk-ide-<Current-Version>.vsix -p <YOUR_OPENVSX_ACCESS_TOKEN>
   ```

3. **Automated Tag & CI Release**:
   ```bash
   # Or trigger 1-click automated release tagging via chat:
   /publishtokensavernow
   ```

---

## ☕ Support & Sponsor

If Token Saver helps you save tokens, accelerate agent development, or lower your LLM API bills, please consider supporting the project!

[![Sponsor on Wise](https://img.shields.io/badge/Sponsor_via_Wise-Terence_Ooi-9fe870?style=for-the-badge&logo=wise&logoColor=black)](https://wise.com/pay/me/terenceooit)

- **Direct Wise Link**: [https://wise.com/pay/me/terenceooit](https://wise.com/pay/me/terenceooit)

---

## 👤 Author & Maintainer

- **Terence** — [terenceooi1688@gmail.com](mailto:terenceooi1688@gmail.com)
- **GitHub**: [terenceooi99/token-saver-rtk-ide](https://github.com/terenceooi99/token-saver-rtk-ide)
- **Sponsor / Tip**: [Tip me @ Wise](https://wise.com/pay/me/terenceooit)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).