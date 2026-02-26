import React from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Fade, Stack, Typography, alpha, useTheme } from '@mui/material';
import { slideUp, useSpeech } from '@alchemist/shared';
import TimelinePlayer from '@alchemist/theta-sketch/components/TimelinePlayer';
import { calculateStepTimings } from '@alchemist/theta-sketch/utils/narration';
import { ThetaSketchSetOperationHeader } from './ThetaSketchSetOperationsSharedComponents';

const DESCRIPTION = `The natural evolution of KMV is to store theta explicitly in each sketch, which leads to Theta Sketch.`;

const NARRATION: Record<number, string> = {
    0: 'This page introduces the natural evolution of KMV.',
    1: 'The KMV does not store theta explicitly, so the result cannot be used in further set operations.',
    2: 'The natural evolution is to store theta explicitly in each sketch, which leads to Theta Sketch.',
    3: 'Theta Sketch equals KMV values plus stored theta.',
    4: 'Click next to see how Theta Sketch performs set operations.',
};

const { startTimes: NARRATION_START, durations: NARRATION_DUR } = calculateStepTimings(NARRATION, 1.0);

export default function ThetaSketchSetOperationsIntro() {
    const navigate = useNavigate();
    const theme = useTheme();
    const { speak, stop, pause, resume } = useSpeech({ rate: 1.0 });
    const [timeline, setTimeline] = React.useState<gsap.core.Timeline | null>(null);
    const [uiStep, setUiStep] = React.useState(0);
    const [currentNarration, setCurrentNarration] = React.useState('');
    const isMutedRef = React.useRef(false);

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
                if (!isMutedRef.current && text) speak(text);
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
            <ThetaSketchSetOperationHeader title="From KMV to Theta Sketch" description={DESCRIPTION} />

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
                    spacing={2.5}
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
                    <Box
                        sx={{
                            width: '100%',
                            mt: 1.25,
                            px: 2,
                            py: 1.25,
                            borderRadius: 2,
                            border: `1px solid lightgray`,
                            borderLeft: `4px solid ${alpha(theme.palette.primary.main, 0.8)}`,
                            background: "transparent",
                            opacity: uiStep >= 1 ? 1 : 0,
                            transform: uiStep >= 1 ? 'translateY(0px)' : 'translateY(10px)',
                            transition: 'opacity 450ms ease 100ms, transform 450ms ease 100ms',
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.3 }}>
                            KMV limitation
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            KMV does not store θ explicitly, so the result may not be safely reused for further set operations.
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            width: '100%',
                            px: 2,
                            py: 1.25,
                            borderRadius: 2,
                            border: `1px solid lightgray`,
                            borderLeft: `4px solid ${alpha(theme.palette.primary.main, 0.8)}`,
                            background: "transparent",
                            opacity: uiStep >= 2 ? 1 : 0,
                            transform: uiStep >= 2 ? 'translateY(0px)' : 'translateY(10px)',
                            transition: 'opacity 450ms ease, transform 450ms ease',
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.3 }}>
                            Natural evolution
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            The natural evolution is to store θ explicitly in each sketch, which leads to Theta Sketch.
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            width: '100%',
                            px: 2,
                            py: 1.25,
                            borderRadius: 2,
                            border: `1px solid lightgray`,
                            borderLeft: `4px solid ${alpha(theme.palette.primary.main, 0.8)}`,
                            background: "transparent",
                            opacity: uiStep >= 3 ? 1 : 0,
                            transform: uiStep >= 3 ? 'translateY(0px)' : 'translateY(10px)',
                            transition: 'opacity 450ms ease, transform 450ms ease',
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.3 }}>
                            Core formula
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.25, fontWeight: 600, letterSpacing: 0.1 }}>
                            Theta Sketch = KMV values + stored θ
                        </Typography>
                    </Box>
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
                    <Typography variant="body2" sx={{ color: 'text.primary', px: 3, py: 0 }}>
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
                        nextButtonTooltip="Go to Theta Sketch Union"
                        onNext={() => navigate('/theta-sketch/theta-sketch-set-operations?op=union')}
                        enableNextButton={true}
                        onStart={() => { resume(); }}
                        onPause={() => { pause(); }}
                        onComplete={() => { stop(); }}
                    />
                )}
            </Container>
        </>
    );
}

