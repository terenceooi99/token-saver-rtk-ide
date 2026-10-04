const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const RtkService = require('./rtk-service');
const RtkUpdater = require('./rtk-updater');
const SkillInstaller = require('./skill-installer');
const OmniRouteService = require('./omniroute-service');

class WebviewHelper {
    static getHtml(extensionUri, webview) {
        const webviewDir = vscode.Uri.joinPath(extensionUri, 'extension', 'webview');
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(webviewDir, 'dashboard.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(webviewDir, 'dashboard.js'));

        const htmlPath = path.join(extensionUri.fsPath, 'extension', 'webview', 'index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');

        return html
            .replace(/{{styleUri}}/g, styleUri.toString())
            .replace(/{{scriptUri}}/g, scriptUri.toString())
            .replace(/{{cspSource}}/g, webview.cspSource);
    }

    static async getLatestStateData(context, isSidebar = false) {
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const isEnabled = context.globalState.get('tokenSaver.enabled', config.get('enableOnStartup', true));
        const weeklyAutoSync = context.globalState.get('tokenSaver.weeklyAutoSync', config.get('weeklyAutoSync', true));
        const tokenPricePerMillion = config.get('tokenPricePerMillion', 3.00);
        const headroomEnabled = config.get('headroomEnabled', true);
        const omniPort = config.get('omniRoutePort', 20128);

        const check = await RtkService.checkInstalled();
        const headroomCheck = await RtkService.checkHeadroomInstalled();
        const ponytailCheck = await RtkService.checkPonytailInstalled();
        const omniStatus = await OmniRouteService.getGatewayStatus(omniPort);
        const metrics = await RtkService.getParsedMetrics();
        const skillsInstalled = SkillInstaller.checkSkillsInstalled('all');
        const ideStatus = SkillInstaller.getIdeStatus();
        const omniPresets = OmniRouteService.getIdePresets(omniPort);

        return {
            isEnabled,
            weeklyAutoSync,
            tokenPricePerMillion,
            headroomEnabled,
            headroomInstalled: headroomCheck.installed,
            headroomVersion: headroomCheck.version || 'Not installed',
            ponytailInstalled: ponytailCheck.installed,
            ponytailVersion: ponytailCheck.version || 'Not synced',
            ponytailSkillsCount: ponytailCheck.skillsCount || 0,
            ponytailMode: config.get('ponytailMode', 'full'),
            omniRouteEnabled: config.get('omniRouteEnabled', true),
            omniRouteInstalled: omniStatus.installed,
            omniRouteRunning: omniStatus.running,
            omniRoutePort: omniPort,
            omniRouteVersion: omniStatus.version,
            omniRouteEndpoint: omniStatus.endpoint,
            omniRouteWebUiUrl: omniStatus.webUiUrl,
            omniRoutePresets: omniPresets,
            terseAgentMode: config.get('terseAgentMode', true),
            compactDiffContext: config.get('compactDiffContext', true),
            astOutlineContext: config.get('astOutlineContext', true),
            installed: check.installed,
            version: check.version || 'Not installed',
            binaryPath: check.path || 'Not detected',
            metrics,
            skillsInstalled,
            scope: config.get('targetScope', 'all'),
            ideStatus,
            detectedIde: ideStatus.detectedIde,
            isSidebar
        };
    }

    static async handleMessage(message, webview, context, isSidebar = false, onStateRequest = null) {
        const triggerRefresh = (delay = 300) => {
            if (onStateRequest) {
                setTimeout(onStateRequest, delay);
            }
        };

        switch (message.command) {
            case 'ready':
                if (onStateRequest) await onStateRequest();
                break;
            case 'refresh':
                if (onStateRequest) await onStateRequest();
                try {
                    await vscode.commands.executeCommand('tokenSaver.refresh');
                } catch (_) {}
                break;
            case 'popOut':
                if (isSidebar) {
                    vscode.commands.executeCommand('tokenSaver.openDashboard');
                } else {
                    vscode.commands.executeCommand('tokenSaver.sidebarView.focus');
                }
                break;
            case 'minimize':
                vscode.commands.executeCommand('tokenSaver.sidebarView.focus');
                break;
            case 'toggleMode':
                await vscode.commands.executeCommand('tokenSaver.toggle');
                triggerRefresh();
                break;
            case 'syncAllIdeRules':
                await vscode.commands.executeCommand('tokenSaver.syncAllIdeRules');
                triggerRefresh(400);
                break;
            case 'syncSingleTarget':
                if (message.targetId) {
                    SkillInstaller.syncRules(true, [message.targetId]);
                    vscode.window.showInformationMessage(`⚡ Synced RTK rule for ${message.targetId}`);
                    triggerRefresh();
                }
                break;
            case 'toggleTarget':
                if (message.targetId) {
                    SkillInstaller.syncRules(!message.currentlySynced, [message.targetId]);
                    triggerRefresh();
                }
            case 'openSyncPicker':
            case 'checkUpdates':
                await vscode.commands.executeCommand('tokenSaver.checkUpdates');
                triggerRefresh(500);
                break;
            case 'toggleWeeklyAutoSync':
                const isWeekly = message.enabled !== undefined ? message.enabled : true;
                await context.globalState.update('tokenSaver.weeklyAutoSync', isWeekly);
                try {
                    const cfg = vscode.workspace.getConfiguration('tokenSaver');
                    await cfg.update('weeklyAutoSync', isWeekly, vscode.ConfigurationTarget.Global);
                } catch (e) {
                    // ignore configuration update error
                }
                vscode.window.showInformationMessage(
                    isWeekly 
                        ? '⚡ Weekly auto-sync for upstream GitHub RTK is now ENABLED.' 
                        : '⚪ Weekly auto-sync for upstream GitHub RTK is now DISABLED.'
                );
                if (onStateRequest) onStateRequest();
                break;
            case 'updateRtk':
                vscode.commands.executeCommand('tokenSaver.updateRtk');
                break;
            case 'syncPonytail':
                await vscode.commands.executeCommand('tokenSaver.syncPonytail');
                triggerRefresh(500);
                break;
            case 'updateAllUpstream':
                RtkUpdater.performAllUpdates();
                triggerRefresh(500);
                break;
            case 'installCli':
                vscode.commands.executeCommand('tokenSaver.installCli');
                break;
            case 'copyAiInstallPrompt':
                await vscode.commands.executeCommand('tokenSaver.copyAiInstallPrompt');
                webview.postMessage({ type: 'toast', message: '🤖 AI Agent prompt copied to clipboard!' });
                break;
            case 'copyInstallCommands':
                await vscode.commands.executeCommand('tokenSaver.copyInstallCommands');
                webview.postMessage({ type: 'toast', message: '📋 Raw install commands copied to clipboard!' });
                break;
            case 'installSkills':
                await vscode.commands.executeCommand('tokenSaver.installSkills');
                triggerRefresh(500);
                break;
            case 'testLatency':
                const latency = await RtkService.testLatency();
                webview.postMessage({
                    type: 'latencyResult',
                    data: latency
                });
                break;
            case 'openScoreboardTerminal':
                vscode.commands.executeCommand('tokenSaver.showSavings');
                break;
            case 'setTokenPrice':
                const newPrice = parseFloat(message.price);
                if (!isNaN(newPrice) && newPrice >= 0) {
                    const roundedPrice = Math.round(newPrice * 1000) / 1000;
                    try {
                        const cfg = vscode.workspace.getConfiguration('tokenSaver');
                        await cfg.update('tokenPricePerMillion', roundedPrice, vscode.ConfigurationTarget.Global);
                    } catch (e) {
                        // ignore configuration update error
                    }
                    await context.globalState.update('tokenSaver.tokenPricePerMillion', roundedPrice);
                    vscode.window.showInformationMessage(`💰 Token cost estimate rate updated to $${roundedPrice.toFixed(2)} / 1M tokens.`);
                    if (onStateRequest) await onStateRequest();
                }
                break;
            case 'setPonytailMode':
                if (message.mode) {
                    await vscode.commands.executeCommand('tokenSaver.setPonytailMode', message.mode);
                    triggerRefresh(300);
                }
                break;
            case 'toggleTerseMode':
                const newTerse = message.enabled !== undefined ? message.enabled : true;
                try {
                    const cfg = vscode.workspace.getConfiguration('tokenSaver');
                    await cfg.update('terseAgentMode', newTerse, vscode.ConfigurationTarget.Global);
                    const scope = cfg.get('targetScope', 'all');
                    SkillInstaller.syncRules(context.globalState.get('tokenSaver.enabled', true), scope);
                } catch (e) {
                    // ignore
                }
                triggerRefresh(300);
                break;
            case 'toggleHeadroom':
                const newHeadroom = message.enabled !== undefined ? message.enabled : true;
                try {
                    const cfg = vscode.workspace.getConfiguration('tokenSaver');
                    await cfg.update('headroomEnabled', newHeadroom, vscode.ConfigurationTarget.Global);
                    const scope = cfg.get('targetScope', 'all');
                    SkillInstaller.syncRules(context.globalState.get('tokenSaver.enabled', true), scope);
                } catch (e) {
                    // ignore
                }
                vscode.window.showInformationMessage(
                    newHeadroom
                        ? '⚡ Headroom context compression is now ENABLED.'
                        : '⚪ Headroom context compression is now DISABLED.'
                );
                triggerRefresh(300);
                break;
            case 'toggleCompactDiff':
                const newCompact = message.enabled !== undefined ? message.enabled : true;
                try {
                    const cfg = vscode.workspace.getConfiguration('tokenSaver');
                    await cfg.update('compactDiffContext', newCompact, vscode.ConfigurationTarget.Global);
                    const scope = cfg.get('targetScope', 'all');
                    SkillInstaller.syncRules(context.globalState.get('tokenSaver.enabled', true), scope);
                } catch (e) {
                    // ignore
                }
                triggerRefresh(300);
                break;
            case 'toggleAstOutline':
                const newOutline = message.enabled !== undefined ? message.enabled : true;
                try {
                    const cfg = vscode.workspace.getConfiguration('tokenSaver');
                    await cfg.update('astOutlineContext', newOutline, vscode.ConfigurationTarget.Global);
                    const scope = cfg.get('targetScope', 'all');
                    SkillInstaller.syncRules(context.globalState.get('tokenSaver.enabled', true), scope);
                } catch (e) {
                    // ignore
                }
                triggerRefresh(300);
                break;
            case 'runCompactDiff':
                await vscode.commands.executeCommand('tokenSaver.runCompactDiff');
                break;
            case 'runFileOutline':
                await vscode.commands.executeCommand('tokenSaver.generateAstOutline');
                break;
            case 'toggleOmniRoute':
                await vscode.commands.executeCommand('tokenSaver.toggleOmniRoute');
                triggerRefresh(300);
                break;
            case 'startOmniRoute':
                await vscode.commands.executeCommand('tokenSaver.startOmniRoute');
                triggerRefresh(1500);
                break;
            case 'stopOmniRoute':
                await vscode.commands.executeCommand('tokenSaver.stopOmniRoute');
                triggerRefresh(500);
                break;
            case 'openOmniRouteUi':
                await vscode.commands.executeCommand('tokenSaver.openOmniRouteUi');
                break;
            case 'runOmniRouteDoctor':
                await vscode.commands.executeCommand('tokenSaver.omniRouteDoctor');
                break;
            case 'installOmniRoute':
                await vscode.commands.executeCommand('tokenSaver.installOmniRoute');
                triggerRefresh(1000);
                break;
            case 'copyOmniRoutePreset':
                if (message.text) {
                    await vscode.env.clipboard.writeText(message.text);
                    webview.postMessage({ type: 'toast', message: `📋 ${message.presetName || 'Config'} copied to clipboard!` });
                }
                break;
            case 'openUninstallPicker':
                await vscode.commands.executeCommand('tokenSaver.uninstallUpstream');
                triggerRefresh(500);
                break;
            case 'uninstallLayer':
                if (message.layerKey) {
                    await RtkUpdater.performLayerUninstall(message.layerKey);
                    triggerRefresh(500);
                }
                break;
            case 'uninstallAllUpstream':
                await RtkUpdater.performAllUninstall();
                triggerRefresh(500);
                break;
        }
    }
}

module.exports = WebviewHelper;
