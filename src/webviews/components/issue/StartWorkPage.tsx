import * as React from "react";
import Page, { Grid, GridColumn } from "@atlaskit/page";
import SectionMessage from '@atlaskit/section-message';
import Spinner from '@atlaskit/spinner';
import { Checkbox } from '@atlaskit/checkbox';
import { CreatableSelect } from '@atlaskit/select';
import Banner from '@atlaskit/banner';
import { WebviewComponent } from "../WebviewComponent";
import { isStartWorkOnIssueData, StartWorkOnIssueData, isStartWorkOnIssueResult, StartWorkOnIssueResult } from "../../../ipc/issueMessaging";
import {
  emptyIssue,
  Transition,
  emptyTransition
} from "../../../jira/jiraModel";
import {
  StartWorkAction, OpenJiraIssueAction
} from "../../../ipc/issueActions";
import { TransitionMenu } from "./TransitionMenu";
import Button from "@atlaskit/button";
import Select from '@atlaskit/select';
import { RepoData } from "../../../ipc/prMessaging";
import { Branch } from "../../../typings/git";

type Emit = StartWorkAction | OpenJiraIssueAction;
const emptyRepoData: RepoData = { uri: '', remotes: [], localBranches: [], remoteBranches: [] };

type BranchNameOption = { label: string, value: string };
type State = {
  data: StartWorkOnIssueData;
  jiraSetupEnabled: boolean;
  bitbucketSetupEnabled: boolean;
  transition: Transition;
  sourceBranch?: { label: string, value: Branch },
  localBranch?: BranchNameOption;
  branchOptions: { label: string, options: BranchNameOption[] }[],
  repo: { label: string, value: RepoData };
  remote?: { label: string, value: string };
  isStartButtonLoading: boolean;
  result: StartWorkOnIssueResult;
};

const emptyState: State = {
  data: { type: 'update', issue: emptyIssue, repoData: [] },
  jiraSetupEnabled: true,
  bitbucketSetupEnabled: true,
  transition: emptyTransition,
  repo: { label: 'No repositories found...', value: emptyRepoData },
  localBranch: undefined,
  branchOptions: [],
  isStartButtonLoading: false,
  result: { type: 'startWorkOnIssueResult', successMessage: undefined, error: undefined }
};

