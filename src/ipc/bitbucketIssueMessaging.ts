import { Message } from "./messaging";

export interface BitbucketIssueData extends Message {
    type: 'updateBitbucketIssue';
    issue: Bitbucket.Schema.Issue;
    currentUser: Bitbucket.Schema.User;
    comments: Bitbucket.Schema.Comment[];
}

export interface CreateBitbucketIssueData extends Message {
    type: 'createBitbucketIssueData';
    repoData: RepoData[];
}

export interface RepoData {
    uri: string;
    href: string;
    avatarUrl: string;
}

export function isCreateBitbucketIssueData(a: Message): a is CreateBitbucketIssueData {
    return (<CreateBitbucketIssueData>a).type === 'createBitbucketIssueData';
}