import { Avatars, IssueType, StatusCategory, Priority, User, Status, Transition, MinimalIssue, Project, Comment, IssueLinkIssue, IssueLinkType } from "./entities";
import { emptySiteInfo, DetailedSiteInfo } from "../../../atlclients/authInfo";
import { EpicFieldInfo } from "../../jiraCommon";
import { IssueTypeUI, IssueTypeIssueCreateMetadata, ProjectIssueCreateMetadata } from "jira-metaui-transformer";

export const emptyAvatars: Avatars = { '48x48': '', '24x24': '', '16x16': '', '32x32': '' };

export const emptyUser: User = {
    accountId: '',
    active: true,
    avatarUrls: emptyAvatars,
    displayName: '',
    emailAddress: '',
    key: '',
    self: '',
    timeZone: ''
};

export function isEmptyUser(u: any): u is User {
    return u
        && ((<User>u).accountId === undefined
            || (<User>u).accountId.trim() === '');
}

export const emptyIssueType: IssueType = {
    avatarId: -1,
    description: 'empty',
    iconUrl: '',
    id: 'empty',
    name: 'empty',
    self: '',
    subtask: false,
    epic: false,
};

export const emptyIssueLinkType: IssueLinkType = {
    id: '',
    name: '',
    inward: '',
    outward: '',
};

export const emptyStatusCategory: StatusCategory = {
    colorName: '',
    id: -1,
    key: '',
    name: '',
    self: ''
};

export const emptyStatus: Status = {
    description: '',
    iconUrl: '',
    id: '',
    name: '',
    self: '',
    statusCategory: emptyStatusCategory
};

export const emptyPriority: Priority = {
    id: '',
    name: '',
    iconUrl: ''
};

export const emptyTransition: Transition = {
    hasScreen: false,
    id: '',
    isConditional: false,
    isGlobal: false,
    isInitial: false,
    name: '',
    to: emptyStatus,
};

export const emptyMinimalIssue: MinimalIssue = {
    key: '',
    id: '',
    self: '',
    created: new Date(0),
    updated: new Date(0),
    description: '',
    descriptionHtml: '',
    summary: '',
    status: emptyStatus,
    priority: emptyPriority,
    issuetype: emptyIssueType,
    subtasks: [],
    issuelinks: [],
    transitions: [],
    siteDetails: emptySiteInfo,
    isEpic: false,
    epicChildren: [],
    epicName: '',
    epicLink: ''
};

export const issueNotFoundIssue: MinimalIssue = { ...emptyMinimalIssue, ...{ key: 'NOTFOUND' } };

export function isNotFoundIssue(p: MinimalIssue): p is MinimalIssue {
    return p && (<MinimalIssue>p).key === 'NOTFOUND';
}

export const emptyIssueLinkIssue: IssueLinkIssue = {
    key: '',
    id: '',
    self: '',
    created: new Date(0),
    summary: '',
    status: emptyStatus,
    priority: emptyPriority,
    issuetype: emptyIssueType,
    siteDetails: emptySiteInfo,
};

export const emptyProject: Project = {
    id: "",
    name: "",
    key: "",
    avatarUrls: {},
    projectTypeKey: "",
    self: "",
    simplified: false,
    style: "",
    isPrivate: false
};

export function isEmptyProject(p: Project): p is Project {
    return !p
        || (<Project>p).key === undefined
        || (<Project>p).key === '';
}

export const emptyComment: Comment = {
    author: emptyUser,
    body: '',
    created: '',
    id: '',
    self: '',
    visibility: undefined,
    jsdPublic: false
};

export const emptyEpicFieldInfo: EpicFieldInfo = {
    epicLink: { id: "", name: "", cfid: -1 },
    epicName: { id: "", name: "", cfid: -1 },
    epicsEnabled: false,

};

export const emptyIssueTypeUI: IssueTypeUI<DetailedSiteInfo> = {
    siteDetails: emptySiteInfo,
    epicFieldInfo: emptyEpicFieldInfo,
    apiVersion: 2,
    fields: {},
    fieldValues: {},
    selectFieldOptions: {},
    nonRenderableFields: [],
    hasRequiredNonRenderables: false,
};

export const emptyIssueTypeIssueCreateMetadata: IssueTypeIssueCreateMetadata = {
    self: "",
    id: "atlascodeempty",
    description: "empty",
    name: "empty",
    iconUrl: "",
    subtask: false,
    avatarId: 0,
    entityId: "",
    fields: {}
};

export const emptyProjectIssueCreateMetadata: ProjectIssueCreateMetadata = {
    id: 'empty',
    key: 'empty',
    name: 'empty',
    avatarUrls: {},
    issuetypes: [emptyIssueTypeIssueCreateMetadata],
};
