const { exec } = require('child_process');
const vscode = require('vscode');

class LightpandaService {
    /**
     * Checks if Lightpanda browser is installed and accessible.
     */
    static checkInstalled() {
        return new Promise((resolve) => {
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
            ? 'npm install -g @lightpanda/browser && npx @lightpanda/browser install'
            : (isMac
                ? 'curl -fsSL https://pkg.lightpanda.io/install.sh | bash || npm install -g @lightpanda/browser'
                : 'curl -fsSL https://pkg.lightpanda.io/install.sh | bash || npm install -g @lightpanda/browser');

        return {
            installScriptCmd,
            npmInstallCmd: 'npm install -g @lightpanda/browser && npx @lightpanda/browser install',
            dockerCmd: 'docker run -d --name lightpanda -p 9222:9222 lightpanda/browser:nightly',
            primaryCmd: installScriptCmd,
            repoUrl
        };
    }

    static getUninstallCommands(isWindows = (process.platform === 'win32')) {
        const uninstallCmd = isWindows
            ? 'npm uninstall -g @lightpanda/browser; docker stop lightpanda 2>$null; docker rm lightpanda 2>$null'
            : 'npm uninstall -g @lightpanda/browser 2>/dev/null || rm -f $(which lightpanda 2>/dev/null); docker stop lightpanda 2>/dev/null; docker rm lightpanda 2>/dev/null';

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
        terminal.sendText(`lightpanda mcp --port ${port} || npx @lightpanda/browser mcp --port ${port} || lightpanda mcp`);
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
