const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');

describe('01 · Manifest, Syntax & Webview UI Contracts', () => {
    it('all JavaScript files in extension/ pass node --check syntax verification', () => {
        const extDir = path.join(repoRoot, 'extension');
        const jsFiles = [];
        const walk = (dir) => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) walk(full);
                else if (entry.name.endsWith('.js')) jsFiles.push(full);
            }
        };
        walk(extDir);
        assert.ok(jsFiles.length >= 14, `Expected >= 14 JS files, found ${jsFiles.length}`);

        for (const file of jsFiles) {
            execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
        }
    });

    it('package.json contributes.commands matches every registerCommand in extension.js', () => {
        const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
        const contributedIds = new Set((pkg.contributes?.commands || []).map((c) => c.command));
        const extSrc = fs.readFileSync(path.join(repoRoot, 'extension', 'extension.js'), 'utf8');

        const registered = new Set();
        const regex = /registerCommand\(\s*['"]([^'"]+)['"]/g;
        let match;
        while ((match = regex.exec(extSrc)) !== null) {
            registered.add(match[1]);
        }

        assert.ok(registered.size > 40, `Expected > 40 registered commands, found ${registered.size}`);
        for (const cmd of contributedIds) {
            assert.ok(registered.has(cmd), `Contributed command ${cmd} missing registerCommand in extension.js`);
        }
    });

    it('webview HTML & CSS preserve all 8 upstream surfaces, footer version badge, omni dot, and popover stacking', () => {
        const html = fs.readFileSync(path.join(repoRoot, 'extension', 'webview', 'index.html'), 'utf8');
        const css = fs.readFileSync(path.join(repoRoot, 'extension', 'webview', 'dashboard.css'), 'utf8');

        // Required dashboard IDs across all 8 upstream surfaces
        const requiredIds = [
            'footerVersionBadge',
            'toggleModeBtn',
            'toggleRtkBtn',
            'toggleHeadroomBtn',
            'togglePonytailBtn',
            'toggleAntiSlopBtn',
            'toggleJevGraphBtn',
            'toggleCodeGraphBtn',
            'toggleHybridWebBtn',
            'toggleEccBtn',
            'setupBanner',
            'sectionRtk',
            'sectionOutputOpt',
            'sectionAntiSlop',
            'sectionJevGraph',
            'sectionCodeGraph',
            'sectionHybridWeb',
            'sectionEcc',
            'sectionSavings',
            'sectionActions',
            'sectionHealth',
            'quickOmniDot',
            'testLatencyBtn',
            'rtkRepairBridgeBtn',
            'checkUpdatesBtn',
            'uninstallUpstreamBtn',
            'diagVersionDropdown',
            'costPresetsPopover'
        ];
        for (const id of requiredIds) {
            assert.ok(html.includes(`id="${id}"`), `index.html missing required id="${id}"`);
        }

        // Rule 6 popover stacking invariant
        assert.match(css, /\.metric-card\.popover-active\s*\{[^}]*z-index:\s*1000/s);
        assert.match(css, /\.cost-presets-popover\.open,\s*\.cost-presets-popover\.show/s);
        assert.match(css, /\.omni-dot-inline/);
        // Unslop & Midnight Blue theme invariants
        assert.ok(!css.includes('initialIconPulse'), 'Unslopped CSS should not contain initialIconPulse');
        assert.ok(!css.includes('appleBeaconPulse'), 'Unslopped CSS should not contain appleBeaconPulse');
        assert.ok(css.includes('--accent-primary: #2b59d9'), 'Dark mode accent should be Midnight Blue');
        assert.ok(css.includes('--accent-primary: #1e3a8a'), 'Light mode accent should be Midnight Blue');
        assert.match(html, /id="wiseTipLink"[\s\S]*?<svg[\s\S]*?Tip via Wise/);
    });
});
