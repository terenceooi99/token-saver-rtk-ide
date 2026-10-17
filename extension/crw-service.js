const { exec } = require('child_process');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

class CrwService {
    /**
     * Checks if fastCRW (crw CLI or crw-server) is installed and accessible.
     */
    static getCandidateDirs() {
        const dirs = [];
        try {
            const configPath = vscode.workspace.getConfiguration('tokenSaver').get('upstreamInstallPath', '');
            if (configPath) {
                dirs.push(path.join(configPath, 'fastcrw'));
                dirs.push(path.join(configPath, 'crw'));
                dirs.push(configPath);
            }
        } catch (_) {}

        const home = require('os').homedir();
        dirs.push(
            'D:\\Software\\AI Agent Space\\fastcrw',
            'D:\\Software\\fastcrw',
            'D:\\Software\\AI Agent Space\\crw',
            path.join(home, '.config', 'crw'),
            path.join(home, 'fastcrw')
        );
        return [...new Set(dirs)];
    }

    static checkInstalled() {
        return new Promise((resolve) => {
            const fs = require('fs');
            const path = require('path');
            const candidateDirs = this.getCandidateDirs();
            for (const cand of candidateDirs) {
                if (fs.existsSync(cand)) {
                    const isWin = process.platform === 'win32';
                    const bin = isWin ? path.join(cand, 'crw.exe') : path.join(cand, 'crw');
                    const releaseBin = isWin ? path.join(cand, 'target', 'release', 'crw.exe') : path.join(cand, 'target', 'release', 'crw');
                    if (fs.existsSync(bin)) {
                        resolve({ installed: true, runner: 'crw-local', version: 'crw (local)', path: bin, cwd: cand });
                        return;
                    }
                    if (fs.existsSync(releaseBin)) {
                        resolve({ installed: true, runner: 'crw-release', version: 'crw (release)', path: releaseBin, cwd: cand });
                        return;
                    }
                    if (fs.existsSync(path.join(cand, 'Cargo.toml'))) {
                        resolve({ installed: true, runner: 'cargo-project', version: 'crw (source)', path: cand, cwd: cand });
                        return;
                    }
                }
            }

            // 1. Direct crw CLI binary check
            exec('crw --version', (error, stdout) => {
                if (!error && stdout) {
                    resolve({ installed: true, runner: 'crw', version: stdout.trim(), path: 'crw' });
                    return;
                }

                // 2. crw-server check
                exec('crw-server --version', (serverErr, serverStdout) => {
                    if (!serverErr && serverStdout) {
                        resolve({ installed: true, runner: 'crw-server', version: serverStdout.trim(), path: 'crw-server' });
                        return;
                    }

                    // 3. Cargo install check
                    exec('cargo install --list', (cargoErr, cargoStdout) => {
                        if (!cargoErr && cargoStdout && (cargoStdout.includes('crw') || cargoStdout.includes('crw-server'))) {
                            resolve({ installed: true, runner: 'cargo', version: 'crw (cargo)', path: 'cargo' });
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
            return vscode.workspace.getConfiguration('tokenSaver').get('crwEnabled', true);
        } catch (e) {
            return true;
        }
    }

    static getInstallCommands(isWindows = (process.platform === 'win32')) {
        const repoUrl = 'https://github.com/fastcrw/crw.git';
        const installScriptCmd = isWindows
            ? 'powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri https://raw.githubusercontent.com/fastcrw/crw/main/install.ps1 -UseBasicParsing | Invoke-Expression" || cargo install --git ' + repoUrl
            : 'curl -fsSL https://raw.githubusercontent.com/fastcrw/crw/main/install.sh | sh || cargo install --git ' + repoUrl;

        return {
            installScriptCmd,
            cargoInstallCmd: `cargo install --git ${repoUrl}`,
            primaryCmd: installScriptCmd
        };
    }

    static getUninstallCommands(isWindows = (process.platform === 'win32')) {
        const uninstallCmd = isWindows
            ? 'cargo uninstall crw 2>$null; cargo uninstall crw-server 2>$null'
            : 'cargo uninstall crw 2>/dev/null || cargo uninstall crw-server 2>/dev/null || rm -f $(which crw 2>/dev/null) $(which crw-server 2>/dev/null)';

        return {
            uninstallCmd,
            primaryCmd: uninstallCmd
        };
    }

    /**
     * Start local fastCRW server on specified port.
     */
    static async startServer() {
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const port = config.get('crwPort', 3000);

        const terminal = vscode.window.createTerminal('fastCRW Server');
        terminal.show();
        const cmd = process.platform === 'win32'
            ? `if (Get-Command crw-server -ErrorAction SilentlyContinue) { crw-server --port ${port} } else { crw serve --port ${port} }`
            : `crw-server --port ${port} || crw serve --port ${port}`;
        terminal.sendText(cmd);
    }

    /**
     * Test scraping a target URL interactively.
     */
    static async testScrapePrompt() {
        const url = await vscode.window.showInputBox({
            title: 'fastCRW Hybrid Web Scraper',
            prompt: 'Enter website URL to scrape into clean LLM-optimized markdown',
            placeHolder: 'https://example.com'
        });

        if (!url) return;

        const terminal = vscode.window.createTerminal('fastCRW Scrape');
        terminal.show();
        const cmd = process.platform === 'win32'
            ? `if (Get-Command crw -ErrorAction SilentlyContinue) { crw "${url}" } else { curl.exe -s "http://localhost:3000/v1/scrape" -H "Content-Type: application/json" -d "{\\"url\\": \\"${url}\\"}" }`
            : `crw "${url}" || curl -s "http://localhost:3000/v1/scrape" -H "Content-Type: application/json" -d "{\\"url\\": \\"${url}\\"}"`;
        terminal.sendText(cmd);
    }
}

module.exports = { CrwService };
