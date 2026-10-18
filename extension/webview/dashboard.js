// Acquire VS Code API
const vscode = acquireVsCodeApi();
const initialOverlayStartTime = Date.now();

// DOM Elements
const dashboardContainer = document.getElementById('dashboardContainer');
const statusPill = document.getElementById('statusPill');
const statusText = document.getElementById('statusText');
const toggleRtkBtn = document.getElementById('toggleRtkBtn');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const toggleHeadroomBtn = document.getElementById('toggleHeadroomBtn');
const togglePonytailBtn = document.getElementById('togglePonytailBtn');
const toggleAntiSlopBtn = document.getElementById('toggleAntiSlopBtn');
const toggleOmniRouteBtn = document.getElementById('toggleOmniRouteBtn');
const toggleJevGraphBtn = document.getElementById('toggleJevGraphBtn');
const toggleCodeGraphBtn = document.getElementById('toggleCodeGraphBtn');
const toggleHybridWebBtn = document.getElementById('toggleHybridWebBtn');
const toggleCrwBtn = toggleHybridWebBtn || document.getElementById('toggleCrwBtn');
const toggleEccBtn = document.getElementById('toggleEccBtn');
const rtkStatusBadge = document.getElementById('rtkStatusBadge');
const rtkInlineSyncBtn = document.getElementById('rtkInlineSyncBtn');
const rtkTerminalScoreboardBtn = document.getElementById('rtkTerminalScoreboardBtn');
const rtkDoctorBtn = document.getElementById('rtkDoctorBtn');
const rtkCopyInstallBtn = document.getElementById('rtkCopyInstallBtn');
const rtkLatencyBtn = document.getElementById('rtkLatencyBtn');
const rtkWarningModal = document.getElementById('rtkWarningModal');
const rtkWarningCancelBtn = document.getElementById('rtkWarningCancelBtn');
const rtkWarningConfirmBtn = document.getElementById('rtkWarningConfirmBtn');
const footerVersionBadge = document.getElementById('footerVersionBadge');
const popOutBtn = document.getElementById('popOutBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const openVsxUpdateBtn = document.getElementById('openVsxUpdateBtn');

const refreshDropdownGroup = document.getElementById('refreshDropdownGroup');
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
const quickUninstallSkillsBtn = document.getElementById('quickUninstallSkillsBtn');
const quickDisableSkillsBtn = document.getElementById('quickDisableSkillsBtn');
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
const diagVersionToggleBtn = document.getElementById('diagVersionToggleBtn');
const diagVersionSummary = document.getElementById('diagVersionSummary');
const diagVersionDropdown = document.getElementById('diagVersionDropdown');
const diagVersionChevron = document.getElementById('diagVersionChevron');
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

// Anti-Slop Elements
const antiSlopActiveBadge = document.getElementById('antiSlopActiveBadge');
const antiSlopSegmentGroup = document.getElementById('antiSlopSegmentGroup');
const antiSlopInlineSyncBtn = document.getElementById('antiSlopInlineSyncBtn');
const antiSlopCheckbox = document.getElementById('antiSlopCheckbox');
const diagAntiSlopStatus = document.getElementById('diagAntiSlopStatus');
const antiSlopDiagActions = document.getElementById('antiSlopDiagActions');
const antiSlopDiagAiBtn = document.getElementById('antiSlopDiagAiBtn');
const antiSlopDiagSyncBtn = document.getElementById('antiSlopDiagSyncBtn');
const antiSlopDiagUninstallBtn = document.getElementById('antiSlopDiagUninstallBtn');

// Setup Hub Elements
const initialLoadingOverlay = document.getElementById('initialLoadingOverlay');
let initialCheckCompleted = false;
const initialLoadingTags = document.querySelectorAll('.initial-loading-tag');
const initialLoadingDesc = document.querySelector('.initial-loading-desc');

// Start progressive animated checking across upstream GitHub tags
if (initialLoadingTags && initialLoadingTags.length > 0) {
    const upstreamTagOrder = ['rtk', 'headroom', 'ponytail', 'antislop', 'omniroute', 'jevgraph', 'codegraph', 'crw', 'lightpanda', 'ecc'];
    let stepIndex = 0;

    const advanceCheckStep = () => {
        if (initialCheckCompleted) return;
        if (stepIndex < upstreamTagOrder.length) {
            const currentId = upstreamTagOrder[stepIndex];
            const tagEl = document.querySelector(`.initial-loading-tag[data-upstream-id="${currentId}"]`);
            if (tagEl) {
                tagEl.classList.add('checking');
                if (initialLoadingDesc) {
                    initialLoadingDesc.textContent = `Checking ${tagEl.textContent.trim()} (${stepIndex + 1}/${upstreamTagOrder.length})...`;
                }
            }
            stepIndex++;
            setTimeout(advanceCheckStep, 380);
        }
    };
    // Kick off first step
    setTimeout(advanceCheckStep, 150);
}

const setupBanner = document.getElementById('setupBanner');
const setupBannerDesc = document.getElementById('setupBannerDesc');
const setupMissingTags = document.getElementById('setupMissingTags');
const setupInstallPathInput = document.getElementById('setupInstallPathInput');
const setupBrowsePathBtn = document.getElementById('setupBrowsePathBtn');
const setupSavePathBtn = document.getElementById('setupSavePathBtn');
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
const omniPresetNotice = document.getElementById('omniPresetNotice');
const omniPresetStepsList = document.getElementById('omniPresetStepsList');
const omniPresetCodePreview = document.getElementById('omniPresetCodePreview');
const omniCopyPresetBtn = document.getElementById('omniCopyPresetBtn');
const omniCopyAiPromptBtn = document.getElementById('omniCopyAiPromptBtn');

const quickOmniBtn = document.getElementById('quickOmniBtn');
const quickOmniLabel = document.getElementById('quickOmniLabel');
const quickOmniSub = document.getElementById('quickOmniSub');
const quickOmniBadge = document.getElementById('quickOmniBadge');

const diagOmniStatus = document.getElementById('diagOmniStatus');
const omniDiagActions = document.getElementById('omniDiagActions');
const omniDiagStartBtn = document.getElementById('omniDiagStartBtn');
const omniDiagUninstallBtn = document.getElementById('omniDiagUninstallBtn');

const omniEnabledCheckbox = document.getElementById('omniEnabledCheckbox');

// JevGraph Elements
const sectionJevGraph = document.getElementById('sectionJevGraph');
const jevStatusBadge = document.getElementById('jevStatusBadge');
const jevInlineSyncBtn = document.getElementById('jevInlineSyncBtn');
const jevGraphCheckbox = document.getElementById('jevGraphCheckbox');
const jevProviderSegmentGroup = document.getElementById('jevProviderSegmentGroup');
const jevManualInsertBtn = document.getElementById('jevManualInsertBtn');
const jevResetBtn = document.getElementById('jevResetBtn');
const quickJevInsertBtn = document.getElementById('quickJevInsertBtn');

const diagJevGraphStatus = document.getElementById('diagJevGraphStatus');
const jevGraphDiagActions = document.getElementById('jevGraphDiagActions');
const jevGraphDiagAiBtn = document.getElementById('jevGraphDiagAiBtn');
const jevGraphDiagSyncBtn = document.getElementById('jevGraphDiagSyncBtn');
const jevGraphDiagUninstallBtn = document.getElementById('jevGraphDiagUninstallBtn');

// CodeGraphContext Elements
const sectionCodeGraph = document.getElementById('sectionCodeGraph');
const codeGraphStatusBadge = document.getElementById('codeGraphStatusBadge');
const codeGraphInlineSyncBtn = document.getElementById('codeGraphInlineSyncBtn');
const codeGraphAutoWatchToggle = document.getElementById('codeGraphAutoWatchToggle');
const codeGraphIndexBtn = document.getElementById('codeGraphIndexBtn');
const codeGraphQueryBtn = document.getElementById('codeGraphQueryBtn');
const codeGraphResetBtn = document.getElementById('codeGraphResetBtn');

const diagCodeGraphStatus = document.getElementById('diagCodeGraphStatus');
const codeGraphDiagActions = document.getElementById('codeGraphDiagActions');
const codeGraphDiagAiBtn = document.getElementById('codeGraphDiagAiBtn');
const codeGraphDiagSyncBtn = document.getElementById('codeGraphDiagSyncBtn');
const codeGraphDiagUninstallBtn = document.getElementById('codeGraphDiagUninstallBtn');

// Hybrid Web (fastCRW + Lightpanda) Elements
const sectionHybridWeb = document.getElementById('sectionHybridWeb') || document.getElementById('sectionCrw');
const sectionCrw = sectionHybridWeb;
const hybridWebStatusBadge = document.getElementById('hybridWebStatusBadge');
const crwStatusBadge = hybridWebStatusBadge || document.getElementById('crwStatusBadge');
const crwSubStatus = document.getElementById('crwSubStatus');
const lightpandaSubStatus = document.getElementById('lightpandaSubStatus');
const crwInlineSyncBtn = document.getElementById('crwInlineSyncBtn');
const lightpandaInlineSyncBtn = document.getElementById('lightpandaInlineSyncBtn');
const crwStartServerBtn = document.getElementById('crwStartServerBtn');
const lightpandaStartMcpBtn = document.getElementById('lightpandaStartMcpBtn');
const lightpandaCopyMcpConfigBtn = document.getElementById('lightpandaCopyMcpConfigBtn');
const hybridTestScrapeBtn = document.getElementById('hybridTestScrapeBtn') || document.getElementById('crwTestScrapeBtn');
const crwTestScrapeBtn = hybridTestScrapeBtn;

const diagCrwStatus = document.getElementById('diagCrwStatus');
const crwDiagActions = document.getElementById('crwDiagActions');
const crwDiagAiBtn = document.getElementById('crwDiagAiBtn');
const crwDiagSyncBtn = document.getElementById('crwDiagSyncBtn');
const crwDiagUninstallBtn = document.getElementById('crwDiagUninstallBtn');

const diagLightpandaStatus = document.getElementById('diagLightpandaStatus');
const lightpandaDiagActions = document.getElementById('lightpandaDiagActions');
const lightpandaDiagAiBtn = document.getElementById('lightpandaDiagAiBtn');
const lightpandaDiagSyncBtn = document.getElementById('lightpandaDiagSyncBtn');
const lightpandaDiagUninstallBtn = document.getElementById('lightpandaDiagUninstallBtn');

// ECC Elements
const sectionEcc = document.getElementById('sectionEcc');
const eccActiveBadge = document.getElementById('eccActiveBadge');
const eccInlineSyncBtn = document.getElementById('eccInlineSyncBtn');
const eccCheckbox = document.getElementById('eccCheckbox');
const eccAutoCompactToggle = document.getElementById('eccAutoCompactToggle');
const eccAutoCkToggle = document.getElementById('eccAutoCkToggle');
const eccAutoCouncilToggle = document.getElementById('eccAutoCouncilToggle');
const tabChannelEcc = document.getElementById('tabChannelEcc');

const diagEccStatus = document.getElementById('diagEccStatus');
const eccDiagActions = document.getElementById('eccDiagActions');
const eccDiagAiBtn = document.getElementById('eccDiagAiBtn');
const eccDiagSyncBtn = document.getElementById('eccDiagSyncBtn');
const eccDiagUninstallBtn = document.getElementById('eccDiagUninstallBtn');

const uninstallUpstreamBtn = document.getElementById('uninstallUpstreamBtn');
const headerUninstallBtn = document.getElementById('headerUninstallBtn');
const rtkDiagUninstallBtn = document.getElementById('rtkDiagUninstallBtn');
const headroomDiagUninstallBtn = document.getElementById('headroomDiagUninstallBtn');
const ponytailDiagUninstallBtn = document.getElementById('ponytailDiagUninstallBtn');

// Multi-Channel Savings Breakdown Elements
const channelTabsBar = document.getElementById('channelTabsBar');
const savingsBreakdownTag = document.getElementById('savingsBreakdownTag');
const channelDistroBox = document.getElementById('channelDistroBox');
const distroTotalTokens = document.getElementById('distroTotalTokens');
const distroProgressTrack = document.getElementById('distroProgressTrack');
const distroLegend = document.getElementById('distroLegend');
const channelsGridContainer = document.getElementById('channelsGridContainer');
const rtkCommandsSubSection = document.getElementById('rtkCommandsSubSection');
const rtkCommandsCountTag = document.getElementById('rtkCommandsCountTag');

let currentActiveChannel = 'all';
let currentMultiChannelData = null;
let currentCommandBreakdown = [];

let currentOmniPresets = null;
let activeOmniIde = 'antigravity';

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

    if (omniPresetNotice) {
        if (preset.notice) {
            omniPresetNotice.innerHTML = preset.notice;
            omniPresetNotice.style.display = 'block';
        } else {
            omniPresetNotice.innerHTML = '';
            omniPresetNotice.style.display = 'none';
        }
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

// Restore saved state (Defaults to fully expanded view)
const savedState = vscode.getState() || {};
if (savedState.isCompact === true) {
    isCompact = true;
    dashboardContainer.classList.add('is-compact');
} else {
    isCompact = false;
    dashboardContainer.classList.remove('is-compact');
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
        }, 750);
    }
    if (refreshBtn) {
        refreshBtn.classList.add('active');
        setTimeout(() => {
            refreshBtn.classList.remove('active');
        }, 750);
    }
    vscode.postMessage({ command: 'refresh', isAutomatic });
}

