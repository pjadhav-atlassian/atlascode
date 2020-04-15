import { SwitchWithLabel } from '@atlassianlabs/guipi-core-components';
import { Grid, makeStyles, Theme } from '@material-ui/core';
import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import { ConfigSection } from '../../../../lib/ipc/models/config';
import { IntervalInput } from '../../common/IntervalInput';
import { ConfigControllerContext } from '../configController';

type PRExplorerProps = {
    enabled: boolean;
    relatedJiraIssues: boolean;
    relatedBitbucketIssues: boolean;
    pullRequestCreated: boolean;
    nestFiles: boolean;
    refreshInterval: number;
};

const useStyles = makeStyles(
    (theme: Theme) =>
        ({
            indent: {
                marginLeft: theme.spacing(3),
            },
        } as const)
);

export const PRExplorer: React.FunctionComponent<PRExplorerProps> = memo(
    ({ enabled, relatedJiraIssues, relatedBitbucketIssues, pullRequestCreated, nestFiles, refreshInterval }) => {
        const classes = useStyles();
        const controller = useContext(ConfigControllerContext);

        const [changes, setChanges] = useState<{ [key: string]: any }>({});

        const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const changes = Object.create(null);
            changes[`${ConfigSection.Bitbucket}.${e.target.value}`] = e.target.checked;
            setChanges(changes);
        }, []);

        const handleInterval = useCallback((n: number) => {
            const changes = Object.create(null);
            changes[`${ConfigSection.Bitbucket}.explorer.refreshInterval`] = n;
            setChanges(changes);
        }, []);

        useEffect(() => {
            if (Object.keys(changes).length > 0) {
                controller.updateConfig(changes);
                setChanges({});
            }
        }, [changes, controller]);

        return (
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <SwitchWithLabel
                        size="small"
                        color="primary"
                        id="bbExplorerEnabled"
                        value="explorer.enabled"
                        checked={enabled}
                        onChange={handleChange}
                        label={
                            enabled
                                ? `Disable Bitbucket pull requests explorer`
                                : `Enable Bitbucket pull requests explorer`
                        }
                    />
                </Grid>
                <Grid item>
                    <SwitchWithLabel
                        className={classes.indent}
                        size="small"
                        color="primary"
                        id="bbRelatedJiraIssues"
                        value="explorer.relatedJiraIssues.enabled"
                        checked={relatedJiraIssues}
                        disabled={!enabled}
                        onChange={handleChange}
                        label="Show related Jira issues for Bitbucket pull requests"
                    />
                </Grid>
                <Grid item>
                    <SwitchWithLabel
                        className={classes.indent}
                        size="small"
                        color="primary"
                        id="bbRelatedBitbucketIssues"
                        value="explorer.relatedBitbucketIssues.enabled"
                        checked={relatedBitbucketIssues}
                        disabled={!enabled}
                        onChange={handleChange}
                        label="Show related Bitbucket issues for pull requests"
                    />
                </Grid>
                <Grid item>
                    <SwitchWithLabel
                        className={classes.indent}
                        size="small"
                        color="primary"
                        id="bbpullRequestCreatedNotify"
                        value="explorer.notifications.pullRequestCreated"
                        checked={pullRequestCreated}
                        disabled={!enabled}
                        onChange={handleChange}
                        label="Show notifications when new Bitbucket pull requests are created"
                    />
                </Grid>
                <Grid item>
                    <SwitchWithLabel
                        className={classes.indent}
                        size="small"
                        color="primary"
                        id="bbNestFiles"
                        value="explorer.nestFiles"
                        checked={nestFiles}
                        disabled={!enabled}
                        onChange={handleChange}
                        label="Nest modified files by folder"
                    />
                </Grid>
                <Grid item>
                    <IntervalInput
                        className={classes.indent}
                        interval={refreshInterval}
                        max={120}
                        label="Refresh explorer every:"
                        enabled={enabled}
                        units="minutes"
                        onChange={handleInterval}
                    />
                </Grid>
            </Grid>
        );
    }
);
