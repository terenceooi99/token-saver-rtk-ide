---
name: jevgraph-build
description: >
  Build evidence-backed candidate knowledge graphs with typed relation decisions from documents, specs, PRDs, or PDFs.
  Activate when the user types /jevgraph-build, /jevgraph, "build knowledge graph", "document graph",
  or asks to extract structured entity relations from specifications or documents.
argument-hint: "<input_file_or_doc> [--ontology <path>] [--entities <path>] [--provider keyword|jev]"
license: MIT
---

# JevGraph Candidate Knowledge Graph Builder (/jevgraph-build)

Builds an evidence-backed candidate knowledge graph from documents (PDF, DOCX, PPTX, TXT, or markdown architectural specs) using bounded candidate blocking and typed relation decisions (Upstream: `chenmingtang830/jevgraph`).

## Why JevGraph Saves Prompt Tokens
Instead of dumping full 50-100 page spec documents or massive architecture files into the LLM prompt context (which consumes 50,000–200,000 tokens), JevGraph performs local parsing and candidate blocking to generate compact, structured knowledge graphs with page-level evidence windows.

## Quick Execution Commands
1. **Manual Insert via IDE Dashboard or Command Palette:**
   - Run `Token Saver: Manual Insert Documents to JevGraph (File Explorer & Web Link)` or click **📁 Manual Insert Documents to JevGraph** in the Token Saver Dashboard to pick local files (`.pdf`, `.docx`, `.md`, `.txt`) or ingest public web links.

2. **Automated Repository & AI Chat Ingestion:**
   - **Auto Initial Build:** Automatically scans and indexes all repo documentation (`docs/`, `specs/`, `README.md`, `PRD*`, etc.) into `runs/graph.json` upon startup.
   - **Auto Watcher & Combiner:** Actively watches for newly added or edited documents and AI chat feeds, merging new entity nodes and typed relation edges into `runs/graph.json` in real time.

3. **CLI Execution Commands:**
   - **Build Graph (Offline Keyword Baseline - 0 External Tokens):**
     ```bash
     uv run jevgraph build path/to/spec.md --provider keyword --out runs/spec_graph.json
     ```
   - **Build Graph from PDF / DOCX / PPTX:**
     ```bash
     uv run jevgraph build path/to/doc.pdf --provider keyword --out runs/doc_graph.json
     ```
   - **Export Graph (Cypher / CSV):**
     ```bash
     uv run jevgraph export runs/spec_graph.json --format neo4j --out runs/spec.cypher
     uv run jevgraph export runs/spec_graph.json --format csv --out runs/spec_csv
     ```
