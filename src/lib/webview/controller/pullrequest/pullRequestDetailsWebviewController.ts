import { defaultActionGuard } from '@atlassianlabs/guipi-core-controller';
import Axios from 'axios';
import { PullRequest, User } from '../../../../bitbucket/model';
import { AnalyticsApi } from '../../../analyticsApi';
import { CommonAction, CommonActionType } from '../../../ipc/fromUI/common';
import { PullRequestDetailsAction, PullRequestDetailsActionType } from '../../../ipc/fromUI/pullRequestDetails';
import { WebViewID } from '../../../ipc/models/common';
import { CommonMessage, CommonMessageType } from '../../../ipc/toUI/common';
import {
    PullRequestDetailsMessage,
    PullRequestDetailsMessageType,
    PullRequestDetailsResponse,
} from '../../../ipc/toUI/pullRequestDetails';
import { Logger } from '../../../logger';
import { formatError } from '../../formatError';
import { CommonActionMessageHandler } from '../common/commonActionMessageHandler';
import { MessagePoster, WebviewController } from '../webviewController';
import { PullRequestDetailsActionApi } from './pullRequestDetailsActionApi';

export const title: string = 'Pull Request'; //TODO: Needs the pull request ID as well...

export class PullRequestDetailsWebviewController implements WebviewController<PullRequest> {
    private pr: PullRequest;
    private currentUser: User;
    private messagePoster: MessagePoster;
    private api: PullRequestDetailsActionApi;
    private logger: Logger;
    private analytics: AnalyticsApi;
    private commonHandler: CommonActionMessageHandler;
    private isRefreshing: boolean;

    constructor(
        pr: PullRequest,
        messagePoster: MessagePoster,
        api: PullRequestDetailsActionApi,
        commonHandler: CommonActionMessageHandler,
        logger: Logger,
        analytics: AnalyticsApi
    ) {
        this.pr = pr;
        this.messagePoster = messagePoster;
        this.api = api;
        this.logger = logger;
        this.analytics = analytics;
        this.commonHandler = commonHandler;

        //Temporarily logging these objects so compiler doesn't complain they're unused
        console.log(this.analytics);
    }

    private postMessage(message: PullRequestDetailsMessage | PullRequestDetailsResponse | CommonMessage) {
        this.messagePoster(message);
    }

    private async getCurrentUser(): Promise<User> {
        return this.currentUser || (await this.api.getCurrentUser(this.pr));
    }

    public title(): string {
        return `Pull Request ${this.pr.data.id}`;
    }

    public screenDetails() {
        return { id: WebViewID.PullRequestDetailsWebview, site: undefined, product: undefined };
    }

    private async invalidate() {
        if (this.isRefreshing) {
            return;
        }
        this.isRefreshing = true;
        this.pr = await this.api.getPR(this.pr);
        this.postMessage({
            type: PullRequestDetailsMessageType.Init,
            pr: this.pr,
            currentUser: await this.getCurrentUser(),
        });

        this.isRefreshing = false;
    }

    public async update() {
        this.postMessage({
            type: PullRequestDetailsMessageType.Init,
            pr: this.pr,
            currentUser: await this.getCurrentUser(),
        });
    }

    public async onMessageReceived(msg: PullRequestDetailsAction | CommonAction) {
        switch (msg.type) {
            case CommonActionType.Refresh: {
                try {
                    await this.invalidate();
                } catch (e) {
                    this.logger.error(new Error(`error refreshing pull request: ${e}`));
                    this.postMessage({
                        type: CommonMessageType.Error,
                        reason: formatError(e, 'Error refreshing pull request'),
                    });
                }
                break;
            }
            case PullRequestDetailsActionType.FetchUsersRequest:
                try {
                    const users = await this.api.fetchUsers(this.pr, msg.query, msg.abortKey);
                    this.postMessage({
                        type: PullRequestDetailsMessageType.FetchUsersResponse,
                        users: users,
                    });
                } catch (e) {
                    if (Axios.isCancel(e)) {
                        this.logger.warn(formatError(e));
                    } else {
                        this.logger.error(new Error(`error fetching users: ${e}`));
                        this.postMessage({
                            type: CommonMessageType.Error,
                            reason: formatError(e, 'Error fetching users'),
                        });
                    }
                }
                break;
            case PullRequestDetailsActionType.UpdateSummary:
                try {
                    await this.api.updateSummary(this.pr, msg.text);
                    this.postMessage({
                        type: PullRequestDetailsMessageType.UpdateSummaryResponse,
                    });
                } catch (e) {
                    this.logger.error(new Error(`error fetching users: ${e}`));
                    this.postMessage({
                        type: CommonMessageType.Error,
                        reason: formatError(e, 'Error fetching users'),
                    });
                }
                break;

            case PullRequestDetailsActionType.UpdateTitle:
                try {
                    await this.api.updateTitle(this.pr, msg.text);
                    this.postMessage({
                        type: PullRequestDetailsMessageType.UpdateSummaryResponse,
                    });
                } catch (e) {
                    this.logger.error(new Error(`error fetching users: ${e}`));
                    this.postMessage({
                        type: CommonMessageType.Error,
                        reason: formatError(e, 'Error fetching users'),
                    });
                }
                break;

            case CommonActionType.OpenJiraIssue:
            case CommonActionType.SubmitFeedback:
            case CommonActionType.ExternalLink:
            case CommonActionType.DismissPMFLater:
            case CommonActionType.DismissPMFNever:
            case CommonActionType.OpenPMFSurvey:
            case CommonActionType.Cancel:
            case CommonActionType.SubmitPMF: {
                this.commonHandler.onMessageReceived(msg);
                break;
            }
            default: {
                defaultActionGuard(msg);
            }
        }
    }
}
