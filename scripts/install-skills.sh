#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GLOBAL_SKILLS_DIR="$HOME/.gemini/config/skills"

mkdir -p "$GLOBAL_SKILLS_DIR"

for skill_dir in "$PROJECT_ROOT/skills"/*; do
    if [ -d "$skill_dir" ]; then
        skill_name=$(basename "$skill_dir")
        DEST="$GLOBAL_SKILLS_DIR/$skill_name"
        mkdir -p "$DEST"
        cp -R "$skill_dir/"* "$DEST/"
        echo "[OK] Installed skill: /$skill_name -> $DEST"
    fi
done

echo ""
echo "Token Saver (RTK) skills installed successfully!"
echo "You can now type / in any Antigravity IDE chat to access slash commands."