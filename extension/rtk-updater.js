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
            const [rtkCheck, headroomCheck, ponytailCheck, omniCheck, rtkRelease, headroomRelease, ponytailRelease, omniRelease] = await Promise.all([
                RtkService.checkInstalled(),
                RtkService.checkHeadroomInstalled(),
                RtkService.checkPonytailInstalled(),
                RtkService.checkOmniRouteInstalled ? RtkService.checkOmniRouteInstalled() : require('./omniroute-service').checkInstalled(),
                this.getLatestRelease('rtk-ai/rtk'),
                this.getLatestRelease('headroomlabs-ai/headroom'),
                this.getLatestRelease('DietrichGebert/ponytail'),
                this.getLatestRelease('diegosouzapw/OmniRoute')
            ]);

            const rtkHasUpdate = rtkRelease.success && rtkCheck.installed && this.isNewer(rtkRelease.tag, rtkCheck.version);
            const headroomHasUpdate = headroomRelease.success && headroomCheck.installed && this.isNewer(headroomRelease.tag, headroomCheck.version);
            const ponytailHasUpdate = ponytailRelease.success && (!ponytailCheck.installed || (ponytailCheck.skillsCount && ponytailCheck.skillsCount < 6));
            const omniHasUpdate = omniRelease.success && omniCheck.installed && this.isNewer(omniRelease.tag, omniCheck.version);
            const hasAnyUpdate = rtkHasUpdate || headroomHasUpdate || ponytailHasUpdate || omniHasUpdate;

            if (hasAnyUpdate) {
                const updatesList = [];
                if (rtkHasUpdate) updatesList.push(`RTK ${rtkRelease.tag}`);
                if (headroomHasUpdate) updatesList.push(`Headroom ${headroomRelease.tag}`);
                if (ponytailHasUpdate) updatesList.push(`Ponytail (${ponytailRelease.tag || 'Latest'})`);
                if (omniHasUpdate) updatesList.push(`OmniRoute ${omniRelease.tag}`);

                const choice = await vscode.window.showInformationMessage(
                    `🚀 Upstream updates available: ${updatesList.join(' & ')}`,
                    'Update / Sync All',
                    'Sync Ponytail GitHub',
                    'Update RTK',
                    'Update Headroom',
                    'Update OmniRoute',
                    'Release Notes'
                );

                if (choice === 'Update / Sync All') {
                    this.performAllUpdates();
                } else if (choice === 'Sync Ponytail GitHub') {
                    await this.performPonytailSync();
                } else if (choice === 'Update RTK') {
                    this.performUpdate();
                } else if (choice === 'Update Headroom') {
                    this.performHeadroomUpdate();
                } else if (choice === 'Update OmniRoute') {
                    this.performOmniRouteUpdate();
                } else if (choice === 'Release Notes') {
                    if (rtkHasUpdate && rtkRelease.htmlUrl) {
                        vscode.env.openExternal(vscode.Uri.parse(rtkRelease.htmlUrl));
                    }
                    if (headroomHasUpdate && headroomRelease.htmlUrl) {
                        vscode.env.openExternal(vscode.Uri.parse(headroomRelease.htmlUrl));
                    }
                    if (ponytailRelease.htmlUrl) {
                        vscode.env.openExternal(vscode.Uri.parse(ponytailRelease.htmlUrl));
                    }
                    if (omniHasUpdate && omniRelease.htmlUrl) {
                        vscode.env.openExternal(vscode.Uri.parse(omniRelease.htmlUrl));
                    }
                }
            } else if (!silent) {
                const parts = [];
                if (rtkCheck.installed) {
                    parts.push(`RTK: ${rtkCheck.version}`);
                }
                if (headroomCheck.installed) {
                    parts.push(`Headroom: ${headroomCheck.version}`);
                }
                if (ponytailCheck.installed) {
                    parts.push(`Ponytail: Active`);
                }
                if (omniCheck.installed) {
                    parts.push(`OmniRoute: ${omniCheck.version}`);
                }

                vscode.window.showInformationMessage(
                    `✨ Upstream GitHub Sync Status: ${parts.join(' | ')} (All up-to-date)`,
                    'Sync Ponytail GitHub',
                    'Install/Update CLI Tools'
                ).then(c => {
                    if (c === 'Sync Ponytail GitHub') {
                        this.performPonytailSync();
                    } else if (c === 'Install/Update CLI Tools') {
                        this.performAllUpdates();
                    }
                });
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
                omniroute: {
                    hasUpdate: omniHasUpdate,
                    release: omniRelease,
                    installed: omniCheck.installed,
                    currentVersion: omniCheck.version
                }
            };
        } catch (e) {
            if (!silent) {
                vscode.window.showErrorMessage(`Upstream GitHub update check failed: ${e.message}`);
            }
            return { hasUpdate: false, error: e.message };
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
            '⚠️ Are you sure you want to completely UNINSTALL all upstream GitHub layers (RTK, Headroom, Ponytail, OmniRoute) and clean all injected rules & skills?',
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
                description: 'Uninstall RTK, Headroom, Ponytail, OmniRoute, and remove all injected rules & skills',
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

    static async manualUpdate() {
        vscode.window.showInformationMessage('🔄 Checking & syncing upstream GitHub repositories (rtk, headroom, ponytail & omniroute)...');
        return this.checkForUpdates(false);
    }
}

module.exports = RtkUpdater;

