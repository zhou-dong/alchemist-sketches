import React from 'react';
import { type TimelineSceneThree, render } from 'obelus-three-render';
import { useSyncObelusTheme } from '@alchemist/theta-sketch/theme/obelusTheme';
import { useDualThreeStage } from '@alchemist/theta-sketch/hooks/useDualThreeStage';
import { buildAnimateTimeline } from 'obelus-gsap-animator';
import { useSetOperationsDemoData } from './SetOperationsDemoShared';
import { useOrthographicImmediateResize } from '@alchemist/theta-sketch/hooks/useOrthographicResize';
import * as THREE from 'three';
import { at } from 'obelus';
import { Box, Container, Fade, Typography } from '@mui/material';
import { slideUp, useSpeech } from '@alchemist/shared';
import TimelinePlayer from '@alchemist/theta-sketch/components/TimelinePlayer';
import { clearScene, disposeDualSceneResources } from '@alchemist/theta-sketch/utils/threeUtils';
import { calculateStepTimings } from '@alchemist/theta-sketch/utils/narration';
import { useNavigate } from 'react-router-dom';
import { buildAxis, buildDot, buildNumber, buildKmvInfoLatex } from './KmvSetOperationsSharedThree';
import { KmvSetOperationHeader } from './KmvSetOperationsSharedComponents';

