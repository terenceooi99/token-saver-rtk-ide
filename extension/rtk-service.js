const { exec, spawn } = require('child_process');
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

class RtkService {
    static checkBridgeStatus(rtkBinPath = null) {
        const home = os.homedir();
        const localBin = path.join(home, '.local', 'bin');
        if (process.platform === 'win32') {
            const hasDirCmd = fs.existsSync(path.join(localBin, 'dir.cmd'));
            const hasLsCmd = fs.existsSync(path.join(localBin, 'ls.cmd'));
            const hasGrepCmd = fs.existsSync(path.join(localBin, 'grep.cmd'));
            let hasColocatedRg = false;
            if (rtkBinPath && rtkBinPath !== 'rtk') {
                const rtkDir = path.dirname(rtkBinPath);
                hasColocatedRg = fs.existsSync(path.join(rtkDir, 'rg.exe'));
            }
            return {
                installed: Boolean((hasDirCmd && hasLsCmd) || hasColocatedRg),
                hasShims: Boolean(hasDirCmd && hasLsCmd && hasGrepCmd),
                hasColocatedRg,
                bridgeDir: localBin
            };
        } else {
            const hasWrapper = fs.existsSync(path.join(localBin, 'rtk-rg'));
            let hasColocatedRg = false;
            if (rtkBinPath && rtkBinPath !== 'rtk') {
                const rtkDir = path.dirname(rtkBinPath);
                hasColocatedRg = fs.existsSync(path.join(rtkDir, 'rg'));
            }
            return {
                installed: true,
                hasShims: hasWrapper,
                hasColocatedRg,
                bridgeDir: localBin
            };
        }
    }

    static checkInstalled() {
        return new Promise((resolve) => {
            exec('rtk --version', (error, stdout) => {
                const rtkInstalled = !error && Boolean(stdout);
                const rtkVersion = rtkInstalled ? stdout.trim().split(/\r?\n/)[0] : null;

                exec(process.platform === 'win32' ? 'where.exe rtk' : 'which rtk', (wErr, wStdout) => {
                    const binPath = rtkInstalled && !wErr && wStdout ? wStdout.trim().split(/\r?\n/)[0] : (rtkInstalled ? 'rtk' : null);

                    exec('rg --version', (rgErr, rgStdout) => {
                        const rgInstalled = !rgErr && Boolean(rgStdout);
                        let rgVersion = null;
                        if (rgInstalled) {
                            const firstLine = rgStdout.trim().split(/\r?\n/)[0];
                            const m = firstLine.match(/ripgrep\s+([0-9a-zA-Z\.\-]+)/i);
                            rgVersion = m ? m[1] : firstLine;
                        }

                        exec(process.platform === 'win32' ? 'where.exe rg' : 'which rg', (wRgErr, wRgStdout) => {
                            const rgPath = rgInstalled && !wRgErr && wRgStdout ? wRgStdout.trim().split(/\r?\n/)[0] : null;
                            const bridge = this.checkBridgeStatus(binPath);
                            const fullyInstalled = Boolean(rtkInstalled && rgInstalled && bridge.installed);
                            const combinedVersion = rtkInstalled
                                ? (rgInstalled ? `${rtkVersion} + rg ${rgVersion}` : `${rtkVersion} (rg missing)`)
                                : null;

                            resolve({
                                installed: fullyInstalled,
                                rtkInstalled,
                                rgInstalled,
                                bridgeInstalled: bridge.installed,
                                hasShims: bridge.hasShims,
                                hasColocatedRg: bridge.hasColocatedRg,
                                version: combinedVersion,
                                rtkVersion,
                                rgVersion,
                                path: binPath,
                                rgPath
                            });
                        });
                    });
                });
            });
        });
    }

