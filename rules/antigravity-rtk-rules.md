# RTK (Rust Token Killer) Automation Rule for Antigravity IDE

Prefix shell commands with `rtk` when running supported CLI tools or standalone binaries: `rtk git status`, `rtk cargo test`, `rtk npm run build`, `rtk tree src/`, `rtk rg "pattern"`. Keep the prefix inside chains: `rtk git add . && rtk git commit -m "msg"`.

### Windows Shell & RTK Invariants (CRITICAL)
On Windows / PowerShell, observe the following execution rules:
1. **Never prefix shell interpreters or shell built-ins with `rtk`**:
   - **DO NOT execute `rtk powershell`, `rtk cmd`, `rtk dir`, `rtk ls`, or `rtk grep`**.
   - Shell commands and PowerShell scripts must be executed directly without `rtk` (e.g. `powershell -Command "..."` or native `Get-ChildItem`), or via `rtk run "<cmd>"` if token compression is specifically desired.
2. **Never wrap complex PowerShell scripts into `rtk powershell -Command "..."`**:
   - Nested double-quote escaping gets mangled by RTK's argument parser, causing PowerShell syntax errors (`The string is missing the terminator: "`). Run PowerShell commands directly without the `rtk` prefix.
3. **For code/text search**:
   - Use `rtk rg "pattern" [path]` (`rg.exe` is installed alongside RTK).
   - Or use native PowerShell `Select-String -Path [path] -Pattern [pattern]`.
4. **For directory listing**:
   - Use `rtk tree [dir]` or native PowerShell `Get-ChildItem [dir]`.

## Command output
Command output here is condensed to save tokens, keeping every signal and dropping costly noise. Treat it as the complete result: run commands normally, and batch related commands into one call to avoid extra turns. Truncated results state their recovery path in their own output. Re-run a command as `rtk proxy <cmd>` only when its result is unusable: empty when output was clearly expected, contradicting its exit code, or garbled.

## About RTK
RTK (Rust Token Killer) is a high-performance CLI proxy that filters command output to save tokens; behavior and exit code are unchanged.

- `rtk gain` / `rtk gain --history` - token savings, overall and per command.
- `rtk proxy <cmd>` - run a command unfiltered, still tracked.
- `RTK_DISABLED=1 <cmd>` - skip RTK for one command.
- `rtk discover` - find past commands RTK could have condensed.