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
                this.statusBarItem.text = `$(pulse) Token Saver: ${metrics.totalSavedFormatted} (${metrics.savedPercentage}%)`;
            } else {
                this.statusBarItem.text = `$(pulse) Token Saver: Active`;
            }

            const tooltipLines = [
                `**Token Saver — Active**`,
                `---`,
                `- **Tokens saved**: ${metrics ? metrics.totalSavedFormatted : '0'} (${metrics ? metrics.savedPercentage : 0}%)`,
                `- **Estimated cost saved**: ${metrics ? metrics.estimatedDollarSavings : '$0.00'}`,
                `---`,
                `*Click to pause Token Saver*`
            ];

            const mdTooltip = new vscode.MarkdownString(tooltipLines.join('\n\n'));
            mdTooltip.isTrusted = true;
            this.statusBarItem.tooltip = mdTooltip;
            this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
        } else {
            this.statusBarItem.command = 'tokenSaver.enable';
            this.statusBarItem.text = `$(circle-slash) Token Saver: Paused`;
            const tooltipLines = [
                `**Token Saver — Paused**`,
                `---`,
                `All upstream token-saving engines and agent directives are paused.`,
                `---`,
                `*Click to enable Token Saver*`
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