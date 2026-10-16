const { exec } = require('child_process');
const vscode = require('vscode');

class CrwService {
    /**
     * Checks if fastCRW (crw CLI or crw-server) is installed and accessible.
     */
    static checkInstalled() {
        return new Promise((resolve) => {
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
        terminal.sendText(`crw-server --port ${port} || crw serve --port ${port}`);
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
        terminal.sendText(`crw "${url}" || curl -s "http://localhost:3000/v1/scrape" -H "Content-Type: application/json" -d "{\\"url\\": \\"${url}\\"}"`);
    }
}

module.exports = { CrwService };
