---
name: rtk-update
description: >
  Manually check and update or uninstall upstream GitHub repositories (rtk-ai/rtk, headroomlabs-ai/headroom, DietrichGebert/ponytail, miqdadbadjuber/anti-slop, and diegosouzapw/OmniRoute).
  Activate when the user types /rtk-update, /headroom-sync, /ponytail-sync, /antislop-sync, "update upstream", "sync rtk", or asks to
  synchronize or uninstall upstream tools.
---

# Upstream GitHub Sync & Update (/rtk-update)

Manually update, synchronize, or manage upstream token saver engines:
1. **RTK (Rust Token Killer):** CLI binary from GitHub (`rtk-ai/rtk`)
2. **Headroom:** Context compression engine from GitHub (`headroomlabs-ai/headroom`)
3. **Ponytail:** YAGNI token saver suite from GitHub (`DietrichGebert/ponytail`)
4. **Anti-Slop:** AI quality & slop prevention framework from GitHub (`miqdadbadjuber/anti-slop`)
5. **OmniRoute:** AI Gateway & model router from GitHub (`diegosouzapw/OmniRoute`)

## Execution Steps

1. **Check Local Engine Versions:**
   - Run `rtk --version` to check the installed RTK binary version.
   - Run `headroom --version` (or `python -m headroom --version`) to check Headroom.
   - Run `omniroute --version` to check OmniRoute.
   - Verify Ponytail skills in global config (`~/.gemini/config/skills/ponytail/SKILL.md`).

2. **Fetch Upstream Release & Update:**
   - **RTK (CLI):**
     - *Windows:* `winget upgrade --id rtk-ai.rtk --accept-source-agreements --accept-package-agreements`
     - *macOS:* `brew upgrade rtk || (curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/main/install.sh | bash)`
     - *Linux:* `curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/main/install.sh | bash`
   - **Headroom (Context Compression Layer):**
     - `pip install --upgrade "headroom-ai[all]"` or `pipx upgrade headroom-ai`
   - **OmniRoute (AI Gateway):**
     - `npm install -g omniroute`
   - **Ponytail (YAGNI Suite):**
     - Fetch/sync latest skills from `https://github.com/DietrichGebert/ponytail` to `~/.gemini/config/skills/` and `.agents/skills/`.

3. **Uninstall Any Upstream Layer:**
   - Use command `tokenSaver.uninstallUpstream` or individual uninstall commands in the IDE dashboard.

