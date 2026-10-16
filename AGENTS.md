<!-- RTK_TOKEN_SAVER_START -->
# RTK Token Saver Rule (agents)

## RTK (Rust Token Killer) Optimization Rule
Prefix every shell/terminal execution command with `rtk`:
- `rtk git status`, `rtk git diff`, `rtk git log -n 5`
- `rtk npm test`, `rtk npm run build`, `rtk pnpm test`, `rtk yarn test`
- `rtk cargo check`, `rtk cargo test`, `rtk cargo build`
- `rtk pytest`, `rtk vitest`
- `rtk ls src/`, `rtk tree -L 2`, `rtk rg "pattern"`

Keep the prefix inside chains: `rtk git add . && rtk git commit -m "msg"`.
Commands RTK has no filter for run as-is, so the prefix is always safe.

### Output & Token Optimization
Command output is condensed to save 60-90% LLM context window tokens while preserving every critical signal, error, and exit code.
- `rtk gain` / `rtk gain --history` - View token savings scoreboard.
- `rtk proxy <cmd>` - Run a command unfiltered if raw output is strictly needed.
- `RTK_DISABLED=1 <cmd>` - Skip RTK for one command.

## fastCRW Hybrid Web Search & Scraping Policy (Upstream: fastcrw/crw)
- **Hybrid Search Workflow:** For web research and page reading, autonomous agents should prioritize using local fastCRW (`crw search`, `crw scrape`, or `http://127.0.0.1:3000`) in combination with the IDE's built-in web search.
- **Token Optimization on Web Content:** fastCRW converts raw HTML, JS-rendered DOMs, and heavy web pages into clean, condensed Markdown before injecting into LLM context, preventing web clutter and saving 70-90% context tokens.
- **Zero-Failure Fallback:** When a site blocks generic HTTP requests or returns Cloudflare challenges, route via fastCRW headless browser extraction.

## Mandatory Semantic Knowledge Graph First Policy (Token Saver Enforcement)
Autonomous AI agents in ANY IDE MUST ALWAYS query the pre-indexed semantic knowledge graphs to provide answers BEFORE falling back to raw file reads that waste prompt tokens:

### 1. Code-Based Files -> CodeGraphContext (Upstream: CodeGraphContext/CodeGraphContext)
- **Code Query Engine:** For all code architecture, symbol definitions, function signatures, call hierarchies (callers/callees), class inheritance, and module dependencies, AI agents MUST query the CodeGraphContext index (/codegraph-query, `cgc query`, `cgc find`, or CodeGraphContext MCP tools) FIRST.
- **Zero-Waste Fallback:** NEVER dump or read entire source code files or directory trees into LLM prompt context when answering code questions. Only fall back to localized file reads (and then only targeted slices) if the knowledge graph query does not provide sufficient detail.
- **Live Synchronization:** The project code graph is continuously kept updated via background incremental sync / `cgc watch` / on-save triggers.

### 2. Non-Code Files -> JevGraph (Upstream: chenmingtang830/jevgraph)
- **Document Query Engine ONLY:** JevGraph is strictly designated for non-code files (documentation, Markdown specs, PRDs, PDFs, Word docs `.docx`, slides `.pptx`, text `.txt`).
- **Bounded Evidence:** When ingesting large specs, PRDs, PDFs, or architectural documentation, build or query bounded evidence-backed knowledge graphs (/jevgraph-build, /jevgraph-query) with character-level page maps instead of loading raw long documents into prompt context.
- **Strict Separation:** NEVER use JevGraph for source code AST indexing; code files are strictly handled by CodeGraphContext.


## Headroom Context Compression (Upstream: headroomlabs-ai/headroom)
- Utilize Headroom context compression and Compress-Cache-Retrieve (CCR) for heavy JSON structures, file reads, and tool payloads to minimize prompt tokens.


## Anti-Slop Filter & Quality Rules (Upstream: miqdadbadjuber/anti-slop)
Follow Anti-Slop rules to prevent generic AI slop in generated UI, copy, and code comments (Mode: DURING):
- **Filter, Not Style Guide:** Run purpose tests before aesthetic choices (reject ungrounded neon glows, fake metrics, generic sparkle badges).
- **Liveliness & Grounding:** Rely on `DESIGN.md` or explicit brief for design soul; enforce WCAG AA human accessibility.
- **Dedicated Skills:** Read `skills/antislop/SKILL.md` (core), `skills/antislop-ui/SKILL.md`, `skills/antislop-copywriting/SKILL.md`, `skills/antislop-human/SKILL.md`, `skills/antislop-layoutmobile/SKILL.md`, `skills/antislop-code/SKILL.md` when performing relevant tasks.


## Output & Generation Token Saver Rule (Ponytail Mode: FULL)
- **YAGNI & Shortest Diff:** Only write code that must exist. Reach for standard library before custom code or new dependencies. Shortest working diff wins.
- **Terse Responses:** Code first. At most 3 short lines of explanation: what was skipped, when to add it. No essays, no unsolicited design tours, no feature walkthroughs.

## Terse Agent Directives
- Eliminate pleasantries, greetings, and conversational filler. Provide direct answers and actionable code.
- Avoid reprinting unchanged code blocks. Use targeted search/replace blocks or concise snippets.

## Context Optimization (Compact Diffs & Outlines)
- Inspect git changes using compact single-line diffs: `rtk git diff -U1` instead of wide multi-line context.
- When exploring codebases, inspect function signatures / AST outlines (/rtk-outline) before reading entire files into context.

## Upstream Engine Integration & Latency Guardrails Standards
Whenever a new upstream engine or external tool (e.g. `fastcrw/crw`, `CodeGraphContext`, `JevGraph`) is introduced or updated:
1. **Holistic Dashboard Integration (8 Surfaces Required)**:
   - Header action toggle button (`Turn <Tool> ON / OFF`)
   - Setup alert banner (missing chips + AI install prompt generator)
   - Dedicated dashboard section & Quick Action triggers
   - Multi-channel savings breakdown navigation tabs & distribution weights
   - System Health diagnostics row with status, AI install prompt, sync, and uninstall actions
   - Upstream versions dropdown listing
   - Upstream Sync Picker (`showSyncPicker`) and Uninstall Picker (`showUninstallPicker`)
   - Footer upstream reference links
2. **Zero-Noise Latency Benchmarks**: "Test Upstream Latencies" must selectively ping and display only **installed** upstream components, silently omitting/ignoring uninstalled tools so users never see failed pings or clutter for optional tools.
3. **Footer Version Number Invariant**: The current plugin release version must always be presented beside "Token Saver" in front of "• GitHub".

<!-- RTK_TOKEN_SAVER_END -->

