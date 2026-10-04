// Acquire VS Code API
const vscode = acquireVsCodeApi();

// DOM Elements
const dashboardContainer = document.getElementById('dashboardContainer');
const statusPill = document.getElementById('statusPill');
const statusText = document.getElementById('statusText');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const toggleHeadroomBtn = document.getElementById('toggleHeadroomBtn');
const toggleOmniRouteBtn = document.getElementById('toggleOmniRouteBtn');
const popOutBtn = document.getElementById('popOutBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');

const refreshBtn = document.getElementById('refreshBtn');
const refreshIcon = document.getElementById('refreshIcon');
const refreshMenuBtn = document.getElementById('refreshMenuBtn');
const refreshDropdownMenu = document.getElementById('refreshDropdownMenu');
const refreshTimerBadge = document.getElementById('refreshTimerBadge');
const customMinuteInput = document.getElementById('customMinuteInput');
const applyMinuteBtn = document.getElementById('applyMinuteBtn');

const totalSavedVal = document.getElementById('totalSavedVal');
const savedRatioVal = document.getElementById('savedRatioVal');
const efficiencyVal = document.getElementById('efficiencyVal');
const efficiencyBar = document.getElementById('efficiencyBar');
const costSavedVal = document.getElementById('costSavedVal');
const costPriceInput = document.getElementById('costPriceInput');
const saveCostBtn = document.getElementById('saveCostBtn');
const costPresetToggleBtn = document.getElementById('costPresetToggleBtn');
const costPresetsPopover = document.getElementById('costPresetsPopover');
const activeTargetsVal = document.getElementById('activeTargetsVal');
const skillsScopeVal = document.getElementById('skillsScopeVal');

const syncAllIdesBtn = document.getElementById('syncAllIdesBtn');
const ideGridContainer = document.getElementById('ideGridContainer');
const ideSyncTitle = document.getElementById('ideSyncTitle');
const ideSyncSubtitle = document.getElementById('ideSyncSubtitle');

const chartContainer = document.getElementById('chartContainer');
const rawOutputText = document.getElementById('rawOutputText');

const syncSkillsBtn = document.getElementById('syncSkillsBtn');
const skillsStatusBadge = document.getElementById('skillsStatusBadge');
const skillsSubText = document.getElementById('skillsSubText');

const checkUpdatesBtn = document.getElementById('checkUpdatesBtn');
const checkUpdatesLabel = document.getElementById('checkUpdatesLabel');
const checkUpdatesSub = document.getElementById('checkUpdatesSub');
const checkUpdatesBadge = document.getElementById('checkUpdatesBadge');
const weeklySyncCheckbox = document.getElementById('weeklySyncCheckbox');
const weeklySyncWrapper = document.getElementById('weeklySyncWrapper');

const openTerminalBtn = document.getElementById('openTerminalBtn');
const testLatencyBtn = document.getElementById('testLatencyBtn');
const latencySubText = document.getElementById('latencySubText');

const ponytailActiveBadge = document.getElementById('ponytailActiveBadge');
const ponytailSegmentGroup = document.getElementById('ponytailSegmentGroup');
const terseAgentCheckbox = document.getElementById('terseAgentCheckbox');
const headroomCheckbox = document.getElementById('headroomCheckbox');
const astOutlineCheckbox = document.getElementById('astOutlineCheckbox');
const compactDiffCheckbox = document.getElementById('compactDiffCheckbox');

const diagCliStatus = document.getElementById('diagCliStatus');
const diagHeadroomStatus = document.getElementById('diagHeadroomStatus');
const diagPonytailStatus = document.getElementById('diagPonytailStatus');
const diagVersion = document.getElementById('diagVersion');
const diagBinaryPath = document.getElementById('diagBinaryPath');
const diagScope = document.getElementById('diagScope');
const diagActiveTargets = document.getElementById('diagActiveTargets');

const syncPonytailBtn = document.getElementById('syncPonytailBtn');
const syncPonytailLabel = document.getElementById('syncPonytailLabel');
const syncPonytailSub = document.getElementById('syncPonytailSub');
const ponytailActionBadge = document.getElementById('ponytailActionBadge');
const ponytailInlineSyncBtn = document.getElementById('ponytailInlineSyncBtn');

const ponytailDiagActions = document.getElementById('ponytailDiagActions');
const ponytailDiagAiBtn = document.getElementById('ponytailDiagAiBtn');
const ponytailDiagSyncBtn = document.getElementById('ponytailDiagSyncBtn');

// Setup Hub Elements
const setupBanner = document.getElementById('setupBanner');
const setupBannerDesc = document.getElementById('setupBannerDesc');
const setupMissingTags = document.getElementById('setupMissingTags');
const setupAskAiBtn = document.getElementById('setupAskAiBtn');
const setupTerminalBtn = document.getElementById('setupTerminalBtn');
const setupCopyCmdBtn = document.getElementById('setupCopyCmdBtn');

const rtkDiagActions = document.getElementById('rtkDiagActions');
const rtkDiagAiBtn = document.getElementById('rtkDiagAiBtn');
const rtkDiagRunBtn = document.getElementById('rtkDiagRunBtn');

const headroomDiagActions = document.getElementById('headroomDiagActions');
const headroomDiagAiBtn = document.getElementById('headroomDiagAiBtn');
const headroomDiagRunBtn = document.getElementById('headroomDiagRunBtn');

// OmniRoute Elements
const sectionOmniRoute = document.getElementById('sectionOmniRoute');
const omniStatusBadge = document.getElementById('omniStatusBadge');
const omniLiveDot = document.getElementById('omniLiveDot');
const omniStatusMain = document.getElementById('omniStatusMain');
const omniStatusSub = document.getElementById('omniStatusSub');
const omniStartBtn = document.getElementById('omniStartBtn');
const omniStopBtn = document.getElementById('omniStopBtn');
const omniOpenUiBtn = document.getElementById('omniOpenUiBtn');
const omniDoctorBtn = document.getElementById('omniDoctorBtn');
const omniStepOpenUiBtn = document.getElementById('omniStepOpenUiBtn');
const omniCopyLaunchCmdBtn = document.getElementById('omniCopyLaunchCmdBtn');
const omniPresetTabs = document.getElementById('omniPresetTabs');
const omniPresetTitle = document.getElementById('omniPresetTitle');
const omniPresetStepsList = document.getElementById('omniPresetStepsList');
const omniPresetCodePreview = document.getElementById('omniPresetCodePreview');
const omniCopyPresetBtn = document.getElementById('omniCopyPresetBtn');

const quickOmniBtn = document.getElementById('quickOmniBtn');
const quickOmniLabel = document.getElementById('quickOmniLabel');
const quickOmniSub = document.getElementById('quickOmniSub');
const quickOmniBadge = document.getElementById('quickOmniBadge');

