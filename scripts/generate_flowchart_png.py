import urllib.request
import base64
import json

mermaid_code = """flowchart TD
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
"""

encoded = base64.b64encode(mermaid_code.encode("utf-8")).decode("ascii")
url = f"https://mermaid.ink/img/{encoded}?bgColor=1e1e2e"

print(f"Requesting from {url[:50]}...")
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
        with open("resources/flowchart-architecture.png", "wb") as f:
            f.write(data)
        print(f"SUCCESS: saved {len(data)} bytes to resources/flowchart-architecture.png")
except Exception as e:
    print("Direct endpoint failed, trying default theme without bgColor param:", e)
    url_fallback = f"https://mermaid.ink/img/{encoded}"
    req_fallback = urllib.request.Request(url_fallback, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req_fallback, timeout=30) as resp:
        data = resp.read()
        with open("resources/flowchart-architecture.png", "wb") as f:
            f.write(data)
        print(f"SUCCESS with fallback: saved {len(data)} bytes to resources/flowchart-architecture.png")
