---
name: codegraph-index
description: >
  Index, update, or watch the workspace code repository with CodeGraphContext (Upstream: CodeGraphContext/CodeGraphContext).
  Builds and maintains the local semantic AST property graph (Tree-sitter & SCIP) so AI assistants always query fresh context.
  Activate when the user types /codegraph-index, /cgc-index, "index code graph", "watch code graph",
  or asks to build or refresh the code knowledge graph.
argument-hint: "[workspace_path]"
license: MIT
---

# CodeGraphContext Indexer & Watcher (/codegraph-index)

Indexes source code files into a local semantic property graph (KùzuDB / FalkorDB backend) to give AI agents immediate structural intelligence.

### Execution Commands:
- Index active workspace:
  `cgc index`
- Force full re-index:
  `cgc index --force`
- Start continuous filesystem watcher to keep graph updated on every file change:
  `cgc watch`
- Launch MCP Server for AI assistants:
  `cgc mcp start`
