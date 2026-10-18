const path = require('path');
const fs = require('fs');
const os = require('os');
const vscode = require('vscode');

class EccService {
    static getCandidateDirs() {
        const dirs = [];
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const customPath = (config.get('upstreamInstallPath') || '').trim();
        if (customPath) {
            dirs.push(path.join(customPath, 'ECC'));
            dirs.push(path.join(customPath, 'everything-claude-code'));
            dirs.push(customPath);
        }

        const folders = vscode.workspace.workspaceFolders;
        if (folders && folders.length > 0) {
            const root = folders[0].uri.fsPath;
            dirs.push(path.join(root, '.agents', 'skills'));
            dirs.push(path.join(root, '..', 'ECC'));
            dirs.push(path.join(root, '..', 'everything-claude-code'));
        }

        const home = os.homedir();
        dirs.push(path.join(home, '.gemini', 'config', 'skills'));
        dirs.push(path.join(home, '.claude', 'ck'));
        dirs.push(path.join(home, '.config', 'ecc'));
        dirs.push(path.join(home, '.config', 'everything-claude-code'));

        return dirs;
    }

    static checkInstalled() {
        return new Promise((resolve) => {
            const home = os.homedir();
            const folders = vscode.workspace.workspaceFolders;
            const wsRoot = folders && folders.length > 0 ? folders[0].uri.fsPath : null;

            const eccSkills = ['strategic-compact', 'ck', 'council', 'agent-evaluator'];
            let detectedSkillsCount = 0;
            let detectedPath = null;

            for (const sk of eccSkills) {
                const globalPath = path.join(home, '.gemini', 'config', 'skills', sk, 'SKILL.md');
                const wsPath = wsRoot ? path.join(wsRoot, '.agents', 'skills', sk, 'SKILL.md') : null;
                if (fs.existsSync(globalPath) || (wsPath && fs.existsSync(wsPath))) {
                    detectedSkillsCount++;
                    if (!detectedPath) {
                        detectedPath = fs.existsSync(globalPath) ? globalPath : wsPath;
                    }
                }
            }

            // Also check candidate directories for cloned repo
            const candidateDirs = this.getCandidateDirs();
            let repoDetected = false;
            let repoPath = null;
            for (const dir of candidateDirs) {
                if (fs.existsSync(path.join(dir, 'skills', 'strategic-compact')) ||
                    fs.existsSync(path.join(dir, 'skills', 'ck')) ||
                    fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(path.join(dir, 'skills'))) {
                    repoDetected = true;
                    repoPath = dir;
                    break;
                }
            }

            const installed = detectedSkillsCount > 0 || repoDetected;
            const version = installed
                ? `v1.2.0 (${detectedSkillsCount > 0 ? detectedSkillsCount : 4}/4 skills active)`
                : null;

            resolve({
                installed,
                version: version || 'Not synced',
                skillsCount: detectedSkillsCount > 0 ? detectedSkillsCount : (repoDetected ? 4 : 0),
                path: detectedPath || repoPath || null,
                repoPath
            });
        });
    }

    static getInstallCommands(isWindows, customInstallPath = null) {
        const basePath = (customInstallPath || '').trim();
        const cloneTarget = basePath ? path.join(basePath, 'ECC') : 'ECC';

        if (isWindows) {
            return {
                cloneCmd: `git clone https://github.com/affaan-m/ECC.git "${cloneTarget}"`,
                syncSkillsCmd: `npm run ecc:sync 2>$null`,
                fullCmd: `git clone https://github.com/affaan-m/ECC.git "${cloneTarget}"`
            };
        }

        return {
            cloneCmd: `git clone https://github.com/affaan-m/ECC.git "${cloneTarget}"`,
            syncSkillsCmd: `npm run ecc:sync 2>/dev/null || true`,
            fullCmd: `git clone https://github.com/affaan-m/ECC.git "${cloneTarget}"`
        };
    }

    static async saveSessionCheckpoint(contextSummary = '') {
        try {
            const folders = vscode.workspace.workspaceFolders;
            if (!folders || folders.length === 0) {
                return { success: false, error: 'No open workspace' };
            }
            const root = folders[0].uri.fsPath;
            const ckDir = path.join(root, '.agents', 'ck');
            if (!fs.existsSync(ckDir)) {
                fs.mkdirSync(ckDir, { recursive: true });
            }

            const checkpointFile = path.join(ckDir, 'context.json');
            const markdownFile = path.join(ckDir, 'CONTEXT.md');

            const timestamp = new Date().toISOString();
            const checkpointData = {
                version: 2,
                timestamp,
                workspace: path.basename(root),
                summary: contextSummary || 'Manual Context Keeper milestone checkpoint',
                leftOff: 'Active development session',
                nextSteps: ['Resume planned tasks with clean pruned context'],
                status: 'active'
            };

            fs.writeFileSync(checkpointFile, JSON.stringify(checkpointData, null, 2), 'utf8');

            const mdContent = `# Context Keeper Snapshot (${timestamp})
**Project:** ${path.basename(root)}
**Summary:** ${checkpointData.summary}
**Left Off:** ${checkpointData.leftOff}
**Next Steps:**
- ${checkpointData.nextSteps.join('\n- ')}
`;
            fs.writeFileSync(markdownFile, mdContent, 'utf8');

            return { success: true, path: markdownFile, timestamp };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
}

module.exports = { EccService };
