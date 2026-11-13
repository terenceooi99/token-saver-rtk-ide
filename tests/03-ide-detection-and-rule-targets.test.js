const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createIsolatedEnv } = require('./helpers/isolated-env');

describe('03 · IDE Detection & Active-Agent-Only Rule Target Syncing', () => {
    let env;

    afterEach(() => {
        if (env) {
            env.cleanup();
            env = null;
        }
    });

    it('detectCurrentIde() identifies Antigravity, Cursor, Windsurf, Claude Code, and VS Code accurately', () => {
        const cases = [
            { appName: 'Antigravity', uriScheme: 'antigravity', appRoot: '/Applications/Antigravity', expected: 'antigravity' },
            { appName: 'Cursor', uriScheme: 'cursor', appRoot: '/Applications/Cursor', expected: 'cursor' },
            { appName: 'Windsurf', uriScheme: 'windsurf', appRoot: '/Applications/Windsurf', expected: 'windsurf' },
            { appName: 'Claude Code', uriScheme: 'claude', appRoot: '/Applications/Claude', expected: 'claude' },
            { appName: 'Visual Studio Code', uriScheme: 'vscode', appRoot: 'C:\\Program Files\\Microsoft VS Code', alias: 'agy', expected: 'vscode' }
        ];

        for (const c of cases) {
            env = createIsolatedEnv({
                appName: c.appName,
                uriScheme: c.uriScheme,
                appRoot: c.appRoot,
                antigravityCliAlias: c.alias
            });
            const SkillInstaller = require('../extension/skill-installer');
            const detected = SkillInstaller.detectCurrentIde();
            assert.equal(detected.id, c.expected, `Failed for appName=${c.appName}`);
            env.cleanup();
            env = null;
        }
    });

    it('syncRules(true, "current") writes ONLY the active IDE rule target(s) in isolated temp dirs', () => {
        env = createIsolatedEnv({ appName: 'Cursor', uriScheme: 'cursor', appRoot: '/Applications/Cursor' });
        const SkillInstaller = require('../extension/skill-installer');

        const results = SkillInstaller.syncRules(true, 'current');
        assert.ok(results.length > 0);
        assert.ok(results.every((r) => r.target === 'cursor' || r.target === 'cursor_antislop'));

        // Cursor files exist inside isolated tempWorkspace
        assert.equal(fs.existsSync(path.join(env.tempWorkspace, '.cursor', 'rules', 'rtk.mdc')), true);
        assert.equal(fs.existsSync(path.join(env.tempWorkspace, '.cursorrules')), true);
        // Other IDEs' files were NOT created
        assert.equal(fs.existsSync(path.join(env.tempHome, '.gemini', 'config', 'rules', 'rtk-token-saver.md')), false);
        assert.equal(fs.existsSync(path.join(env.tempWorkspace, 'CLAUDE.md')), false);
        assert.equal(fs.existsSync(path.join(env.tempWorkspace, '.windsurfrules')), false);
    });

    it('syncSingleTarget skips non-active IDE targets with a warning', async () => {
        env = createIsolatedEnv({ appName: 'Antigravity', uriScheme: 'antigravity', appRoot: '/Applications/Antigravity' });
        const WebviewHelper = require('../extension/webview-helper');

        await WebviewHelper.handleMessage(
            { command: 'syncSingleTarget', targetId: 'cursor' },
            { postMessage: async () => {} },
            env.context,
            false
        );

        assert.equal(env.messages.warning.length, 1);
        assert.ok(env.messages.warning[0].msg.includes('Skipped target "cursor"'));
        assert.equal(fs.existsSync(path.join(env.tempWorkspace, '.cursor', 'rules', 'token-saver.mdc')), false);
    });

    it('getCombinedRuleText() omits disabled upstream sections when toggled off', () => {
        env = createIsolatedEnv({
            config: {
                headroomEnabled: false,
                jevGraphEnabled: false,
                codeGraphEnabled: false,
                crwEnabled: false,
                lightpandaEnabled: false,
                hybridWebEnabled: false,
                antiSlopEnabled: false,
                ponytailMode: 'off',
                eccEnabled: false
            }
        });
        const SkillInstaller = require('../extension/skill-installer');
        const ruleText = SkillInstaller.getCombinedRuleText();

        assert.ok(ruleText.includes('RTK-RG (Rust Token Killer + ripgrep Bridge)'));
        assert.ok(!ruleText.includes('Headroom Context Compression'));
        assert.ok(!ruleText.includes('Non-Code Files -> JevGraph'));
        assert.ok(!ruleText.includes('Code-Based Files -> CodeGraphContext'));
        assert.ok(!ruleText.includes('Anti-Slop Filter'));
        assert.ok(!ruleText.includes('Ponytail Mode'));
    });
});
