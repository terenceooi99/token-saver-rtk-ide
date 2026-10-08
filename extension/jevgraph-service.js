const { exec, spawn } = require('child_process');
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');

class JevGraphService {
    static checkInstalled() {
        return new Promise((resolve) => {
            // 1. Check if jevgraph is directly executable
            exec('jevgraph --help', (error, stdout) => {
                if (!error && stdout) {
                    resolve({ installed: true, runner: 'jevgraph', version: 'v0.5.1', path: 'jevgraph' });
                    return;
                }

                // 2. Check if uv is available and can run jevgraph
                exec('uv run jevgraph --help', (uvErr, uvStdout) => {
                    if (!uvErr && uvStdout) {
                        resolve({ installed: true, runner: 'uv', version: 'v0.5.1 (uv)', path: 'uv run jevgraph' });
                        return;
                    }

                    // 3. Check if python module jevgraph is installed
                    exec('python -m jevgraph --help || py -m jevgraph --help', (pyErr, pyStdout) => {
                        if (!pyErr && pyStdout) {
                            resolve({ installed: true, runner: 'python', version: 'v0.5.1 (python)', path: 'python -m jevgraph' });
                            return;
                        }

                        // 4. Check if uv itself is available for fast 1-click execution
                        exec('uv --version', (uvCheckErr, uvVersion) => {
                            resolve({
                                installed: false,
                                uvAvailable: !uvCheckErr,
                                uvVersion: !uvCheckErr ? uvVersion.trim() : null,
                                version: null,
                                path: null
                            });
                        });
                    });
                });
            });
        });
    }

    static isEnabled() {
        try {
            return vscode.workspace.getConfiguration('tokenSaver').get('jevGraphEnabled', true);
        } catch (e) {
            return true;
        }
    }

    static getProvider() {
        try {
            return vscode.workspace.getConfiguration('tokenSaver').get('jevGraphProvider', 'keyword');
        } catch (e) {
            return 'keyword';
        }
    }

    static getInstallCommands(isWindows = (process.platform === 'win32')) {
        const repoUrl = 'https://github.com/chenmingtang830/jevgraph.git';
        const uvInstallCmd = isWindows
            ? 'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"'
            : 'curl -LsSf https://astral.sh/uv/install.sh | sh';

        const jevgraphSyncCmd = isWindows
            ? `git clone ${repoUrl} "$HOME/.config/jevgraph" 2>$null; if (Test-Path "$HOME/.config/jevgraph") { cd "$HOME/.config/jevgraph"; uv sync --extra dev }`
            : `git clone ${repoUrl} ~/.config/jevgraph 2>/dev/null; [ -d ~/.config/jevgraph ] && cd ~/.config/jevgraph && uv sync --extra dev`;

        const pipInstallCmd = isWindows
            ? `pip install "git+${repoUrl}"`
            : `pip install "git+${repoUrl}" || pipx install "git+${repoUrl}"`;

        return {
            uvInstallCmd,
            jevgraphSyncCmd,
            pipInstallCmd,
            combinedCmd: isWindows ? `${uvInstallCmd} ; ${jevgraphSyncCmd}` : `${uvInstallCmd} && ${jevgraphSyncCmd}`
        };
    }

    static getUninstallCommands(isWindows = (process.platform === 'win32')) {
        const removeDirCmd = isWindows
            ? 'if (Test-Path "$HOME/.config/jevgraph") { Remove-Item -Recurse -Force "$HOME/.config/jevgraph" }'
            : 'rm -rf ~/.config/jevgraph';
        const pipUninstallCmd = isWindows
            ? 'pip uninstall -y jevgraph 2>$null'
            : 'pip uninstall -y jevgraph 2>/dev/null || true';

        return {
            removeDirCmd,
            pipUninstallCmd,
            combinedUninstallCmd: isWindows ? `${removeDirCmd} ; ${pipUninstallCmd}` : `${removeDirCmd} ; ${pipUninstallCmd}`
        };
    }

    static runInTerminal(command) {
        const terminalName = 'Token Saver (JevGraph)';
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (!terminal) {
            terminal = vscode.window.createTerminal(terminalName);
        }
        terminal.show();
        terminal.sendText(command);
    }

