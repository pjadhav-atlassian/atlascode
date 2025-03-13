import { commands, ConfigurationChangeEvent } from 'vscode';
import { BitbucketContext } from '../../bitbucket/bbContext';
import { Commands } from '../../commands';
import { PullRequestsOverviewTreeViewId } from '../../constants';
import { CommandContext, setCommandContext } from '../../commandContext';
import { Container } from '../../container';
import { BitbucketExplorer } from '../BitbucketExplorer';
import { PullRequestsOverviewNodeDataProvider } from '../pullRequestOverviewNodeDataProvider';
import { BaseTreeDataProvider } from '../Explorer';
import { configuration } from '../../config/configuration';
import { BitbucketActivityMonitor } from '../BitbucketActivityMonitor';

export class PullRequestsOverviewExplorer extends BitbucketExplorer {
    constructor(ctx: BitbucketContext) {
        super(ctx);

        // Register commands only once, using our internal-specific commands
        Container.context.subscriptions.push(
            commands.registerCommand(Commands.BitbucketPullRequestsOverviewRefresh, this.refresh, this),
        );
    }

    viewId(): string {
        return PullRequestsOverviewTreeViewId;
    }

    explorerEnabledConfiguration(): string {
        return 'bitbucket.internal.explorer.enabled';
    }

    monitorEnabledConfiguration(): string {
        return 'bitbucket.internal.monitor.enabled';
    }

    refreshConfiguration(): string {
        return 'bitbucket.internal.refreshInterval';
    }

    onConfigurationChanged(e: ConfigurationChangeEvent): void {
        // Handle configuration changes specific to internal pull requests explorer
        if (
            configuration.changed(e, 'bitbucket.internal.explorer.enabled') ||
            configuration.changed(e, 'bitbucket.enabled')
        ) {
            // Specific internal PR explorer handling
            setCommandContext(
                CommandContext.BitbucketInternalExplorerEnabled,
                configuration.get<boolean>('bitbucket.internal.explorer.enabled'),
            );
        }
    }

    newTreeDataProvider(): BaseTreeDataProvider {
        return new PullRequestsOverviewNodeDataProvider();
    }

    newMonitor(): BitbucketActivityMonitor {
        // For now, create a minimal implementation of BitbucketActivityMonitor
        return {
            checkForNewActivity(): void {
                // No-op for now
            },
        };
    }

    override async refresh(): Promise<void> {
        if (!Container.onlineDetector.isOnline()) {
            return;
        }

        if (this.treeDataProvider) {
            this.treeDataProvider.refresh();
        }
    }
}
