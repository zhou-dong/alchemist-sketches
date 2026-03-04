import React from 'react';
import { type TimelineSceneThree, render } from 'obelus-three-render';
import { useSyncObelusTheme } from '@alchemist/theta-sketch/theme/obelusTheme';
import { useDualThreeStage } from '@alchemist/theta-sketch/hooks/useDualThreeStage';
import { buildAnimateTimeline } from 'obelus-gsap-animator';
import { useOrthographicImmediateResize } from '@alchemist/theta-sketch/hooks/useOrthographicResize';
import * as THREE from 'three';
import { at } from 'obelus';
import { Box, Container, Fade, Typography } from '@mui/material';
import { slideUp, useSpeech } from '@alchemist/shared';
import TimelinePlayer from '@alchemist/theta-sketch/components/TimelinePlayer';
import { clearScene, disposeDualSceneResources } from '@alchemist/theta-sketch/utils/threeUtils';
import { calculateStepTimings } from '@alchemist/theta-sketch/utils/narration';
import { useNavigate } from 'react-router-dom';
import { buildAxis, buildDot, buildLatex, buildThetaMarker, buildThetaSketchDescriptionLatex, buildThetaSketchInfoLatex } from './ThetaSketchSetOperationsSharedThree';
import { ThetaSketchSetOperationHeader } from './ThetaSketchSetOperationsSharedComponents';

const NARRATION: Record<number, string> = {
    0: `On this page, we compute difference using Theta Sketch. Each sketch stores retained values and theta explicitly.`,
    1: `For difference, we use theta equals min of theta A and theta B, and estimate with the retained difference count divided by theta.`,
    2: `This is Sketch A with its retained values and stored theta.`,
    3: `This is Sketch B with its retained values and stored theta.`,
    4: `This is the difference result sketch, which starts empty.`,
    5: `We bring values from Sketch A and Sketch B into the difference stage.`,
    6: `Now we keep only values that are in Sketch A but not in Sketch B under the shared threshold.`,
    7: `Finally, we store theta equals min(theta A, theta B) in the result and compute the estimate.`,
    8: `Because theta is stored explicitly, this difference result is composable for further set operations.`,
};

const differenceFormula = (theta: number, m: number, estimated: number) => {
    return `\\begin{gathered}
\\text{Difference Sketch} \\quad
\\theta=\\min(\\theta_A,\\theta_B)=${theta.toFixed(2)} \\\\
|h_1 \\setminus h_2|=${m}, \\quad
\\hat{N}=\\frac{|h_1 \\setminus h_2|}{\\theta}=\\frac{${m}}{${theta.toFixed(2)}}=${estimated.toFixed(2)}
\\end{gathered}`;
};

const { startTimes: NARRATION_START, durations: NARRATION_DUR } = calculateStepTimings(NARRATION, 1.0);

interface ThetaSketchDifferenceProps {
    sketchA: { values: number[]; theta: number };
    sketchB: { values: number[]; theta: number };
    difference: { values: number[]; theta: number; estimated: number };
    k: number;
}

