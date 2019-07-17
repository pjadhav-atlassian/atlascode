import * as vscode from "vscode";
import { isDetailedIssue, DetailedIssue, MinimalIssue, isMinimalIssue } from "../../jira/jiraModel";
import { Container } from "../../container";
import { fetchDetailedIssue } from "../../jira/fetchIssue";
import { ProductJira } from "../../atlclients/authInfo";

export async function showIssue(param: DetailedIssue | MinimalIssue | string | undefined) {
  let issue = param;

  if (param === undefined) {
    const input = await vscode.window.showInputBox({ prompt: 'Enter issue key' });
    if (input) {
      issue = input.trim();
    }
  }

  if (issue) {
    let detailedIssue: DetailedIssue;

    if (isDetailedIssue(issue)) {
      detailedIssue = issue;
    } else {
      const key: string = isMinimalIssue(issue) ? issue.key : issue;
      detailedIssue = await fetchDetailedIssue(key, Container.siteManager.effectiveSite(ProductJira));
    }

    Container.jiraIssueViewManager.createOrShow(detailedIssue);
  }
}
