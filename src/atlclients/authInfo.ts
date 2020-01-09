'use strict';


export enum AuthChangeType {
    Update = 'update',
    Remove = 'remove'
}
export interface AuthInfoEvent {
    type: AuthChangeType;
}

export interface UpdateAuthInfoEvent extends AuthInfoEvent {
    type: AuthChangeType.Update;
    site: DetailedSiteInfo;
}

export interface RemoveAuthInfoEvent extends AuthInfoEvent {
    type: AuthChangeType.Remove;
    product: Product;
    credentialId: string;
}

export interface Product {
    name: string;
    key: string;
}

export const ProductJira = {
    name: 'Jira',
    key: 'jira',
};

export const ProductBitbucket = {
    name: 'Bitbucket',
    key: 'bitbucket',
};

export enum OAuthProvider {
    BitbucketCloud = 'bbcloud',
    BitbucketCloudStaging = 'bbcloudstaging',
    JiraCloud = 'jiracloud',
    JiraCloudStaging = 'jiracloudstaging'
}
export interface AuthInfoV1 {
    access: string;
    refresh: string;
    user: UserInfoV1;
    accessibleResources?: Array<AccessibleResourceV1>;
}

export interface UserInfoV1 {
    id: string;
    displayName: string;
    provider: OAuthProvider;
}

export interface OAuthResponse {
    access: string;
    refresh: string;
    user: UserInfo;
    accessibleResources: Array<AccessibleResource>;
}

export interface AuthInfo {
    user: UserInfo;
}

export interface OAuthInfo extends AuthInfo {
    access: string;
    refresh: string;
}

export interface BasicAuthInfo extends AuthInfo {
    username: string;
    password: string;
}

export interface UserInfo {
    id: string;
    displayName: string;
    email: string;
    avatarUrl: string;
}

export interface SiteInfo {
    host: string;
    protocol?: string;
    product: Product;
    contextPath?: string;
    customSSLCertPaths?: string;
    pfxPath?: string;
    pfxPassphrase?: string;
}

export interface DetailedSiteInfo extends SiteInfo {
    id: string;
    name: string;
    avatarUrl: string;
    baseLinkUrl: string;
    baseApiUrl: string;
    isCloud: boolean;
    userId: string;
    credentialId: string;
}

export interface AccessibleResourceV1 {
    id: string;
    name: string;
    scopes: Array<string>;
    avatarUrl: string;
    baseUrlSuffix: string;
}

export interface AccessibleResource {
    id: string;
    name: string;
    scopes: Array<string>;
    avatarUrl: string;
    url: string;
}

export const emptyUserInfo: UserInfo = {
    id: 'empty',
    displayName: 'empty',
    email: 'empty',
    avatarUrl: 'empty',
};

export const emptyProduct: Product = {
    name: 'empty',
    key: 'empty',
};

export const emptySiteInfo: DetailedSiteInfo = {
    id: 'empty',
    name: 'empty',
    avatarUrl: 'empty',
    host: 'empty',
    baseLinkUrl: 'empty',
    baseApiUrl: 'empty',
    product: emptyProduct,
    isCloud: true,
    userId: 'empty',
    credentialId: 'emtpy',
};

export const emptyAccessibleResource: AccessibleResource = {
    id: 'empty',
    name: 'empty',
    avatarUrl: 'empty',
    scopes: [],
    url: 'empty'
};

export const emptyAccessibleResourceV1: AccessibleResourceV1 = {
    id: 'empty',
    name: 'empty',
    avatarUrl: 'empty',
    scopes: [],
    baseUrlSuffix: 'atlassian.net'
};

export const emptyAuthInfo: AuthInfo = {
    user: emptyUserInfo,
};

export function isUpdateAuthEvent(a: AuthInfoEvent): a is UpdateAuthInfoEvent {
    return a && (<UpdateAuthInfoEvent>a).type === AuthChangeType.Update
        && isDetailedSiteInfo((<UpdateAuthInfoEvent>a).site);
}

export function isRemoveAuthEvent(a: AuthInfoEvent): a is RemoveAuthInfoEvent {
    return a && (<RemoveAuthInfoEvent>a).type === AuthChangeType.Remove;
}

export function isDetailedSiteInfo(a: any): a is DetailedSiteInfo {
    return a && (<DetailedSiteInfo>a).id !== undefined
        && (<DetailedSiteInfo>a).name !== undefined
        && (<DetailedSiteInfo>a).host !== undefined
        && (<DetailedSiteInfo>a).baseLinkUrl !== undefined
        && (<DetailedSiteInfo>a).baseApiUrl !== undefined;
}

export function isEmptySiteInfo(a: any): boolean {
    return a && (<DetailedSiteInfo>a).id === 'empty'
        && (<DetailedSiteInfo>a).name === 'empty'
        && (<DetailedSiteInfo>a).host === 'empty'
        && (<DetailedSiteInfo>a).baseLinkUrl === 'empty'
        && (<DetailedSiteInfo>a).baseApiUrl === 'empty';
}

export function isOAuthInfo(a: any): a is OAuthInfo {
    return a && (<OAuthInfo>a).access !== undefined
        && (<OAuthInfo>a).refresh !== undefined;
}

export function isBasicAuthInfo(a: any): a is BasicAuthInfo {
    return a && (<BasicAuthInfo>a).username !== undefined
        && (<BasicAuthInfo>a).password !== undefined;
}

export function getSecretForAuthInfo(info: any): string {
    if (isOAuthInfo(info)) {
        return info.access;
    }

    if (isBasicAuthInfo(info)) {
        return info.password;
    }

    return "";
}

export function oauthProviderForSite(site: SiteInfo): OAuthProvider | undefined {
    const hostname = site.host.split(':')[0];

    if (hostname.endsWith('atlassian.net') || hostname.endsWith('jira.com')) {
        return OAuthProvider.JiraCloud;
    }

    if (hostname.endsWith('jira-dev.com')) {
        return OAuthProvider.JiraCloudStaging;
    }

    if (hostname.endsWith('bitbucket.org')) {
        return OAuthProvider.BitbucketCloud;
    }

    if (hostname.endsWith('bb-inf.net')) {
        return OAuthProvider.BitbucketCloudStaging;
    }

    return undefined;
}
