const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');

/**
 * Creates a completely isolated temporary test environment (temp home + temp workspace)
 * and mocks `vscode` and `os.homedir()` so no real user files or IDE configs are ever touched.
 */
function createIsolatedEnv(options = {}) {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'token-saver-test-'));
    const tempHome = path.join(tempRoot, 'home');
    const tempWorkspace = path.join(tempRoot, 'workspace');
    fs.mkdirSync(tempHome, { recursive: true });
    fs.mkdirSync(tempWorkspace, { recursive: true });

    const originalHomedir = os.homedir;
    const originalEnv = {
        USERPROFILE: process.env.USERPROFILE,
        HOME: process.env.HOME,
        ANTIGRAVITY_CLI_ALIAS: process.env.ANTIGRAVITY_CLI_ALIAS
    };

    os.homedir = () => tempHome;
    process.env.USERPROFILE = tempHome;
    process.env.HOME = tempHome;
    if (options.antigravityCliAlias !== undefined) {
        if (options.antigravityCliAlias === null) {
            delete process.env.ANTIGRAVITY_CLI_ALIAS;
        } else {
            process.env.ANTIGRAVITY_CLI_ALIAS = options.antigravityCliAlias;
        }
    } else {
        delete process.env.ANTIGRAVITY_CLI_ALIAS;
    }

    const configStore = Object.assign({
        enableOnStartup: true,
        weeklyAutoSync: false,
        checkForUpdatesOnStartup: false,
        autoInstallSkills: false,
        autoCleanWorkspaceSkills: false,
        tokenPricePerMillion: 3.0,
        targetScope: 'current',
        terseAgentMode: true,
        compactDiffContext: true,
        astOutlineContext: true,
        headroomEnabled: true,
        ponytailMode: 'full',
        antiSlopEnabled: true,
        antiSlopMode: 'during',
        jevGraphEnabled: true,
        jevGraphProvider: 'keyword',
        codeGraphEnabled: true,
        codeGraphAutoUpdate: true,
        hybridWebEnabled: true,
        crwEnabled: true,
        crwPort: 3000,
        lightpandaEnabled: true,
        lightpandaMcpPort: 8000,
        eccEnabled: true,
        eccAutoCompactEnabled: true,
        eccAutoCkEnabled: true,
        eccAutoCouncilEnabled: true,
        eccCompactToolThreshold: 50,
        omniRouteEnabled: true,
        omniRouteAutoStart: false,
        omniRoutePort: 20128,
        upstreamInstallPath: '',
        skillsInstallPath: path.join(tempHome, 'user-skills'),
        userDefinedSkillsPath: '',
        statusMetricDisplay: 'compact'
    }, options.config || {});

    const globalStateStore = new Map(Object.entries(options.globalState || {}));
    const registeredCommands = new Map();
    const messages = { info: [], warning: [], error: [], statusBar: [] };
    const clipboardHistory = [];
    const terminalsCreated = [];
    const terminalTexts = [];
    const quickPickQueue = [...(options.quickPickResponses || [])];
    const messageResponses = [...(options.messageResponses || [])];
    const configListeners = [];

    const mockTerminal = (name) => ({
        name,
        show: () => {},
        dispose: () => {},
        sendText: (txt) => terminalTexts.push({ name, text: txt })
    });

    const vscodeMock = {
        env: {
            appName: options.appName || 'Antigravity',
            appRoot: options.appRoot || '/Applications/Antigravity',
            uriScheme: options.uriScheme || 'antigravity',
            clipboard: {
                writeText: async (text) => {
                    clipboardHistory.push(text);
                }
            },
            openExternal: async () => true
        },
        workspace: {
            workspaceFolders: options.noWorkspace ? undefined : [
                { name: 'test-repo', uri: { fsPath: tempWorkspace } }
            ],
            getConfiguration: (section) => ({
                get: (key, defaultVal) => {
                    if (section && section !== 'tokenSaver') return defaultVal;
                    return Object.prototype.hasOwnProperty.call(configStore, key) ? configStore[key] : defaultVal;
                },
                update: async (key, value) => {
                    configStore[key] = value;
                    for (const listener of configListeners) {
                        listener({ aAffects: key, affectsConfiguration: (s) => s === `tokenSaver.${key}` || s === 'tokenSaver' });
                    }
                }
            }),
            onDidChangeConfiguration: (cb) => {
                configListeners.push(cb);
                return { dispose: () => {} };
            },
            onDidChangeWorkspaceFolders: () => ({ dispose: () => {} }),
            onDidSaveTextDocument: () => ({ dispose: () => {} }),
            createFileSystemWatcher: () => ({
                onDidCreate: () => ({ dispose: () => {} }),
                onDidChange: () => ({ dispose: () => {} }),
                dispose: () => {}
            })
        },
        window: {
            terminals: [],
            activeTextEditor: options.activeTextEditor || null,
            createOutputChannel: () => ({
                lines: [],
                clear: function () { this.lines = []; },
                show: () => {},
                appendLine: function (l) { this.lines.push(l); },
                dispose: () => {}
            }),
            createStatusBarItem: () => ({
                text: '',
                tooltip: null,
                command: '',
                color: undefined,
                shown: false,
                show: function () { this.shown = true; },
                dispose: () => {}
            }),
            registerWebviewViewProvider: () => ({ dispose: () => {} }),
            createWebviewPanel: () => ({
                webview: {
                    html: '',
                    cspSource: 'vscode-webview:',
                    asWebviewUri: (u) => u,
                    onDidReceiveMessage: () => ({ dispose: () => {} }),
                    postMessage: async () => true
                },
                onDidDispose: () => ({ dispose: () => {} }),
                reveal: () => {}
            }),
            createTerminal: (name) => {
                const t = mockTerminal(name);
                terminalsCreated.push(name);
                vscodeMock.window.terminals.push(t);
                return t;
            },
            showInformationMessage: async (msg, ...items) => {
                messages.info.push({ msg, items });
                return messageResponses.length > 0 ? messageResponses.shift() : undefined;
            },
            showWarningMessage: async (msg, ...items) => {
                messages.warning.push({ msg, items });
                return messageResponses.length > 0 ? messageResponses.shift() : undefined;
            },
            showErrorMessage: async (msg, ...items) => {
                messages.error.push({ msg, items });
                return messageResponses.length > 0 ? messageResponses.shift() : undefined;
            },
            showQuickPick: async (items) => {
                if (quickPickQueue.length > 0) {
                    const pick = quickPickQueue.shift();
                    return typeof pick === 'function' ? pick(items) : pick;
                }
                return undefined;
            },
            showInputBox: async () => undefined,
            showOpenDialog: async () => undefined,
            setStatusBarMessage: (msg) => {
                messages.statusBar.push(msg);
                return { dispose: () => {} };
            },
            withProgress: async (_opts, task) => task({ report: () => {} })
        },
        commands: {
            registerCommand: (id, handler) => {
                registeredCommands.set(id, handler);
                return { dispose: () => registeredCommands.delete(id) };
            },
            executeCommand: async (id, ...args) => {
                if (registeredCommands.has(id)) {
                    return registeredCommands.get(id)(...args);
                }
                return undefined;
            }
        },
        extensions: {
            getExtension: () => ({ packageJSON: { version: '1.15.1' } })
        },
        Uri: {
            file: (p) => ({ fsPath: p, toString: () => p }),
            parse: (s) => ({ fsPath: s, toString: () => s }),
            joinPath: (...args) => {
                const joined = path.join(...args.map((a) => (typeof a === 'string' ? a : a.fsPath)));
                return { fsPath: joined, toString: () => joined };
            }
        },
        StatusBarAlignment: { Left: 1, Right: 2 },
        ThemeColor: function ThemeColor(id) { this.id = id; },
        MarkdownString: function MarkdownString(val) { this.value = val; this.isTrusted = false; },
        ConfigurationTarget: { Global: 1, Workspace: 2, WorkspaceFolder: 3 },
        ProgressLocation: { Notification: 15 },
        ViewColumn: { One: 1 }
    };

    const originalLoad = Module._load;
    Module._load = function (request, parent, isMain) {
        if (request === 'vscode') {
            return vscodeMock;
        }
        return originalLoad.call(this, request, parent, isMain);
    };

    // Clear cached extension modules so every test gets fresh bindings to the mocked vscode + tempHome
    const extensionDir = path.resolve(__dirname, '..', '..', 'extension');
    for (const key of Object.keys(require.cache)) {
        if (key.startsWith(extensionDir)) {
            delete require.cache[key];
        }
    }

    const repoRoot = path.resolve(__dirname, '..', '..');
    const context = {
        extensionUri: vscodeMock.Uri.file(repoRoot),
        extension: { packageJSON: { version: '1.15.1' } },
        subscriptions: [],
        globalState: {
            get: (key, defaultVal) => (globalStateStore.has(key) ? globalStateStore.get(key) : defaultVal),
            update: async (key, val) => { globalStateStore.set(key, val); }
        }
    };

    function cleanup() {
        Module._load = originalLoad;
        os.homedir = originalHomedir;
        if (originalEnv.USERPROFILE !== undefined) process.env.USERPROFILE = originalEnv.USERPROFILE;
        else delete process.env.USERPROFILE;
        if (originalEnv.HOME !== undefined) process.env.HOME = originalEnv.HOME;
        else delete process.env.HOME;
        if (originalEnv.ANTIGRAVITY_CLI_ALIAS !== undefined) process.env.ANTIGRAVITY_CLI_ALIAS = originalEnv.ANTIGRAVITY_CLI_ALIAS;
        else delete process.env.ANTIGRAVITY_CLI_ALIAS;

        for (const key of Object.keys(require.cache)) {
            if (key.startsWith(extensionDir)) {
                delete require.cache[key];
            }
        }
        try {
            fs.rmSync(tempRoot, { recursive: true, force: true });
        } catch (_) {}
    }

    return {
        tempRoot,
        tempHome,
        tempWorkspace,
        repoRoot,
        vscodeMock,
        context,
        configStore,
        globalStateStore,
        registeredCommands,
        messages,
        clipboardHistory,
        terminalsCreated,
        terminalTexts,
        cleanup
    };
}

module.exports = { createIsolatedEnv };
