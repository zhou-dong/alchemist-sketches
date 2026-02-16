import React from 'react';
import { Tooltip, IconButton, Stack } from '@mui/material';
import Recap from './Recap';
import Demo from './Demo';
import StepTitle from '@alchemist/theta-sketch/components/StepTitle';

import * as Settings from '@mui/icons-material/Settings';
import * as TipsAndUpdates from '@mui/icons-material/TipsAndUpdates';
import * as SportsEsports from '@mui/icons-material/SportsEsports';
import StepProgressIndicator from '@alchemist/theta-sketch/components/StepProgressIndicator';

const SettingsIcon = Settings.default as unknown as React.ElementType;
const TipsAndUpdatesIcon = TipsAndUpdates.default as unknown as React.ElementType;
const SportsEsportsIcon = SportsEsports.default as unknown as React.ElementType;

function ThetaSketchPageContent() {
    const defaultK = 10;
    const defaultStreamSize = 50;
    const [k, setK] = React.useState(defaultK);
    const [streamSize, setStreamSize] = React.useState(defaultStreamSize);

    // Progressive flow step: 0 = intro/recap, 1 = setup (implementation + config), 2 = demo
    const [flowStep, setFlowStep] = React.useState<number>(0);

    const IntroductionToggle = () => (
        <Tooltip title={flowStep !== 0 ? 'Show Introduction' : 'Hide Introduction'} placement="left">
            <IconButton
                onClick={() => setFlowStep(flowStep === 0 ? -1 : 0)}
                sx={{
                    zIndex: 1000
                }}
                color="secondary"
                size="large"
            >
                <TipsAndUpdatesIcon />
            </IconButton>
        </Tooltip>
    );

    const KmvSettingsToggle = () => (
        <Tooltip title={flowStep === 1 ? 'Close Config' : 'KMV Config'} placement="left">
            <IconButton
                onClick={() => setFlowStep(flowStep === 1 ? -1 : 1)}
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

    const TimelinePlayerToggle = () => (
        <Tooltip title={flowStep === 2 ? 'Hide Demo' : 'Show Demo'} placement="left">
            <IconButton
                onClick={() => setFlowStep(flowStep === 2 ? -1 : 2)}
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
            <StepTitle title="K Minimum Value (KMV)" />
            <StepProgressIndicator currentStepId="kmv" />

            {/* Introduction */}
            {flowStep === 0 && <Recap onClose={() => setFlowStep(1)} />}

            {/* Setup (implementation + configuration) */}
            {flowStep === 1 && (
                <Demo
                    key="kmv-setup"
                    defaultView="setup"
                    k={k}
                    streamSize={streamSize}
                    setK={setK}
                    setStreamSize={setStreamSize}
                    defaultK={defaultK}
                    defaultStreamSize={defaultStreamSize}
                />
            )}

            {/* Demo */}
            {flowStep === 2 && (
                <Demo
                    key="kmv-demo"
                    defaultView="demo"
                    k={k}
                    streamSize={streamSize}
                    setK={setK}
                    setStreamSize={setStreamSize}
                    defaultK={defaultK}
                    defaultStreamSize={defaultStreamSize}
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
                }}>
                <IntroductionToggle />
                <KmvSettingsToggle />
                <TimelinePlayerToggle />
            </Stack>

        </>
    );
}

export default ThetaSketchPageContent;
