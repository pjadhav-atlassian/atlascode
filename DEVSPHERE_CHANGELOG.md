## Devsphere specific changelog 
- [PR-9](https://bitbucket.org/atlassian/atlascode-fork/pull-requests/9/overview)
    - This PR adds a Pull Request overview section on the Activity Bar view. This can be contributed to upstream when we have time.
    - The new overview section works independently without needing BB repo to be in the workspace.
    - Along with that it adds support for updating configurations depending on what view the devpshere website is currently in.
    - The execution of commands is done by vscode implemented in [this PR](https://bitbucket.org/atlassian/code-server-fork/pull-requests/1/overview) on `code-server` fork.
    - To add support for new configurations refer to [this file](/src/config/devsphereConfiguration.ts) file.