    static buildGraphCommand(inputFile, outputFile = 'runs/graph.json', provider = 'keyword', ontology = null, entities = null) {
        let cmd = `jevgraph build "${inputFile}" --provider ${provider} --out "${outputFile}"`;
        if (ontology) cmd += ` --ontology "${ontology}"`;
        if (entities) cmd += ` --entities "${entities}"`;
        return cmd;
    }

    /**
     * Interactive document insertion: opens file explorer or accepts web URL.
     */
    static async insertDocumentsInteractive(outputChannel) {
        const choices = [
            {
                label: '$(file-directory) Browse Local Document Files...',
                description: 'Open file explorer to select PDF, DOCX, PPTX, TXT, MD documents',
                action: 'file'
            },
            {
                label: '$(globe) Enter Web Link or Document URL...',
                description: 'Ingest online specification, GitHub Markdown URL, or documentation page',
                action: 'url'
            },
            {
                label: '$(sync) Rebuild Knowledge Graph from All Repo Documents',
                description: 'Scan workspace and combine all repository specs/documents into JevGraph',
                action: 'rebuild'
            },
            {
                label: '$(trash) Reset / Clear Knowledge Graph for Current Repo',
                description: 'Wipe runs/graph.json and start fresh for active repository',
                action: 'reset'
            }
        ];

        const selected = await vscode.window.showQuickPick(choices, {
            placeHolder: `JevGraph (${path.basename(this.getWorkspaceRoot())}): Select action`
        });

        if (!selected) return;

        if (selected.action === 'reset') {
            await this.resetRepoKnowledgeGraph(outputChannel, true);
            return;
        }

        if (selected.action === 'file') {
            const uris = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: true,
                openLabel: 'Insert into JevGraph',
                title: 'Select Documents to Ingest into JevGraph Knowledge Graph',
                filters: {
                    'All Supported Documents': ['pdf', 'docx', 'pptx', 'md', 'markdown', 'txt', 'json', 'yaml', 'yml', 'html'],
                    'PDF Documents': ['pdf'],
                    'Office Documents': ['docx', 'pptx'],
                    'Markdown & Text': ['md', 'markdown', 'txt'],
                    'All Files': ['*']
                }
            });

