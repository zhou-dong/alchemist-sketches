import React from 'react';
import { type TimelineSceneThree, render, axis, text, circle } from 'obelus-three-render';
import { axisStyle, circleStyle, textStyle } from '@alchemist/theta-sketch/theme/obelusTheme';
import { useDualThreeStage } from '@alchemist/theta-sketch/hooks/useDualThreeStage';
import { buildAnimateTimeline } from 'obelus-gsap-animator';
import { useSetOperationsDemoData } from './SetOperationsDemoShared';
import { useOrthographicImmediateResize } from '@alchemist/theta-sketch/hooks/useOrthographicResize';
import * as THREE from 'three';
import { at } from 'obelus';
import { alpha, Box, Chip, Container, Divider, Fade, Paper, Stack, Typography, useTheme } from '@mui/material';
import { slideUp, useSpeech } from '@alchemist/shared';
import TimelinePlayer from '@alchemist/theta-sketch/components/TimelinePlayer';
import { clearScene, disposeDualSceneResources } from '@alchemist/theta-sketch/utils/threeUtils';
import { NewThetaLimitNote, SetCard } from './SetOperationsDemoShared';
import { calculateStepTimings } from '@alchemist/theta-sketch/utils/narration';
interface Position {
    x: number;
    y: number;
}

const NARRATION: Record<number, string> = {
    0: `On this page, we will compute a union using KMV sketches. Each sketch keeps only the K smallest hash values, and theta is inferred as the K-th value.`,
    1: `Step one. This is Sketch A. It contains the K smallest hash values from stream A.`,
    2: `Step two. This is Sketch B. It contains the K smallest hash values from stream B.`,
    3: `Step three. To union two KMV sketches, we merge the values, remove duplicates, sort, and keep the K smallest values. Theta is then inferred as the maximum of those K values.`,
    4: `Notice the limitation. KMV does not store theta explicitly. If you want to do further set operations, you must keep theta. That is exactly why we introduce Theta Sketch.`,
};

const { startTimes: NARRATION_START, durations: NARRATION_DUR } = calculateStepTimings(NARRATION, 1.0);

const STEP_LABELS: Record<number, string> = {
    0: 'Intro',
    1: 'Sketch A',
    2: 'Sketch B',
    3: 'Union sketch',
    4: 'Why union is safe',
};

function StepBlock({
    show,
    children,
    delayMs = 0,
}: {
    show: boolean;
    children: React.ReactNode;
    delayMs?: number;
}) {
    return (
        <Box
            sx={{
                opacity: show ? 1 : 0,
                transform: show ? 'translateX(0px)' : 'translateX(-12px)',
                transition: `opacity 320ms ease, transform 320ms ease`,
                transitionDelay: `${delayMs}ms`,
                pointerEvents: show ? 'auto' : 'none',
            }}
        >
            {children}
        </Box>
    );
}

const buildAxis = (start: Position, end: Position, title?: string) => {
    const randomId = Math.random().toString(36).substring(2, 15);

    const axisLineId = `axis_line_${randomId}`;
    const axisStartId = `axis_start_${randomId}`;
    const axisEndId = `axis_end_${randomId}`;
    const axisTitleId = `axis_title_${randomId}`;

    const axisLine = axis(axisLineId, start, end, { ...axisStyle, dotCount: 2 });
    const axisStart = text(axisStartId, "0", { x: start.x, y: start.y - 15 }, textStyle);
    const axisEnd = text(axisEndId, "1", { x: end.x, y: end.y - 15 }, textStyle);
    const axisTitle = title
        ? text(axisTitleId, title, { x: start.x, y: start.y + 18 }, { ...textStyle, fontSize: '18px' } as any)
        : null;

    return { axisLineId, axisStartId, axisEndId, axisTitleId, axisLine, axisStart, axisEnd, axisTitle };
};

const buildDot = (name: string, start: Position, end: Position, value: number) => {
    const radius = 3;
    const scale = end.x - start.x;
    const x = start.x + value * scale;
    const y = start.y;
    const dotId = `${name}_dot_${value}`;
    const dot = circle(dotId, radius, { x, y }, circleStyle);
    return { dotId, dot };
};

