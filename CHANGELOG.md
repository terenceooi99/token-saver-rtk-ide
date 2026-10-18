# Changelog

All notable changes to the **Token Saver (RTK)** project will be documented in this file.

## [1.14.11] - 2026-10-18
### Added & Improved
- **Integrated Everything Claude Code (ECC) Harness Optimization (Upstream: affaan-m/ECC)**:
  - Added dedicated token saving and context compression capabilities from upstream `affaan-m/ECC` designed to prevent token waste without colliding with existing upstreams (`rtk`, `headroom`, `ponytail`, `anti-slop`, `fastcrw`, `lightpanda`, `cgc`, `jevgraph`, `omniroute`).
  - **Holistic 8-Surface Dashboard Integration**:
    1. **Header Action Toggle Button**: Added dedicated `Turn ECC ON / OFF` header switch (`#toggleEccBtn`) with instant state synchronization.
    2. **Setup Alert Banner**: Added dynamic missing chip (`🧠 ECC Missing`) and 1-click AI install prompt generator in notification banner.
    3. **Dedicated Dashboard Section**: Added `#sectionEcc` with 3 feature cards:
       - *Strategic Context Compaction*: Phase-boundary conversation pruning with customizable tool call threshold.
       - *Context Keeper (`ck`)*: Milestone checkpoint persistence to `.agents/ck/context.json` & `.agents/ck/CONTEXT.md`.
       - *Anti-Loop Council & Agent Evaluator*: Multi-perspective deadlock breaking and circuit breaker against repetitive tool retries.
    4. **Multi-Channel Breakdown**: Added dedicated ECC navigation tab and telemetry weight metrics.
    5. **System Health Diagnostics**: Added ECC diagnostics row with Active/Inactive badge, AI prompt copy, sync, and uninstall actions.
    6. **Upstream Versions Tracking**: Integrated ECC release checks and dropdown tracking in Upstream Version Inspector.
    7. **Sync & Uninstall Pickers**: Included ECC in `showSyncPicker` and `showUninstallPicker` quickpick dialogs.
    8. **Footer & Card References**: Added verified official GitHub repository link (`https://github.com/affaan-m/ECC`) across footer and card header badges.
- **Zero-Noise Latency Diagnostics**:
  - `Test Upstream Latencies` selectively pings and displays ECC latency only when installed, avoiding visual clutter when optional.
- **Auto-Activation & AI Directives Injection**:
  - Toggling ECC automatically injects strategic compaction, context keeper snapshots, and council directives into `AGENTS.md` and multi-IDE agent rules upon activation.
  - Bundled skills `/strategic-compact`, `/ck`, `/council`, and `/agent-evaluator` in `SKILLS_MAP`.

## [1.14.10] - 2026-10-18

### Added & Improved
- **OmniRoute Vibe Coder Preset UI & Agent Handoff Streamlining**:
  - Enhanced OmniRoute Step 3 ("Connect Your Coding Agent") with a dedicated **"🤖 Copy AI Agent Prompt"** dual-action button alongside **"📋 Copy Config"** across all IDE presets (Antigravity, Cursor, Cline/Roo Code, Claude Code CLI, and VS Code Continue).
  - Configured intelligent host IDE tab detection and automatic highlighting, prioritizing Antigravity IDE and Cursor based on active workspace telemetry.
  - Added dedicated contextual notice callouts (`.preset-notice-callout`) guiding users through IDE-specific nuances (e.g. Antigravity chat model routing, Cursor OpenAI overrides, and Claude Code environment variables).
  - Established Dual-Strategy Auto-Combo Routing: defaults to **`auto/coding:free`** for a 100% Zero-Cost Guarantee while supporting **`auto/coding`** for uninterrupted multi-provider auto-failover.
  - Guided users to configure stacked token compression (**`RTK -> Caveman`**) inside OmniRoute's Web Dashboard (*Context & Cache → Compression*).
  - Synchronized `/rtk-omniroute` skill reference files and AST graphs across workspace, package, and global skill repositories.
- **Upstream Engine Integration & Latency Diagnostics Guardrails**:
  - Aligned dashboard footer version badge and verified pre-flight integrity contracts.

## [1.14.9] - 2026-10-18
### Added & Improved
- **User-Friendly Step 3 OmniRoute AI Agent Prompt & Chat Routing**:
  - Revamped Step 3 ("Connect Your Coding Agent") in the OmniRoute dashboard wizard with a dedicated **"🤖 Copy AI Agent Prompt"** dual-action button alongside **"📋 Copy Config"**.
  - Solved Antigravity IDE custom model dropdown limitations by providing an automated prompt instructing the agent to route model completions through local OmniRoute (`http://localhost:20128/v1`) with API key `omniroute`.
  - Implemented Dual-Strategy Auto-Combo Routing: defaults to **`auto/coding:free`** for a 100% Zero-Cost Guarantee while documenting **`auto/coding`** for uninterrupted multi-provider auto-failover.
  - Disentangled IDE settings from gateway settings: removed phantom config keys and guided users to enable stacked token compression (**`RTK -> Caveman`**) directly in OmniRoute's Web Dashboard (*Context & Cache → Compression*).
  - Added IDE-specific contextual notice callouts (`.preset-notice-callout`) and automatic host IDE tab highlighting (defaulting to Antigravity IDE when active).
  - Synchronized `rtk-omniroute` skill definitions across standalone, workspace, and internal multi-IDE skill templates.
