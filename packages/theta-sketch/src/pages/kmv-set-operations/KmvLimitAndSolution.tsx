import React from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Fade, Paper, Stack, Typography } from '@mui/material';
import { slideUp, useSpeech } from '@alchemist/shared';
import TimelinePlayer from '@alchemist/theta-sketch/components/TimelinePlayer';
import { calculateStepTimings } from '@alchemist/theta-sketch/utils/narration';

import StepProgressIndicator from '../../components/StepProgressIndicator';
import { KmvSetOperationHeader } from './KmvSetOperationsSharedComponents';

const DESCRIPTION = `
The limit of KMV intersection and difference operations is that the result cannot be used in further set operations because θ is not stored. Saving θ in the result fixes that and what we get is Theta Sketch.
`;

const NARRATION: Record<number, string> = {
    0: 'This page summarizes the KMV limitation and the Theta Sketch solution.',
    1: 'For intersection and difference, KMV uses a shared theta, min of theta A and theta B. But KMV stores only values, and the result may have fewer than K values.',
    2: 'So theta inferred from the result may not match the operation theta, and composition breaks. The fix is to store theta explicitly with the retained values. That is Theta Sketch.',
};

const { startTimes: NARRATION_START, durations: NARRATION_DUR } = calculateStepTimings(NARRATION, 1.0);

export default function KmvLimitAndSolution() {
    const navigate = useNavigate();
    const { speak, stop } = useSpeech({ rate: 1.0 });
    const [timeline, setTimeline] = React.useState<gsap.core.Timeline | null>(null);
    const [uiStep, setUiStep] = React.useState(0);
    const [currentNarration, setCurrentNarration] = React.useState('');

    React.useEffect(() => {
        const tl = gsap.timeline({ paused: true });
        const stepIds = Object.keys(NARRATION).map(Number).sort((a, b) => a - b);

        stepIds.forEach((step) => {
            const atTime = NARRATION_START[step] ?? 0;
            const duration = NARRATION_DUR[step] ?? 0.8;

            tl.call(() => {
                const text = NARRATION[step] ?? '';
                setUiStep(step);
                setCurrentNarration(text);
                if (text) speak(text);
            }, undefined, atTime);

            tl.to({}, { duration }, atTime);
        });

        setTimeline(tl);
        return () => {
            tl.kill();
            stop();
        };
    }, [speak, stop]);

    return (
        <>
            <KmvSetOperationHeader title="KMV Limit and Solution" description={DESCRIPTION} />

            <StepProgressIndicator currentStepId="set-operations" />

            <Container
                maxWidth="md"
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4,
                }}
            >
                <Stack
                    spacing={5}
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        width: '100%',
                        maxWidth: { xs: '92vw', md: 900 },
                        mx: 'auto',
                        background: "transparent",
                        transform: { xs: 'translateY(-4vh)', md: 'translateY(-6vh)' },
                    }}
                >
                    <Fade in={uiStep >= 1} timeout={450}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                background: "transparent",
                            }}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1.25 }}>
                                KMV limitation for intersection and difference
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.85 }}>
                                KMV stores only values, not θ. For intersection and difference, the operation uses a shared threshold
                                <strong> θ = min(θ_A, θ_B)</strong>. However, the resulting sketch may have fewer than K values, so θ inferred from the
                                result may not equal the operation θ. Because that θ is missing, the new sketch is not safely composable for further
                                set operations.
                            </Typography>
                        </Paper>
                    </Fade>

                    <Fade in={uiStep >= 2} timeout={450}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                background: "transparent",
                            }}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1.25 }}>
                                Solution: store θ explicitly (Theta Sketch)
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.85 }}>
                                To make intersection and difference composable, we store θ with the retained values in the result.
                                This preserves the correct operation threshold for chaining, and that is exactly a <strong>Theta Sketch</strong>.
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
                                <strong>Theta Sketch = KMV values + stored θ</strong>
                            </Typography>
                        </Paper>
                    </Fade>
                </Stack>
            </Container>

            <Fade in={!!currentNarration}>
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: window.innerHeight / 12 + 140,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'min(900px, calc(100vw - 32px))',
                        zIndex: 1001,
                        textAlign: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    <Typography variant="body2" sx={{ color: 'text.primary', px: 3, py: 1.25 }}>
                        {currentNarration}
                    </Typography>
                </Box>
            </Fade>

            <Container
                maxWidth="sm"
                sx={{
                    position: 'fixed',
                    bottom: window.innerHeight / 12,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    animation: `${slideUp} 1s ease-out 0.25s both`,
                }}
            >
                {timeline && (
                    <TimelinePlayer
                        timeline={timeline}
                        showNextButton={true}
                        onNext={() => {
                            speechSynthesis.cancel();
                            timeline.pause();
                            stop();
                            navigate('/theta-sketch/theta-sketch');
                        }}
                        nextButtonTooltip="Go to Theta Sketch"
                        enableNextButton={true}
                        onStart={() => {
                            timeline.play();
                            speechSynthesis.resume();
                        }}
                        onPause={() => {
                            timeline.pause();
                            speechSynthesis.pause();
                        }}
                        onComplete={() => {
                            speechSynthesis.cancel();
                            timeline.pause();
                            stop();
                        }}
                    />
                )}
            </Container>
        </>
    );
}
