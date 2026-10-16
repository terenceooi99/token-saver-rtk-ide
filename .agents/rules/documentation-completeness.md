# Comprehensive Documentation & Diagram Sync Rule

When adding, renaming, or modifying features, slash commands (`/*`), or CLI tools:

1. **Full-Document Sweep**: Do not stop at the primary markdown table. Search the entire `README.md` and documentation files for all representations.
2. **Visual & ASCII Diagrams**: Always update visual architecture boxes, ASCII diagrams, and quick-reference flowcharts to reflect new or changed commands.
3. **Command Palette & Contribution Lists**: Update command lists in `README.md`, `package.json`, and UI feature bullet points.
4. **Helper Scripts & Output Messages**: Ensure setup scripts (`install-skills.ps1`, `install-skills.sh`) and command feedback strings list all active commands.
5. **Global/Workspace Index Files**: Sync reference documents such as `summary.md` and skill indexes.
6. **Upstream GitHub Repository Links & UI Footers**: When adding or updating an upstream engine/integration (e.g., RTK, Headroom, Ponytail, Anti-Slop, OmniRoute, JevGraph, CodeGraphContext):
   - Add the official GitHub repository link in the dashboard webview footer (`.footer-links` and `.footer-brand-title`).
   - Add the upstream repository badge link (`.repo-badge-link`) in the corresponding panel card header in `extension/webview/index.html`.
   - Update `CHANGELOG.md` and `README.md` ecosystem lists with the upstream repository reference.
