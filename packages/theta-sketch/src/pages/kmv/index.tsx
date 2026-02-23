import React from 'react';
import { Stepper, Step, StepButton, useTheme, StepConnector } from '@mui/material';
import Recap from './KmvRecap';
import Config from './KmvConfig';
import StepTitle from '@alchemist/theta-sketch/components/StepTitle';

import SettingsIcon from '@mui/icons-material/Settings';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import StepProgressIndicator from '@alchemist/theta-sketch/components/StepProgressIndicator';
import KmvVisualization from './KmvVisualization';

function ThetaSketchPageContent() {
    const theme = useTheme();
    const defaultK = 10;
    const defaultStreamSize = 50;
    const [k, setK] = React.useState(defaultK);
    const [streamSize, setStreamSize] = React.useState(defaultStreamSize);

    // Progressive flow step: 0 = intro/recap, 1 = setup (implementation + config), 2 = demo
    const [flowStep, setFlowStep] = React.useState<number>(0);
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
                connector={
                    <StepConnector
                        sx={{
                            '&.MuiStepConnector-vertical': { ml: `${40 / 2}px` },
                        }}
                    />
                }
                activeStep={flowStep}
                orientation="vertical"
                sx={{
                    '& .MuiStepIcon-root': { fontSize: 40 },
                    position: 'fixed',
                    left: 24,
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
            >
                <Step>
                    <StepButton
                        onClick={() => setFlowStep(0)}
                        icon={<LightbulbIcon sx={{ color: iconColor(0), fontSize: 40 }} />}
                    >
                        Recap
                    </StepButton>
                </Step>
                <Step>
                    <StepButton
                        onClick={() => setFlowStep(1)}
                        icon={<SettingsIcon sx={{ color: iconColor(1), fontSize: 40 }} />}
                    >
                        Config
                    </StepButton>
                </Step>
                <Step>
                    <StepButton
                        onClick={() => setFlowStep(2)}
                        icon={<RocketLaunchIcon sx={{ color: iconColor(2), fontSize: 40 }} />}
                    >
                        Demo
                    </StepButton>
                </Step>
            </Stepper>

        </>
    );
}

export default ThetaSketchPageContent;
