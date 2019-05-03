import * as vscode from 'vscode';
import { AbstractBaseNode } from './abstractBaseNode';
import { PullRequest } from '../../bitbucket/model';
import { Container } from '../../container';
import { extractBitbucketIssueKeys } from '../../bitbucket/issueKeysExtractor';
import { StaticBitbucketIssuesNode } from '../bbissues/staticBbIssuesNode';
import { AuthProvider } from '../../atlclients/authInfo';

export class RelatedBitbucketIssuesNode extends AbstractBaseNode {
    private _delegate: StaticBitbucketIssuesNode;

    private constructor() {
        super();
    }

    public static async create(pr: PullRequest, allComments: Bitbucket.Schema.Comment[]): Promise<AbstractBaseNode | undefined> {
        if (!Container.authManager.isAuthenticated(AuthProvider.BitbucketCloud) || !Container.config.bitbucket.explorer.relatedBitbucketIssues.enabled) {
            return undefined;
        }
        const issueKeys = await extractBitbucketIssueKeys(pr, allComments);
        if (issueKeys.length > 0) {
            const node = new RelatedBitbucketIssuesNode();
            node._delegate = new StaticBitbucketIssuesNode(pr.repository, issueKeys);
            return node;
        }
        return undefined;
    }

    getTreeItem(): vscode.TreeItem {
        return this._delegate.getTreeItem();
    }

    getChildren(element?: AbstractBaseNode): Promise<AbstractBaseNode[]> {
        return this._delegate.getChildren(element);
    }
}