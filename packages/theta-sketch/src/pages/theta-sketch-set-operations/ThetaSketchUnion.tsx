import React from 'react';
import { type TimelineSceneThree, render } from 'obelus-three-render';
import { useSyncObelusTheme } from '@alchemist/theta-sketch/theme/obelusTheme';
import { useDualThreeStage } from '@alchemist/theta-sketch/hooks/useDualThreeStage';
import { buildAnimateTimeline } from 'obelus-gsap-animator';
import { useOrthographicImmediateResize } from '@alchemist/theta-sketch/hooks/useOrthographicResize';
import * as THREE from 'three';
import { at } from 'obelus';
import { Box, Container, Fade, Typography } from '@mui/material';
import { slideUp } from '@alchemist/shared';
import TimelinePlayer from '@alchemist/theta-sketch/components/TimelinePlayer';
import { clearScene, disposeDualSceneResources } from '@alchemist/theta-sketch/utils/threeUtils';
import { calculateStepTimings } from '@alchemist/theta-sketch/utils/narration';
import { useNavigate } from 'react-router-dom';
import { buildAxis, buildDot, buildLatex, buildThetaMarker, buildThetaSketchDescriptionLatex, buildThetaSketchInfoLatex } from './ThetaSketchSetOperationsSharedThree';
import { ThetaSketchSetOperationHeader } from './ThetaSketchSetOperationsSharedComponents';
import { useStepNarrationPlayback } from '../../hooks/useStepNarrationPlayback';

const NARRATION: Record<number, string> = {
    0: `On this page, we will compute a union using Theta Sketch. Each sketch keeps the K smallest hash values, and stores theta explicitly.`,
    1: `For the estimation, we use the formula: estimated equals S divided by theta, where S is the number of retained hashes, and theta is stored explicitly in the sketch.`,
    2: `This is Sketch A with its retained values and stored theta. `,
    3: `This is Sketch B with its retained values and stored theta.`,
    4: `This is the union result sketch, which starts empty.`,
    5: "We add the values from Sketch A and Sketch B to the union sketch.",
    6: "We then remove duplicates, sort them, and keep the K smallest values.",
    7: "Finally, we store theta as the maximum of those values, and estimate the union size.",
    8: "As you can see, the union operation between KMV and Theta Sketch is quite similar. The main difference is that Theta Sketch stores theta explicitly.",
};

const unionFormula = (k: number, theta: number, s: number, estimated: number) => {
    return `\\begin{gathered}
     \\text{Union Sketch } | \\quad k = ${k} \\quad, h_1 = \\{v \\in A \\}, \\quad h_2 = \\{v \\in B \\}, \\quad S = \\text{sort(unique}(h_1 \\cup h_2))[:k] \\\\ 
     \\theta = \\max(S) = ${theta.toFixed(2)},  \\quad |S| = ${s}, \\quad \\hat{N} = \\frac{|S|}{\\theta} = \\frac{${s}}{${theta}} = ${estimated.toFixed(2)}
    \\end{gathered}`;
};

const { startTimes: NARRATION_START, durations: NARRATION_DUR } = calculateStepTimings(NARRATION, 1.0);

interface KmvUnionProps {
    sketchA: { values: number[]; theta: number };
    sketchB: { values: number[]; theta: number };
    union: { values: number[]; theta: number; estimated: number };
    k: number;
}