const diagOmniStatus = document.getElementById('diagOmniStatus');
const omniDiagActions = document.getElementById('omniDiagActions');
const omniDiagStartBtn = document.getElementById('omniDiagStartBtn');
const omniDiagUninstallBtn = document.getElementById('omniDiagUninstallBtn');

const omniEnabledCheckbox = document.getElementById('omniEnabledCheckbox');
const uninstallUpstreamBtn = document.getElementById('uninstallUpstreamBtn');
const headerUninstallBtn = document.getElementById('headerUninstallBtn');
const rtkDiagUninstallBtn = document.getElementById('rtkDiagUninstallBtn');
const headroomDiagUninstallBtn = document.getElementById('headroomDiagUninstallBtn');
const ponytailDiagUninstallBtn = document.getElementById('ponytailDiagUninstallBtn');

let currentOmniPresets = null;
let activeOmniIde = 'cursor';

function renderOmniPreset(ideKey) {
    if (!currentOmniPresets || !currentOmniPresets[ideKey]) return;
    activeOmniIde = ideKey;
    const preset = currentOmniPresets[ideKey];

    if (omniPresetTabs) {
        omniPresetTabs.querySelectorAll('.preset-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.ide === ideKey);
        });
    }

    if (omniPresetTitle) {
        omniPresetTitle.textContent = preset.title || `${preset.name} Configuration`;
    }

    if (omniPresetStepsList) {
        omniPresetStepsList.innerHTML = '';
        if (Array.isArray(preset.steps)) {
            preset.steps.forEach(step => {
                const li = document.createElement('li');
                li.innerHTML = step.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                omniPresetStepsList.appendChild(li);
            });
        }
    }

    if (omniPresetCodePreview) {
        omniPresetCodePreview.textContent = preset.configJson || preset.quickSnippet;
    }
}

const IDE_ICONS = {
    antigravity_global: '🌌',
    antigravity_workspace: '🌌',
    copilot: '🤖',
    cursor: '🎯',
    windsurf: '🏄',
    cline: '💻',
    claude: '🧠',
    agents: '🌐'
};

// State variables
let isSidebarMode = false;
let isCompact = false;
let autoRefreshMinutes = 0; // in minutes, 0 = off
let autoRefreshTimer = null;
let currentTokenPrice = 3.00;
let currentTotalSavedTokens = 0;

function formatCostValue(cost) {
    if (cost >= 100) {
        return `$${cost.toFixed(2)}`;
    } else if (cost >= 1) {
        return `$${cost.toFixed(2)}`;
    } else if (cost > 0) {
        return `$${cost.toFixed(3)}`;
    }
    return '$0.00';
}

function updateLocalCostSavings(price) {
    if (costSavedVal) {
        const dollars = (currentTotalSavedTokens / 1000000) * price;
        costSavedVal.textContent = formatCostValue(dollars);
    }
}

function applyCostPrice(price, notifyBackend = true) {
    if (isNaN(price) || price < 0) {
        price = 3.00;
    }
    const roundedPrice = Math.round(price * 1000) / 1000;
    currentTokenPrice = roundedPrice;

    if (costPriceInput) {
        costPriceInput.value = roundedPrice;
    }
    if (saveCostBtn) {
        saveCostBtn.classList.remove('visible');
    }

    if (costPresetsPopover) {
        const presetItems = costPresetsPopover.querySelectorAll('.preset-item');
        presetItems.forEach(item => {
            const itemPrice = parseFloat(item.getAttribute('data-price'));
            if (Math.abs(itemPrice - roundedPrice) < 0.001) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    updateLocalCostSavings(roundedPrice);

    if (notifyBackend) {
        vscode.postMessage({
            command: 'setTokenPrice',
            price: roundedPrice
        });
    }
}

// Restore saved state
const savedState = vscode.getState() || {};
if (savedState.isCompact) {
    isCompact = true;
    dashboardContainer.classList.add('is-compact');
}
if (savedState.collapsedSections && Array.isArray(savedState.collapsedSections)) {
    savedState.collapsedSections.forEach(sectionId => {
        const sec = document.getElementById(sectionId);
        if (sec) sec.classList.add('collapsed');
    });
}
if (typeof savedState.autoRefreshMinutes === 'number') {
    setAutoRefresh(savedState.autoRefreshMinutes, false);
} else if (typeof savedState.autoRefreshInterval === 'number') {
    setAutoRefresh(savedState.autoRefreshInterval / 60, false);
}

function persistState() {
    const collapsed = [];
    document.querySelectorAll('.panel-card.collapsed').forEach(card => {
        if (card.id) collapsed.push(card.id);
    });
    vscode.setState({
        isCompact,
        collapsedSections: collapsed,
        autoRefreshMinutes
    });
}

// Auto-Refresh Logic (in Minutes)
function formatIntervalBadge(minutes) {
    if (minutes >= 60) {
        const hours = minutes / 60;
        return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
    }
    if (minutes < 1) {
        return `${Math.round(minutes * 60)}s`;
    }
    return `${minutes}m`;
}

function setAutoRefresh(minutes, shouldPersist = true) {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }

    autoRefreshMinutes = minutes;

    // Update custom minute input field
    if (customMinuteInput) {
        customMinuteInput.value = minutes > 0 ? minutes : '';
    }

    // Update Dropdown Preset Items UI
    const items = refreshDropdownMenu.querySelectorAll('.dropdown-menu-item');
    items.forEach(item => {
        const itemMinutes = parseFloat(item.getAttribute('data-minutes'));
        const check = item.querySelector('.menu-item-check');
        if (itemMinutes === minutes) {
            item.classList.add('active');
            if (check) check.textContent = '✓';
        } else {
            item.classList.remove('active');
            if (check) check.textContent = '';
        }
    });

    if (minutes > 0) {
        refreshTimerBadge.textContent = formatIntervalBadge(minutes);
        refreshTimerBadge.style.display = 'inline-block';
        refreshBtn.title = `Auto-refreshing every ${formatIntervalBadge(minutes)} (Click to refresh now)`;

        autoRefreshTimer = setInterval(() => {
            triggerRefresh(true);
        }, minutes * 60 * 1000);
    } else {
        refreshTimerBadge.style.display = 'none';
        refreshBtn.title = 'Click to Refresh Metrics';
    }

    if (shouldPersist) {
        persistState();
    }
}

function applyCustomMinutes() {
    if (!customMinuteInput) return;
    const rawVal = customMinuteInput.value.trim();
    if (rawVal === '' || rawVal === '0') {
        setAutoRefresh(0, true);
        refreshDropdownMenu.classList.remove('show');
        return;
    }
    const val = parseFloat(rawVal);
    if (!isNaN(val) && val > 0) {
        setAutoRefresh(val, true);
        refreshDropdownMenu.classList.remove('show');
    }
}

function triggerRefresh(isAutomatic = false) {
    if (refreshIcon) {
        refreshIcon.classList.add('spinning');
        setTimeout(() => {
            refreshIcon.classList.remove('spinning');
        }, 600);
    }
    vscode.postMessage({ command: 'refresh', isAutomatic });
}

// Refresh Dropdown Event Listeners
refreshBtn.addEventListener('click', () => {
    triggerRefresh(false);
});

refreshMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    refreshDropdownMenu.classList.toggle('show');
    if (refreshDropdownMenu.classList.contains('show') && customMinuteInput) {
        customMinuteInput.focus();
    }
});