const buildAxisAndDots = (name: string, start: Position, end: Position, values: number[]) => {
    const axisTitle = name === 'a' ? 'Sketch A (KMV)' : name === 'b' ? 'Sketch B (KMV)' : 'Union sketch (KMV)';
    const axis = buildAxis(start, end, axisTitle);
    const dots = values.map((value) => buildDot(name, start, end, value));
    return { axis, dots };
};

const buildTimelineSteps = (
    time: number,
    axisLineId: string,
    axisStartId: string,
    axisEndId: string,
    dotIds: string[],
    extraIds: string[] = [],
    durationSeconds: number = 1
) => {
    const steps: any[] = [];
    const buildAndAddStep = (id: string) => {
        steps.push(
            at(time).animate(id, { position: { y: `+=${window.innerHeight}` } }, { duration: durationSeconds })
        );
    };

    buildAndAddStep(axisLineId);
    buildAndAddStep(axisStartId);
    buildAndAddStep(axisEndId);
    extraIds.forEach((id) => buildAndAddStep(id));
    dotIds.forEach((dotId) => buildAndAddStep(dotId));
    return steps;
};

interface KmvUnionProps {
    sketchA: { values: number[]; theta: number };
    sketchB: { values: number[]; theta: number };
    union: { values: number[]; theta: number; estimated: number };
    k: number;
}