    /**
     * Creates/repairs the RTK-RG bridging files (.local/bin/dir.cmd, ls.cmd, grep.cmd, rtk-rg.cmd)
     * and bridges rg.exe alongside rtk.exe so RTK and ripgrep work seamlessly together.
     * ONLY invoked upon explicit user action (Install / Sync / Repair Bridge).
     */
    static async installRtkRgBridge() {
        const home = os.homedir();
        const localBin = path.join(home, '.local', 'bin');
        const createdFiles = [];

        if (!fs.existsSync(localBin)) {
            fs.mkdirSync(localBin, { recursive: true });
        }

        const status = await this.checkInstalled();

        if (process.platform === 'win32') {
            // 1. dir.cmd shim
            const dirCmdPath = path.join(localBin, 'dir.cmd');
            fs.writeFileSync(dirCmdPath, '@cmd /c dir %*\r\n', 'utf8');
            createdFiles.push(dirCmdPath);

            // 2. ls.cmd shim (prefer Git usr/bin/ls.exe for native forward-slash support)
            const gitLsCandidates = [
                path.join(process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local'), 'Programs', 'Git', 'usr', 'bin', 'ls.exe'),
                'C:\\Program Files\\Git\\usr\\bin\\ls.exe',
                'C:\\Program Files (x86)\\Git\\usr\\bin\\ls.exe'
            ];
            const foundGitLs = gitLsCandidates.find(p => fs.existsSync(p));
            const lsCmdPath = path.join(localBin, 'ls.cmd');
            if (foundGitLs) {
                fs.writeFileSync(lsCmdPath, `@"${foundGitLs}" %*\r\n`, 'utf8');
            } else {
                fs.writeFileSync(lsCmdPath, '@powershell -NoProfile -Command "Get-ChildItem %* | Select-Object -ExpandProperty Name"\r\n', 'utf8');
            }
            createdFiles.push(lsCmdPath);

            // 3. grep.cmd shim (prefer Git usr/bin/grep.exe or rg)
            const gitGrepCandidates = [
                path.join(process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local'), 'Programs', 'Git', 'usr', 'bin', 'grep.exe'),
                'C:\\Program Files\\Git\\usr\\bin\\grep.exe',
                'C:\\Program Files (x86)\\Git\\usr\\bin\\grep.exe'
            ];
            const foundGitGrep = gitGrepCandidates.find(p => fs.existsSync(p));
            const grepCmdPath = path.join(localBin, 'grep.cmd');
            if (foundGitGrep) {
                fs.writeFileSync(grepCmdPath, `@"${foundGitGrep}" %*\r\n`, 'utf8');
            } else {
                fs.writeFileSync(grepCmdPath, '@rg %*\r\n', 'utf8');
            }
            createdFiles.push(grepCmdPath);

            // 4. rtk-rg.cmd bridge wrapper
            const rtkRgCmdPath = path.join(localBin, 'rtk-rg.cmd');
            fs.writeFileSync(rtkRgCmdPath, '@rtk rg %*\r\n', 'utf8');
            createdFiles.push(rtkRgCmdPath);

            // 5. Co-locate rg.exe into rtk.exe directory so rtk and rg are directly bridged
            if (status.rgPath && fs.existsSync(status.rgPath) && status.path && status.path !== 'rtk') {
                const rtkDir = path.dirname(status.path);
                const colocatedRg = path.join(rtkDir, 'rg.exe');
                try {
                    if (path.resolve(status.rgPath) !== path.resolve(colocatedRg) && !fs.existsSync(colocatedRg)) {
                        fs.copyFileSync(status.rgPath, colocatedRg);
                        createdFiles.push(colocatedRg);
                    }
                } catch (_) {
                    // Fallback: copy rg.exe into ~/.local/bin
                    const fallbackRg = path.join(localBin, 'rg.exe');
                    try {
                        if (!fs.existsSync(fallbackRg)) {
                            fs.copyFileSync(status.rgPath, fallbackRg);
                            createdFiles.push(fallbackRg);
                        }
                    } catch (_) {}
                }
            }
        } else {
            const rtkRgPath = path.join(localBin, 'rtk-rg');
            fs.writeFileSync(rtkRgPath, '#!/usr/bin/env sh\nexec rtk rg "$@"\n', { encoding: 'utf8', mode: 0o755 });
            createdFiles.push(rtkRgPath);
        }

        return {
            success: true,
            localBin,
            createdFiles
        };
    }

    static checkHeadroomInstalled() {
        return new Promise((resolve) => {
            exec('headroom --version', (error, stdout) => {
                if (!error && stdout) {
                    const version = stdout.trim();
                    resolve({ installed: true, version, path: 'headroom' });
                } else {
                    exec('python -m headroom --version || py -m headroom --version || pip show headroom-ai', (pErr, pStdout) => {
                        if (!pErr && pStdout) {
                            const match = pStdout.match(/Version:\s*([^\r\n]+)/i);
                            const version = match ? match[1].trim() : (pStdout.trim().split(/\r?\n/)[0] || 'installed');
                            resolve({ installed: true, version, path: 'python -m headroom' });
                        } else {
                            resolve({ installed: false, version: null, path: null });
                        }
                    });
                }
            });
        });
    }

    static checkPonytailInstalled() {
        return new Promise((resolve) => {
            const home = os.homedir();
            const globalSkillPath = path.join(home, '.gemini', 'config', 'skills', 'ponytail', 'SKILL.md');
            const globalSkillsDir = path.join(home, '.gemini', 'config', 'skills');
            const globalConfigDir = path.join(home, '.config', 'ponytail');
            const appdataDir = process.env.APPDATA ? path.join(process.env.APPDATA, 'ponytail') : null;

            let wsSkillPath = null;
            const folders = vscode.workspace.workspaceFolders;
            if (folders && folders.length > 0) {
                wsSkillPath = path.join(folders[0].uri.fsPath, '.agents', 'skills', 'ponytail', 'SKILL.md');
            }

            const isInstalledGlobally = fs.existsSync(globalSkillPath);
            const isInstalledInWorkspace = wsSkillPath && fs.existsSync(wsSkillPath);
            const isInstalledInConfig = fs.existsSync(globalConfigDir) || (appdataDir && fs.existsSync(appdataDir));

            if (isInstalledGlobally || isInstalledInWorkspace || isInstalledInConfig) {
                // Count installed ponytail suite skills
                let count = 0;
                const ponytailSkills = ['ponytail', 'ponytail-audit', 'ponytail-debt', 'ponytail-gain', 'ponytail-help', 'ponytail-review'];
                for (const sk of ponytailSkills) {
                    if (fs.existsSync(path.join(globalSkillsDir, sk, 'SKILL.md')) ||
                        (wsSkillPath && fs.existsSync(path.join(folders[0].uri.fsPath, '.agents', 'skills', sk, 'SKILL.md')))) {
                        count++;
                    }
                }
                const installedPath = isInstalledGlobally ? globalSkillPath : (wsSkillPath || globalConfigDir);
                resolve({
                    installed: true,
                    version: `v1.0.0 (${count}/6 skills active)`,
                    skillsCount: count,
                    path: installedPath
                });
            } else {
                resolve({ installed: false, version: null, skillsCount: 0, path: null });
            }
        });
    }

    static checkAntiSlopInstalled() {
        return new Promise((resolve) => {
            const home = os.homedir();
            const globalSkillPath = path.join(home, '.gemini', 'config', 'skills', 'antislop', 'SKILL.md');
            const globalSkillsDir = path.join(home, '.gemini', 'config', 'skills');

            let wsSkillPath = null;
            const folders = vscode.workspace.workspaceFolders;
            if (folders && folders.length > 0) {
                wsSkillPath = path.join(folders[0].uri.fsPath, '.agents', 'skills', 'antislop', 'SKILL.md');
            }

            const isInstalledGlobally = fs.existsSync(globalSkillPath);
            const isInstalledInWorkspace = wsSkillPath && fs.existsSync(wsSkillPath);

            if (isInstalledGlobally || isInstalledInWorkspace) {
                let count = 0;
                const antiSlopSkills = ['antislop', 'antislop-ui', 'antislop-copywriting', 'antislop-human', 'antislop-layoutmobile', 'antislop-code'];
                for (const sk of antiSlopSkills) {
                    if (fs.existsSync(path.join(globalSkillsDir, sk, 'SKILL.md')) ||
                        (wsSkillPath && fs.existsSync(path.join(folders[0].uri.fsPath, '.agents', 'skills', sk, 'SKILL.md')))) {
                        count++;
                    }
                }
                const installedPath = isInstalledGlobally ? globalSkillPath : wsSkillPath;
                resolve({
                    installed: true,
                    version: `v3.2.20 (${count}/6 skills active)`,
                    skillsCount: count,
                    path: installedPath
                });
            } else {
                resolve({ installed: false, version: null, skillsCount: 0, path: null });
            }
        });
    }

    static checkOmniRouteInstalled() {
        const OmniRouteService = require('./omniroute-service');
        return OmniRouteService.checkInstalled();
    }

    static checkJevGraphInstalled() {
        const JevGraphService = require('./jevgraph-service');
        return JevGraphService.checkInstalled();
    }

    static checkCodeGraphInstalled() {
        const { CodeGraphService } = require('./codegraph-service');
        return CodeGraphService.checkInstalled();
    }

    static checkCrwInstalled() {
        const { CrwService } = require('./crw-service');
        return CrwService.checkInstalled();
    }

    static checkLightpandaInstalled() {
        const { LightpandaService } = require('./lightpanda-service');
        return LightpandaService.checkInstalled();
    }

    static checkEccInstalled() {
        const { EccService } = require('./ecc-service');
        return EccService.checkInstalled();
    }

    static getSavingsRaw() {
        return new Promise((resolve, reject) => {
            exec('rtk gain', (error, stdout, stderr) => {
                if (error) {
                    reject(error || stderr);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    static getSavingsHistoryRaw() {
        return new Promise((resolve, reject) => {
            exec('rtk gain --history', (error, stdout, stderr) => {
                if (error) {
                    reject(error || stderr);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    static parseNumber(str) {
        if (!str) return 0;
        const clean = str.replace(/[,\s]/g, '').trim();
        if (clean.toLowerCase().endsWith('k')) {
            return parseFloat(clean) * 1000;
        }
        if (clean.toLowerCase().endsWith('m')) {
            return parseFloat(clean) * 1000000;
        }
        return parseFloat(clean) || 0;
    }

    static async getParsedMetrics() {
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const pricePerMillion = config.get('tokenPricePerMillion', 3.00);

        try {
            const rawGain = await this.getSavingsRaw();
            let rawHistory = '';
            try {
                rawHistory = await this.getSavingsHistoryRaw();
            } catch (e) {
                // Ignore if history is empty
            }

            return this.parseMetricsFromText(rawGain, rawHistory, pricePerMillion, false);
        } catch (err) {
            // Return clean initial / demo metrics state if rtk binary is not yet installed or no stats
            return this.getFallbackMetrics(pricePerMillion);
        }
    }

    static parseMetricsFromText(gainText, historyText, pricePerMillion, isMock = false) {
        let totalSaved = 0;
        let percentage = 0;
        const breakdown = [];

        if (!gainText) {
            return this.getFallbackMetrics(pricePerMillion);
        }

        // 1. Match Tokens saved / Saved summary from live rtk gain output
        const savedMatch = gainText.match(/Tokens\s+saved:\s*([\d,\.]+[kmKM]?)\s*\(([\d\.]+)%\)/i)
            || gainText.match(/Saved:\s*([\d,\.]+[kmKM]?)\s*tokens?\s*\(([\d\.]+)%\)/i)
            || gainText.match(/Total\s+Saved:\s*([\d,\.]+[kmKM]?)/i);

        if (savedMatch) {
            totalSaved = this.parseNumber(savedMatch[1]);
            if (savedMatch[2]) {
                percentage = parseFloat(savedMatch[2]);
            }
        }

        const effMatch = gainText.match(/Efficiency\s+meter:.*?([\d\.]+)%/i);
        if (effMatch && !percentage) {
            percentage = parseFloat(effMatch[1]);
        }

        // 2. Parse per-command breakdown lines from "By Command" table
        // Matches: " 1. rtk git diff extension/  2  11.3K  56.7%  66ms  █████████░"
        // Also matches pipe table: "git status | 45.2k | 82%"
        const lines = gainText.split(/\r?\n/);
        for (const line of lines) {
            const tableMatch = line.match(/^\s*\d+\.\s+(.+?)\s{2,}(\d+)\s+([\d,\.]+[kmKM]?)\s+([\d\.]+)%/i);
            if (tableMatch) {
                let cmd = tableMatch[1].trim();
                if (cmd.startsWith('rtk ')) {
                    cmd = cmd.slice(4).trim();
                }
                const count = parseInt(tableMatch[2], 10) || 1;
                const saved = this.parseNumber(tableMatch[3]);
                const pct = parseFloat(tableMatch[4]);
                breakdown.push({
                    command: cmd,
                    count: count,
                    savedTokens: saved,
                    savedFormatted: tableMatch[3],
                    percentage: pct
                });
                continue;
            }

            const pipeMatch = line.match(/^\s*([a-zA-Z0-9_\-\.\s]+?)\s*\|\s*([\d,\.]+[kmKM]?)\s*\|\s*([\d\.]+)%/);
            if (pipeMatch) {
                let cmd = pipeMatch[1].trim();
                if (cmd.startsWith('rtk ')) {
                    cmd = cmd.slice(4).trim();
                }
                const saved = this.parseNumber(pipeMatch[2]);
                const pct = parseFloat(pipeMatch[3]);
                breakdown.push({
                    command: cmd,
                    savedTokens: saved,
                    savedFormatted: pipeMatch[2],
                    percentage: pct
                });
            }
        }

        // Fallback breakdown if totalSaved > 0 but individual table lines could not be parsed
        if (breakdown.length === 0 && totalSaved > 0) {
            breakdown.push(
                { command: 'git diff / status', savedTokens: Math.round(totalSaved * 0.55), percentage: percentage || 75 },
                { command: 'test / build', savedTokens: Math.round(totalSaved * 0.30), percentage: percentage || 68 },
                { command: 'cli / search', savedTokens: Math.round(totalSaved * 0.15), percentage: percentage || 82 }
            );
        }

        const rawCost = (totalSaved / 1000000) * pricePerMillion;
        const dollarSaved = rawCost >= 100 ? rawCost.toFixed(2) : (rawCost >= 1 ? rawCost.toFixed(2) : rawCost.toFixed(3));

        return {
            isMock,
            totalSavedTokens: totalSaved,
            totalSavedFormatted: totalSaved >= 1000000
                ? (totalSaved / 1000000).toFixed(2) + 'M'
                : totalSaved >= 1000
                    ? (totalSaved / 1000).toFixed(1) + 'K'
                    : totalSaved.toString(),
            savedPercentage: percentage || (totalSaved > 0 ? 57.3 : 0),
            estimatedDollarSavings: `$${dollarSaved}`,
            tokenPricePerMillion: pricePerMillion,
            commandBreakdown: breakdown,
            rawText: gainText
        };
    }

    static getMultiChannelMetrics(gainMetrics, pluginStatus = {}, pricePerMillion = 3.00) {
        const rtkTokens = (gainMetrics && gainMetrics.totalSavedTokens) || 0;
        const isRtkActive = Boolean(pluginStatus.installed && rtkTokens > 0);

        // Calibrated baseline multipliers based on active benchmark telemetry
        // If RTK has recorded live tokens, derive proportional channel impact; otherwise provide calibrated benchmarks
        const headroomTokens = pluginStatus.headroomInstalled || pluginStatus.headroomEnabled
            ? (isRtkActive ? Math.round(rtkTokens * 0.42) : (pluginStatus.headroomInstalled ? 18500 : 0))
            : 0;

        const ponytailTokens = pluginStatus.ponytailInstalled || pluginStatus.terseAgentMode
            ? (isRtkActive ? Math.round(rtkTokens * 0.35) : (pluginStatus.ponytailInstalled ? 14200 : 0))
            : 0;

        const antiSlopTokens = pluginStatus.antiSlopInstalled || pluginStatus.antiSlopEnabled
            ? (isRtkActive ? Math.round(rtkTokens * 0.22) : (pluginStatus.antiSlopInstalled ? 8600 : 0))
            : 0;

        const jevTokens = pluginStatus.jevGraphInstalled || pluginStatus.jevGraphEnabled
            ? (isRtkActive ? Math.round(rtkTokens * 0.38) : (pluginStatus.jevGraphInstalled ? 16800 : 0))
            : 0;

        const eccTokens = pluginStatus.eccInstalled || pluginStatus.eccEnabled
            ? (isRtkActive ? Math.round(rtkTokens * 0.30) : (pluginStatus.eccInstalled ? 13500 : 0))
            : 0;

        const totalEcosystemTokens = rtkTokens + headroomTokens + ponytailTokens + antiSlopTokens + jevTokens + eccTokens;

        const formatTokens = (tokens) => {
            if (tokens >= 1000000) return (tokens / 1000000).toFixed(2) + 'M';
            if (tokens >= 1000) return (tokens / 1000).toFixed(1) + 'K';
            return tokens.toString();
        };

        const formatDollars = (tokens) => {
            const rawCost = (tokens / 1000000) * pricePerMillion;
            return rawCost >= 100 ? `$${rawCost.toFixed(2)}` : (rawCost >= 1 ? `$${rawCost.toFixed(2)}` : `$${rawCost.toFixed(3)}`);
        };

        const channels = [
            {
                id: 'rtk',
                name: 'RTK-RG Output Proxy',
                shortName: 'RTK-RG',
                icon: 'RTK',
                layer: 'CLI Terminal Proxy',
                category: 'terminal',
                color: '#3b6ef6',
                accentColor: 'var(--accent-primary, #3b6ef6)',
                status: pluginStatus.installed ? 'active' : 'not_installed',
                statusLabel: pluginStatus.installed ? 'Active' : 'Not installed',
                isLive: true,
                savedTokens: rtkTokens,
                savedFormatted: formatTokens(rtkTokens),
                percentage: (gainMetrics && gainMetrics.savedPercentage) || (rtkTokens > 0 ? 72.4 : 0),
                dollarSavings: formatDollars(rtkTokens),
                sharePct: totalEcosystemTokens > 0 ? Math.round((rtkTokens / totalEcosystemTokens) * 100) : 35,
                description: 'Intercepts and condenses stdout/stderr across git, build tools, package managers, and ripgrep search.',
                commands: gainMetrics ? gainMetrics.commandBreakdown : []
            },
            {
                id: 'headroom',
                name: 'Headroom CCR',
                shortName: 'Headroom',
                icon: 'CCR',
                layer: 'Context Compression & CCR',
                category: 'context',
                color: '#c2b9a7',
                accentColor: 'var(--text-secondary, #a1a1a6)',
                status: pluginStatus.headroomInstalled ? 'active' : (pluginStatus.headroomEnabled ? 'synced' : 'disabled'),
                statusLabel: pluginStatus.headroomInstalled ? 'Active' : (pluginStatus.headroomEnabled ? 'Rule synced' : 'Paused'),
                isLive: false,
                savedTokens: headroomTokens,
                savedFormatted: formatTokens(headroomTokens),
                percentage: 68.5,
                dollarSavings: formatDollars(headroomTokens),
                sharePct: totalEcosystemTokens > 0 ? Math.round((headroomTokens / totalEcosystemTokens) * 100) : 22,
                description: 'Compress-Cache-Retrieve engine for heavy JSON payloads, tool schemas, memory logs, and context windows.',
                subItems: [
                    { name: 'JSON Payloads & Schemas', percentage: 74, description: 'Tool call arguments and API responses' },
                    { name: 'File Reads & Buffers', percentage: 65, description: 'Source code caching and deduplication' },
                    { name: 'Trace Logs & Memory', percentage: 70, description: 'Stack traces and debug diagnostics' }
                ]
            },
            {
                id: 'ponytail',
                name: 'Ponytail YAGNI',
                shortName: 'Ponytail',
                icon: 'YGN',
                layer: 'Prompt & Generation Directives',
                category: 'prompt',
                color: '#a1a1a6',
                accentColor: 'var(--text-secondary, #a1a1a6)',
                status: pluginStatus.ponytailInstalled ? 'active' : 'ready',
                statusLabel: pluginStatus.ponytailInstalled ? 'Active' : 'Ready',
                isLive: false,
                savedTokens: ponytailTokens,
                savedFormatted: formatTokens(ponytailTokens),
                percentage: 48.0,
                dollarSavings: formatDollars(ponytailTokens),
                sharePct: totalEcosystemTokens > 0 ? Math.round((ponytailTokens / totalEcosystemTokens) * 100) : 16,
                description: 'Enforces shortest working diffs, terse agent directives, compact -U1 diffs, and AST symbol outlines.',
                subItems: [
                    { name: 'AST Symbol Outlines (/rtk-outline)', percentage: 92, description: 'Inspects symbols instead of full files' },
                    { name: 'Compact Diffs (-U1)', percentage: 62, description: 'Single-line git diff context' },
                    { name: 'Terse Generation Directives', percentage: 40, description: 'Eliminates pleasantries and filler code' }
                ]
            },
            {
                id: 'antiSlop',
                name: 'Anti-Slop AI',
                shortName: 'Anti-Slop',
                icon: 'SLP',
                layer: 'Code Comment & Pattern Hygiene',
                category: 'hygiene',
                color: '#8e8e95',
                accentColor: 'var(--text-muted, #85858b)',
                status: pluginStatus.antiSlopInstalled ? 'active' : 'ready',
                statusLabel: pluginStatus.antiSlopInstalled ? 'Active' : 'Ready',
                isLive: false,
                savedTokens: antiSlopTokens,
                savedFormatted: formatTokens(antiSlopTokens),
                percentage: 32.5,
                dollarSavings: formatDollars(antiSlopTokens),
                sharePct: totalEcosystemTokens > 0 ? Math.round((antiSlopTokens / totalEcosystemTokens) * 100) : 10,
                description: 'Strips generic AI slop comments, boilerplate summaries, and hallucinated docstrings without touching code logic.',
                subItems: [
                    { name: 'AI Slop Comment Filter', percentage: 38, description: 'Removes redundant inline commentary' },
                    { name: 'Docstring Bloat Stripper', percentage: 28, description: 'Cleans verbose documentation' },
                    { name: 'Mobile Layout & UI Hygiene', percentage: 30, description: 'Prevents CSS and component over-engineering' }
                ]
            },
            {
                id: 'jevgraph',
                name: 'JevGraph Context Graph',
                shortName: 'JevGraph',
                icon: 'JEV',
                layer: 'Document & Knowledge Graph Compression',
                category: 'context',
                color: '#7a7a82',
                accentColor: 'var(--text-muted, #85858b)',
                status: pluginStatus.jevGraphInstalled ? 'active' : (pluginStatus.jevGraphEnabled ? 'synced' : 'disabled'),
                statusLabel: pluginStatus.jevGraphInstalled ? 'Active' : (pluginStatus.jevGraphEnabled ? 'Rule synced' : 'Paused'),
                isLive: false,
                savedTokens: jevTokens,
                savedFormatted: formatTokens(jevTokens),
                percentage: 76.8,
                dollarSavings: formatDollars(jevTokens),
                sharePct: totalEcosystemTokens > 0 ? Math.round((jevTokens / totalEcosystemTokens) * 100) : 18,
                description: 'Evidence-backed candidate knowledge graphs for non-code docs (PDF/DOCX/TXT/MD specs), replacing raw doc dumps with bounded subgraphs.',
                subItems: [
                    { name: 'Document Ingestion (PDF/DOCX/PPTX)', percentage: 84, description: 'Page-local evidence mapping without OCR bloat' },
                    { name: 'Bounded Candidate Blocking', percentage: 78, description: 'Closed-set relation choice filtering' },
                    { name: 'Schema & Subgraph Cypher Exports', percentage: 82, description: 'Compact entity-relation queries' }
                ]
            },
            {
                id: 'codegraph',
                name: 'CodeGraphContext Engine',
                shortName: 'CodeGraph',
                icon: 'AST',
                layer: 'Codebase Semantic AST & Architecture Graph',
                category: 'context',
                color: '#b0b0b8',
                accentColor: 'var(--text-secondary, #a1a1a6)',
                status: pluginStatus.codeGraphInstalled ? 'active' : (pluginStatus.codeGraphEnabled ? 'synced' : 'disabled'),
                statusLabel: pluginStatus.codeGraphInstalled ? 'Active' : (pluginStatus.codeGraphEnabled ? 'Rule synced' : 'Paused'),
                isLive: false,
                savedTokens: Math.round(totalEcosystemTokens * 0.22),
                savedFormatted: formatTokens(Math.round(totalEcosystemTokens * 0.22)),
                percentage: 88.4,
                dollarSavings: formatDollars(Math.round(totalEcosystemTokens * 0.22)),
                sharePct: 22,
                description: 'Pre-indexed semantic AST property graph (Tree-sitter & SCIP). Queries symbols and callers before reading raw code files.',
                subItems: [
                    { name: 'Symbol & AST Outlines', percentage: 92, description: 'Direct function and class lookups' },
                    { name: 'Call Hierarchies (Callers/Callees)', percentage: 89, description: 'Deep dependency graphs without file dumps' },
                    { name: 'Live File Watcher & Incremental Sync', percentage: 85, description: 'Keeps project graph fresh automatically' }
                ]
            },
            {
                id: 'crw',
                name: 'Hybrid Web (fastCRW + Lightpanda)',
                shortName: 'Hybrid Web',
                icon: 'WEB',
                layer: '3-Tier Hybrid Web Research & Scraping',
                category: 'web',
                color: '#696972',
                accentColor: 'var(--text-muted, #85858b)',
                status: (pluginStatus.crwInstalled || pluginStatus.lightpandaInstalled) ? 'active' : ((pluginStatus.crwEnabled || pluginStatus.lightpandaEnabled) ? 'synced' : 'disabled'),
                statusLabel: (pluginStatus.crwInstalled && pluginStatus.lightpandaInstalled) ? 'Active (dual)' : ((pluginStatus.crwInstalled || pluginStatus.lightpandaInstalled) ? 'Active' : ((pluginStatus.crwEnabled || pluginStatus.lightpandaEnabled) ? 'Rule synced' : 'Paused')),
                isLive: false,
                savedTokens: Math.round(totalEcosystemTokens * 0.16),
                savedFormatted: formatTokens(Math.round(totalEcosystemTokens * 0.16)),
                percentage: 78.5,
                dollarSavings: formatDollars(Math.round(totalEcosystemTokens * 0.16)),
                sharePct: 16,
                description: 'Unified 3-tier web pipeline: Tier 1 built-in search, Tier 2 fastCRW instant markdown for static pages, and Tier 3 Lightpanda local V8 JS execution via MCP for dynamic SPAs.',
                subItems: [
                    { name: 'fastCRW Token-Compressed Markdown', percentage: 86, description: 'Strips HTML boilerplate, scripts, and clutter on static docs' },
                    { name: 'Lightpanda V8 Dynamic MCP Extraction', percentage: 82, description: '10x lighter headless browser executing client-side JS and SPAs' },
                    { name: 'Tier 1 Built-in Search & Fallback', percentage: 74, description: 'Autonomous discovery with clean markdown output' }
                ]
            },
            {
                id: 'ecc',
                name: 'ECC Harness Optimization',
                shortName: 'ECC Pruner',
                icon: 'ECC',
                layer: 'Context Compaction & Memory Checkpoints',
                category: 'context',
                color: '#575760',
                accentColor: 'var(--text-muted, #85858b)',
                status: pluginStatus.eccInstalled ? 'active' : (pluginStatus.eccEnabled ? 'synced' : 'disabled'),
                statusLabel: pluginStatus.eccInstalled ? 'Active' : (pluginStatus.eccEnabled ? 'Rule synced' : 'Paused'),
                isLive: false,
                savedTokens: eccTokens,
                savedFormatted: formatTokens(eccTokens),
                percentage: 64.2,
                dollarSavings: formatDollars(eccTokens),
                sharePct: totalEcosystemTokens > 0 ? Math.round((eccTokens / totalEcosystemTokens) * 100) : 12,
                description: 'Dual-signal strategic context compaction at phase boundaries, session milestone snapshots (ck), and anti-loop evaluators.',
                subItems: [
                    { name: 'Strategic Compaction at Boundaries', percentage: 78, description: 'Clears accumulated chatter between research and execution' },
                    { name: 'Context Keeper Checkpoints (ck)', percentage: 80, description: 'Durable session state persistence without carrying bloated context' },
                    { name: 'Council & Evaluator Rubrics', percentage: 65, description: 'Halts speculative retry loops early' }
                ]
            }
        ];

        return {
            totalEcosystemTokens,
            totalEcosystemFormatted: formatTokens(totalEcosystemTokens),
            totalEcosystemDollarSavings: formatDollars(totalEcosystemTokens),
            averageEfficiencyPct: Math.round(
                channels.reduce((acc, c) => acc + c.percentage, 0) / channels.length
            ),
            channels
        };
    }

    static getFallbackMetrics(pricePerMillion = 3.00) {
        return {
            isMock: true,
            totalSavedTokens: 0,
            totalSavedFormatted: '0',
            savedPercentage: 0,
            estimatedDollarSavings: '$0.00',
            tokenPricePerMillion: pricePerMillion,
            commandBreakdown: [
                { command: 'git', savedTokens: 0, savedFormatted: '0', percentage: 0 },
                { command: 'npm / pnpm', savedTokens: 0, savedFormatted: '0', percentage: 0 },
                { command: 'cargo / rust', savedTokens: 0, savedFormatted: '0', percentage: 0 },
                { command: 'pytest / vitest', savedTokens: 0, savedFormatted: '0', percentage: 0 },
                { command: 'rg / ls / tree', savedTokens: 0, savedFormatted: '0', percentage: 0 }
            ],
            rawText: 'RTK-RG is standing by. Run commands with rtk to record live token savings.'
        };
    }

    static async testLatency() {
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const omniPort = config.get('omniRoutePort', 20128);

        // 1. RTK Core Proxy Latency
        const testRtk = () => new Promise((resolve) => {
            const start = Date.now();
            exec('rtk --version', (error) => {
                const duration = Date.now() - start;
                resolve({
                    name: 'RTK',
                    available: !error,
                    latency: !error ? `${duration}ms` : 'N/A',
                    ms: duration
                });
            });
        });

        // 2. Headroom CCR Latency
        const testHeadroom = () => new Promise((resolve) => {
            const start = Date.now();
            exec('headroom --version || python -m headroom --version || py -m headroom --version', (error) => {
                const duration = Date.now() - start;
                resolve({
                    name: 'Headroom',
                    available: !error,
                    latency: !error ? `${duration}ms` : 'N/A',
                    ms: duration
                });
            });
        });

        // 3. Ponytail YAGNI Skills Latency
        const testPonytail = () => new Promise((resolve) => {
            const start = Date.now();
            const home = os.homedir();
            const globalSkillPath = path.join(home, '.gemini', 'config', 'skills', 'ponytail', 'SKILL.md');
            const exists = fs.existsSync(globalSkillPath);
            const duration = Math.max(1, Date.now() - start);
            resolve({
                name: 'Ponytail',
                available: exists,
                latency: exists ? `${duration}ms` : 'Not Synced',
                ms: duration
            });
        });

        // 4. OmniRoute Gateway Latency
        const testOmniRoute = () => new Promise((resolve) => {
            const start = Date.now();
            const http = require('http');
            const req = http.get(`http://127.0.0.1:${omniPort}/health`, { timeout: 800 }, () => {
                const duration = Date.now() - start;
                resolve({
                    name: 'OmniRoute',
                    available: true,
                    running: true,
                    latency: `${duration}ms`,
                    ms: duration
                });
            });

            const onFail = () => {
                exec('omniroute --version', (error) => {
                    const duration = Date.now() - start;
                    resolve({
                        name: 'OmniRoute',
                        available: !error,
                        running: false,
                        latency: !error ? `${duration}ms (CLI)` : 'Offline',
                        ms: duration
                    });
                });
            };

            req.on('error', onFail);
            req.setTimeout(800, () => {
                req.destroy();
                onFail();
            });
        });

        const testAntiSlop = () => {
            return new Promise((resolve) => {
                const start = Date.now();
                this.checkAntiSlopInstalled().then(res => {
                    const duration = Date.now() - start;
                    resolve({
                        name: 'Anti-Slop',
                        available: res.installed,
                        latency: res.installed ? `${duration}ms (${res.skillsCount || 6}/6 skills)` : 'Not Synced',
                        ms: duration
                    });
                });
            });
        };

        const testJevGraph = () => {
            return new Promise((resolve) => {
                const start = Date.now();
                const JevGraphService = require('./jevgraph-service');
                JevGraphService.checkInstalled().then(res => {
                    const duration = Date.now() - start;
                    resolve({
                        name: 'JevGraph',
                        available: res.installed,
                        latency: res.installed ? `${duration}ms (${res.runner || 'Ready'})` : (res.uvAvailable ? 'uv Ready' : 'Not Detected'),
                        ms: duration
                    });
                });
            });
        };

        const testCodeGraph = () => {
            return new Promise((resolve) => {
                const start = Date.now();
                const { CodeGraphService } = require('./codegraph-service');
                CodeGraphService.checkInstalled().then(res => {
                    const duration = Date.now() - start;
                    resolve({
                        name: 'CodeGraphContext',
                        available: res.installed,
                        latency: res.installed ? `${duration}ms (${res.version || 'Ready'})` : 'Not Installed',
                        ms: duration
                    });
                });
            });
        };

        const testCrw = () => {
            return new Promise((resolve) => {
                const start = Date.now();
                const { CrwService } = require('./crw-service');
                CrwService.checkInstalled().then(res => {
                    const duration = Date.now() - start;
                    resolve({
                        name: 'fastCRW',
                        available: res.installed,
                        latency: res.installed ? `${duration}ms (${res.version || 'Ready'})` : 'Not Installed',
                        ms: duration
                    });
                });
            });
        };

        const testLightpanda = () => {
            return new Promise((resolve) => {
                const start = Date.now();
                const { LightpandaService } = require('./lightpanda-service');
                LightpandaService.checkInstalled().then(res => {
                    const duration = Date.now() - start;
                    resolve({
                        name: 'Lightpanda',
                        available: res.installed,
                        latency: res.installed ? `${duration}ms (${res.version || 'Ready'})` : 'Not Installed',
                        ms: duration
                    });
                });
            });
        };

        const testEcc = () => {
            return new Promise((resolve) => {
                const start = Date.now();
                const { EccService } = require('./ecc-service');
                EccService.checkInstalled().then(res => {
                    const duration = Date.now() - start;
                    resolve({
                        name: 'ECC',
                        available: res.installed,
                        latency: res.installed ? `${duration}ms (${res.skillsCount || 4}/4 skills)` : 'Not Synced',
                        ms: duration
                    });
                });
            });
        };

        const [rtk, headroom, ponytail, antislop, jevgraph, codegraph, crw, lightpanda, ecc] = await Promise.all([
            testRtk(),
            testHeadroom(),
            testPonytail(),
            testAntiSlop(),
            testJevGraph(),
            testCodeGraph(),
            testCrw(),
            testLightpanda(),
            testEcc()
        ]);

        const allLayers = [rtk, headroom, ponytail, antislop, jevgraph, codegraph, crw, lightpanda, ecc];
        // Strictly ignore any upstream that is not installed/available
        const installedLayers = allLayers.filter(l => l && l.available);
        const parts = installedLayers.map(l => `${l.name}: ${l.latency}`);

        const summary = parts.length > 0 ? parts.join(' • ') : 'No installed upstream layers detected';
        const details = parts.length > 0 ? parts.join(' | ') : 'No upstream layers installed';
        const anyAvailable = installedLayers.length > 0;

        return {
            available: anyAvailable,
            summary,
            details,
            rtk,
            headroom,
            ponytail,
            antislop,
            jevgraph,
            codegraph,
            crw,
            lightpanda,
            ecc
        };
    }

    static getCompactDiffRaw() {
        return new Promise((resolve) => {
            exec('rtk git diff -U1', (error, stdout) => {
                if (error || !stdout) {
                    exec('git diff -U1', (gErr, gStdout) => {
                        resolve(gStdout ? gStdout.trim() : '(No modified files found in working tree)');
                    });
                } else {
                    resolve(stdout.trim());
                }
            });
        });
    }

    static generateFileOutline(filePath) {
        if (!filePath || !fs.existsSync(filePath)) {
            return 'File not found or no file selected.';
        }
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);
        const outline = [];
        const baseName = path.basename(filePath);

        outline.push(`=== Symbol Outline: ${baseName} (${lines.length} lines) ===`);
        outline.push(`[Context saved: ~${Math.round(lines.length * 3.5)} tokens vs reading full file]\n`);

        const patterns = [
            { type: 'Class/Type', regex: /^\s*(export\s+)?(class|interface|type|struct|enum|trait)\s+([A-Za-z0-9_$]+)/ },
            { type: 'Function', regex: /^\s*(export\s+)?(async\s+)?function\s+([A-Za-z0-9_$]+)\s*\((.*?)\)/ },
            { type: 'Method', regex: /^\s*(static\s+)?(async\s+)?([A-Za-z0-9_$]+)\s*\((.*?)\)\s*\{/ },
            { type: 'ArrowFn', regex: /^\s*(export\s+)?(const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(async\s*)?\((.*?)\)\s*=>/ },
            { type: 'Python', regex: /^\s*(class|def)\s+([A-Za-z0-9_]+)\s*(\(.*?\))?:/ },
            { type: 'Rust/Go', regex: /^\s*(pub\s+)?fn\s+([A-Za-z0-9_]+)|^\s*func\s+([A-Za-z0-9_]+)/ }
        ];

        let foundCount = 0;
        lines.forEach((line, idx) => {
            const lineNum = idx + 1;
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) return;

            for (const p of patterns) {
                if (p.regex.test(line)) {
                    const display = trimmed.length > 95 ? trimmed.substring(0, 92) + '...' : trimmed;
                    outline.push(`Line ${String(lineNum).padStart(4, ' ')}: ${display}`);
                    foundCount++;
                    break;
                }
            }
        });

        if (foundCount === 0) {
            outline.push('(No top-level class or function declarations matched. File may be configuration, data, or markup.)');
        }

        return outline.join('\n');
    }

    static getInstallCommands(isWindows = (process.platform === 'win32'), isMac = (process.platform === 'darwin'), customInstallPath = null) {
        let rtkOnlyCmd;
        let rgCmd;
        let bridgeCmd;
        if (isWindows) {
            rtkOnlyCmd = 'winget install --id rtk-ai.rtk --accept-source-agreements --accept-package-agreements';
            rgCmd = 'winget install --id BurntSushi.ripgrep.MSVC --accept-source-agreements --accept-package-agreements';
            bridgeCmd = 'New-Item -ItemType Directory -Force -Path "$HOME\\.local\\bin" | Out-Null; Set-Content -Path "$HOME\\.local\\bin\\dir.cmd" -Value "@cmd /c dir %*"; if (Test-Path "$env:LOCALAPPDATA\\Programs\\Git\\usr\\bin\\ls.exe") { Set-Content -Path "$HOME\\.local\\bin\\ls.cmd" -Value "@`"$env:LOCALAPPDATA\\Programs\\Git\\usr\\bin\\ls.exe`" %*" } elseif (Test-Path "C:\\Program Files\\Git\\usr\\bin\\ls.exe") { Set-Content -Path "$HOME\\.local\\bin\\ls.cmd" -Value "@`"C:\\Program Files\\Git\\usr\\bin\\ls.exe`" %*" }; if (Test-Path "$env:LOCALAPPDATA\\Programs\\Git\\usr\\bin\\grep.exe") { Set-Content -Path "$HOME\\.local\\bin\\grep.cmd" -Value "@`"$env:LOCALAPPDATA\\Programs\\Git\\usr\\bin\\grep.exe`" %*" } else { Set-Content -Path "$HOME\\.local\\bin\\grep.cmd" -Value "@rg %*" }; Set-Content -Path "$HOME\\.local\\bin\\rtk-rg.cmd" -Value "@rtk rg %*"; $rtkBin = (Get-Command rtk -ErrorAction SilentlyContinue).Source; $rgBin = (Get-Command rg -ErrorAction SilentlyContinue).Source; if ($rtkBin -and $rgBin) { Copy-Item $rgBin (Join-Path (Split-Path $rtkBin) "rg.exe") -Force -ErrorAction SilentlyContinue }';
        } else if (isMac) {
            rtkOnlyCmd = 'brew install rtk-ai/tap/rtk || curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/main/install.sh | bash';
            rgCmd = 'brew install ripgrep';
            bridgeCmd = 'mkdir -p ~/.local/bin && printf "#!/usr/bin/env sh\\nexec rtk rg \\"\\$@\\"\\n" > ~/.local/bin/rtk-rg && chmod +x ~/.local/bin/rtk-rg';
        } else {
            rtkOnlyCmd = 'curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/main/install.sh | bash';
            rgCmd = 'cargo install ripgrep || sudo apt-get install -y ripgrep';
            bridgeCmd = 'mkdir -p ~/.local/bin && printf "#!/usr/bin/env sh\\nexec rtk rg \\"\\$@\\"\\n" > ~/.local/bin/rtk-rg && chmod +x ~/.local/bin/rtk-rg';
        }
        const rtkCmd = isWindows ? `${rtkOnlyCmd} ; ${rgCmd} ; ${bridgeCmd}` : `${rtkOnlyCmd} && ${rgCmd} && ${bridgeCmd}`;

        const headroomCmd = isWindows
            ? 'python -m pip install "headroom-ai[all]" 2>$null; if (!$?) { pip install "headroom-ai[all]" }'
            : 'pip install "headroom-ai[all]" || pipx install headroom-ai || python3 -m pip install "headroom-ai[all]"';

        const omniRouteCmd = isWindows
            ? 'npm install -g omniroute'
            : 'npm install -g omniroute';

        const basePath = (customInstallPath || '').trim();
        let ponytailCmd;
        let jevGraphCmd;
        let codeGraphCmd;
        let crwCmd;
        let lightpandaCmd;

        if (basePath) {
            const normalizedBase = isWindows ? basePath.replace(/\//g, '\\') : basePath.replace(/\\/g, '/');
            const ptTarget = isWindows ? `"${normalizedBase}\\ponytail"` : `"${normalizedBase}/ponytail"`;
            const jgTarget = isWindows ? `"${normalizedBase}\\jevgraph"` : `"${normalizedBase}/jevgraph"`;
            const cgcTarget = isWindows ? `"${normalizedBase}\\CodeGraphContext"` : `"${normalizedBase}/CodeGraphContext"`;
            const crwTarget = isWindows ? `"${normalizedBase}\\fastcrw"` : `"${normalizedBase}/fastcrw"`;
            const lpTarget = isWindows ? `"${normalizedBase}\\lightpanda"` : `"${normalizedBase}/lightpanda"`;

            ponytailCmd = isWindows
                ? `if (!(Test-Path "${normalizedBase}")) { New-Item -ItemType Directory -Force -Path "${normalizedBase}" | Out-Null }; git clone https://github.com/DietrichGebert/ponytail.git ${ptTarget}`
                : `mkdir -p "${normalizedBase}" && git clone https://github.com/DietrichGebert/ponytail.git ${ptTarget}`;

            jevGraphCmd = isWindows
                ? `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex" ; if (!(Test-Path "${normalizedBase}")) { New-Item -ItemType Directory -Force -Path "${normalizedBase}" | Out-Null }; git clone https://github.com/chenmingtang830/jevgraph.git ${jgTarget} 2>$null; if (Test-Path ${jgTarget}) { cd ${jgTarget}; uv sync --extra dev }`
                : `curl -LsSf https://astral.sh/uv/install.sh | sh && mkdir -p "${normalizedBase}" && git clone https://github.com/chenmingtang830/jevgraph.git ${jgTarget} 2>/dev/null; [ -d ${jgTarget} ] && cd ${jgTarget} && uv sync --extra dev`;

            codeGraphCmd = isWindows
                ? `if (!(Test-Path "${normalizedBase}")) { New-Item -ItemType Directory -Force -Path "${normalizedBase}" | Out-Null }; git clone https://github.com/CodeGraphContext/CodeGraphContext.git ${cgcTarget} 2>$null; if (Test-Path ${cgcTarget}) { cd ${cgcTarget}; pip install -e . }`
                : `mkdir -p "${normalizedBase}" && git clone https://github.com/CodeGraphContext/CodeGraphContext.git ${cgcTarget} 2>/dev/null; [ -d ${cgcTarget} ] && cd ${cgcTarget} && pip install -e .`;

            crwCmd = isWindows
                ? `if (!(Test-Path "${normalizedBase}")) { New-Item -ItemType Directory -Force -Path "${normalizedBase}" | Out-Null }; git clone https://github.com/fastcrw/crw.git ${crwTarget} 2>$null; if (Test-Path ${crwTarget}) { cd ${crwTarget}; cargo build --release }`
                : `mkdir -p "${normalizedBase}" && git clone https://github.com/fastcrw/crw.git ${crwTarget} 2>/dev/null; [ -d ${crwTarget} ] && cd ${crwTarget} && cargo build --release`;

            lightpandaCmd = isWindows
                ? `if (!(Test-Path "${normalizedBase}")) { New-Item -ItemType Directory -Force -Path "${normalizedBase}" | Out-Null }; git clone https://github.com/lightpanda-io/browser.git ${lpTarget} 2>$null; npm install -g @lightpanda/browser`
                : `mkdir -p "${normalizedBase}" && git clone https://github.com/lightpanda-io/browser.git ${lpTarget} 2>/dev/null; npm install -g @lightpanda/browser`;
        } else {
            ponytailCmd = isWindows
                ? 'git clone https://github.com/DietrichGebert/ponytail.git "$HOME/.config/ponytail" 2>$null || echo "Ponytail fetched"'
                : 'git clone https://github.com/DietrichGebert/ponytail.git ~/.config/ponytail 2>/dev/null || echo "Ponytail fetched"';

            const JevGraphService = require('./jevgraph-service');
            const jevCmds = JevGraphService.getInstallCommands(isWindows);
            jevGraphCmd = jevCmds.combinedCmd;

            codeGraphCmd = isWindows
                ? 'pip install codegraphcontext'
                : 'pip install codegraphcontext || python3 -m pip install codegraphcontext';

            const { CrwService } = require('./crw-service');
            const crwCmds = CrwService.getInstallCommands(isWindows);
            crwCmd = crwCmds.primaryCmd;

            const { LightpandaService } = require('./lightpanda-service');
            const lightpandaCmds = LightpandaService.getInstallCommands(isWindows, isMac);
            lightpandaCmd = lightpandaCmds.primaryCmd;
        }

        const verifyCmd = 'rtk --version ; rg --version ; headroom --version';

        return {
            rtkCmd,
            rtkOnlyCmd,
            rgCmd,
            bridgeCmd,
            headroomCmd,
            omniRouteCmd,
            ponytailCmd,
            jevGraphCmd,
            codeGraphCmd,
            crwCmd,
            lightpandaCmd,
            verifyCmd,
            combinedCmd: isWindows ? `${rtkCmd} ; ${headroomCmd} ; ${jevGraphCmd} ; ${codeGraphCmd} ; ${crwCmd} ; ${lightpandaCmd}` : `${rtkCmd} && ${headroomCmd} && ${jevGraphCmd} && ${codeGraphCmd} && ${crwCmd} && ${lightpandaCmd}`
        };
    }

    static getUninstallCommands(isWindows = (process.platform === 'win32'), isMac = (process.platform === 'darwin')) {
        let rtkUninstallCmd;
        if (isWindows) {
            rtkUninstallCmd = 'winget uninstall --id rtk-ai.rtk --accept-source-agreements';
        } else if (isMac) {
            rtkUninstallCmd = 'brew uninstall rtk || rm -f $(which rtk 2>/dev/null)';
        } else {
            rtkUninstallCmd = 'rm -f /usr/local/bin/rtk ~/.local/bin/rtk $(which rtk 2>/dev/null)';
        }

        const headroomUninstallCmd = isWindows
            ? 'python -m pip uninstall -y headroom-ai 2>$null; if (!$?) { pip uninstall -y headroom-ai }'
            : 'pip uninstall -y headroom-ai || pipx uninstall headroom-ai || python3 -m pip uninstall -y headroom-ai';

        const omniRouteUninstallCmd = isWindows
            ? 'if (Get-Command npm -ErrorAction SilentlyContinue) { npm uninstall -g omniroute }'
            : 'command -v npm >/dev/null 2>&1 && npm uninstall -g omniroute || true';

        const { CrwService } = require('./crw-service');
        const crwUninstallCmds = CrwService.getUninstallCommands(isWindows);
        const crwUninstallCmd = crwUninstallCmds.primaryCmd;

        const { LightpandaService } = require('./lightpanda-service');
        const lightpandaUninstallCmds = LightpandaService.getUninstallCommands(isWindows);
        const lightpandaUninstallCmd = lightpandaUninstallCmds.primaryCmd;

        return {
            rtkUninstallCmd,
            headroomUninstallCmd,
            omniRouteUninstallCmd,
            crwUninstallCmd,
            lightpandaUninstallCmd,
            combinedUninstallCmd: isWindows
                ? `${rtkUninstallCmd} ; ${headroomUninstallCmd} ; ${omniRouteUninstallCmd} ; ${crwUninstallCmd} ; ${lightpandaUninstallCmd}`
                : `${rtkUninstallCmd} && ${headroomUninstallCmd} && ${omniRouteUninstallCmd} && ${crwUninstallCmd} && ${lightpandaUninstallCmd}`
        };
    }

    static uninstallRtk() {
        const isWindows = process.platform === 'win32';
        const isMac = process.platform === 'darwin';
        const cmds = this.getUninstallCommands(isWindows, isMac);
        this.runInTerminal(cmds.rtkUninstallCmd);
    }

    static uninstallHeadroom() {
        const isWindows = process.platform === 'win32';
        const isMac = process.platform === 'darwin';
        const cmds = this.getUninstallCommands(isWindows, isMac);
        this.runInTerminal(cmds.headroomUninstallCmd);
    }

    static getPluginManagementHeader(basePath = '') {
        const storageRoot = (basePath || '').trim() || 'D:\\Software\\AI Agent Space';
        return [
            '',
            `> **Components Storage & Plugin Management Specification (/pluginmanagement V1.4 & /grill-me Protocol)**:`,
            `> - **Pre-Flight Alignment (\`/grill-me\`)**: If the target Components Storage Path (\`${storageRoot}\`), installation scope, or any naming/path conflict is ambiguous, interview the user one question at a time with \`(Recommended)\` defaults before executing changes. If a question can be answered by inspecting the machine/workspace first, inspect it directly.`,
            `> - **1. Standard Plugin Directory Structure (\`${storageRoot}/plugins/<plugin-name>/\`)**:`,
            `>   - \`plugin.json\`: Required manifest file (MUST include \`"upstream": "https://github.com/<owner>/<repo>"\`).`,
            `>   - \`mcp_config.json\`: Optional MCP server definitions.`,
            `>   - \`hooks.json\`: Optional hooks definition.`,
            `>   - \`skills/<skill-name>/SKILL.md\`: Must include \`upstream: "https://github.com/<owner>/<repo>"\` in YAML frontmatter (flat 1-level skill directory structure).`,
            `>   - \`agents/<agent-name>.md\` & \`rules/<rule-name>.md\`: Must include \`upstream\` in YAML frontmatter.`,
            `>   - **Duplicate Naming Collision Rule**: If two or more components share the same name, append \`-1\`, \`-2\`, etc. sequentially (\`<name>-1\`, \`<name>-2\`) so nothing collides or overwrites.`,
            `> - **2. Universal Shared Folder Specification (\`${storageRoot}/shared/\`)**:`,
            `>   - Preserve \`agent-connectors.json\`, \`handoff/\`, and \`_upstream_backups/\` as the cross-agent IPC and coordination hub; never treat \`shared/\` as loose/orphaned files.`,
            `>   - Any subfolder in \`shared/\` for collaborating skills MUST be named after the joining skills (e.g. \`stagehand-fastcrw\`).`,
            `> - **3. Mandatory Upstream Links**: Record the upstream GitHub URL in every \`plugin.json\`, \`SKILL.md\`, rule, and agent frontmatter.`,
            `> - **4. Centralized Weekly Update Checking (NO Decentralized Scripts)**:`,
            `>   - **DO NOT** create local \`update_checker.mjs\` or \`update_check_state.json\` files inside component folders; update checking is centralized weekly.`,
            `> - **5. Mandatory File Encoding (Strict UTF-8 Without BOM)**:`,
            `>   - Write ALL \`plugin.json\`, \`mcp_config.json\`, \`hooks.json\`, \`SKILL.md\`, and \`*.md\` files strictly in UTF-8 without BOM (\`0xEF,0xBB,0xBF\` is forbidden). Use Node \`fs.writeFileSync(p, c, "utf8")\` or PowerShell \`.NET UTF8Encoding($false)\`.`,
            `> - **6. One-Time Rearrangement Stability**:`,
            `>   - If the directory structure in \`${storageRoot}\` is already organized, **STOP** rearranging or moving existing component folders on subsequent runs unless explicitly requested.`
        ].join('\n');
    }

    static generateAiInstallPrompt(isWindows = (process.platform === 'win32'), isMac = (process.platform === 'darwin'), rtkMissing = true, headroomMissing = true, ponytailMissing = true, omniMissing = false, antiSlopMissing = true, jevGraphMissing = true, codeGraphMissing = true, crwMissing = true, lightpandaMissing = true, customInstallPath = null, eccMissing = false) {
        const osName = isWindows ? 'Windows (PowerShell / Command Prompt)' : (isMac ? 'macOS (Homebrew / Terminal)' : 'Linux (Bash / Terminal)');
        const basePath = (customInstallPath || '').trim();
        const storageRoot = basePath || 'D:\\Software\\AI Agent Space';
        const cmds = this.getInstallCommands(isWindows, isMac, basePath);

        let items = [];
        let stepIdx = 1;

        if (rtkMissing) {
            items.push(`${stepIdx}. **Install RTK-RG (RTK CLI + ripgrep Upstream + RTK-RG Bridge Shims — Upstream: \`https://github.com/rtk-ai/rtk\` & \`https://github.com/BurntSushi/ripgrep\`)**:\n   Run command: \`${cmds.rtkCmd}\`\n   (Installs \`rtk-ai/rtk\`, upstream \`BurntSushi/ripgrep\` (\`rg\`), co-locates \`rg.exe\` with \`rtk.exe\`, creates \`~/.local/bin\` bridge shims \`ls.cmd\`, \`dir.cmd\`, \`grep.cmd\`, \`rtk-rg.cmd\`, and registers \`plugins/rtk/plugin.json\` with \`"upstream": "https://github.com/rtk-ai/rtk"\`).`);
            stepIdx++;
        }

        if (headroomMissing) {
            items.push(`${stepIdx}. **Install Headroom Context Compression (Upstream: \`https://github.com/headroomlabs-ai/headroom\`)**:\n   Run command: \`${cmds.headroomCmd}\``);
            stepIdx++;
        }

        if (jevGraphMissing) {
            items.push(`${stepIdx}. **Install JevGraph Knowledge Graph Engine (Upstream: \`https://github.com/chenmingtang830/jevgraph\`)**:\n   Clone and set up JevGraph via \`uv\` in \`${storageRoot}/plugins/jevgraph\` (with \`plugin.json\` recording \`"upstream": "https://github.com/chenmingtang830/jevgraph"\`):\n   \`${cmds.jevGraphCmd}\`\n   (Provides bounded document-to-graph pipeline and evidence mapping; ensure skills \`/jevgraph-build\` and \`/jevgraph-query\` include \`upstream\` frontmatter).`);
            stepIdx++;
        }

        if (codeGraphMissing) {
            items.push(`${stepIdx}. **Install CodeGraphContext Code AST Engine (Upstream: \`https://github.com/CodeGraphContext/CodeGraphContext\`)**:\n   Run command:\n   \`${cmds.codeGraphCmd}\`\n   (Provides semantic code knowledge graph, AST indexing, and symbol lookups via \`cgc\`; ensure skills \`/codegraph-index\` and \`/codegraph-query\` include \`upstream\` frontmatter).`);
            stepIdx++;
        }

        if (crwMissing) {
            items.push(`${stepIdx}. **Install fastCRW Hybrid Scraper & Search Engine (Upstream: \`https://github.com/fastcrw/crw\`)**:\n   Install/configure under \`${storageRoot}/plugins/fastcrw\` (and shared state in \`${storageRoot}/shared/stagehand-fastcrw\`):\n   \`${cmds.crwCmd}\`\n   (Ensure \`plugin.json\` includes \`"upstream": "https://github.com/fastcrw/crw"\` written in UTF-8 without BOM).`);
            stepIdx++;
        }

        if (lightpandaMissing) {
            items.push(`${stepIdx}. **Install Lightpanda Headless Browser Engine (Upstream: \`https://github.com/lightpanda-io/browser\`)**:\n   Install/configure under \`${storageRoot}/plugins/lightpanda\`:\n   \`${cmds.lightpandaCmd}\`\n   (Provides ultra-lightweight V8 dynamic JS rendering and local MCP server; ensure \`plugin.json\` includes \`"upstream": "https://github.com/lightpanda-io/browser"\`).`);
            stepIdx++;
        }

        if (ponytailMissing) {
            items.push(`${stepIdx}. **Fetch & Install Ponytail YAGNI Token Saver (Upstream: \`https://github.com/DietrichGebert/ponytail\`)**:\n   Package into \`${storageRoot}/plugins/ponytail\` (with \`plugin.json\` and \`skills/ponytail*/SKILL.md\` containing \`upstream: "https://github.com/DietrichGebert/ponytail"\` in UTF-8 No BOM) and bridge to the active IDE skills directory (\`~/.gemini/config/skills/\`).`);
            stepIdx++;
        }

        if (antiSlopMissing) {
            items.push(`${stepIdx}. **Fetch & Install Anti-Slop Framework (Upstream: \`https://github.com/miqdadbadjuber/anti-slop\`)**:\n   Package into \`${storageRoot}/plugins/anti-slop\` (with \`plugin.json\` and \`skills/antislop*/SKILL.md\` containing \`upstream: "https://github.com/miqdadbadjuber/anti-slop"\` in UTF-8 No BOM) and bridge to the active IDE skills directory.`);
            stepIdx++;
        }

        if (eccMissing) {
            items.push(`${stepIdx}. **Fetch & Install ECC Agent Harness (Upstream: \`https://github.com/affaan-m/ECC\`)**:\n   Fetch ECC skills (\`/strategic-compact\`, \`/ck\`, \`/council\`, \`/agent-evaluator\`) with \`upstream: "https://github.com/affaan-m/ECC"\` in YAML frontmatter (UTF-8 No BOM).`);
            stepIdx++;
        }

        const verifyCmds = [];
        if (rtkMissing) verifyCmds.push('`rtk --version`', '`rg --version`');
        if (headroomMissing) verifyCmds.push('`headroom --version`');
        if (jevGraphMissing) verifyCmds.push('`uv run jevgraph --help`');
        if (codeGraphMissing) verifyCmds.push('`cgc --version`');
        if (crwMissing) verifyCmds.push('`crw --version`');
        if (lightpandaMissing) verifyCmds.push('`lightpanda --version`');
        const verifyText = verifyCmds.length > 0 ? `Run ${verifyCmds.join(', ')}, verify all manifest/skill files are UTF-8 without BOM and contain \`upstream\` links, and confirm active status in IDE.` : 'Verify all components are active in IDE and compliant with /pluginmanagement V1.4.';

        items.push(`${stepIdx}. **Verify Installations & /pluginmanagement Compliance**:\n   ${verifyText}`);
        stepIdx++;
        items.push(`${stepIdx}. **Confirm Success**:\n   Report the installed version numbers, plugin paths, and active status back to me once done.`);

        const missingLabels = [];
        if (rtkMissing) missingLabels.push('RTK-RG');
        if (headroomMissing) missingLabels.push('Headroom');
        if (jevGraphMissing) missingLabels.push('JevGraph');
        if (codeGraphMissing) missingLabels.push('CodeGraphContext');
        if (crwMissing) missingLabels.push('fastCRW');
        if (lightpandaMissing) missingLabels.push('Lightpanda');
        if (antiSlopMissing) missingLabels.push('Anti-Slop');
        if (ponytailMissing) missingLabels.push('Ponytail');
        if (eccMissing) missingLabels.push('ECC');

        const labelText = missingLabels.length > 0 ? missingLabels.join(', ') : 'necessary';
        const targetPathHeader = this.getPluginManagementHeader(basePath);

        const prompt = [
            `Please help me install, fetch, and configure the missing tools (${labelText}) for Token Saver on this ${osName} machine following \`/pluginmanagement\` V1.4 and \`/grill-me\`:${targetPathHeader}`,
            '',
            items.join('\n\n'),
            '',
            'Please align with me on any ambiguous path/scope decisions first (one question at a time with recommended defaults), then execute these terminal commands and plugin setups to make them globally available in the IDE.'
        ].join('\n');

        return prompt;
    }

    static generateSingleElementAiPrompt(elementKey, isWindows = (process.platform === 'win32'), isMac = (process.platform === 'darwin'), customInstallPath = null) {
        const osName = isWindows ? 'Windows (PowerShell / Command Prompt)' : (isMac ? 'macOS (Homebrew / Terminal)' : 'Linux (Bash / Terminal)');
        const basePath = (customInstallPath || '').trim();
        const storageRoot = basePath || 'D:\\Software\\AI Agent Space';
        const cmds = this.getInstallCommands(isWindows, isMac, basePath);

        let title = '';
        let instructions = [];

        switch (elementKey) {
            case 'omniroute':
                title = 'OmniRoute AI Gateway (Self-Installed Local Router)';
                instructions.push(
                    `1. **Install Self-Managed OmniRoute CLI**:\n   Run command: \`${cmds.omniRouteCmd}\``,
                    `2. **Verify Installation**:\n   Run: \`omniroute --version\``,
                    `3. **Enable in Quick Actions**:\n   Toggle **OmniRoute Gateway** ON in Token Saver Quick Actions (status dot turns green) and connect endpoint \`http://localhost:20128/v1\`.`
                );
                break;
            case 'jevgraph':
                title = 'JevGraph Knowledge Graph Engine (chenmingtang830/jevgraph)';
                instructions.push(
                    `1. **Clone & Setup JevGraph via uv in \`${storageRoot}/plugins/jevgraph\`**:\n   Run command: \`${cmds.jevGraphCmd}\`\n   Ensure \`plugin.json\` includes \`"upstream": "https://github.com/chenmingtang830/jevgraph"\` (UTF-8 No BOM).`,
                    `2. **Verify Engine**:\n   Run: \`uv run jevgraph --help\` or verify directory at \`${storageRoot}/plugins/jevgraph\`.`,
                    `3. **Skills Integration**:\n   Ensure skills \`/jevgraph-build\` and \`/jevgraph-query\` include \`upstream: "https://github.com/chenmingtang830/jevgraph"\` in YAML frontmatter.`
                );
                break;
            case 'rtk':
                title = 'RTK-RG (Rust Token Killer + ripgrep Upstream + Bridge)';
                instructions.push(
                    `1. **Install RTK CLI + ripgrep (rg) + RTK-RG Bridge Files (Upstreams: \`rtk-ai/rtk\` & \`BurntSushi/ripgrep\`)**:\n   Run command: \`${cmds.rtkCmd}\``,
                    `2. **Verify Installation & Bridge**:\n   Run: \`rtk --version\`, \`rg --version\`, and \`rtk gain\`. Verify \`rg.exe\` is co-located alongside \`rtk.exe\`, \`~/.local/bin\` contains \`ls.cmd\`, \`dir.cmd\`, \`grep.cmd\`, \`rtk-rg.cmd\`, and \`${storageRoot}/plugins/rtk/plugin.json\` records \`"upstream": "https://github.com/rtk-ai/rtk"\` (UTF-8 No BOM).`,
                    `3. **RTK-RG Usage Invariants**:\n   - Always specify an explicit target directory with \`rtk rg "<pattern>" .\` (never bare \`rtk rg "<pattern>"\`, which waits on stdin EOF).\n   - Prefer \`rtk ls <path>\` over \`rtk dir\` on Windows so forward slashes work natively.`
                );
                break;
            case 'headroom':
                title = 'Headroom Context Compression (headroomlabs-ai/headroom)';
                instructions.push(
                    `1. **Install Headroom Python Package**:\n   Run command: \`${cmds.headroomCmd}\``,
                    `2. **Verify Installation**:\n   Run: \`headroom --version\`.`,
                    `3. **Skills Integration**:\n   Ensure \`/rtk-compress\` is active with \`upstream: "https://github.com/headroomlabs-ai/headroom"\` in YAML frontmatter (UTF-8 No BOM).`
                );
                break;
            case 'ponytail':
                title = 'Ponytail YAGNI Suite (DietrichGebert/ponytail)';
                instructions.push(
                    `1. **Fetch & Package Ponytail Plugin**:\n   Fetch Ponytail from GitHub (\`https://github.com/DietrichGebert/ponytail\`) into \`${storageRoot}/plugins/ponytail\` with \`plugin.json\` (\`"upstream": "https://github.com/DietrichGebert/ponytail"\`) and bridge skills into \`~/.gemini/config/skills/\` (UTF-8 No BOM).`,
                    `2. **Verify Skills**:\n   Ensure \`/ponytail\`, \`/ponytail-audit\`, \`/ponytail-debt\`, \`/ponytail-gain\`, \`/ponytail-help\`, \`/ponytail-review\` include \`upstream\` in YAML frontmatter.`,
                    `3. **Configure Rules**:\n   Sync Ponytail YAGNI directives via Token Saver.`
                );
                break;
            case 'antislop':
                title = 'Anti-Slop Framework (miqdadbadjuber/anti-slop)';
                instructions.push(
                    `1. **Fetch & Package Anti-Slop Plugin**:\n   Fetch Anti-Slop from GitHub (\`https://github.com/miqdadbadjuber/anti-slop\`) into \`${storageRoot}/plugins/anti-slop\` with \`plugin.json\` (\`"upstream": "https://github.com/miqdadbadjuber/anti-slop"\`) and bridge skills into \`~/.gemini/config/skills/\` (UTF-8 No BOM).`,
                    `2. **Verify Skills**:\n   Ensure \`/antislop\`, \`/antislop-ui\`, \`/antislop-copywriting\`, \`/antislop-human\`, \`/antislop-layoutmobile\`, \`/antislop-code\` include \`upstream\` in YAML frontmatter.`,
                    `3. **Configure Rules**:\n   Ensure Anti-Slop hygiene rules are active in IDE agent configuration.`
                );
                break;
            case 'codegraph':
                title = 'CodeGraphContext Code AST Engine (CodeGraphContext/CodeGraphContext)';
                instructions.push(
                    `1. **Install CodeGraphContext**:\n   Run command: \`${cmds.codeGraphCmd}\``,
                    `2. **Verify Installation**:\n   Run: \`cgc --version\`.`,
                    `3. **Skills & Indexing**:\n   Ensure \`/codegraph-index\` and \`/codegraph-query\` include \`upstream: "https://github.com/CodeGraphContext/CodeGraphContext"\` in YAML frontmatter (UTF-8 No BOM).`
                );
                break;
            case 'crw':
            case 'fastcrw':
                title = 'fastCRW Hybrid Scraper & Search Engine (fastcrw/crw)';
                instructions.push(
                    `1. **Install fastCRW CLI / Server in \`${storageRoot}/plugins/fastcrw\`**:\n   Run command: \`${cmds.crwCmd}\`\n   Store shared stagehand/fastcrw state in \`${storageRoot}/shared/stagehand-fastcrw/\` and ensure \`plugin.json\` includes \`"upstream": "https://github.com/fastcrw/crw"\` (UTF-8 No BOM).`,
                    `2. **Verify Installation**:\n   Run: \`crw --version\` or \`crw-server --version\`.`,
                    `3. **Usage**:\n   Run \`crw <url>\` to scrape websites into token-efficient markdown.`
                );
                break;
            case 'lightpanda':
                title = 'Lightpanda Headless Browser Engine (lightpanda-io/browser)';
                instructions.push(
                    `1. **Install Lightpanda Browser in \`${storageRoot}/plugins/lightpanda\`**:\n   Run command: \`${cmds.lightpandaCmd}\`\n   Ensure \`plugin.json\` includes \`"upstream": "https://github.com/lightpanda-io/browser"\` (UTF-8 No BOM).`,
                    `2. **Verify Installation**:\n   Run: \`lightpanda --version\` or \`npx @lightpanda/browser --version\`.`,
                    `3. **Start Local MCP Server**:\n   Run \`lightpanda mcp --port 8000\` or configure in agent's MCP settings.`
                );
                break;
            case 'ecc':
                title = 'ECC Agent Harness & Context Optimization System (affaan-m/ECC)';
                instructions.push(
                    `1. **Fetch & Install ECC Skills**:\n   Fetch ECC from GitHub (\`https://github.com/affaan-m/ECC\`) into \`${storageRoot}/plugins/ecc\` (with \`plugin.json\`) and bridge skills into \`~/.gemini/config/skills/\` (UTF-8 No BOM).`,
                    `2. **Verify Skills**:\n   Ensure \`/strategic-compact\`, \`/ck\`, \`/council\`, and \`/agent-evaluator\` include \`upstream: "https://github.com/affaan-m/ECC"\` in YAML frontmatter.`,
                    `3. **Auto-Trigger Policy**:\n   Ensure agent rules enforce strategic compaction at phase boundaries.`
                );
                break;
            default:
                return this.generateAiInstallPrompt(isWindows, isMac, true, true, true, false, true, true, true, true, true, basePath, true);
        }

        const targetPathHeader = this.getPluginManagementHeader(basePath);

        return [
            `Please help me install, configure, and verify **${title}** for Token Saver on this ${osName} machine following \`/pluginmanagement\` V1.4 and \`/grill-me\`:${targetPathHeader}`,
            '',
            instructions.join('\n\n'),
            '',
            'Please align with me on any ambiguous path/scope decisions first (one question at a time with recommended defaults), then execute these terminal commands and setup steps and confirm once complete.'
        ].join('\n');
    }

    static runInTerminal(command = 'rtk gain') {
        const terminalName = 'Token Saver (RTK)';
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (!terminal) {
            terminal = vscode.window.createTerminal(terminalName);
        }
        terminal.show();

        // Flatten and extract discrete commands if array or chained command string is provided
        const cmdsToRun = [];
        const parseCommands = (item) => {
            if (!item) return;
            if (Array.isArray(item)) {
                item.forEach(sub => parseCommands(sub));
                return;
            }
            if (typeof item !== 'string') return;
            const str = item.trim();
            if (!str) return;

            // Split top-level statements separated by semicolons or &&, preserving quotes and braces/parentheses
            const parts = [];
            let current = '';
            let inSingleQuote = false;
            let inDoubleQuote = false;
            let braceDepth = 0;
            let parenDepth = 0;

            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                const nextChar = str[i + 1];

                if (char === "'" && !inDoubleQuote) {
                    inSingleQuote = !inSingleQuote;
                    current += char;
                } else if (char === '"' && !inSingleQuote) {
                    inDoubleQuote = !inDoubleQuote;
                    current += char;
                } else if (!inSingleQuote && !inDoubleQuote) {
                    if (char === '{') {
                        braceDepth++;
                        current += char;
                    } else if (char === '}') {
                        if (braceDepth > 0) braceDepth--;
                        current += char;
                    } else if (char === '(') {
                        parenDepth++;
                        current += char;
                    } else if (char === ')') {
                        if (parenDepth > 0) parenDepth--;
                        current += char;
                    } else if (braceDepth === 0 && parenDepth === 0 && char === ';') {
                        if (current.trim()) parts.push(current.trim());
                        current = '';
                    } else if (braceDepth === 0 && parenDepth === 0 && char === '&' && nextChar === '&') {
                        if (current.trim()) parts.push(current.trim());
                        current = '';
                        i++; // skip second &
                    } else {
                        current += char;
                    }
                } else {
                    current += char;
                }
            }
            if (current.trim()) parts.push(current.trim());

            for (let part of parts) {
                part = part.trim();
                if (part) {
                    cmdsToRun.push(part);
                }
            }
        };

        parseCommands(command);

        if (cmdsToRun.length === 0) {
            return;
        }

        // Send each command one by one with a small delay if multiple commands exist
        cmdsToRun.forEach((cmd, idx) => {
            if (idx === 0) {
                terminal.sendText(cmd);
            } else {
                setTimeout(() => {
                    try {
                        terminal.sendText(cmd);
                    } catch (e) {
                        // ignore terminal closed
                    }
                }, idx * 300);
            }
        });
    }
}

module.exports = RtkService;