if (applyMinuteBtn) {
    applyMinuteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        applyCustomMinutes();
    });
}

if (customMinuteInput) {
    customMinuteInput.addEventListener('click', (e) => e.stopPropagation());
    customMinuteInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
            applyCustomMinutes();
        }
    });
}

// Dropdown item selection
refreshDropdownMenu.querySelectorAll('.dropdown-menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const minutes = parseFloat(item.getAttribute('data-minutes'));
        setAutoRefresh(minutes, true);
        refreshDropdownMenu.classList.remove('show');
    });
});

// Cost Price Input & Presets Event Listeners
if (costPriceInput) {
    costPriceInput.addEventListener('click', (e) => e.stopPropagation());
    costPriceInput.addEventListener('input', () => {
        const val = parseFloat(costPriceInput.value);
        if (!isNaN(val) && val >= 0) {
            updateLocalCostSavings(val);
            if (Math.abs(val - currentTokenPrice) > 0.001) {
                if (saveCostBtn) saveCostBtn.classList.add('visible');
            } else {
                if (saveCostBtn) saveCostBtn.classList.remove('visible');
            }
        }
    });

    costPriceInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
            const val = parseFloat(costPriceInput.value);
            if (!isNaN(val) && val >= 0) {
                applyCostPrice(val, true);
                costPriceInput.blur();
            }
        }
    });

    costPriceInput.addEventListener('blur', () => {
        const val = parseFloat(costPriceInput.value);
        if (!isNaN(val) && val >= 0) {
            if (Math.abs(val - currentTokenPrice) > 0.001) {
                applyCostPrice(val, true);
            } else {
                if (saveCostBtn) saveCostBtn.classList.remove('visible');
            }
        } else {
            costPriceInput.value = currentTokenPrice;
            if (saveCostBtn) saveCostBtn.classList.remove('visible');
        }
    });
}

if (saveCostBtn) {
    saveCostBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = parseFloat(costPriceInput ? costPriceInput.value : currentTokenPrice);
        if (!isNaN(val) && val >= 0) {
            applyCostPrice(val, true);
        }
    });
}

if (costPresetToggleBtn && costPresetsPopover) {
    costPresetToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShowing = costPresetsPopover.classList.toggle('show');
        costPresetToggleBtn.classList.toggle('active', isShowing);
        const card = costPresetToggleBtn.closest('.metric-card');
        if (card) {
            card.classList.toggle('popover-active', isShowing);
        }
    });

    costPresetsPopover.querySelectorAll('.preset-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const price = parseFloat(item.getAttribute('data-price'));
            if (!isNaN(price)) {
                applyCostPrice(price, true);
            }
            costPresetsPopover.classList.remove('show');
            costPresetToggleBtn.classList.remove('active');
            const card = costPresetToggleBtn.closest('.metric-card');
            if (card) {
                card.classList.remove('popover-active');
            }
        });
    });
}

// Close dropdowns and popovers on outside click or Escape
window.addEventListener('click', (e) => {
    if (!refreshDropdownMenu.contains(e.target) && !refreshMenuBtn.contains(e.target)) {
        refreshDropdownMenu.classList.remove('show');
    }
    if (costPresetsPopover && costPresetToggleBtn && !costPresetsPopover.contains(e.target) && !costPresetToggleBtn.contains(e.target)) {
        costPresetsPopover.classList.remove('show');
        costPresetToggleBtn.classList.remove('active');
        const card = costPresetToggleBtn.closest('.metric-card');
        if (card) {
            card.classList.remove('popover-active');
        }
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        refreshDropdownMenu.classList.remove('show');
        if (costPresetsPopover && costPresetToggleBtn) {
            costPresetsPopover.classList.remove('show');
            costPresetToggleBtn.classList.remove('active');
            const card = costPresetToggleBtn.closest('.metric-card');
            if (card) {
                card.classList.remove('popover-active');
            }
        }
    }
// Theme Management (Default: Dark Mode)
let currentTheme = 'dark';
try {
    const savedTheme = localStorage.getItem('tokenSaverTheme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
        currentTheme = savedTheme;
    }
} catch (_) {}

function applyTheme(theme) {
    currentTheme = theme;
    if (theme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        document.body.classList.add('light-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeToggleBtn) {
            themeToggleBtn.title = 'Switch to Dark Mode';
            themeToggleBtn.classList.add('active');
        }
    } else {
        document.body.setAttribute('data-theme', 'dark');
        document.body.classList.remove('light-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeToggleBtn) {
            themeToggleBtn.title = 'Switch to Light Mode';
            themeToggleBtn.classList.remove('active');
        }
    }
    try {
        localStorage.setItem('tokenSaverTheme', theme);
    } catch (_) {}
}

// Initialize Theme
applyTheme(currentTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

// Minimize & Pop Out Event Listeners
if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
        if (!isSidebarMode) {
            // In editor panel: minimize/dock back to sidebar
            vscode.postMessage({ command: 'minimize' });
        } else {
            // In sidebar: toggle compact mode
            isCompact = !isCompact;
            dashboardContainer.classList.toggle('is-compact', isCompact);
            minimizeBtn.classList.toggle('active', isCompact);
            minimizeBtn.title = isCompact ? "Expand Full View" : "Minimize / Compact View";
            minimizeBtn.innerHTML = isCompact ? "🗖" : "🗕";
            persistState();
        }
    });
}

if (popOutBtn) {
    popOutBtn.addEventListener('click', () => {
        if (!isSidebarMode) {
            // In editor panel: dock to sidebar
            vscode.postMessage({ command: 'minimize' });
        } else {
            // In sidebar: pop out to editor tab
            vscode.postMessage({ command: 'popOut' });
        }
    });
}

// Collapsible Panels Event Listeners
document.querySelectorAll('.panel-header.collapsible').forEach(header => {
    header.addEventListener('click', (e) => {
        // Prevent collapsing if clicking a button inside header (e.g. syncAllIdesBtn)
        if (e.target.closest('button')) {
            return;
        }
        const parentCard = header.closest('.panel-card');
        if (parentCard) {
            parentCard.classList.toggle('collapsed');
            persistState();
        }
    });
});

// General Action Event Listeners
toggleModeBtn.addEventListener('click', () => {
    vscode.postMessage({ command: 'toggleMode' });
});

if (toggleHeadroomBtn) {
    toggleHeadroomBtn.addEventListener('click', () => {
        const current = headroomCheckbox ? headroomCheckbox.checked : true;
        vscode.postMessage({ command: 'toggleHeadroom', enabled: !current });
    });
}

if (toggleOmniRouteBtn) {
    toggleOmniRouteBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'toggleOmniRoute' });
    });
}

