import { isMinimalIssue, IssueLinkIssue, MinimalIssue, MinimalORIssueLink } from "jira-pi-client";
import { DetailedSiteInfo } from "../../atlclients/authInfo";
import { Container } from "../../container";
import { fetchMinimalIssue } from "../../jira/fetchIssue";

export async function startWorkOnIssue(issueOrLink: MinimalORIssueLink<DetailedSiteInfo> | undefined) {
    let issue: MinimalIssue<DetailedSiteInfo> | undefined = undefined;

    if (isMinimalIssue(issueOrLink)) {
        issue = issueOrLink;
    } else {
        const linkedIssue: IssueLinkIssue<DetailedSiteInfo> = issueOrLink as IssueLinkIssue<DetailedSiteInfo>;
        issue = await fetchMinimalIssue(linkedIssue.key, linkedIssue.siteDetails);
    }

    Container.startWorkOnIssueWebview.createOrShowIssue(issue);
}