// Refresh Dropdown Event Listeners
if (refreshBtn) {
    refreshBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerRefresh(false);
    });
}

if (refreshMenuBtn) {
    refreshMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = refreshDropdownMenu.classList.toggle('show');
        if (refreshDropdownGroup) {
            refreshDropdownGroup.classList.toggle('open', isOpen);
        }
        if (isOpen && customMinuteInput) {
            customMinuteInput.focus();
        }
    });
}

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
    if (refreshDropdownMenu && !refreshDropdownMenu.contains(e.target) && refreshMenuBtn && !refreshMenuBtn.contains(e.target)) {
        refreshDropdownMenu.classList.remove('show');
        if (refreshDropdownGroup) {
            refreshDropdownGroup.classList.remove('open');
        }
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
        if (refreshDropdownMenu) refreshDropdownMenu.classList.remove('show');
        if (refreshDropdownGroup) refreshDropdownGroup.classList.remove('open');
        if (costPresetsPopover && costPresetToggleBtn) {
            costPresetsPopover.classList.remove('show');
            costPresetToggleBtn.classList.remove('active');
            const card = costPresetToggleBtn.closest('.metric-card');
            if (card) {
                card.classList.remove('popover-active');
            }
        }
    }
});

// Theme Management (Default: Follow VS Code host or Dark Mode)
let currentTheme = 'dark';
try {
    const savedTheme = localStorage.getItem('tokenSaverTheme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
        currentTheme = savedTheme;
    } else if (document.body.classList.contains('vscode-light')) {
        currentTheme = 'light';
    }
} catch (_) { }

function applyTheme(theme) {
    currentTheme = theme;
    if (theme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        document.body.classList.add('light-theme');
        if (themeIcon) themeIcon.textContent = '⏾';
        if (themeToggleBtn) {
            themeToggleBtn.title = 'Switch to Dark Mode';
            themeToggleBtn.classList.add('active');
        }
    } else {
        document.body.setAttribute('data-theme', 'dark');
        document.body.classList.remove('light-theme');
        if (themeIcon) themeIcon.textContent = '☀︎';
        if (themeToggleBtn) {
            themeToggleBtn.title = 'Switch to Light Mode';
            themeToggleBtn.classList.remove('active');
        }
    }
    try {
        localStorage.setItem('tokenSaverTheme', theme);
    } catch (_) { }
}

// Initialize Theme
applyTheme(currentTheme);

// Observe VS Code theme change if user switches host theme and hasn't manually overridden
try {
    const observer = new MutationObserver(() => {
        const savedTheme = localStorage.getItem('tokenSaverTheme');
        if (!savedTheme) {
            const isVsCodeLight = document.body.classList.contains('vscode-light');
            if (isVsCodeLight && currentTheme !== 'light') {
                applyTheme('light');
            } else if (!isVsCodeLight && currentTheme !== 'dark') {
                applyTheme('dark');
            }
        }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
} catch (_) { }

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

// Secondary sections that auto-tuck in compact mode to make visual length difference dramatic
const SECONDARY_SECTION_IDS = [
    'sectionIdeSync',
    'sectionOutputOpt',
    'sectionAntiSlop',
    'sectionJevGraph',
    'sectionCodeGraph',
    'sectionHybridWeb',
    'sectionEcc',
    'sectionOmniRoute',
    'sectionHealth'
];

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
            minimizeBtn.title = isCompact ? "Expand Full View (Show All Details)" : "Minimize / Compact View";
            minimizeBtn.innerHTML = isCompact ? "🗖" : "🗕";

            if (isCompact) {
                // In compact mode: automatically tuck secondary sections into sleek single-line summary bars
                SECONDARY_SECTION_IDS.forEach(id => {
                    const sec = document.getElementById(id);
                    if (sec) sec.classList.add('collapsed');
                });
            } else {
                // In expand full view: expand all sections to show full depth and controls
                document.querySelectorAll('.panel-card.collapsed').forEach(card => {
                    card.classList.remove('collapsed');
                });
            }

            persistState();
        }
    });
}

if (openVsxUpdateBtn) {
    openVsxUpdateBtn.addEventListener('click', () => {
        openVsxUpdateBtn.style.opacity = '0.5';
        vscode.postMessage({ command: 'updateFromOpenVsx' });
        setTimeout(() => {
            if (openVsxUpdateBtn) openVsxUpdateBtn.style.opacity = '1';
        }, 1200);
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

// RTK / Token Saver Deactivation Warning Modal Logic
let pendingDeactivateCommand = null;

function showRtkWarningModal(command = 'toggleMode') {
    pendingDeactivateCommand = command;
    if (rtkWarningModal) {
        rtkWarningModal.classList.add('open');
    }
}

function hideRtkWarningModal() {
    pendingDeactivateCommand = null;
    if (rtkWarningModal) {
        rtkWarningModal.classList.remove('open');
    }
}

if (rtkWarningCancelBtn) {
    rtkWarningCancelBtn.addEventListener('click', () => {
        hideRtkWarningModal();
    });
}

if (rtkWarningConfirmBtn) {
    rtkWarningConfirmBtn.addEventListener('click', () => {
        const cmd = pendingDeactivateCommand || 'toggleMode';
        hideRtkWarningModal();
        vscode.postMessage({ command: cmd });
    });
}

if (rtkWarningModal) {
    rtkWarningModal.addEventListener('click', (e) => {
        if (e.target === rtkWarningModal) {
            hideRtkWarningModal();
        }
    });
}

// General Action Event Listeners
if (toggleRtkBtn) {
    toggleRtkBtn.addEventListener('click', () => {
        const isCurrentlyActive = toggleRtkBtn.classList.contains('btn-primary');
        if (isCurrentlyActive) {
            showRtkWarningModal('toggleMode');
        } else {
            vscode.postMessage({ command: 'toggleMode' });
        }
    });
}

if (rtkInlineSyncBtn) {
    rtkInlineSyncBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'installCli' });
    });
}

if (rtkTerminalScoreboardBtn) {
    rtkTerminalScoreboardBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'openScoreboardTerminal' });
    });
}

if (rtkDoctorBtn) {
    rtkDoctorBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'runRtkDoctor' });
    });
}

if (rtkCopyInstallBtn) {
    rtkCopyInstallBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'copyInstallCommands' });
    });
}

if (rtkLatencyBtn) {
    rtkLatencyBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'testLatency' });
    });
}

toggleModeBtn.addEventListener('click', () => {
    const isCurrentlyActive = toggleModeBtn.classList.contains('btn-primary');
    if (isCurrentlyActive) {
        showRtkWarningModal('toggleMode');
    } else {
        vscode.postMessage({ command: 'toggleMode' });
    }
});

if (toggleHeadroomBtn) {
    toggleHeadroomBtn.addEventListener('click', () => {
        const current = headroomCheckbox ? headroomCheckbox.checked : true;
        vscode.postMessage({ command: 'toggleHeadroom', enabled: !current });
    });
}

if (togglePonytailBtn) {
    togglePonytailBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'togglePonytail' });
    });
}

if (toggleAntiSlopBtn) {
    toggleAntiSlopBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'toggleAntiSlop' });
    });
}

if (toggleOmniRouteBtn) {
    toggleOmniRouteBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'toggleOmniRoute' });
    });
}

if (toggleJevGraphBtn) {
    toggleJevGraphBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'toggleJevGraph' });
    });
}

if (toggleCodeGraphBtn) {
    toggleCodeGraphBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'toggleCodeGraph' });
    });
}

if (toggleHybridWebBtn || toggleCrwBtn) {
    const btn = toggleHybridWebBtn || toggleCrwBtn;
    btn.addEventListener('click', () => {
        vscode.postMessage({ command: 'toggleHybridWeb' });
    });
}

if (toggleEccBtn) {
    toggleEccBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'toggleEcc' });
    });
}

if (eccCheckbox) {
    eccCheckbox.addEventListener('change', () => {
        vscode.postMessage({ command: 'toggleEcc' });
    });
}

if (eccInlineSyncBtn) {
    eccInlineSyncBtn.addEventListener('click', () => {
        eccInlineSyncBtn.textContent = '⭮ Syncing...';
        vscode.postMessage({ command: 'syncEcc' });
        setTimeout(() => { eccInlineSyncBtn.textContent = '⭮ Sync from GitHub'; }, 3000);
    });
}

if (eccAutoCompactToggle) {
    eccAutoCompactToggle.addEventListener('change', () => {
        vscode.postMessage({ command: 'toggleEccAutoCompact', enabled: eccAutoCompactToggle.checked });
    });
}

if (eccAutoCkToggle) {
    eccAutoCkToggle.addEventListener('change', () => {
        vscode.postMessage({ command: 'toggleEccAutoCk', enabled: eccAutoCkToggle.checked });
    });
}

if (eccAutoCouncilToggle) {
    eccAutoCouncilToggle.addEventListener('change', () => {
        vscode.postMessage({ command: 'toggleEccAutoCouncil', enabled: eccAutoCouncilToggle.checked });
    });
}

