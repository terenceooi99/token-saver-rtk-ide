const https = require('https');
const vscode = require('vscode');
const RtkService = require('./rtk-service');
const SkillInstaller = require('./skill-installer');

class RtkUpdater {
    static fetchGitHubJson(repoPath) {
        return new Promise((resolve) => {
            const options = {
                hostname: 'api.github.com',
                path: repoPath,
                method: 'GET',
                headers: {
                    'User-Agent': 'TokenSaver-Antigravity-IDE-Extension'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const parsed = JSON.parse(data);
                            resolve({ success: true, data: parsed });
                        } catch (e) {
                            resolve({ success: false, error: 'Failed to parse JSON response' });
                        }
                    } else if (res.statusCode === 403) {
                        resolve({
                            success: false,
                            error: 'GitHub API rate limit exceeded. Please try again later.'
                        });
                    } else {
                        resolve({
                            success: false,
                            error: `GitHub API returned status ${res.statusCode}`
                        });
                    }
                });
            });

            req.on('error', (err) => {
                resolve({ success: false, error: err.message });
            });

            req.setTimeout(8000, () => {
                req.destroy();
                resolve({ success: false, error: 'GitHub request timed out' });
            });

            req.end();
        });
    }

    static async getLatestRelease(repo = 'rtk-ai/rtk') {
        const res = await this.fetchGitHubJson(`/repos/${repo}/releases/latest`);
        if (res.success && res.data) {
            const release = res.data;
            return {
                success: true,
                tag: release.tag_name,
                name: release.name || release.tag_name,
                body: release.body || '',
                htmlUrl: release.html_url,
                publishedAt: release.published_at
            };
        }

        // Fallback to tags if latest release is not published as formal release
        const tagsRes = await this.fetchGitHubJson(`/repos/${repo}/tags`);
        if (tagsRes.success && Array.isArray(tagsRes.data) && tagsRes.data.length > 0) {
            const tag = tagsRes.data[0];
            return {
                success: true,
                tag: tag.name,
                name: tag.name,
                body: '',
                htmlUrl: `https://github.com/${repo}/releases/tag/${tag.name}`,
                publishedAt: null
            };
        }

        // Fallback to main branch commit for repository tracking (e.g. prompt/rules repos)
        const commitRes = await this.fetchGitHubJson(`/repos/${repo}/commits/main`);
        if (commitRes.success && commitRes.data) {
            const shortSha = (commitRes.data.sha || '').substring(0, 7);
            return {
                success: true,
                tag: `main@${shortSha}`,
                name: `main (${shortSha})`,
                body: commitRes.data.commit ? commitRes.data.commit.message : '',
                htmlUrl: `https://github.com/${repo}`,
                publishedAt: commitRes.data.commit && commitRes.data.commit.author ? commitRes.data.commit.author.date : null
            };
        }

        return {
            success: false,
            error: res.error || 'No release tags found'
        };
    }

    static isNewer(latestStr, currentStr) {
        const clean = s => (s || '').replace(/^[^\d]*/, '').trim();
        const latest = clean(latestStr);
        const current = clean(currentStr);
        if (!latest || !current) return false;
        return latest.localeCompare(current, undefined, { numeric: true, sensitivity: 'base' }) > 0;
    }

    static async checkForUpdates(silent = false) {
        try {
            const [rtkCheck, headroomCheck, ponytailCheck, omniCheck, antiSlopCheck, jevCheck, rtkRelease, headroomRelease, ponytailRelease, omniRelease, antiSlopRelease, jevRelease] = await Promise.all([
                RtkService.checkInstalled(),
                RtkService.checkHeadroomInstalled(),
                RtkService.checkPonytailInstalled(),
                RtkService.checkOmniRouteInstalled ? RtkService.checkOmniRouteInstalled() : require('./omniroute-service').checkInstalled(),
                RtkService.checkAntiSlopInstalled ? RtkService.checkAntiSlopInstalled() : { installed: false, skillsCount: 0 },
                RtkService.checkJevGraphInstalled ? RtkService.checkJevGraphInstalled() : { installed: false },
                this.getLatestRelease('rtk-ai/rtk'),
                this.getLatestRelease('headroomlabs-ai/headroom'),
                this.getLatestRelease('DietrichGebert/ponytail'),
                this.getLatestRelease('diegosouzapw/OmniRoute'),
                this.getLatestRelease('miqdadbadjuber/anti-slop'),
                this.getLatestRelease('chenmingtang830/jevgraph')
            ]);

            const rtkHasUpdate = rtkRelease.success && rtkCheck.installed && this.isNewer(rtkRelease.tag, rtkCheck.version);
            const headroomHasUpdate = headroomRelease.success && headroomCheck.installed && this.isNewer(headroomRelease.tag, headroomCheck.version);
            const ponytailHasUpdate = ponytailRelease.success && (!ponytailCheck.installed || (ponytailCheck.skillsCount && ponytailCheck.skillsCount < 6));
            const omniHasUpdate = omniRelease.success && omniCheck.installed && this.isNewer(omniRelease.tag, omniCheck.version);
            const antiSlopHasUpdate = antiSlopRelease.success && (!antiSlopCheck.installed || (antiSlopCheck.skillsCount && antiSlopCheck.skillsCount < 6));
            const jevHasUpdate = jevRelease.success && (!jevCheck.installed);
            const hasAnyUpdate = rtkHasUpdate || headroomHasUpdate || ponytailHasUpdate || omniHasUpdate || antiSlopHasUpdate || jevHasUpdate;

            if (hasAnyUpdate) {
                const updatesList = [];
                if (rtkHasUpdate) updatesList.push(`RTK ${rtkRelease.tag}`);
                if (headroomHasUpdate) updatesList.push(`Headroom ${headroomRelease.tag}`);
                if (ponytailHasUpdate) updatesList.push(`Ponytail (${ponytailRelease.tag || 'Latest'})`);
                if (omniHasUpdate) updatesList.push(`OmniRoute ${omniRelease.tag}`);
                if (antiSlopHasUpdate) updatesList.push(`Anti-Slop (${antiSlopRelease.tag || 'Latest'})`);
                if (jevHasUpdate) updatesList.push(`JevGraph (${jevRelease.tag || 'Latest'})`);

                const choice = await vscode.window.showInformationMessage(
                    `🚀 Upstream updates available: ${updatesList.join(' & ')}`,
                    'Update / Sync All',
                    'Sync JevGraph GitHub',
                    'Sync Anti-Slop GitHub',
                    'Sync Ponytail GitHub',
                    'Update RTK',
                    'Update Headroom',
                    'Update OmniRoute',
                    'Release Notes'
                );

                if (choice === 'Update / Sync All') {
                    this.performAllUpdates();
                } else if (choice === 'Sync JevGraph GitHub') {
                    await this.performJevGraphSync();
                } else if (choice === 'Sync Anti-Slop GitHub') {
                    await this.performAntiSlopSync();
                } else if (choice === 'Sync Ponytail GitHub') {
                    await this.performPonytailSync();
                } else if (choice === 'Update RTK') {
                    this.performUpdate();
                } else if (choice === 'Update Headroom') {
                    this.performHeadroomUpdate();
                } else if (choice === 'Update OmniRoute') {
                    this.performOmniRouteUpdate();
                } else if (choice === 'Release Notes') {
                    if (rtkRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(rtkRelease.htmlUrl));
                    if (headroomRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(headroomRelease.htmlUrl));
                    if (ponytailRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(ponytailRelease.htmlUrl));
                    if (antiSlopRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(antiSlopRelease.htmlUrl));
                    if (omniRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(omniRelease.htmlUrl));
                    if (jevRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(jevRelease.htmlUrl));
                }
            } else if (!silent) {
                vscode.window.showInformationMessage(
                    `✓ All upstream layers (RTK ${rtkCheck.version || 'installed'}, Headroom ${headroomCheck.version || 'installed'}, Ponytail, Anti-Slop, OmniRoute & JevGraph) are up-to-date!`
                );
            }

            return {
                hasUpdate: hasAnyUpdate,
                rtk: {
                    hasUpdate: rtkHasUpdate,
                    release: rtkRelease,
                    installed: rtkCheck.installed,
                    currentVersion: rtkCheck.version
                },
                headroom: {
                    hasUpdate: headroomHasUpdate,
                    release: headroomRelease,
                    installed: headroomCheck.installed,
                    currentVersion: headroomCheck.version
                },
                ponytail: {
                    hasUpdate: ponytailHasUpdate,
                    release: ponytailRelease,
                    installed: ponytailCheck.installed,
                    currentVersion: ponytailCheck.version || 'v1.0.0',
                    skillsCount: ponytailCheck.skillsCount || 0
                },
                antislop: {
                    hasUpdate: antiSlopHasUpdate,
                    release: antiSlopRelease,
                    installed: antiSlopCheck.installed,
                    currentVersion: antiSlopCheck.version || 'v3.2.20',
                    skillsCount: antiSlopCheck.skillsCount || 0
                },
                omniroute: {
                    hasUpdate: omniHasUpdate,
                    release: omniRelease,
                    installed: omniCheck.installed,
                    currentVersion: omniCheck.version
                },
                jevgraph: {
                    hasUpdate: jevHasUpdate,
                    release: jevRelease,
                    installed: jevCheck.installed,
                    currentVersion: jevCheck.version || 'Ready'
                }
            };
        } catch (err) {
            if (!silent) {
                vscode.window.showErrorMessage(`Failed to check for upstream updates: ${err.message}`);
            }
            return { hasUpdate: false, error: err.message };
        }
    }

    static performUpdate() {
        const isWindows = process.platform === 'win32';
        const isMac = process.platform === 'darwin';

        let updateCmd;
        if (isWindows) {
            updateCmd = 'winget upgrade --id rtk-ai.rtk --accept-source-agreements --accept-package-agreements';
        } else if (isMac) {
            updateCmd = 'brew upgrade rtk || (curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/main/install.sh | bash)';
        } else {
            updateCmd = 'curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/main/install.sh | bash';
        }

        RtkService.runInTerminal(updateCmd);
    }

    static performHeadroomUpdate() {
        const cmd = 'pip install --upgrade "headroom-ai[all]" || pipx upgrade headroom-ai || pip install --upgrade headroom-ai';
        RtkService.runInTerminal(cmd);
    }

    static performOmniRouteUpdate() {
        const isWindows = process.platform === 'win32';
        const cmd = isWindows
            ? `if (Get-Command npm -ErrorAction SilentlyContinue) { npm install -g omniroute } else { Write-Host '⚠️ Node.js / npm not detected. To use OmniRoute, install Node.js (e.g. winget install OpenJS.NodeJS)' }`
            : `command -v npm >/dev/null 2>&1 && npm install -g omniroute || echo "ℹ️ npm not found"`;
        RtkService.runInTerminal(cmd);
    }

    static async performAntiSlopSync() {
        try {
            vscode.window.showInformationMessage('🔄 Fetching & synchronizing Anti-Slop from GitHub (miqdadbadjuber/anti-slop)...');
            const results = SkillInstaller.installAllSkills();
            const config = vscode.workspace.getConfiguration('tokenSaver');
            const isEnabled = config.get('enableOnStartup', true);
            const scope = config.get('targetScope', 'all');
            SkillInstaller.syncRules(isEnabled, scope);

            const dests = results.map(r => r.destination).join(' and ');
            vscode.window.showInformationMessage(
                `🛡️ Successfully fetched and synchronized Anti-Slop suite from GitHub to global IDE: ${dests}!`
            );
            return { success: true, results };
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to sync Anti-Slop from GitHub: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    static async performPonytailSync() {
        try {
            vscode.window.showInformationMessage('🔄 Fetching & synchronizing Ponytail from GitHub (DietrichGebert/ponytail)...');
            const results = SkillInstaller.installAllSkills();
            const config = vscode.workspace.getConfiguration('tokenSaver');
            const isEnabled = config.get('enableOnStartup', true);
            const scope = config.get('targetScope', 'all');
            SkillInstaller.syncRules(isEnabled, scope);

            const dests = results.map(r => r.destination).join(' and ');
            vscode.window.showInformationMessage(
                `🥋 Successfully fetched and synchronized Ponytail YAGNI suite from GitHub to global IDE: ${dests}!`
            );
            return { success: true, results };
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to sync Ponytail from GitHub: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    static performAllUpdates() {
        const isWindows = process.platform === 'win32';
        const isMac = process.platform === 'darwin';
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const omniEnabled = config.get('omniRouteEnabled', true);

        let rtkCmd;
        if (isWindows) {
            rtkCmd = 'winget upgrade --id rtk-ai.rtk --accept-source-agreements --accept-package-agreements';
        } else if (isMac) {
            rtkCmd = 'brew upgrade rtk || (curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/main/install.sh | bash)';
        } else {
            rtkCmd = 'curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/main/install.sh | bash';
        }

        const headroomCmd = isWindows
            ? 'python -m pip install --upgrade "headroom-ai[all]" 2>$null; if (!$?) { pip install --upgrade "headroom-ai[all]" }'
            : 'python3 -m pip install --upgrade "headroom-ai[all]" 2>/dev/null || pip install --upgrade "headroom-ai[all]" || pipx upgrade headroom-ai';

        const omniCmd = isWindows
            ? (omniEnabled ? `if (Get-Command npm -ErrorAction SilentlyContinue) { npm install -g omniroute } else { Write-Host 'ℹ️ Node.js / npm not detected (OmniRoute update skipped)' }` : '')
            : (omniEnabled ? `command -v npm >/dev/null 2>&1 && npm install -g omniroute || true` : '');

        const commands = [rtkCmd, headroomCmd];
        if (omniCmd) commands.push(omniCmd);

        const fullCmd = commands.join(' ; ');
        RtkService.runInTerminal(fullCmd);
        this.performPonytailSync();
        this.performAntiSlopSync();
        this.performJevGraphSync();
    }

    static async performJevGraphSync() {
        const JevGraphService = require('./jevgraph-service');
        const isWindows = process.platform === 'win32';
        const cmds = JevGraphService.getInstallCommands(isWindows);

        try {
            vscode.window.showInformationMessage('🕸️ Syncing JevGraph knowledge graph engine from GitHub (chenmingtang830/jevgraph)...');
            JevGraphService.runInTerminal(cmds.combinedCmd);
            const scope = vscode.workspace.getConfiguration('tokenSaver').get('targetScope', 'all');
            SkillInstaller.installJevGraphSkills(scope);
            SkillInstaller.syncRules(true, scope);
            vscode.window.showInformationMessage('✓ JevGraph skills & directives synced across IDE.');
        } catch (e) {
            vscode.window.showErrorMessage(`Failed to sync JevGraph: ${e.message}`);
        }
    }

    static async performLayerUninstall(layerKey) {
        const OmniRouteService = require('./omniroute-service');
        const config = vscode.workspace.getConfiguration('tokenSaver');

        switch (layerKey) {
            case 'rtk':
                vscode.window.showInformationMessage('🗑️ Launching RTK CLI uninstaller...');
                RtkService.uninstallRtk();
                break;
            case 'headroom':
                vscode.window.showInformationMessage('🗑️ Launching Headroom CCR Python uninstaller...');
                RtkService.uninstallHeadroom();
                break;
            case 'ponytail':
                try {
                    const res = SkillInstaller.uninstallPonytailSkills();
                    await config.update('ponytailMode', 'off', vscode.ConfigurationTarget.Global);
                    const scope = config.get('targetScope', 'all');
                    SkillInstaller.syncRules(config.get('enableOnStartup', true), scope);
                    vscode.window.showInformationMessage(
                        `🥋 Uninstalled Ponytail YAGNI suite (${res.total.length} skills removed). Ponytail mode set to OFF.`
                    );
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to uninstall Ponytail skills: ${e.message}`);
                }
                break;
            case 'antislop':
                try {
                    const res = SkillInstaller.uninstallAntiSlopSkills();
                    await config.update('antiSlopEnabled', false, vscode.ConfigurationTarget.Global);
                    const scope = config.get('targetScope', 'all');
                    SkillInstaller.syncRules(config.get('enableOnStartup', true), scope);
                    vscode.window.showInformationMessage(
                        `🛡️ Uninstalled Anti-Slop suite (${res.total.length} skills removed). Anti-Slop disabled.`
                    );
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to uninstall Anti-Slop skills: ${e.message}`);
                }
                break;
            case 'jevgraph':
                try {
                    const JevGraphService = require('./jevgraph-service');
                    const isWindows = process.platform === 'win32';
                    const cmds = JevGraphService.getUninstallCommands(isWindows);
                    JevGraphService.runInTerminal(cmds.combinedUninstallCmd);
                    const res = SkillInstaller.uninstallJevGraphSkills();
                    await config.update('jevGraphEnabled', false, vscode.ConfigurationTarget.Global);
                    const scope = config.get('targetScope', 'all');
                    SkillInstaller.syncRules(config.get('enableOnStartup', true), scope);
                    vscode.window.showInformationMessage(
                        `🕸️ Uninstalled JevGraph engine & removed ${res.total.length} skills. JevGraph optimization disabled.`
                    );
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to uninstall JevGraph: ${e.message}`);
                }
                break;
            case 'omniroute':
                try {
                    vscode.window.showInformationMessage('🗑️ Stopping OmniRoute & launching uninstaller...');
                    OmniRouteService.uninstallCli();
                    await config.update('omniRouteEnabled', false, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage('🌐 OmniRoute Gateway uninstalled and feature disabled.');
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to uninstall OmniRoute: ${e.message}`);
                }
                break;
            case 'rules_skills':
                try {
                    SkillInstaller.removeAllRules();
                    const sRes = SkillInstaller.uninstallAllSkills();
                    vscode.window.showInformationMessage(
                        `🧹 Cleared all injected Multi-IDE rules and removed ${sRes.total.length} Antigravity/Agent skills.`
                    );
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to clean rules/skills: ${e.message}`);
                }
                break;
            case 'all':
                await this.performAllUninstall();
                break;
            default:
                vscode.window.showWarningMessage(`Unknown layer key: ${layerKey}`);
        }
    }

    static async performAllUninstall() {
        const confirm = await vscode.window.showWarningMessage(
            '⚠️ Are you sure you want to completely UNINSTALL all upstream GitHub layers (RTK, Headroom, Ponytail, Anti-Slop, OmniRoute) and clean all injected rules & skills?',
            { modal: true },
            'Yes, Uninstall Everything',
            'Cancel'
        );

        if (confirm !== 'Yes, Uninstall Everything') {
            return;
        }

        const OmniRouteService = require('./omniroute-service');
        const config = vscode.workspace.getConfiguration('tokenSaver');

        // 1. Remove rules & skills
        try {
            SkillInstaller.removeAllRules();
            SkillInstaller.uninstallAllSkills();
        } catch (e) {
            console.error('Error removing rules/skills:', e);
        }

        // 2. Disable modes
        try {
            await config.update('ponytailMode', 'off', vscode.ConfigurationTarget.Global);
            await config.update('antiSlopEnabled', false, vscode.ConfigurationTarget.Global);
            await config.update('headroomEnabled', false, vscode.ConfigurationTarget.Global);
            await config.update('omniRouteEnabled', false, vscode.ConfigurationTarget.Global);
        } catch (e) {
            // ignore
        }

        // 3. Run uninstallation of CLI binaries
        const isWindows = process.platform === 'win32';
        const isMac = process.platform === 'darwin';
        const cmds = RtkService.getUninstallCommands(isWindows, isMac);
        OmniRouteService.stopGateway();

        RtkService.runInTerminal(cmds.combinedUninstallCmd);

        vscode.window.showInformationMessage(
            '🧹 Full clean uninstall started in terminal. Injected rules and skills have been removed.'
        );
    }

    static async showUninstallPicker() {
        const picks = [
            {
                label: '$(trash) All Upstream GitHub Layers (Full Clean Purge)',
                description: 'Uninstall RTK, Headroom, Ponytail, Anti-Slop, OmniRoute, and remove all injected rules & skills',
                layerKey: 'all'
            },
            {
                label: '$(terminal) RTK CLI Binary (rtk-ai/rtk)',
                description: 'Uninstall rtk CLI binary via winget / brew / rm',
                layerKey: 'rtk'
            },
            {
                label: '$(package) Headroom CCR Layer (headroomlabs-ai/headroom)',
                description: 'Uninstall headroom-ai python package via pip / pipx',
                layerKey: 'headroom'
            },
            {
                label: '$(shield) Anti-Slop Framework (miqdadbadjuber/anti-slop)',
                description: 'Remove /antislop-* skills and disable Anti-Slop rule injection',
                layerKey: 'antislop'
            },
            {
                label: '$(zap) Ponytail YAGNI Suite (DietrichGebert/ponytail)',
                description: 'Remove /ponytail-* skills and turn off Ponytail mode',
                layerKey: 'ponytail'
            },
            {
                label: '$(globe) OmniRoute AI Gateway (diegosouzapw/OmniRoute)',
                description: 'Stop gateway, npm uninstall -g omniroute, and disable feature',
                layerKey: 'omniroute'
            },
            {
                label: '$(type-hierarchy) JevGraph Knowledge Graph (chenmingtang830/jevgraph)',
                description: 'Remove ~/.config/jevgraph, remove /jevgraph-* skills, and disable feature',
                layerKey: 'jevgraph'
            },
            {
                label: '$(clear-all) Injected Multi-IDE Rules & Skills',
                description: 'Strip all rule blocks from AGENTS.md, .cursorrules, etc. and remove .agents/skills',
                layerKey: 'rules_skills'
            }
        ];

        const sel = await vscode.window.showQuickPick(picks, {
            placeHolder: 'Select an upstream GitHub layer or feature to uninstall:'
        });

        if (sel) {
            await this.performLayerUninstall(sel.layerKey);
        }
    }

    static async showSyncPicker() {
        return vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Checking Upstream GitHub releases (RTK, Headroom, Ponytail, Anti-Slop, OmniRoute & JevGraph)...',
                cancellable: false
            },
            async () => {
                const OmniRouteService = require('./omniroute-service');
                const [rtkCheck, headroomCheck, ponytailCheck, omniCheck, antiSlopCheck, jevCheck, rtkRelease, headroomRelease, ponytailRelease, omniRelease, antiSlopRelease, jevRelease] = await Promise.all([
                    RtkService.checkInstalled(),
                    RtkService.checkHeadroomInstalled(),
                    RtkService.checkPonytailInstalled(),
                    RtkService.checkOmniRouteInstalled ? RtkService.checkOmniRouteInstalled() : OmniRouteService.checkInstalled(),
                    RtkService.checkAntiSlopInstalled ? RtkService.checkAntiSlopInstalled() : { installed: false, skillsCount: 0 },
                    RtkService.checkJevGraphInstalled ? RtkService.checkJevGraphInstalled() : { installed: false },
                    this.getLatestRelease('rtk-ai/rtk'),
                    this.getLatestRelease('headroomlabs-ai/headroom'),
                    this.getLatestRelease('DietrichGebert/ponytail'),
                    this.getLatestRelease('diegosouzapw/OmniRoute'),
                    this.getLatestRelease('miqdadbadjuber/anti-slop'),
                    this.getLatestRelease('chenmingtang830/jevgraph')
                ]);

                const rtkHasUpdate = rtkRelease.success && rtkCheck.installed && this.isNewer(rtkRelease.tag, rtkCheck.version);
                const headroomHasUpdate = headroomRelease.success && headroomCheck.installed && this.isNewer(headroomRelease.tag, headroomCheck.version);
                const ponytailHasUpdate = ponytailRelease.success && (!ponytailCheck.installed || (ponytailCheck.skillsCount && ponytailCheck.skillsCount < 6));
                const antiSlopHasUpdate = antiSlopRelease.success && (!antiSlopCheck.installed || (antiSlopCheck.skillsCount && antiSlopCheck.skillsCount < 6));
                const omniHasUpdate = omniRelease.success && omniCheck.installed && this.isNewer(omniRelease.tag, omniCheck.version);
                const jevHasUpdate = jevRelease.success && (!jevCheck.installed);
                const hasAnyUpdate = rtkHasUpdate || headroomHasUpdate || ponytailHasUpdate || antiSlopHasUpdate || omniHasUpdate || jevHasUpdate;

                const picks = [
                    {
                        label: hasAnyUpdate ? '$(cloud-download) Update / Sync All Upstream GitHub Layers' : '$(sync) Sync All Upstream GitHub Layers',
                        description: 'Batch update & sync RTK, Headroom, Ponytail, Anti-Slop, OmniRoute and JevGraph',
                        detail: hasAnyUpdate ? '🚀 Updates available for one or more layers - Click to update all' : '✓ All components up-to-date - Click to force re-sync',
                        actionKey: 'all'
                    },
                    {
                        label: '$(type-hierarchy) JevGraph Knowledge Graph (chenmingtang830/jevgraph)',
                        description: `Installed: ${jevCheck.installed ? (jevCheck.runner || 'Ready') : (jevCheck.uvAvailable ? 'uv Ready' : 'Not Installed')} | GitHub: ${jevRelease.tag || 'Latest'}`,
                        detail: jevHasUpdate
                            ? '🚀 New release / Not synced - Click to fetch & sync from GitHub'
                            : (jevCheck.installed ? '✓ Synced & ready for document graph builds - Click to re-fetch' : '⚡ Click to clone and sync chenmingtang830/jevgraph via uv'),
                        actionKey: 'jevgraph'
                    },
                    {
                        label: '$(shield) Anti-Slop Framework (miqdadbadjuber/anti-slop)',
                        description: `Installed: ${antiSlopCheck.installed ? `${antiSlopCheck.skillsCount || 6}/6 skills active` : 'Not Synced'} | GitHub: ${antiSlopRelease.tag || 'Latest'}`,
                        detail: antiSlopHasUpdate
                            ? `🚀 Update / Missing skills detected - Click to fetch & sync from GitHub`
                            : (antiSlopCheck.installed ? '✓ Synced & active in Global IDE - Click to re-fetch' : '⚡ Click to fetch miqdadbadjuber/anti-slop skills to IDE'),
                        actionKey: 'antislop'
                    },
                    {
                        label: '$(zap) Ponytail YAGNI Suite (DietrichGebert/ponytail)',
                        description: `Installed: ${ponytailCheck.installed ? `${ponytailCheck.skillsCount || 6}/6 skills active` : 'Not Synced'} | GitHub: ${ponytailRelease.tag || 'Latest'}`,
                        detail: ponytailHasUpdate 
                            ? `🚀 Update / Missing skills detected - Click to fetch & sync from GitHub` 
                            : (ponytailCheck.installed ? '✓ Synced & active in Global IDE - Click to re-fetch' : '⚡ Click to fetch DietrichGebert/ponytail skills to IDE'),
                        actionKey: 'ponytail'
                    },
                    {
                        label: '$(terminal) RTK CLI (rtk-ai/rtk)',
                        description: `Installed: ${rtkCheck.installed ? rtkCheck.version : 'Not Installed'} | GitHub: ${rtkRelease.tag || 'Latest'}`,
                        detail: rtkHasUpdate 
                            ? `🚀 Update Available (${rtkCheck.version} ➔ ${rtkRelease.tag}) - Click to update` 
                            : (rtkCheck.installed ? `✓ Up to date (${rtkCheck.version})` : '⚡ Not Installed - Click to install via terminal'),
                        actionKey: 'rtk'
                    },
                    {
                        label: '$(package) Headroom CCR (headroomlabs-ai/headroom)',
                        description: `Installed: ${headroomCheck.installed ? headroomCheck.version : 'Not Installed'} | GitHub: ${headroomRelease.tag || 'Latest'}`,
                        detail: headroomHasUpdate 
                            ? `🚀 Update Available (${headroomCheck.version} ➔ ${headroomRelease.tag}) - Click to update` 
                            : (headroomCheck.installed ? `✓ Up to date (${headroomCheck.version})` : '⚡ Not Installed - Click to install via pip'),
                        actionKey: 'headroom'
                    },
                    {
                        label: '$(globe) OmniRoute AI Gateway (diegosouzapw/OmniRoute)',
                        description: `Installed: ${omniCheck.installed ? (omniCheck.version || 'Ready') : 'Not Installed'} | GitHub: ${omniRelease.tag || 'Latest'}`,
                        detail: omniHasUpdate 
                            ? `🚀 Update Available (${omniCheck.version || 'installed'} ➔ ${omniRelease.tag}) - Click to update` 
                            : (omniCheck.installed ? `✓ Up to date (${omniCheck.version || 'Ready'})` : '⚡ Not Installed - Click to install via npm'),
                        actionKey: 'omniroute'
                    },
                    {
                        label: '$(link-external) View Upstream GitHub Release Notes & Compare',
                        description: 'Open release notes and commit history on GitHub',
                        detail: 'Compare releases for rtk, headroom, ponytail, anti-slop, omniroute & jevgraph in your browser',
                        actionKey: 'notes'
                    }
                ];

                const sel = await vscode.window.showQuickPick(picks, {
                    placeHolder: 'Select an upstream GitHub repository to sync, update, or compare:'
                });

                if (!sel) return;

                if (sel.actionKey === 'all') {
                    this.performAllUpdates();
                } else if (sel.actionKey === 'jevgraph') {
                    await this.performJevGraphSync();
                } else if (sel.actionKey === 'antislop') {
                    await this.performAntiSlopSync();
                } else if (sel.actionKey === 'ponytail') {
                    await this.performPonytailSync();
                } else if (sel.actionKey === 'rtk') {
                    this.performUpdate();
                } else if (sel.actionKey === 'headroom') {
                    this.performHeadroomUpdate();
                } else if (sel.actionKey === 'omniroute') {
                    this.performOmniRouteUpdate();
                } else if (sel.actionKey === 'notes') {
                    if (rtkRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(rtkRelease.htmlUrl));
                    if (headroomRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(headroomRelease.htmlUrl));
                    if (ponytailRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(ponytailRelease.htmlUrl));
                    if (antiSlopRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(antiSlopRelease.htmlUrl));
                    if (omniRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(omniRelease.htmlUrl));
                    if (jevRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(jevRelease.htmlUrl));
                }
            }
        );
    }

    static async manualUpdate() {
        return this.showSyncPicker();
    }
}

module.exports = RtkUpdater;

