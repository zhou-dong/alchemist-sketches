import React from 'react';
import { Tooltip, IconButton, Stack } from '@mui/material';
import KmvConfigDialog from './KmvConfigDialog';
import SetOperationsVisualization from './SetOperationsVisualization';
import StepTitle from '@alchemist/theta-sketch/components/StepTitle';
import StepProgressIndicator from '@alchemist/theta-sketch/components/StepProgressIndicator';

import * as Settings from '@mui/icons-material/Settings';
import * as SportsEsports from '@mui/icons-material/SportsEsports';

const SettingsIcon = Settings.default as unknown as React.ElementType;
const SportsEsportsIcon = SportsEsports.default as unknown as React.ElementType;

function SetOperationsPage() {
    const defaultK = 25;
    const defaultStreamASize = 60;
    const defaultStreamBSize = 80;
    const [k, setK] = React.useState(defaultK);
    const [streamASize, setStreamASize] = React.useState(defaultStreamASize);
    const [streamBSize, setStreamBSize] = React.useState(defaultStreamBSize);

    // Flow step: 0 = config, 1 = demo
    const [flowStep, setFlowStep] = React.useState<number>(0);

    const KmvSettingsToggle = () => (
        <Tooltip title={flowStep === 0 ? 'Close Config' : 'Open Config'} placement="left">
            <IconButton
                onClick={() => setFlowStep(flowStep === 0 ? -1 : 0)}
                sx={{
                    zIndex: 1000
                }}
                color="secondary"
                size="large"
            >
                <SettingsIcon />
            </IconButton>
        </Tooltip>
    );

    const DemoToggle = () => (
        <Tooltip title={flowStep === 1 ? 'Hide Demo' : 'Show Demo'} placement="left">
            <IconButton
                onClick={() => setFlowStep(flowStep === 1 ? -1 : 1)}
                sx={{
                    zIndex: 1000
                }}
                color="secondary"
                size="large"
            >
                <SportsEsportsIcon />
            </IconButton>
        </Tooltip>
    );

    return (
        <>
            <StepTitle title="Set Operations" />
            <StepProgressIndicator currentStepId="set-operations" />

            {/* Configuration */}
            {flowStep === 0 && (
                <KmvConfigDialog
                    open={true}
                    onClose={() => { }}
                    onStart={() => setFlowStep(1)}
                    k={k}
                    streamASize={streamASize}
                    streamBSize={streamBSize}
                    setK={setK}
                    setStreamASize={setStreamASize}
                    setStreamBSize={setStreamBSize}
                    defaultK={defaultK}
                    defaultStreamASize={defaultStreamASize}
                    defaultStreamBSize={defaultStreamBSize}
                />
            )}

            {/* Visualization */}
            {flowStep === 1 && (
                <SetOperationsVisualization
                    k={k}
                    streamASize={streamASize}
                    streamBSize={streamBSize}
                />
            )}

            {/* Toggle buttons */}
            <Stack
                direction="column"
                justifyContent="center"
                spacing={2}
                sx={{
                    position: 'fixed',
                    right: 20,
                    zIndex: 1000,
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
            >
                <KmvSettingsToggle />
                <DemoToggle />
            </Stack>
        </>
    );
}

export default SetOperationsPage;