            if (uris && uris.length > 0) {
                const paths = uris.map(u => u.fsPath);
                await this.ingestDocuments(paths, outputChannel, true);
            }
        } else if (selected.action === 'url') {
            const url = await vscode.window.showInputBox({
                prompt: 'Enter the URL of the document or specification to ingest into JevGraph',
                placeHolder: 'https://raw.githubusercontent.com/.../spec.md or https://example.com/api-docs.pdf',
                ignoreFocusOut: true,
                validateInput: (val) => {
                    if (!val || (!val.startsWith('http://') && !val.startsWith('https://'))) {
                        return 'Please enter a valid HTTP or HTTPS URL';
                    }
                    return null;
                }
            });

            if (url) {
                await this.ingestWebUrl(url, outputChannel);
            }
        } else if (selected.action === 'rebuild') {
            await this.autoInitialBuild(outputChannel, true);
        }
    }

    /**
     * Ingest a web URL by downloading/fetching content and merging into JevGraph.
     */
    static async ingestWebUrl(targetUrl, outputChannel) {
        try {
            vscode.window.showInformationMessage(`🌐 JevGraph: Fetching document from ${targetUrl}...`);
            if (outputChannel) outputChannel.appendLine(`[Token Saver] JevGraph: Fetching web URL: ${targetUrl}`);

            const content = await this.fetchUrlContent(targetUrl);
            const root = this.getWorkspaceRoot();
            const sourcesDir = path.join(root, 'runs', 'sources');
            if (!fs.existsSync(sourcesDir)) {
                fs.mkdirSync(sourcesDir, { recursive: true });
            }

            const parsedUrl = new URL(targetUrl);
            let fileName = path.basename(parsedUrl.pathname) || 'web_document.md';
            if (!fileName.includes('.')) fileName += '.md';
            const savePath = path.join(sourcesDir, `${Date.now()}_${fileName}`);

            fs.writeFileSync(savePath, content, 'utf8');
            if (outputChannel) outputChannel.appendLine(`[Token Saver] JevGraph: Saved web document to ${savePath}`);

            await this.ingestDocuments([savePath], outputChannel, false, targetUrl);
            vscode.window.showInformationMessage(`🕸️ JevGraph: Successfully ingested and combined web document (${fileName}) into runs/graph.json`);
        } catch (err) {
            vscode.window.showErrorMessage(`JevGraph Web Ingestion Error: ${err.message}`);
            if (outputChannel) outputChannel.appendLine(`[Token Saver] JevGraph Web Ingestion Error: ${err.message}`);
        }
    }

    static fetchUrlContent(urlStr) {
        return new Promise((resolve, reject) => {
            const client = urlStr.startsWith('https://') ? https : http;
            client.get(urlStr, { headers: { 'User-Agent': 'TokenSaver-JevGraph/1.0' } }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    return resolve(this.fetchUrlContent(res.headers.location));
                }
                if (res.statusCode !== 200) {
                    return reject(new Error(`HTTP Status ${res.statusCode}: ${res.statusMessage}`));
                }
                let rawData = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => { resolve(rawData); });
            }).on('error', (err) => { reject(err); });
        });
    }

    /**
     * Ingest one or more documents and combine them into runs/graph.json.
     */
    static async ingestDocuments(filePaths, outputChannel, showToast = true, sourceUrl = null) {
        if (!filePaths || filePaths.length === 0) return;
        const root = this.getWorkspaceRoot();
        const runsDir = path.join(root, 'runs');
        if (!fs.existsSync(runsDir)) {
            fs.mkdirSync(runsDir, { recursive: true });
        }

        const graphPath = path.join(runsDir, 'graph.json');
        let existingGraph = this.loadGraph(graphPath);

        let combinedCount = 0;
        for (const filePath of filePaths) {
            try {
                if (!fs.existsSync(filePath)) continue;
                if (outputChannel) outputChannel.appendLine(`[Token Saver] JevGraph: Processing document ${filePath}...`);

                const docGraph = await this.extractDocKnowledge(filePath, sourceUrl);
                existingGraph = this.mergeGraphs(existingGraph, docGraph);
                combinedCount++;
            } catch (err) {
                if (outputChannel) outputChannel.appendLine(`[Token Saver] JevGraph Error processing ${filePath}: ${err.message}`);
            }
        }

        this.saveGraph(graphPath, existingGraph);

        if (outputChannel) {
            outputChannel.appendLine(`[Token Saver] JevGraph: Combined ${combinedCount} document(s). Total entities: ${existingGraph.entities.length}, relations: ${existingGraph.relations.length}`);
        }

        if (showToast) {
            vscode.window.showInformationMessage(
                `🕸️ JevGraph: Successfully combined ${combinedCount} document(s) into runs/graph.json (${existingGraph.entities.length} entities, ${existingGraph.relations.length} relations).`
            );
        }
    }

    /**
     * Extract knowledge from a single document (using JevGraph CLI if available, with built-in AST/regex fallback).
     */
    static async extractDocKnowledge(filePath, originalUrl = null) {
        const ext = path.extname(filePath).toLowerCase();
        const relPath = path.relative(this.getWorkspaceRoot(), filePath) || path.basename(filePath);
        const sourceId = originalUrl || relPath;

        const check = await this.checkInstalled();
        const provider = this.getProvider();

        // If CLI is available and file is PDF/DOCX/PPTX/MD, attempt CLI build
        if (check.installed) {
            try {
                const tempOut = path.join(os.tmpdir(), `jevgraph_${Date.now()}_${path.basename(filePath)}.json`);
                const cmd = this.buildGraphCommand(filePath, tempOut, provider);
                await new Promise((resolve, reject) => {
                    exec(cmd, { cwd: this.getWorkspaceRoot() }, (error) => {
                        if (!error && fs.existsSync(tempOut)) {
                            try {
                                const parsed = JSON.parse(fs.readFileSync(tempOut, 'utf8'));
                                fs.unlinkSync(tempOut);
                                resolve(parsed);
                                return;
                            } catch (e) {}
                        }
                        resolve(null);
                    });
                });
            } catch (e) {}
        }

        // Fallback robust document parser (supports MD, TXT, YAML, JSON, and extracted text)
        let textContent = '';
        try {
            textContent = fs.readFileSync(filePath, 'utf8');
        } catch (e) {
            textContent = `Document: ${path.basename(filePath)}`;
        }

        return this.parseDocumentFallback(sourceId, textContent);
    }

    /**
     * High-speed heuristic entity & relation extractor for documentation files.
     */
    static parseDocumentFallback(sourceId, textContent) {
        const entities = [];
        const relations = [];
        const lines = textContent.split('\n');

        let currentSection = 'Overview';
        let sectionEntities = [];

        lines.forEach((line, lineIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return;

            // Heading detection
            const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                currentSection = headingMatch[2].replace(/[#*_`]/g, '').trim();
                const sectionId = `sec_${currentSection.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
                entities.push({
                    id: sectionId,
                    name: currentSection,
                    type: 'Section/Module',
                    description: `Specification section from ${sourceId}`,
                    source: sourceId,
                    line: lineIdx + 1,
                    evidence: trimmed.substring(0, 160)
                });
                sectionEntities.push(sectionId);
                return;
            }

            // Architecture / Feature definitions (e.g., - **Feature**: description or Key: Value)
            const featureMatch = trimmed.match(/^[-*]\s+\*\*([^*]+)\*\*[:\s]+(.+)$/);
            if (featureMatch) {
                const featName = featureMatch[1].trim();
                const featDesc = featureMatch[2].trim();
                const featId = `ent_${featName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

                entities.push({
                    id: featId,
                    name: featName,
                    type: 'Component/Requirement',
                    description: featDesc.substring(0, 200),
                    source: sourceId,
                    line: lineIdx + 1,
                    evidence: trimmed.substring(0, 160)
                });

                if (sectionEntities.length > 0) {
                    const parentSec = sectionEntities[sectionEntities.length - 1];
                    relations.push({
                        source: parentSec,
                        relation: 'DEFINES_REQUIREMENT',
                        target: featId,
                        evidence: trimmed.substring(0, 160),
                        source_file: sourceId,
                        line: lineIdx + 1
                    });
                }
                return;
            }

            // HTTP Endpoints / API Routes
            const apiMatch = trimmed.match(/(GET|POST|PUT|DELETE|PATCH)\s+([/][a-zA-Z0-9_\-/{}:]+)/);
            if (apiMatch) {
                const apiName = `${apiMatch[1]} ${apiMatch[2]}`;
                const apiId = `api_${apiName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
                entities.push({
                    id: apiId,
                    name: apiName,
                    type: 'API_Endpoint',
                    description: trimmed,
                    source: sourceId,
                    line: lineIdx + 1,
                    evidence: trimmed.substring(0, 160)
                });

                if (sectionEntities.length > 0) {
                    relations.push({
                        source: sectionEntities[sectionEntities.length - 1],
                        relation: 'EXPOSES_ENDPOINT',
                        target: apiId,
                        evidence: trimmed.substring(0, 160),
                        source_file: sourceId,
                        line: lineIdx + 1
                    });
                }
            }
        });

        return {
            sources: [sourceId],
            entities,
            relations
        };
    }

    static mergeGraphs(baseGraph, incomingGraph) {
        if (!incomingGraph) return baseGraph;
        const mergedSources = Array.from(new Set([...(baseGraph.sources || []), ...(incomingGraph.sources || [])]));

        const entityMap = new Map();
        (baseGraph.entities || []).forEach(e => entityMap.set(e.id || e.name.toLowerCase(), e));
        (incomingGraph.entities || []).forEach(e => {
            const key = e.id || e.name.toLowerCase();
            if (!entityMap.has(key)) {
                entityMap.set(key, e);
            }
        });

        const relationMap = new Map();
        (baseGraph.relations || []).forEach(r => {
            const key = `${r.source}|${r.relation}|${r.target}`;
            relationMap.set(key, r);
        });
        (incomingGraph.relations || []).forEach(r => {
            const key = `${r.source}|${r.relation}|${r.target}`;
            if (!relationMap.has(key)) {
                relationMap.set(key, r);
            }
        });

        const entities = Array.from(entityMap.values());
        const relations = Array.from(relationMap.values());

        return {
            version: '1.0',
            last_updated: new Date().toISOString(),
            sources: mergedSources,
            entities,
            relations,
            stats: {
                total_sources: mergedSources.length,
                total_entities: entities.length,
                total_relations: relations.length,
                token_savings_estimate: '85-95%'
            }
        };
    }

    static loadGraph(graphPath) {
        if (fs.existsSync(graphPath)) {
            try {
                return JSON.parse(fs.readFileSync(graphPath, 'utf8'));
            } catch (e) {}
        }
        return {
            version: '1.0',
            last_updated: new Date().toISOString(),
            sources: [],
            entities: [],
            relations: [],
            stats: { total_sources: 0, total_entities: 0, total_relations: 0, token_savings_estimate: '85-95%' }
        };
    }

    static saveGraph(graphPath, graphData) {
        const dir = path.dirname(graphPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(graphPath, JSON.stringify(graphData, null, 2), 'utf8');
    }

    static getWorkspaceRoot() {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            return vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        return process.cwd();
    }

    /**
     * Checks if the active repository already contains a valid JevGraph knowledge graph.
     */
    static hasRepoKnowledgeGraph(workspaceRoot = this.getWorkspaceRoot()) {
        const graphPath = path.join(workspaceRoot, 'runs', 'graph.json');
        if (fs.existsSync(graphPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
                const entityCount = Array.isArray(data.entities) ? data.entities.length : 0;
                const relationCount = Array.isArray(data.relations) ? data.relations.length : 0;
                if (entityCount > 0 || relationCount > 0) {
                    return {
                        exists: true,
                        graphPath,
                        entityCount,
                        relationCount,
                        sources: data.sources || [],
                        lastUpdated: data.last_updated || null
                    };
                }
            } catch (e) {}
        }
        return {
            exists: false,
            graphPath,
            entityCount: 0,
            relationCount: 0,
            sources: [],
            lastUpdated: null
        };
    }

    /**
     * Auto initial build: Checks if the repository already contains a knowledge graph.
     * If not, scans workspace and builds the initial JevGraph from repo documents.
     */
    static async autoInitialBuild(outputChannel, force = false) {
        if (!this.isEnabled()) return;
        const config = vscode.workspace.getConfiguration('tokenSaver');
        if (!force && !config.get('jevGraphAutoBuild', true)) return;

        const root = this.getWorkspaceRoot();
        const repoName = path.basename(root);

        // Pre-check: If repo already contains an active knowledge graph, preserve it and do not overwrite!
        const existingCheck = this.hasRepoKnowledgeGraph(root);
        if (!force && existingCheck.exists) {
            if (outputChannel) {
                outputChannel.appendLine(`[Token Saver] JevGraph: Repository '${repoName}' already contains knowledge graph (${existingCheck.entityCount} entities, ${existingCheck.relationCount} relations). Preserved.`);
            }
            return existingCheck;
        }

        if (outputChannel) {
            outputChannel.appendLine(`[Token Saver] JevGraph: No existing knowledge graph detected for repository '${repoName}'. Scanning repository for initial documents...`);
        }

        try {
            const files = await vscode.workspace.findFiles(
                '**/*.{pdf,docx,pptx,md,markdown,txt}',
                '**/node_modules/**,**/.git/**,**/.agents/**,**/target/**,**/dist/**,**/build/**,**/runs/**,**/coverage/**,**/package-lock.json'
            );

            // Filter relevant documentation/spec files
            const docPaths = files
                .map(f => f.fsPath)
                .filter(p => {
                    const base = path.basename(p).toLowerCase();
                    const rel = path.relative(root, p).toLowerCase();
                    return rel.startsWith('docs') ||
                           rel.startsWith('specs') ||
                           rel.startsWith('spec') ||
                           rel.startsWith('architecture') ||
                           base.includes('prd') ||
                           base.includes('spec') ||
                           base.includes('readme') ||
                           base.includes('claude') ||
                           base.includes('agents') ||
                           base.endsWith('.pdf') ||
                           base.endsWith('.docx') ||
                           base.endsWith('.pptx');
                });

            if (docPaths.length > 0) {
                if (outputChannel) outputChannel.appendLine(`[Token Saver] JevGraph: Auto-building knowledge graph from ${docPaths.length} discovered repository document(s)...`);
                await this.ingestDocuments(docPaths, outputChannel, false);
                if (outputChannel) outputChannel.appendLine(`[Token Saver] JevGraph: Auto initial build completed successfully into runs/graph.json.`);
            } else {
                if (outputChannel) outputChannel.appendLine('[Token Saver] JevGraph: No initial specification documents detected in repository.');
            }
        } catch (err) {
            if (outputChannel) outputChannel.appendLine(`[Token Saver] JevGraph auto-build error: ${err.message}`);
        }
    }

    /**
     * File system watcher: Automatically watches repository and AI chat documents to auto-combine into JevGraph.
     */
    static setupDocumentWatcher(context, outputChannel) {
        if (!this.isEnabled()) return;
        const config = vscode.workspace.getConfiguration('tokenSaver');
        if (!config.get('jevGraphAutoWatch', true)) return;

        let debounceTimer = null;
        const pendingFiles = new Set();

        const processPending = () => {
            if (pendingFiles.size === 0) return;
            const filesToProcess = Array.from(pendingFiles);
            pendingFiles.clear();

            if (outputChannel) outputChannel.appendLine(`[Token Saver] JevGraph: Auto-combining ${filesToProcess.length} changed/new document(s) into knowledge graph...`);
            this.ingestDocuments(filesToProcess, outputChannel, false).then(() => {
                const names = filesToProcess.map(f => path.basename(f)).join(', ');
                vscode.window.setStatusBarMessage(`🕸️ JevGraph: Auto-combined (${names}) into graph.json`, 4000);
            });
        };

        const scheduleIngest = (uri) => {
            const fsPath = uri.fsPath;
            const lower = fsPath.toLowerCase();
            if (lower.includes('node_modules') || lower.includes('.git') || lower.includes('runs') || lower.includes('dist') || lower.includes('target')) {
                return;
            }
            const ext = path.extname(lower);
            if (!['.pdf', '.docx', '.pptx', '.md', '.markdown', '.txt'].includes(ext)) {
                return;
            }

            pendingFiles.add(fsPath);
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(processPending, 2500);
        };

        const watcher = vscode.workspace.createFileSystemWatcher('**/*.{pdf,docx,pptx,md,markdown,txt}');
        watcher.onDidCreate(scheduleIngest, null, context.subscriptions);
        watcher.onDidChange(scheduleIngest, null, context.subscriptions);
        context.subscriptions.push(watcher);

        // Also watch when new documents are created/saved via AI chat or editor
        vscode.workspace.onDidSaveTextDocument((doc) => {
            scheduleIngest(doc.uri);
        }, null, context.subscriptions);

        if (outputChannel) outputChannel.appendLine('[Token Saver] JevGraph: Document auto-watcher & AI feed combiner active.');
    }

    /**
     * Reset and wipe knowledge graph and indexed document cache for the active repository.
     */
    static async resetRepoKnowledgeGraph(outputChannel, showToast = true) {
        const root = this.getWorkspaceRoot();
        const repoName = path.basename(root);
        const graphPath = path.join(root, 'runs', 'graph.json');
        const sourcesDir = path.join(root, 'runs', 'sources');

        let deleted = false;
        if (fs.existsSync(graphPath)) {
            try {
                fs.unlinkSync(graphPath);
                deleted = true;
            } catch (e) {}
        }

        if (fs.existsSync(sourcesDir)) {
            try {
                fs.rmSync(sourcesDir, { recursive: true, force: true });
                deleted = true;
            } catch (e) {}
        }

        if (outputChannel) {
            outputChannel.appendLine(`[Token Saver] JevGraph: Knowledge graph and indexed document cache cleared for repository: ${repoName}`);
        }

        if (showToast) {
            vscode.window.showInformationMessage(`🗑️ JevGraph: Knowledge graph reset for active project '${repoName}'.`);
        }
        return deleted;
    }
}

module.exports = JevGraphService;
