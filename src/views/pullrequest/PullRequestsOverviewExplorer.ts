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

        Container.context.subscriptions.push(
            commands.registerCommand(Commands.BitbucketPullRequestsOverviewRefresh, this.refresh, this),
            this.ctx.onDidChangeBitbucketContext(() => this.updateExplorerState()),
        );
    }

    viewId(): string {
        return PullRequestsOverviewTreeViewId;
    }

    explorerEnabledConfiguration(): string {
        return 'bitbucket.explorer.pullRequestsOverview.enabled';
    }

    monitorEnabledConfiguration(): string {
        return 'bitbucket.explorer.pullRequestsOverview.enabled';
    }

    refreshConfiguration(): string {
        return 'bitbucket.explorer.pullRequestsOverview.refreshInterval';
    }

    newTreeDataProvider(): BaseTreeDataProvider {
        return new PullRequestsOverviewNodeDataProvider();
    }

    newMonitor(): BitbucketActivityMonitor {
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

    async onConfigurationChanged(e: ConfigurationChangeEvent) {
        const initializing = configuration.initializing(e);

        if (initializing || configuration.changed(e, 'bitbucket.explorer.pullRequestsOverview.enabled')) {
            this.updateExplorerState();
        }
    }

    private updateExplorerState() {
        setCommandContext(
            CommandContext.PullRequestOverviewEnabled,
            Container.config.bitbucket.explorer.pullRequestsOverview,
        );
    }
}
