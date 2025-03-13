import { commands } from 'vscode';

export enum CommandContext {
    JiraExplorer = 'atlascode:jiraExplorerEnabled',
    CustomJQLExplorer = 'atlascode:customJQLExplorerEnabled',
    BitbucketExplorer = 'atlascode:bitbucketExplorerEnabled',
    PipelineExplorer = 'atlascode:pipelineExplorerEnabled',
    BitbucketIssuesExplorer = 'atlascode:bitbucketIssuesExplorerEnabled',
    OpenIssuesTree = 'atlascode:openIssuesTreeEnabled',
    AssignedIssuesTree = 'atlascode:assignedIssuesTreeEnabled',
    JiraLoginTree = 'atlascode:jiraLoginTreeEnabled',
    IsJiraAuthenticated = 'atlascode:isJiraAuthenticated',
    IsBBAuthenticated = 'atlascode:isBBAuthenticated',
    BitbucketInternalExplorerEnabled = 'atlascode:bitbucketInternalExplorerEnabled',
}

export function setCommandContext(key: CommandContext | string, value: any) {
    return commands.executeCommand('setContext', key, value);
}
