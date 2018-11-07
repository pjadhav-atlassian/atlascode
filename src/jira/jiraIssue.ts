export class JiraIssue {

    static readonly fields = ["summary", "description", "comment", "issuetype", "status", "created", "reporter", "assignee", "labels", "attachment", "status"];
    static readonly expand = "transitions";

    constructor(readonly key: string, readonly description: string, readonly summary: string, 
        readonly status: JIRA.Schema.StatusJsonBean | undefined, readonly reporter: JiraUser | undefined, readonly assignee: JiraUser | undefined, 
        readonly jiraURL: string, readonly issueIcon: string, readonly comments: JiraComment[], 
        readonly labels: string[], readonly attachments: JIRA.Schema.AttachmentBean[], readonly transitions: JIRA.Schema.TransitionBean[] | undefined) {}

    static readIssue(issueJson: any): JiraIssue {
        const key = issueJson.key;
        const description = issueJson.fields.description;
        const summary = issueJson.fields.summary;
        const status = issueJson.fields.status;
        const issuetypeIcon = issueJson.fields.issuetype.iconUrl;
        const reporter = issueJson.fields.reporter ? JiraUser.readUser(issueJson.fields.reporter) : undefined;
        const assignee = issueJson.fields.assignee ? JiraUser.readUser(issueJson.fields.assignee) : undefined;
        const comments = issueJson.fields.comment.comments.map((commentJson: any) => {
          let author = commentJson.author ? JiraUser.readUser(commentJson.author) : undefined;
          let body = commentJson.body;
          return new JiraComment(author, body);
        });
        const labels = issueJson.fields.labels;
        const attachments = issueJson.fields.attachment;
        const transitions = issueJson.transitions;
        return new JiraIssue(
          key,  
          description,
          summary,
          status,
          reporter,
          assignee,
          "http://www.example.com/",
          issuetypeIcon,
          comments,
          labels,
          attachments,
          transitions
        );
      }
}

export class JiraComment {
    constructor(readonly author: JiraUser | undefined, readonly comment: string) {
    }
}

export class JiraUser {

    constructor(readonly displayName: string, readonly accountId: string, readonly avatarUrl: string) {
    }

    static readUser(userObject: any): JiraUser {
        return new JiraUser(userObject.displayName,
            userObject.accountId,
            userObject.avatarUrls['48x48']);
    }
}
