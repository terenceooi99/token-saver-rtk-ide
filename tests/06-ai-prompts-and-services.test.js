const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createIsolatedEnv } = require('./helpers/isolated-env');

describe('06 · AI Install Prompts & Upstream Engine Services', () => {
    let env;

    beforeEach(() => {
        env = createIsolatedEnv();
    });

    afterEach(() => {
        if (env) env.cleanup();
    });

    it('generateAiInstallPrompt() and generateSingleElementAiPrompt("rtk") enforce /pluginmanagement, /grill-me, and RTK-RG shims', () => {
        const RtkService = require('../extension/rtk-service');
        const customBase = path.join(env.tempRoot, 'ai-space');

        const fullPrompt = RtkService.generateAiInstallPrompt(
            true, false, true, true, true, false, true, true, true, true, true, customBase, true
        );
        assert.ok(fullPrompt.includes('/pluginmanagement'));
        assert.ok(fullPrompt.includes('/grill-me'));
        assert.ok(fullPrompt.includes('BurntSushi/ripgrep'));
        assert.ok(fullPrompt.includes('rtk-rg'));
        assert.ok(fullPrompt.includes(customBase));

        const singlePrompt = RtkService.generateSingleElementAiPrompt('rtk', true, false, customBase);
        assert.ok(singlePrompt.includes('RTK-RG'));
        assert.ok(singlePrompt.includes('BurntSushi.ripgrep.MSVC'));
        assert.ok(singlePrompt.includes('dir.cmd'));
    });

    it('OmniRouteService.getIdePresets() returns 5 IDE presets and getGatewayStatus() handles offline port safely', async () => {
        const OmniRouteService = require('../extension/omniroute-service');
        const presets = OmniRouteService.getIdePresets(20128);
        assert.deepEqual(Object.keys(presets).sort(), ['antigravity', 'claude', 'cline', 'cursor', 'vscode']);
        assert.ok(presets.antigravity.aiPrompt.includes('20128'));

        const status = await OmniRouteService.getGatewayStatus(59991);
        assert.equal(status.running, false);
        assert.equal(status.port, 59991);
    });

    it('EccService.saveSessionCheckpoint() writes checkpoint inside isolated tempWorkspace .agents/ck/', async () => {
        const { EccService } = require('../extension/ecc-service');
        const res = await EccService.saveSessionCheckpoint('Isolated test checkpoint');
        assert.equal(res.success, true);
        assert.ok(res.path.startsWith(env.tempWorkspace));
        assert.equal(fs.existsSync(res.path), true);
    });

    it('JevGraphService ingests markdown into isolated tempWorkspace runs/graph.json and resets cleanly', async () => {
        const JevGraphService = require('../extension/jevgraph-service');
        const docPath = path.join(env.tempWorkspace, 'SPEC.md');
        fs.writeFileSync(docPath, '# Architecture\nUses `TokenEngine` and `RtkProxy`.\n', 'utf8');

        await JevGraphService.ingestDocuments([docPath], null, false);
        const checkBefore = JevGraphService.hasRepoKnowledgeGraph(env.tempWorkspace);
        assert.equal(checkBefore.exists, true);
        assert.ok(checkBefore.entityCount >= 1);

        const deleted = await JevGraphService.resetRepoKnowledgeGraph(null, false);
        assert.equal(deleted, true);
        const checkAfter = JevGraphService.hasRepoKnowledgeGraph(env.tempWorkspace);
        assert.equal(checkAfter.exists, false);
    });

    it('CodeGraphService, CrwService, and LightpandaService return valid install commands & MCP snippets', () => {
        const { CodeGraphService } = require('../extension/codegraph-service');
        const { CrwService } = require('../extension/crw-service');
        const { LightpandaService } = require('../extension/lightpanda-service');

        const cgCmds = CodeGraphService.getInstallCommands(true);
        assert.ok(cgCmds.primaryCmd.includes('codegraphcontext'));

        const crwCmds = CrwService.getInstallCommands(true);
        assert.ok(crwCmds.primaryCmd.includes('fastcrw'));

        const lpSnippet = JSON.parse(LightpandaService.getMcpConfigSnippet(8123));
        assert.equal(lpSnippet.mcpServers['lightpanda-http'].url, 'http://127.0.0.1:8123/mcp');
    });
});
