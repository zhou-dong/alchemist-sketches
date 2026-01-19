import React from 'react';
import { Tooltip, IconButton, Stack } from '@mui/material';
import KseToKmv from './KseToKmv';
import KmvConfig from './KmvConfigDialog';
import KmvVisualization from './KmvVisualization';
import StepTitle from '@alchemist/theta-sketch/components/StepTitle';

import * as Settings from '@mui/icons-material/Settings';
import * as TipsAndUpdates from '@mui/icons-material/TipsAndUpdates';
import * as SportsEsports from '@mui/icons-material/SportsEsports';

const SettingsIcon = Settings.default as unknown as React.ElementType;
const TipsAndUpdatesIcon = TipsAndUpdates.default as unknown as React.ElementType;
const SportsEsportsIcon = SportsEsports.default as unknown as React.ElementType;

function ThetaSketchPageContent() {
    const defaultK = 10;
    const defaultStreamSize = 50;
    const [k, setK] = React.useState(defaultK);
    const [streamSize, setStreamSize] = React.useState(defaultStreamSize);

    // Progressive flow step: 0 = intro, 1 = config, 2 = demo
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

            {/* Introduction */}
            {flowStep === 0 && <KseToKmv onClose={() => setFlowStep(1)} />}

            {/* Configuration */}
            {flowStep === 1 && (
                <KmvConfig
                    onStart={() => setFlowStep(2)}
                    k={k}
                    streamSize={streamSize}
                    setK={setK}
                    setStreamSize={setStreamSize}
                    defaultK={defaultK}
                    defaultStreamSize={defaultStreamSize}
                />
            )}

            {/* Visualization with Timeline Player */}
            {flowStep === 2 && <KmvVisualization k={k} streamSize={streamSize} />}

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
