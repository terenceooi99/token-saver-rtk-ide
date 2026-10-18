const { exec } = require('child_process');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

class LightpandaService {
    /**
     * Checks if Lightpanda browser is installed and accessible.
     */
    static getCandidateDirs() {
        const dirs = [];
        try {
            const configPath = vscode.workspace.getConfiguration('tokenSaver').get('upstreamInstallPath', '');
            if (configPath) {
                dirs.push(path.join(configPath, 'lightpanda'));
                dirs.push(configPath);
            }
        } catch (_) {}

        const home = require('os').homedir();
        dirs.push(
            'D:\\Software\\AI Agent Space\\lightpanda',
            'D:\\Software\\lightpanda',
            path.join(home, '.config', 'lightpanda'),
            path.join(home, 'lightpanda')
        );
        return [...new Set(dirs)];
    }

    /**
     * Ensures cdp_launcher.mjs is present in both primary lightpanda and shared fallback directory.
     * Prevents ERR_MODULE_NOT_FOUND in Stagehand MCP server when Lightpanda is moved or restored from Recycle Bin.
     */
    static ensureCdpLauncherBackup() {
        try {
            const fs = require('fs');
            const path = require('path');
            const primaryDir = 'D:\\Software\\AI Agent Space\\lightpanda';
            const sharedDir = 'D:\\Software\\AI Agent Space\\shared\\stagehand-fastcrw';
            const primaryFile = path.join(primaryDir, 'cdp_launcher.mjs');
            const sharedBackup = path.join(sharedDir, 'cdp_launcher.mjs');

            if (fs.existsSync(sharedBackup) && !fs.existsSync(primaryFile)) {
                if (!fs.existsSync(primaryDir)) {
                    fs.mkdirSync(primaryDir, { recursive: true });
                }
                fs.copyFileSync(sharedBackup, primaryFile);
            } else if (fs.existsSync(primaryFile) && !fs.existsSync(sharedBackup)) {
                if (!fs.existsSync(sharedDir)) {
                    fs.mkdirSync(sharedDir, { recursive: true });
                }
                fs.copyFileSync(primaryFile, sharedBackup);
            }
        } catch (e) {
            console.warn('[LightpandaService] ensureCdpLauncherBackup warning:', e);
        }
    }

    static checkInstalled() {
        return new Promise((resolve) => {
            const fs = require('fs');
            const path = require('path');
            this.ensureCdpLauncherBackup();
            const candidateDirs = this.getCandidateDirs();
            for (const cand of candidateDirs) {
                if (fs.existsSync(cand)) {
                    const isWin = process.platform === 'win32';
                    const bin = isWin ? path.join(cand, 'lightpanda.exe') : path.join(cand, 'lightpanda');
                    const releaseBin = isWin ? path.join(cand, 'target', 'release', 'lightpanda.exe') : path.join(cand, 'target', 'release', 'lightpanda');
                    if (fs.existsSync(bin)) {
                        resolve({ installed: true, runner: 'lightpanda-local', version: 'lightpanda (local)', path: bin, cwd: cand });
                        return;
                    }
                    if (fs.existsSync(releaseBin)) {
                        resolve({ installed: true, runner: 'lightpanda-release', version: 'lightpanda (release)', path: releaseBin, cwd: cand });
                        return;
                    }
                    if (fs.existsSync(path.join(cand, 'cdp_launcher.mjs'))) {
                        resolve({ installed: true, runner: 'cdp-launcher', version: '0.2.0-compat', path: path.join(cand, 'cdp_launcher.mjs'), cwd: cand });
                        return;
                    }
                    if (fs.existsSync(path.join(cand, 'package.json')) || fs.existsSync(path.join(cand, 'Cargo.toml'))) {
                        resolve({ installed: true, runner: 'source', version: 'lightpanda (source)', path: cand, cwd: cand });
                        return;
                    }
                }
            }

            // 1. Direct lightpanda CLI binary check
            exec('lightpanda --version', (error, stdout) => {
                if (!error && stdout) {
                    resolve({ installed: true, runner: 'lightpanda', version: stdout.trim(), path: 'lightpanda' });
                    return;
                }

                // 2. npx @lightpanda/browser check
                exec('npx @lightpanda/browser --version', (npxErr, npxStdout) => {
                    if (!npxErr && npxStdout) {
                        resolve({ installed: true, runner: 'npx', version: npxStdout.trim(), path: '@lightpanda/browser' });
                        return;
                    }

                    // 3. Docker container check
                    exec('docker ps --filter "ancestor=lightpanda/browser" --format "{{.Image}} ({{.Status}})"', (dockerErr, dockerStdout) => {
                        if (!dockerErr && dockerStdout && dockerStdout.trim()) {
                            resolve({ installed: true, runner: 'docker', version: 'lightpanda (docker)', path: 'docker' });
                            return;
                        }

                        resolve({
                            installed: false,
                            version: null,
                            path: null
                        });
                    });
                });
            });
        });
    }

