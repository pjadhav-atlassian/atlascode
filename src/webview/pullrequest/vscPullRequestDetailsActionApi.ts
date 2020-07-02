import axios, { CancelToken, CancelTokenSource } from 'axios';
import { clientForSite } from '../../bitbucket/bbUtils';
import { PullRequest, User } from '../../bitbucket/model';
import { CancellationManager } from '../../lib/cancellation';
import { PullRequestDetailsActionApi } from '../../lib/webview/controller/pullrequest/pullRequestDetailsActionApi';

export class VSCPullRequestDetailsActionApi implements PullRequestDetailsActionApi {
    constructor(private cancellationManager: CancellationManager) {}

    async getCurrentUser(pr: PullRequest): Promise<User> {
        const bbApi = await clientForSite(pr.site);
        return await bbApi.pullrequests.getCurrentUser(pr.site.details);
    }

    async getPR(pr: PullRequest): Promise<PullRequest> {
        const bbApi = await clientForSite(pr.site);

        return bbApi.pullrequests.get(pr.site, pr.data.id, pr.workspaceRepo);
    }

    async fetchUsers(pr: PullRequest, query: string, abortKey?: string): Promise<User[]> {
        const bbApi = await clientForSite(pr.site);

        var cancelToken: CancelToken | undefined = undefined;

        if (abortKey) {
            const signal: CancelTokenSource = axios.CancelToken.source();
            cancelToken = signal.token;
            this.cancellationManager.set(abortKey, signal);
        }

        return await bbApi.pullrequests.getReviewers(pr.site, query, cancelToken);
    }

    async updateSummary(pr: PullRequest, text: string): Promise<void> {
        const bbApi = await clientForSite(pr.site);
        await bbApi.pullrequests.update(
            pr,
            pr.data.title,
            text,
            pr.data.participants.filter((p) => p.role === 'REVIEWER').map((p) => p.accountId)
        );
    }

    async updateTitle(pr: PullRequest, text: string): Promise<void> {
        const bbApi = await clientForSite(pr.site);
        await bbApi.pullrequests.update(
            pr,
            text,
            pr.data.rawSummary,
            pr.data.participants.filter((p) => p.role === 'REVIEWER').map((p) => p.accountId)
        );
    }
}
