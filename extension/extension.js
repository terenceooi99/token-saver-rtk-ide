const vscode = require('vscode');
const StatusBarManager = require('./statusbar');
const RtkService = require('./rtk-service');
const RtkUpdater = require('./rtk-updater');
const SkillInstaller = require('./skill-installer');
const OmniRouteService = require('./omniroute-service');
const JevGraphService = require('./jevgraph-service');
const DashboardPanel = require('./dashboard-panel');
const SidebarProvider = require('./sidebar-provider');

let statusBar;
let outputChannel;
let metricsInterval;
let sidebarProvider;

async function refreshStatus(context) {
    const config = vscode.workspace.getConfiguration('tokenSaver');
    const isEnabled = context.globalState.get('tokenSaver.enabled', config.get('enableOnStartup', true));
    const check = await RtkService.checkInstalled();
    const metrics = isEnabled ? await RtkService.getParsedMetrics() : null;
    statusBar.update(isEnabled, check.version, metrics);
    if (sidebarProvider) {
        sidebarProvider.sendLatestData();
    }
    if (DashboardPanel.currentPanel) {
        DashboardPanel.currentPanel.sendLatestData();
    }
}

async function checkWeeklyAutoSync(context) {
    const config = vscode.workspace.getConfiguration('tokenSaver');
    const weeklyEnabled = context.globalState.get('tokenSaver.weeklyAutoSync', config.get('weeklyAutoSync', true));
    if (!weeklyEnabled) return;

    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const lastSync = context.globalState.get('tokenSaver.lastWeeklySyncTime', 0);
    const now = Date.now();

    if (now - lastSync > ONE_WEEK_MS) {
        await context.globalState.update('tokenSaver.lastWeeklySyncTime', now);
        if (outputChannel) {
            outputChannel.appendLine('[Token Saver] Running scheduled weekly upstream GitHub RTK sync check...');
        }
        await RtkUpdater.checkForUpdates(true);
    }
}

