const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createIsolatedEnv } = require('./helpers/isolated-env');

describe('02 · Startup Zero-Auto-Install & Activation Guardrails', () => {
    let env;

    beforeEach(() => {
        env = createIsolatedEnv({
            config: {
                autoInstallSkills: false,
                autoCleanWorkspaceSkills: false,
                checkForUpdatesOnStartup: false,
                weeklyAutoSync: false,
                omniRouteAutoStart: false
            }
        });
    });

    afterEach(() => {
        if (env) env.cleanup();
    });

    it('activate() does not auto-install skills, write rule files, or run terminal commands on startup', async () => {
        const ext = require('../extension/extension');
        await ext.activate(env.context);

        assert.equal(env.terminalsCreated.length, 0, 'No terminal should be opened during startup');
        assert.equal(env.terminalTexts.length, 0, 'No CLI install command should run on startup');

        // Verify tempHome and tempWorkspace remain clean (no auto-written rule/skill files)
        assert.equal(fs.existsSync(path.join(env.tempHome, '.gemini', 'config', 'rules')), false);
        assert.equal(fs.existsSync(path.join(env.tempHome, '.gemini', 'config', 'skills')), false);
        assert.equal(fs.existsSync(path.join(env.tempWorkspace, '.agents', 'skills')), false);
        assert.equal(fs.existsSync(path.join(env.tempWorkspace, 'AGENTS.md')), false);

        ext.deactivate();
    });

    it('activate() registers commands and populates context.subscriptions', async () => {
        const ext = require('../extension/extension');
        await ext.activate(env.context);

        assert.ok(env.registeredCommands.has('tokenSaver.openDashboard'));
        assert.ok(env.registeredCommands.has('tokenSaver.toggle'));
        assert.ok(env.registeredCommands.has('tokenSaver.repairRtkRgBridge'));
        assert.ok(env.registeredCommands.has('tokenSaver.toggleOmniRoute'));
        assert.ok(env.registeredCommands.has('tokenSaver.copyAiInstallPrompt'));
        assert.ok(env.context.subscriptions.length >= 60, 'All commands and disposables pushed to subscriptions');

        ext.deactivate();
    });

    it('StatusBarManager formats clean Active and Paused text/tooltips without emoji clutter', () => {
        const StatusBarManager = require('../extension/statusbar');
        const sb = new StatusBarManager();

        sb.update(true, '0.1.0', {
            totalSavedTokens: 12500,
            totalSavedFormatted: '12.5K',
            savedPercentage: 74,
            estimatedDollarSavings: '$0.04'
        });
        assert.equal(sb.statusBarItem.shown, true);
        assert.ok(sb.statusBarItem.text.includes('12.5K (74%)'));
        assert.ok(sb.statusBarItem.tooltip.value.includes('Token Saver — Active'));
        assert.equal(sb.statusBarItem.command, 'tokenSaver.disable');

        sb.update(false, null, null);
        assert.ok(sb.statusBarItem.text.includes('Paused'));
        assert.ok(sb.statusBarItem.tooltip.value.includes('Token Saver — Paused'));
        assert.equal(sb.statusBarItem.command, 'tokenSaver.enable');
        sb.dispose();
    });
});
