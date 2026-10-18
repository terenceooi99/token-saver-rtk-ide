const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');
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
            vscode.window.showInformationMessage('⭮ Fetching & synchronizing Anti-Slop from GitHub (miqdadbadjuber/anti-slop)...');
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
            vscode.window.showInformationMessage('⭮ Fetching & synchronizing Ponytail from GitHub (DietrichGebert/ponytail)...');
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
        this.performCodeGraphSync();
        this.performEccSync();
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

    static async performCodeGraphSync() {
        const { CodeGraphService } = require('./codegraph-service');
        const isWindows = process.platform === 'win32';
        const cmds = CodeGraphService.getInstallCommands(isWindows);

        try {
            vscode.window.showInformationMessage('🧬 Syncing CodeGraphContext semantic code graph engine from GitHub (CodeGraphContext/CodeGraphContext)...');
            RtkService.runInTerminal(cmds.primaryCmd);
            const scope = vscode.workspace.getConfiguration('tokenSaver').get('targetScope', 'all');
            SkillInstaller.installAllSkills(scope);
            SkillInstaller.syncRules(true, scope);
            vscode.window.showInformationMessage('✓ CodeGraphContext skills & directives synced across IDE.');
        } catch (e) {
            vscode.window.showErrorMessage(`Failed to sync CodeGraphContext: ${e.message}`);
        }
    }

    static async performCrwSync() {
        const { CrwService } = require('./crw-service');
        const isWindows = process.platform === 'win32';
        const cmds = CrwService.getInstallCommands(isWindows);

        try {
            vscode.window.showInformationMessage('🕷️ Fetching & installing fastCRW from GitHub (fastcrw/crw)...');
            RtkService.runInTerminal(cmds.primaryCmd);
            const scope = vscode.workspace.getConfiguration('tokenSaver').get('targetScope', 'all');
            SkillInstaller.installAllSkills(scope);
            SkillInstaller.syncRules(true, scope);
            vscode.window.showInformationMessage('✓ fastCRW hybrid web search optimization & directives synced across IDE.');
        } catch (e) {
            vscode.window.showErrorMessage(`Failed to sync fastCRW: ${e.message}`);
        }
    }

    static async performLightpandaSync() {
        const { LightpandaService } = require('./lightpanda-service');
        const isWindows = process.platform === 'win32';
        const isMac = process.platform === 'darwin';
        const cmds = LightpandaService.getInstallCommands(isWindows, isMac);

        try {
            vscode.window.showInformationMessage('🐼 Fetching & installing Lightpanda Browser from GitHub (lightpanda-io/browser)...');
            RtkService.runInTerminal(cmds.primaryCmd);
            const scope = vscode.workspace.getConfiguration('tokenSaver').get('targetScope', 'all');
            SkillInstaller.installAllSkills(scope);
            SkillInstaller.syncRules(true, scope);
            vscode.window.showInformationMessage('✓ Lightpanda Browser & hybrid dynamic MCP directives synced across IDE.');
        } catch (e) {
            vscode.window.showErrorMessage(`Failed to sync Lightpanda: ${e.message}`);
        }
    }

    static async performEccSync() {
        const { EccService } = require('./ecc-service');
        const isWindows = process.platform === 'win32';
        const installPath = vscode.workspace.getConfiguration('tokenSaver').get('upstreamInstallPath', '');
        const cmds = EccService.getInstallCommands(isWindows, installPath);

        try {
            vscode.window.showInformationMessage('🧠 Fetching & syncing ECC skills and harness from GitHub (affaan-m/ECC)...');
            if (installPath) {
                RtkService.runInTerminal(cmds.cloneCmd);
            }
            const scope = vscode.workspace.getConfiguration('tokenSaver').get('targetScope', 'all');
            SkillInstaller.installAllSkills(scope);
            SkillInstaller.syncRules(true, scope);
            vscode.window.showInformationMessage('✓ ECC strategic compaction & context keeper skills synced across IDE.');
        } catch (e) {
            vscode.window.showErrorMessage(`Failed to sync ECC: ${e.message}`);
        }
    }

    /**
     * Restore Point Manifest Management for Upstream GitHub Layers.
     * Stored in workspace .agents/restore_points/ or global ~/.gemini/restore_points/
     */
    static getRestorePointsDir() {
        const folders = vscode.workspace.workspaceFolders;
        if (folders && folders.length > 0) {
            const wsDir = path.join(folders[0].uri.fsPath, '.agents', 'restore_points');
            try {
                if (!fs.existsSync(wsDir)) fs.mkdirSync(wsDir, { recursive: true });
                return wsDir;
            } catch (_) {}
        }
        const homeDir = path.join(os.homedir(), '.gemini', 'restore_points');
        try {
            if (!fs.existsSync(homeDir)) fs.mkdirSync(homeDir, { recursive: true });
        } catch (_) {}
        return homeDir;
    }

    static getRestoreManifestPath() {
        return path.join(this.getRestorePointsDir(), 'upstream_restore_points.json');
    }

    static getRestorePoints() {
        try {
            const manifestPath = this.getRestoreManifestPath();
            if (fs.existsSync(manifestPath)) {
                const raw = fs.readFileSync(manifestPath, 'utf8');
                const list = JSON.parse(raw);
                if (Array.isArray(list)) return list;
            }
        } catch (e) {
            console.warn('Failed to read restore points manifest:', e);
        }
        return [];
    }

    static saveRestorePoints(points) {
        try {
            const manifestPath = this.getRestoreManifestPath();
            fs.writeFileSync(manifestPath, JSON.stringify(points.slice(0, 50), null, 2), 'utf8');
        } catch (e) {
            console.error('Failed to write restore points manifest:', e);
        }
    }

    static createRestorePoint(layerKey, details = {}) {
        const points = this.getRestorePoints();
        const newPoint = {
            id: `rp_${Date.now()}_${layerKey}`,
            timestamp: new Date().toISOString(),
            dateFormatted: new Date().toLocaleString(),
            layerKey,
            name: details.name || layerKey,
            repo: details.repo || null,
            candidateDirs: details.candidateDirs || [],
            trashedDirs: details.trashedDirs || [],
            stateBefore: details.stateBefore || {}
        };
        // Prepend newest
        points.unshift(newPoint);
        this.saveRestorePoints(points);
        return newPoint;
    }

    static async performLayerUninstall(layerKey) {
        const OmniRouteService = require('./omniroute-service');
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const trashedDirs = [];

        // Helper to trash candidate dirs safely to OS Recycle Bin
        const trashDirs = async (dirs) => {
            for (const d of dirs) {
                if (d && fs.existsSync(d)) {
                    const ok = await SkillInstaller.moveToTrash(d);
                    if (ok) trashedDirs.push(d);
                }
            }
        };

        switch (layerKey) {
            case 'rtk': {
                this.createRestorePoint('rtk', {
                    name: 'RTK CLI (rtk-ai/rtk)',
                    repo: 'rtk-ai/rtk',
                    stateBefore: { rtkEnabled: config.get('rtkEnabled', true) }
                });
                vscode.window.showInformationMessage('🗑️ Moving RTK CLI to Recycle Bin & launching uninstaller...');
                RtkService.uninstallRtk();
                break;
            }
            case 'headroom': {
                this.createRestorePoint('headroom', {
                    name: 'Headroom CCR (headroomlabs-ai/headroom)',
                    repo: 'headroomlabs-ai/headroom',
                    stateBefore: { headroomEnabled: config.get('headroomEnabled', true) }
                });
                vscode.window.showInformationMessage('🗑️ Moving Headroom CCR to Recycle Bin & launching uninstaller...');
                RtkService.uninstallHeadroom();
                break;
            }
            case 'ponytail': {
                try {
                    const res = await SkillInstaller.uninstallPonytailSkills();
                    await config.update('ponytailMode', 'off', vscode.ConfigurationTarget.Global);
                    const scope = config.get('targetScope', 'all');
                    SkillInstaller.syncRules(config.get('enableOnStartup', true), scope);
                    this.createRestorePoint('ponytail', {
                        name: 'Ponytail YAGNI Suite (DietrichGebert/ponytail)',
                        repo: 'DietrichGebert/ponytail',
                        trashedDirs: res.total || [],
                        stateBefore: { ponytailMode: 'full' }
                    });
                    vscode.window.showInformationMessage(
                        `🥋 Uninstalled Ponytail YAGNI suite (${res.total.length} skills moved to Recycle Bin). Ponytail mode set to OFF. Restore point saved.`
                    );
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to uninstall Ponytail skills: ${e.message}`);
                }
                break;
            }
            case 'antislop': {
                try {
                    const res = await SkillInstaller.uninstallAntiSlopSkills();
                    await config.update('antiSlopEnabled', false, vscode.ConfigurationTarget.Global);
                    const scope = config.get('targetScope', 'all');
                    SkillInstaller.syncRules(config.get('enableOnStartup', true), scope);
                    this.createRestorePoint('antislop', {
                        name: 'Anti-Slop Framework (miqdadbadjuber/anti-slop)',
                        repo: 'miqdadbadjuber/anti-slop',
                        trashedDirs: res.total || [],
                        stateBefore: { antiSlopEnabled: true }
                    });
                    vscode.window.showInformationMessage(
                        `🛡️ Uninstalled Anti-Slop suite (${res.total.length} skills moved to Recycle Bin). Anti-Slop disabled. Restore point saved.`
                    );
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to uninstall Anti-Slop skills: ${e.message}`);
                }
                break;
            }
            case 'jevgraph': {
                try {
                    const JevGraphService = require('./jevgraph-service');
                    const cands = JevGraphService.getCandidateDirs();
                    await trashDirs(cands);
                    const res = await SkillInstaller.uninstallJevGraphSkills();
                    await config.update('jevGraphEnabled', false, vscode.ConfigurationTarget.Global);
                    const scope = config.get('targetScope', 'all');
                    SkillInstaller.syncRules(config.get('enableOnStartup', true), scope);
                    this.createRestorePoint('jevgraph', {
                        name: 'JevGraph Knowledge Graph (chenmingtang830/jevgraph)',
                        repo: 'chenmingtang830/jevgraph',
                        candidateDirs: cands,
                        trashedDirs: [...trashedDirs, ...(res.total || [])],
                        stateBefore: { jevGraphEnabled: true }
                    });
                    const isWindows = process.platform === 'win32';
                    const cmds = JevGraphService.getUninstallCommands(isWindows);
                    JevGraphService.runInTerminal(cmds.combinedUninstallCmd);
                    vscode.window.showInformationMessage(
                        `🕸️ Uninstalled JevGraph engine & moved directory and ${res.total.length} skills to Recycle Bin. Restore point saved.`
                    );
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to uninstall JevGraph: ${e.message}`);
                }
                break;
            }
            case 'codegraph': {
                try {
                    const { CodeGraphService } = require('./codegraph-service');
                    const cands = CodeGraphService.getCandidateDirs();
                    await trashDirs(cands);
                    await config.update('codeGraphEnabled', false, vscode.ConfigurationTarget.Global);
                    const scope = config.get('targetScope', 'all');
                    SkillInstaller.syncRules(config.get('enableOnStartup', true), scope);
                    this.createRestorePoint('codegraph', {
                        name: 'CodeGraphContext (CodeGraphContext/CodeGraphContext)',
                        repo: 'CodeGraphContext/CodeGraphContext',
                        candidateDirs: cands,
                        trashedDirs,
                        stateBefore: { codeGraphEnabled: true }
                    });
                    const isWindows = process.platform === 'win32';
                    const cmds = CodeGraphService.getUninstallCommands(isWindows);
                    RtkService.runInTerminal(cmds.primaryCmd);
                    vscode.window.showInformationMessage(
                        '🧬 CodeGraphContext directory moved to Recycle Bin and uninstaller started. Restore point saved.'
                    );
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to uninstall CodeGraphContext: ${e.message}`);
                }
                break;
            }
            case 'crw': {
                try {
                    const { CrwService } = require('./crw-service');
                    const cands = CrwService.getCandidateDirs();
                    await trashDirs(cands);
                    await config.update('crwEnabled', false, vscode.ConfigurationTarget.Global);
                    const scope = config.get('targetScope', 'all');
                    SkillInstaller.syncRules(config.get('enableOnStartup', true), scope);
                    this.createRestorePoint('crw', {
                        name: 'fastCRW Static Scraper (fastcrw/crw)',
                        repo: 'fastcrw/crw',
                        candidateDirs: cands,
                        trashedDirs,
                        stateBefore: { crwEnabled: true }
                    });
                    const isWindows = process.platform === 'win32';
                    const cmds = CrwService.getUninstallCommands(isWindows);
                    RtkService.runInTerminal(cmds.primaryCmd);
                    vscode.window.showInformationMessage(
                        '🕷️ fastCRW directory moved to Recycle Bin and uninstaller started. Restore point saved.'
                    );
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to uninstall fastCRW: ${e.message}`);
                }
                break;
            }
            case 'lightpanda': {
                try {
                    const { LightpandaService } = require('./lightpanda-service');
                    const cands = LightpandaService.getCandidateDirs();
                    await trashDirs(cands);
                    await config.update('lightpandaEnabled', false, vscode.ConfigurationTarget.Global);
                    const scope = config.get('targetScope', 'all');
                    SkillInstaller.syncRules(config.get('enableOnStartup', true), scope);
                    this.createRestorePoint('lightpanda', {
                        name: 'Lightpanda Browser (lightpanda-io/browser)',
                        repo: 'lightpanda-io/browser',
                        candidateDirs: cands,
                        trashedDirs,
                        stateBefore: { lightpandaEnabled: true }
                    });
                    const isWindows = process.platform === 'win32';
                    const cmds = LightpandaService.getUninstallCommands(isWindows);
                    RtkService.runInTerminal(cmds.primaryCmd);
                    vscode.window.showInformationMessage(
                        '🐼 Lightpanda Browser directory moved to Recycle Bin and uninstaller started. Restore point saved.'
                    );
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to uninstall Lightpanda: ${e.message}`);
                }
                break;
            }
            case 'ecc': {
                try {
                    const { EccService } = require('./ecc-service');
                    const cands = EccService.getCandidateDirs();
                    await trashDirs(cands);
                    const res = await SkillInstaller.uninstallEccSkills();
                    await config.update('eccEnabled', false, vscode.ConfigurationTarget.Global);
                    const scope = config.get('targetScope', 'all');
                    SkillInstaller.syncRules(config.get('enableOnStartup', true), scope);
                    this.createRestorePoint('ecc', {
                        name: 'ECC Harness Optimization (affaan-m/ECC)',
                        repo: 'affaan-m/ECC',
                        candidateDirs: cands,
                        trashedDirs: [...trashedDirs, ...(res.total || [])],
                        stateBefore: { eccEnabled: true }
                    });
                    vscode.window.showInformationMessage(
                        `🧠 Uninstalled ECC skills (${res.total.length} skills moved to Recycle Bin). Restore point saved.`
                    );
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to uninstall ECC: ${e.message}`);
                }
                break;
            }
            case 'omniroute': {
                try {
                    vscode.window.showInformationMessage('🗑️ Stopping OmniRoute & launching uninstaller...');
                    OmniRouteService.uninstallCli();
                    await config.update('omniRouteEnabled', false, vscode.ConfigurationTarget.Global);
                    this.createRestorePoint('omniroute', {
                        name: 'OmniRoute AI Gateway (diegosouzapw/OmniRoute)',
                        repo: 'diegosouzapw/OmniRoute',
                        stateBefore: { omniRouteEnabled: true }
                    });
                    vscode.window.showInformationMessage('🌐 OmniRoute Gateway uninstalled to Recycle Bin and feature disabled. Restore point saved.');
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to uninstall OmniRoute: ${e.message}`);
                }
                break;
            }
            case 'rules_skills': {
                try {
                    SkillInstaller.removeAllRules();
                    const sRes = await SkillInstaller.uninstallAllSkills();
                    this.createRestorePoint('rules_skills', {
                        name: 'Injected Multi-IDE Rules & Skills',
                        trashedDirs: sRes.total || [],
                        stateBefore: {}
                    });
                    vscode.window.showInformationMessage(
                        `🧹 Cleared all injected Multi-IDE rules and moved ${sRes.total.length} Antigravity/Agent skills to Recycle Bin. Restore point saved.`
                    );
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to clean rules/skills: ${e.message}`);
                }
                break;
            }
            case 'all': {
                await this.performAllUninstall();
                break;
            }
            default:
                vscode.window.showWarningMessage(`Unknown layer key: ${layerKey}`);
        }
    }

    /**
     * Recover / Restore an upstream layer from its restore point or re-synchronize from GitHub
     */
    static async performLayerRecover(layerKey) {
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const scope = config.get('targetScope', 'all');

        vscode.window.showInformationMessage(`♻️ Recovering ${layerKey} upstream layer and re-enabling configuration...`);

        switch (layerKey) {
            case 'rtk':
                await config.update('rtkEnabled', true, vscode.ConfigurationTarget.Global);
                this.performUpdate();
                break;
            case 'headroom':
                await config.update('headroomEnabled', true, vscode.ConfigurationTarget.Global);
                this.performHeadroomUpdate();
                break;
            case 'ponytail':
                await config.update('ponytailMode', 'full', vscode.ConfigurationTarget.Global);
                await this.performPonytailSync();
                break;
            case 'antislop':
                await config.update('antiSlopEnabled', true, vscode.ConfigurationTarget.Global);
                await this.performAntiSlopSync();
                break;
            case 'omniroute':
                await config.update('omniRouteEnabled', true, vscode.ConfigurationTarget.Global);
                this.performOmniRouteUpdate();
                break;
            case 'jevgraph':
                await config.update('jevGraphEnabled', true, vscode.ConfigurationTarget.Global);
                await this.performJevGraphSync();
                break;
            case 'codegraph':
                await config.update('codeGraphEnabled', true, vscode.ConfigurationTarget.Global);
                await this.performCodeGraphSync();
                break;
            case 'crw':
                await config.update('crwEnabled', true, vscode.ConfigurationTarget.Global);
                await this.performCrwSync();
                break;
            case 'lightpanda':
                await config.update('lightpandaEnabled', true, vscode.ConfigurationTarget.Global);
                await this.performLightpandaSync();
                break;
            case 'ecc':
                await config.update('eccEnabled', true, vscode.ConfigurationTarget.Global);
                await this.performEccSync();
                break;
            case 'rules_skills':
                SkillInstaller.installAllSkills(scope);
                SkillInstaller.syncRules(true, scope);
                break;
            default:
                vscode.window.showWarningMessage(`Unknown recovery layer key: ${layerKey}`);
                return;
        }

        SkillInstaller.syncRules(true, scope);
        vscode.window.showInformationMessage(`✓ Upstream layer ${layerKey} successfully restored and active.`);
    }

    /**
     * Display a modal / QuickPick listing available Restore Points to recover from
     */
    static async showRestorePointsPicker() {
        const points = this.getRestorePoints();
        if (points.length === 0) {
            const act = await vscode.window.showInformationMessage(
                'ℹ️ No restore points recorded yet. Would you like to open the OS Recycle Bin?',
                'Open Recycle Bin',
                'Cancel'
            );
            if (act === 'Open Recycle Bin') {
                await this.openOsRecycleBin();
            }
            return;
        }

        const items = points.map(rp => ({
            label: `$(history) ${rp.name || rp.layerKey}`,
            description: `${rp.dateFormatted || rp.timestamp}`,
            detail: rp.trashedDirs && rp.trashedDirs.length > 0
                ? `Moved to Recycle Bin: ${rp.trashedDirs.slice(0, 3).join(', ')}${rp.trashedDirs.length > 3 ? '...' : ''}`
                : 'Click to restore configuration & re-fetch from GitHub',
            point: rp
        }));

        items.unshift({
            label: '$(trash) Open OS Recycle Bin / Trash',
            description: 'View and manually restore deleted folders from Windows Recycle Bin',
            detail: 'Opens the system Recycle Bin in File Explorer',
            point: null,
            action: 'recycle_bin'
        });

        const sel = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a Restore Point to recover or view Recycle Bin:'
        });

        if (!sel) return;

        if (sel.action === 'recycle_bin') {
            await this.openOsRecycleBin();
            return;
        }

        if (sel.point) {
            await this.performLayerRecover(sel.point.layerKey);
        }
    }

    /**
     * Safely open the OS Recycle Bin window
     */
    static async openOsRecycleBin() {
        if (process.platform === 'win32') {
            const { exec } = require('child_process');
            exec('start shell:RecycleBinFolder', (err) => {
                if (err) vscode.window.showErrorMessage(`Failed to open Recycle Bin: ${err.message}`);
            });
        } else if (process.platform === 'darwin') {
            const { exec } = require('child_process');
            exec('open ~/.Trash', (err) => {
                if (err) vscode.window.showErrorMessage(`Failed to open Trash: ${err.message}`);
            });
        } else {
            vscode.window.showInformationMessage('Recycle Bin location: ~/.local/share/Trash');
        }
    }

    static async performAllUninstall() {
        const confirm = await vscode.window.showWarningMessage(
            '⚠️ Are you sure you want to completely UNINSTALL all upstream GitHub layers (RTK, Headroom, Ponytail, Anti-Slop, OmniRoute) and clean all injected rules & skills? All folders will be moved safely to your Recycle Bin with a Restore Point saved.',
            { modal: true },
            'Yes, Uninstall Everything',
            'Cancel'
        );

        if (confirm !== 'Yes, Uninstall Everything') {
            return;
        }

        const OmniRouteService = require('./omniroute-service');
        const config = vscode.workspace.getConfiguration('tokenSaver');

        // Create full restore point
        this.createRestorePoint('all', {
            name: 'All Upstream GitHub Layers (Full Backup)',
            stateBefore: {
                ponytailMode: config.get('ponytailMode'),
                antiSlopEnabled: config.get('antiSlopEnabled'),
                headroomEnabled: config.get('headroomEnabled'),
                omniRouteEnabled: config.get('omniRouteEnabled'),
                jevGraphEnabled: config.get('jevGraphEnabled'),
                codeGraphEnabled: config.get('codeGraphEnabled'),
                crwEnabled: config.get('crwEnabled'),
                lightpandaEnabled: config.get('lightpandaEnabled'),
                eccEnabled: config.get('eccEnabled')
            }
        });

        // 1. Remove rules & skills (safely moved to Recycle Bin)
        try {
            SkillInstaller.removeAllRules();
            await SkillInstaller.uninstallAllSkills();
        } catch (e) {
            console.error('Error removing rules/skills:', e);
        }

        // 2. Disable modes
        try {
            await config.update('ponytailMode', 'off', vscode.ConfigurationTarget.Global);
            await config.update('antiSlopEnabled', false, vscode.ConfigurationTarget.Global);
            await config.update('headroomEnabled', false, vscode.ConfigurationTarget.Global);
            await config.update('omniRouteEnabled', false, vscode.ConfigurationTarget.Global);
            await config.update('jevGraphEnabled', false, vscode.ConfigurationTarget.Global);
            await config.update('codeGraphEnabled', false, vscode.ConfigurationTarget.Global);
            await config.update('crwEnabled', false, vscode.ConfigurationTarget.Global);
            await config.update('lightpandaEnabled', false, vscode.ConfigurationTarget.Global);
            await config.update('eccEnabled', false, vscode.ConfigurationTarget.Global);
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
            '🧹 Full clean uninstall started in terminal. Folders moved to OS Recycle Bin and restore point saved.'
        );
    }

    static async showUninstallPicker() {
        const restorePoints = this.getRestorePoints();
        const rpCountLabel = restorePoints.length > 0 ? ` (${restorePoints.length} saved)` : '';

        const picks = [
            {
                label: `$(history) ♻️ Restore Points & Recovery List...${rpCountLabel}`,
                description: 'Recover uninstalled upstream layers from Restore Points or GitHub',
                detail: 'View recent uninstallation restore points or browse the OS Recycle Bin',
                actionKey: 'restore_points'
            },
            {
                label: '$(trash) Open OS Recycle Bin / Trash',
                description: 'Open the Windows Recycle Bin or Mac Trash directly',
                detail: 'View deleted files and manually restore files if needed',
                actionKey: 'open_recycle_bin'
            },
            {
                label: '$(trash) All Upstream GitHub Layers (Full Clean Purge)',
                description: 'Move all upstream folders to Recycle Bin and create full Restore Point',
                detail: 'RTK, Headroom, Ponytail, Anti-Slop, OmniRoute, JevGraph, CodeGraph, fastCRW, Lightpanda & ECC',
                layerKey: 'all'
            },
            {
                label: '$(browser) Lightpanda Headless Browser (lightpanda-io/browser)',
                description: 'Move local directory to Recycle Bin and disable dynamic MCP fallback',
                layerKey: 'lightpanda'
            },
            {
                label: '$(globe) fastCRW Static Scraper & Search (fastcrw/crw)',
                description: 'Move local directory to Recycle Bin and disable fastCRW markdown feature',
                layerKey: 'crw'
            },
            {
                label: '$(database) CodeGraphContext Semantic Graph (CodeGraphContext/CodeGraphContext)',
                description: 'Move local directory to Recycle Bin and disable code graph feature',
                layerKey: 'codegraph'
            },
            {
                label: '$(type-hierarchy) JevGraph Knowledge Graph (chenmingtang830/jevgraph)',
                description: 'Move local directory & skills to Recycle Bin and disable feature',
                layerKey: 'jevgraph'
            },
            {
                label: '$(circuit-board) ECC Harness Optimization (affaan-m/ECC)',
                description: 'Move ECC skills & candidate directory to Recycle Bin and disable feature',
                layerKey: 'ecc'
            },
            {
                label: '$(shield) Anti-Slop Framework (miqdadbadjuber/anti-slop)',
                description: 'Move /antislop-* skills to Recycle Bin and disable Anti-Slop rule injection',
                layerKey: 'antislop'
            },
            {
                label: '$(zap) Ponytail YAGNI Suite (DietrichGebert/ponytail)',
                description: 'Move /ponytail-* skills to Recycle Bin and turn off Ponytail mode',
                layerKey: 'ponytail'
            },
            {
                label: '$(globe) OmniRoute AI Gateway (diegosouzapw/OmniRoute)',
                description: 'Stop gateway, move configuration to Recycle Bin, and disable feature',
                layerKey: 'omniroute'
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
                label: '$(clear-all) Injected Multi-IDE Rules & Skills',
                description: 'Strip all rule blocks and move .agents/skills to Recycle Bin',
                layerKey: 'rules_skills'
            }
        ];

        const sel = await vscode.window.showQuickPick(picks, {
            placeHolder: 'Select an upstream GitHub layer to uninstall, recover, or manage Restore Points:'
        });

        if (!sel) return;

        if (sel.actionKey === 'restore_points') {
            await this.showRestorePointsPicker();
        } else if (sel.actionKey === 'open_recycle_bin') {
            await this.openOsRecycleBin();
        } else if (sel.layerKey) {
            await this.performLayerUninstall(sel.layerKey);
        }
    }

    static async showSyncPicker() {
        return vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Checking Upstream GitHub releases (RTK, Headroom, Ponytail, Anti-Slop, OmniRoute, JevGraph, CodeGraph, fastCRW & Lightpanda)...',
                cancellable: false
            },
            async () => {
                const OmniRouteService = require('./omniroute-service');
                const { CodeGraphService } = require('./codegraph-service');
                const { CrwService } = require('./crw-service');
                const { LightpandaService } = require('./lightpanda-service');
                const { EccService } = require('./ecc-service');
                const [rtkCheck, headroomCheck, ponytailCheck, omniCheck, antiSlopCheck, jevCheck, codeGraphCheck, crwCheck, lightpandaCheck, eccCheck, rtkRelease, headroomRelease, ponytailRelease, omniRelease, antiSlopRelease, jevRelease, codeGraphRelease, crwRelease, lightpandaRelease, eccRelease] = await Promise.all([
                    RtkService.checkInstalled(),
                    RtkService.checkHeadroomInstalled(),
                    RtkService.checkPonytailInstalled(),
                    RtkService.checkOmniRouteInstalled ? RtkService.checkOmniRouteInstalled() : OmniRouteService.checkInstalled(),
                    RtkService.checkAntiSlopInstalled ? RtkService.checkAntiSlopInstalled() : { installed: false, skillsCount: 0 },
                    RtkService.checkJevGraphInstalled ? RtkService.checkJevGraphInstalled() : { installed: false },
                    CodeGraphService.checkInstalled(),
                    CrwService.checkInstalled(),
                    LightpandaService.checkInstalled(),
                    EccService.checkInstalled(),
                    this.getLatestRelease('rtk-ai/rtk'),
                    this.getLatestRelease('headroomlabs-ai/headroom'),
                    this.getLatestRelease('DietrichGebert/ponytail'),
                    this.getLatestRelease('diegosouzapw/OmniRoute'),
                    this.getLatestRelease('miqdadbadjuber/anti-slop'),
                    this.getLatestRelease('chenmingtang830/jevgraph'),
                    this.getLatestRelease('CodeGraphContext/CodeGraphContext'),
                    this.getLatestRelease('fastcrw/crw'),
                    this.getLatestRelease('lightpanda-io/browser'),
                    this.getLatestRelease('affaan-m/ECC')
                ]);

                const rtkHasUpdate = rtkRelease.success && rtkCheck.installed && this.isNewer(rtkRelease.tag, rtkCheck.version);
                const headroomHasUpdate = headroomRelease.success && headroomCheck.installed && this.isNewer(headroomRelease.tag, headroomCheck.version);
                const ponytailHasUpdate = ponytailRelease.success && (!ponytailCheck.installed || (ponytailCheck.skillsCount && ponytailCheck.skillsCount < 6));
                const antiSlopHasUpdate = antiSlopRelease.success && (!antiSlopCheck.installed || (antiSlopCheck.skillsCount && antiSlopCheck.skillsCount < 6));
                const omniHasUpdate = omniRelease.success && omniCheck.installed && this.isNewer(omniRelease.tag, omniCheck.version);
                const jevHasUpdate = jevRelease.success && (!jevCheck.installed);
                const codeGraphHasUpdate = codeGraphRelease.success && (!codeGraphCheck.installed);
                const crwHasUpdate = crwRelease.success && (!crwCheck.installed);
                const lightpandaHasUpdate = lightpandaRelease.success && (!lightpandaCheck.installed);
                const eccHasUpdate = eccRelease.success && (!eccCheck.installed || (eccCheck.skillsCount && eccCheck.skillsCount < 4));
                const hasAnyUpdate = rtkHasUpdate || headroomHasUpdate || ponytailHasUpdate || antiSlopHasUpdate || omniHasUpdate || jevHasUpdate || codeGraphHasUpdate || crwHasUpdate || lightpandaHasUpdate || eccHasUpdate;

                const picks = [
                    {
                        label: hasAnyUpdate ? '$(cloud-download) Update / Sync All Upstream GitHub Layers' : '$(sync) Sync All Upstream GitHub Layers',
                        description: 'Batch update & sync RTK, Headroom, Ponytail, Anti-Slop, OmniRoute, JevGraph, CodeGraph, fastCRW & Lightpanda',
                        detail: hasAnyUpdate ? '🚀 Updates available for one or more layers - Click to update all' : '✓ All components up-to-date - Click to force re-sync',
                        actionKey: 'all'
                    },
                    {
                        label: '$(globe) fastCRW Hybrid Scraper & Search (fastcrw/crw)',
                        description: `Installed: ${crwCheck.installed ? (crwCheck.runner || 'Ready') : 'Not Installed'} | GitHub: ${crwRelease.tag || 'Latest'}`,
                        detail: crwHasUpdate
                            ? '🚀 New release / Not synced - Click to fetch & sync from GitHub'
                            : (crwCheck.installed ? '✓ Synced & ready for hybrid web search - Click to re-fetch' : '⚡ Click to install fastCRW binary or cargo crate'),
                        actionKey: 'crw'
                    },
                    {
                        label: '$(browser) Lightpanda Browser (lightpanda-io/browser)',
                        description: `Installed: ${lightpandaCheck.installed ? (lightpandaCheck.runner || 'Ready') : 'Not Installed'} | GitHub: ${lightpandaRelease.tag || 'Latest'}`,
                        detail: lightpandaHasUpdate
                            ? '🚀 New release / Not synced - Click to fetch & sync from GitHub'
                            : (lightpandaCheck.installed ? '✓ Synced & ready for dynamic JS MCP - Click to re-fetch' : '⚡ Click to install Lightpanda via npm / binary'),
                        actionKey: 'lightpanda'
                    },
                    {
                        label: '$(database) CodeGraphContext Semantic Code Graph (CodeGraphContext/CodeGraphContext)',
                        description: `Installed: ${codeGraphCheck.installed ? (codeGraphCheck.runner || 'Ready') : 'Not Installed'} | GitHub: ${codeGraphRelease.tag || 'Latest'}`,
                        detail: codeGraphHasUpdate
                            ? '🚀 New release / Not synced - Click to fetch & sync from GitHub'
                            : (codeGraphCheck.installed ? '✓ Synced & ready for code graph queries - Click to re-fetch' : '⚡ Click to install CodeGraphContext via pip'),
                        actionKey: 'codegraph'
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
                        label: '$(circuit-board) ECC Harness Optimization (affaan-m/ECC)',
                        description: `Installed: ${eccCheck.installed ? `${eccCheck.skillsCount || 4}/4 skills active` : 'Not Synced'} | GitHub: ${eccRelease.tag || 'Latest'}`,
                        detail: eccHasUpdate
                            ? '🚀 Update / Missing skills detected - Click to fetch & sync from GitHub'
                            : (eccCheck.installed ? '✓ Synced & active in Global IDE - Click to re-fetch' : '⚡ Click to fetch affaan-m/ECC skills to IDE'),
                        actionKey: 'ecc'
                    },
                    {
                        label: '$(link-external) View Upstream GitHub Release Notes & Compare',
                        description: 'Open release notes and commit history on GitHub',
                        detail: 'Compare releases for rtk, headroom, ponytail, anti-slop, omniroute, jevgraph, codegraph, crw, lightpanda & ecc in your browser',
                        actionKey: 'notes'
                    }
                ];

                const sel = await vscode.window.showQuickPick(picks, {
                    placeHolder: 'Select an upstream GitHub repository to sync, update, or compare:'
                });

                if (!sel) return;

                if (sel.actionKey === 'all') {
                    this.performAllUpdates();
                } else if (sel.actionKey === 'ecc') {
                    await this.performEccSync();
                } else if (sel.actionKey === 'crw') {
                    await this.performCrwSync();
                } else if (sel.actionKey === 'lightpanda') {
                    await this.performLightpandaSync();
                } else if (sel.actionKey === 'codegraph') {
                    await this.performCodeGraphSync();
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
                    if (codeGraphRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(codeGraphRelease.htmlUrl));
                    if (crwRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(crwRelease.htmlUrl));
                    if (lightpandaRelease.htmlUrl) vscode.env.openExternal(vscode.Uri.parse(lightpandaRelease.htmlUrl));
                }
            }
        );
    }

    static fetchOpenVsxJson(apiPath) {
        return new Promise((resolve) => {
            const url = `https://open-vsx.org/api${apiPath}`;
            const req = https.get(url, { headers: { 'User-Agent': 'TokenSaver-IDE-Extension' } }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    const redirectUrl = res.headers.location;
                    https.get(redirectUrl, { headers: { 'User-Agent': 'TokenSaver-IDE-Extension' } }, (res2) => {
                        let data2 = '';
                        res2.on('data', chunk => data2 += chunk);
                        res2.on('end', () => {
                            try {
                                resolve({ success: true, data: JSON.parse(data2) });
                            } catch (e) {
                                resolve({ success: false, error: 'JSON parse error' });
                            }
                        });
                    }).on('error', err => resolve({ success: false, error: err.message }));
                    return;
                }

                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve({ success: true, data: JSON.parse(data) });
                        } catch (e) {
                            resolve({ success: false, error: 'Failed to parse JSON response' });
                        }
                    } else {
                        resolve({ success: false, error: `OpenVSX returned HTTP ${res.statusCode}` });
                    }
                });
            });

            req.on('error', err => resolve({ success: false, error: err.message }));
            req.setTimeout(10000, () => {
                req.destroy();
                resolve({ success: false, error: 'OpenVSX request timed out' });
            });
        });
    }

    static async getLatestOpenVsxRelease(extensionNamespace = 'terenceooi', extensionName = 'token-saver-rtk-ide') {
        const res = await this.fetchOpenVsxJson(`/${extensionNamespace}/${extensionName}/latest`);
        if (res.success && res.data) {
            const pkg = res.data;
            return {
                success: true,
                version: pkg.version,
                downloadUrl: pkg.files && pkg.files.download ? pkg.files.download : null,
                timestamp: pkg.timestamp,
                description: pkg.description
            };
        }
        return { success: false, error: res.error || 'Failed to query OpenVSX' };
    }

    static downloadVsixFile(downloadUrl, destPath, progressCallback = null) {
        return new Promise((resolve, reject) => {
            const downloadInternal = (url) => {
                const req = https.get(url, { headers: { 'User-Agent': 'TokenSaver-IDE-Extension' } }, (res) => {
                    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                        return downloadInternal(res.headers.location);
                    }

                    if (res.statusCode < 200 || res.statusCode >= 300) {
                        return reject(new Error(`Download failed with HTTP ${res.statusCode}`));
                    }

                    const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
                    let receivedBytes = 0;
                    const fileStream = fs.createWriteStream(destPath);

                    res.on('data', (chunk) => {
                        receivedBytes += chunk.length;
                        if (progressCallback && totalBytes > 0) {
                            progressCallback(Math.round((receivedBytes / totalBytes) * 100));
                        }
                    });

                    res.pipe(fileStream);

                    fileStream.on('finish', () => {
                        fileStream.close(() => resolve(destPath));
                    });

                    fileStream.on('error', (err) => {
                        fs.unlink(destPath, () => {});
                        reject(err);
                    });
                });

                req.on('error', (err) => {
                    fs.unlink(destPath, () => {});
                    reject(err);
                });

                req.setTimeout(30000, () => {
                    req.destroy();
                    fs.unlink(destPath, () => {});
                    reject(new Error('Download timed out'));
                });
            };

            downloadInternal(downloadUrl);
        });
    }

    static async updateFromOpenVsx(manual = true) {
        const ext = vscode.extensions.getExtension('terenceooi.token-saver-rtk-ide');
        const currentVersion = ext && ext.packageJSON ? ext.packageJSON.version : '1.13.0';

        return vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Checking Open VSX for Token Saver extension updates...',
                cancellable: false
            },
            async (progress) => {
                const release = await this.getLatestOpenVsxRelease('terenceooi', 'token-saver-rtk-ide');
                if (!release.success || !release.version) {
                    vscode.window.showErrorMessage(`Failed to check Open VSX: ${release.error}`);
                    return;
                }

                const latestVersion = release.version;
                const hasNewer = this.isNewer(latestVersion, currentVersion);

                if (!hasNewer && manual) {
                    const action = await vscode.window.showInformationMessage(
                        `✓ Token Saver is up-to-date (Current: v${currentVersion}, Open VSX: v${latestVersion}).`,
                        'Force Reinstall from Open VSX',
                        'Open in Open VSX'
                    );

                    if (action === 'Open in Open VSX') {
                        vscode.env.openExternal(vscode.Uri.parse('https://open-vsx.org/extension/terenceooi/token-saver-rtk-ide'));
                        return;
                    }
                    if (action !== 'Force Reinstall from Open VSX') {
                        return;
                    }
                } else if (hasNewer) {
                    const confirm = await vscode.window.showInformationMessage(
                        `🚀 Token Saver update available on Open VSX: v${currentVersion} ➔ v${latestVersion}!`,
                        'Install Update Now',
                        'View on Open VSX',
                        'Later'
                    );

                    if (confirm === 'View on Open VSX') {
                        vscode.env.openExternal(vscode.Uri.parse('https://open-vsx.org/extension/terenceooi/token-saver-rtk-ide'));
                        return;
                    }
                    if (confirm !== 'Install Update Now') {
                        return;
                    }
                }

                if (!release.downloadUrl) {
                    vscode.window.showErrorMessage('Open VSX release did not contain a downloadable VSIX URL.');
                    return;
                }

                // Proceed with downloading & installing the VSIX
                await vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: `Downloading Token Saver v${latestVersion} from Open VSX...`,
                        cancellable: false
                    },
                    async (dlProgress) => {
                        const tempVsix = path.join(os.tmpdir(), `token-saver-rtk-ide-${latestVersion}.vsix`);
                        try {
                            dlProgress.report({ message: 'Fetching .vsix package...' });
                            await this.downloadVsixFile(release.downloadUrl, tempVsix);
                            dlProgress.report({ message: 'Installing extension package...' });

                            const vsixUri = vscode.Uri.file(tempVsix);
                            try {
                                await vscode.commands.executeCommand('workbench.extensions.installExtension', vsixUri);
                                const reload = await vscode.window.showInformationMessage(
                                    `🎉 Token Saver successfully updated to v${latestVersion} from Open VSX! Please reload the IDE window to complete the update.`,
                                    'Reload Window'
                                );
                                if (reload === 'Reload Window') {
                                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                                }
                            } catch (installErr) {
                                // Fallback to terminal install if internal command is restricted
                                const detected = SkillInstaller.detectCurrentIde ? SkillInstaller.detectCurrentIde() : { binaryName: 'code' };
                                const ideBin = detected.binaryName || 'code';
                                RtkService.runInTerminal(`${ideBin} --install-extension "${tempVsix}" --force`);
                                vscode.window.showInformationMessage(
                                    `⚡ Extension installation started via terminal for Token Saver v${latestVersion}.`
                                );
                            }
                        } catch (err) {
                            vscode.window.showErrorMessage(`Failed to download and install from Open VSX: ${err.message}`);
                        }
                    }
                );
            }
        );
    }

    static async manualUpdate() {
        return this.showSyncPicker();
    }
}

module.exports = RtkUpdater;

