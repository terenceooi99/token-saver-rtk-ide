const vscode = require('vscode');
const StatusBarManager = require('./statusbar');
const RtkService = require('./rtk-service');
const RtkUpdater = require('./rtk-updater');
const SkillInstaller = require('./skill-installer');
const OmniRouteService = require('./omniroute-service');
const JevGraphService = require('./jevgraph-service');
const { CodeGraphService } = require('./codegraph-service');
const DashboardPanel = require('./dashboard-panel');
const SidebarProvider = require('./sidebar-provider');
const path = require('path');

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
    const codeGraphCheck = await CodeGraphService.checkInstalled();
    const omniStatus = await OmniRouteService.getGatewayStatus(omniPort);

    const isOmniMissing = omniRouteEnabled && !omniStatus.installed;
    if (!check.installed || !headroomCheck.installed || !ponytailCheck.installed || !antiSlopCheck.installed || !jevGraphCheck.installed || !codeGraphCheck.installed || isOmniMissing) {
        const missing = [];
        if (!check.installed) missing.push('RTK CLI');
        if (!headroomCheck.installed) missing.push('Headroom CCR');
        if (!ponytailCheck.installed) missing.push('Ponytail YAGNI (GitHub)');
        if (!antiSlopCheck.installed) missing.push('Anti-Slop (GitHub)');
        if (!jevGraphCheck.installed) missing.push('JevGraph Knowledge Graph');
        if (!codeGraphCheck.installed) missing.push('CodeGraphContext (GitHub)');
        if (isOmniMissing) missing.push('OmniRoute Gateway');

        const options = ['🤖 Ask AI (Copy Prompt)'];
        if (!codeGraphCheck.installed) {
            options.push('🧬 Sync CodeGraph GitHub');
        }
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
            } else if (choice === '🧬 Sync CodeGraph GitHub') {
                vscode.commands.executeCommand('tokenSaver.syncCodeGraph');
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

    const updateFromOpenVsxCmd = vscode.commands.registerCommand('tokenSaver.updateFromOpenVsx', async () => {
        await RtkUpdater.updateFromOpenVsx(true);
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
        // Step 1: Choose Action & Scope
        const scopes = [
            { label: '🏠 Global Config Only', description: 'Preinstalled in user IDE: ~/.gemini/config/skills/', value: 'global' },
            { label: '📁 Workspace Only', description: 'Based within current project: .agents/skills/', value: 'workspace' },
            { label: '🌐 Global & Workspace (All Targets)', description: 'Clean both ~/.gemini/config and .agents', value: 'all' },
            { label: '♻️ Recover Uninstalled Skills (Global IDE)', description: 'Restore / Re-install all preinstalled agent skills to ~/.gemini/config/skills/', value: 'recover_global' },
            { label: '♻️ Recover Uninstalled Skills (Project Workspace)', description: 'Restore / Re-install all preinstalled agent skills to .agents/skills/', value: 'recover_workspace' },
            { label: '♻️ Recover Uninstalled Skills (All - Global & Project)', description: 'Restore / Re-install all agent skills to both Global IDE and Workspace', value: 'recover_all' },
            { label: '🗑️ Open OS Recycle Bin / Trash', description: 'Inspect or restore deleted skill folders directly in OS file manager', value: 'open_recycle_bin' }
        ];

        const selectedScope = await vscode.window.showQuickPick(scopes, {
            placeHolder: 'Uninstall or Recover Skills (Global IDE vs Project Workspace):'
        });
        if (!selectedScope) return;

        // Handle direct recovery or opening recycle bin
        if (selectedScope.value === 'open_recycle_bin') {
            SkillInstaller.openRecycleBin();
            return;
        }

        if (selectedScope.value === 'recover_global' || selectedScope.value === 'recover_workspace' || selectedScope.value === 'recover_all') {
            const target = selectedScope.value === 'recover_global' ? 'global' : (selectedScope.value === 'recover_workspace' ? 'workspace' : 'all');
            try {
                const results = SkillInstaller.installSkills(target);
                const dests = results.map(r => r.destination).join(' and ');
                vscode.window.showInformationMessage(
                    `♻️ Successfully recovered and restored all 31 AI Agent skills to: ${dests}!`,
                    'Open Recycle Bin'
                ).then(sel => {
                    if (sel === 'Open Recycle Bin') SkillInstaller.openRecycleBin();
                });
                await refreshStatus(context);
            } catch (recErr) {
                vscode.window.showErrorMessage(`Failed to recover uninstalled skills: ${recErr.message}`);
            }
            return;
        }

        // Step 2: Choose Method (Pick Individual Skills vs Preset Set)
        const installedSkills = SkillInstaller.listInstalledSkills(selectedScope.value);
        const uniqueSkillNames = [...new Set(installedSkills.map(s => s.name))].sort();

        const methodOptions = [
            {
                label: `🎯 Choose Individual Skills to Uninstall (${uniqueSkillNames.length} detected)`,
                description: 'Select one or more specific skills from list',
                value: 'individual'
            },
            {
                label: '📦 Uninstall by Skill Set (Presets)',
                description: 'RTK Core, Ponytail, Anti-Slop, JevGraph, CodeGraph, or All',
                value: 'set'
            },
            {
                label: '♻️ Recover Uninstalled Skills to this Scope',
                description: `Restore / Re-install all preinstalled agent skills to ${selectedScope.label}`,
                value: 'recover'
            }
        ];

        const selectedMethod = await vscode.window.showQuickPick(methodOptions, {
            placeHolder: 'How would you like to select skills for uninstallation or recovery?'
        });
        if (!selectedMethod) return;

        if (selectedMethod.value === 'recover') {
            try {
                const results = SkillInstaller.installSkills(selectedScope.value);
                const dests = results.map(r => r.destination).join(' and ');
                vscode.window.showInformationMessage(
                    `♻️ Successfully recovered and restored all 31 AI Agent skills to: ${dests}!`,
                    'Open Recycle Bin'
                ).then(sel => {
                    if (sel === 'Open Recycle Bin') SkillInstaller.openRecycleBin();
                });
                await refreshStatus(context);
            } catch (recErr) {
                vscode.window.showErrorMessage(`Failed to recover uninstalled skills: ${recErr.message}`);
            }
            return;
        }

        try {
            if (selectedMethod.value === 'individual') {
                if (uniqueSkillNames.length === 0) {
                    vscode.window.showInformationMessage(`No installed skills found in ${selectedScope.label}.`);
                    return;
                }

                const skillQuickPickItems = uniqueSkillNames.map(name => {
                    const found = installedSkills.find(s => s.name === name);
                    const scopesFound = installedSkills.filter(s => s.name === name).map(s => s.scope);
                    return {
                        label: `🧠 ${name}`,
                        description: `[${scopesFound.join(', ')}] ${found?.description || ''}`,
                        value: name,
                        picked: false
                    };
                });

                const pickedSkills = await vscode.window.showQuickPick(skillQuickPickItems, {
                    placeHolder: 'Select individual skill(s) to uninstall into Recycle Bin (Spacebar to toggle):',
                    canPickMany: true
                });
                if (!pickedSkills || pickedSkills.length === 0) return;

                const toRemove = pickedSkills.map(p => p.value);
                let confirmed = false;
                while (!confirmed) {
                    const confirm = await vscode.window.showWarningMessage(
                        `Are you sure you want to uninstall ${toRemove.length} skill(s) from ${selectedScope.label}? They will be safely moved to your Recycle Bin.`,
                        { modal: true },
                        'Move to Recycle Bin',
                        'Open Recycle Bin'
                    );
                    if (!confirm) return;
                    if (confirm === 'Open Recycle Bin') {
                        SkillInstaller.openRecycleBin();
                        continue;
                    }
                    if (confirm === 'Move to Recycle Bin') {
                        confirmed = true;
                    }
                }

                const res = await SkillInstaller.uninstallSelectedSkills(toRemove, selectedScope.value);
                const afterAction = await vscode.window.showInformationMessage(
                    `🗑️ Moved ${res.total.length} skill(s) to Recycle Bin from ${selectedScope.label}: ${res.total.join(', ')}.`,
                    'Open Recycle Bin'
                );
                if (afterAction === 'Open Recycle Bin') {
                    SkillInstaller.openRecycleBin();
                }
            } else {
                const skillSets = [
                    { label: '🗑️ All Skills (All 31 Chat Commands)', description: 'RTK, Ponytail, Anti-Slop, JevGraph & CodeGraph skills', value: 'all' },
                    { label: '⚡ RTK Core Skills (15 Skills)', description: '/rtk-gain, /rtk-run, /rtk-tree, /rtk-outline, etc.', value: 'rtk' },
                    { label: '🥋 Ponytail Skills (6 Skills)', description: '/ponytail, /ponytail-audit, /ponytail-gain, etc.', value: 'ponytail' },
                    { label: '🛡️ Anti-Slop Skills (6 Skills)', description: '/antislop, /antislop-ui, /antislop-code, etc.', value: 'antislop' },
                    { label: '🕸️ JevGraph Skills (2 Skills)', description: '/jevgraph-build, /jevgraph-query (Doc Graph)', value: 'jevgraph' },
                    { label: '🧬 CodeGraphContext Skills (2 Skills)', description: '/codegraph-query, /codegraph-index (Code Graph)', value: 'codegraph' }
                ];

                const selectedSet = await vscode.window.showQuickPick(skillSets, {
                    placeHolder: 'Select the preset skill set you want to uninstall:'
                });
                if (!selectedSet) return;

                let confirmedSet = false;
                while (!confirmedSet) {
                    const confirm = await vscode.window.showWarningMessage(
                        `Uninstall ${selectedSet.label} from ${selectedScope.label}? Skills will be moved to the Recycle Bin.`,
                        { modal: true },
                        'Move to Recycle Bin',
                        'Open Recycle Bin'
                    );
                    if (!confirm) return;
                    if (confirm === 'Open Recycle Bin') {
                        SkillInstaller.openRecycleBin();
                        continue;
                    }
                    if (confirm === 'Move to Recycle Bin') {
                        confirmedSet = true;
                    }
                }

                const res = await SkillInstaller.uninstallSkillSet(selectedSet.value, selectedScope.value);
                const afterAction = await vscode.window.showInformationMessage(
                    `🗑️ Successfully moved ${res.total.length} skill(s) (${selectedSet.label}) from ${selectedScope.label} to Recycle Bin.`,
                    'Open Recycle Bin'
                );
                if (afterAction === 'Open Recycle Bin') {
                    SkillInstaller.openRecycleBin();
                }
            }
            await refreshStatus(context);
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to uninstall skills: ${err.message}`);
        }
    });

    const temporaryDisableSkillsCmd = vscode.commands.registerCommand('tokenSaver.temporaryDisableSkills', async () => {
        const disabledSkills = SkillInstaller.listDisabledSkills('all');
        const disabledCount = [...new Set(disabledSkills.map(s => s.name))].length;

        const actionOptions = [
            {
                label: '🤖 Agent Decide (AI Prompt Mode)',
                description: 'Copy an optimized prompt for AI agent to pick & ignore irrelevant skills for current session',
                value: 'agent_decide'
            },
            {
                label: '✋ Manual Temporary Disable (Hide from @ and /)',
                description: 'Select specific skill(s) to quarantine so they cannot be @-mentioned or shown in / lists',
                value: 'manual'
            },
            {
                label: `⭮ Re-Enable All Skills (${disabledCount} currently disabled)`,
                description: 'Instantly restore all quarantined skills across project & global repositories',
                value: 're_enable'
            }
        ];

        const selectedAction = await vscode.window.showQuickPick(actionOptions, {
            placeHolder: 'Temporary Disable Skills: Select action'
        });
        if (!selectedAction) return;

        if (selectedAction.value === 'agent_decide') {
            const prompt = SkillInstaller.generateAgentDecidePrompt();
            await vscode.env.clipboard.writeText(prompt);
            vscode.window.showInformationMessage(
                '📋 Agent-Decide prompt copied to clipboard! Paste it into your AI assistant chat to have the AI identify and ignore irrelevant skills.',
                'Open Chat / Dismiss'
            );
            return;
        }

        if (selectedAction.value === 're_enable') {
            const res = SkillInstaller.reEnableAllSkills('all');
            vscode.window.showInformationMessage(
                `⭮ Re-enabled ${res.total.length} skill(s). All skills restored to @ mentions and / action lists.`
            );
            await refreshStatus(context);
            return;
        }

        if (selectedAction.value === 'manual') {
            // Ask for scope
            const scopes = [
                { label: '📁 Workspace Only', description: 'Current project: .agents/skills/', value: 'workspace' },
                { label: '🏠 Global Config Only', description: 'Preinstalled in IDE: ~/.gemini/config/skills/', value: 'global' },
                { label: '🌐 Global & Workspace (All)', description: 'Quarantine across both ~/.gemini/config and .agents', value: 'all' }
            ];

            const selectedScope = await vscode.window.showQuickPick(scopes, {
                placeHolder: 'From which scope do you want to temporarily disable skills?'
            });
            if (!selectedScope) return;

            const installed = SkillInstaller.listInstalledSkills(selectedScope.value);
            const uniqueNames = [...new Set(installed.map(s => s.name))].sort();

            if (uniqueNames.length === 0) {
                vscode.window.showInformationMessage(`No active installed skills found in ${selectedScope.label}.`);
                return;
            }

            const items = uniqueNames.map(name => {
                const found = installed.find(s => s.name === name);
                const scopesFound = installed.filter(s => s.name === name).map(s => s.scope);
                return {
                    label: `🧠 ${name}`,
                    description: `[${scopesFound.join(', ')}] ${found?.description || ''}`,
                    value: name,
                    picked: false
                };
            });

            const picked = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select skills to temporarily quarantine (they will be hidden from @ and / lists):',
                canPickMany: true
            });
            if (!picked || picked.length === 0) return;

            const toDisable = picked.map(p => p.value);
            const res = SkillInstaller.disableSkills(toDisable, selectedScope.value);
            vscode.window.showInformationMessage(
                `⏸️ Temporarily disabled ${res.total.length} skill(s) (${toDisable.join(', ')}). They are quarantined and will not appear in @ or / action lists.`
            );
            await refreshStatus(context);
        }
    });

    const reEnableAllSkillsCmd = vscode.commands.registerCommand('tokenSaver.reEnableAllSkills', async () => {
        const res = SkillInstaller.reEnableAllSkills('all');
        vscode.window.showInformationMessage(
            `⭮ Re-enabled ${res.total.length} skill(s). All skills restored to @ mentions and / action lists.`
        );
        await refreshStatus(context);
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

    const copyAiInstallPromptCmd = vscode.commands.registerCommand('tokenSaver.copyAiInstallPrompt', async (elementKey) => {
        const isWindows = process.platform === 'win32';
        const isMac = process.platform === 'darwin';

        let prompt;
        if (elementKey && typeof elementKey === 'string') {
            prompt = RtkService.generateSingleElementAiPrompt(elementKey, isWindows, isMac);
            await vscode.env.clipboard.writeText(prompt);
            vscode.window.showInformationMessage(
                `🤖 AI setup prompt for ${elementKey.toUpperCase()} copied to clipboard! Paste it into your AI assistant chat to install automatically.`,
                'Open Chat'
            );
        } else {
            const check = await RtkService.checkInstalled();
            const headroomCheck = await RtkService.checkHeadroomInstalled();
            const ponytailCheck = await RtkService.checkPonytailInstalled();
            const antiSlopCheck = await RtkService.checkAntiSlopInstalled();
            const jevGraphCheck = await RtkService.checkJevGraphInstalled();
            const codeGraphCheck = await CodeGraphService.checkInstalled();
            const omniStatus = await OmniRouteService.getGatewayStatus(omniPort);

            const omniMissing = !omniStatus.installed && !omniStatus.running;
            const rtkMissing = !check.installed;
            const headroomMissing = !headroomCheck.installed;
            const ponytailMissing = !ponytailCheck.installed;
            const antiSlopMissing = !antiSlopCheck.installed;
            const jevGraphMissing = !jevGraphCheck.installed;
            const codeGraphMissing = !codeGraphCheck.installed;

            prompt = RtkService.generateAiInstallPrompt(
                isWindows,
                isMac,
                rtkMissing,
                headroomMissing,
                ponytailMissing,
                omniMissing,
                antiSlopMissing,
                jevGraphMissing,
                codeGraphMissing
            );
            await vscode.env.clipboard.writeText(prompt);

            vscode.window.showInformationMessage(
                '🤖 AI Agent setup prompt copied to clipboard! Paste it into your AI assistant chat (Antigravity, Cursor, Windsurf, Claude Code, Cline) to install & fetch tools automatically.',
                'Open Chat'
            );
        }
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

    // CodeGraphContext Commands
    const syncCodeGraphCmd = vscode.commands.registerCommand('tokenSaver.syncCodeGraph', async () => {
        await RtkUpdater.performCodeGraphSync();
        await refreshStatus(context);
    });

    const indexCodeGraphCmd = vscode.commands.registerCommand('tokenSaver.indexCodeGraph', async () => {
        await CodeGraphService.indexWorkspace();
    });

    const queryCodeGraphCmd = vscode.commands.registerCommand('tokenSaver.queryCodeGraph', async () => {
        await CodeGraphService.queryPrompt();
    });

    const toggleCodeGraphCmd = vscode.commands.registerCommand('tokenSaver.toggleCodeGraph', async () => {
        const cfg = vscode.workspace.getConfiguration('tokenSaver');
        const current = cfg.get('codeGraphEnabled', true);
        await cfg.update('codeGraphEnabled', !current, vscode.ConfigurationTarget.Global);
        const scope = cfg.get('targetScope', 'all');
        SkillInstaller.syncRules(isEnabled, scope);
        vscode.window.showInformationMessage(
            !current
                ? '🧬 CodeGraphContext semantic code graph optimization is now ENABLED.'
                : '⚪ CodeGraphContext semantic code graph optimization is now DISABLED.'
        );
        await refreshStatus(context);
    });

    const resetCodeGraphCmd = vscode.commands.registerCommand('tokenSaver.resetCodeGraph', async () => {
        await CodeGraphService.resetGraph();
        await refreshStatus(context);
    });

    const uninstallCodeGraphCmd = vscode.commands.registerCommand('tokenSaver.uninstallCodeGraph', async () => {
        await RtkUpdater.performLayerUninstall('codegraph');
        await refreshStatus(context);
    });

    // Background watcher for code file saves to keep semantic graph fresh
    let autoIndexDebounceTimer = null;
    const codeExts = new Set(['.js', '.jsx', '.ts', '.tsx', '.py', '.rs', '.go', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.rb', '.php', '.swift', '.kt']);
    const onSaveDoc = vscode.workspace.onDidSaveTextDocument((doc) => {
        const cfg = vscode.workspace.getConfiguration('tokenSaver');
        if (!cfg.get('codeGraphEnabled', true) || !cfg.get('codeGraphAutoUpdate', true)) return;
        const ext = path.extname(doc.fileName).toLowerCase();
        if (codeExts.has(ext)) {
            if (autoIndexDebounceTimer) clearTimeout(autoIndexDebounceTimer);
            autoIndexDebounceTimer = setTimeout(() => {
                if (outputChannel) {
                    outputChannel.appendLine(`[CodeGraphContext] Code file saved (${path.basename(doc.fileName)}). Refreshing semantic index...`);
                }
            }, 2500);
        }
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
        updateFromOpenVsxCmd,
        syncPonytailCmd,
        syncAntiSlopCmd,
        syncJevGraphCmd,
        insertDocumentJevGraphCmd,
        resetJevGraphCmd,
        buildJevGraphCmd,
        toggleJevGraphCmd,
        uninstallJevGraphCmd,
        syncCodeGraphCmd,
        indexCodeGraphCmd,
        queryCodeGraphCmd,
        toggleCodeGraphCmd,
        resetCodeGraphCmd,
        uninstallCodeGraphCmd,
        onSaveDoc,
        toggleAntiSlopCmd,
        setAntiSlopModeCmd,
        uninstallAntiSlopCmd,
        installSkillsCmd,
        uninstallSkillsCmd,
        temporaryDisableSkillsCmd,
        reEnableAllSkillsCmd,
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