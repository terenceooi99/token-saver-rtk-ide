const { exec } = require('child_process');
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class CodeGraphService {
    /**
     * Checks if CodeGraphContext (cgc) is installed and accessible.
     */
    static getCandidateDirs() {
        const dirs = [];
        try {
            const configPath = vscode.workspace.getConfiguration('tokenSaver').get('upstreamInstallPath', '');
            if (configPath) {
                dirs.push(path.join(configPath, 'CodeGraphContext'));
                dirs.push(configPath);
            }
        } catch (_) {}

        const home = require('os').homedir();
        dirs.push(
            'D:\\Software\\AI Agent Space\\CodeGraphContext',
            'D:\\Software\\CodeGraphContext',
            path.join(home, '.codegraphcontext'),
            path.join(home, 'CodeGraphContext')
        );
        return [...new Set(dirs)];
    }

    static checkInstalled() {
        return new Promise((resolve) => {
            // 0. Check known local installation directories
            const candidateDirs = this.getCandidateDirs();
            for (const cand of candidateDirs) {
                if (fs.existsSync(cand)) {
                    const isWin = process.platform === 'win32';
                    const venvExe = isWin
                        ? path.join(cand, '.venv', 'Scripts', 'cgc.exe')
                        : path.join(cand, '.venv', 'bin', 'cgc');
                    if (fs.existsSync(venvExe)) {
                        resolve({ installed: true, runner: 'venv', version: 'cgc (local venv)', path: venvExe, cwd: cand });
                        return;
                    }
                    if (fs.existsSync(path.join(cand, 'pyproject.toml')) || fs.existsSync(path.join(cand, 'cgc_entry.py'))) {
                        resolve({ installed: true, runner: 'source', version: 'cgc (source)', path: cand, cwd: cand });
                        return;
                    }
                }
            }

            // 1. Direct cgc CLI binary check
            exec('cgc --version', (error, stdout) => {
                if (!error && stdout) {
                    resolve({ installed: true, runner: 'cgc', version: stdout.trim(), path: 'cgc' });
                    return;
                }

                // 2. Python module invocation check
                exec('python -m codegraphcontext --help || py -m codegraphcontext --help', (pyErr, pyStdout) => {
                    if (!pyErr && pyStdout) {
                        resolve({ installed: true, runner: 'python', version: 'codegraphcontext (python)', path: 'python -m codegraphcontext' });
                        return;
                    }

                    // 3. uv check for virtual environment / isolated run
                    exec('uv run cgc --version', (uvErr, uvStdout) => {
                        if (!uvErr && uvStdout) {
                            resolve({ installed: true, runner: 'uv', version: uvStdout.trim(), path: 'uv run cgc' });
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
            return vscode.workspace.getConfiguration('tokenSaver').get('codeGraphEnabled', true);
        } catch (e) {
            return true;
        }
    }

    static isAutoUpdateEnabled() {
        try {
            return vscode.workspace.getConfiguration('tokenSaver').get('codeGraphAutoUpdate', true);
        } catch (e) {
            return true;
        }
    }

    static getInstallCommands(isWindows = (process.platform === 'win32')) {
        const repoUrl = 'https://github.com/CodeGraphContext/CodeGraphContext.git';
        const pipInstallCmd = isWindows
            ? `pip install codegraphcontext`
            : `pip install codegraphcontext || pipx install codegraphcontext`;
        const gitInstallCmd = isWindows
            ? `pip install "git+${repoUrl}"`
            : `pip install "git+${repoUrl}" || pipx install "git+${repoUrl}"`;

        return {
            pipInstallCmd,
            gitInstallCmd,
            primaryCmd: pipInstallCmd
        };
    }

    static getUninstallCommands(isWindows = (process.platform === 'win32')) {
        const pipUninstallCmd = isWindows
            ? 'pip uninstall -y codegraphcontext'
            : 'pip uninstall -y codegraphcontext || pipx uninstall codegraphcontext';

        return {
            pipUninstallCmd,
            primaryCmd: pipUninstallCmd
        };
    }

    static getWorkspacePath(targetPath) {
        return targetPath || (vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null);
    }

    static runInTerminal(name, cmd) {
        const terminal = vscode.window.createTerminal(`CodeGraphContext ${name}`);
        terminal.show();
        terminal.sendText(cmd);
    }

    /**
     * Trigger indexing on workspace directory.
     */
    static async indexWorkspace(targetPath) {
        const workspacePath = this.getWorkspacePath(targetPath);
        if (!workspacePath) {
            vscode.window.showErrorMessage('❌ No active workspace folder to index with CodeGraphContext.');
            return;
        }
        this.runInTerminal('Index', `cgc index --path "${workspacePath}" || python -m codegraphcontext index --path "${workspacePath}"`);
    }

    /**
     * Start background watcher for continuous live updates.
     */
    static async startWatcher(targetPath) {
        const workspacePath = this.getWorkspacePath(targetPath);
        if (!workspacePath) return;
        this.runInTerminal('Watch', `cgc watch --path "${workspacePath}" || python -m codegraphcontext watch --path "${workspacePath}"`);
    }

    /**
     * Interactively query the code graph.
     */
    static async queryPrompt() {
        const query = await vscode.window.showInputBox({
            title: 'Query CodeGraphContext Semantic Code Graph',
            prompt: 'Enter function name, symbol, or Cypher query (e.g. "MATCH (n:Function) RETURN n.name LIMIT 10")',
            placeHolder: 'Symbol name or Cypher query'
        });

        if (!query) return;
        this.runInTerminal('Query', `cgc query "${query}" || python -m codegraphcontext query "${query}"`);
    }

    /**
     * Reset / clear local code graph cache.
     */
    static async resetGraph(targetPath) {
        const workspacePath = this.getWorkspacePath(targetPath);
        if (!workspacePath) return;

        const graphDir = path.join(workspacePath, '.codegraphcontext');
        if (fs.existsSync(graphDir)) {
            try {
                fs.rmSync(graphDir, { recursive: true, force: true });
                vscode.window.showInformationMessage('🧹 CodeGraphContext cache cleared for current repository.');
            } catch (err) {
                vscode.window.showErrorMessage(`Failed to clear CodeGraphContext cache: ${err.message}`);
            }
        } else {
            vscode.window.showInformationMessage('ℹ️ No .codegraphcontext directory found to clear.');
        }
    }
}

module.exports = { CodeGraphService };
