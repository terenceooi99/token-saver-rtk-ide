# Upstream Engine Integration & Latency Guardrails Rule

Whenever a new upstream engine or external tool (e.g., `fastcrw/crw`, `CodeGraphContext`, `JevGraph`, `Headroom`, `Anti-Slop`, `OmniRoute`, `RTK`) is introduced or updated in the Token Saver IDE Plugin:

## 1. Holistic Dashboard Integration (All 8 Surfaces Required)
Every upstream engine integration must be fully reflected across all 8 related dashboard surfaces:
1. **Header Action Toggle Button**: Dedicated toggle switch (`Turn <Tool> ON / OFF`) in the webview dashboard header.
2. **Setup Alert Banner**: Dynamic chip in the notification banner with status and 1-click AI install prompt generator (`Copy AI Prompt`).
3. **Dedicated Dashboard Section & Quick Action Triggers**: Standalone card section with interactive action buttons and quick triggers.
4. **Multi-Channel Savings Breakdown Navigation**: Navigation tabs and distribution breakdown weights for token/bandwidth savings telemetry.
5. **System Health Diagnostics Row**: Status badge (Active/Inactive), AI install prompt copy button, sync trigger, and uninstall picker entry.
6. **Upstream Versions Dropdown Listing**: Version detection and live dropdown tracking in the upstream version inspector.
7. **Upstream Sync & Uninstall Pickers**: Inclusion in both `showSyncPicker` and `showUninstallPicker` quickpick dialogs.
8. **Footer Upstream Reference Links**: Verified official GitHub repository link in `.footer-links` and panel card `.repo-badge-link`.

## 2. Zero-Noise Latency Benchmarks
- The **Test Upstream Latencies** action must selectively ping and display **only installed** upstream components.
- Uninstalled or optional tools that are not set up must be silently omitted/ignored so users never encounter failed pings, red error states, or visual clutter for tools they do not use.

## 3. Footer Version Number Invariant
- The current plugin release version must **always** be rendered immediately beside "Token Saver" in front of "• GitHub" in the dashboard footer (e.g. `Token Saver v1.13.0 • GitHub`).