// Global copy button handler for .copy-cmd-btn
document.querySelectorAll('.copy-cmd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd') || btn.dataset.cmd;
        if (cmd) {
            navigator.clipboard.writeText(cmd).then(() => {
                const originalText = btn.textContent;
                btn.textContent = '✓ Copied';
                btn.style.color = 'var(--apple-green, #30d158)';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.color = '';
                }, 2000);
            }).catch(() => {
                vscode.postMessage({ command: 'copyToClipboard', text: cmd });
            });
        }
    });
});

// Upstream Waiting Overlay Advertisement Email Copy Button
const copyAdEmailBtn = document.getElementById('copyAdEmailBtn');
if (copyAdEmailBtn) {
    copyAdEmailBtn.addEventListener('click', () => {
        const email = 'terenceooi1688@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
            const originalText = copyAdEmailBtn.textContent;
            copyAdEmailBtn.textContent = '✓ Copied';
            copyAdEmailBtn.style.color = '#30d158';
            setTimeout(() => {
                copyAdEmailBtn.textContent = originalText;
                copyAdEmailBtn.style.color = '';
            }, 2000);
        }).catch(() => {
            vscode.postMessage({ command: 'copyToClipboard', text: email });
        });
    });
}

if (eccDiagAiBtn) {
    eccDiagAiBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'copyAiInstallPrompt', element: 'ecc' });
    });
}

if (eccDiagSyncBtn) {
    eccDiagSyncBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'syncEcc' });
    });
}

if (eccDiagUninstallBtn) {
    eccDiagUninstallBtn.addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        const isRecover = eccDiagUninstallBtn.dataset.mode === 'recover';
        vscode.postMessage({
            command: isRecover ? 'recoverLayer' : 'uninstallLayer',
            layerKey: 'ecc'
        });
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

if (quickUninstallSkillsBtn) {
    quickUninstallSkillsBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'uninstallSkills' });
    });
}

if (quickDisableSkillsBtn) {
    quickDisableSkillsBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'temporaryDisableSkills' });
    });
}

if (diagVersionToggleBtn && diagVersionDropdown) {
    diagVersionToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = diagVersionDropdown.style.display === 'none' || !diagVersionDropdown.style.display;
        diagVersionDropdown.style.display = isHidden ? 'block' : 'none';
        if (diagVersionChevron) {
            diagVersionChevron.textContent = isHidden ? '▴' : '▾';
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#diagVersionRow')) {
            diagVersionDropdown.style.display = 'none';
            if (diagVersionChevron) diagVersionChevron.textContent = '▾';
        }
    });
}

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

if (openTerminalBtn) {
    openTerminalBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'openScoreboardTerminal' });
    });
}

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
if (setupBrowsePathBtn) {
    setupBrowsePathBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'browseUpstreamInstallPath' });
    });
}

if (setupInstallPathInput) {
    setupInstallPathInput.addEventListener('input', () => {
        if (setupSavePathBtn) {
            setupSavePathBtn.style.display = 'inline-block';
        }
    });

    setupInstallPathInput.addEventListener('change', () => {
        vscode.postMessage({
            command: 'setUpstreamInstallPath',
            path: setupInstallPathInput.value.trim()
        });
        if (setupSavePathBtn) {
            setupSavePathBtn.style.display = 'none';
        }
    });

    setupInstallPathInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setupInstallPathInput.blur();
        }
    });
}

if (setupSavePathBtn) {
    setupSavePathBtn.addEventListener('click', () => {
        vscode.postMessage({
            command: 'setUpstreamInstallPath',
            path: setupInstallPathInput ? setupInstallPathInput.value.trim() : ''
        });
        setupSavePathBtn.style.display = 'none';
    });
}

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

// Single missing element chip click handler (Copies prompt for that specific tool)
if (setupMissingTags) {
    setupMissingTags.addEventListener('click', (e) => {
        const chipBtn = e.target.closest('.missing-chip');
        if (!chipBtn) return;

        const elementKey = chipBtn.getAttribute('data-element');
        const elementName = chipBtn.getAttribute('data-name') || elementKey;

        if (elementKey) {
            vscode.postMessage({
                command: 'copyAiInstallPrompt',
                elementKey: elementKey,
                elementName: elementName
            });

            const actionTag = chipBtn.querySelector('.chip-action-tag');
            if (actionTag) {
                const originalHtml = actionTag.innerHTML;
                actionTag.innerHTML = '✓ Copied!';
                chipBtn.classList.add('chip-copied');
                setTimeout(() => {
                    actionTag.innerHTML = originalHtml;
                    chipBtn.classList.remove('chip-copied');
                }, 2000);
            }
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
        ponytailInlineSyncBtn.textContent = '⭮ Syncing...';
        vscode.postMessage({ command: 'syncPonytail' });
        setTimeout(() => { ponytailInlineSyncBtn.textContent = '⭮ Sync from GitHub'; }, 3000);
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

// Anti-Slop Listeners
if (antiSlopSegmentGroup) {
    const btns = antiSlopSegmentGroup.querySelectorAll('.segment-btn');
    btns.forEach(b => {
        b.addEventListener('click', () => {
            const mode = b.dataset.mode;
            vscode.postMessage({ command: 'setAntiSlopMode', mode });
        });
    });
}

if (antiSlopInlineSyncBtn) {
    antiSlopInlineSyncBtn.addEventListener('click', (e) => {
        e.preventDefault();
        antiSlopInlineSyncBtn.textContent = '⭮ Syncing...';
        vscode.postMessage({ command: 'syncAntiSlop' });
        setTimeout(() => { antiSlopInlineSyncBtn.textContent = '⭮ Sync from GitHub'; }, 3000);
    });
}

if (antiSlopCheckbox) {
    antiSlopCheckbox.addEventListener('change', () => {
        vscode.postMessage({ command: 'toggleAntiSlop', enabled: antiSlopCheckbox.checked });
    });
}

if (antiSlopDiagAiBtn) {
    antiSlopDiagAiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'copyAiInstallPrompt' });
        antiSlopDiagAiBtn.textContent = '✓ Copied';
        setTimeout(() => { antiSlopDiagAiBtn.textContent = '🤖 Ask AI'; }, 2500);
    });
}

if (antiSlopDiagSyncBtn) {
    antiSlopDiagSyncBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        antiSlopDiagSyncBtn.textContent = '🛡️ Syncing...';
        vscode.postMessage({ command: 'syncAntiSlop' });
        setTimeout(() => { antiSlopDiagSyncBtn.textContent = '🛡️ Sync'; }, 3000);
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
            vscode.postMessage({ command: 'copyOmniRoutePreset', text: textToCopy, presetName: `${preset.name} Config` });
            omniCopyPresetBtn.textContent = '✓ Copied!';
            setTimeout(() => { omniCopyPresetBtn.textContent = '📋 Copy Config'; }, 2500);
        }
    });
}
if (omniCopyAiPromptBtn) {
    omniCopyAiPromptBtn.addEventListener('click', () => {
        if (currentOmniPresets && currentOmniPresets[activeOmniIde]) {
            const preset = currentOmniPresets[activeOmniIde];
            const promptToCopy = preset.aiPrompt || preset.configJson || preset.quickSnippet;
            vscode.postMessage({ command: 'copyOmniRoutePresetPrompt', promptText: promptToCopy, presetName: preset.name });
            omniCopyAiPromptBtn.textContent = '✓ Prompt Copied!';
            setTimeout(() => { omniCopyAiPromptBtn.textContent = '🤖 Copy AI Agent Prompt'; }, 2500);
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
        const isRecover = omniDiagUninstallBtn.dataset.mode === 'recover';
        vscode.postMessage({
            command: isRecover ? 'recoverLayer' : 'uninstallLayer',
            layerKey: 'omniroute'
        });
    });
}
if (rtkDiagUninstallBtn) {
    rtkDiagUninstallBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isRecover = rtkDiagUninstallBtn.dataset.mode === 'recover';
        vscode.postMessage({
            command: isRecover ? 'recoverLayer' : 'uninstallLayer',
            layerKey: 'rtk'
        });
    });
}
if (headroomDiagUninstallBtn) {
    headroomDiagUninstallBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isRecover = headroomDiagUninstallBtn.dataset.mode === 'recover';
        vscode.postMessage({
            command: isRecover ? 'recoverLayer' : 'uninstallLayer',
            layerKey: 'headroom'
        });
    });
}
if (ponytailDiagUninstallBtn) {
    ponytailDiagUninstallBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isRecover = ponytailDiagUninstallBtn.dataset.mode === 'recover';
        vscode.postMessage({
            command: isRecover ? 'recoverLayer' : 'uninstallLayer',
            layerKey: 'ponytail'
        });
    });
}
if (antiSlopDiagUninstallBtn) {
    antiSlopDiagUninstallBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isRecover = antiSlopDiagUninstallBtn.dataset.mode === 'recover';
        vscode.postMessage({
            command: isRecover ? 'recoverLayer' : 'uninstallLayer',
            layerKey: 'antislop'
        });
    });
}

// JevGraph Listeners
if (jevInlineSyncBtn) {
    jevInlineSyncBtn.addEventListener('click', (e) => {
        e.preventDefault();
        jevInlineSyncBtn.textContent = '⭮ Syncing...';
        vscode.postMessage({ command: 'syncJevGraph' });
        setTimeout(() => { jevInlineSyncBtn.textContent = '⭮ Sync from GitHub'; }, 3000);
    });
}

if (jevGraphCheckbox) {
    jevGraphCheckbox.addEventListener('change', () => {
        vscode.postMessage({ command: 'toggleJevGraph', enabled: jevGraphCheckbox.checked });
    });
}

if (jevProviderSegmentGroup) {
    const btns = jevProviderSegmentGroup.querySelectorAll('.segment-btn');
    btns.forEach(b => {
        b.addEventListener('click', () => {
            const provider = b.dataset.provider;
            vscode.postMessage({ command: 'setJevGraphProvider', provider });
        });
    });
}

if (jevManualInsertBtn) {
    jevManualInsertBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'manualInsertJevGraph' });
    });
}

if (quickJevInsertBtn) {
    quickJevInsertBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'manualInsertJevGraph' });
    });
}

if (jevResetBtn) {
    jevResetBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'resetJevGraph' });
    });
}

// CodeGraphContext Action Handlers
if (codeGraphInlineSyncBtn) {
    codeGraphInlineSyncBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'syncCodeGraph' });
    });
}

if (codeGraphAutoWatchToggle) {
    codeGraphAutoWatchToggle.addEventListener('change', (e) => {
        vscode.postMessage({ command: 'toggleCodeGraphAutoWatch', enabled: e.target.checked });
    });
}

if (codeGraphIndexBtn) {
    codeGraphIndexBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'indexCodeGraph' });
    });
}

if (codeGraphQueryBtn) {
    codeGraphQueryBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'queryCodeGraph' });
    });
}

if (codeGraphResetBtn) {
    codeGraphResetBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'resetCodeGraph' });
    });
}

