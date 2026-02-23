import React from 'react';
import { type TimelineSceneThree, render, axis, circle, latex } from 'obelus-three-render';
import { axisStyle, circleStyle, textStyle, useSyncObelusTheme } from '@alchemist/theta-sketch/theme/obelusTheme';
import { useDualThreeStage } from '@alchemist/theta-sketch/hooks/useDualThreeStage';
import { buildAnimateTimeline } from 'obelus-gsap-animator';
import { useSetOperationsDemoData } from './SetOperationsDemoShared';
import { useOrthographicImmediateResize } from '@alchemist/theta-sketch/hooks/useOrthographicResize';
import * as THREE from 'three';
import { at } from 'obelus';
import { alpha, Box, Container, Fade, Paper, Stack, Typography } from '@mui/material';
import { slideUp, useSpeech } from '@alchemist/shared';
import TimelinePlayer from '@alchemist/theta-sketch/components/TimelinePlayer';
import { clearScene, disposeDualSceneResources } from '@alchemist/theta-sketch/utils/threeUtils';
import { calculateStepTimings } from '@alchemist/theta-sketch/utils/narration';
import { NewThetaLimitNote } from './SetOperationsDemoShared';
import { useNavigate } from 'react-router-dom';

interface Position {
    x: number;
    y: number;
}

const NARRATION: Record<number, string> = {
    0: `On this page, we will compute an intersection using KMV sketches. Intersection needs a shared threshold theta, which is the minimum of the two sketch thetas.`,
    1: `This is Sketch A. It contains the K smallest hash values from stream A.`,
    2: `This is Sketch B. It contains the K smallest hash values from stream B.`,
    3: `To compute intersection, we set a common theta as min(theta A, theta B), and keep only values below that theta in each sketch.`,
    4: `The intersection result contains values that appear in both sketches below the common theta. The estimate is the count divided by theta.`,
    5: `This is where KMV hits a limit. The intersection result often has fewer than K values, so the correct theta is not recoverable from the values alone. Saving theta leads to Theta Sketch.`,
};

const { startTimes: NARRATION_START, durations: NARRATION_DUR } = calculateStepTimings(NARRATION, 1.0);

const buildAxis = (start: Position, end: Position) => {
    const randomId = Math.random().toString(36).substring(2, 15);
    const axisLineId = `axis_line_${randomId}`;
    const axisLine = axis(axisLineId, start, end, { ...axisStyle, dotCount: 0 });
    return { axisLineId, axisLine };
};

const buildDot = (start: Position, end: Position, value: number, sizeScale: number) => {
    const randomId = Math.random().toString(36).substring(2, 15);
    const radius = 10;
    const lengthScale = end.x - start.x;
    const x = start.x + value * lengthScale;
    const y = start.y;
    const dotId = `dot_${randomId}_${value}`;
    const dot = circle(dotId, radius, { x, y }, circleStyle);
    (dot.target as THREE.Mesh).scale.set(sizeScale, sizeScale, sizeScale);
    return { dotId, dot, value };
};

const buildLatex = (y: number, latexExpression: string, scale: number) => {
    const randomId = Math.random().toString(36).substring(2, 15);
    const latexId = `latex_${randomId}`;
    const instance = latex(latexId, latexExpression, { x: 0, y: y + 30 }, { ...textStyle, fontSize: '18px' });
    (instance.target as THREE.Mesh).scale.set(scale, scale, scale);
    return { latexId, latex: instance };
};

const buildTimelineSteps = (time: number, axisLineId: string, dotIds: string[]) => {
    const steps: any[] = [];
    const buildAndAddStep = (id: string) => {
        steps.push(at(time).animate(id, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }));
    };
    buildAndAddStep(axisLineId);
    dotIds.forEach((dotId) => buildAndAddStep(dotId));
    return steps;
};

interface KmvIntersectionProps {
    sketchA: { values: number[]; theta: number };
    sketchB: { values: number[]; theta: number };
    intersection: { values: number[]; theta: number; estimated: number };
    k: number;
}