- **Accurate Subdirectory Paths for fastCRW & Lightpanda AI Setup Prompts**:
  - Aligned clone folder destinations in [rtk-service.js](file:///d:/Software/token-saver-ide-plugin/extension/rtk-service.js) so AI install prompts and setup instructions strictly use repository subdirectories (`${basePath}/fastcrw` and `${basePath}/lightpanda`) rather than generic names.
- **Robust VSIX Compilation File-Lock Handling**:
  - Enhanced [scripts/package-vsix.ps1](file:///d:/Software/token-saver-ide-plugin/scripts/package-vsix.ps1) with explicit .NET garbage collection finalizer cleanup and copy/remove steps to eliminate transient archive lock errors during local packaging.

## [1.14.8] - 2026-10-18
### Added & Improved
- **Missing Upstream GitHub Notification Popups on Dashboard Toggle**:
  - Replaced dead/fixed "enabled" notifications with dynamic warning popups whenever attempting to activate an upstream tool that is not installed or detected on the system.
  - Across all upstream layers (**Ponytail**, **Anti-Slop**, **Headroom**, **OmniRoute**, **JevGraph**, **CodeGraphContext**, **fastCRW**, and **Lightpanda**), toggling an uninstalled tool now prompts users with actionable options: `🤖 Ask AI (Copy Prompt)`, `⭮ Fetch / Sync from GitHub`, `⚡ Auto-Run in Terminal`, and `Open Setup Hub`.
  - Master Token Saver toggle now inspects all upstream components on activation and alerts the user if any upstream tool is missing rather than presenting a blanket success message.
- **Hardened Cross-Platform Terminal Commands & AI Installation Prompts**:
  - Replaced bash pipeline `||` fallback syntax with Windows PowerShell-safe conditional inspection (`if (Get-Command ... -ErrorAction SilentlyContinue) { ... } else { ... }`) across [omniroute-service.js](file:///d:/Software/token-saver-ide-plugin/extension/omniroute-service.js), [crw-service.js](file:///d:/Software/token-saver-ide-plugin/extension/crw-service.js), [lightpanda-service.js](file:///d:/Software/token-saver-ide-plugin/extension/lightpanda-service.js), and [codegraph-service.js](file:///d:/Software/token-saver-ide-plugin/extension/codegraph-service.js) to resolve terminal parser errors.
  - Aligned AI setup prompt generation and terminal commands in `RtkService.getInstallCommands` to match verified installation procedures for `omniroute` (`npm install -g omniroute`), `jevgraph` (`irm https://astral.sh/uv/install.ps1 | iex` + `uv sync --extra dev`), `CodeGraphContext` (`pip install -e .`), `fastcrw`, and `lightpanda`, ensuring accurate dedicated sub-folder naming and reliable one-click copy prompts.

## [1.14.7] - 2026-10-17
### Added & Improved
- **Interactive Initial Loading Overlay & Upstream Check Progress Bar**:
  - Implemented an animated backdrop-filtered loading overlay (`#initialLoadingOverlay`) that appears seamlessly upon dashboard initialization.
  - Features real-time sequential checking status indicators across all upstream GitHub integrations (`RTK`, `Headroom`, `Ponytail`, `Anti-Slop`, `OmniRoute`, `JevGraph`, `CodeGraph`, `fastCRW`, and `Lightpanda`).
  - Automatically transitions each upstream tag from checking (`pulse`) to verified (`✓`) or missing (`✗`) upon receiving the state data payload, followed by a graceful fade-out exit.
  - Added full light theme adaptation with high-contrast surfaces and refined box-shadow elevations.

## [1.14.6] - 2026-10-17
### Added & Improved
- **Universal Tool Management & Maintenance Rules (`/tool-management-rules`)**:
  - Bundled the `tool-management-rules` skill across package, workspace (`.agents/skills/tool-management-rules/`), and `SKILLS_MAP` for multi-IDE discovery.
  - Dynamically injects directory hierarchy standards (zero loose files in `<WORKSPACE_ROOT>`, dedicated tool sub-folders, shared multi-tool dependencies in `shared/`, flat `<SKILLS_DIR>/<skill-name>/SKILL.md`) and the 7-day automated weekly update check protocol (`update_check_state.json`) into AI installation prompts whenever a non-default install path is configured.
- **Setup Banner Naming & Missing Diagnostics Refinement**:
  - Renamed dashboard setup banner heading to **"Installation Required"** for clean universal scope across both CLI binaries and cloned upstream repositories.
  - Aligned parameter passing order in `copyAiInstallPrompt` command ensuring all missing components (`fastCRW`, `Lightpanda`, `Headroom`, etc.) and custom paths are accurately reflected.

### Fixed & Hardened
- **Cost Saved Model Preset Popover (`⚡`) Visibility & Stacking Order**:
  - Fixed lightning preset toggle button not opening model rate options due to `.show` / `.open` CSS state class parity.
  - Resolved popover rendering underneath neighboring metric cards and sections by enforcing active parent card stacking context elevation (`.metric-card.popover-active { z-index: 1000 !important; }`) and popover layer contract (`z-index: 9999`).

## [1.14.5] - 2026-10-17
### Added & Improved
- **Custom Upstream GitHub Install Directory**:
  - Added custom file path input and native folder picker (`Browse`) to the "CLI Installation Required" alert banner in the dashboard.
  - Automatically targets and creates dedicated sub-folders named after upstream repositories (`<installPath>/<repo-name>`) when cloning tools (`jevgraph`, `CodeGraphContext`, `crw`, `browser`, `ponytail`, `anti-slop`).
  - Integrated with `tokenSaver.upstreamInstallPath` setting, persisting paths across sessions and feeding dynamic destination paths into AI setup prompt generation and terminal install commands.
- **Light Theme Text Color Inversion**:
  - Enhanced all dashboard text, headings, badges, descriptions, and input elements with inverted high-contrast colors when switching to Light Mode, guaranteeing WCAG AA accessibility compliance.

## [1.14.4] - 2026-10-17
### Added & Improved
- **Header Action Button Prioritization**:
  - Reordered webview dashboard header actions so the master **`Token Saver ON / OFF`** switch is guaranteed to always be the first button on the far left, followed by **`RTK ON / OFF`** and the other upstream tool toggles.
- **RTK & Token Saver Deactivation Warning Protection**:
  - Added an interactive warning confirmation modal (`#rtkWarningModal`) and card impact notice alerting users of disabled features (shell command compression, AST knowledge graph queries, context compression) before deactivating RTK or Token Saver.

## [1.14.3] - 2026-10-17
### Fixed & Improved
- **Header Action Button Installation Status Guardrails**:
  - Fixed header action buttons (`CodeGraph`, `Headroom`, `Ponytail`, `Anti-Slop`, `OmniRoute`, `JevGraph`, `Hybrid Web`) showing `ON` even when underlying binaries or skills were not installed locally.
  - Header buttons now strictly require both configuration enabled **and** local installation/readiness before displaying `ON` (`btn-primary`).
  - When uninstalled or not synced, header buttons reliably display `OFF` (`btn-ghost`) and provide descriptive hover tooltips indicating the missing local installation.
- **Dedicated RTK (Rust Token Killer) CLI Core Card & Header Toggle**:
  - Restored dedicated `⚡ RTK (Rust Token Killer) CLI Core` card section in the dashboard immediately following IDE Rule Sync, with upstream link to `rtk-ai/rtk`, live status badge, and quick action triggers (`Terminal Scoreboard`, `RTK Doctor`, `Copy Install Cmd`, `Test Latency`).
  - Added dedicated header button (`toggleRtkBtn` -> `RTK ON` / `RTK OFF`) in the dashboard header alongside the Master Token Saver switch, allowing users to toggle RTK proxy mode with installed status verification.
- **RTK Deactivation Warning Confirmation & Impact Notice**:
  - Implemented an interactive warning confirmation modal (`rtkWarningModal`) that alerts users when clicking to turn RTK or Token Saver OFF from the header.
  - Clearly explains features that become disabled: suspension of shell command compression (loss of 60%–90% terminal token savings), deactivation of IDE AI agent rule directives (`.cursorrules`, `CLAUDE.md`, `copilot-instructions.md`, `AGENTS.md`), bypass of semantic AST knowledge graphs, and resulting higher LLM token burn.
  - Added a persistent informative callout banner inside the dedicated RTK section card summarizing the exact downstream impact of turning RTK off.

## [1.14.2] - 2026-10-17
### Added & Improved
- **Token Saver Master Switch**:
  - Rebranded master toggle from `Turn RTK ON / OFF` to `Turn Token Saver ON / OFF` in the dashboard header.
  - Enforced master switch invariant in rule synchronization (`SkillInstaller.syncRules`): if Token Saver master switch is **OFF**, all upstream directives and AI rule blocks are cleanly removed from all IDE target files (`.cursorrules`, `rtk.mdc`, `antislop.mdc`, `CLAUDE.md`, `copilot-instructions.md`, `antigravity-rtk-rules.md`, `AGENTS.md`), ensuring AI models will not undergo upstream solutions even if individual features remain enabled in settings.
- **Direct 1-Click Status Bar Toggle**:
  - Renamed status bar text from `RTK: OFF` to `Token Saver: OFF`.
  - When Token Saver is **OFF**, clicking the status bar item directly turns Token Saver **ON** without opening the dashboard.
  - When Token Saver is **ON**, clicking the status bar item directly turns Token Saver **OFF**.
- **Status Bar Tooltip Cleanup**:
  - Cleaned up hover tooltip header from `Token Saver (RTK) is ENABLED/DISABLED` to `Token Saver is ENABLED/DISABLED`.
  - Removed RTK version info line from the status bar tooltip to eliminate clutter.
- **Command Palette Updates**:
  - Renamed commands to `Toggle Token Saver Mode`, `Enable Token Saver`, and `Disable Token Saver`.

## [1.14.0] - 2026-10-17
### Added & Improved
- **fastCRW Hybrid Web Search & Scraping (`fastcrw/crw`)**:
  - Integrated local fastCRW engine for instant static markdown web scraping and search.
  - Converts raw HTML and JS-rendered DOMs into clean, condensed Markdown, cutting web research prompt tokens by **70%–90%**.
  - Added dedicated `/crw-search` AI agent skill and `CrwService` integration with automatic binary & server detection (`crw`, `crw-server`, `cargo`).
- **Lightpanda Browser Integration (`lightpanda-io/browser`)**:
  - Integrated ultra-fast headless browser engineered for AI agents with dynamic V8 JavaScript execution.
  - Added `LightpandaService` detecting native CLI, `@lightpanda/browser` npm package, and Docker instances.
  - Added Model Context Protocol (MCP) server launch (`lightpanda mcp`) and 1-click MCP configuration JSON export.
- **3-Tier Hybrid Web Routing & Architecture**:
  - Implemented automatic 3-tier hybrid web scraping waterfall:
    - **Tier 1 (Built-in Web Search)**: Fast discovery, URLs, and summaries.
    - **Tier 2 (fastCRW Local Engine)**: Instant token-optimized markdown extraction and scraping.
    - **Tier 3 (Lightpanda Browser via MCP)**: Dynamic JavaScript rendering, SPAs, and deep web extraction.
  - Added header action button (`Turn Hybrid Web ON/OFF`), dedicated webview dashboard section, and channel settings (`tokenSaver.hybridWebEnabled`, `tokenSaver.crwEnabled`, `tokenSaver.lightpandaEnabled`).
- **Holistic Dashboard & System Health Updates (9-Way Upstream Sync)**:
  - Added fastCRW and Lightpanda Browser to System Health diagnostics, Upstream Versions dropdown, 1-Click AI install prompt generator, Sync picker, and Uninstall picker.
  - Added official GitHub repository references in the dashboard footer for both fastCRW and Lightpanda.
  - Added quick update button `tokenSaver.updateFromOpenVsx` (🢁) on the Primary Sidebar title bar for 1-click extension updates.
- **Zero-Noise Latency Benchmarks Guardrail**:
  - Refactored upstream latency testing to ping only **installed** engines, silently omitting uninstalled tools to eliminate error banners and visual clutter.

## [1.13.0] - 2026-10-16
### Added & Improved
- **CodeGraphContext in System Health & Upstream Tracking**:
  - Integrated CodeGraphContext into System Health diagnostics checklist with live status indicators and inline actions (🤖 Ask AI, 🧬 Sync, 🗑️ Uninstall).
  - Added CodeGraphContext as the 7th layer in the interactive Upstream Versions dropdown with repository link, status badges, and version display.
  - Included CodeGraphContext in upstream latency benchmarking (`testLatency`) and AI agent installation prompt generator (`generateAiInstallPrompt`).
- **Uninstall Skills Pop-up Enhancements (Recycle Bin & Recovery)**:
  - Added native OS Recycle Bin / Trash support (`shell:RecycleBinFolder` on Windows, `~/.Trash` on macOS, `trash:///` on Linux) to prevent accidental data loss.
  - Added **"Open Recycle Bin"** action options directly inside confirmation modals and post-uninstallation notifications.
  - Added **"Recover Uninstalled Skills"** options (Global IDE, Project Workspace, and All) directly in the quick action pop-up window to 1-click restore all 31 agent skills without manual reinstallation.
  - Updated preset uninstallation options to cover all 31 chat commands, adding a dedicated preset for `CodeGraphContext Skills (2 Skills)`.
- **Documentation & UI Visual Assets**:
  - Added comprehensive guides for "Uninstall Skills" (with Recycle Bin recovery) and "Temporary Disable Skills" (Agent Quarantine Mode) in `README.md`.
  - Added visual walkthrough screenshots `resources/dashboard-uninstalledskillwindow.png` and `resources/dashboard-disableskillwindow.png`.

## [1.12.0] - 2026-10-16
### Added & Improved
- **CodeGraphContext Integration (`CodeGraphContext/CodeGraphContext`)**:
  - Integrated pre-indexed semantic AST & call graph engine for code files.
  - Slashes code exploration token consumption by up to **90%** by allowing AI agents to query pre-indexed symbols, call hierarchies, and dependencies instead of reading full source files.
  - Added dedicated AI agent skills: `/codegraph-query` (query semantic code graph) and `/codegraph-index` (build/refresh code knowledge graph).
  - Added continuous real-time graph auto-updater on code file save (`tokenSaver.codeGraphAutoUpdate`).
  - Added interactive CodeGraphContext card, index/query triggers, and real-time auto-update switch in the Webview Dashboard.
- **Mandatory Semantic Knowledge Graph First Policy (Dual-Graph Separation)**:
  - Enforced strict dual-graph separation across all IDE rule targets (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.windsurfrules`, `.clinerules`, `.github/copilot-instructions.md`, Antigravity rules):
    - **CodeGraphContext**: AI query engine for code files (`.ts`, `.js`, `.py`, `.rs`, `.go`, `.java`, `.cpp`, etc.).
    - **JevGraph**: AI query engine strictly for non-code files (`.md`, `.pdf`, `.docx`, `.txt` specs, PRDs, architectures).
  - Strict rule policy instructs AI agents to query semantic graphs first before falling back to full file reads.
- **7-Way Upstream GitHub Core Synchronization**:
  - Unified multi-engine management across 7 upstream open-source projects: **RTK**, **Headroom**, **Ponytail**, **Anti-Slop**, **OmniRoute**, **JevGraph**, and **CodeGraphContext**.
- **Webview Header & Footer Refinements**:
  - Added dedicated header button to toggle CodeGraph (`Turn CodeGraph ON/OFF`).
  - Fixed vertical position drift and aligned all header action buttons, timer dropdown, and window buttons with standardized 28px height.
  - Added upstream GitHub repository link for CodeGraphContext beside JevGraph in the dashboard footer.
  - Removed "Terminal Scoreboard" button from Quick Actions to declutter the dashboard.

## [1.11.0] - 2026-10-10
### Added & Improved

- **JevGraph Knowledge Graph Engine Integration (`chenmingtang830/jevgraph`)**:
  - Integrated evidence-backed candidate knowledge graph extraction from documents and technical specifications (PDF, DOCX, PPTX, text).
  - Slashes document ingestion token consumption by **80%–95%** compared to raw multi-page document dumps by converting inputs into schema-guided graphs with page-level evidence character spans.
  - Added dedicated AI agent skills: `/jevgraph-build` (builds schema-guided candidate knowledge graphs) and `/jevgraph-query` (extracts bounded subgraphs by query or entity for prompt injection).
  - Added 100% offline relation extraction provider (`keyword`) with zero external API calls and zero extra token cost, alongside `jev` gateway and `local` provider modes.
  - Added full IDE rule directives across all supported platforms (VS Code, Cursor, Windsurf, Cline, Roo Code, Claude Code, and Antigravity).
  - Added interactive JevGraph controls, provider selector, active doc demo builder, and System Health diagnostics in the Webview Dashboard.
- **6-Way Upstream GitHub Core Synchronization**:
  - Expanded release and lifecycle tracking to 6 upstream open-source engines: **RTK** (`rtk-ai/rtk`), **Headroom** (`headroomlabs-ai/headroom`), **Ponytail** (`DietrichGebert/ponytail`), **Anti-Slop** (`miqdadbadjuber/anti-slop`), **OmniRoute** (`diegosouzapw/OmniRoute`), and **JevGraph** (`chenmingtang830/jevgraph`).
  - Added multi-channel breakdown 6th channel (`jevgraph`) with visual token savings metrics.
  - Added granular sync and uninstallation support for JevGraph.

## [1.10.0] - 2026-10-05
### Added & Improved
- **Anti-Slop AI Quality Framework Integration (`miqdadbadjuber/anti-slop`)**:
  - Integrated full anti-slop quality filter & rule suite into the extension to stop generic AI slop, filler copywriting, and boilerplate code across all major AI agent IDEs.
  - Added 6 dedicated AI agent skills: `/antislop` (core router), `/antislop-ui` (spacing, hierarchy & typography), `/antislop-copywriting` (anti-AI writing patterns), `/antislop-human` (human & accessibility standards), `/antislop-layoutmobile` (responsive & tap target constraints), and `/antislop-code` (code comment hygiene).
  - Integrated automated WCAG contrast checker tooling (`contrast-check.py` and `contrast-mcp.py`).
  - Added interactive dashboard Anti-Slop controls with 4 execution modes (`during`, `after`, `ask`, `off`) and one-click GitHub sync.
- **Interactive Multi-Model ROI & Cost Savings Dashboard**:
  - Added comprehensive LLM ROI calculator (`/rtk-roi`, `/rtk-gain`) with model-level pricing comparisons for GPT-4o, Claude 3.5 Sonnet, Claude 3 Opus, Gemini 1.5 Pro, and DeepSeek V3.
  - High-fidelity visual token breakdown charts and live telemetry synchronization in the webview dashboard.
  - Enhanced responsive glassmorphism layout and interactive control panels.
- **5-Way Upstream GitHub Synchronization & Clean Purge Lifecycle**:
  - Unified multi-engine management across 5 upstream open-source projects: **RTK** (`rtk-ai/rtk`), **Headroom** (`headroomlabs-ai/headroom`), **Ponytail** (`DietrichGebert/ponytail`), **Anti-Slop** (`miqdadbadjuber/anti-slop`), and **OmniRoute** (`diegosouzapw/OmniRoute`).
  - Added granular uninstall and purge commands for individual upstream layers alongside complete clean wipe options (`tokenSaver.uninstallAllUpstream`).

## [1.9.0] - 2026-10-04
### Added & Improved
- **Visuals & Architectural Documentation**:
  - Added full end-to-end Mermaid architectural flowchart mapping multi-IDE rule synchronization, optimization engines, and LLM context reduction to `README.md`.
  - Updated latest high-fidelity dashboard overview and savings breakdown screenshot artifacts (`dashboard-preview.png` and `dashboard-breakdown.png`).
- **Open VSX & Package Metadata Refinement**:
  - Updated extension display title to **"Token Saver for VS Code & Agentic IDEs"**.
  - Refined description emphasizing mature upstream open-sourced token optimization solutions (RTK, Headroom, Ponytail, OmniRoute).
  - Synchronized upstream release configurations and distribution scripts.

## [1.8.0] - 2026-10-01
### Added & Improved
- **Apple Human Interface Design (HIG) Redesign**:
  - Completely redesigned the interactive webview dashboard using Apple Human Interface Guidelines and Liquid Glass material principles.
  - Implemented Apple semantic color palettes, SF typography with tabular numbers, macOS-style segmented controls, and fluid iOS/macOS toggle switches.
- **UI & Layout Optimizations**:
  - Unified the "Enable Rule" / IDE target button UI language with dark frosted glass styling matching terminal action buttons.
  - Added right-aligned, shortened binary path display in System Health diagnostics with hover tooltips for full file path inspection.
  - Enforced strict flex containment and text truncation to ensure Active & Synced status badges stay strictly within card bounds.
- **GitHub Sponsorship & Documentation**:
  - Added `.github/FUNDING.yml` configuration supporting direct Wise sponsorship (`https://wise.com/pay/me/terenceooit`).
  - Added new dashboard interface screenshots and breakdown visual previews to `README.md`.

## [1.7.0] - 2026-09-29
### Added & Improved
- **Full Ponytail & YAGNI Skills Suite**:
  - Expanded Ponytail ecosystem with dedicated AI agent skills: `/ponytail-audit` (repo-wide bloat & over-engineering audit), `/ponytail-review` (complexity & diff review), `/ponytail-debt` (shortcut & debt ledger tracker), `/ponytail-gain` (savings scoreboard), and `/ponytail-help` (command cheat sheet).
- **Comprehensive Agentic Skills System**:
  - Packaged 20 built-in skills for Antigravity, Claude Code, Cursor, Windsurf, Cline, and Roo Code covering RTK token elimination, Headroom context compression, and Ponytail brevity directives.
  - Added `/publishtokensaverlocal` skill for 1-click local `.vsix` packaging and internal distribution.
- **Enhanced Extension Webview & Automation**:
  - Updated webview dashboard actions, command bindings, and automated release scripts.

## [1.6.1] - 2026-09-29
### Added & Improved
- **Webview Dashboard Enhancements & Support**:
  - Integrated support tip link (`☕ Tip me @ Wise`) in the extension webview dashboard footer with custom styling.
  - Added project donation/tip link in `README.md`.
- **Release Automation & Documentation**:
  - Enhanced `publishtokensavernow` skill with automated changelog pre-flight guardrails, UTF-8 No-BOM guarantees, and full workspace staging checks.
  - Updated `CONTRIBUTING.md` architecture guide and development workflows.

## [1.6.0] - 2026-09-29
### Added & Improved
- **Comprehensive Documentation & Ecosystem Overhaul**:
  - Overhauled and updated `README.md` with complete documentation for all 15 Antigravity & AI agent slash commands (`/rtk-*`, `/ponytail`, `/publish*`).
  - Documented dual-engine architecture powered by **RTK Core** and **Headroom Context Compression**.
  - Added complete extension settings reference schema and configuration options.
- **Enhanced Packaging & Distribution Pipeline**:
  - Updated build and packaging automation to generate versioned VSIX distribution artifacts (`token-saver-rtk-ide-1.6.0.vsix`).
  - Synchronized internal distribution bundle in `latestvsixfile/token-saver-rtk-ide.vsix`.

## [1.5.2] - 2026-09-29
### Added & Improved
- **Dual Upstream Engine Integration (RTK + Headroom)**:
  - Added native support for **Headroom** (`headroomlabs-ai/headroom`) upstream alongside **RTK** (`rtk-ai/rtk`).
  - Added user configuration setting `tokenSaver.headroomEnabled` with interactive toggle control in the webview dashboard.
  - Upgraded **"Sync Upstream GitHub"** action to concurrently query releases from both `rtk-ai/rtk` and `headroomlabs-ai/headroom` with unified 1-click update support.
  - Added Headroom status telemetry to System Health diagnostics panel.
  - Updated multi-IDE rules and `/rtk-update` skill to incorporate Headroom context compression and CCR directives.

## [1.5.1] - 2026-09-29
### Added & Improved
- **VSIX Packaging & Verification**:
  - Updated latest internal `.vsix` distribution bundle with Ponytail, AST Outlining, and Compact Diff features.

## [1.5.0] - 2026-09-29
### Added & Improved
- **Full-Spectrum Token Saver Suite (Input + Output + Context)**:
  - Combined **RTK Core** (CLI input compression) with **Ponytail YAGNI philosophy** (output token reduction), **AST Symbol Outlining** (`/rtk-outline`), and **Compact Diffs** (`/rtk-diff`).
- **Ponytail Mode & Terse Agent Directives (`/ponytail`)**:
  - Added new `/ponytail [lite|full|ultra|off]` slash action and skill.
  - Slashes expensive output tokens (3-4x input cost) by banning unsolicited essays and enforcing standard library over bloat, shortest working diffs, and max 3-line explanations.
  - Multi-IDE rule synchronization automatically embeds Ponytail and Terse directives across Cursor, Windsurf, Cline, Claude Code, Copilot, Antigravity, and `AGENTS.md`.
- **AST / Symbol Outliner (`/rtk-outline` & `tokenSaver.generateAstOutline`)**:
  - Generates concise structural class/function signature outlines with line numbers, saving 80–95% context tokens vs reading whole files into context.
- **Compact Git Diff Context (`/rtk-diff` & `tokenSaver.runCompactDiff`)**:
  - Integrates single-line context (`rtk git diff -U1`), eliminating redundant unchanged code blocks and saving 50–70% of diff tokens.
- **Interactive Dashboard Controls**:
  - Added dedicated **🥋 Output & Context Token Saver** section in the webview dashboard with segmented mode selector (`[Off | Lite | Full | Ultra]`), Terse toggle, and Compact Diff toggle.
  - Added Quick Action buttons: `🌲 AST Symbol Outline` and `⚡ Compact Diff (-U1)`.

## [1.4.1] - 2026-09-29
### Added & Improved
- **Open VSX Marketplace Release Notes Synchronization**:
  - Synchronized full multi-version changelog metadata into package archive for seamless display on Open VSX and VS Code marketplaces.
  - Added release workflow validation to guarantee continuous changelog updates on every future version bump.

## [1.4.0] - 2026-09-29
### Added & Improved
- **Unified Modular Architecture**:
  - Centralized shared webview message handling, state synchronization, and HTML rendering into `extension/webview-helper.js`.
  - Streamlined both `SidebarProvider` (Activity Bar view) and `DashboardPanel` (Editor Tab) to use shared lifecycle logic.
- **Enhanced Glassmorphism UI & Styling**:
  - Polished responsive dashboard stylesheet (`dashboard.css`) with sleek dark mode, micro-animations, and fluid sidebar-to-editor adaptability.
  - Added dedicated Activity Bar vector icon (`resources/activity-icon.svg`) and high-resolution extension marketplace icon (`resources/icon.png`).
- **Interactive Multi-IDE Ecosystem Matrix**:
  - Seamless auto-detection and 1-click rule synchronization across VS Code (GitHub Copilot), Cursor (`.cursorrules` & `.mdc`), Windsurf (`.windsurfrules`), Cline/Roo Code (`.clinerules`), Claude Code (`CLAUDE.md`), Antigravity IDE, and `AGENTS.md`.
- **Flexible Auto-Refresh & Diagnostics**:
  - Custom minute-based auto-refresh timer with instant presets and live status bar telemetry.

## [1.3.2] - 2026-09-28
### Added & Improved
- **Custom Minute-Based Auto-Refresh Input**:
  - Replaced fixed-only timer intervals with a flexible minute input (`min`) allowing users to type custom refresh intervals (e.g. `1`, `2`, `5`, `10` minutes or fractions like `0.5`).
  - Added Enter key / Set button support, unit display, and one-click quick presets in minutes.
  - Corrected dropdown layering with elevated stacking contexts and viewport width clamping.
- **Auto-Detected Host IDE & Focused Sync Hub**:
  - Automatically detects the current IDE host environment (`Antigravity IDE`, `Cursor IDE`, `Windsurf IDE`, `VS Code (GitHub Copilot)`, `Cline / Roo Code`, `Claude Code`).
  - IDE Rules Hub dynamically focuses on the detected IDE host and displays only the active host's target options (e.g. Global & Workspace for Antigravity, `.cursorrules`/`.mdc` for Cursor, `.windsurfrules` for Windsurf).
  - Single-click sync button dynamically adapts to `⚡ Sync Rule` / `⚡ Sync All` for the detected IDE.
- **Sidebar Boundary & Overflow Hardening**:
  - Added flex-shrink constraints (`min-width: 0`) and text ellipsis truncation across IDE cards, badges, and headers for flawless rendering at default sidebar widths.

## [1.3.0] - 2026-09-28
### Added
- **Primary Sidebar Interactive Dashboard**:
  - Integrated a dedicated Activity Bar container with a minimalist meter/gauge icon (`resources/activity-icon.svg`) under the title **"RTK Token Saver"**.
  - Clicking the icon opens the **"Token Optimization"** interactive dashboard directly inside the Primary Sidebar.
  - Implemented `SidebarProvider` (`vscode.WebviewViewProvider`) with on-demand visibility-aware data loading and instant interaction response.
  - Added a **"Pop Out to Editor Tab"** (`⤢`) header toolbar and in-view button allowing seamless switching between compact sidebar view and full-width editor tab.
  - Fully responsive glassmorphic UI adapting effortlessly between narrow sidebar widths and wide editor panels.

## [1.2.1] - 2026-09-28
### Added
- **Simultaneous Dual-Mode Activation Out-of-the-Box**:
  - Automatically installs and configures both **Way 1 (Chat / Slash Commands: `/rtk-update`, `/rtk-savedtokenon`, `/rtk-savedtokenoff`, `/rtk-gain`)** and **Way 2 (Status Bar, Interactive Dashboard, & Multi-IDE Rule Sync)** simultaneously upon extension installation and startup.
  - Added `tokenSaver.autoInstallSkills` configuration option (default `true`) ensuring zero-friction setup for users in all supported AI agent ecosystems.
  - Multi-target skill installer now deploys to both global (`~/.gemini/config/skills/`) and workspace (`.agents/skills/`) roots.

## [1.2.0] - 2026-09-28
### Added
- **Universal Multi-IDE & AI Agent Support**:
  - **VS Code (GitHub Copilot)**: Automatic synchronization with `.github/copilot-instructions.md`.
  - **Cursor IDE**: Direct support for `.cursorrules` and modern `.cursor/rules/rtk.mdc`.
  - **Windsurf IDE (Codeium Cascade)**: Automatic rule management for `.windsurfrules`.
  - **Cline & Roo Code**: Automatic instructions configuration for `.clinerules`.
  - **Claude Code**: Direct workspace configuration via `CLAUDE.md`.
  - **Universal Agent Standard**: Automatic generation of `AGENTS.md`.
  - **Antigravity IDE**: Global (`~/.gemini/config/`) and workspace (`.agents/`) rules & skills.
- **Safe Block Delimiter Injection**:
  - Automatically merges RTK rules using `<!-- RTK_TOKEN_SAVER_START -->` ... `<!-- RTK_TOKEN_SAVER_END -->` markers so user custom instructions are never overwritten or corrupted.
- **Interactive Multi-IDE Ecosystem Hub**:
  - New interactive matrix in the Dashboard displaying real-time sync status for each agent target.
  - Per-IDE single-click sync/toggle buttons.
  - 1-Click "Sync All Targets" action.
- **Cross-Platform Multi-IDE Automation Scripts**:
  - Added `scripts/install-all-ide-rules.ps1` and `scripts/install-all-ide-rules.sh` for multi-IDE CLI deployment.

## [1.1.0] - 2026-09-28
### Added
- **Interactive Glassmorphic Webview Dashboard**:
  - Live Token Savings Counter with animated meters and breakdown.
  - Compression Efficiency Gauge (%) and Estimated Dollar Savings ($).
  - Per-tool visual savings charts (`git`, `cargo`, `npm`, `pytest`, `vitest`, `rg`, `ls`, etc.).
  - Action center with 1-click Antigravity skill sync, GitHub release update check, and proxy latency test.
  - Real-time diagnostics panel displaying binary path, version, and target scopes.
- **Upstream GitHub RTK Core Sync & Updater**:
  - Automatic non-intrusive update checks against official GitHub releases (`https://github.com/rtk-ai/rtk`).
  - 1-click update trigger for Windows (`winget`), macOS (`brew`), and Linux (`curl`).
- **1-Click Global Antigravity Skills & Rules Sync**:
  - Direct extension command (`Token Saver: 1-Click Install Antigravity Skills (/rtk-*)`) to install skills into `~/.gemini/config/skills/` without manual terminal scripts.
  - Global rule synchronization across all Antigravity IDE projects.
- **Dynamic Status Bar with Live Metrics**:
  - Real-time token counter: `$(zap) RTK: 48.2k saved (72%)` with rich markdown hover tooltips.
  - 30-second background polling cycle.

## [1.0.0] - 2026-09-28
### Added
- **Way 1 (Chat & Slash Commands)**:
  - `/rtk-savedtokenon`: Automatically prefixes AI terminal commands with `rtk` to compress verbose outputs.
  - `/rtk-savedtokenoff`: Reverts back to normal direct command execution.
  - `/rtk-gain`: Displays live RTK token savings metrics and efficiency scoreboard.
  - Installation scripts (`install-skills.ps1` and `install-skills.sh`) for global Antigravity configuration.
- **Way 2 (OpenVSX / VS Code Extension)**:
  - Status bar indicator `$(zap) RTK: ON` / `$(circle-slash) RTK: OFF` with instant toggle on click.
  - Commands registered in Command Palette (`Token Saver: Toggle`, `Enable`, `Disable`, `Show Savings`, `Install CLI`).
  - Automatic workspace `.agents/rules/antigravity-rtk-rules.md` synchronization.
- OpenVSX publishing pipeline (`publish-openvsx.yml`).