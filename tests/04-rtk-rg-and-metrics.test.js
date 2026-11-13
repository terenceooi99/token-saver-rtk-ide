const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createIsolatedEnv } = require('./helpers/isolated-env');

describe('04 · RTK-RG Bridge Shims, Metrics, Outline & Zero-Noise Latency', () => {
    let env;

    beforeEach(() => {
        env = createIsolatedEnv();
    });

    afterEach(() => {
        if (env) env.cleanup();
    });

    it('installRtkRgBridge() creates Windows/POSIX shims in isolated temp ~/.local/bin and checkBridgeStatus() verifies them', async () => {
        const RtkService = require('../extension/rtk-service');
        const res = await RtkService.installRtkRgBridge();

        const expectedLocalBin = path.join(env.tempHome, '.local', 'bin');
        assert.equal(res.localBin, expectedLocalBin);
        assert.ok(res.createdFiles.length >= 4);

        const expectedShim = process.platform === 'win32' ? 'rtk-rg.cmd' : 'rtk-rg';
        assert.equal(fs.existsSync(path.join(expectedLocalBin, expectedShim)), true);

        const status = RtkService.checkBridgeStatus();
        assert.equal(status.hasShims, true);
        assert.equal(status.installed, true);
        assert.equal(status.bridgeDir, expectedLocalBin);
    });

    it('parseMetricsFromText() & getMultiChannelMetrics() compute savings, dollar estimates, and Graphite/Amber channels', () => {
        const RtkService = require('../extension/rtk-service');
        const sampleGain = [
            'Total commands: 42',
            'Input tokens: 100.0K',
            'Output tokens: 25.0K',
            'Tokens saved: 75.0K (75.0%)',
            'git   20   40.0K   80.0%',
            'rg    12   25.0K   72.0%'
        ].join('\n');

        const parsed = RtkService.parseMetricsFromText(sampleGain, '', 3.0, false);
        assert.equal(parsed.isMock, false);
        assert.equal(parsed.totalSavedTokens, 75000);
        assert.equal(parsed.savedPercentage, 75);
        assert.equal(parsed.estimatedDollarSavings, '$0.225');
        assert.ok(parsed.commandBreakdown.length >= 2);

        const breakdown = RtkService.getMultiChannelMetrics(parsed, {
            installed: true,
            headroomEnabled: true,
            jevGraphEnabled: true,
            codeGraphEnabled: true,
            crwEnabled: true,
            eccEnabled: true
        }, 3.0);

        assert.equal(breakdown.channels.length, 8);
        assert.equal(breakdown.channels[0].id, 'rtk');
        assert.equal(breakdown.channels[0].shortName, 'RTK-RG');
        assert.equal(breakdown.channels[0].color, '#3b6ef6');
        assert.equal(breakdown.channels[0].icon, 'RTK');
    });

    it('generateFileOutline() extracts symbols from a temporary isolated JS file', () => {
        const RtkService = require('../extension/rtk-service');
        const sampleFile = path.join(env.tempWorkspace, 'sample.js');
        fs.writeFileSync(sampleFile, [
            'class TokenEngine {',
            '    compress(input) { return input; }',
            '}',
            'function runAudit(flag) { return !!flag; }'
        ].join('\n'), 'utf8');

        const outline = RtkService.generateFileOutline(sampleFile);
        assert.ok(outline.includes('TokenEngine'));
        assert.ok(outline.includes('compress'));
        assert.ok(outline.includes('runAudit'));
    });

    it('testLatency() omits uninstalled upstreams from summary and details', async () => {
        const RtkService = require('../extension/rtk-service');
        const latency = await RtkService.testLatency();

        assert.equal(typeof latency.available, 'boolean');
        assert.equal(typeof latency.summary, 'string');
        assert.equal(typeof latency.details, 'string');
        const layerObjects = [
            latency.rtk,
            latency.headroom,
            latency.ponytail,
            latency.antislop,
            latency.jevgraph,
            latency.codegraph,
            latency.crw,
            latency.lightpanda,
            latency.ecc
        ];
        for (const layer of layerObjects) {
            if (layer && !layer.available) {
                assert.equal(latency.summary.includes(layer.name), false, `Uninstalled ${layer.name} leaked into summary`);
            }
        }
    });
});
