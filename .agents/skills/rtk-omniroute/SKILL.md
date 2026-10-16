---
name: rtk-omniroute
description: >
  OmniRoute AI Gateway & Smart Model Router for Vibe Coders.
  Activate when the user types /rtk-omniroute, /omniroute, "omniroute", "ai router", "model gateway",
  or asks how to route AI requests, avoid rate limits, or connect Cursor/Cline/Claude to OmniRoute.
---

# OmniRoute AI Gateway & Smart Router (/rtk-omniroute)

OmniRoute is an open-source, local AI gateway and quota-aware router running at `http://localhost:20128/v1`. It unifies access across 290+ AI providers with automatic fallback, token compression, and rate-limit immunity.

## 1. Quick Start & Gateway Control

- **Start Local Gateway:** Run `npx -y omniroute` (or `omniroute`). Gateway listens on port `20128`.
- **Web Dashboard:** Open `http://localhost:20128` to configure API keys (Gemini, DeepSeek, OpenAI, Claude, OpenRouter, Groq).
- **Run Diagnostics:** `omniroute doctor`
- **Enable / Disable via Settings:** Toggle user setting `tokenSaver.omniRouteEnabled` (or use command `tokenSaver.toggleOmniRoute`).
- **Uninstall:** Use command `tokenSaver.uninstallOmniRoute` (or `npm uninstall -g omniroute`).

## 2. Vibe Coder 3-Step Setup

1. **Launch:** Run `npx -y omniroute` in terminal.
2. **Add Keys:** Go to `http://localhost:20128` and add your free or paid provider API keys.
3. **Connect Your IDE:**
   - **Base URL:** `http://localhost:20128/v1`
   - **API Key:** `omniroute` (or dashboard auth password)
   - **Models:** `claude-3-7-sonnet`, `gpt-4o`, `deepseek-r1`, `gemini-2.5-pro`

## 3. IDE Configuration Snippets

### Cursor IDE
- Settings → Models → OpenAI API Key → Override OpenAI Base URL: `http://localhost:20128/v1`
- API Key: `omniroute`

### Cline / Roo Code
- Settings → Provider: `OpenAI Compatible`
- Base URL: `http://localhost:20128/v1`
- API Key: `omniroute`

### Claude Code CLI
- `npx -y omniroute setup-claude`
- Or run with: `export ANTHROPIC_BASE_URL="http://localhost:20128/v1"` (Windows: `$env:ANTHROPIC_BASE_URL="http://localhost:20128/v1"`)

### Antigravity & VS Code Continue
- Point OpenAI-compatible base URL to `http://localhost:20128/v1`.

