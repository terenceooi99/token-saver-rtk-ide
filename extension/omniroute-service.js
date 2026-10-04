const { exec, spawn } = require('child_process');
const vscode = require('vscode');
const http = require('http');
const path = require('path');
const os = require('os');

class OmniRouteService {
    static checkInstalled() {
        return new Promise((resolve) => {
            exec('omniroute --version', (error, stdout) => {
                if (!error && stdout) {
                    const version = stdout.trim();
                    resolve({ installed: true, version, path: 'omniroute' });
                } else {
                    // Check if npx or npm global has omniroute
                    exec('npm list -g omniroute --depth=0', (npmErr, npmStdout) => {
                        if (!npmErr && npmStdout && npmStdout.includes('omniroute@')) {
                            const match = npmStdout.match(/omniroute@([0-9a-zA-Z\.\-]+)/);
                            const version = match ? `v${match[1]}` : 'installed';
                            resolve({ installed: true, version, path: 'npm global omniroute' });
                        } else {
                            // npx availability check
                            exec('npx --version', (npxErr) => {
                                if (!npxErr) {
                                    resolve({ installed: false, npxAvailable: true, version: null, path: null });
                                } else {
                                    resolve({ installed: false, npxAvailable: false, version: null, path: null });
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    static checkRunning(port = 20128) {
        return new Promise((resolve) => {
            const req = http.get(`http://localhost:${port}/health`, { timeout: 1000 }, (res) => {
                resolve({ running: true, port, statusCode: res.statusCode });
            });

            req.on('error', () => {
                // Fallback check on root /
                const rootReq = http.get(`http://localhost:${port}/`, { timeout: 1000 }, (rRes) => {
                    resolve({ running: true, port, statusCode: rRes.statusCode });
                });
                rootReq.on('error', () => {
                    resolve({ running: false, port, statusCode: null });
                });
                rootReq.setTimeout(1000, () => {
                    rootReq.destroy();
                    resolve({ running: false, port, statusCode: null });
                });
            });

            req.setTimeout(1000, () => {
                req.destroy();
                resolve({ running: false, port, statusCode: null });
            });
        });
    }

    static isEnabled() {
        try {
            return vscode.workspace.getConfiguration('tokenSaver').get('omniRouteEnabled', true);
        } catch (e) {
            return true;
        }
    }

    static async getGatewayStatus(port = 20128) {
        const enabled = this.isEnabled();
        const installInfo = await this.checkInstalled();
        const runInfo = enabled ? await this.checkRunning(port) : { running: false, port, statusCode: null };
        return {
            enabled,
            installed: installInfo.installed,
            npxAvailable: installInfo.npxAvailable,
            version: installInfo.version || (runInfo.running ? 'Live' : 'Not detected'),
            running: runInfo.running,
            port: port,
            endpoint: `http://localhost:${port}/v1`,
            webUiUrl: `http://localhost:${port}`
        };
    }

    static startGateway(port = 20128) {
        if (!this.isEnabled()) {
            vscode.window.showWarningMessage('OmniRoute is currently disabled in settings (tokenSaver.omniRouteEnabled: false). Please enable it first.', 'Enable OmniRoute').then(c => {
                if (c === 'Enable OmniRoute') {
                    vscode.commands.executeCommand('tokenSaver.enableOmniRoute');
                }
            });
            return;
        }

        const terminalName = 'OmniRoute Gateway';
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (!terminal) {
            terminal = vscode.window.createTerminal(terminalName);
        }
        terminal.show();

        // Check if port is customized
        const portEnv = port !== 20128 ? (process.platform === 'win32' ? `$env:PORT=${port}; ` : `PORT=${port} `) : '';
        const runCmd = `${portEnv}npx -y omniroute || omniroute`;
        terminal.sendText(runCmd);

        vscode.window.showInformationMessage(
            `🌐 Launching OmniRoute AI Gateway on port ${port}... Dashboard available at http://localhost:${port}`,
            'Open Web Dashboard'
        ).then(choice => {
            if (choice === 'Open Web Dashboard') {
                this.openWebUi(port);
            }
        });
    }

    static stopGateway() {
        const terminalName = 'OmniRoute Gateway';
        const terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (terminal) {
            terminal.dispose();
            vscode.window.showInformationMessage('🛑 Closed OmniRoute Gateway terminal session.');
        } else {
            vscode.window.showInformationMessage('ℹ️ OmniRoute terminal session was not active.');
        }
    }

    static openWebUi(port = 20128) {
        const url = `http://localhost:${port}`;
        vscode.env.openExternal(vscode.Uri.parse(url));
    }

    static runDoctor() {
        const terminalName = 'OmniRoute Diagnostics';
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (!terminal) {
            terminal = vscode.window.createTerminal(terminalName);
        }
        terminal.show();
        terminal.sendText('npx -y omniroute doctor || omniroute doctor');
    }

    static installCli() {
        const terminalName = 'Token Saver (Install)';
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (!terminal) {
            terminal = vscode.window.createTerminal(terminalName);
        }
        terminal.show();
        terminal.sendText('npm install -g omniroute');
    }

    static uninstallCli() {
        this.stopGateway();
        const terminalName = 'Token Saver (Uninstall)';
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (!terminal) {
            terminal = vscode.window.createTerminal(terminalName);
        }
        terminal.show();
        terminal.sendText('npm uninstall -g omniroute');
    }

    static getIdePresets(port = 20128) {
        const baseUrl = `http://localhost:${port}/v1`;
        return {
            cursor: {
                id: 'cursor',
                name: 'Cursor IDE',
                icon: '🎯',
                title: 'Cursor OpenAI-Compatible Config',
                steps: [
                    'Open **Cursor Settings** (`Ctrl+,` or `Cmd+,`) → **Models**',
                    'Under **OpenAI API Key**, toggle **Override OpenAI Base URL** to ON',
                    `Set Base URL: \`${baseUrl}\``,
                    'Set API Key: `omniroute` (or your dashboard password)',
                    'Add models like: `claude-3-7-sonnet`, `gpt-4o`, `deepseek-r1`, `gemini-2.5-pro`'
                ],
                configJson: JSON.stringify({
                    "openai.baseUrl": baseUrl,
                    "openai.apiKey": "omniroute",
                    "models": ["claude-3-7-sonnet", "gpt-4o", "deepseek-r1", "gemini-2.5-pro"]
                }, null, 2),
                quickSnippet: `Base URL: ${baseUrl}\nAPI Key: omniroute\nModel: claude-3-7-sonnet`
            },
            cline: {
                id: 'cline',
                name: 'Cline / Roo Code',
                icon: '💻',
                title: 'Cline & Roo Code Provider Setup',
                steps: [
                    'Open the **Cline / Roo Code** sidebar',
                    'Click the ⚙️ **Settings** gear icon',
                    'Select API Provider: **OpenAI Compatible**',
                    `Set Base URL: \`${baseUrl}\``,
                    'Set API Key: `omniroute`',
                    'Set Model ID: `claude-3-7-sonnet` or `gpt-4o`'
                ],
                configJson: JSON.stringify({
                    "apiProvider": "openai",
                    "openAiBaseUrl": baseUrl,
                    "openAiApiKey": "omniroute",
                    "openAiModelId": "claude-3-7-sonnet"
                }, null, 2),
                quickSnippet: `Provider: OpenAI Compatible\nBase URL: ${baseUrl}\nAPI Key: omniroute\nModel: claude-3-7-sonnet`
            },
            claude: {
                id: 'claude',
                name: 'Claude Code CLI',
                icon: '🧠',
                title: 'Claude Code Local Router Setup',
                steps: [
                    'Run the official automated configuration command:',
                    '`npx -y omniroute setup-claude` (or set environment variables below)',
                    'Or set in your shell environment before running `claude`:'
                ],
                configJson: process.platform === 'win32'
                    ? `$env:ANTHROPIC_BASE_URL="${baseUrl}"; $env:ANTHROPIC_API_KEY="omniroute"; claude`
                    : `export ANTHROPIC_BASE_URL="${baseUrl}"\nexport ANTHROPIC_API_KEY="omniroute"\nclaude`,
                quickSnippet: `npx -y omniroute setup-claude`
            },
            antigravity: {
                id: 'antigravity',
                name: 'Antigravity IDE',
                icon: '🌌',
                title: 'Google Antigravity Local Proxy Gateway',
                steps: [
                    'Type `/rtk-omniroute` in the chat to automate gateway routing',
                    `Base URL: \`${baseUrl}\``,
                    'Supports all OpenAI / Gemini / Claude model routing with auto-failover'
                ],
                configJson: JSON.stringify({
                    "tokenSaver.omniRouteEndpoint": baseUrl,
                    "tokenSaver.omniRoutePort": port,
                    "autoFallback": true,
                    "compression": "rtk+caveman"
                }, null, 2),
                quickSnippet: `OmniRoute Gateway: ${baseUrl}\nSkills: /rtk-omniroute\nStatus: Auto-Fallback Active`
            },
            vscode: {
                id: 'vscode',
                name: 'VS Code (Continue / Copilot)',
                icon: '🤖',
                title: 'VS Code Continue Extension Config',
                steps: [
                    'Open `~/.continue/config.json` in VS Code',
                    'Add an OpenAI-compatible model entry pointing to OmniRoute:'
                ],
                configJson: JSON.stringify({
                    "models": [
                        {
                            "title": "OmniRoute (Smart Fallback)",
                            "provider": "openai",
                            "model": "claude-3-7-sonnet",
                            "apiKey": "omniroute",
                            "apiBase": baseUrl
                        }
                    ]
                }, null, 2),
                quickSnippet: `Provider: openai\napiBase: ${baseUrl}\napiKey: omniroute\nmodel: claude-3-7-sonnet`
            }
        };
    }

    static generateAiInstallPrompt(isWindows = (process.platform === 'win32')) {
        const osName = isWindows ? 'Windows (PowerShell / Command Prompt)' : 'macOS / Linux (Terminal)';
        return [
            `Please help me set up OmniRoute (the open-source AI gateway & smart model router) on this ${osName} machine:`,
            '',
            '1. **Install OmniRoute**:',
            '   Run: `npm install -g omniroute` (or ensure `npx -y omniroute` is ready).',
            '',
            '2. **Start the Local AI Gateway**:',
            '   Run: `npx -y omniroute` or `omniroute` (starts on `http://localhost:20128`).',
            '',
            '3. **Verify Gateway Status**:',
            '   Run: `omniroute doctor` and test connection to `http://localhost:20128/health`.',
            '',
            '4. **Confirm Success**:',
            '   Report the running status and let me know when the dashboard is accessible at `http://localhost:20128`.'
        ].join('\n');
    }
}

module.exports = OmniRouteService;
