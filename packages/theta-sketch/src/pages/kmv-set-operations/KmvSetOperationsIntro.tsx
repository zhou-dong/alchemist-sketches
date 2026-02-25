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
KMV supports union, intersection, and difference estimation. But it does not store θ in its result, so the result might not be used in further set operations.
`;

const NARRATION: Record<number, string> = {
    0: 'This page introduces KMV set operations.' + DESCRIPTION,
    1: 'Union is composable in KMV because the result still keeps K values, so theta can be recovered from the maximum stored value.',
    2: 'Intersection estimation works, but it uses shared theta equal to min of theta A and theta B. The result may have fewer than K values, so inferred theta from the result may not match the operation theta.',
    3: 'Difference has the same issue as intersection: estimation works, but the result is not safely composable for further set operations.',
    4: `Click next to see how KMV handles each set operation.`,
};

const { startTimes: NARRATION_START, durations: NARRATION_DUR } = calculateStepTimings(NARRATION, 1.0);

export default function KmvSetOperationsIntroPage() {
    const navigate = useNavigate();
    const { speak, stop, pause, resume } = useSpeech({ rate: 1.0 });
    const [timeline, setTimeline] = React.useState<gsap.core.Timeline | null>(null);
    const [uiStep, setUiStep] = React.useState(0);
    const [currentNarration, setCurrentNarration] = React.useState('');
    const isMutedRef = React.useRef(false);

    React.useEffect(() => {
        const tl = gsap.timeline({ paused: true });
        const stepIds = Object.keys(NARRATION)
            .map((k) => Number(k))
            .sort((a, b) => a - b);

        stepIds.forEach((step) => {
            const atTime = NARRATION_START[step] ?? 0;
            const duration = NARRATION_DUR[step] ?? 0.8;

            tl.call(() => {
                const text = NARRATION[step] ?? '';
                setUiStep(step);
                setCurrentNarration(text);
                if (!isMutedRef.current && text) speak(text);
            }, undefined, atTime);

            // Keep a segment for player progress/scrubbing.
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
            <StepProgressIndicator currentStepId="set-operations" />

            <KmvSetOperationHeader title="KMV Set Operations" description={DESCRIPTION} />

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
                            opacity: uiStep >= 1 ? 1 : 0,
                            visibility: uiStep >= 1 ? 'visible' : 'hidden',
                            transform: uiStep >= 1 ? 'translateY(0px) scale(1)' : 'translateY(16px) scale(0.985)',
                            filter: uiStep >= 1 ? 'blur(0px)' : 'blur(3px)',
                            transition: 'opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1), filter 520ms ease',
                            willChange: 'opacity, transform, filter',
                            pointerEvents: uiStep >= 1 ? 'auto' : 'none',
                        }}
                    >
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                background: "transparent",
                            }}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                                Union (A ∪ B): composable in KMV
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                After merge + dedupe + keep K smallest values, the union result is still a valid KMV sketch. The threshold can be inferred from
                                the new sketch as max(values), so further set operations remain safe.
                            </Typography>
                        </Paper>
                    </Box>

                    <Box
                        sx={{
                            opacity: uiStep >= 2 ? 1 : 0,
                            visibility: uiStep >= 2 ? 'visible' : 'hidden',
                            transform: uiStep >= 2 ? 'translateY(0px) scale(1)' : 'translateY(16px) scale(0.985)',
                            filter: uiStep >= 2 ? 'blur(0px)' : 'blur(3px)',
                            transition: 'opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1), filter 520ms ease',
                            willChange: 'opacity, transform, filter',
                            pointerEvents: uiStep >= 2 ? 'auto' : 'none',
                        }}
                    >
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                background: "transparent",
                            }}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                                Intersection (A ∩ B): estimation works, but the result might not be composable for further set operations
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                Intersection uses a shared threshold θ = min(θ_A, θ_B). The resulting sketch might contain fewer than K values, so inferring θ from
                                that new sketch might not recover the θ used by the operation, so the result is not composable.
                            </Typography>
                        </Paper>
                    </Box>

                    <Box
                        sx={{
                            opacity: uiStep >= 3 ? 1 : 0,
                            visibility: uiStep >= 3 ? 'visible' : 'hidden',
                            transform: uiStep >= 3 ? 'translateY(0px) scale(1)' : 'translateY(16px) scale(0.985)',
                            filter: uiStep >= 3 ? 'blur(0px)' : 'blur(3px)',
                            transition: 'opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1), filter 520ms ease',
                            willChange: 'opacity, transform, filter',
                            pointerEvents: uiStep >= 3 ? 'auto' : 'none',
                        }}
                    >
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                background: "transparent",
                            }}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                                Difference (A ∖ B): estimation works, but the same limitation as intersection
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                Same as intersection, difference uses shared θ = min(θ_A, θ_B). The new sketch might have fewer than K values, so inferred θ from the result is
                                not guaranteed to be the original operation θ. That breaks safe chaining for further set operations.
                            </Typography>
                        </Paper>
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
                        onNext={() => {
                            navigate('/theta-sketch/kmv-set-ops?op=union');
                        }}
                        nextButtonTooltip="Go to KMV Union"
                        enableNextButton={true}
                        onStart={() => {
                            if (!isMutedRef.current) resume();
                        }}
                        onPause={() => {
                            pause();
                        }}
                        onComplete={() => {
                            stop();
                        }}
                    />
                )}
            </Container>
        </>
    );
}