syncAllIdesBtn.addEventListener('click', () => {
    syncAllIdesBtn.textContent = 'Syncing...';
    vscode.postMessage({ command: 'syncAllIdeRules' });
    setTimeout(() => {
        syncAllIdesBtn.textContent = '⚡ Sync All';
    }, 800);
});

syncSkillsBtn.addEventListener('click', () => {
    vscode.postMessage({ command: 'installSkills' });
});

if (checkUpdatesBtn) {
    checkUpdatesBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'openSyncPicker' });
    });
}

if (weeklySyncCheckbox) {
    weeklySyncCheckbox.addEventListener('change', (e) => {
        vscode.postMessage({
            command: 'toggleWeeklyAutoSync',
            enabled: e.target.checked
        });
    });
}

openTerminalBtn.addEventListener('click', () => {
    vscode.postMessage({ command: 'openScoreboardTerminal' });
});

if (testLatencyBtn) {
    testLatencyBtn.addEventListener('click', () => {
        if (latencySubText) {
            latencySubText.textContent = 'Pinging all upstream layers...';
        }
        vscode.postMessage({ command: 'testLatency' });
    });
}

if (ponytailSegmentGroup) {
    const btns = ponytailSegmentGroup.querySelectorAll('.segment-btn');
    btns.forEach(b => {
        b.addEventListener('click', () => {
            const mode = b.dataset.mode;
            vscode.postMessage({ command: 'setPonytailMode', mode });
        });
    });
}

if (terseAgentCheckbox) {
    terseAgentCheckbox.addEventListener('change', () => {
        vscode.postMessage({ command: 'toggleTerseMode', enabled: terseAgentCheckbox.checked });
    });
}

if (headroomCheckbox) {
    headroomCheckbox.addEventListener('change', () => {
        vscode.postMessage({ command: 'toggleHeadroom', enabled: headroomCheckbox.checked });
    });
}

if (astOutlineCheckbox) {
    astOutlineCheckbox.addEventListener('change', () => {
        vscode.postMessage({ command: 'toggleAstOutline', enabled: astOutlineCheckbox.checked });
    });
}

if (compactDiffCheckbox) {
    compactDiffCheckbox.addEventListener('change', () => {
        vscode.postMessage({ command: 'toggleCompactDiff', enabled: compactDiffCheckbox.checked });
    });
}

// Setup Hub Listeners
if (setupAskAiBtn) {
    setupAskAiBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'copyAiInstallPrompt' });
        const textSpan = setupAskAiBtn.querySelector('.btn-text');
        if (textSpan) {
            const original = textSpan.innerHTML;
            textSpan.innerHTML = '✓ Prompt Copied! <span class="btn-sub-tag">Paste in Chat</span>';
            setTimeout(() => {
                textSpan.innerHTML = original;
            }, 3000);
        }
    });
}

if (setupTerminalBtn) {
    setupTerminalBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'installCli' });
    });
}

if (setupCopyCmdBtn) {
    setupCopyCmdBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'copyInstallCommands' });
        const textSpan = setupCopyCmdBtn.querySelector('.btn-text');
        if (textSpan) {
            const original = textSpan.textContent;
            textSpan.textContent = '✓ Copied!';
            setTimeout(() => {
                textSpan.textContent = original;
            }, 2500);
        }
    });
}

if (rtkDiagAiBtn) {
    rtkDiagAiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'copyAiInstallPrompt' });
        rtkDiagAiBtn.textContent = '✓ Copied';
        setTimeout(() => { rtkDiagAiBtn.textContent = '🤖 Ask AI'; }, 2500);
    });
}

if (rtkDiagRunBtn) {
    rtkDiagRunBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'installCli' });
    });
}

if (headroomDiagAiBtn) {
    headroomDiagAiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'copyAiInstallPrompt' });
        headroomDiagAiBtn.textContent = '✓ Copied';
        setTimeout(() => { headroomDiagAiBtn.textContent = '🤖 Ask AI'; }, 2500);
    });
}

if (headroomDiagRunBtn) {
    headroomDiagRunBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'installCli' });
    });
}

if (syncPonytailBtn) {
    syncPonytailBtn.addEventListener('click', () => {
        if (syncPonytailSub) syncPonytailSub.textContent = 'Fetching from GitHub...';
        vscode.postMessage({ command: 'syncPonytail' });
    });
}

if (ponytailInlineSyncBtn) {
    ponytailInlineSyncBtn.addEventListener('click', (e) => {
        e.preventDefault();
        ponytailInlineSyncBtn.textContent = '🔄 Syncing...';
        vscode.postMessage({ command: 'syncPonytail' });
        setTimeout(() => { ponytailInlineSyncBtn.textContent = '🔄 Sync from GitHub'; }, 3000);
    });
}

if (ponytailDiagAiBtn) {
    ponytailDiagAiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'copyAiInstallPrompt' });
        ponytailDiagAiBtn.textContent = '✓ Copied';
        setTimeout(() => { ponytailDiagAiBtn.textContent = '🤖 Ask AI'; }, 2500);
    });
}

if (ponytailDiagSyncBtn) {
    ponytailDiagSyncBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        ponytailDiagSyncBtn.textContent = '🥋 Syncing...';
        vscode.postMessage({ command: 'syncPonytail' });
        setTimeout(() => { ponytailDiagSyncBtn.textContent = '🥋 Sync'; }, 3000);
    });
}

// OmniRoute Listeners
if (omniStartBtn) {
    omniStartBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'startOmniRoute' });
    });
}
if (omniStopBtn) {
    omniStopBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'stopOmniRoute' });
    });
}
if (omniOpenUiBtn) {
    omniOpenUiBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'openOmniRouteUi' });
    });
}
if (omniDoctorBtn) {
    omniDoctorBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'runOmniRouteDoctor' });
    });
}
if (omniStepOpenUiBtn) {
    omniStepOpenUiBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'openOmniRouteUi' });
    });
}
if (omniCopyLaunchCmdBtn) {
    omniCopyLaunchCmdBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'copyOmniRoutePreset', text: 'npx -y omniroute', presetName: 'Launch Command' });
        omniCopyLaunchCmdBtn.textContent = '✓';
        setTimeout(() => { omniCopyLaunchCmdBtn.textContent = '📋'; }, 2500);
    });
}
if (omniPresetTabs) {
    omniPresetTabs.querySelectorAll('.preset-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const ide = tab.dataset.ide;
            renderOmniPreset(ide);
        });
    });
}
if (omniCopyPresetBtn) {
    omniCopyPresetBtn.addEventListener('click', () => {
        if (currentOmniPresets && currentOmniPresets[activeOmniIde]) {
            const preset = currentOmniPresets[activeOmniIde];
            const textToCopy = preset.configJson || preset.quickSnippet;
            vscode.postMessage({ command: 'copyOmniRoutePreset', text: textToCopy, presetName: preset.name });
            omniCopyPresetBtn.textContent = '✓ Copied!';
            setTimeout(() => { omniCopyPresetBtn.textContent = '📋 Copy Configuration'; }, 2500);
        }
    });
}
if (quickOmniBtn) {
    quickOmniBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'startOmniRoute' });
    });
}
if (omniDiagStartBtn) {
    omniDiagStartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'startOmniRoute' });
    });
}
if (omniEnabledCheckbox) {
    omniEnabledCheckbox.addEventListener('change', () => {
        vscode.postMessage({ command: 'toggleOmniRoute' });
    });
}
if (uninstallUpstreamBtn) {
    uninstallUpstreamBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'openUninstallPicker' });
    });
}
if (headerUninstallBtn) {
    headerUninstallBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'openUninstallPicker' });
    });
}
if (omniDiagUninstallBtn) {
    omniDiagUninstallBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'uninstallLayer', layerKey: 'omniroute' });
    });
}
if (rtkDiagUninstallBtn) {
    rtkDiagUninstallBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'uninstallLayer', layerKey: 'rtk' });
    });
}
if (headroomDiagUninstallBtn) {
    headroomDiagUninstallBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'uninstallLayer', layerKey: 'headroom' });
    });
}
if (ponytailDiagUninstallBtn) {
    ponytailDiagUninstallBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'uninstallLayer', layerKey: 'ponytail' });
    });
}

