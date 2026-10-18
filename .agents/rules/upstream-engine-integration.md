---
trigger: always_on
---

# Upstream Engine Integration & Latency Guardrails Rule

Whenever a new upstream engine or external tool (e.g., `fastcrw/crw`, `CodeGraphContext`, `JevGraph`, `Headroom`, `Anti-Slop`, `OmniRoute`, `RTK`) is introduced or updated in the Token Saver IDE Plugin:

## 1. Holistic Dashboard Integration (All 8 Surfaces Required)
Every upstream engine integration must be fully reflected across all 8 related dashboard surfaces:
1. **Header Action Toggle Button**: Dedicated toggle switch (`Turn <Tool> ON / OFF`) in the webview dashboard header.
2. **Setup Alert Banner**: Dynamic chip in the notification banner with status and 1-click AI install prompt generator (`Copy AI Prompt`).
3. **Dedicated Dashboard Section & Quick Action Triggers**: Standalone card section with interactive action buttons and quick triggers.
4. **Multi-Channel Savings Breakdown Navigation**: Navigation tabs and distribution breakdown weights for token/bandwidth savings telemetry.
5. **System Health Diagnostics Row**: Status badge (Active/Inactive), AI install prompt copy button, sync trigger, and uninstall picker entry.
6. **Upstream Versions Dropdown Listing**: Version detection and live dropdown tracking in the upstream version inspector.
7. **Upstream Sync & Uninstall Pickers**: Inclusion in both `showSyncPicker` and `showUninstallPicker` quickpick dialogs.
8. **Footer Upstream Reference Links**: Verified official GitHub repository link in `.footer-links` and panel card `.repo-badge-link`.

## 2. Zero-Noise Latency Benchmarks
- The **Test Upstream Latencies** action must selectively ping and display **only installed** upstream components.
- Uninstalled or optional tools that are not set up must be silently omitted/ignored so users never encounter failed pings, red error states, or visual clutter for tools they do not use.

## 3. Footer Version Number Invariant
- The current plugin release version must **always** be rendered immediately beside "Token Saver" in front of "• GitHub" in the dashboard footer (e.g. `Token Saver v1.13.0 • GitHub`), the plugin release version follow **latest** version on **CHANGELOG.md**.

## 4. Webview State Payload Integrity & Pre-Flight Contract
- **Atomic State Gathering Contract**: In `extension/webview-helper.js` (`getLatestStateData`), every upstream component MUST have its check resolved and defined (e.g. `check`, `headroomCheck`, `ponytailCheck`, `antiSlopCheck`, `omniStatus`, `jevGraphCheck`, `codeGraphCheck`, `crwCheck`, `lightpandaCheck`) before constructing `pluginStatus` or the return dictionary.
- **Fail-Safe Fallbacks**: Always safeguard dictionary lookups with fallback defaults so an unhandled check never aborts the webview pipeline.
- **Mandatory Pre-Flight Execution Test**: After adding or modifying any engine integration in `webview-helper.js` or `rtk-service.js`, agents MUST execute a headless node runner verifying that `WebviewHelper.getLatestStateData()` resolves cleanly without `ReferenceError` or uncaught rejections before declaring completion.

## 5. Cross-IDE Universal Skill Discovery & Lifecycle Invariant
To ensure Token Saver remains universal for every user across all market IDEs (Antigravity, Cursor, Windsurf, Claude Code, Cline, Roo Code, VS Code Copilot):
- **Universal Multi-Root Discovery**: Any skill discovery function (`listInstalledSkills`, `listDisabledSkills`) MUST scan both standalone directories (`skills/`) AND plugin packages (`plugins/*/skills/`) across all major IDE roots (Gemini/Antigravity, Cursor, Claude Code, and Universal Agent configs).
- **Exact Path Deletion Contract**: Uninstallation and quarantine/disable actions MUST resolve and operate on the exact detected disk path of each skill (`item.path`) rather than assuming a single flat folder.
- **Clear Provenance Tagging**: QuickPick dialogs must always annotate skills with their origin scope and package source (e.g. `[global • plugin: <name>]`, `[workspace • standalone]`).

