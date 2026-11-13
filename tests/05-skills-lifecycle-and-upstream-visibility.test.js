const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createIsolatedEnv } = require('./helpers/isolated-env');

describe('05 · Skills Lifecycle, Quarantine & Upstream Visibility', () => {
    let env;

    beforeEach(() => {
        env = createIsolatedEnv();
    });

    afterEach(() => {
        if (env) env.cleanup();
    });

    it('installAllSkills() installs bundled skills into isolated tempHome without polluting workspace', () => {
        const SkillInstaller = require('../extension/skill-installer');
        const results = SkillInstaller.installAllSkills();

        assert.ok(results.length >= 1);
        const globalSkillsDir = SkillInstaller.getGlobalSkillsPath();
        assert.ok(globalSkillsDir.startsWith(env.tempHome), `Expected skills path inside tempHome, got ${globalSkillsDir}`);
        assert.equal(fs.existsSync(path.join(globalSkillsDir, 'rtk-gain', 'SKILL.md')), true);
        assert.equal(fs.existsSync(path.join(env.tempWorkspace, '.agents', 'skills')), false);

        const listed = SkillInstaller.listInstalledSkills('global');
        assert.ok(listed.some((s) => s.name === 'rtk-gain'));
    });

    it('disableSkills() and reEnableAllSkills() quarantine and restore skills inside isolated tempHome', () => {
        const SkillInstaller = require('../extension/skill-installer');
        SkillInstaller.installAllSkills();

        const disabledRes = SkillInstaller.disableSkills(['rtk-gain'], 'global');
        assert.ok(disabledRes.total.includes('rtk-gain'));

        const activeAfterDisable = SkillInstaller.listInstalledSkills('global').map((s) => s.name);
        assert.equal(activeAfterDisable.includes('rtk-gain'), false);

        const disabledList = SkillInstaller.listDisabledSkills('global').map((s) => s.name);
        assert.equal(disabledList.includes('rtk-gain'), true);

        const reEnabled = SkillInstaller.reEnableAllSkills('global');
        assert.ok(reEnabled.total.includes('rtk-gain'));
        const activeAfterRestore = SkillInstaller.listInstalledSkills('global').map((s) => s.name);
        assert.equal(activeAfterRestore.includes('rtk-gain'), true);
    });

    it('syncUpstreamSkillsVisibility() hides skills when an upstream is disabled and restores when enabled', () => {
        const SkillInstaller = require('../extension/skill-installer');
        SkillInstaller.installAllSkills();

        // Turn off JevGraph & OmniRoute
        env.configStore.jevGraphEnabled = false;
        env.configStore.omniRouteEnabled = false;
        SkillInstaller.syncUpstreamSkillsVisibility(true);

        const activeNames = SkillInstaller.listInstalledSkills('global').map((s) => s.name);
        assert.equal(activeNames.includes('jevgraph-build'), false);
        assert.equal(activeNames.includes('rtk-omniroute'), false);

        // Turn JevGraph & OmniRoute back on
        env.configStore.jevGraphEnabled = true;
        env.configStore.omniRouteEnabled = true;
        SkillInstaller.syncUpstreamSkillsVisibility(true);

        const restoredNames = SkillInstaller.listInstalledSkills('global').map((s) => s.name);
        assert.equal(restoredNames.includes('jevgraph-build'), true);
        assert.equal(restoredNames.includes('rtk-omniroute'), true);
    });
});
