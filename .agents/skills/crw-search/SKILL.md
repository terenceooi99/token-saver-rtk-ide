---
name: crw-search
description: >
  Hybrid web search and scraping engine powered by fastCRW (Upstream: fastcrw/crw).
  Extracts clean, condensed Markdown from URLs and web search queries, saving 70-90% prompt tokens compared to raw browser HTML.
  Activate when the user types /crw-search, /crw-scrape, "fastcrw", "scrape url", or asks to perform hybrid web search with fastCRW.
argument-hint: "<url_or_query>"
license: MIT
---

# fastCRW Hybrid Web Search & Scraper (/crw-search)

High-performance Rust-based web scraping, crawling, and AI search tool for AI coding agents.

### Key Capabilities:
- **Token Efficiency:** Strips CSS, JavaScript bloat, ads, and navigation boilerplate, delivering pure structured Markdown.
- **Hybrid Search:** Combines fastCRW with the IDE's built-in web search for resilient web retrieval.
- **Local API Endpoint:** Runs on `http://127.0.0.1:3000` with sub-second extraction speeds.

### CLI Commands:
- Scrape URL to clean Markdown:
  `crw scrape <url>`
- Deep crawl a website:
  `crw crawl <url> --depth 2`
- Start local daemon server:
  `crw serve --port 3000`
- Extract structured data with CSS/XPath selectors:
  `crw extract <url> -s "article, main"`