const Main = ({ sketchA, sketchB, union, k }: KmvUnionProps) => {
    // const theme = useTheme();
    // useSyncObelusTheme();
    const navigate = useNavigate();
    const { animationController, containerRef, scene, renderer, camera } = useDualThreeStage();

    useSyncObelusTheme();

    useOrthographicImmediateResize(
        renderer,
        camera as THREE.OrthographicCamera,
        { onResize: () => animationController?.renderAnimationOnce?.() }
    );

    const [timeline, setTimeline] = React.useState<any>(null);
    const [uiStep, setUiStep] = React.useState<number>(0);
    const {
        currentNarration,
        speakStep,
        stopPlayback,
        pausePlayback,
        startPlayback,
        resetNarrationState,
    } = useStepNarrationPlayback({
        narrations: NARRATION,
        uiStep,
        onResetUiStep: () => setUiStep(0),
        animationController,
        rate: 1.0,
    });

    React.useEffect(() => {
        if (!scene || !animationController) return;

        setUiStep(0);

        // Reset scene objects before (re)building.
        disposeDualSceneResources(scene);
        clearScene(scene);

        const startX = -window.innerWidth / 4;
        const endX = window.innerWidth / 4;

        const aY = window.innerHeight / 12 * 3 - window.innerHeight;
        const latexDescription = buildThetaSketchDescriptionLatex(window.innerHeight / 12 * 4, 0);
        const axisA = buildAxis({ x: startX, y: aY }, { x: endX, y: aY });
        const dotsA = sketchA.values.map((value) => buildDot({ x: startX, y: aY }, { x: endX, y: aY }, value, 1));
        const dotsA1 = sketchA.values.map((value) => buildDot({ x: startX, y: aY }, { x: endX, y: aY }, value, 1));
        const latexA = buildThetaSketchInfoLatex("Sketch A", aY - 40, k, sketchA.theta, sketchA.theta > 0 ? k / sketchA.theta : 0, 1);
        const thetaMarkerA = buildThetaMarker({ x: startX, y: aY }, { x: endX, y: aY }, sketchA.theta, 1);

        const bY = window.innerHeight / 12 - window.innerHeight;
        const axisB = buildAxis({ x: startX, y: bY }, { x: endX, y: bY });
        const dotsB = sketchB.values.map((value) => buildDot({ x: startX, y: bY }, { x: endX, y: bY }, value, 1));
        const dotsB1 = sketchB.values.map((value) => buildDot({ x: startX, y: bY }, { x: endX, y: bY }, value, 1));
        const latexB = buildThetaSketchInfoLatex("Sketch B", bY - 40, k, sketchB.theta, sketchB.theta > 0 ? k / sketchB.theta : 0, 1);
        const thetaMarkerB = buildThetaMarker({ x: startX, y: bY }, { x: endX, y: bY }, sketchB.theta, 1);

        const cY = -window.innerHeight / 12 - window.innerHeight;
        const axisC = buildAxis({ x: startX, y: cY }, { x: endX, y: cY });
        const dotsC = union.values.map((value) => buildDot({ x: startX, y: cY }, { x: endX, y: cY }, value, 0));
        const thetaMarkerC = buildThetaMarker({ x: startX, y: cY }, { x: endX, y: cY }, union.theta, 0);
        const latexUnion = buildLatex(-window.innerHeight / 12 * 2 - window.innerHeight, unionFormula(k, union.theta, union.values.length, union.theta > 0 ? union.values.length / union.theta : 0), 0, '14px');

        const timelineScene: TimelineSceneThree = {
            objects: [
                latexDescription.latex,
                axisA.axisLine,
                ...(dotsA.map((dot) => dot.dot)),
                ...(dotsA1.map((dot) => dot.dot)),
                latexA.latex,
                thetaMarkerA.thetaLine,
                thetaMarkerA.thetaSign,
                axisB.axisLine,
                ...(dotsB.map((dot) => dot.dot)),
                ...(dotsB1.map((dot) => dot.dot)),
                latexB.latex,
                thetaMarkerB.thetaLine,
                thetaMarkerB.thetaSign,
                axisC.axisLine,
                ...(dotsC.map((dot) => dot.dot)),
                latexUnion.latex,
                thetaMarkerC.thetaLine,
                thetaMarkerC.thetaSign,
            ],
            timeline: [
                at(NARRATION_START[1] ?? 1).animate(latexDescription.latexId, { scale: { x: 1, y: 1, z: 1 } }, { duration: 1 }),
                at(NARRATION_START[2] ?? 2).animate(axisA.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                at(NARRATION_START[2] ?? 2).animate(thetaMarkerA.thetaLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                at(NARRATION_START[2] ?? 2).animate(thetaMarkerA.thetaSignId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsA.map((dot) =>
                    at(NARRATION_START[2] ?? 2).animate(
                        dot.dotId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                ...dotsA1.map((dot) =>
                    at(NARRATION_START[2] ?? 2).animate(
                        dot.dotId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                at(NARRATION_START[2] ?? 2).animate(
                    latexA.latexId,
                    { position: { y: `+=${window.innerHeight}` } },
                    { duration: 1 }
                ),
                at(NARRATION_START[3] ?? 3).animate(axisB.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                at(NARRATION_START[3] ?? 3).animate(thetaMarkerB.thetaLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                at(NARRATION_START[3] ?? 3).animate(thetaMarkerB.thetaSignId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsB.map((dot) =>
                    at(NARRATION_START[3] ?? 3).animate(
                        dot.dotId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                ...dotsB1.map((dot) =>
                    at(NARRATION_START[3] ?? 3).animate(
                        dot.dotId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                at(NARRATION_START[3] ?? 3).animate(
                    latexB.latexId,
                    { position: { y: `+=${window.innerHeight}` } },
                    { duration: 1 }
                ),
                at(NARRATION_START[4] ?? 4).animate(axisC.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                at(NARRATION_START[4] ?? 4).animate(thetaMarkerC.thetaLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                at(NARRATION_START[4] ?? 4).animate(thetaMarkerC.thetaSignId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsC.map((dot) =>
                    at(NARRATION_START[4] ?? 4).animate(
                        dot.dotId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                at(NARRATION_START[4] ?? 4).animate(
                    latexUnion.latexId,
                    { position: { y: `+=${window.innerHeight}` } },
                    { duration: 1 }
                ),
                ...dotsA1.map((dot) => at(NARRATION_START[5] ?? 5).animate(
                    dot.dotId,
                    { position: { y: `-=${window.innerHeight / 12 * 4}` } },
                    { duration: 1 }
                )),
                ...dotsB1.map((dot) => at(NARRATION_START[5] ?? 5).animate(
                    dot.dotId,
                    { position: { y: `-=${window.innerHeight / 12 * 2}` } },
                    { duration: 1 }
                )),
                ...dotsA1.map((dot) => at(NARRATION_START[6] ?? 6).animate(
                    dot.dotId,
                    { scale: { x: 0, y: 0, z: 0 } },
                    { duration: 1 }
                )),
                ...dotsB1.map((dot) => at(NARRATION_START[6] ?? 6).animate(
                    dot.dotId,
                    { scale: { x: 0, y: 0, z: 0 } },
                    { duration: 1 }
                )),
                ...dotsC.map((dot) =>
                    at(NARRATION_START[6] ?? 6).animate(
                        dot.dotId,
                        { scale: { x: 1, y: 1, z: 1 } },
                        { duration: 1 }
                    )
                ),
                at(NARRATION_START[7] ?? 7).animate(thetaMarkerC.thetaLineId, { scale: { x: 1, y: 1, z: 1 } }, { duration: 1 }),
                at(NARRATION_START[7] ?? 7).animate(thetaMarkerC.thetaSignId, { scale: { x: 1, y: 1, z: 1 } }, { duration: 1 }),
                at(NARRATION_START[7] ?? 7).animate(
                    latexUnion.latexId,
                    { scale: { x: 1, y: 1, z: 1 } },
                    { duration: 1 }
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

        const narrationSize = Object.keys(NARRATION).length;

        for (let i = 0; i < narrationSize; i++) {
            nextTimeline.call(() => setUiStep(i), [], NARRATION_START[i] ?? i);
        }
        // Ensure the timeline stays alive long enough for step-4 narration to finish
        // (otherwise onComplete can fire too early and cancel the utterance).
        nextTimeline.to({}, { duration: NARRATION_DUR[narrationSize - 1] ?? 1 }, NARRATION_START[narrationSize - 1] ?? narrationSize - 1);

        setTimeline(nextTimeline);

        return () => {
            nextTimeline?.kill?.();
            disposeDualSceneResources(scene);
            clearScene(scene);
        };
    }, [animationController, k, scene, sketchA.values, sketchB.values, union.values]);

    return (
        <>
            <ThetaSketchSetOperationHeader title="Theta Sketch Union" description="Theta Sketch keeps the K smallest hash values and stored θ, so the result is composable for further set operations." />

            {/* Subtitle Display */}
            <Fade in={!!currentNarration}>
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: window.innerHeight / 20 + 120,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        maxWidth: 'min(900px, 92vw)',
                        zIndex: 10,
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

            <Container
                maxWidth="sm"
                sx={{
                    position: 'fixed',
                    bottom: window.innerHeight / 20,
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
                        showRestartButton={true}
                        showMuteButton={false}
                        nextButtonTooltip="Go to KMV Intersection"
                        enableNextButton={true}
                        onNext={() => {
                            stopPlayback();
                            navigate('/sketches/theta/set-operations/intersection');
                        }}
                        onStart={() => {
                            startPlayback();
                            // If starting from the beginning, speak the intro right away.
                            if (uiStep === 0) speakStep(0);
                        }}
                        onPause={() => {
                            pausePlayback();
                        }}
                        onRestart={() => {
                            stopPlayback();
                            resetNarrationState();
                            startPlayback();
                            timeline.restart();
                        }}
                        onComplete={() => {
                            stopPlayback();
                        }}
                    />
                )}
            </Container>
            <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />
        </>
    );
}

export default function KmvUnion() {
    const k = React.useMemo(() => 10, []);
    const sketchA = React.useMemo(
        () => ({ values: [0.04, 0.09, 0.13, 0.18, 0.24, 0.31, 0.39, 0.47, 0.58, 0.72], theta: 0.72 }),
        []
    );
    const sketchB = React.useMemo(
        () => ({ values: [0.06, 0.10, 0.13, 0.20, 0.24, 0.34, 0.42, 0.53, 0.65, 0.79], theta: 0.79 }),
        []
    );
    const union = React.useMemo(
        () => ({ values: [0.04, 0.06, 0.09, 0.10, 0.13, 0.18, 0.20, 0.24, 0.31, 0.34], theta: 0.34, estimated: 29.41 }),
        []
    );

    return <Main sketchA={sketchA} sketchB={sketchB} union={union} k={k} />;
}