export default class StartWorkPage extends WebviewComponent<
  Emit,
  StartWorkOnIssueData,
  {},
  State
  > {
  constructor(props: any) {
    super(props);
    this.state = emptyState;
  }

  isEmptyRepo = (r: RepoData): boolean =>  r === emptyRepoData;

  createLocalBranchOption = (branchName: string): BranchNameOption => {
    return {
      label: branchName,
      value: branchName
    };
  }

  public onMessageReceived(e: any) {
    console.log("got message from vscode", e);

    if (e.type && e.type === 'update' && isStartWorkOnIssueData(e)) {
      console.log("got issue data");
      if (e.issue.key.length > 0) {
        const repo = this.isEmptyRepo(this.state.repo.value) && e.repoData.length > 0 ? { label: e.repoData[0].uri.split('/').pop()!, value: e.repoData[0] } : this.state.repo;
        const transition = this.state.transition === emptyTransition ? e.issue.transitions.find(t => t.to.id === e.issue.status.id) || this.state.transition : this.state.transition;
        const branchOptions = this.state.branchOptions.length > 0
          ? this.state.branchOptions
          : [{ label: 'Select an existing branch', options: repo.value.localBranches.filter(b => b.name!.toLowerCase().includes(e.issue.key.toLowerCase())).map(b => this.createLocalBranchOption(b.name!)) }];
        let generatedBranchNameOption = undefined;
        const localBranch = this.state.localBranch
          ? this.state.localBranch
          : branchOptions.length > 0 && branchOptions[0].options.length > 0
            ? this.createLocalBranchOption(branchOptions[0].options[0].value)
            : generatedBranchNameOption = this.createLocalBranchOption(`${e.issue.key}-${e.issue.summary.substring(0, 50).trim().toLowerCase().replace(/\W+/g, '-')}`);
        if (generatedBranchNameOption) {
          branchOptions.push({ label: 'Create a new branch', options: [generatedBranchNameOption] });
        }
        const sourceBranchValue = this.state.sourceBranch ? this.state.sourceBranch.value : repo.value.localBranches.find(b => b.name !== undefined && b.name.indexOf(repo.value.mainbranch!) !== -1) || repo.value.localBranches[0];
        const sourceBranch = sourceBranchValue === undefined ? undefined : { label: sourceBranchValue.name!, value: sourceBranchValue };
        const remote = this.state.remote || repo.value.remotes.length === 0 ? this.state.remote : { label: repo.value.remotes[0].name, value: repo.value.remotes[0].name };

        this.setState({
          data: e,
          repo: repo,
          sourceBranch: sourceBranch,
          transition: transition,
          branchOptions: branchOptions,
          localBranch: localBranch,
          remote: remote,
          bitbucketSetupEnabled: this.isEmptyRepo(repo.value) ? false : this.state.bitbucketSetupEnabled
        });
      }
      else { // empty issue
        this.setState(emptyState);
      }

    }
    else if (isStartWorkOnIssueResult(e)) {
      this.setState({ isStartButtonLoading: false, result: e });
    }
  }

  onHandleStatusChange = (item: any) => {
    const transition = this.state.data.issue.transitions.find(
      trans =>
        trans.id === item.target.parentNode.parentNode.dataset.transitionId
    );

    if (transition) {
      this.setState({
        // there must be a better way to update the transition dropdown!!
        data: { ...this.state.data, issue: { ...this.state.data.issue, status: { ...this.state.data.issue.status, id: transition.to.id, name: transition.to.name } } },
        transition: transition
      });
    }
  }

  handleRepoChange = (repo: { label: string, value: RepoData }) => {
    const sourceBranchValue = repo!.value.localBranches.find(b => b.name !== undefined && b.name.indexOf(repo!.value.mainbranch!) !== -1);
    this.setState({ repo: repo, sourceBranch: sourceBranchValue ? { label: sourceBranchValue.name!, value: sourceBranchValue } : undefined });
  }

  handleSourceBranchChange = (newValue: { label: string, value: Branch }) => {
    this.setState({ sourceBranch: newValue });
  }

  handleBranchNameChange = (e: any) => {
    this.setState({ localBranch: e });
  }

  handleCreateBranchOption = (e: any) => {
    const newOption = { label: e, value: e.trim() };
    this.setState({
      branchOptions: [...this.state.branchOptions, { label: 'Create new branch', options: [newOption] }],
      localBranch: newOption
    });
  }

  toggleJiraSetupEnabled = (e: any) => {
    this.setState({
      jiraSetupEnabled: e.target.checked
    });
  }

  toggleBitbucketSetupEnabled = (e: any) => {
    this.setState({
      bitbucketSetupEnabled: e.target.checked
    });
  }

  handleRemoteChange = (newValue: { label: string, value: string }) => {
    this.setState({ remote: newValue });
  }

  handleStart = () => {
    this.setState({ isStartButtonLoading: true });

    this.postMessage({
      action: 'startWork',
      repoUri: this.state.repo.value.uri,
      branchName: this.state.localBranch ? this.state.localBranch.value : '',
      sourceBranchName: this.state.sourceBranch ? this.state.sourceBranch.value.name! : '',
      remote: this.state.remote ? this.state.remote!.value : '',
      transition: this.state.transition,
      setupJira: this.state.jiraSetupEnabled,
      setupBitbucket: this.isEmptyRepo(this.state.repo.value) ? false : this.state.bitbucketSetupEnabled
    });
  }

  header(issue: any): any {
    return (
      <div>
          <div className='ac-flex'>
            <em><p>Start work on - </p></em>
            <div className="ac-icon-with-text" style={{ marginLeft: 10 }}>
              <img src={issue.issueType.iconUrl} />
              <div className='jira-issue-key'>
                <Button className='ac-link-button' appearance="link" onClick={() => this.postMessage({ action: 'openJiraIssue', issue: issue })}>{issue.key}</Button>
              </div>
            </div>
            <h3>{issue.summary}</h3>
          </div>
        <p>{issue.description}</p>
      </div>
    );
  }

  render() {
    const issue = this.state.data.issue;
    const repo = this.state.repo;

    if (issue.key === '') {
      return <div className='ac-block-centered'><Spinner size="large" /></div>;
    }

    return (
      <Page>
        <Grid>
          <GridColumn medium={8}>
            <Banner isOpen={this.state.result.successMessage} appearance="announcement">
              ✅ {this.state.result.successMessage}
            </Banner>
          </GridColumn>
          <GridColumn medium={8}>
            {this.header(issue)}
          </GridColumn>
          <GridColumn medium={6}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox isChecked={this.state.jiraSetupEnabled} onChange={this.toggleJiraSetupEnabled} name='setup-jira-checkbox' />
              <h4>Transition issue</h4>
            </div>
            {this.state.jiraSetupEnabled &&
              <div style={{ margin: 10, borderLeftWidth: 'initial', borderLeftStyle: 'solid', borderLeftColor: 'var(--vscode-settings-modifiedItemIndicator)' }}>
                <div style={{ margin: 10 }}>
                  <label>Select new status</label>
                  <TransitionMenu issue={issue} isStatusButtonLoading={false} onHandleStatusChange={this.onHandleStatusChange} />
                </div>
              </div>
            }
          </GridColumn>
          <GridColumn medium={12} />
          <GridColumn medium={6}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox isChecked={this.state.bitbucketSetupEnabled} onChange={this.toggleBitbucketSetupEnabled} name='setup-bitbucket-checkbox' />
              <h4>Set up git branch</h4>
            </div>
            {this.isEmptyRepo(this.state.repo.value) &&
              <div style={{ margin: 10, borderLeftWidth: 'initial', borderLeftStyle: 'solid', borderLeftColor: 'var(--vscode-settings-modifiedItemIndicator)' }}>
                <div style={{ margin: 10 }}>
                  <div className='ac-vpadding'>
                    <label>Repository</label>
                    <Select
                      className="ac-select-container"
                      classNamePrefix="ac-select"
                      placeholder='No repositories found...'
                      value={repo} />
                  </div>
                </div>
              </div>
            }
            {this.state.bitbucketSetupEnabled && !this.isEmptyRepo(this.state.repo.value) &&
              <div style={{ margin: 10, borderLeftWidth: 'initial', borderLeftStyle: 'solid', borderLeftColor: 'var(--vscode-settings-modifiedItemIndicator)' }}>
                <div style={{ margin: 10 }}>
                  {this.state.data.repoData.length > 1 &&
                    <div className='ac-vpadding'>
                      <label>Repository</label>
                      <Select
                        className="ac-select-container"
                        classNamePrefix="ac-select"
                        options={this.state.data.repoData.map(repo => { return { label: repo.uri.split('/').pop(), value: repo }; })}
                        onChange={this.handleRepoChange}
                        placeholder='Loading...'
                        value={repo} />
                    </div>
                  }
                  <label>Source branch (this will be the start point for the new branch)</label>
                  <Select
                    className="ac-select-container"
                    classNamePrefix="ac-select"
                    options={repo.value.localBranches.map(branch => ({ label: branch.name, value: branch }))}
                    onChange={this.handleSourceBranchChange}
                    value={this.state.sourceBranch} />
                  <div className='ac-vpadding'>
                    <label>Local branch</label>
                    <CreatableSelect
                      isClearable
                      className="ac-select-container"
                      classNamePrefix="ac-select"
                      onCreateOption={this.handleCreateBranchOption}
                      options={this.state.branchOptions}
                      isValidNewOption={(inputValue: any, selectValue: any, selectOptions: any[]) => {
                        if (inputValue.trim().length === 0 || selectOptions.find(option => option === inputValue) || /\s/.test(inputValue)) {
                          return false;
                        }
                        return true;
                      }}
                      onChange={this.handleBranchNameChange}
                      value={this.state.localBranch} />
                  </div>
                  {this.state.repo.value.remotes.length > 1 &&
                    <div>
                      <label>Set upstream to</label>
                      <Select
                        className="ac-select-container"
                        classNamePrefix="ac-select"
                        options={repo.value.remotes.map(remote => ({ label: remote.name, value: remote.name }))}
                        onChange={this.handleRemoteChange}
                        value={this.state.remote} />
                    </div>
                  }
                </div>
              </div>
            }
          </GridColumn>
          <GridColumn medium={12}>
            <div className='ac-vpadding'>
              {!this.state.result.successMessage && <Button className='ac-button' isLoading={this.state.isStartButtonLoading} onClick={this.handleStart}>Start</Button>}
            </div>
          </GridColumn>
          <GridColumn medium={12}>
            {this.state.result.error &&
              <SectionMessage appearance="warning" title="Something went wrong">
                <div className='ac-vpadding'>
                  <div style={{ color: 'black' }}>{this.state.result.error}</div>
                </div>
              </SectionMessage>
            }
          </GridColumn>
        </Grid>
      </Page>
    );
  }
}
