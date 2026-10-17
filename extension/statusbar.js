const vscode = require('vscode');

class StatusBarManager {
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'tokenSaver.openDashboard';
    }

    update(isEnabled, version = null, metrics = null) {
        const config = vscode.workspace.getConfiguration('tokenSaver');
        const displayStyle = config.get('statusMetricDisplay', 'compact');

        if (isEnabled) {
            this.statusBarItem.command = 'tokenSaver.disable';
            if (metrics && metrics.totalSavedTokens > 0 && displayStyle !== 'iconOnly') {
                this.statusBarItem.text = `$(zap) Token Saver: ${metrics.totalSavedFormatted} saved (${metrics.savedPercentage}%)`;
            } else {
                this.statusBarItem.text = `$(zap) Token Saver: ON`;
            }

            const tooltipLines = [
                `⚡ **Token Saver is ENABLED**`,
                `---`,
                `• **Total Saved**: ${metrics ? metrics.totalSavedFormatted : '0'} tokens (${metrics ? metrics.savedPercentage : 0}%)`,
                `• **Estimated Cost Saved**: ${metrics ? metrics.estimatedDollarSavings : '$0.00'}`,
                `---`,
                `👉 *Click to Turn Token Saver OFF directly*`
            ];

            const mdTooltip = new vscode.MarkdownString(tooltipLines.join('\n\n'));
            mdTooltip.isTrusted = true;
            this.statusBarItem.tooltip = mdTooltip;
            this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
        } else {
            this.statusBarItem.command = 'tokenSaver.enable';
            this.statusBarItem.text = `$(circle-slash) Token Saver: OFF`;
            const tooltipLines = [
                `⚪ **Token Saver is DISABLED**`,
                `---`,
                `All upstream token-saving solutions and AI prompt directives are paused.`,
                `---`,
                `👉 *Click to Turn Token Saver ON directly*`
            ];
            const mdTooltip = new vscode.MarkdownString(tooltipLines.join('\n\n'));
            mdTooltip.isTrusted = true;
            this.statusBarItem.tooltip = mdTooltip;
            this.statusBarItem.color = undefined;
        }

        this.statusBarItem.show();
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}

module.exports = StatusBarManager;