if (jevGraphDiagAiBtn) {
    jevGraphDiagAiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'copyAiInstallPrompt' });
        jevGraphDiagAiBtn.textContent = '✓ Copied';
        setTimeout(() => { jevGraphDiagAiBtn.textContent = '🤖 Ask AI'; }, 2500);
    });
}

if (jevGraphDiagSyncBtn) {
    jevGraphDiagSyncBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        jevGraphDiagSyncBtn.textContent = '🕸️ Syncing...';
        vscode.postMessage({ command: 'syncJevGraph' });
        setTimeout(() => { jevGraphDiagSyncBtn.textContent = '🕸️ Sync'; }, 3000);
    });
}

if (jevGraphDiagUninstallBtn) {
    jevGraphDiagUninstallBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isRecover = jevGraphDiagUninstallBtn.dataset.mode === 'recover';
        vscode.postMessage({
            command: isRecover ? 'recoverLayer' : 'uninstallLayer',
            layerKey: 'jevgraph'
        });
    });
}

if (codeGraphDiagAiBtn) {
    codeGraphDiagAiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'copyAiInstallPrompt' });
        codeGraphDiagAiBtn.textContent = '✓ Copied';
        setTimeout(() => { codeGraphDiagAiBtn.textContent = '🤖 Ask AI'; }, 2500);
    });
}

if (codeGraphDiagSyncBtn) {
    codeGraphDiagSyncBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        codeGraphDiagSyncBtn.textContent = '🧬 Syncing...';
        vscode.postMessage({ command: 'syncCodeGraph' });
        setTimeout(() => { codeGraphDiagSyncBtn.textContent = '🧬 Sync'; }, 3000);
    });
}

if (codeGraphDiagUninstallBtn) {
    codeGraphDiagUninstallBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isRecover = codeGraphDiagUninstallBtn.dataset.mode === 'recover';
        vscode.postMessage({
            command: isRecover ? 'recoverLayer' : 'uninstallLayer',
            layerKey: 'codegraph'
        });
    });
}

// Hybrid Web (fastCRW + Lightpanda) Action Handlers
if (crwInlineSyncBtn) {
    crwInlineSyncBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'syncCrw' });
    });
}

if (lightpandaInlineSyncBtn) {
    lightpandaInlineSyncBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'syncLightpanda' });
    });
}

if (crwStartServerBtn) {
    crwStartServerBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'startCrwServer' });
    });
}

if (lightpandaStartMcpBtn) {
    lightpandaStartMcpBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'startLightpandaMcp' });
    });
}

if (lightpandaCopyMcpConfigBtn) {
    lightpandaCopyMcpConfigBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'copyLightpandaMcpConfig' });
        const orig = lightpandaCopyMcpConfigBtn.textContent;
        lightpandaCopyMcpConfigBtn.textContent = '✓ Copied Config';
        setTimeout(() => { lightpandaCopyMcpConfigBtn.textContent = orig; }, 2500);
    });
}

if (hybridTestScrapeBtn) {
    hybridTestScrapeBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'testHybridScrape' });
    });
}

if (crwDiagAiBtn) {
    crwDiagAiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'copyAiInstallPrompt', elementKey: 'fastcrw', elementName: 'fastCRW' });
        crwDiagAiBtn.textContent = '✓ Copied';
        setTimeout(() => { crwDiagAiBtn.textContent = '🤖 Ask AI'; }, 2500);
    });
}

if (crwDiagSyncBtn) {
    crwDiagSyncBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        crwDiagSyncBtn.textContent = '🕷️ Syncing...';
        vscode.postMessage({ command: 'syncCrw' });
        setTimeout(() => { crwDiagSyncBtn.textContent = '🕷️ Sync'; }, 3000);
    });
}

if (crwDiagUninstallBtn) {
    crwDiagUninstallBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isRecover = crwDiagUninstallBtn.dataset.mode === 'recover';
        vscode.postMessage({
            command: isRecover ? 'recoverLayer' : 'uninstallLayer',
            layerKey: 'crw'
        });
    });
}

if (lightpandaDiagAiBtn) {
    lightpandaDiagAiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ command: 'copyAiInstallPrompt', elementKey: 'lightpanda', elementName: 'Lightpanda Browser' });
        lightpandaDiagAiBtn.textContent = '✓ Copied';
        setTimeout(() => { lightpandaDiagAiBtn.textContent = '🤖 Ask AI'; }, 2500);
    });
}

if (lightpandaDiagSyncBtn) {
    lightpandaDiagSyncBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        lightpandaDiagSyncBtn.textContent = '🐼 Syncing...';
        vscode.postMessage({ command: 'syncLightpanda' });
        setTimeout(() => { lightpandaDiagSyncBtn.textContent = '🐼 Sync'; }, 3000);
    });
}

