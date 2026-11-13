const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { createIsolatedEnv } = require('./helpers/isolated-env');

describe('07 · Webview State Pipeline, Message Handlers & Restore Points', () => {
    let env;

    beforeEach(() => {
        env = createIsolatedEnv();
    });

    afterEach(() => {
        if (env) env.cleanup();
    });

    it('WebviewHelper.getHtml() resolves URIs and CSP placeholders cleanly', () => {
        const WebviewHelper = require('../extension/webview-helper');
        const html = WebviewHelper.getHtml(env.context.extensionUri, {
            cspSource: 'vscode-webview:',
            asWebviewUri: (u) => u
        });
        assert.ok(!html.includes('{{styleUri}}'));
        assert.ok(!html.includes('{{scriptUri}}'));
        assert.ok(!html.includes('{{cspSource}}'));
        assert.ok(html.includes('dashboard.css'));
    });

    it('WebviewHelper.getLatestStateData() resolves all 8 upstream fields without ReferenceError', async () => {
        const WebviewHelper = require('../extension/webview-helper');
        const state = await WebviewHelper.getLatestStateData(env.context, false);

        assert.equal(state.extensionVersion, '1.15.1');
        assert.equal(state.detectedIde.id, 'antigravity');
        assert.equal(state.multiChannelBreakdown.channels.length, 8);
        assert.ok('rtkBridgeInstalled' in state);
        assert.ok('headroomInstalled' in state);
        assert.ok('ponytailInstalled' in state);
        assert.ok('antiSlopInstalled' in state);
        assert.ok('jevGraphInstalled' in state);
        assert.ok('codeGraphInstalled' in state);
        assert.ok('crwInstalled' in state);
        assert.ok('lightpandaInstalled' in state);
        assert.ok('eccInstalled' in state);
        assert.ok('omniRouteEnabled' in state);
    });

    it('WebviewHelper.handleMessage() handles setTokenPrice, setUpstreamInstallPath, and copyLightpandaMcpConfig', async () => {
        const WebviewHelper = require('../extension/webview-helper');
        const posted = [];
        const mockWebview = { postMessage: async (m) => posted.push(m) };

        await WebviewHelper.handleMessage({ command: 'setTokenPrice', price: '4.25' }, mockWebview, env.context, false);
        assert.equal(env.configStore.tokenPricePerMillion, 4.25);

        await WebviewHelper.handleMessage({ command: 'setUpstreamInstallPath', path: env.tempRoot }, mockWebview, env.context, false);
        assert.equal(env.configStore.upstreamInstallPath, env.tempRoot);
        assert.ok(posted.some((m) => m.type === 'toast'));

        await WebviewHelper.handleMessage({ command: 'copyLightpandaMcpConfig' }, mockWebview, env.context, false);
        assert.ok(env.clipboardHistory.some((c) => c.includes('lightpanda-http')));
    });

    it('RtkUpdater.createRestorePoint() & isNewer() persist restore points inside isolated tempWorkspace', () => {
        const RtkUpdater = require('../extension/rtk-updater');
        assert.equal(RtkUpdater.isNewer('v1.2.0', 'v1.1.9'), true);
        assert.equal(RtkUpdater.isNewer('v1.1.9', 'v1.2.0'), false);

        const rp = RtkUpdater.createRestorePoint('ponytail', { name: 'Ponytail Test', repo: 'DietrichGebert/ponytail' });
        assert.equal(rp.layerKey, 'ponytail');
        const loaded = RtkUpdater.getRestorePoints();
        assert.equal(loaded.length, 1);
        assert.equal(loaded[0].id, rp.id);
    });
});