## 6. Webview Popover & Dropdown Stacking Context Invariant
To prevent floating popovers, menus, and dropdowns from failing to display or being submerged beneath neighboring cards:
- **State Class Parity**: Any floating element toggled in JavaScript (`.show` or `.open`) MUST be matched in CSS to support both `.open` and `.show` state classes (e.g. `.cost-presets-popover.open, .cost-presets-popover.show { display: block; }`).
- **Parent Stacking Context Elevation**: Whenever a popover or dropdown opens from within a container or card (such as `.metric-card` or `.panel-card`), the parent container MUST be assigned an elevated `z-index` (e.g. `.metric-card.popover-active { z-index: 1000 !important; }`) so that subsequent DOM siblings do not render on top of the popover.
- **Top Layer z-index Contract**: Floating popover bodies must define an explicit elevated `z-index` (e.g. `z-index: 9999`) to guarantee clearance over backdrop filters and neighboring card overlays.

## 7. Dynamic Local & Virtualenv Upstream Discovery Invariant
To ensure tools installed in custom locations or managed via local virtual environments are properly detected:
- **Candidate Directory Inspection**: Upstream detection checks (`checkInstalled()`) MUST NOT rely solely on global OS `PATH`. They must query `getCandidateDirs()`, inspecting:
  1. User-configured custom path (`tokenSaver.upstreamInstallPath`)
  2. Workspace sibling directories (e.g., `../<tool>`, `D:\Software\AI Agent Space\<tool>`)
  3. User home configuration directories (e.g., `~/.config/<tool>`)
- **Virtualenv & Binary Execution Resolution**: Detection must resolve local executables (`.venv/Scripts/<tool>.exe` or `.venv/bin/<tool>`) and project definitions (`uv.lock`, `pyproject.toml`, `Cargo.toml`, `package.json`), recording both the exact executable path and working directory (`cwd`) on the resolved state object.

## 8. Missing Upstream Activation Guardrail Contract
- **No Blanket "Enabled" Messages**: Toggling an upstream engine ON must verify installation status before presenting a confirmation message.
- **Actionable Missing Upstream Warning**: If the tool is missing or uninstalled, display an actionable warning notification/modal via `promptMissingUpstream` providing:
  - `🤖 Ask AI (Copy Prompt)`
  - `⭮ Fetch / Sync from GitHub`
  - `⚡ Auto-Run in Terminal`
  - `Open Setup Hub`

## 9. Top-Level Service Import Hygiene & Comprehensive Pre-Flight Test
- **Module-Level Core Imports**: Any service file providing `checkInstalled()` or filesystem resolution MUST import `path`, `fs`, and `child_process` at the top of the file rather than relying on nested or deferred requires.
- **Strict Variable Declaration Invariant**: Whenever adding or modifying configuration flags in `SkillInstaller.getCombinedRuleText()`, all variables MUST be explicitly declared with `let` or `const`. Never assign undeclared variables, which throw runtime `ReferenceError`s in strict mode.
- **Comprehensive Headless Pre-Flight**: The pre-flight node test runner must execute:
  1. `Promise.all([ ...services.map(s => s.checkInstalled()), WebviewHelper.getLatestStateData(...) ])`
  2. `SkillInstaller.getCombinedRuleText()` to verify zero runtime `ReferenceError`s or unhandled rejections during rule generation.

## 10. Extension Entrypoint (`extension.js`) Syntax & Subscription Registration Contract
Whenever registering new commands, event listeners, or upstream features in `extension/extension.js`:
1. **Atomic Command Block Isolation**: Every `vscode.commands.registerCommand` callback MUST be completely closed with its own closing brace and parenthesis (`);`) before declaring the next command. Never interleave command registrations.
2. **Subscription Parity**: Every declared command identifier registered in `extension.js` MUST:
   - Be defined and bound to a `const <name>Cmd` variable.
   - Be pushed into `context.subscriptions.push(...)`.
   - Have a corresponding command entry in `package.json` (`contributes.commands`).
3. **Mandatory Entrypoint Syntax Check Before Packaging**:
   Agents MUST run `node --check ./extension/extension.js` immediately after modifying `extension.js` and BEFORE executing the VSIX package script or declaring task completion, ensuring zero unclosed callback scopes or syntax errors.

## 11. On-Demand VSIX Packaging Guardrail (Zero Auto-Recompilation)
- **No Automatic VSIX Compilation**: AI agents MUST NOT automatically execute `scripts/package-vsix.ps1`, `npm run package`, or compile `.vsix` files during routine code edits, bug fixes, or test iterations.
- **Strict User Intent Gate**: VSIX compilation and packaging must strictly be deferred until the user explicitly invokes `/publishtokensaverlocal` or `/publishtokensavernow`.
- **Pre-Flight Validation Without Packaging**: Routine changes must be validated using direct syntax verification (`node --check <file>`) and headless tests without rebuilding or overwriting `latestvsixfile/token-saver-rtk-ide.vsix`.
