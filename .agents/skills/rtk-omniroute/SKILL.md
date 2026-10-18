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
   - **Target Model:**
     - **`auto/coding:free`** (Recommended Default): 100% Zero-Cost Guarantee strictly pooling free-tier providers (pauses if free quota exhausted).
     - **`auto/coding`**: Uninterrupted Vibe Coding (prefers free models, auto-fails over across paid/pooled credits).
   - **Token Compression:** Enable `RTK -> Caveman` in OmniRoute Web Dashboard (`http://localhost:20128` → **Context & Cache → Compression**).

## 3. IDE Configuration Snippets

### Cursor IDE
- Settings → Models → OpenAI API Key → Override OpenAI Base URL: `http://localhost:20128/v1`
- API Key: `omniroute`
- Model: `auto/coding:free` (or `auto/coding`)

### Cline / Roo Code
- Settings → Provider: `OpenAI Compatible`
- Base URL: `http://localhost:20128/v1`
- API Key: `omniroute`
- Model ID: `auto/coding:free` (or `auto/coding`)

### Claude Code CLI
- `npx -y omniroute setup-claude`
- Or run with: `export ANTHROPIC_BASE_URL="http://localhost:20128/v1"` (Windows: `$env:ANTHROPIC_BASE_URL="http://localhost:20128/v1"`)

### Antigravity IDE (Agent-Routed Gateway)
- **Direct UI Dropdown Workaround**: Antigravity IDE's native chat model dropdown does not directly support entering custom model server URLs. Instead, connect via **1-Click AI Agent Prompt** or prompt your Antigravity agent:
  > *"Route my coding tasks and completions through local OmniRoute Gateway at `http://localhost:20128/v1` (API key `omniroute`). Use model `auto/coding:free` for zero-cost free-tier coding, or `auto/coding` for uninterrupted fallback. Enable 'RTK -> Caveman' compression in OmniRoute dashboard."*
- Leverage `/rtk-omniroute` directly in chat to view active routing, model quota health, or trigger failover.

### VS Code (Continue Extension)
- Add an OpenAI-compatible model entry for `auto/coding:free` (or `auto/coding`) pointing to `http://localhost:20128/v1` with API key `omniroute` in `~/.continue/config.json`.