// Handle incoming messages from extension host
window.addEventListener('message', (event) => {
    const message = event.data;

    switch (message.type) {
        case 'toast':
            // Visual feedback handled on buttons, or log if needed
            break;
        case 'stateUpdate':
            renderDashboardState(message.data);
            break;
        case 'latencyResult':
            if (message.data) {
                if (message.data.summary) {
                    latencySubText.textContent = message.data.summary;
                    latencySubText.title = message.data.details || message.data.summary;
                } else if (message.data.available) {
                    latencySubText.textContent = `Latency: ${message.data.latency}`;
                } else {
                    latencySubText.textContent = 'Upstream layers not reachable';
                }
            }
            break;
        case 'updateCheckResult':
            if (message.data && message.data.hasUpdate) {
                const parts = [];
                if (message.data.rtk && message.data.rtk.hasUpdate && message.data.rtk.release) {
                    parts.push(`RTK ${message.data.rtk.release.tag}`);
                }
                if (message.data.headroom && message.data.headroom.hasUpdate && message.data.headroom.release) {
                    parts.push(`Headroom ${message.data.headroom.release.tag}`);
                }
                if (message.data.ponytail && message.data.ponytail.hasUpdate) {
                    parts.push(`Ponytail (${(message.data.ponytail.release && message.data.ponytail.release.tag) || 'GitHub'})`);
                }
                if (message.data.omniroute && message.data.omniroute.hasUpdate && message.data.omniroute.release) {
                    parts.push(`OmniRoute ${message.data.omniroute.release.tag}`);
                }
                if (checkUpdatesLabel) {
                    checkUpdatesLabel.textContent = `Update: ${parts.join(' & ')}!`;
                }
                if (checkUpdatesSub) {
                    checkUpdatesSub.textContent = 'Click to upgrade & sync upstream tools';
                }
                if (checkUpdatesBadge) {
                    checkUpdatesBadge.className = 'action-status-badge install';
                    checkUpdatesBadge.innerHTML = '<span class="badge-text">🚀 Update</span>';
                }
            } else {
                if (checkUpdatesBadge) {
                    checkUpdatesBadge.className = 'action-status-badge';
                    checkUpdatesBadge.innerHTML = '<span class="badge-text">▾ Sync</span>';
                }
            }
            break;
    }
});