const NARRATION: Record<number, string> = {
    0: `On this page, we will compute a union using KMV sketches. Each sketch keeps only the K smallest hash values, and theta is inferred as the K-th value.`,
    1: `This is Sketch A. It contains the K smallest hash values from stream A.`,
    2: `This is Sketch B. It contains the K smallest hash values from stream B.`,
    3: `This is the union sketch. It initially as an empty sketch.`,
    4: "We add the values from Sketch A and Sketch B to it.",
    5: "We then remove duplicates and sort the values.",
    6: "Finally, we keep the K smallest values and infer theta as the maximum of those values.",
    7: "For union, KMV is safe to chain. The union result keeps exactly K values, so the correct theta is always recoverable as the maximum of those values.",
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

        const aY = window.innerHeight / 12 * 3 - window.innerHeight;
        const axisA = buildAxis({ x: startX, y: aY }, { x: endX, y: aY });
        const dotsA = sketchA.values.map((value) => buildDot({ x: startX, y: aY }, { x: endX, y: aY }, value, 1));
        const dotsA1 = sketchA.values.map((value) => buildDot({ x: startX, y: aY }, { x: endX, y: aY }, value, 1));
        const numbersA = sketchA.values.map((value, index) => buildNumber({ x: startX, y: aY }, { x: endX, y: aY }, value, sketchA.values.length, index, 1));
        const latexA = buildKmvInfoLatex("Sketch A (KMV)", aY, k, sketchA.theta, sketchA.theta > 0 ? k / sketchA.theta - 1 : 0, 1);

        const bY = window.innerHeight / 12 - window.innerHeight;
        const axisB = buildAxis({ x: startX, y: bY }, { x: endX, y: bY });
        const dotsB = sketchB.values.map((value) => buildDot({ x: startX, y: bY }, { x: endX, y: bY }, value, 1));
        const dotsB1 = sketchB.values.map((value) => buildDot({ x: startX, y: bY }, { x: endX, y: bY }, value, 1));
        const numbersB = sketchB.values.map((value, index) => buildNumber({ x: startX, y: bY }, { x: endX, y: bY }, value, sketchB.values.length, index, 1));
        const latexB = buildKmvInfoLatex("Sketch B (KMV)", bY, k, sketchB.theta, sketchB.theta > 0 ? k / sketchB.theta - 1 : 0, 1);

        const cY = -window.innerHeight / 12 - window.innerHeight;
        const axisC = buildAxis({ x: startX, y: cY }, { x: endX, y: cY });
        const dotsC = union.values.map((value) => buildDot({ x: startX, y: cY }, { x: endX, y: cY }, value, 0));
        const numbersC = union.values.map((value, index) => buildNumber({ x: startX, y: cY }, { x: endX, y: cY }, value, union.values.length, index, 0));
        const numbersABUnion = sketchA.values.concat(sketchB.values).map((value, index) => buildNumber({ x: startX, y: cY }, { x: endX, y: cY }, value, sketchA.values.length + sketchB.values.length, index, 0));
        const numbersABUnionSorted = [...new Set(sketchA.values.concat(sketchB.values))].sort((a, b) => a - b).map((value, index) => buildNumber({ x: startX, y: cY }, { x: endX, y: cY }, value, sketchA.values.length + sketchB.values.length, index, 0));
        const latexUnion = buildKmvInfoLatex("Union sketch (KMV)", cY, k, union.theta, union.theta > 0 ? k / union.theta - 1 : 0, 0);

        const timelineScene: TimelineSceneThree = {
            objects: [
                axisA.axisLine,
                ...(dotsA.map((dot) => dot.dot)),
                ...(dotsA1.map((dot) => dot.dot)),
                ...(numbersA.map((number) => number.number)),
                latexA.latex,
                axisB.axisLine,
                ...(dotsB.map((dot) => dot.dot)),
                ...(dotsB1.map((dot) => dot.dot)),
                ...(numbersB.map((number) => number.number)),
                latexB.latex,
                axisC.axisLine,
                ...(dotsC.map((dot) => dot.dot)),
                ...(numbersC.map((number) => number.number)),
                ...(numbersABUnion.map((number) => number.number)),
                ...(numbersABUnionSorted.map((number) => number.number)),
                latexUnion.latex,
            ],
            timeline: [
                at(NARRATION_START[1] ?? 1).animate(axisA.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsA.map((dot) =>
                    at(NARRATION_START[1] ?? 1).animate(
                        dot.dotId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                ...dotsA1.map((dot) =>
                    at(NARRATION_START[1] ?? 1).animate(
                        dot.dotId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                ...numbersA.map((number) =>
                    at(NARRATION_START[1] ?? 1).animate(
                        number.numberId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                at(NARRATION_START[1] ?? 1).animate(
                    latexA.latexId,
                    { position: { y: `+=${window.innerHeight}` } },
                    { duration: 1 }
                ),
                at(NARRATION_START[2] ?? 2).animate(axisB.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsB.map((dot) =>
                    at(NARRATION_START[2] ?? 2).animate(
                        dot.dotId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                ...dotsB1.map((dot) =>
                    at(NARRATION_START[2] ?? 2).animate(
                        dot.dotId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                ...numbersB.map((number) =>
                    at(NARRATION_START[2] ?? 2).animate(
                        number.numberId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                at(NARRATION_START[2] ?? 2).animate(
                    latexB.latexId,
                    { position: { y: `+=${window.innerHeight}` } },
                    { duration: 1 }
                ),
                at(NARRATION_START[3] ?? 3).animate(axisC.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsC.map((dot) =>
                    at(NARRATION_START[3] ?? 3).animate(
                        dot.dotId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                ...numbersC.map((number) =>
                    at(NARRATION_START[3] ?? 3).animate(
                        number.numberId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                ...numbersABUnion.map((number) =>
                    at(NARRATION_START[3] ?? 3).animate(
                        number.numberId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                ...numbersABUnionSorted.map((number) =>
                    at(NARRATION_START[3] ?? 3).animate(
                        number.numberId,
                        { position: { y: `+=${window.innerHeight}` } },
                        { duration: 1 }
                    )
                ),
                at(NARRATION_START[3] ?? 3).animate(
                    latexUnion.latexId,
                    { position: { y: `+=${window.innerHeight}` } },
                    { duration: 1 }
                ),
                ...dotsA1.map((dot) => at(NARRATION_START[4] ?? 4).animate(
                    dot.dotId,
                    { position: { y: `-=${window.innerHeight / 12 * 4}` } },
                    { duration: 1 }
                )),
                ...dotsB1.map((dot) => at(NARRATION_START[4] ?? 4).animate(
                    dot.dotId,
                    { position: { y: `-=${window.innerHeight / 12 * 2}` } },
                    { duration: 1 }
                )),
                ...numbersABUnion.map((number) =>
                    at(NARRATION_START[4] ?? 4).animate(
                        number.numberId,
                        { scale: { x: 1, y: 1, z: 1 } },
                        { duration: 1 }
                    )
                ),
                ...numbersABUnion.map((number) =>
                    at(NARRATION_START[5] ?? 5).animate(
                        number.numberId,
                        { scale: { x: 0, y: 0, z: 0 } },
                        { duration: 1 }
                    )
                ),
                ...numbersABUnionSorted.map((number) =>
                    at(NARRATION_START[5] ?? 5).animate(
                        number.numberId,
                        { scale: { x: 1, y: 1, z: 1 } },
                        { duration: 1 }
                    )
                ),
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
                ...numbersC.map((number) =>
                    at(NARRATION_START[6] ?? 6).animate(
                        number.numberId,
                        { scale: { x: 1, y: 1, z: 1 } },
                        { duration: 1 }
                    )
                ),
                ...numbersABUnionSorted.map((number) =>
                    at(NARRATION_START[6] ?? 6).animate(
                        number.numberId,
                        { scale: { x: 0, y: 0, z: 0 } },
                        { duration: 1 }
                    )
                ),
                at(NARRATION_START[6] ?? 6).animate(
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
            <KmvSetOperationHeader title="KMV Union" description="KMV keeps only the K smallest hash values and infers θ from the K-th (max stored) value. Union will return exactly K values, so θ is recoverable and the result stays composable." />

            {/* Subtitle Display */}
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
                        showMuteButton={false}
                        nextButtonTooltip="Go to KMV Intersection"
                        enableNextButton={true}
                        onNext={() => {
                            speechSynthesis.cancel();
                            setIsPlaying(false);
                            animationController.stopAnimation();
                            stop();
                            navigate('/theta-sketch/kmv-set-ops?op=intersection');
                        }}
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