const Main = ({ sketchA, sketchB, union, k }: KmvUnionProps) => {
    const theme = useTheme();

    // useSyncObelusTheme();
    const { animationController, containerRef, scene, renderer, camera } = useDualThreeStage();
    const { speak, stop, pause, resume } = useSpeech({ rate: 1.0 });

    useOrthographicImmediateResize(
        renderer,
        camera as THREE.OrthographicCamera,
        { onResize: () => animationController?.renderAnimationOnce?.() }
    );

    const [timeline, setTimeline] = React.useState<any>(null);
    const [uiStep, setUiStep] = React.useState<number>(0);
    const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
    const [currentNarration, setCurrentNarration] = React.useState<string>('');
    const lastSpokenStepRef = React.useRef<number>(-1);

    const speakStep = React.useCallback(
        (step: number) => {
            const text = NARRATION[step] ?? '';
            if (!text) return;
            if (lastSpokenStepRef.current === step) return;

            lastSpokenStepRef.current = step;
            setCurrentNarration(text);
            speak(text);
        },
        [speak]
    );

    // Stop speech if the page unmounts.
    React.useEffect(() => stop, [stop]);

    // Drive narration when steps advance (only while playing).
    React.useEffect(() => {
        if (!isPlaying) return;
        speakStep(uiStep);
    }, [isPlaying, speakStep, uiStep]);

    React.useEffect(() => {
        if (!scene || !animationController) return;

        setUiStep(0);
        lastSpokenStepRef.current = -1;
        setCurrentNarration('');

        // Reset scene objects before (re)building.
        disposeDualSceneResources(scene);
        clearScene(scene);

        const startX = -window.innerWidth / 4;
        const endX = window.innerWidth / 4;

        const sketchCValues = union.values;

        const revealDuration = (step: number) =>
            Math.min(0.9, Math.max(0.5, (NARRATION_DUR[step] ?? 1) * 0.45));

        const { axis: axisA, dots: dotsA } = buildAxisAndDots(
            "a",
            { x: startX, y: window.innerHeight / 12 * 3 - window.innerHeight },
            { x: endX, y: window.innerHeight / 12 * 3 - window.innerHeight },
            sketchA.values
        );
        const { axis: axisB, dots: dotsB } = buildAxisAndDots(
            "b",
            { x: startX, y: window.innerHeight / 12 - window.innerHeight },
            { x: endX, y: window.innerHeight / 12 - window.innerHeight },
            sketchB.values
        );
        const { axis: axisC, dots: dotsC } = buildAxisAndDots(
            "c",
            { x: startX, y: -window.innerHeight / 12 - window.innerHeight },
            { x: endX, y: -window.innerHeight / 12 - window.innerHeight },
            sketchCValues
        );

        const timelineScene: TimelineSceneThree = {
            objects: [
                axisA.axisLine,
                axisA.axisStart,
                axisA.axisEnd,
                ...(axisA.axisTitle ? [axisA.axisTitle] : []),
                ...(dotsA.map((dot) => dot.dot)),
                axisB.axisLine,
                axisB.axisStart,
                axisB.axisEnd,
                ...(axisB.axisTitle ? [axisB.axisTitle] : []),
                ...(dotsB.map((dot) => dot.dot)),
                axisC.axisLine,
                axisC.axisStart,
                axisC.axisEnd,
                ...(axisC.axisTitle ? [axisC.axisTitle] : []),
                ...(dotsC.map((dot) => dot.dot)),
            ],
            timeline: [
                ...buildTimelineSteps(
                    NARRATION_START[1] ?? 0,
                    axisA.axisLineId,
                    axisA.axisStartId,
                    axisA.axisEndId,
                    dotsA.map((dot) => dot.dotId),
                    axisA.axisTitle ? [axisA.axisTitleId] : [],
                    revealDuration(1)
                ),
                ...buildTimelineSteps(
                    NARRATION_START[2] ?? 0,
                    axisB.axisLineId,
                    axisB.axisStartId,
                    axisB.axisEndId,
                    dotsB.map((dot) => dot.dotId),
                    axisB.axisTitle ? [axisB.axisTitleId] : [],
                    revealDuration(2)
                ),
                ...buildTimelineSteps(
                    NARRATION_START[3] ?? 0,
                    axisC.axisLineId,
                    axisC.axisStartId,
                    axisC.axisEndId,
                    dotsC.map((dot) => dot.dotId),
                    axisC.axisTitle ? [axisC.axisTitleId] : [],
                    revealDuration(3)
                ),
            ],
        };

        const records = render(timelineScene.objects, scene);
        animationController.renderAnimationOnce();

        const nextTimeline = buildAnimateTimeline(
            timelineScene.timeline,
            records,
            animationController.startAnimation,
            animationController.stopAnimation
        );

        // Keep overlay UI + narration synced to narration timing (seek/restart safe).
        nextTimeline.call(() => setUiStep(0), [], NARRATION_START[0] ?? 0);
        nextTimeline.call(() => setUiStep(1), [], NARRATION_START[1] ?? 0);
        nextTimeline.call(() => setUiStep(2), [], NARRATION_START[2] ?? 0);
        nextTimeline.call(() => setUiStep(3), [], NARRATION_START[3] ?? 0);
        nextTimeline.call(() => setUiStep(4), [], NARRATION_START[4] ?? 0);

        setTimeline(nextTimeline);

        return () => {
            nextTimeline?.kill?.();
            disposeDualSceneResources(scene);
            clearScene(scene);
        };
    }, [animationController, k, scene, sketchA.values, sketchB.values, union.values]);

    return (
        <>
            <Box
                sx={{
                    position: 'fixed',
                    top: { xs: 16, md: 24 },
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    width: { xs: '92%', md: 920 },
                    pointerEvents: 'none',
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 800,
                        letterSpacing: -0.5,
                        mb: 1,
                    }}
                >
                    KMV Union (Three Sketches)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    KMV stores only the K smallest hash values; θ is inferred as the K-th value.
                </Typography>
            </Box>

            <Box
                sx={{
                    position: 'fixed',
                    top: { xs: 'auto', md: 96 },
                    bottom: { xs: 116, md: 'auto' },
                    left: { xs: 12, md: 16 },
                    right: { xs: 12, md: 'auto' },
                    zIndex: 1000,
                    width: { md: 420 },
                    pointerEvents: 'auto',
                }}
            >
                <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                        p: 1.5,
                        borderRadius: 3,
                        background: 'transparent',
                        maxHeight: { xs: 'calc(100vh - 260px)', md: 'calc(100vh - 190px)' },
                        overflowY: 'auto',
                    }}
                >
                    <Stack spacing={1.25}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
                                Walkthrough
                            </Typography>
                            <Chip
                                size="small"
                                label={STEP_LABELS[uiStep] ?? `Step ${uiStep}`}
                                sx={{
                                    fontWeight: 600,
                                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.12),
                                }}
                            />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            Values are hash values in ([0, 1)). KMV keeps only the K smallest.
                        </Typography>
                        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.35) }} />

                        <StepBlock show={uiStep >= 1}>
                            <SetCard
                                title="Sketch A"
                                subtitle={`K = ${k}`}
                                values={sketchA.values}
                                theta={sketchA.theta}
                                estimated={sketchA.theta > 0 ? k / sketchA.theta - 1 : 0}
                                formula="θ = v_k,  N̂ = k/θ − 1"
                                color="#3b82f6"
                            />
                        </StepBlock>

                        <StepBlock show={uiStep >= 2} delayMs={40}>
                            <SetCard
                                title="Sketch B"
                                subtitle={`K = ${k}`}
                                values={sketchB.values}
                                theta={sketchB.theta}
                                estimated={sketchB.theta > 0 ? k / sketchB.theta - 1 : 0}
                                formula="θ = v_k,  N̂ = k/θ − 1"
                                color="#a855f7"
                            />
                        </StepBlock>

                        <StepBlock show={uiStep >= 3} delayMs={60}>
                            <SetCard
                                title="Union (KMV)"
                                subtitle="Merge unique values → keep K smallest"
                                values={union.values}
                                theta={union.theta}
                                estimated={union.estimated}
                                formula="UnionK = sort(A∪B)[:K],  θ = max(UnionK),  N̂ = k/θ − 1"
                                color="#22c55e"
                            />
                        </StepBlock>

                        <StepBlock show={uiStep >= 4} delayMs={80}>
                            <NewThetaLimitNote
                                correctTheta={union.theta}
                                correctThetaLabel="Correct θ for the union sketch"
                                correctThetaDefinition="max(UnionK) (K-th smallest of A ∪ B)"
                                resultValues={union.values}
                                operationLabel="Union"
                                okThetaHint="For union, the result keeps exactly K values, so θ is always recoverable as max(result values). KMV union is safe to chain."
                                lostThetaHint="(Not expected for union) If inferred θ < correct θ, something is wrong with the union result."
                            />
                        </StepBlock>
                    </Stack>
                </Paper>
            </Box>

            {/* Subtitle Display */}
            <Fade in={!!currentNarration}>
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: { xs: 184, md: 184 },
                        left: '50%',
                        transform: 'translateX(-50%)',
                        maxWidth: 'min(900px, 92vw)',
                        zIndex: 1001,
                        textAlign: 'center',
                        px: 2,
                        pointerEvents: 'none',
                    }}
                >
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.primary',
                            px: 3,
                            py: 1.5,
                        }}
                    >
                        {currentNarration}
                    </Typography>
                </Box>
            </Fade>

            <Container
                maxWidth="sm"
                sx={{
                    position: 'fixed',
                    bottom: { xs: 12, md: 24 },
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    animation: `${slideUp} 1s ease-out 0.25s both`,
                }}
            >
                {timeline && animationController && (
                    <TimelinePlayer
                        timeline={timeline}
                        showNextButton={true}
                        showMuteButton={false}
                        nextPagePath="/theta-sketch/set-operations"
                        nextPageTitle="Go to Set Operations"
                        enableNextButton={true}
                        onStart={() => {
                            setIsPlaying(true);
                            animationController.startAnimation();
                            resume();
                            // If starting from the beginning, speak the intro right away.
                            if (uiStep === 0) speakStep(0);
                        }}
                        onPause={() => {
                            setIsPlaying(false);
                            animationController.stopAnimation();
                            pause();
                        }}
                        onComplete={() => {
                            setIsPlaying(false);
                            animationController.stopAnimation();
                            stop();
                        }}
                    />
                )}
            </Container>
            <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />
        </>
    );
}

export default function KmvUnion() {

    const k = 10;
    const streamASize = 15;
    const streamBSize = 20;

    const { sketchA, sketchB, union } = useSetOperationsDemoData(k, streamASize, streamBSize, 0);

    return (
        <Main sketchA={sketchA} sketchB={sketchB} union={union} k={k} />
    );
};
