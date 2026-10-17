---
name: tool-management-rules
description: >-
  Standard workspace hierarchy and maintenance rules for tools, skills, and libraries across any IDE or user environment.
  Enforces zero-loose-files policy, sub-folder arrangement for shared multi-tool dependencies,
  configurable root directory resolution, and mandatory weekly update checks before tool execution.
---

# Universal Tool Workspace Management & Maintenance Rules

These guidelines are permanently active whenever installing, configuring, or running tools, scripts, and agent helpers in the user's workspace or agent tool root directory.

---

## 1. Environment & Path Resolution

To support any operating system (Windows, macOS, Linux), any user profile, and any IDE (Cursor, VS Code, Antigravity, Windsurf, Cline, Roo Code, etc.), paths must be dynamically resolved rather than hardcoded.

### Base Directory Resolution
1. **User / Environment Variable Override (Highest Priority)**:
   - Check `$AGENT_TOOLS_ROOT` or `$AI_WORKSPACE_DIR` if defined.
2. **Project / Workspace Level**:
   - The active project root or designated tools folder (e.g., `./tools/`, `./agents/`, or `<project_root>/`).
3. **User Profile Default (System Fallback)**:
   - Windows: `%USERPROFILE%\AI-Tools\` or `%USERPROFILE%\.gemini\` / `%USERPROFILE%\.cursor\`
   - macOS / Linux: `$HOME/ai-tools/` or `$HOME/.config/<ide>/`

In the rules below, `<WORKSPACE_ROOT>` denotes whichever base directory has been selected or configured by the user.

---

## 2. Directory & File Hierarchy Standard

1. **Zero Loose Files in Workspace Root**:
   - `<WORKSPACE_ROOT>/` must **never** contain loose scripts (`.py`, `.js`, `.sh`), configuration files (`.env`, `.json`), raw logs, compiled bytecode caches (`__pycache__`, `.pytest_cache`), or virtual environments (`venv`, `.venv`).
   - Every file must reside inside a dedicated tool sub-folder or the `shared/` sub-folder.

2. **Standalone Tools**:
   - Each distinct tool or standalone application receives its own isolated sub-folder:
     `<WORKSPACE_ROOT>/<tool-name>/` (e.g., `<WORKSPACE_ROOT>/browser-use/`, `<WORKSPACE_ROOT>/fastcrw/`, `<WORKSPACE_ROOT>/clone-website/`).
   - Each tool must manage its own local dependencies or virtual environment in its respective folder.

3. **Shared Configurations & Multi-Tool Dependencies**:
   - Shared multi-tool dependencies, shared virtual environments, bridge scripts, and model routers must be organized inside a descriptive sub-folder under `shared/`:
     `<WORKSPACE_ROOT>/shared/<domain-or-tool-combination>/`
   - Example:
     `<WORKSPACE_ROOT>/shared/stagehand-fastcrw/`
     contains shared `.env`, `update_checker.mjs`, and `browser_mode.json`.

4. **Universal Skills Location Standard**:
   - All agent skills must be placed directly at `<SKILLS_DIR>/<skill-name>/SKILL.md`.
   - **Flat Directory Requirement**: Never nest skills inside category sub-folders, as IDE slash menus and agent skill discoverers require a flat 1-level skill directory structure (`<SKILLS_DIR>/<skill-name>/SKILL.md`).
   - **Cross-IDE Linkage & Custom Paths**:
     - When skills are maintained in an external or custom directory (e.g., `<WORKSPACE_ROOT>/skills/`), link them into the active IDE's native skills discovery directory using a directory junction / symlink:
       - **Windows**: `mklink /J "<IDE_SKILLS_PATH>" "<WORKSPACE_ROOT>\skills"`
       - **macOS / Linux**: `ln -s "<WORKSPACE_ROOT>/skills" "<IDE_SKILLS_PATH>"`
     - **Common IDE Skills Discovery Paths**:
       - Antigravity / Gemini: `<user_config>/skills` (e.g., `~/.gemini/config/skills`)
       - Cursor: `<user_home>/.cursor/rules` or project `.cursor/skills`
       - VS Code / Copilot: project `.github/copilot-instructions/` or extension root
       - Claude / Cline / Roo Code: `<user_home>/Library/Application Support/...` or workspace `.roomodes` / `.cline/`

---

## 3. Automated Weekly Update Check Protocol

Whenever a tool or script in `<WORKSPACE_ROOT>` is executed by an agent or user action:
1. **Interval**: Perform an upstream update check exactly **once every 7 days**.
2. **State Persistence**: Track the last check timestamp in an `update_check_state.json` file inside the tool or shared sub-folder.
   ```json
   {
     "last_check_timestamp": 1729177200,
     "tool_version": "1.2.0",
     "status": "up-to-date"
   }
   ```
3. **Execution Behavior**:
   - If fewer than 7 days have elapsed since `last_check_timestamp`, bypass the check immediately with zero delay.
   - If 7 days or more have elapsed, query upstream (PyPI, npm, GitHub repository tags/releases) for updates, install them, and record the new timestamp before completing the task.
   - Any newly installed tool must automatically implement or hook into this 7-day update check protocol without requiring explicit user prompting.
