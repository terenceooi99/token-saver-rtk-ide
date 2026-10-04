---
name: rtk-roi
description: >
  Calculate and display token savings, context efficiency, and estimated cost reduction (ROI) across LLM models.
  Activate when the user types /rtk-roi, /rtk-savings, /rtk-cost, "rtk roi", "rtk savings",
  or asks how much money/tokens RTK has saved.
---

# RTK Token & Cost Savings ROI (/rtk-roi)

Calculates the financial and token efficiency impact across all Token Saver ecosystem channels (RTK CLI, Headroom CCR, Ponytail YAGNI, Anti-Slop Hygiene, and OmniRoute Gateway).

## Metrics Breakdown
1. Run `rtk gain --history` (or `rtk gain`) to retrieve raw total tokens saved and reduction percentage from terminal command filtering.
2. Combine live terminal savings with active engine telemetry (Headroom context compression, Ponytail terse generation, Anti-Slop comment hygiene, OmniRoute cache hits & model routing).
3. Calculate estimated cost savings across popular model price points:
   - **Claude 3.7 Sonnet / Opus:** ~$3.00 - $15.00 per MTok
   - **GPT-4o:** ~$2.50 - $10.00 per MTok
   - **Gemini 2.5 Flash / Pro:** ~$0.10 - $2.50 per MTok
4. Display a concise multi-channel ROI scorecard with total tokens saved, % compressed, and estimated dollars saved per channel.
