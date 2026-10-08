---
name: jevgraph-query
description: >
  Inspect, query, or outline evidence-backed relations from a generated JevGraph knowledge graph or Cypher export.
  Saves 85-95% of prompt tokens vs reading raw 50-100 page document specs into LLM context.
  Activate when the user types /jevgraph-query, /jevgraph-inspect, "query graph", "inspect architecture graph",
  or asks to verify entity relations and page evidence.
argument-hint: "<graph_json_or_cypher_file>"
license: MIT
---

# JevGraph Knowledge Graph Inspector (/jevgraph-query)

Queries and inspects compact entity-relation subgraphs, page mappings, and character-level evidence windows from generated JevGraph runs.

## Efficient Querying Patterns
1. **Inspect High-Level Entities and Types:**
   Inspect entity lists without loading entire raw text files.
2. **Trace Page-Level Evidence:**
   Every proposed relation retains its exact character offsets and source page mapping, providing deterministic verification without re-parsing.
3. **Query via Cypher:**
   Inspect exported `.cypher` files for explicit graph edge relationships.
