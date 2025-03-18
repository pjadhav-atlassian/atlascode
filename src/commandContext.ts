import { commands } from 'vscode';

export enum CommandContext {
    JiraExplorer = 'atlascode:jiraExplorerEnabled',
    CustomJQLExplorer = 'atlascode:customJQLExplorerEnabled',
    AssignedIssueExplorer = 'atlascode:assignedIssueExplorerEnabled',
    BitbucketExplorer = 'atlascode:bitbucketExplorerEnabled',
    PipelineExplorer = 'atlascode:pipelineExplorerEnabled',
    BitbucketIssuesExplorer = 'atlascode:bitbucketIssuesExplorerEnabled',
    OpenIssuesTree = 'atlascode:openIssuesTreeEnabled',
    AssignedIssuesTree = 'atlascode:assignedIssuesTreeEnabled',
    JiraLoginTree = 'atlascode:jiraLoginTreeEnabled',
    IsJiraAuthenticated = 'atlascode:isJiraAuthenticated',
    IsBBAuthenticated = 'atlascode:isBBAuthenticated',
    PullRequestOverviewEnabled = 'atlascode:bitbucketPullRequestOverviewEnabled',
    RepositoryBasedPullRequestViewEnabled = 'atlascode:bitbucketRepositoryBasedPullRequestViewEnabled',
}

export function setCommandContext(key: CommandContext | string, value: any) {
    return commands.executeCommand('setContext', key, value);
}