    static isEnabled() {
        try {
            return vscode.workspace.getConfiguration('tokenSaver').get('lightpandaEnabled', true);
        } catch (e) {
            return true;
        }
    }

    static getInstallCommands(isWindows = (process.platform === 'win32'), isMac = (process.platform === 'darwin')) {
        const repoUrl = 'https://github.com/lightpanda-io/browser.git';
        const installScriptCmd = isWindows
            ? 'npm install -g @lightpanda/browser; npx @lightpanda/browser install'
            : (isMac
                ? 'curl -fsSL https://pkg.lightpanda.io/install.sh | bash || npm install -g @lightpanda/browser'
                : 'curl -fsSL https://pkg.lightpanda.io/install.sh | bash || npm install -g @lightpanda/browser');

        return {
            installScriptCmd,
            npmInstallCmd: isWindows
                ? 'npm install -g @lightpanda/browser; npx @lightpanda/browser install'
                : 'npm install -g @lightpanda/browser && npx @lightpanda/browser install',
            dockerCmd: 'docker run -d --name lightpanda -p 9222:9222 lightpanda/browser:nightly',
            primaryCmd: installScriptCmd,
            repoUrl
        };
    }

    static getUninstallCommands(isWindows = (process.platform === 'win32')) {
        const uninstallCmd = isWindows
            ? 'npm uninstall -g @lightpanda/browser; if (Get-Command docker -ErrorAction SilentlyContinue) { docker stop lightpanda 2>$null; docker rm lightpanda 2>$null }'
            : 'npm uninstall -g @lightpanda/browser 2>/dev/null || rm -f $(which lightpanda 2>/dev/null); if command -v docker >/dev/null 2>&1; then docker stop lightpanda 2>/dev/null || true; docker rm lightpanda 2>/dev/null || true; fi';

        return {
            uninstallCmd,
            primaryCmd: uninstallCmd
        };
    }

    /**
     * Start local Lightpanda MCP server in terminal.
     */
    static async startMcpServer() {
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const port = config.get('lightpandaMcpPort', 8000);

        const terminal = vscode.window.createTerminal('Lightpanda MCP Server');
        terminal.show();
        const cmd = process.platform === 'win32'
            ? `if (Get-Command lightpanda -ErrorAction SilentlyContinue) { lightpanda mcp --port ${port} } else { npx @lightpanda/browser mcp --port ${port} }`
            : `lightpanda mcp --port ${port} || npx @lightpanda/browser mcp --port ${port} || lightpanda mcp`;
        terminal.sendText(cmd);
    }

    /**
     * Return formatted MCP Server configuration JSON for AI agents (Antigravity IDE, Claude, Cursor).
     */
    static getMcpConfigSnippet(port = 8000) {
        return JSON.stringify({
            mcpServers: {
                lightpanda: {
                    command: "lightpanda",
                    args: ["mcp"],
                    env: {}
                },
                "lightpanda-http": {
                    url: `http://127.0.0.1:${port}/mcp`
                }
            }
        }, null, 2);
    }
}

module.exports = { LightpandaService };