function renderDashboardState(data) {
    const { isEnabled, installed, version, binaryPath, metrics, scope, ideStatus, isSidebar } = data;

    isSidebarMode = !!isSidebar;
    dashboardContainer.classList.toggle('is-sidebar', isSidebarMode);

    // Adjust button titles and icons according to environment
    if (!isSidebarMode) {
        if (popOutBtn) {
            popOutBtn.title = "Dock to Sidebar (Minimize)";
            popOutBtn.innerHTML = "⤓";
        }
        if (minimizeBtn) {
            minimizeBtn.title = "Minimize / Dock to Sidebar";
            minimizeBtn.innerHTML = "🗕";
            minimizeBtn.classList.remove('active');
        }
    } else {
        if (popOutBtn) {
            popOutBtn.title = "Pop Out to Editor Tab";
            popOutBtn.innerHTML = "⤢";
        }
        if (minimizeBtn) {
            minimizeBtn.title = isCompact ? "Expand Full View" : "Minimize / Compact View";
            minimizeBtn.innerHTML = isCompact ? "🗖" : "🗕";
            minimizeBtn.classList.toggle('active', isCompact);
        }
    }

    // Status Pill (if present) & RTK Button
    if (statusPill && statusText) {
        if (isEnabled) {
            statusPill.className = 'status-pill active';
            statusText.textContent = 'RTK ACTIVE';
        } else {
            statusPill.className = 'status-pill inactive';
            statusText.textContent = 'RTK INACTIVE';
        }
    }
    if (isEnabled) {
        toggleModeBtn.textContent = 'Turn RTK OFF';
        toggleModeBtn.className = 'btn btn-ghost';
    } else {
        toggleModeBtn.textContent = 'Turn RTK ON';
        toggleModeBtn.className = 'btn btn-primary';
    }

    // Headroom Button
    if (toggleHeadroomBtn) {
        const isHeadroom = Boolean(data.headroomEnabled);
        if (isHeadroom) {
            toggleHeadroomBtn.textContent = 'Turn Headroom OFF';
            toggleHeadroomBtn.className = 'btn btn-ghost';
        } else {
            toggleHeadroomBtn.textContent = 'Turn Headroom ON';
            toggleHeadroomBtn.className = 'btn btn-primary';
        }
    }

    // OmniRoute Button in Header
    if (toggleOmniRouteBtn) {
        const isOmni = Boolean(data.omniRouteEnabled);
        if (isOmni) {
            toggleOmniRouteBtn.textContent = 'Turn OmniRoute OFF';
            toggleOmniRouteBtn.className = 'btn btn-ghost';
        } else {
            toggleOmniRouteBtn.textContent = 'Turn OmniRoute ON';
            toggleOmniRouteBtn.className = 'btn btn-primary';
        }
    }

    // Top Metric Cards
    currentTotalSavedTokens = (metrics && metrics.totalSavedTokens) || 0;
    totalSavedVal.textContent = metrics.totalSavedFormatted || '0';
    savedRatioVal.textContent = metrics.isMock 
        ? 'Awaiting command executions' 
        : `Active compression across ${metrics.commandBreakdown.length} tool categories`;

    const pct = metrics.savedPercentage || 0;
    efficiencyVal.textContent = `${pct}%`;
    efficiencyBar.style.width = `${Math.min(pct, 100)}%`;

    costSavedVal.textContent = metrics.estimatedDollarSavings || '$0.00';

    // Synchronize Token Price / 1M tokens Input & Presets
    const price = data.tokenPricePerMillion !== undefined
        ? data.tokenPricePerMillion
        : (metrics && metrics.tokenPricePerMillion !== undefined ? metrics.tokenPricePerMillion : 3.00);

    currentTokenPrice = price;
    if (costPriceInput && document.activeElement !== costPriceInput) {
        costPriceInput.value = price;
        if (saveCostBtn) saveCostBtn.classList.remove('visible');
    }

    if (costPresetsPopover) {
        const presetItems = costPresetsPopover.querySelectorAll('.preset-item');
        presetItems.forEach(item => {
            const itemPrice = parseFloat(item.getAttribute('data-price'));
            if (Math.abs(itemPrice - price) < 0.001) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // IDE Targets Summary & Auto-Detected Host
    const detected = data.detectedIde || { id: 'antigravity', displayName: 'Antigravity IDE', shortName: 'Antigravity' };
    if (ideSyncTitle) {
        ideSyncTitle.textContent = `🤖 ${detected.displayName} Hub`;
    }
    if (ideSyncSubtitle) {
        ideSyncSubtitle.textContent = `Auto-detected active host: ${detected.displayName}`;
    }

    const syncedCount = (ideStatus || []).filter(i => i.synced).length;
    const totalTargets = (ideStatus || []).length;
    activeTargetsVal.textContent = `${syncedCount} / ${totalTargets} Synced`;
    activeTargetsVal.style.color = syncedCount > 0 ? 'var(--accent-green)' : 'var(--accent-amber)';
    skillsScopeVal.textContent = detected.displayName;

    if (syncAllIdesBtn) {
        syncAllIdesBtn.textContent = totalTargets > 1 ? '⚡ Sync All' : '⚡ Sync Rule';
    }

    // Render IDE Grid (Current IDE targets only)
    renderIdeGrid(ideStatus || []);

    // Command Breakdown Chart
    renderChart(metrics.commandBreakdown);

    // Raw Output text snippet
    rawOutputText.textContent = metrics.rawText || 'No output recorded yet.';

    // Setup Hub Alert Banner Rendering
    const isRtkMissing = !installed;
    const isHeadroomMissing = !data.headroomInstalled;
    const isPonytailMissing = !data.ponytailInstalled;
    const isOmniMissing = !data.omniRouteInstalled && !data.omniRouteRunning;
    const isAnyMissing = isRtkMissing || isHeadroomMissing || isPonytailMissing || isOmniMissing;

    if (setupBanner) {
        if (isAnyMissing) {
            setupBanner.style.display = 'flex';
            if (setupMissingTags) {
                const chips = [];
                if (isOmniMissing) {
                    chips.push('<span class="missing-chip chip-purple" style="background: rgba(175, 82, 222, 0.15); color: #d28cff; border: 1px solid rgba(175, 82, 222, 0.3);">🌐 OmniRoute Missing</span>');
                }
                if (isRtkMissing) {
                    chips.push('<span class="missing-chip chip-rose">⚡ RTK CLI Missing</span>');
                }
                if (isHeadroomMissing) {
                    chips.push('<span class="missing-chip chip-amber">📦 Headroom Missing</span>');
                }
                if (isPonytailMissing) {
                    chips.push('<span class="missing-chip chip-cyan">🥋 Ponytail GitHub Missing</span>');
                }
                setupMissingTags.innerHTML = chips.join('');
            }
            if (setupBannerDesc) {
                const missingNames = [];
                if (isOmniMissing) missingNames.push('OmniRoute Gateway');
                if (isRtkMissing) missingNames.push('RTK CLI');
                if (isHeadroomMissing) missingNames.push('Headroom');
                if (isPonytailMissing) missingNames.push('Ponytail YAGNI');
                setupBannerDesc.textContent = `Fetch & install ${missingNames.join(' & ')} to slash token consumption and route multi-model traffic with auto-fallback.`;
            }
        } else {
            setupBanner.style.display = 'none';
        }
    }

    // OmniRoute Gateway Rendering
    const omniPort = data.omniRoutePort || 20128;
    const omniEnabled = data.omniRouteEnabled !== false;
    const omniRunning = Boolean(data.omniRouteRunning) && omniEnabled;
    const omniInstalled = Boolean(data.omniRouteInstalled);

    if (omniEnabledCheckbox) {
        omniEnabledCheckbox.checked = omniEnabled;
    }

    if (omniLiveDot) {
        omniLiveDot.className = omniRunning ? 'omni-dot online' : 'omni-dot';
    }
    if (omniStatusMain) {
        if (!omniEnabled) {
            omniStatusMain.textContent = 'OmniRoute Disabled in Settings';
        } else {
            omniStatusMain.textContent = omniRunning 
                ? `Gateway Active (Port ${omniPort})` 
                : (omniInstalled ? 'Gateway Ready (Offline)' : 'Gateway Not Detected');
        }
    }
    if (omniStatusSub) {
        if (!omniEnabled) {
            omniStatusSub.textContent = 'Toggle "Active" switch above or user setting tokenSaver.omniRouteEnabled to re-enable';
        } else {
            omniStatusSub.textContent = omniRunning 
                ? `Live at http://localhost:${omniPort}/v1 • Auto-Fallback Active` 
                : `Endpoint: http://localhost:${omniPort}/v1`;
        }
    }
    if (omniStatusBadge) {
        if (!omniEnabled) {
            omniStatusBadge.textContent = '⚪ DISABLED';
            omniStatusBadge.className = 'panel-tag';
        } else {
            omniStatusBadge.textContent = omniRunning 
                ? `🟢 RUNNING (:${omniPort})` 
                : (omniInstalled ? '🔴 STOPPED' : '⚠️ NOT DETECTED');
            omniStatusBadge.className = omniRunning ? 'panel-tag tag-cyan' : 'panel-tag tag-purple';
        }
    }
    if (omniStartBtn && omniStopBtn) {
        omniStartBtn.style.display = omniRunning ? 'none' : 'inline-block';
        omniStopBtn.style.display = omniRunning ? 'inline-block' : 'none';
        if (!omniEnabled) {
            omniStartBtn.textContent = '⚡ Enable & Start';
        } else {
            omniStartBtn.textContent = '⚡ Start Gateway';
        }
    }

    // Vibe Coder Presets Update
    if (data.omniRoutePresets) {
        currentOmniPresets = data.omniRoutePresets;
        renderOmniPreset(activeOmniIde);
    }

    // Quick Action Button for OmniRoute
    if (quickOmniBadge && quickOmniSub) {
        if (!omniEnabled) {
            quickOmniBadge.className = 'action-status-badge';
            quickOmniBadge.innerHTML = '<span class="badge-text">Disabled</span>';
            quickOmniSub.textContent = 'Disabled (Setting)';
        } else if (omniRunning) {
            quickOmniBadge.className = 'action-status-badge synced';
            quickOmniBadge.innerHTML = '<span class="badge-icon">✓</span> <span class="badge-text">Online</span>';
            quickOmniSub.textContent = `Active on port ${omniPort}`;
        } else {
            quickOmniBadge.className = 'action-status-badge';
            quickOmniBadge.innerHTML = '<span class="badge-text">⚡ Launch</span>';
            quickOmniSub.textContent = `Local AI Router (:${omniPort})`;
        }
    }

    // Diagnostics OmniRoute row
    if (diagOmniStatus) {
        if (!omniEnabled) {
            diagOmniStatus.textContent = 'Inactive (Disabled in Settings)';
            diagOmniStatus.style.color = 'var(--text-muted)';
        } else if (omniRunning) {
            diagOmniStatus.textContent = `Active (:Port ${omniPort} Online)`;
            diagOmniStatus.style.color = 'var(--accent-green)';
        } else if (omniInstalled) {
            diagOmniStatus.textContent = `Inactive (:Port ${omniPort} Offline)`;
            diagOmniStatus.style.color = 'var(--accent-amber)';
        } else {
            diagOmniStatus.textContent = 'Issue (Not Installed)';
            diagOmniStatus.style.color = 'var(--accent-rose)';
        }
    }
    if (omniDiagStartBtn) {
        omniDiagStartBtn.textContent = omniRunning ? '🌐 Open UI' : '⚡ Start';
    }
    if (omniDiagUninstallBtn) {
        omniDiagUninstallBtn.style.display = omniInstalled ? 'inline-block' : 'none';
    }

    // Diagnostics RTK CLI row
    if (diagCliStatus) {
        if (!installed) {
            diagCliStatus.textContent = 'Issue (Not Installed)';
            diagCliStatus.style.color = 'var(--accent-rose)';
        } else if (isEnabled) {
            diagCliStatus.textContent = `Active (${version || 'Ready'})`;
            diagCliStatus.style.color = 'var(--accent-green)';
        } else {
            diagCliStatus.textContent = 'Inactive (Disabled)';
            diagCliStatus.style.color = 'var(--text-muted)';
        }
    }
    if (rtkDiagActions) {
        rtkDiagActions.style.display = 'inline-flex';
        if (rtkDiagAiBtn) rtkDiagAiBtn.style.display = installed ? 'none' : 'inline-block';
        if (rtkDiagRunBtn) rtkDiagRunBtn.style.display = installed ? 'none' : 'inline-block';
        if (rtkDiagUninstallBtn) rtkDiagUninstallBtn.style.display = installed ? 'inline-block' : 'none';
    }

    if (diagHeadroomStatus) {
        const hrInstalled = Boolean(data.headroomInstalled);
        const hrEnabled = Boolean(data.headroomEnabled);
        const hrVer = data.headroomVersion;
        if (hrInstalled && hrEnabled) {
            diagHeadroomStatus.textContent = `Active (${hrVer || 'Ready'})`;
            diagHeadroomStatus.style.color = 'var(--accent-green)';
        } else if (hrInstalled && !hrEnabled) {
            diagHeadroomStatus.textContent = 'Inactive (Disabled)';
            diagHeadroomStatus.style.color = 'var(--text-muted)';
        } else if (!hrInstalled && hrEnabled) {
            diagHeadroomStatus.textContent = 'Issue (Not Installed)';
            diagHeadroomStatus.style.color = 'var(--accent-rose)';
        } else {
            diagHeadroomStatus.textContent = 'Inactive (Disabled)';
            diagHeadroomStatus.style.color = 'var(--text-muted)';
        }
    }
    if (headroomDiagActions) {
        headroomDiagActions.style.display = 'inline-flex';
        const hrInstalled = Boolean(data.headroomInstalled);
        if (headroomDiagAiBtn) headroomDiagAiBtn.style.display = hrInstalled ? 'none' : 'inline-block';
        if (headroomDiagRunBtn) headroomDiagRunBtn.style.display = hrInstalled ? 'none' : 'inline-block';
        if (headroomDiagUninstallBtn) headroomDiagUninstallBtn.style.display = hrInstalled ? 'inline-block' : 'none';
    }

    if (diagPonytailStatus) {
        const pInstalled = data.ponytailInstalled;
        const pMode = data.ponytailMode || 'full';
        if (pInstalled && pMode !== 'off') {
            diagPonytailStatus.textContent = `Active (${data.ponytailSkillsCount || 6}/6 skills)`;
            diagPonytailStatus.style.color = 'var(--accent-green)';
        } else if (pInstalled && pMode === 'off') {
            diagPonytailStatus.textContent = 'Inactive (Mode Off)';
            diagPonytailStatus.style.color = 'var(--text-muted)';
        } else {
            diagPonytailStatus.textContent = 'Inactive (Not Synced)';
            diagPonytailStatus.style.color = 'var(--accent-amber)';
        }
    }
    if (ponytailDiagActions) {
        ponytailDiagActions.style.display = 'inline-flex';
        const pInstalled = Boolean(data.ponytailInstalled);
        if (ponytailDiagAiBtn) ponytailDiagAiBtn.style.display = pInstalled ? 'none' : 'inline-block';
        if (ponytailDiagSyncBtn) ponytailDiagSyncBtn.style.display = pInstalled ? 'none' : 'inline-block';
        if (ponytailDiagUninstallBtn) ponytailDiagUninstallBtn.style.display = pInstalled ? 'inline-block' : 'none';
    }

    if (ponytailActionBadge) {
        if (data.ponytailInstalled) {
            ponytailActionBadge.className = 'action-status-badge synced';
            ponytailActionBadge.innerHTML = '<span class="badge-icon">✓</span> <span class="badge-text">Synced</span>';
            ponytailActionBadge.title = `Ponytail YAGNI suite active (${data.ponytailSkillsCount || 6}/6 skills)`;
            if (syncPonytailSub) {
                syncPonytailSub.textContent = '✓ DietrichGebert/ponytail synced (Global IDE)';
            }
        } else {
            ponytailActionBadge.className = 'action-status-badge install';
            ponytailActionBadge.innerHTML = '<span class="badge-text">+ Fetch</span>';
            ponytailActionBadge.title = 'Click to fetch Ponytail skills from GitHub to global IDE';
            if (syncPonytailSub) {
                syncPonytailSub.textContent = 'Fetch DietrichGebert/ponytail to IDE';
            }
        }
    }

    // Upstream GitHub Installed Versions breakdown
    const verList = [];
    if (installed) {
        verList.push(`RTK: ${version}`);
    }
    if (data.headroomInstalled) {
        verList.push(`Headroom: ${data.headroomVersion}`);
    }
    if (data.ponytailInstalled) {
        verList.push(`Ponytail: ${data.ponytailVersion || 'v1.0.0'} (${data.ponytailSkillsCount || 6}/6)`);
    }
    if (data.omniRouteInstalled) {
        verList.push(`OmniRoute: ${data.omniRouteVersion || 'Ready'}`);
    }

    if (verList.length === 0) {
        diagVersion.textContent = 'None detected';
        diagVersion.title = 'No upstream GitHub layers detected';
    } else {
        diagVersion.textContent = verList.join(' • ');
        diagVersion.title = verList.join('\n');
    }

    diagBinaryPath.textContent = binaryPath;
    diagBinaryPath.title = binaryPath;
    diagScope.textContent = scope === 'all' ? 'All Supported IDEs & Agents' : scope;
    diagActiveTargets.textContent = `${syncedCount} IDE Targets Active`;

    // 1-Click Skill Installation Status (Green Tick when detected)
    const isSkillsInstalled = (typeof data.skillsInstalled === 'object' && data.skillsInstalled !== null)
        ? data.skillsInstalled.installed
        : Boolean(data.skillsInstalled);
    const skillsTotal = (typeof data.skillsInstalled === 'object' && data.skillsInstalled !== null && data.skillsInstalled.total)
        ? data.skillsInstalled.total
        : 21;
    const skillsCount = (typeof data.skillsInstalled === 'object' && data.skillsInstalled !== null)
        ? data.skillsInstalled.count
        : (isSkillsInstalled ? skillsTotal : 0);

    if (skillsStatusBadge) {
        if (isSkillsInstalled) {
            skillsStatusBadge.className = 'action-status-badge synced';
            skillsStatusBadge.innerHTML = '<span class="badge-icon">✓</span> <span class="badge-text">Active</span>';
            skillsStatusBadge.title = `Chat skills active (${skillsCount}/${skillsTotal} skills installed in IDE)`;
            if (skillsSubText) {
                skillsSubText.textContent = `✓ /rtk-* & /ponytail ready (${skillsCount}/${skillsTotal} active)`;
            }
        } else {
            skillsStatusBadge.className = 'action-status-badge install';
            skillsStatusBadge.innerHTML = '<span class="badge-text">+ Install</span>';
            skillsStatusBadge.title = `Click to install all ${skillsTotal} chat skills in IDE`;
            if (skillsSubText) {
                skillsSubText.textContent = `Install all ${skillsTotal} chat skills (/rtk-* & /ponytail)`;
            }
        }
    }

    // Weekly Auto Sync Option State
    if (weeklySyncCheckbox && data.weeklyAutoSync !== undefined) {
        weeklySyncCheckbox.checked = Boolean(data.weeklyAutoSync);
    }

    // Output & Context Token Optimization
    const pMode = data.ponytailMode || 'full';
    if (ponytailActiveBadge) {
        ponytailActiveBadge.textContent = `${pMode.toUpperCase()} Mode`;
        ponytailActiveBadge.className = pMode === 'off' ? 'panel-tag' : 'panel-tag tag-cyan';
    }
    if (ponytailSegmentGroup) {
        const btns = ponytailSegmentGroup.querySelectorAll('.segment-btn');
        btns.forEach(b => {
            b.classList.toggle('active', b.dataset.mode === pMode);
        });
    }
    if (terseAgentCheckbox && data.terseAgentMode !== undefined) {
        terseAgentCheckbox.checked = Boolean(data.terseAgentMode);
    }
    if (headroomCheckbox && data.headroomEnabled !== undefined) {
        headroomCheckbox.checked = Boolean(data.headroomEnabled);
    }
    if (astOutlineCheckbox && data.astOutlineContext !== undefined) {
        astOutlineCheckbox.checked = Boolean(data.astOutlineContext);
    }
    if (compactDiffCheckbox && data.compactDiffContext !== undefined) {
        compactDiffCheckbox.checked = Boolean(data.compactDiffContext);
    }
}

function renderIdeGrid(ideList) {
    ideGridContainer.innerHTML = '';

    if (!ideList || ideList.length === 0) {
        ideGridContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 13px; grid-column: 1/-1;">No IDE targets available.</div>';
        return;
    }

    ideList.forEach(ide => {
        const card = document.createElement('div');
        card.className = 'ide-card';

        const top = document.createElement('div');
        top.className = 'ide-card-top';

        const iconTitle = document.createElement('div');
        iconTitle.className = 'ide-icon-title';

        const icon = document.createElement('span');
        icon.className = 'ide-card-icon';
        icon.textContent = IDE_ICONS[ide.id] || '🤖';

        const textDiv = document.createElement('div');
        const name = document.createElement('div');
        name.className = 'ide-card-name';
        name.textContent = ide.name;

        const pathDiv = document.createElement('div');
        pathDiv.className = 'ide-card-path';
        const displayPath = ide.path.length > 35 ? '...' + ide.path.slice(-32) : ide.path;
        pathDiv.textContent = displayPath;
        pathDiv.title = ide.path;

        textDiv.appendChild(name);
        textDiv.appendChild(pathDiv);
        iconTitle.appendChild(icon);
        iconTitle.appendChild(textDiv);

        const statusTag = document.createElement('span');
        statusTag.className = `ide-status-tag ${ide.synced ? 'synced' : 'inactive'}`;
        statusTag.textContent = ide.synced ? 'SYNCED' : 'OFF';

        top.appendChild(iconTitle);
        top.appendChild(statusTag);

        const actions = document.createElement('div');
        actions.className = 'ide-card-actions';

        const syncBtn = document.createElement('button');
        syncBtn.className = 'btn-ide-sync';
        syncBtn.textContent = ide.synced ? '🔄 Re-Sync Rule' : '⚡ Enable Rule';
        syncBtn.addEventListener('click', () => {
            vscode.postMessage({
                command: 'syncSingleTarget',
                targetId: ide.id
            });
        });

        actions.appendChild(syncBtn);

        card.appendChild(top);
        card.appendChild(actions);
        ideGridContainer.appendChild(card);
    });
}

function renderChart(breakdown) {
    chartContainer.innerHTML = '';

    if (!breakdown || breakdown.length === 0) {
        chartContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 20px;">Run commands in your terminal with RTK to see per-tool compression stats here!</div>';
        return;
    }

    breakdown.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'chart-bar-row';

        const info = document.createElement('div');
        info.className = 'chart-bar-info';

        const cmdName = document.createElement('span');
        cmdName.className = 'chart-bar-cmd';
        cmdName.textContent = item.command;

        const stats = document.createElement('span');
        stats.className = 'chart-bar-stats';
        stats.textContent = `${item.savedFormatted || (item.savedTokens + ' tokens')} (${item.percentage}%)`;

        info.appendChild(cmdName);
        info.appendChild(stats);

        const track = document.createElement('div');
        track.className = 'chart-bar-track';

        const fill = document.createElement('div');
        fill.className = 'chart-bar-fill';
        fill.style.width = `${Math.max(item.percentage, 5)}%`;

        track.appendChild(fill);
        row.appendChild(info);
        row.appendChild(track);

        chartContainer.appendChild(row);
    });
}

// Initial signal to host
vscode.postMessage({ command: 'ready' });