const Main = ({ sketchA, sketchB, difference, k }: ThetaSketchDifferenceProps) => {
    const navigate = useNavigate();
    const { animationController, containerRef, scene, renderer, camera } = useDualThreeStage();
    const { speak, stop, pause, resume } = useSpeech({ rate: 1.0 });

    useSyncObelusTheme();

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
        const thetaOp = Math.min(sketchA.theta, sketchB.theta);

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
        const dotsC = difference.values.map((value) => buildDot({ x: startX, y: cY }, { x: endX, y: cY }, value, 0));
        const thetaMarkerC = buildThetaMarker({ x: startX, y: cY }, { x: endX, y: cY }, difference.theta, 0);
        const latexDifference = buildLatex(
            -window.innerHeight / 12 * 2 - window.innerHeight,
            differenceFormula(thetaOp, difference.values.length, thetaOp > 0 ? difference.values.length / thetaOp : 0),
            0,
            '14px'
        );

        const timelineScene: TimelineSceneThree = {
            objects: [
                latexDescription.latex,
                axisA.axisLine,
                ...dotsA.map((dot) => dot.dot),
                ...dotsA1.map((dot) => dot.dot),
                latexA.latex,
                thetaMarkerA.thetaLine,
                thetaMarkerA.thetaSign,
                axisB.axisLine,
                ...dotsB.map((dot) => dot.dot),
                ...dotsB1.map((dot) => dot.dot),
                latexB.latex,
                thetaMarkerB.thetaLine,
                thetaMarkerB.thetaSign,
                axisC.axisLine,
                ...dotsC.map((dot) => dot.dot),
                latexDifference.latex,
                thetaMarkerC.thetaLine,
                thetaMarkerC.thetaSign,
            ],
            timeline: [
                at(NARRATION_START[1] ?? 1).animate(latexDescription.latexId, { scale: { x: 1, y: 1, z: 1 } }, { duration: 1 }),
                at(NARRATION_START[2] ?? 2).animate(axisA.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                at(NARRATION_START[2] ?? 2).animate(thetaMarkerA.thetaLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                at(NARRATION_START[2] ?? 2).animate(thetaMarkerA.thetaSignId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsA.map((dot) => at(NARRATION_START[2] ?? 2).animate(dot.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                ...dotsA1.map((dot) => at(NARRATION_START[2] ?? 2).animate(dot.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                at(NARRATION_START[2] ?? 2).animate(latexA.latexId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),

                at(NARRATION_START[3] ?? 3).animate(axisB.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                at(NARRATION_START[3] ?? 3).animate(thetaMarkerB.thetaLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                at(NARRATION_START[3] ?? 3).animate(thetaMarkerB.thetaSignId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsB.map((dot) => at(NARRATION_START[3] ?? 3).animate(dot.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                ...dotsB1.map((dot) => at(NARRATION_START[3] ?? 3).animate(dot.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                at(NARRATION_START[3] ?? 3).animate(latexB.latexId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),

                at(NARRATION_START[4] ?? 4).animate(axisC.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                at(NARRATION_START[4] ?? 4).animate(thetaMarkerC.thetaLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                at(NARRATION_START[4] ?? 4).animate(thetaMarkerC.thetaSignId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsC.map((dot) => at(NARRATION_START[4] ?? 4).animate(dot.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                at(NARRATION_START[4] ?? 4).animate(latexDifference.latexId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),

                ...dotsA1.map((dot) => at(NARRATION_START[5] ?? 5).animate(dot.dotId, { position: { y: `-=${window.innerHeight / 12 * 4}` } }, { duration: 1 })),
                ...dotsB1.map((dot) => at(NARRATION_START[5] ?? 5).animate(dot.dotId, { position: { y: `-=${window.innerHeight / 12 * 2}` } }, { duration: 1 })),

                ...dotsA1.map((dot) => at(NARRATION_START[6] ?? 6).animate(dot.dotId, { scale: { x: 0, y: 0, z: 0 } }, { duration: 1 })),
                ...dotsB1.map((dot) => at(NARRATION_START[6] ?? 6).animate(dot.dotId, { scale: { x: 0, y: 0, z: 0 } }, { duration: 1 })),
                ...dotsC.map((dot) => at(NARRATION_START[6] ?? 6).animate(dot.dotId, { scale: { x: 1, y: 1, z: 1 } }, { duration: 1 })),

                at(NARRATION_START[7] ?? 7).animate(thetaMarkerC.thetaLineId, { scale: { x: 1, y: 1, z: 1 } }, { duration: 1 }),
                at(NARRATION_START[7] ?? 7).animate(thetaMarkerC.thetaSignId, { scale: { x: 1, y: 1, z: 1 } }, { duration: 1 }),
                at(NARRATION_START[7] ?? 7).animate(latexDifference.latexId, { scale: { x: 1, y: 1, z: 1 } }, { duration: 1 }),
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
    }, [animationController, difference.theta, difference.values, k, scene, sketchA.theta, sketchA.values, sketchB.theta, sketchB.values]);

    return (
        <>
            <ThetaSketchSetOperationHeader title="Theta Sketch Difference" description="Theta Sketch stores θ explicitly, so difference results remain composable for further set operations." />

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
                        showRestartButton={true}
                        showMuteButton={false}
                        nextButtonTooltip="Go to Finish"
                        enableNextButton={true}
                        onNext={() => {
                            speechSynthesis.cancel();
                            setIsPlaying(false);
                            animationController.stopAnimation();
                            stop();
                            navigate('/sketches/theta/set-operations/finish');
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
                        onRestart={() => {
                            speechSynthesis.cancel();
                            stop();
                            lastSpokenStepRef.current = -1;
                            setCurrentNarration('');
                            setUiStep(0);
                            setIsPlaying(true);
                            animationController.startAnimation();
                            timeline.restart();
                            resume();
                            speakStep(0);
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

export default function ThetaSketchDifference() {
    const k = 10;
    const sketchA = { values: [0.04, 0.09, 0.13, 0.18, 0.24, 0.31, 0.39, 0.47, 0.58, 0.72], theta: 0.72 };
    const sketchB = { values: [0.06, 0.10, 0.13, 0.20, 0.24, 0.34, 0.42, 0.53, 0.65, 0.79], theta: 0.79 };
    const difference = { values: [0.04, 0.09, 0.18, 0.31, 0.39, 0.47, 0.58], theta: 0.72, estimated: 9.72 };
    return <Main sketchA={sketchA} sketchB={sketchB} difference={difference} k={k} />;
}