if (lightpandaDiagUninstallBtn) {
    lightpandaDiagUninstallBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isRecover = lightpandaDiagUninstallBtn.dataset.mode === 'recover';
        vscode.postMessage({
            command: isRecover ? 'recoverLayer' : 'uninstallLayer',
            layerKey: 'lightpanda'
        });
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
                if (message.data.antislop && message.data.antislop.hasUpdate) {
                    parts.push(`Anti-Slop (${(message.data.antislop.release && message.data.antislop.release.tag) || 'GitHub'})`);
                }
                if (message.data.omniroute && message.data.omniroute.hasUpdate && message.data.omniroute.release) {
                    parts.push(`OmniRoute ${message.data.omniroute.release.tag}`);
                }
                if (message.data.jevgraph && message.data.jevgraph.hasUpdate) {
                    parts.push(`JevGraph (${(message.data.jevgraph.release && message.data.jevgraph.release.tag) || 'GitHub'})`);
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
    if (!initialCheckCompleted && initialLoadingOverlay) {
        initialCheckCompleted = true;

        // Apply definitive verified or missing status color to each upstream tag
        const tagMap = {
            'rtk': Boolean(data.installed),
            'headroom': Boolean(data.headroomInstalled),
            'ponytail': Boolean(data.ponytailInstalled),
            'antislop': Boolean(data.antiSlopInstalled),
            'omniroute': Boolean(data.omniRouteInstalled),
            'jevgraph': Boolean(data.jevGraphInstalled),
            'codegraph': Boolean(data.codeGraphInstalled),
            'crw': Boolean(data.crwInstalled),
            'lightpanda': Boolean(data.lightpandaInstalled)
        };

        Object.entries(tagMap).forEach(([id, isInstalled]) => {
            const tagEl = document.querySelector(`.initial-loading-tag[data-upstream-id="${id}"]`);
            if (tagEl) {
                tagEl.classList.remove('checking');
                tagEl.classList.add(isInstalled ? 'verified' : 'missing');
                tagEl.innerHTML = `${isInstalled ? '✓' : '✗'} ${tagEl.textContent.replace(/^[✓✗]\s*/, '')}`;
            }
        });

        if (initialLoadingDesc) {
            initialLoadingDesc.textContent = 'Initial check complete. Synchronizing dashboard view...';
        }

        // Smooth auto fade-out: guarantees exactly 3.5 seconds TOTAL on-screen time (including checking process)
        // so users get adequate time to read the sponsor notice without artificial lag
        const elapsedMs = Date.now() - initialOverlayStartTime;
        const remainingDelayMs = Math.max(1200, 3500 - elapsedMs);

        setTimeout(() => {
            if (initialLoadingOverlay) {
                initialLoadingOverlay.classList.add('fade-out');
                setTimeout(() => {
                    if (initialLoadingOverlay) {
                        initialLoadingOverlay.style.display = 'none';
                    }
                }, 500);
            }
        }, remainingDelayMs);
    }

    const { isEnabled, installed, version, binaryPath, metrics, scope, ideStatus, isSidebar } = data;

    isSidebarMode = !!isSidebar;
    dashboardContainer.classList.toggle('is-sidebar', isSidebarMode);
    document.body.classList.toggle('is-sidebar', isSidebarMode);

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

    // Status Pill (if present) & Token Saver Master Button
    if (statusPill && statusText) {
        if (isEnabled) {
            statusPill.className = 'status-pill active';
            statusText.textContent = 'TOKEN SAVER ACTIVE';
        } else {
            statusPill.className = 'status-pill inactive';
            statusText.textContent = 'TOKEN SAVER INACTIVE';
        }
    }
    // RTK Header Button
    if (toggleRtkBtn) {
        const isRtkInstalled = Boolean(installed);
        const isRtkOn = Boolean(isEnabled) && isRtkInstalled;
        if (isRtkOn) {
            toggleRtkBtn.textContent = 'RTK ON';
            toggleRtkBtn.className = 'btn btn-primary';
            toggleRtkBtn.title = 'RTK CLI transparent command compression proxy is active';
        } else {
            toggleRtkBtn.textContent = 'RTK OFF';
            toggleRtkBtn.className = 'btn btn-ghost';
            toggleRtkBtn.title = !isRtkInstalled ? 'RTK CLI is not installed locally' : 'RTK CLI token compression is paused';
        }
    }
    if (isEnabled) {
        toggleModeBtn.textContent = 'Token Saver ON';
        toggleModeBtn.className = 'btn btn-primary';
    } else {
        toggleModeBtn.textContent = 'Token Saver OFF';
        toggleModeBtn.className = 'btn btn-ghost';
    }

    // Headroom Button
    if (toggleHeadroomBtn) {
        const hrInstalled = Boolean(data.headroomInstalled);
        const isHeadroom = Boolean(data.headroomEnabled) && hrInstalled;
        if (isHeadroom) {
            toggleHeadroomBtn.textContent = 'Headroom ON';
            toggleHeadroomBtn.className = 'btn btn-primary';
            toggleHeadroomBtn.title = 'Headroom context compression is active';
        } else {
            toggleHeadroomBtn.textContent = 'Headroom OFF';
            toggleHeadroomBtn.className = 'btn btn-ghost';
            toggleHeadroomBtn.title = !hrInstalled ? 'Headroom is not installed locally' : 'Headroom is disabled';
        }
    }

    // Ponytail Button in Header
    if (togglePonytailBtn) {
        const pInstalled = Boolean(data.ponytailInstalled);
        const isPonytail = ((data.ponytailMode || 'full') !== 'off') && pInstalled;
        if (isPonytail) {
            togglePonytailBtn.textContent = 'Ponytail ON';
            togglePonytailBtn.className = 'btn btn-primary';
            togglePonytailBtn.title = 'Ponytail token saving is active';
        } else {
            togglePonytailBtn.textContent = 'Ponytail OFF';
            togglePonytailBtn.className = 'btn btn-ghost';
            togglePonytailBtn.title = !pInstalled ? 'Ponytail skills are not synced locally' : 'Ponytail mode is off';
        }
    }

    // Anti-Slop Button in Header
    if (toggleAntiSlopBtn) {
        const aInstalled = Boolean(data.antiSlopInstalled);
        const isAntiSlop = Boolean(data.antiSlopEnabled !== false && (data.antiSlopMode || 'during') !== 'off') && aInstalled;
        if (isAntiSlop) {
            toggleAntiSlopBtn.textContent = 'Anti-Slop ON';
            toggleAntiSlopBtn.className = 'btn btn-primary';
            toggleAntiSlopBtn.title = 'Anti-Slop token filter is active';
        } else {
            toggleAntiSlopBtn.textContent = 'Anti-Slop OFF';
            toggleAntiSlopBtn.className = 'btn btn-ghost';
            toggleAntiSlopBtn.title = !aInstalled ? 'Anti-Slop skills are not synced locally' : 'Anti-Slop filter is disabled';
        }
    }

    // OmniRoute Button in Header
    if (toggleOmniRouteBtn) {
        const omniInstalled = Boolean(data.omniRouteInstalled || data.omniRouteRunning);
        const isOmni = Boolean(data.omniRouteEnabled) && omniInstalled;
        if (isOmni) {
            toggleOmniRouteBtn.textContent = 'OmniRoute ON';
            toggleOmniRouteBtn.className = 'btn btn-primary';
            toggleOmniRouteBtn.title = data.omniRouteRunning ? 'OmniRoute AI Gateway is running' : 'OmniRoute is enabled';
        } else {
            toggleOmniRouteBtn.textContent = 'OmniRoute OFF';
            toggleOmniRouteBtn.className = 'btn btn-ghost';
            toggleOmniRouteBtn.title = !omniInstalled ? 'OmniRoute is not installed locally' : 'OmniRoute is disabled';
        }
    }

    // JevGraph Button in Header
    if (toggleJevGraphBtn) {
        const jInstalled = Boolean(data.jevGraphInstalled);
        const isJev = Boolean(data.jevGraphEnabled) && jInstalled;
        if (isJev) {
            toggleJevGraphBtn.textContent = 'JevGraph ON';
            toggleJevGraphBtn.className = 'btn btn-primary';
            toggleJevGraphBtn.title = 'JevGraph knowledge graph optimization is active';
        } else {
            toggleJevGraphBtn.textContent = 'JevGraph OFF';
            toggleJevGraphBtn.className = 'btn btn-ghost';
            toggleJevGraphBtn.title = !jInstalled ? 'JevGraph is not installed locally' : 'JevGraph is disabled';
        }
    }

    // CodeGraph Button in Header
    if (toggleCodeGraphBtn) {
        const cgInstalled = Boolean(data.codeGraphInstalled);
        const isCodeGraph = Boolean(data.codeGraphEnabled) && cgInstalled;
        if (isCodeGraph) {
            toggleCodeGraphBtn.textContent = 'CodeGraph ON';
            toggleCodeGraphBtn.className = 'btn btn-primary';
            toggleCodeGraphBtn.title = 'CodeGraphContext semantic code graph is active';
        } else {
            toggleCodeGraphBtn.textContent = 'CodeGraph OFF';
            toggleCodeGraphBtn.className = 'btn btn-ghost';
            toggleCodeGraphBtn.title = !cgInstalled ? 'CodeGraphContext is not installed locally' : 'CodeGraphContext is disabled';
        }
    }

    // Hybrid Web Button in Header
    const hybridBtn = toggleHybridWebBtn || toggleCrwBtn;
    if (hybridBtn) {
        const hwInstalled = Boolean(data.crwInstalled || data.lightpandaInstalled);
        const isHybridEnabled = data.hybridWebEnabled !== undefined ? Boolean(data.hybridWebEnabled) : Boolean(data.crwEnabled);
        const crwActive = Boolean(data.crwInstalled) && (data.crwEnabled !== false);
        const lpActive = Boolean(data.lightpandaInstalled) && (data.lightpandaEnabled !== false);
        const isHybrid = isHybridEnabled && (crwActive || lpActive);
        if (isHybrid) {
            hybridBtn.textContent = 'Hybrid Web ON';
            hybridBtn.className = 'btn btn-primary';
            hybridBtn.title = 'Hybrid Web research engine (fastCRW / Lightpanda) is active';
        } else {
            hybridBtn.textContent = 'Hybrid Web OFF';
            hybridBtn.className = 'btn btn-ghost';
            hybridBtn.title = !hwInstalled ? 'fastCRW / Lightpanda is not installed locally' : 'Hybrid Web is disabled';
        }
    }

    // ECC Button in Header
    if (toggleEccBtn) {
        const eccInstalled = Boolean(data.eccInstalled);
        const isEcc = Boolean(data.eccEnabled) && eccInstalled;
        if (isEcc) {
            toggleEccBtn.textContent = 'ECC ON';
            toggleEccBtn.className = 'btn btn-primary';
            toggleEccBtn.title = 'ECC strategic compaction & context keeper optimization is active';
        } else {
            toggleEccBtn.textContent = 'ECC OFF';
            toggleEccBtn.className = 'btn btn-ghost';
            toggleEccBtn.title = !eccInstalled ? 'ECC is not installed locally' : 'ECC is disabled';
        }
    }

    if (footerVersionBadge && data.extensionVersion) {
        footerVersionBadge.textContent = 'v' + data.extensionVersion;
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

    // Multi-Channel Savings Breakdown & Command Chart
    currentCommandBreakdown = (metrics && metrics.commandBreakdown) || [];
    currentMultiChannelData = data.multiChannelBreakdown || null;
    renderMultiChannelBreakdown(currentMultiChannelData, currentActiveChannel);

    // Raw Output text snippet
    rawOutputText.textContent = metrics.rawText || 'No output recorded yet.';

    // Setup Hub Alert Banner Rendering
    const isRtkMissing = !installed;
    const isHeadroomMissing = !data.headroomInstalled;
    const isPonytailMissing = !data.ponytailInstalled;
    const isAntiSlopMissing = !data.antiSlopInstalled;
    const isOmniMissing = !data.omniRouteInstalled && !data.omniRouteRunning;
    const isJevGraphMissing = !data.jevGraphInstalled;
    const isCodeGraphMissing = !data.codeGraphInstalled;
    const isCrwMissing = !data.crwInstalled;
    const isLightpandaMissing = !data.lightpandaInstalled;
    const isEccMissing = !data.eccInstalled;
    const isAnyMissing = isRtkMissing || isHeadroomMissing || isPonytailMissing || isAntiSlopMissing || isOmniMissing || isJevGraphMissing || isCodeGraphMissing || isCrwMissing || isLightpandaMissing || isEccMissing;

    if (setupBanner) {
        if (isAnyMissing) {
            setupBanner.style.display = 'flex';
            if (setupMissingTags) {
                const chips = [];
                if (isOmniMissing) {
                    chips.push('<button type="button" class="missing-chip chip-purple" data-element="omniroute" data-name="OmniRoute" title="Click to copy AI prompt to install OmniRoute" style="background: rgba(175, 82, 222, 0.15); color: #d28cff; border: 1px solid rgba(175, 82, 222, 0.3);"><span class="chip-content">🌐 OmniRoute Missing</span> <span class="chip-action-tag">📋 Copy AI Prompt</span></button>');
                }
                if (isRtkMissing) {
                    chips.push('<button type="button" class="missing-chip chip-rose" data-element="rtk" data-name="RTK CLI" title="Click to copy AI prompt to install RTK CLI"><span class="chip-content">⚡ RTK CLI Missing</span> <span class="chip-action-tag">📋 Copy AI Prompt</span></button>');
                }
                if (isHeadroomMissing) {
                    chips.push('<button type="button" class="missing-chip chip-amber" data-element="headroom" data-name="Headroom" title="Click to copy AI prompt to install Headroom"><span class="chip-content">📦 Headroom Missing</span> <span class="chip-action-tag">📋 Copy AI Prompt</span></button>');
                }
                if (isPonytailMissing) {
                    chips.push('<button type="button" class="missing-chip chip-cyan" data-element="ponytail" data-name="Ponytail" title="Click to copy AI prompt to install Ponytail"><span class="chip-content">🥋 Ponytail GitHub Missing</span> <span class="chip-action-tag">📋 Copy AI Prompt</span></button>');
                }
                if (isAntiSlopMissing) {
                    chips.push('<button type="button" class="missing-chip chip-cyan" data-element="antislop" data-name="Anti-Slop" title="Click to copy AI prompt to install Anti-Slop" style="background: rgba(48, 209, 88, 0.15); color: #30d158; border: 1px solid rgba(48, 209, 88, 0.3);"><span class="chip-content">🛡️ Anti-Slop Missing</span> <span class="chip-action-tag">📋 Copy AI Prompt</span></button>');
                }
                if (isJevGraphMissing) {
                    chips.push('<button type="button" class="missing-chip chip-teal" data-element="jevgraph" data-name="JevGraph" title="Click to copy AI prompt to install JevGraph" style="background: rgba(48, 176, 199, 0.15); color: #30b0c7; border: 1px solid rgba(48, 176, 199, 0.3);"><span class="chip-content">🕸️ JevGraph Missing</span> <span class="chip-action-tag">📋 Copy AI Prompt</span></button>');
                }
                if (isCodeGraphMissing) {
                    chips.push('<button type="button" class="missing-chip chip-cyan" data-element="codegraph" data-name="CodeGraphContext" title="Click to copy AI prompt to install CodeGraphContext" style="background: rgba(0, 122, 255, 0.15); color: #5ac8fa; border: 1px solid rgba(0, 122, 255, 0.3);"><span class="chip-content">🧬 CodeGraph Missing</span> <span class="chip-action-tag">📋 Copy AI Prompt</span></button>');
                }
                if (isCrwMissing) {
                    chips.push('<button type="button" class="missing-chip chip-orange" data-element="fastcrw" data-name="fastCRW" title="Click to copy AI prompt to install fastCRW"><span class="chip-content">🕷️ fastCRW Missing</span> <span class="chip-action-tag">📋 Copy AI Prompt</span></button>');
                }
                if (isLightpandaMissing) {
                    chips.push('<button type="button" class="missing-chip chip-cyan" data-element="lightpanda" data-name="Lightpanda Browser" title="Click to copy AI prompt to install Lightpanda" style="background: rgba(255, 149, 0, 0.15); color: #ff9f0a; border: 1px solid rgba(255, 149, 0, 0.3);"><span class="chip-content">🐼 Lightpanda Missing</span> <span class="chip-action-tag">📋 Copy AI Prompt</span></button>');
                }
                if (isEccMissing) {
                    chips.push('<button type="button" class="missing-chip chip-cyan" data-element="ecc" data-name="ECC" title="Click to copy AI prompt to install ECC" style="background: rgba(100, 210, 255, 0.15); color: #64d2ff; border: 1px solid rgba(100, 210, 255, 0.3);"><span class="chip-content">🧠 ECC Missing</span> <span class="chip-action-tag">📋 Copy AI Prompt</span></button>');
                }
                setupMissingTags.innerHTML = chips.join('');
            }
            if (setupBannerDesc) {
                const missingNames = [];
                if (isOmniMissing) missingNames.push('OmniRoute Gateway');
                if (isRtkMissing) missingNames.push('RTK CLI');
                if (isHeadroomMissing) missingNames.push('Headroom');
                if (isPonytailMissing) missingNames.push('Ponytail YAGNI');
                if (isAntiSlopMissing) missingNames.push('Anti-Slop');
                if (isJevGraphMissing) missingNames.push('JevGraph KG');
                if (isCodeGraphMissing) missingNames.push('CodeGraphContext');
                if (isCrwMissing) missingNames.push('fastCRW Scraper');
                if (isLightpandaMissing) missingNames.push('Lightpanda Browser');
                if (isEccMissing) missingNames.push('ECC Pruner');
                setupBannerDesc.textContent = `Fetch & install ${missingNames.join(' & ')} to slash token consumption, prevent AI slop, route multi-model traffic, build knowledge graphs from specs, hybridize web search, and strategically compact context.`;
            }
            if (setupInstallPathInput && document.activeElement !== setupInstallPathInput) {
                setupInstallPathInput.value = data.upstreamInstallPath || '';
                if (setupSavePathBtn) {
                    setupSavePathBtn.style.display = 'none';
                }
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
        if (data.detectedIde && data.detectedIde.id && currentOmniPresets[data.detectedIde.id]) {
            if (!activeOmniIde || activeOmniIde === 'antigravity' || activeOmniIde === 'cursor') {
                activeOmniIde = data.detectedIde.id;
            }
        }
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

    // Helper function to update action button between Uninstall (🗑️) and Recover (♻️)
    function updateDiagActionButton(btn, isInstalled, layerName) {
        if (!btn) return;
        btn.style.display = 'inline-block';
        if (isInstalled) {
            btn.dataset.mode = 'uninstall';
            btn.className = 'btn-diag-mini btn-diag-trash';
            btn.textContent = '🗑️';
            btn.title = `Uninstall ${layerName} to OS Recycle Bin`;
        } else {
            btn.dataset.mode = 'recover';
            btn.className = 'btn-diag-mini btn-diag-recover';
            btn.textContent = '♻️ Recover';
            btn.title = `Recover ${layerName} from Restore Point or GitHub`;
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
    updateDiagActionButton(omniDiagUninstallBtn, omniInstalled, 'OmniRoute');

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
        updateDiagActionButton(rtkDiagUninstallBtn, installed, 'RTK CLI');
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
        updateDiagActionButton(headroomDiagUninstallBtn, hrInstalled, 'Headroom');
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
        updateDiagActionButton(ponytailDiagUninstallBtn, pInstalled, 'Ponytail');
    }

    if (diagAntiSlopStatus) {
        const aInstalled = data.antiSlopInstalled;
        const aMode = data.antiSlopMode || 'during';
        const aEnabled = data.antiSlopEnabled !== false;
        if (aInstalled && aEnabled && aMode !== 'off') {
            diagAntiSlopStatus.textContent = `Active (${data.antiSlopSkillsCount || 6}/6 skills)`;
            diagAntiSlopStatus.style.color = 'var(--accent-green)';
        } else if (aInstalled && (!aEnabled || aMode === 'off')) {
            diagAntiSlopStatus.textContent = 'Inactive (Mode Off)';
            diagAntiSlopStatus.style.color = 'var(--text-muted)';
        } else {
            diagAntiSlopStatus.textContent = 'Inactive (Not Synced)';
            diagAntiSlopStatus.style.color = 'var(--accent-amber)';
        }
    }
    if (antiSlopDiagActions) {
        antiSlopDiagActions.style.display = 'inline-flex';
        const aInstalled = Boolean(data.antiSlopInstalled);
        if (antiSlopDiagAiBtn) antiSlopDiagAiBtn.style.display = aInstalled ? 'none' : 'inline-block';
        if (antiSlopDiagSyncBtn) antiSlopDiagSyncBtn.style.display = aInstalled ? 'none' : 'inline-block';
        updateDiagActionButton(antiSlopDiagUninstallBtn, aInstalled, 'Anti-Slop');
    }

    if (diagJevGraphStatus) {
        const jInstalled = data.jevGraphInstalled;
        const jEnabled = data.jevGraphEnabled !== false;
        const jProvider = data.jevGraphProvider || 'keyword';
        if (jInstalled && jEnabled) {
            diagJevGraphStatus.textContent = `Active (${jProvider})`;
            diagJevGraphStatus.style.color = 'var(--accent-green)';
        } else if (jInstalled && !jEnabled) {
            diagJevGraphStatus.textContent = 'Inactive (Disabled)';
            diagJevGraphStatus.style.color = 'var(--text-muted)';
        } else {
            diagJevGraphStatus.textContent = 'Inactive (Not Installed)';
            diagJevGraphStatus.style.color = 'var(--accent-amber)';
        }
    }
    if (jevGraphDiagActions) {
        jevGraphDiagActions.style.display = 'inline-flex';
        const jInstalled = Boolean(data.jevGraphInstalled);
        if (jevGraphDiagAiBtn) jevGraphDiagAiBtn.style.display = jInstalled ? 'none' : 'inline-block';
        if (jevGraphDiagSyncBtn) jevGraphDiagSyncBtn.style.display = jInstalled ? 'none' : 'inline-block';
        updateDiagActionButton(jevGraphDiagUninstallBtn, jInstalled, 'JevGraph');
    }

    if (diagCodeGraphStatus) {
        const cgInstalled = Boolean(data.codeGraphInstalled);
        const cgEnabled = data.codeGraphEnabled !== false;
        const cgVer = data.codeGraphVersion || 'Ready';
        if (cgInstalled && cgEnabled) {
            diagCodeGraphStatus.textContent = `Active (${cgVer})`;
            diagCodeGraphStatus.style.color = 'var(--accent-green)';
        } else if (cgInstalled && !cgEnabled) {
            diagCodeGraphStatus.textContent = 'Inactive (Disabled)';
            diagCodeGraphStatus.style.color = 'var(--text-muted)';
        } else {
            diagCodeGraphStatus.textContent = 'Inactive (Not Installed)';
            diagCodeGraphStatus.style.color = 'var(--accent-amber)';
        }
    }
    if (codeGraphDiagActions) {
        codeGraphDiagActions.style.display = 'inline-flex';
        const cgInstalled = Boolean(data.codeGraphInstalled);
        if (codeGraphDiagAiBtn) codeGraphDiagAiBtn.style.display = cgInstalled ? 'none' : 'inline-block';
        if (codeGraphDiagSyncBtn) codeGraphDiagSyncBtn.style.display = cgInstalled ? 'none' : 'inline-block';
        updateDiagActionButton(codeGraphDiagUninstallBtn, cgInstalled, 'CodeGraphContext');
    }

    if (diagCrwStatus) {
        const crwInstalled = Boolean(data.crwInstalled);
        const crwEnabled = data.crwEnabled !== false;
        const crwVer = data.crwVersion || 'Ready';
        if (crwInstalled && crwEnabled) {
            diagCrwStatus.textContent = `Active (${crwVer})`;
            diagCrwStatus.style.color = 'var(--accent-green)';
        } else if (crwInstalled && !crwEnabled) {
            diagCrwStatus.textContent = 'Inactive (Disabled)';
            diagCrwStatus.style.color = 'var(--text-muted)';
        } else {
            diagCrwStatus.textContent = 'Inactive (Not Installed)';
            diagCrwStatus.style.color = 'var(--accent-amber)';
        }
    }
    if (crwDiagActions) {
        crwDiagActions.style.display = 'inline-flex';
        const crwInstalled = Boolean(data.crwInstalled);
        if (crwDiagAiBtn) crwDiagAiBtn.style.display = crwInstalled ? 'none' : 'inline-block';
        if (crwDiagSyncBtn) crwDiagSyncBtn.style.display = crwInstalled ? 'none' : 'inline-block';
        updateDiagActionButton(crwDiagUninstallBtn, crwInstalled, 'fastCRW');
    }

    if (diagLightpandaStatus) {
        const lpInstalled = Boolean(data.lightpandaInstalled);
        const lpEnabled = data.lightpandaEnabled !== false;
        const lpVer = data.lightpandaVersion || 'Ready';
        if (lpInstalled && lpEnabled) {
            diagLightpandaStatus.textContent = `Active (${lpVer})`;
            diagLightpandaStatus.style.color = 'var(--accent-green)';
        } else if (lpInstalled && !lpEnabled) {
            diagLightpandaStatus.textContent = 'Inactive (Disabled)';
            diagLightpandaStatus.style.color = 'var(--text-muted)';
        } else {
            diagLightpandaStatus.textContent = 'Inactive (Not Installed)';
            diagLightpandaStatus.style.color = 'var(--accent-amber)';
        }
    }
    if (lightpandaDiagActions) {
        lightpandaDiagActions.style.display = 'inline-flex';
        const lpInstalled = Boolean(data.lightpandaInstalled);
        if (lightpandaDiagAiBtn) lightpandaDiagAiBtn.style.display = lpInstalled ? 'none' : 'inline-block';
        if (lightpandaDiagSyncBtn) lightpandaDiagSyncBtn.style.display = lpInstalled ? 'none' : 'inline-block';
        updateDiagActionButton(lightpandaDiagUninstallBtn, lpInstalled, 'Lightpanda');
    }

    if (diagEccStatus) {
        const eccInstalled = Boolean(data.eccInstalled);
        const eccEnabled = data.eccEnabled !== false;
        const eccVer = data.eccVersion || 'Ready';
        if (eccInstalled && eccEnabled) {
            diagEccStatus.textContent = `Active (${eccVer})`;
            diagEccStatus.style.color = 'var(--accent-green)';
        } else if (eccInstalled && !eccEnabled) {
            diagEccStatus.textContent = 'Inactive (Disabled)';
            diagEccStatus.style.color = 'var(--text-muted)';
        } else {
            diagEccStatus.textContent = 'Inactive (Not Installed)';
            diagEccStatus.style.color = 'var(--accent-amber)';
        }
    }
    if (eccDiagActions) {
        eccDiagActions.style.display = 'inline-flex';
        const eccInstalled = Boolean(data.eccInstalled);
        if (eccDiagAiBtn) eccDiagAiBtn.style.display = eccInstalled ? 'none' : 'inline-block';
        if (eccDiagSyncBtn) eccDiagSyncBtn.style.display = eccInstalled ? 'none' : 'inline-block';
        updateDiagActionButton(eccDiagUninstallBtn, eccInstalled, 'ECC');
    }

    if (eccActiveBadge) {
        const eccInstalled = Boolean(data.eccInstalled);
        const eccEnabled = data.eccEnabled !== false;
        if (eccInstalled && eccEnabled) {
            eccActiveBadge.textContent = '🟢 ACTIVE';
            eccActiveBadge.className = 'panel-tag tag-cyan';
        } else if (eccInstalled && !eccEnabled) {
            eccActiveBadge.textContent = '⚪ DISABLED';
            eccActiveBadge.className = 'panel-tag';
        } else {
            eccActiveBadge.textContent = '⚠️ NOT DETECTED';
            eccActiveBadge.className = 'panel-tag tag-purple';
        }
    }
    if (eccCheckbox) {
        eccCheckbox.checked = data.eccEnabled !== false;
    }
    if (eccAutoCompactToggle) {
        eccAutoCompactToggle.checked = data.eccAutoCompactEnabled !== false;
    }
    if (eccAutoCkToggle) {
        eccAutoCkToggle.checked = data.eccAutoCkEnabled !== false;
    }
    if (eccAutoCouncilToggle) {
        eccAutoCouncilToggle.checked = data.eccAutoCouncilEnabled !== false;
    }

    if (jevStatusBadge) {
        const jInstalled = data.jevGraphInstalled;
        const jEnabled = data.jevGraphEnabled !== false;
        const jProvider = data.jevGraphProvider || 'keyword';
        if (jInstalled && jEnabled) {
            jevStatusBadge.textContent = `🟢 READY (${jProvider.toUpperCase()})`;
            jevStatusBadge.className = 'panel-tag tag-teal';
        } else if (jInstalled && !jEnabled) {
            jevStatusBadge.textContent = '⚪ DISABLED';
            jevStatusBadge.className = 'panel-tag';
        } else {
            jevStatusBadge.textContent = '⚠️ NOT DETECTED';
            jevStatusBadge.className = 'panel-tag tag-purple';
        }
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

    const disabledSkillsBadge = document.getElementById('disabledSkillsBadge');
    const disabledSkillsBadgeText = document.getElementById('disabledSkillsBadgeText');
    const disableSkillsSub = document.getElementById('disableSkillsSub');
    if (disabledSkillsBadge) {
        const count = data.disabledSkillsCount || 0;
        if (count > 0) {
            disabledSkillsBadge.className = 'action-status-badge badge-warning';
            if (disabledSkillsBadgeText) disabledSkillsBadgeText.textContent = `${count} Disabled`;
            if (disableSkillsSub) disableSkillsSub.textContent = `${count} skill(s) quarantined (hidden from @ and /)`;
        } else {
            disabledSkillsBadge.className = 'action-status-badge';
            if (disabledSkillsBadgeText) disabledSkillsBadgeText.textContent = 'Manage';
            if (disableSkillsSub) disableSkillsSub.textContent = 'Agent Decide / Manual / Re-Enable';
        }
    }

    // Upstream GitHub Installed Versions breakdown
    const upstreamLayers = [
        {
            key: 'rtk',
            name: 'RTK CLI Core',
            icon: '⚡',
            repo: 'rtk-ai/rtk',
            version: installed ? version : 'Not installed',
            isInstalled: Boolean(installed),
            isEnabled: isEnabled !== false,
            isActive: Boolean(installed) && (isEnabled !== false)
        },
        {
            key: 'headroom',
            name: 'Headroom (CCR)',
            icon: '🧱',
            repo: 'headroomlabs-ai/headroom',
            version: data.headroomInstalled ? data.headroomVersion : 'Not installed',
            isInstalled: Boolean(data.headroomInstalled),
            isEnabled: data.headroomEnabled !== false,
            isActive: Boolean(data.headroomInstalled) && (data.headroomEnabled !== false)
        },
        {
            key: 'ponytail',
            name: 'Ponytail (YAGNI)',
            icon: '🥋',
            repo: 'DietrichGebert/ponytail',
            version: data.ponytailInstalled ? `${data.ponytailVersion || 'v1.0.0'} (${data.ponytailSkillsCount || 6}/6 skills)` : 'Not synced',
            isInstalled: Boolean(data.ponytailInstalled),
            isEnabled: true,
            isActive: Boolean(data.ponytailInstalled)
        },
        {
            key: 'antislop',
            name: 'Anti-Slop Suite',
            icon: '🛡️',
            repo: 'miqdadbadjuber/anti-slop',
            version: data.antiSlopInstalled ? `${data.antiSlopVersion || 'v3.2.20'} (${data.antiSlopSkillsCount || 6}/6 skills)` : 'Not synced',
            isInstalled: Boolean(data.antiSlopInstalled),
            isEnabled: data.antiSlopEnabled !== false,
            isActive: Boolean(data.antiSlopInstalled) && (data.antiSlopEnabled !== false)
        },
        {
            key: 'omniroute',
            name: 'OmniRoute Gateway',
            icon: '🌐',
            repo: 'diegosouzapw/OmniRoute',
            version: data.omniRouteInstalled ? `${data.omniRouteVersion || 'Ready'} (:20128)` : 'Not installed',
            isInstalled: Boolean(data.omniRouteInstalled),
            isEnabled: Boolean(data.omniRouteRunning),
            isActive: Boolean(data.omniRouteInstalled) && Boolean(data.omniRouteRunning)
        },
        {
            key: 'jevgraph',
            name: 'JevGraph (Doc KG)',
            icon: '🕸️',
            repo: 'chenmingtang830/jevgraph',
            version: data.jevGraphInstalled ? `${data.jevGraphVersion || 'Ready'} (${data.jevGraphProvider || 'keyword'})` : 'Not installed',
            isInstalled: Boolean(data.jevGraphInstalled),
            isEnabled: data.jevGraphEnabled !== false,
            isActive: Boolean(data.jevGraphInstalled) && (data.jevGraphEnabled !== false)
        },
        {
            key: 'codegraph',
            name: 'CodeGraphContext (Code AST)',
            icon: '🧬',
            repo: 'CodeGraphContext/CodeGraphContext',
            version: data.codeGraphInstalled ? `${data.codeGraphVersion || 'Ready'} (cgc)` : 'Not installed',
            isInstalled: Boolean(data.codeGraphInstalled),
            isEnabled: data.codeGraphEnabled !== false,
            isActive: Boolean(data.codeGraphInstalled) && (data.codeGraphEnabled !== false)
        },
        {
            key: 'crw',
            name: 'fastCRW (Web Scraper & Search)',
            icon: '🕷️',
            repo: 'fastcrw/crw',
            version: data.crwInstalled ? `${data.crwVersion || 'Ready'} (crw)` : 'Not installed',
            isInstalled: Boolean(data.crwInstalled),
            isEnabled: data.crwEnabled !== false,
            isActive: Boolean(data.crwInstalled) && (data.crwEnabled !== false)
        },
        {
            key: 'lightpanda',
            name: 'Lightpanda Browser (Dynamic JS MCP)',
            icon: '🐼',
            repo: 'lightpanda-io/browser',
            version: data.lightpandaInstalled ? `${data.lightpandaVersion || 'Ready'} (lightpanda)` : 'Not installed',
            isInstalled: Boolean(data.lightpandaInstalled),
            isEnabled: data.lightpandaEnabled !== false,
            isActive: Boolean(data.lightpandaInstalled) && (data.lightpandaEnabled !== false)
        },
        {
            key: 'ecc',
            name: 'ECC Harness Optimization',
            icon: '🧠',
            repo: 'affaan-m/ECC',
            version: data.eccInstalled ? `${data.eccVersion || 'Ready'} (${data.eccSkillsCount || 4}/4 skills)` : 'Not synced',
            isInstalled: Boolean(data.eccInstalled),
            isEnabled: data.eccEnabled !== false,
            isActive: Boolean(data.eccInstalled) && (data.eccEnabled !== false)
        }
    ];

    const activeLayersCount = upstreamLayers.filter(l => l.isActive).length;
    const installedLayersCount = upstreamLayers.filter(l => l.isInstalled).length;

    if (diagVersionSummary) {
        diagVersionSummary.textContent = `${activeLayersCount}/${upstreamLayers.length} Layers Active`;
        diagVersionSummary.title = `${activeLayersCount} active, ${installedLayersCount} installed out of ${upstreamLayers.length} total layers`;
    }

    if (diagVersionDropdown) {
        diagVersionDropdown.innerHTML = upstreamLayers.map(l => {
            const statusLabel = !l.isInstalled ? 'Missing' : (l.isActive ? 'Active' : 'Disabled');
            const badgeClass = !l.isInstalled ? 'badge-muted' : (l.isActive ? 'badge-green' : 'badge-amber');
            return `
            <div class="diag-dropdown-item ${l.isActive ? 'item-active' : (l.isInstalled ? 'item-disabled' : 'item-inactive')}">
                <div class="dropdown-item-top">
                    <span class="dropdown-item-name">${l.icon} <strong>${l.name}</strong></span>
                    <span class="dropdown-item-badge ${badgeClass}">${statusLabel}</span>
                </div>
                <div class="dropdown-item-sub">
                    <span class="dropdown-item-ver">${l.version}</span>
                    <a href="https://github.com/${l.repo}" target="_blank" class="dropdown-item-repo" title="Upstream GitHub: ${l.repo}">${l.repo} ↗</a>
                </div>
            </div>
        `;
        }).join('');
    }

    if (diagVersion) {
        const verList = upstreamLayers.filter(l => l.isInstalled).map(l => `${l.name}: ${l.version}`);
        diagVersion.textContent = verList.length > 0 ? verList.join(' • ') : 'None detected';
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
        : 27;
    const skillsCount = (typeof data.skillsInstalled === 'object' && data.skillsInstalled !== null)
        ? data.skillsInstalled.count
        : (isSkillsInstalled ? skillsTotal : 0);

    if (skillsStatusBadge) {
        if (isSkillsInstalled) {
            skillsStatusBadge.className = 'action-status-badge synced';
            skillsStatusBadge.innerHTML = '<span class="badge-icon">✓</span> <span class="badge-text">Active</span>';
            skillsStatusBadge.title = `Chat skills active (${skillsCount}/${skillsTotal} skills installed in IDE)`;
            if (skillsSubText) {
                skillsSubText.textContent = `✓ /rtk-*, /ponytail & /antislop ready (${skillsCount}/${skillsTotal} active)`;
            }
        } else {
            skillsStatusBadge.className = 'action-status-badge install';
            skillsStatusBadge.innerHTML = '<span class="badge-text">+ Install</span>';
            skillsStatusBadge.title = `Click to install all ${skillsTotal} chat skills in IDE`;
            if (skillsSubText) {
                skillsSubText.textContent = `Install all ${skillsTotal} chat skills (/rtk-*, /ponytail, /antislop)`;
            }
        }
    }

    // Weekly Auto Sync Option State
    if (weeklySyncCheckbox && data.weeklyAutoSync !== undefined) {
        weeklySyncCheckbox.checked = Boolean(data.weeklyAutoSync);
    }

    // RTK Status Badge
    if (rtkStatusBadge) {
        if (installed && isEnabled) {
            rtkStatusBadge.textContent = `Active (${version || 'Ready'})`;
            rtkStatusBadge.className = 'panel-tag tag-orange';
        } else if (installed && !isEnabled) {
            rtkStatusBadge.textContent = 'Paused';
            rtkStatusBadge.className = 'panel-tag';
        } else {
            rtkStatusBadge.textContent = 'Not Installed';
            rtkStatusBadge.className = 'panel-tag tag-amber';
        }
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

    // Anti-Slop Framework State
    const aMode = data.antiSlopMode || 'during';
    const aEnabled = data.antiSlopEnabled !== false;
    if (antiSlopActiveBadge) {
        antiSlopActiveBadge.textContent = (!aEnabled || aMode === 'off') ? 'OFF' : `${aMode.toUpperCase()} Mode`;
        antiSlopActiveBadge.className = (!aEnabled || aMode === 'off') ? 'panel-tag' : 'panel-tag tag-cyan';
    }
    if (antiSlopSegmentGroup) {
        const btns = antiSlopSegmentGroup.querySelectorAll('.segment-btn');
        btns.forEach(b => {
            b.classList.toggle('active', b.dataset.mode === (aEnabled ? aMode : 'off'));
        });
    }
    if (antiSlopCheckbox && data.antiSlopEnabled !== undefined) {
        antiSlopCheckbox.checked = Boolean(data.antiSlopEnabled);
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

    // JevGraph Knowledge Graph State
    if (jevGraphCheckbox && data.jevGraphEnabled !== undefined) {
        jevGraphCheckbox.checked = Boolean(data.jevGraphEnabled);
    }
    const jProvider = data.jevGraphProvider || 'keyword';
    if (jevProviderSegmentGroup) {
        const btns = jevProviderSegmentGroup.querySelectorAll('.segment-btn');
        btns.forEach(b => {
            b.classList.toggle('active', b.dataset.provider === jProvider);
        });
    }

    // CodeGraphContext State
    if (codeGraphAutoWatchToggle && data.codeGraphAutoUpdate !== undefined) {
        codeGraphAutoWatchToggle.checked = Boolean(data.codeGraphAutoUpdate);
    }
    if (codeGraphStatusBadge && data.codeGraphStatus) {
        codeGraphStatusBadge.textContent = data.codeGraphStatus.installed ? 'Active & Ready' : 'Ready to Sync';
        codeGraphStatusBadge.className = data.codeGraphStatus.installed ? 'panel-tag tag-indigo' : 'panel-tag tag-amber';
    }

    // Hybrid Web (fastCRW + Lightpanda) State
    const isCrwInstalled = Boolean(data.crwInstalled);
    const isLpInstalled = Boolean(data.lightpandaInstalled);
    const isHybridEnabled = data.hybridWebEnabled !== undefined ? Boolean(data.hybridWebEnabled) : Boolean(data.crwEnabled);

    if (hybridWebStatusBadge || crwStatusBadge) {
        const badge = hybridWebStatusBadge || crwStatusBadge;
        if (isHybridEnabled && (isCrwInstalled || isLpInstalled)) {
            badge.textContent = `🟢 READY (${isCrwInstalled && isLpInstalled ? 'CRW + PANDA' : isCrwInstalled ? 'CRW ONLY' : 'PANDA ONLY'})`;
            badge.className = 'panel-tag tag-orange';
        } else if (!isHybridEnabled && (isCrwInstalled || isLpInstalled)) {
            badge.textContent = '⚪ DISABLED';
            badge.className = 'panel-tag';
        } else {
            badge.textContent = '⚠️ NOT DETECTED';
            badge.className = 'panel-tag tag-amber';
        }
    }

    if (crwSubStatus) {
        if (isCrwInstalled) {
            crwSubStatus.textContent = `Active (${data.crwVersion || 'Ready'})`;
            crwSubStatus.style.color = 'var(--accent-green)';
        } else {
            crwSubStatus.textContent = 'Not installed';
            crwSubStatus.style.color = 'var(--accent-amber)';
        }
    }

    if (lightpandaSubStatus) {
        if (isLpInstalled) {
            lightpandaSubStatus.textContent = `Active (${data.lightpandaVersion || 'Ready'})`;
            lightpandaSubStatus.style.color = 'var(--accent-green)';
        } else {
            lightpandaSubStatus.textContent = 'Not installed';
            lightpandaSubStatus.style.color = 'var(--accent-amber)';
        }
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
        syncBtn.textContent = ide.synced ? '⭮ Re-Sync Rule' : '⚡ Enable Rule';
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

function renderMultiChannelBreakdown(multiChannelData, activeTab = 'all') {
    if (!multiChannelData || !multiChannelData.channels) {
        return;
    }

    const { totalEcosystemFormatted, channels } = multiChannelData;

    // 1. Update Header Badge & Total
    if (distroTotalTokens) {
        distroTotalTokens.textContent = `${totalEcosystemFormatted} Tokens Saved`;
    }

    if (savingsBreakdownTag) {
        const activeCount = channels.filter(c => c.status === 'active' || c.status === 'synced').length;
        savingsBreakdownTag.textContent = `${activeCount} / ${channels.length} Channels Active`;
    }

    // 2. Render Proportional Multi-Channel Distribution Bar
    if (distroProgressTrack) {
        distroProgressTrack.innerHTML = '';
        channels.forEach(channel => {
            if (channel.sharePct > 0) {
                const seg = document.createElement('div');
                seg.className = 'channel-segment';
                seg.style.width = `${Math.max(channel.sharePct, 2)}%`;
                seg.style.backgroundColor = channel.color;
                seg.title = `${channel.name}: ${channel.savedFormatted} tokens (${channel.sharePct}% share)`;
                distroProgressTrack.appendChild(seg);
            }
        });
    }

    // 3. Render Distribution Legend
    if (distroLegend) {
        distroLegend.innerHTML = '';
        channels.forEach(channel => {
            const item = document.createElement('div');
            item.className = 'legend-item';

            const dot = document.createElement('span');
            dot.className = 'legend-dot';
            dot.style.backgroundColor = channel.color;

            const label = document.createElement('span');
            label.className = 'legend-label';
            label.textContent = channel.shortName;

            const val = document.createElement('span');
            val.className = 'legend-value';
            val.textContent = `${channel.savedFormatted} (${channel.sharePct}%)`;

            item.appendChild(dot);
            item.appendChild(label);
            item.appendChild(val);
            distroLegend.appendChild(item);
        });
    }

    // 4. Determine visible channels based on activeTab filter
    let visibleChannels = channels;
    if (activeTab === 'rtk') {
        visibleChannels = channels.filter(c => c.id === 'rtk');
    } else if (activeTab === 'headroom') {
        visibleChannels = channels.filter(c => c.id === 'headroom');
    } else if (activeTab === 'prompt') {
        visibleChannels = channels.filter(c => c.id === 'ponytail' || c.id === 'antiSlop');
    } else if (activeTab === 'omniRoute') {
        visibleChannels = channels.filter(c => c.id === 'omniRoute');
    } else if (activeTab === 'jevgraph') {
        visibleChannels = channels.filter(c => c.id === 'jevgraph');
    } else if (activeTab === 'crw' || activeTab === 'hybridweb') {
        visibleChannels = channels.filter(c => c.id === 'crw' || c.id === 'hybridweb');
    }

    // 5. Render Channels Grid Cards
    if (channelsGridContainer) {
        channelsGridContainer.innerHTML = '';
        visibleChannels.forEach(channel => {
            const card = document.createElement('div');
            card.className = 'channel-card';

            // Top row
            const top = document.createElement('div');
            top.className = 'channel-card-top';

            const titleGroup = document.createElement('div');
            titleGroup.className = 'channel-title-group';

            const iconBadge = document.createElement('div');
            iconBadge.className = 'channel-icon-badge';
            iconBadge.style.backgroundColor = `${channel.color}22`;
            iconBadge.style.color = channel.color;
            iconBadge.textContent = channel.icon;

            const textBlock = document.createElement('div');
            const nameEl = document.createElement('div');
            nameEl.className = 'channel-name';
            nameEl.textContent = channel.name;

            const layerEl = document.createElement('div');
            layerEl.className = 'channel-layer';
            layerEl.textContent = channel.layer;

            textBlock.appendChild(nameEl);
            textBlock.appendChild(layerEl);
            titleGroup.appendChild(iconBadge);
            titleGroup.appendChild(textBlock);

            const statusBadge = document.createElement('span');
            statusBadge.className = `channel-status-badge ${channel.status === 'active' ? 'active' : (channel.status === 'synced' ? 'synced' : 'offline')}`;
            statusBadge.textContent = channel.statusLabel;

            top.appendChild(titleGroup);
            top.appendChild(statusBadge);

            // Description
            const desc = document.createElement('div');
            desc.className = 'channel-desc';
            desc.textContent = channel.description;

            // Metrics Row
            const metricsRow = document.createElement('div');
            metricsRow.className = 'channel-metrics-row';

            const cellTokens = document.createElement('div');
            cellTokens.className = 'channel-metric-cell';
            cellTokens.innerHTML = `<span class="metric-lbl">Tokens Saved</span><span class="metric-val" style="color: ${channel.color}">${channel.savedFormatted}</span>`;

            const cellEff = document.createElement('div');
            cellEff.className = 'channel-metric-cell';
            cellEff.innerHTML = `<span class="metric-lbl">Efficiency</span><span class="metric-val">${channel.percentage}%</span>`;

            const cellDollars = document.createElement('div');
            cellDollars.className = 'channel-metric-cell';
            cellDollars.innerHTML = `<span class="metric-lbl">Est. ROI ($)</span><span class="metric-val" style="color: var(--apple-green)">${channel.dollarSavings}</span>`;

            metricsRow.appendChild(cellTokens);
            metricsRow.appendChild(cellEff);
            metricsRow.appendChild(cellDollars);

            card.appendChild(top);
            card.appendChild(desc);
            card.appendChild(metricsRow);

            // If RTK card: Render Command Compression List inside dropdown
            if (channel.id === 'rtk') {
                const dropdownWrap = document.createElement('div');
                dropdownWrap.className = 'channel-dropdown-wrap';

                const cmds = (Array.isArray(channel.commands) && channel.commands.length > 0) ? channel.commands : currentCommandBreakdown;
                const cmdCount = cmds ? cmds.length : 0;

                const toggle = document.createElement('div');
                toggle.className = 'channel-dropdown-toggle';
                toggle.innerHTML = `
                    <div class="dropdown-left">
                        <span class="dropdown-chevron">▾</span>
                        <span class="dropdown-title">⚡ Command Compression List</span>
                    </div>
                    <span class="dropdown-count">${cmdCount} Tools</span>
                `;

                const dropdownBody = document.createElement('div');
                dropdownBody.className = 'channel-dropdown-body';

                if (cmds && cmds.length > 0) {
                    cmds.forEach(item => {
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
                        dropdownBody.appendChild(row);
                    });
                } else {
                    dropdownBody.innerHTML = '<div style="color: var(--text-muted); font-size: 11px; text-align: center; padding: 6px;">Run commands with RTK to see per-tool compression here!</div>';
                }

                toggle.addEventListener('click', () => {
                    toggle.classList.toggle('collapsed');
                    dropdownBody.classList.toggle('collapsed');
                });

                dropdownWrap.appendChild(toggle);
                dropdownWrap.appendChild(dropdownBody);
                card.appendChild(dropdownWrap);
            }

            // Sub items list if present (for Headroom, Ponytail, Anti-Slop, OmniRoute)
            if (Array.isArray(channel.subItems) && channel.subItems.length > 0) {
                const subList = document.createElement('div');
                subList.className = 'channel-subitems-list';

                channel.subItems.forEach(sub => {
                    const subRow = document.createElement('div');
                    subRow.className = 'channel-subitem-row';
                    subRow.innerHTML = `<span class="subitem-name">${sub.name}</span><span class="subitem-pct">${sub.percentage}%</span>`;
                    subList.appendChild(subRow);
                });

                card.appendChild(subList);
            }

            channelsGridContainer.appendChild(card);
        });
    }
}

// Channel Tabs Click Listener Setup
if (channelTabsBar) {
    channelTabsBar.querySelectorAll('.channel-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            channelTabsBar.querySelectorAll('.channel-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentActiveChannel = btn.dataset.channel || 'all';
            renderMultiChannelBreakdown(currentMultiChannelData, currentActiveChannel);
        });
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