async function activate(context) {
    outputChannel = vscode.window.createOutputChannel('Token Saver (RTK)');
    statusBar = new StatusBarManager();
    sidebarProvider = new SidebarProvider(context.extensionUri, context);

    context.subscriptions.push(statusBar);
    context.subscriptions.push(outputChannel);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            SidebarProvider.viewType,
            sidebarProvider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        )
    );

    const config = vscode.workspace.getConfiguration('tokenSaver');
    let isEnabled = context.globalState.get('tokenSaver.enabled', config.get('enableOnStartup', true));
    const targetScope = config.get('targetScope', 'all');
    const autoInstallSkills = config.get('autoInstallSkills', true);
    const omniRouteEnabled = config.get('omniRouteEnabled', true);
    const omniPort = config.get('omniRoutePort', 20128);

    // Initial check of RTK, Headroom, Ponytail, Anti-Slop & OmniRoute engines
    const check = await RtkService.checkInstalled();
    const headroomCheck = await RtkService.checkHeadroomInstalled();
    const ponytailCheck = await RtkService.checkPonytailInstalled();
    const antiSlopCheck = await RtkService.checkAntiSlopInstalled();
    const jevGraphCheck = await RtkService.checkJevGraphInstalled();
    const omniStatus = await OmniRouteService.getGatewayStatus(omniPort);

    const isOmniMissing = omniRouteEnabled && !omniStatus.installed;
    if (!check.installed || !headroomCheck.installed || !ponytailCheck.installed || !antiSlopCheck.installed || !jevGraphCheck.installed || isOmniMissing) {
        const missing = [];
        if (!check.installed) missing.push('RTK CLI');
        if (!headroomCheck.installed) missing.push('Headroom CCR');
        if (!ponytailCheck.installed) missing.push('Ponytail YAGNI (GitHub)');
        if (!antiSlopCheck.installed) missing.push('Anti-Slop (GitHub)');
        if (!jevGraphCheck.installed) missing.push('JevGraph Knowledge Graph');
        if (isOmniMissing) missing.push('OmniRoute Gateway');

        const options = ['🤖 Ask AI (Copy Prompt)'];
        if (!jevGraphCheck.installed) {
            options.push('🕸️ Sync JevGraph GitHub');
        }
        if (!antiSlopCheck.installed) {
            options.push('🛡️ Sync Anti-Slop GitHub');
        }
        if (!ponytailCheck.installed) {
            options.push('🥋 Sync Ponytail GitHub');
        }
        options.push('⚡ Auto-Run in Terminal', 'Open Setup Hub');

        vscode.window.showWarningMessage(
            `⚡ Token Saver: ${missing.join(' & ')} not detected. Choose how you would like to fetch from GitHub / install:`,
            ...options
        ).then(choice => {
            if (choice === '🤖 Ask AI (Copy Prompt)') {
                vscode.commands.executeCommand('tokenSaver.copyAiInstallPrompt');
            } else if (choice === '🕸️ Sync JevGraph GitHub') {
                vscode.commands.executeCommand('tokenSaver.syncJevGraph');
            } else if (choice === '🛡️ Sync Anti-Slop GitHub') {
                vscode.commands.executeCommand('tokenSaver.syncAntiSlop');
            } else if (choice === '🥋 Sync Ponytail GitHub') {
                vscode.commands.executeCommand('tokenSaver.syncPonytail');
            } else if (choice === '⚡ Auto-Run in Terminal') {
                vscode.commands.executeCommand('tokenSaver.installCli');
            } else if (choice === 'Open Setup Hub') {
                vscode.commands.executeCommand('tokenSaver.openDashboard');
            }
        });
    }

    // Auto-start OmniRoute gateway if configured and enabled
    if (omniRouteEnabled && config.get('omniRouteAutoStart', false)) {
        OmniRouteService.startGateway(omniPort);
    }

    // Auto-install skills (Way 1: Chat / Slash Commands) & sync Multi-IDE rules (Way 2: Dashboard & Status Bar)
    // Ensures Way 1 & Way 2 are both available simultaneously out-of-the-box upon plugin installation
    if (autoInstallSkills) {
        try {
            SkillInstaller.installAllSkills();
        } catch (err) {
            outputChannel.appendLine(`Notice: Skill auto-installer: ${err.message}`);
        }
    }

    SkillInstaller.syncRules(isEnabled, targetScope);
    await refreshStatus(context);

    // Automatic update check on startup if enabled
    if (config.get('checkForUpdatesOnStartup', true)) {
        setTimeout(() => {
            RtkUpdater.checkForUpdates(true);
        }, 4000);
    }

    // Check weekly auto sync
    setTimeout(() => {
        checkWeeklyAutoSync(context);
    }, 6000);

    // Auto-build JevGraph from existing repo docs and start auto-watcher
    setTimeout(() => {
        try {
            JevGraphService.autoInitialBuild(outputChannel);
            JevGraphService.setupDocumentWatcher(context, outputChannel);
        } catch (e) {
            outputChannel.appendLine(`[Token Saver] JevGraph startup error: ${e.message}`);
        }
    }, 3500);

    // Watch for project / repository changes to reset and auto-build per repo
    context.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders(async (e) => {
            if (e.added.length > 0) {
                const newRepo = e.added[0];
                const root = newRepo.uri.fsPath;
                const check = JevGraphService.hasRepoKnowledgeGraph(root);
                if (outputChannel) {
                    if (check.exists) {
                        outputChannel.appendLine(`[Token Saver] Workspace switched to '${newRepo.name}'. Detected existing knowledge graph (${check.entityCount} entities, ${check.relationCount} relations). Preserved.`);
                    } else {
                        outputChannel.appendLine(`[Token Saver] Workspace switched to '${newRepo.name}'. No existing graph found. Checking for repo documents to build initial graph...`);
                    }
                }
                await JevGraphService.autoInitialBuild(outputChannel);
                await refreshStatus(context);
            }
        })
    );

    // Periodic metrics refresher & weekly auto sync check
    metricsInterval = setInterval(() => {
        refreshStatus(context);
        checkWeeklyAutoSync(context);
    }, 30000);

    // Listen to configuration changes (e.g. tokenPricePerMillion, statusMetricDisplay, ponytailMode, antiSlopEnabled, antiSlopMode, headroomEnabled, omniRouteEnabled)
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration('tokenSaver')) {
                if (e.affectsConfiguration('tokenSaver.ponytailMode') ||
                    e.affectsConfiguration('tokenSaver.antiSlopEnabled') ||
                    e.affectsConfiguration('tokenSaver.antiSlopMode') ||
                    e.affectsConfiguration('tokenSaver.terseAgentMode') ||
                    e.affectsConfiguration('tokenSaver.compactDiffContext') ||
                    e.affectsConfiguration('tokenSaver.astOutlineContext') ||
                    e.affectsConfiguration('tokenSaver.headroomEnabled')) {
                    const scope = vscode.workspace.getConfiguration('tokenSaver').get('targetScope', 'all');
                    SkillInstaller.syncRules(isEnabled, scope);
                }
                await refreshStatus(context);
            }
        })
    );

    // Commands
    const openDashboardCmd = vscode.commands.registerCommand('tokenSaver.openDashboard', () => {
        DashboardPanel.createOrShow(context.extensionUri, context);
    });

    async function setTokenSaverState(targetEnabled) {
        isEnabled = targetEnabled;
        await context.globalState.update('tokenSaver.enabled', isEnabled);
        const scope = vscode.workspace.getConfiguration('tokenSaver').get('targetScope', 'all');
        const results = SkillInstaller.syncRules(isEnabled, scope);
        await refreshStatus(context);
        return results;
    }

    const toggleCmd = vscode.commands.registerCommand('tokenSaver.toggle', async () => {
        const results = await setTokenSaverState(!isEnabled);
        vscode.window.showInformationMessage(
            isEnabled
                ? `⚡ Token Saver (RTK) is now ENABLED across ${results.length} AI agent target(s).`
                : '⚪ Token Saver (RTK) is now DISABLED.'
        );
    });

    const enableCmd = vscode.commands.registerCommand('tokenSaver.enable', async () => {
        await setTokenSaverState(true);
        vscode.window.showInformationMessage('⚡ Token Saver (RTK) ENABLED across all configured AI Agent targets.');
    });

    const disableCmd = vscode.commands.registerCommand('tokenSaver.disable', async () => {
        await setTokenSaverState(false);
        vscode.window.showInformationMessage('⚪ Token Saver (RTK) DISABLED.');
    });

    const syncAllIdeRulesCmd = vscode.commands.registerCommand('tokenSaver.syncAllIdeRules', async () => {
        try {
            const detected = SkillInstaller.detectCurrentIde();
            const results = SkillInstaller.syncRules(isEnabled, 'current');
            vscode.window.showInformationMessage(
                `🚀 Synced RTK automation rules for ${detected.displayName} (${results.length} target${results.length > 1 ? 's' : ''})!`
            );
            await refreshStatus(context);
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to sync IDE rules: ${err.message}`);
        }
    });

    const selectIdeTargetsCmd = vscode.commands.registerCommand('tokenSaver.selectIdeTargets', async () => {
        const ideStatus = SkillInstaller.getIdeStatus();
        const items = ideStatus.map(target => ({
            label: `${target.synced ? '$(check)' : '$(circle-outline)'} ${target.name}`,
            description: target.path,
            targetId: target.id,
            picked: target.synced
        }));

        const selected = await vscode.window.showQuickPick(items, {
            canPickMany: true,
            placeHolder: 'Select AI Agent / IDE targets to synchronize RTK rules with'
        });

        if (selected) {
            const chosenIds = selected.map(s => s.targetId);
            SkillInstaller.syncRules(true, chosenIds);
            vscode.window.showInformationMessage(`⚡ Synced RTK rules for: ${selected.map(s => s.label).join(', ')}`);
            await refreshStatus(context);
        }
    });

    const checkUpdatesCmd = vscode.commands.registerCommand('tokenSaver.checkUpdates', async () => {
        await RtkUpdater.showSyncPicker();
        await refreshStatus(context);
    });

    const updateRtkCmd = vscode.commands.registerCommand('tokenSaver.updateRtk', async () => {
        await RtkUpdater.showSyncPicker();
        await refreshStatus(context);
    });

    const installSkillsCmd = vscode.commands.registerCommand('tokenSaver.installSkills', async () => {
        try {
            const results = SkillInstaller.installAllSkills();
            const dests = results.map(r => r.destination).join(' and ');
            vscode.window.showInformationMessage(
                `🧠 Successfully installed all 27 AI Agent skills (/rtk-*, /ponytail-*, /antislop-*) to: ${dests}!`
            );
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to install skills: ${err.message}`);
        }
    });

    const uninstallSkillsCmd = vscode.commands.registerCommand('tokenSaver.uninstallSkills', async () => {
        const skillSets = [
            { label: '🗑️ All Skills (All 27 Chat Commands)', description: 'RTK, Ponytail & Anti-Slop skills', value: 'all' },
            { label: '⚡ RTK Core Skills (15 Skills)', description: '/rtk-gain, /rtk-run, /rtk-tree, /rtk-outline, etc.', value: 'rtk' },
            { label: '🥋 Ponytail Skills (6 Skills)', description: '/ponytail, /ponytail-audit, /ponytail-gain, etc.', value: 'ponytail' },
            { label: '🛡️ Anti-Slop Skills (6 Skills)', description: '/antislop, /antislop-ui, /antislop-code, etc.', value: 'antislop' }
        ];

        const selectedSet = await vscode.window.showQuickPick(skillSets, {
            placeHolder: 'Select the skill set you want to uninstall:'
        });
        if (!selectedSet) return;

        const scopes = [
            { label: '🌐 Global & Workspace (All Targets)', description: 'Clean both ~/.gemini/config and .agents', value: 'all' },
            { label: '🏠 Global Config Only', description: 'Remove from ~/.gemini/config/skills/', value: 'global' },
            { label: '📁 Workspace Only', description: 'Remove from current workspace .agents/skills/', value: 'workspace' }
        ];

        const selectedScope = await vscode.window.showQuickPick(scopes, {
            placeHolder: `Uninstall ${selectedSet.label} from which scope?`
        });
        if (!selectedScope) return;

        try {
            const res = SkillInstaller.uninstallSkillSet(selectedSet.value, selectedScope.value);
            vscode.window.showInformationMessage(
                `🗑️ Successfully uninstalled ${res.total.length} skill(s) (${selectedSet.label}) from ${selectedScope.label}.`
            );
            await refreshStatus(context);
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to uninstall skills: ${err.message}`);
        }
    });

    const togglePonytailCmd = vscode.commands.registerCommand('tokenSaver.togglePonytail', async () => {
        const cfg = vscode.workspace.getConfiguration('tokenSaver');
        const currentMode = cfg.get('ponytailMode', 'full');
        const newMode = (currentMode === 'off') ? 'full' : 'off';
        await cfg.update('ponytailMode', newMode, vscode.ConfigurationTarget.Global);
        const scope = cfg.get('targetScope', 'all');
        SkillInstaller.syncRules(isEnabled, scope);
        vscode.window.showInformationMessage(
            newMode !== 'off'
                ? `🥋 Ponytail YAGNI mode ENABLED (${newMode.toUpperCase()}).`
                : '⚪ Ponytail YAGNI mode DISABLED.'
        );
        await refreshStatus(context);
    });

    const syncGlobalRulesCmd = vscode.commands.registerCommand('tokenSaver.syncGlobalRules', async () => {
        try {
            SkillInstaller.syncRules(isEnabled, 'global');
            vscode.window.showInformationMessage('⚡ Global Antigravity rules synced to ~/.gemini/config/rules/');
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to sync rules: ${err.message}`);
        }
    });

    const refreshCmd = vscode.commands.registerCommand('tokenSaver.refresh', async () => {
        await refreshStatus(context);
    });

    const showSavingsCmd = vscode.commands.registerCommand('tokenSaver.showSavings', async () => {
        try {
            outputChannel.clear();
            outputChannel.show(true);
            outputChannel.appendLine('Fetching RTK token savings dashboard...\n');
            const data = await RtkService.getSavingsRaw();
            outputChannel.appendLine(data);
        } catch (err) {
            RtkService.runInTerminal('rtk gain');
        }
    });

    const installCliCmd = vscode.commands.registerCommand('tokenSaver.installCli', async () => {
        const isWindows = process.platform === 'win32';
        const isMac = process.platform === 'darwin';
        const cmds = RtkService.getInstallCommands(isWindows, isMac);
        RtkService.runInTerminal(cmds.combinedCmd);
    });

    const copyAiInstallPromptCmd = vscode.commands.registerCommand('tokenSaver.copyAiInstallPrompt', async () => {
        const isWindows = process.platform === 'win32';
        const isMac = process.platform === 'darwin';
        const check = await RtkService.checkInstalled();
        const headroomCheck = await RtkService.checkHeadroomInstalled();
        const ponytailCheck = await RtkService.checkPonytailInstalled();
        const antiSlopCheck = await RtkService.checkAntiSlopInstalled();

        const prompt = RtkService.generateAiInstallPrompt(isWindows, isMac, !check.installed, !headroomCheck.installed, !ponytailCheck.installed, true, !antiSlopCheck.installed);
        await vscode.env.clipboard.writeText(prompt);

        vscode.window.showInformationMessage(
            '🤖 AI Agent setup prompt copied to clipboard! Paste it into your AI assistant chat (Antigravity, Cursor, Windsurf, Claude Code, Cline) to install & fetch tools automatically.',
            'Open Chat'
        );
    });

    const syncPonytailCmd = vscode.commands.registerCommand('tokenSaver.syncPonytail', async () => {
        await RtkUpdater.performPonytailSync();
        await refreshStatus(context);
    });

    const syncAntiSlopCmd = vscode.commands.registerCommand('tokenSaver.syncAntiSlop', async () => {
        await RtkUpdater.performAntiSlopSync();
        await refreshStatus(context);
    });

    const toggleAntiSlopCmd = vscode.commands.registerCommand('tokenSaver.toggleAntiSlop', async () => {
        const cfg = vscode.workspace.getConfiguration('tokenSaver');
        const current = cfg.get('antiSlopEnabled', true);
        await cfg.update('antiSlopEnabled', !current, vscode.ConfigurationTarget.Global);
        const scope = cfg.get('targetScope', 'all');
        SkillInstaller.syncRules(isEnabled, scope);
        vscode.window.showInformationMessage(
            !current
                ? '🛡️ Anti-Slop protection is now ENABLED.'
                : '⚪ Anti-Slop protection is now DISABLED.'
        );
        await refreshStatus(context);
    });

    const setAntiSlopModeCmd = vscode.commands.registerCommand('tokenSaver.setAntiSlopMode', async (modeArg) => {
        let chosenMode = modeArg;
        if (!chosenMode) {
            const currentMode = vscode.workspace.getConfiguration('tokenSaver').get('antiSlopMode', 'during');
            const picks = [
                { label: 'During (Default)', description: 'Direct clean execution in each response without extra turns', value: 'during' },
                { label: 'After', description: 'Two-phase execution (deliver solution first, then self-audit)', value: 'after' },
                { label: 'Ask', description: 'Ask user before running Anti-Slop audit or fixes', value: 'ask' },
                { label: 'Off', description: 'Disable Anti-Slop framework rules', value: 'off' }
            ];
            const sel = await vscode.window.showQuickPick(picks, { placeHolder: `Current Anti-Slop mode: ${currentMode.toUpperCase()}` });
            if (!sel) return;
            chosenMode = sel.value;
        }

        const cfg = vscode.workspace.getConfiguration('tokenSaver');
        await cfg.update('antiSlopMode', chosenMode, vscode.ConfigurationTarget.Global);
        const scope = cfg.get('targetScope', 'all');
        SkillInstaller.syncRules(isEnabled, scope);
        vscode.window.showInformationMessage(`🛡️ Anti-Slop mode set to: ${chosenMode.toUpperCase()}`);
        await refreshStatus(context);
    });

    const uninstallAntiSlopCmd = vscode.commands.registerCommand('tokenSaver.uninstallAntiSlop', async () => {
        await RtkUpdater.performLayerUninstall('antislop');
        await refreshStatus(context);
    });

    const copyInstallCommandsCmd = vscode.commands.registerCommand('tokenSaver.copyInstallCommands', async () => {
        const isWindows = process.platform === 'win32';
        const isMac = process.platform === 'darwin';
        const cmds = RtkService.getInstallCommands(isWindows, isMac);
        await vscode.env.clipboard.writeText(cmds.combinedCmd);
        vscode.window.showInformationMessage('📋 Raw install commands copied to clipboard: ' + cmds.combinedCmd);
    });

    const setPonytailModeCmd = vscode.commands.registerCommand('tokenSaver.setPonytailMode', async (modeArg) => {
        let chosenMode = modeArg;
        if (!chosenMode) {
            const currentMode = vscode.workspace.getConfiguration('tokenSaver').get('ponytailMode', 'full');
            const picks = [
                { label: 'Full (Default)', description: 'YAGNI ladder, stdlib first, max 3 lines explanation, zero fluff', value: 'full' },
                { label: 'Lite', description: 'Informative suggestions with laziest alternative noted', value: 'lite' },
                { label: 'Ultra', description: 'Extremist YAGNI, immediate challenge of speculative code, one-liners', value: 'ultra' },
                { label: 'Off', description: 'Disable Ponytail generation optimization', value: 'off' }
            ];
            const sel = await vscode.window.showQuickPick(picks, { placeHolder: `Current Ponytail mode: ${currentMode.toUpperCase()}` });
            if (!sel) return;
            chosenMode = sel.value;
        }

        const cfg = vscode.workspace.getConfiguration('tokenSaver');
        await cfg.update('ponytailMode', chosenMode, vscode.ConfigurationTarget.Global);
        const scope = cfg.get('targetScope', 'all');
        SkillInstaller.syncRules(isEnabled, scope);
        vscode.window.showInformationMessage(`🥋 Ponytail Token Saver mode set to: ${chosenMode.toUpperCase()}`);
        await refreshStatus(context);
    });

    const toggleHeadroomCmd = vscode.commands.registerCommand('tokenSaver.toggleHeadroom', async () => {
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const current = config.get('headroomEnabled', true);
        await config.update('headroomEnabled', !current, vscode.ConfigurationTarget.Global);
        const scope = config.get('targetScope', 'all');
        SkillInstaller.syncRules(isEnabled, scope);
        vscode.window.showInformationMessage(
            !current
                ? '⚡ Headroom context compression ENABLED.'
                : '⚪ Headroom context compression DISABLED.'
        );
        await refreshStatus(context);
    });

    const runCompactDiffCmd = vscode.commands.registerCommand('tokenSaver.runCompactDiff', async () => {
        outputChannel.clear();
        outputChannel.show(true);
        outputChannel.appendLine('[Token Saver] Running compact diff (-U1 single-line context)...\n');
        const diffText = await RtkService.getCompactDiffRaw();
        outputChannel.appendLine(diffText);
    });

    const generateAstOutlineCmd = vscode.commands.registerCommand('tokenSaver.generateAstOutline', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !editor.document) {
            vscode.window.showWarningMessage('Please open a code file to generate its AST/Symbol outline.');
            return;
        }
        const filePath = editor.document.uri.fsPath;
        const outline = RtkService.generateFileOutline(filePath);
        outputChannel.clear();
        outputChannel.show(true);
        outputChannel.appendLine(outline);
    });

    const startOmniRouteCmd = vscode.commands.registerCommand('tokenSaver.startOmniRoute', async () => {
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const port = config.get('omniRoutePort', 20128);
        OmniRouteService.startGateway(port);
        await refreshStatus(context);
    });

    const stopOmniRouteCmd = vscode.commands.registerCommand('tokenSaver.stopOmniRoute', async () => {
        OmniRouteService.stopGateway();
        await refreshStatus(context);
    });

    const openOmniRouteUiCmd = vscode.commands.registerCommand('tokenSaver.openOmniRouteUi', async () => {
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const port = config.get('omniRoutePort', 20128);
        OmniRouteService.openWebUi(port);
    });

    const omniRouteDoctorCmd = vscode.commands.registerCommand('tokenSaver.omniRouteDoctor', async () => {
        OmniRouteService.runDoctor();
    });

    const installOmniRouteCmd = vscode.commands.registerCommand('tokenSaver.installOmniRoute', async () => {
        OmniRouteService.installCli();
    });

    const copyOmniRouteConfigCmd = vscode.commands.registerCommand('tokenSaver.copyOmniRouteConfig', async () => {
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const port = config.get('omniRoutePort', 20128);
        const presets = OmniRouteService.getIdePresets(port);
        const picks = Object.values(presets).map(p => ({
            label: `${p.icon} ${p.name}`,
            description: p.quickSnippet.replace(/\n/g, ' | '),
            preset: p
        }));
        const sel = await vscode.window.showQuickPick(picks, { placeHolder: 'Select AI coding tool to copy OmniRoute configuration for:' });
        if (sel) {
            await vscode.env.clipboard.writeText(sel.preset.configJson);
            vscode.window.showInformationMessage(`📋 Copied OmniRoute configuration for ${sel.preset.name} to clipboard!`);
        }
    });

    const toggleOmniRouteCmd = vscode.commands.registerCommand('tokenSaver.toggleOmniRoute', async () => {
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const current = config.get('omniRouteEnabled', true);
        await config.update('omniRouteEnabled', !current, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(
            !current
                ? '🌐 OmniRoute AI Gateway feature is now ENABLED.'
                : '⚪ OmniRoute AI Gateway feature is now DISABLED.'
        );
        await refreshStatus(context);
    });

    const enableOmniRouteCmd = vscode.commands.registerCommand('tokenSaver.enableOmniRoute', async () => {
        const config = vscode.workspace.getConfiguration('tokenSaver');
        await config.update('omniRouteEnabled', true, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('🌐 OmniRoute AI Gateway feature ENABLED.');
        await refreshStatus(context);
    });

    const disableOmniRouteCmd = vscode.commands.registerCommand('tokenSaver.disableOmniRoute', async () => {
        const config = vscode.workspace.getConfiguration('tokenSaver');
        await config.update('omniRouteEnabled', false, vscode.ConfigurationTarget.Global);
        OmniRouteService.stopGateway();
        vscode.window.showInformationMessage('⚪ OmniRoute AI Gateway feature DISABLED.');
        await refreshStatus(context);
    });

    const uninstallUpstreamCmd = vscode.commands.registerCommand('tokenSaver.uninstallUpstream', async () => {
        await RtkUpdater.showUninstallPicker();
        await refreshStatus(context);
    });

    const uninstallRtkCmd = vscode.commands.registerCommand('tokenSaver.uninstallRtk', async () => {
        await RtkUpdater.performLayerUninstall('rtk');
        await refreshStatus(context);
    });

    const uninstallHeadroomCmd = vscode.commands.registerCommand('tokenSaver.uninstallHeadroom', async () => {
        await RtkUpdater.performLayerUninstall('headroom');
        await refreshStatus(context);
    });

    const uninstallPonytailCmd = vscode.commands.registerCommand('tokenSaver.uninstallPonytail', async () => {
        await RtkUpdater.performLayerUninstall('ponytail');
        await refreshStatus(context);
    });

    const uninstallOmniRouteCmd = vscode.commands.registerCommand('tokenSaver.uninstallOmniRoute', async () => {
        await RtkUpdater.performLayerUninstall('omniroute');
        await refreshStatus(context);
    });

    const syncJevGraphCmd = vscode.commands.registerCommand('tokenSaver.syncJevGraph', async () => {
        await RtkUpdater.performJevGraphSync();
        await refreshStatus(context);
    });

    const insertDocumentJevGraphCmd = vscode.commands.registerCommand('tokenSaver.insertDocumentJevGraph', async () => {
        await JevGraphService.insertDocumentsInteractive(outputChannel);
    });

    const buildJevGraphCmd = vscode.commands.registerCommand('tokenSaver.buildJevGraph', async () => {
        await JevGraphService.insertDocumentsInteractive(outputChannel);
    });

    const resetJevGraphCmd = vscode.commands.registerCommand('tokenSaver.resetJevGraph', async () => {
        await JevGraphService.resetRepoKnowledgeGraph(outputChannel, true);
        await refreshStatus(context);
    });

    const toggleJevGraphCmd = vscode.commands.registerCommand('tokenSaver.toggleJevGraph', async () => {
        const cfg = vscode.workspace.getConfiguration('tokenSaver');
        const current = cfg.get('jevGraphEnabled', true);
        await cfg.update('jevGraphEnabled', !current, vscode.ConfigurationTarget.Global);
        const scope = cfg.get('targetScope', 'all');
        SkillInstaller.syncRules(isEnabled, scope);
        vscode.window.showInformationMessage(
            !current
                ? '🕸️ JevGraph Knowledge Graph optimization is now ENABLED.'
                : '⚪ JevGraph Knowledge Graph optimization is now DISABLED.'
        );
        await refreshStatus(context);
    });

    const uninstallJevGraphCmd = vscode.commands.registerCommand('tokenSaver.uninstallJevGraph', async () => {
        await RtkUpdater.performLayerUninstall('jevgraph');
        await refreshStatus(context);
    });

    const uninstallAllUpstreamCmd = vscode.commands.registerCommand('tokenSaver.uninstallAllUpstream', async () => {
        await RtkUpdater.performAllUninstall();
        await refreshStatus(context);
    });

    context.subscriptions.push(
        openDashboardCmd,
        toggleCmd,
        enableCmd,
        disableCmd,
        toggleHeadroomCmd,
        syncAllIdeRulesCmd,
        selectIdeTargetsCmd,
        checkUpdatesCmd,
        updateRtkCmd,
        syncPonytailCmd,
        syncAntiSlopCmd,
        syncJevGraphCmd,
        insertDocumentJevGraphCmd,
        resetJevGraphCmd,
        buildJevGraphCmd,
        toggleJevGraphCmd,
        uninstallJevGraphCmd,
        toggleAntiSlopCmd,
        setAntiSlopModeCmd,
        uninstallAntiSlopCmd,
        installSkillsCmd,
        uninstallSkillsCmd,
        syncGlobalRulesCmd,
        refreshCmd,
        showSavingsCmd,
        installCliCmd,
        copyAiInstallPromptCmd,
        copyInstallCommandsCmd,
        setPonytailModeCmd,
        togglePonytailCmd,
        runCompactDiffCmd,
        generateAstOutlineCmd,
        startOmniRouteCmd,
        stopOmniRouteCmd,
        openOmniRouteUiCmd,
        omniRouteDoctorCmd,
        installOmniRouteCmd,
        copyOmniRouteConfigCmd,
        toggleOmniRouteCmd,
        enableOmniRouteCmd,
        disableOmniRouteCmd,
        uninstallUpstreamCmd,
        uninstallRtkCmd,
        uninstallHeadroomCmd,
        uninstallPonytailCmd,
        uninstallAntiSlopCmd,
        uninstallOmniRouteCmd,
        uninstallAllUpstreamCmd
    );
}

function deactivate() {
    if (statusBar) {
        statusBar.dispose();
    }
    if (metricsInterval) {
        clearInterval(metricsInterval);
    }
}

module.exports = {
    activate,
    deactivate
};