const Main = ({ sketchA, sketchB, intersection, k }: KmvIntersectionProps) => {
    const navigate = useNavigate();
    const { animationController, containerRef, scene, renderer, camera } = useDualThreeStage();
    const { speak, stop, pause, resume } = useSpeech({ rate: 1.0 });
    const commonTheta = Math.min(sketchA.theta, sketchB.theta);

    useSyncObelusTheme();

    const goToSetOperations = React.useCallback(() => {
        navigate('/theta-sketch/set-operations');
    }, [navigate]);

    useOrthographicImmediateResize(renderer, camera as THREE.OrthographicCamera, {
        onResize: () => animationController?.renderAnimationOnce?.(),
    });

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

    React.useEffect(() => stop, [stop]);

    React.useEffect(() => {
        if (!isPlaying) return;
        speakStep(uiStep);
    }, [isPlaying, speakStep, uiStep]);

    React.useEffect(() => {
        if (!scene || !animationController) return;

        setUiStep(0);
        lastSpokenStepRef.current = -1;
        setCurrentNarration('');

        disposeDualSceneResources(scene);
        clearScene(scene);

        const startX = -window.innerWidth / 4;
        const endX = window.innerWidth / 4;

        const aY = window.innerHeight / 12 * 3 - window.innerHeight;
        const axisA = buildAxis({ x: startX, y: aY }, { x: endX, y: aY });
        const dotsA = sketchA.values.map((v) => buildDot({ x: startX, y: aY }, { x: endX, y: aY }, v, 1));
        const dotsA1 = sketchA.values.map((v) => buildDot({ x: startX, y: aY }, { x: endX, y: aY }, v, 1));

        const bY = window.innerHeight / 12 - window.innerHeight;
        const axisB = buildAxis({ x: startX, y: bY }, { x: endX, y: bY });
        const dotsB = sketchB.values.map((v) => buildDot({ x: startX, y: bY }, { x: endX, y: bY }, v, 1));
        const dotsB1 = sketchB.values.map((v) => buildDot({ x: startX, y: bY }, { x: endX, y: bY }, v, 1));

        const cY = -window.innerHeight / 12 - window.innerHeight;
        const axisC = buildAxis({ x: startX, y: cY }, { x: endX, y: cY });
        const dotsC = intersection.values.map((v) => buildDot({ x: startX, y: cY }, { x: endX, y: cY }, v, 0));

        const commonTheta = Math.min(sketchA.theta, sketchB.theta);
        const m = intersection.values.length;

        const latexA = buildLatex(
            aY,
            `\\begin{align*}
\\text{Sketch A (KMV)}\\quad |\\quad k=${k},\\; \\theta_A=${sketchA.theta.toFixed(3)},\\; \\hat{N}_A=\\frac{k}{\\theta_A}-1
\\end{align*}`,
            1
        );
        const latexB = buildLatex(
            bY,
            `\\begin{align*}
\\text{Sketch B (KMV)}\\quad |\\quad k=${k},\\; \\theta_B=${sketchB.theta.toFixed(3)},\\; \\hat{N}_B=\\frac{k}{\\theta_B}-1
\\end{align*}`,
            1
        );
        const latexI = buildLatex(
            cY,
            `\\begin{align*}
\\text{Intersection (KMV)}\\quad |\\quad \\theta=\\min(\\theta_A,\\theta_B)=${commonTheta.toFixed(3)},\\; m=${m},\\; \\hat{N}=\\frac{m}{\\theta}=${intersection.estimated.toFixed(3)}
\\end{align*}`,
            1
        );

        const latexLimit = buildLatex(
            cY - 120,
            `\\begin{align*}
\\text{KMV limit: result has no stored }\\theta\\text{, so it cannot be safely reused for further set ops.}
\\end{align*}`,
            0
        );

        const keepA = new Set(sketchA.values.filter((v) => v < commonTheta));
        const keepB = new Set(sketchB.values.filter((v) => v < commonTheta));
        const inI = new Set(intersection.values);

        const timelineScene: TimelineSceneThree = {
            objects: [
                axisA.axisLine,
                ...dotsA.map((d) => d.dot),
                ...dotsA1.map((d) => d.dot),
                latexA.latex,
                axisB.axisLine,
                ...dotsB.map((d) => d.dot),
                ...dotsB1.map((d) => d.dot),
                latexB.latex,
                axisC.axisLine,
                ...dotsC.map((d) => d.dot),
                latexI.latex,
                latexLimit.latex,
            ],
            timeline: [
                ...buildTimelineSteps(NARRATION_START[1] ?? 1, axisA.axisLineId, dotsA.map((d) => d.dotId)),
                ...dotsA1.map((d) => at(NARRATION_START[1] ?? 1).animate(d.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                at(NARRATION_START[1] ?? 1).animate(latexA.latexId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),

                ...buildTimelineSteps(NARRATION_START[2] ?? 2, axisB.axisLineId, dotsB.map((d) => d.dotId)),
                ...dotsB1.map((d) => at(NARRATION_START[2] ?? 2).animate(d.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                at(NARRATION_START[2] ?? 2).animate(latexB.latexId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),

                ...buildTimelineSteps(NARRATION_START[3] ?? 3, axisC.axisLineId, dotsC.map((d) => d.dotId)),
                at(NARRATION_START[3] ?? 3).animate(latexI.latexId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),

                // Step 3: apply common theta (hide values above theta in each sketch)
                ...dotsA1.map((d) =>
                    at(NARRATION_START[3] ?? 3).animate(
                        d.dotId,
                        { scale: keepA.has(d.value) ? { x: 1, y: 1, z: 1 } : { x: 0, y: 0, z: 0 } },
                        { duration: 0.8 }
                    )
                ),
                ...dotsB1.map((d) =>
                    at(NARRATION_START[3] ?? 3).animate(
                        d.dotId,
                        { scale: keepB.has(d.value) ? { x: 1, y: 1, z: 1 } : { x: 0, y: 0, z: 0 } },
                        { duration: 0.8 }
                    )
                ),

                // Step 4: show the intersection result dots; hide remaining below-theta dots in A/B that are not in intersection.
                ...dotsA1.map((d) =>
                    at(NARRATION_START[4] ?? 4).animate(
                        d.dotId,
                        { scale: inI.has(d.value) ? { x: 1, y: 1, z: 1 } : { x: 0, y: 0, z: 0 } },
                        { duration: 0.8 }
                    )
                ),
                ...dotsB1.map((d) =>
                    at(NARRATION_START[4] ?? 4).animate(
                        d.dotId,
                        { scale: inI.has(d.value) ? { x: 1, y: 1, z: 1 } : { x: 0, y: 0, z: 0 } },
                        { duration: 0.8 }
                    )
                ),
                ...dotsC.map((d) =>
                    at(NARRATION_START[4] ?? 4).animate(d.dotId, { scale: { x: 1, y: 1, z: 1 } }, { duration: 0.8 })
                ),

                // Step 5: show the limit note
                at(NARRATION_START[5] ?? 5).animate(latexLimit.latexId, { scale: { x: 1, y: 1, z: 1 } }, { duration: 0.9 }),
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

        const narrationSize = Object.keys(NARRATION).length;
        for (let i = 0; i < narrationSize; i++) {
            nextTimeline.call(() => setUiStep(i), [], NARRATION_START[i] ?? i);
        }
        nextTimeline.to({}, { duration: NARRATION_DUR[narrationSize - 1] ?? 1 }, NARRATION_START[narrationSize - 1] ?? narrationSize - 1);

        setTimeline(nextTimeline);

        return () => {
            nextTimeline?.kill?.();
            disposeDualSceneResources(scene);
            clearScene(scene);
        };
    }, [animationController, intersection.estimated, intersection.theta, intersection.values, k, scene, sketchA.theta, sketchA.values, sketchB.theta, sketchB.values]);

    return (
        <>
            <Box
                sx={{
                    position: 'fixed',
                    top: window.innerHeight / 12,
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
                    KMV Intersection
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Intersection uses a shared θ = min(θ_A, θ_B). This is where KMV becomes non-composable.
                </Typography>
            </Box>

            <Fade in={!!currentNarration}>
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: window.innerHeight / 12 + 120,
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
                        variant="body2"
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

            {/* KMV limitation callout (intersection) */}
            <Fade in={uiStep >= 5}>
                <Box
                    sx={{
                        position: 'fixed',
                        left: { xs: 12, md: 16 },
                        right: { xs: 12, md: 'auto' },
                        bottom: { xs: 88, md: 120 },
                        zIndex: 1000,
                        width: { md: 520 },
                        pointerEvents: 'none',
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            border: `1px solid ${alpha('#fff', 0.12)}`,
                            background: alpha('#000', 0.22),
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                        }}
                    >
                        <Stack spacing={1.25}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                KMV limitation (Intersection)
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                Intersection is defined by a shared threshold \(\\theta = \\min(\\theta_A, \\theta_B)\). But a KMV result stores only
                                values (often fewer than K), so the correct θ is not stored in the result — that’s why KMV intersection is not composable.
                            </Typography>
                            <NewThetaLimitNote
                                correctTheta={commonTheta}
                                correctThetaDefinition="min(θ_A, θ_B)"
                                correctThetaLabel="Correct θ for intersection"
                                resultValues={intersection.values}
                                operationLabel="Intersection"
                            />
                        </Stack>
                    </Paper>
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
                {timeline && animationController && (
                    <TimelinePlayer
                        timeline={timeline}
                        showNextButton={true}
                        showMuteButton={false}
                        nextButtonTooltip="Go to KMV Difference"
                        enableNextButton={true}
                        onNext={() => {
                            speechSynthesis.cancel();
                            setIsPlaying(false);
                            animationController.stopAnimation();
                            stop();
                            navigate('/theta-sketch/kmv-set-operations?op=difference');
                        }}
                        onStart={() => {
                            setIsPlaying(true);
                            animationController.startAnimation();
                            resume();
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
};

export default function KmvIntersection() {
    const k = 10;
    const streamASize = 15;
    const streamBSize = 20;
    const { sketchA, sketchB, intersection } = useSetOperationsDemoData(k, streamASize, streamBSize, 0);
    return <Main sketchA={sketchA} sketchB={sketchB} intersection={intersection} k={k} />;
}

