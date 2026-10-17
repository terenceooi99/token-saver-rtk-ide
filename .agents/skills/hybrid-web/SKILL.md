---
name: hybrid-web
description: >
  Unified 3-Tier Hybrid Web Research & Scraping Engine (fastCRW + Lightpanda Browser).
  Follows a strict 3-tier routing waterfall: Tier 1 built-in search -> Tier 2 fastCRW instant markdown -> Tier 3 Lightpanda local V8 JS execution via MCP.
  Saves 70-90% prompt tokens on web research.
  Activate when the user types /hybrid-web, /lightpanda, /crw-search, /crw-scrape, "scrape url", "browse page", or asks to perform web research.
argument-hint: "<url_or_query>"
license: MIT
---

# 3-Tier Hybrid Web Research & Scraping Engine (/hybrid-web)

When your IDE agent receives a task requiring web research or extraction, it follows this strict routing logic:

### 1. Discovery (Tier 1 - Default Search):
- The agent uses its built-in search tool (`search_web` / native search) to find target URLs or documentation links.

### 2. Fast Extraction (Tier 2 - fastCRW):
- The agent attempts to fetch the URL using fastCRW (`crw scrape <url>` or `http://127.0.0.1:3000`).
- If the page is server-rendered (like a blog, GitHub README, or docs site), fastCRW instantly grabs clean Markdown/text, saving 70-90% context tokens without JS engine overhead.

### 3. Deep Dynamic Rendering (Tier 3 - Lightpanda Local via MCP):
- If fastCRW returns empty content, a rendering error, or hits a client-side JavaScript wall (e.g., a React/Vue SPA app or login-gated dashboard), the agent automatically falls back to Lightpanda Local via MCP (`lightpanda mcp`).
- Lightpanda executes the JS via V8 and feeds a clean Accessibility Tree or Markdown back into the IDE context window using ~10x less memory than headless Chrome.

### CLI & MCP Commands:
- Scrape URL using fastCRW: `crw scrape <url>`
- Start local fastCRW server: `crw serve --port 3000`
- Start Lightpanda MCP Server: `lightpanda mcp --port 8000`
- Run Lightpanda MCP via npx: `npx @lightpanda/browser mcp`
