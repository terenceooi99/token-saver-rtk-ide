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
        const isWin = process.platform === 'win32';
        const portEnv = port !== 20128 ? (isWin ? `$env:PORT=${port}; ` : `PORT=${port} `) : '';
        const runCmd = isWin
            ? `${portEnv}if (Get-Command omniroute -ErrorAction SilentlyContinue) { omniroute } else { npx -y omniroute }`
            : `${portEnv}omniroute || npx -y omniroute`;
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
        const cmd = process.platform === 'win32'
            ? 'if (Get-Command omniroute -ErrorAction SilentlyContinue) { omniroute doctor } else { npx -y omniroute doctor }'
            : 'omniroute doctor || npx -y omniroute doctor';
        terminal.sendText(cmd);
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
            antigravity: {
                id: 'antigravity',
                name: 'Antigravity IDE',
                icon: '🌌',
                title: 'Antigravity IDE AI Agent Prompt & Gateway Routing',
                notice: '💡 <strong>Antigravity Dropdown Tip:</strong> Antigravity chat model dropdown does not support custom model URLs directly. Use the <strong>🤖 Copy AI Agent Prompt</strong> button to instruct the Antigravity agent to route tasks through OmniRoute! (Tip: Enable <strong>RTK &rarr; Caveman</strong> compression in OmniRoute Dashboard &rarr; Context &amp; Cache &rarr; Compression).',
                steps: [
                    'Click <strong>🤖 Copy AI Agent Prompt</strong> above and paste directly into your Antigravity chat.',
                    'The agent will verify the local gateway at <code>http://localhost:' + port + '/v1</code> and route model requests through OmniRoute.',
                    'Defaults to <strong><code>auto/coding:free</code></strong> for guaranteed 100% zero-cost coding across free models in combo, or switch to <strong><code>auto/coding</code></strong> for uninterrupted fallback.',
                    'Use <code>/rtk-omniroute</code> anytime in chat to inspect routing status, pool health, and quota headroom.'
                ],
                aiPrompt: `Please configure and route my AI requests through the local OmniRoute AI Gateway at ${baseUrl}.\n` +
                    `1. Ensure OmniRoute gateway is running on port ${port} (run 'npx -y omniroute' or 'omniroute start' if offline).\n` +
                    `2. Since Antigravity IDE's native model dropdown does not support adding custom URLs, route all relevant agent coding queries, completions, and tool executions through OmniRoute's OpenAI-compatible endpoint (${baseUrl}) with API key 'omniroute'.\n` +
                    `3. Model Selection Strategy:\n` +
                    `   - Default (Zero-Cost Guarantee): Use model 'auto/coding:free' to strictly pool free-tier models (Gemini 2.5 Flash free, DeepSeek free, Groq free, OpenCode, Qwen). Note: If free quota is exhausted, requests pause until quota resets.\n` +
                    `   - Alternative (Uninterrupted Vibe Coding): Use model 'auto/coding' to prioritize free models first while automatically failing over to available paid/pooled credits so your session never halts.\n` +
                    `4. Compression Note: Enable 'RTK -> Caveman' stacked token compression directly in the OmniRoute Web Dashboard (http://localhost:${port} -> Context & Cache -> Compression) for 78–95% token savings.\n` +
                    `5. Verify gateway connectivity using 'omniroute doctor' and activate the /rtk-omniroute skill if available.`,
                configJson: JSON.stringify({
                    "tokenSaver.omniRouteEnabled": true,
                    "tokenSaver.omniRoutePort": port,
                    "tokenSaver.omniRouteEndpoint": baseUrl,
                    "defaultModel": "auto/coding:free",
                    "uninterruptedModel": "auto/coding",
                    "autoFallback": true
                }, null, 2),
                quickSnippet: `OmniRoute Gateway: ${baseUrl}\nDefault: auto/coding:free (Zero Cost)\nUninterrupted: auto/coding\nSkills: /rtk-omniroute`
            },
            cursor: {
                id: 'cursor',
                name: 'Cursor IDE',
                icon: '🎯',
                title: 'Cursor OpenAI-Compatible Config',
                notice: '💡 <strong>Cursor Setup:</strong> Paste the prompt into Cursor Composer/Chat or set model to <code>auto/coding:free</code> in Settings &rarr; Models.',
                steps: [
                    'Open <strong>Cursor Settings</strong> (<code>Ctrl+,</code> or <code>Cmd+,</code>) &rarr; <strong>Models</strong>',
                    'Under <strong>OpenAI API Key</strong>, toggle <strong>Override OpenAI Base URL</strong> to ON',
                    `Set Base URL: <code>${baseUrl}</code>`,
                    'Set API Key: <code>omniroute</code> (or your dashboard password)',
                    'Add model: <code>auto/coding:free</code> (Zero-Cost) or <code>auto/coding</code> (Uninterrupted)'
                ],
                aiPrompt: `Please configure my Cursor IDE to use OmniRoute AI Gateway as its custom OpenAI-compatible provider.\n` +
                    `1. Local Gateway Base URL: ${baseUrl}\n` +
                    `2. API Key: omniroute\n` +
                    `3. Target Model: 'auto/coding:free' for guaranteed zero-cost free-tier coding, or 'auto/coding' for uninterrupted multi-provider auto-failover.\n` +
                    `Guide me or update the configuration so all AI completions route through OmniRoute's local gateway.`,
                configJson: JSON.stringify({
                    "openai.baseUrl": baseUrl,
                    "openai.apiKey": "omniroute",
                    "models": ["auto/coding:free", "auto/coding", "auto/cheap"]
                }, null, 2),
                quickSnippet: `Base URL: ${baseUrl}\nAPI Key: omniroute\nModel: auto/coding:free`
            },
            cline: {
                id: 'cline',
                name: 'Cline / Roo Code',
                icon: '💻',
                title: 'Cline & Roo Code Provider Setup',
                notice: '💡 <strong>Cline / Roo Code:</strong> Switch provider to "OpenAI Compatible" and set model to <code>auto/coding:free</code>.',
                steps: [
                    'Open the <strong>Cline / Roo Code</strong> sidebar settings (⚙️)',
                    'Select API Provider: <strong>OpenAI Compatible</strong>',
                    `Set Base URL: <code>${baseUrl}</code>`,
                    'Set API Key: <code>omniroute</code>',
                    'Set Model ID: <code>auto/coding:free</code> (Zero Cost) or <code>auto/coding</code> (Uninterrupted)'
                ],
                aiPrompt: `Configure Cline / Roo Code to connect to my local OmniRoute Gateway at ${baseUrl} using OpenAI Compatible provider, API key 'omniroute', and Model ID 'auto/coding:free' (or 'auto/coding' for uninterrupted fallback).`,
                configJson: JSON.stringify({
                    "apiProvider": "openai",
                    "openAiBaseUrl": baseUrl,
                    "openAiApiKey": "omniroute",
                    "openAiModelId": "auto/coding:free"
                }, null, 2),
                quickSnippet: `Provider: OpenAI Compatible\nBase URL: ${baseUrl}\nAPI Key: omniroute\nModel: auto/coding:free`
            },
            claude: {
                id: 'claude',
                name: 'Claude Code CLI',
                icon: '🧠',
                title: 'Claude Code Local Router Setup',
                notice: '💡 <strong>Claude Code:</strong> Run automated setup or route through OmniRoute with <code>auto/coding:free</code>.',
                steps: [
                    'Run automated configuration: <code>npx -y omniroute setup-claude</code>',
                    `Or export <code>ANTHROPIC_BASE_URL="${baseUrl}"</code> and <code>ANTHROPIC_API_KEY="omniroute"</code> before launching <code>claude</code>.`,
                    'Uses OmniRoute auto-router with <code>auto/coding:free</code> (Zero Cost) or <code>auto/coding</code>.'
                ],
                aiPrompt: `Set up my Claude Code CLI to route through local OmniRoute Gateway at ${baseUrl} using model 'auto/coding:free' (Zero Cost) or 'auto/coding' (Uninterrupted). Run 'npx -y omniroute setup-claude' or configure ANTHROPIC_BASE_URL="${baseUrl}" and ANTHROPIC_API_KEY="omniroute".`,
                configJson: process.platform === 'win32'
                    ? `$env:ANTHROPIC_BASE_URL="${baseUrl}"; $env:ANTHROPIC_API_KEY="omniroute"; claude`
                    : `export ANTHROPIC_BASE_URL="${baseUrl}"\nexport ANTHROPIC_API_KEY="omniroute"\nclaude`,
                quickSnippet: `npx -y omniroute setup-claude`
            },
            vscode: {
                id: 'vscode',
                name: 'VS Code (Continue / Copilot)',
                icon: '🤖',
                title: 'VS Code Continue Extension Config',
                notice: '💡 <strong>Continue Extension:</strong> Add an OpenAI provider block for <code>auto/coding:free</code> pointing to OmniRoute.',
                steps: [
                    'Open <code>~/.continue/config.json</code> in VS Code',
                    `Add an OpenAI-compatible model entry pointing to <code>${baseUrl}</code> with API key <code>omniroute</code> and model <code>auto/coding:free</code>.`
                ],
                aiPrompt: `Configure VS Code Continue (~/.continue/config.json) to add a model pointing to my local OmniRoute gateway at ${baseUrl} with apiKey 'omniroute' and model 'auto/coding:free' (Zero Cost) or 'auto/coding' (Uninterrupted).`,
                configJson: JSON.stringify({
                    "models": [
                        {
                            "title": "OmniRoute (Zero-Cost Free)",
                            "provider": "openai",
                            "model": "auto/coding:free",
                            "apiKey": "omniroute",
                            "apiBase": baseUrl
                        },
                        {
                            "title": "OmniRoute (Uninterrupted)",
                            "provider": "openai",
                            "model": "auto/coding",
                            "apiKey": "omniroute",
                            "apiBase": baseUrl
                        }
                    ]
                }, null, 2),
                quickSnippet: `Provider: openai\napiBase: ${baseUrl}\napiKey: omniroute\nmodel: auto/coding:free`
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
