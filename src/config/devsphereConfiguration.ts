import { ExtensionContext, commands, workspace, ConfigurationTarget } from 'vscode';
import { Commands } from '../commands';

interface ConfigurationUpdate {
    section: string;
    setting: string;
    value: boolean;
}

const DEVSPHERE_REVIEW_VIEW_CONFIGS: ConfigurationUpdate[] = [
    {
        section: 'atlascode.bitbucket.explorer',
        setting: 'pullRequests.enabled',
        value: false,
    },
    {
        section: 'atlascode.jira',
        setting: 'enabled',
        value: false,
    },
    {
        section: 'atlascode.bitbucket.pipelines',
        setting: 'explorerEnabled',
        value: false,
    },
    {
        section: 'atlascode.bitbucket.issues',
        setting: 'explorerEnabled',
        value: false,
    },
    {
        section: 'atlascode',
        setting: 'helpExplorerEnabled',
        value: false,
    },
];

class DevsphereConfigurationManager {
    private static async executeVSCodeCommand(command: string): Promise<void> {
        try {
            await commands.executeCommand(command);
        } catch (error) {
            console.error(`Failed to execute VS Code command: ${command}`, error);
        }
    }

    private static async updateSingleConfiguration(config: ConfigurationUpdate): Promise<void> {
        try {
            await workspace
                .getConfiguration(config.section)
                .update(config.setting, config.value, ConfigurationTarget.Global);
        } catch (error) {
            console.error(
                `Failed to update configuration - Section: ${config.section}, Setting: ${config.setting}`,
                error,
            );
        }
    }

    private static async hideActivityBar(): Promise<void> {
        await this.executeVSCodeCommand('workbench.action.activityBarLocation.hide');
    }

    private static async showActivityBar(): Promise<void> {
        await this.executeVSCodeCommand('workbench.action.focusActivityBar');
    }

    private static async updateAllConfigurations(configs: ConfigurationUpdate[]): Promise<void> {
        await Promise.allSettled(configs.map((config) => this.updateSingleConfiguration(config)));
    }

    private static async focusOnPullRequestsOverview(): Promise<void> {
        await this.executeVSCodeCommand(Commands.BitbucketPullRequestsOverviewFocus);
    }

    public static async initializeReviewSettings(): Promise<void> {
        await this.hideActivityBar();
        await this.updateAllConfigurations(DEVSPHERE_REVIEW_VIEW_CONFIGS);
        await this.focusOnPullRequestsOverview();
    }

    public static async initializeCodeSettings(): Promise<void> {
        await this.showActivityBar();
    }
}

export function registerDevsphereCommands(context: ExtensionContext): void {
    context.subscriptions.push(
        commands.registerCommand(Commands.InitialiseDevsphereReviewSettings, () =>
            DevsphereConfigurationManager.initializeReviewSettings(),
        ),
        commands.registerCommand(Commands.InitialiseDevsphereCodeSettings, () =>
            DevsphereConfigurationManager.initializeCodeSettings(),
        ),
    );
}
