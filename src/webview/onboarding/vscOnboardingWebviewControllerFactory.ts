import { Disposable } from 'vscode';
import { Container } from '../../container';
import { AnalyticsApi } from '../../lib/analyticsApi';
import { UIWSPort } from '../../lib/ipc/models/ports';
import { SectionChangeMessage } from '../../lib/ipc/toUI/config';
import { CommonActionMessageHandler } from '../../lib/webview/controller/common/commonActionMessageHandler';
import { OnboardingActionApi } from '../../lib/webview/controller/onboarding/onboardingActionApi';
import {
    id,
    OnboardingWebviewController,
    title
} from '../../lib/webview/controller/onboarding/onboardingWebviewController';
import { Logger } from '../../logger';
import { getHtmlForView } from '../common/getHtmlForView';
import { PostMessageFunc, VSCWebviewControllerFactory } from '../vscWebviewControllerFactory';

export class VSCOnboardingWebviewControllerFactory implements VSCWebviewControllerFactory<SectionChangeMessage> {
    private _api: OnboardingActionApi;
    private _commonHandler: CommonActionMessageHandler;
    private _analytics: AnalyticsApi;
    private _settingsUrl: string;

    constructor(
        api: OnboardingActionApi,
        commonHandler: CommonActionMessageHandler,
        analytics: AnalyticsApi,
        settingsUrl: string
    ) {
        this._api = api;
        this._commonHandler = commonHandler;
        this._analytics = analytics;
        this._settingsUrl = settingsUrl;
    }

    public title(): string {
        return title;
    }

    public tabIconPath(): string {
        return Container.context.asAbsolutePath('resources/atlassian-icon.svg');
    }

    public uiWebsocketPort(): number {
        return UIWSPort.Onboarding;
    }

    public createController(postMessage: PostMessageFunc): [OnboardingWebviewController, Disposable | undefined];

    public createController(postMessage: PostMessageFunc): OnboardingWebviewController;

    public createController(
        postMessage: PostMessageFunc
    ): OnboardingWebviewController | [OnboardingWebviewController, Disposable | undefined] {
        const controller = new OnboardingWebviewController(
            postMessage,
            this._api,
            this._commonHandler,
            Logger.Instance,
            this._analytics,
            this._settingsUrl
        );

        const disposables = Disposable.from(
            Container.siteManager.onDidSitesAvailableChange(controller.onSitesChanged, controller)
        );

        return [controller, disposables];
    }

    public webviewHtml(extensionPath: string): string {
        return getHtmlForView(extensionPath, id);
    }
}
