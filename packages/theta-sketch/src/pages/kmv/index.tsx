import React from 'react';
import { Stepper, Step, StepButton, alpha, useTheme } from '@mui/material';
import Recap from './KmvRecap';
import Config from './KmvConfig';
import StepTitle from '@alchemist/theta-sketch/components/StepTitle';

import * as Settings from '@mui/icons-material/Settings';
import * as TipsAndUpdates from '@mui/icons-material/TipsAndUpdates';
import * as RocketLaunch from '@mui/icons-material/RocketLaunch';
import StepProgressIndicator from '@alchemist/theta-sketch/components/StepProgressIndicator';
import KmvVisualization from './KmvVisualization';

const SettingsIcon = Settings.default as unknown as React.ElementType;
const TipsAndUpdatesIcon = TipsAndUpdates.default as unknown as React.ElementType;
const RocketLaunchIcon = RocketLaunch.default as unknown as React.ElementType;

function ThetaSketchPageContent() {
    const theme = useTheme();
    const defaultK = 10;
    const defaultStreamSize = 50;
    const [k, setK] = React.useState(defaultK);
    const [streamSize, setStreamSize] = React.useState(defaultStreamSize);

    // Progressive flow step: 0 = intro/recap, 1 = setup (implementation + config), 2 = demo
    const [flowStep, setFlowStep] = React.useState<number>(0);

    const activeStep = flowStep >= 0 ? flowStep : -1;
    const iconColor = (step: number) => (flowStep === step ? theme.palette.primary.main : theme.palette.text.disabled);

    return (
        <>
            <StepTitle title="K Minimum Value (KMV)" />
            <StepProgressIndicator currentStepId="kmv" />

            {/* Introduction */}
            {flowStep === 0 && <Recap onClose={() => setFlowStep(1)} />}

            {/* Setup (implementation + configuration) */}
            {flowStep === 1 && (
                <Config
                    key="kmv-setup"
                    k={k}
                    streamSize={streamSize}
                    setK={setK}
                    setStreamSize={setStreamSize}
                    defaultK={defaultK}
                    defaultStreamSize={defaultStreamSize}
                    onStart={() => setFlowStep(2)}
                />
            )}

            {/* Demo */}
            {flowStep === 2 && (
                <KmvVisualization k={k} streamSize={streamSize} />
            )}

            {/* Stepper navigation */}
            <Stepper
                nonLinear
                activeStep={activeStep}
                orientation="vertical"
                sx={{
                    '& .MuiStepConnector-line': {
                        borderColor: alpha(theme.palette.divider, 0.5),
                    },
                    position: 'fixed',
                    left: 24,
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
            >
                <Step completed={false}>
                    <StepButton
                        onClick={() => setFlowStep(0)}
                        icon={<TipsAndUpdatesIcon sx={{ color: iconColor(0) }} />}
                        sx={{
                            borderRadius: 2,
                            '& .MuiStepLabel-label': {
                                color: flowStep === 0 ? theme.palette.primary.main : theme.palette.text.disabled,
                                fontWeight: flowStep === 0 ? 700 : 500,
                            },
                        }}
                    >
                        Recap
                    </StepButton>
                </Step>
                <Step completed={false}>
                    <StepButton
                        onClick={() => setFlowStep(1)}
                        icon={<SettingsIcon sx={{ color: iconColor(1) }} />}
                        sx={{
                            borderRadius: 2,
                            '& .MuiStepLabel-label': {
                                color: flowStep === 1 ? theme.palette.primary.main : theme.palette.text.disabled,
                                fontWeight: flowStep === 1 ? 700 : 500,
                            },
                        }}
                    >
                        Configure
                    </StepButton>
                </Step>
                <Step completed={false}>
                    <StepButton
                        onClick={() => setFlowStep(2)}
                        icon={<RocketLaunchIcon sx={{ color: iconColor(2) }} />}
                        sx={{
                            borderRadius: 2,
                            '& .MuiStepLabel-label': {
                                color: flowStep === 2 ? theme.palette.primary.main : theme.palette.text.disabled,
                                fontWeight: flowStep === 2 ? 700 : 500,
                            },
                        }}
                    >
                        Run demo
                    </StepButton>
                </Step>
            </Stepper>

        </>
    );
}

export default ThetaSketchPageContent;
