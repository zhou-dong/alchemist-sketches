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
import { buildAxis, buildDot, buildKmvInfoLatex, buildLatex, buildNumber } from './KmvSetOperationsSharedThree';
import { KmvSetOperationHeader } from './KmvSetOperationsSharedComponents';

const OPENING_DESCRIPTION = `
  Intersection estimation works, but composition breaks: the operation uses shared θ = min(θ_A, θ_B), while the result may have fewer than K values, so inferred θ from the new sketch may not equal the operation θ.
   The fix is to store θ explicitly in the result; once we store values plus θ, it is no longer plain KMV, but a Theta Sketch.
`;

const OPENING_NARRATION_0 = `
  Intersection estimation works, but composition breaks.
  In intersection, theta is not inferred from result values; it is the shared threshold min(theta A, theta B).
  The intersection result may have fewer than K values,
`;

const OPENING_NARRATION_1 = `
  so inferred theta from the new sketch may not match the operation theta.
  To support further set operations, we must store theta explicitly in the result, which leads to Theta Sketch.
  let's see how it works.
`;

const NARRATION: Record<number, string> = {
    0: OPENING_NARRATION_0,
    1: OPENING_NARRATION_1,
    2: `This is Sketch A, which keeps the K smallest hash values from stream A.`,
    3: `This is Sketch B, which keeps the K smallest hash values from stream B.`,
    4: "This is the intersection sketch. It starts empty.",
    5: "We add values from Sketch A and Sketch B.",
    6: "Then we keep only values that appear in both sketches.",
    7: "Again, for intersection, theta is not inferred from result values; it is min(theta A, theta B).",
    8: "Because the sketch is not inferred from the result values, we should store theta explicitly in the result for further set operations, which leads to Theta Sketch.",
};

const { startTimes: NARRATION_START, durations: NARRATION_DUR } = calculateStepTimings(NARRATION, 1.0);

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

    useSyncObelusTheme();

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
        const latexA = buildKmvInfoLatex("Sketch A (KMV)", aY, k, sketchA.theta, sketchA.theta > 0 ? k / sketchA.theta - 1 : 0, 1);
        const numbersA = sketchA.values.map((value, index) => buildNumber({ x: startX, y: aY }, { x: endX, y: aY }, value, sketchA.values.length, index, 1));

        const bY = window.innerHeight / 12 - window.innerHeight;
        const axisB = buildAxis({ x: startX, y: bY }, { x: endX, y: bY });
        const dotsB = sketchB.values.map((v) => buildDot({ x: startX, y: bY }, { x: endX, y: bY }, v, 1));
        const dotsB1 = sketchB.values.map((v) => buildDot({ x: startX, y: bY }, { x: endX, y: bY }, v, 1));
        const latexB = buildKmvInfoLatex("Sketch B (KMV)", bY, k, sketchB.theta, sketchB.theta > 0 ? k / sketchB.theta - 1 : 0, 1);
        const numbersB = sketchB.values.map((value, index) => buildNumber({ x: startX, y: bY }, { x: endX, y: bY }, value, sketchB.values.length, index, 1));

        const cY = -window.innerHeight / 12 - window.innerHeight;
        const axisC = buildAxis({ x: startX, y: cY }, { x: endX, y: cY });
        const dotsC = intersection.values.map((v) => buildDot({ x: startX, y: cY }, { x: endX, y: cY }, v, 0));
        const numbersC = intersection.values.map((value, index) => buildNumber({ x: startX, y: cY }, { x: endX, y: cY }, value, sketchA.values.length + sketchB.values.length, index, 0));
        const numbersABUnion = sketchA.values.concat(sketchB.values).map((value, index) => buildNumber({ x: startX, y: cY }, { x: endX, y: cY }, value, sketchA.values.length + sketchB.values.length, index, 0));

        const commonTheta = Math.min(sketchA.theta, sketchB.theta);
        const m = intersection.values.length;

        const latexIntersection = buildLatex(
            cY,
            `\\begin{align*}
\\text{Intersection (KMV)}\\quad |\\quad \\quad 
\\theta=\\min(\\theta_A,\\theta_B)=${commonTheta.toFixed(2)},
\\quad m=|h_1 \\cap h_2|=${m},
\\quad \\hat{N}=\\frac{m}{\\theta}=${intersection.estimated.toFixed(3)}
\\end{align*}`,
            0
        );

        const latexLimit = buildLatex(
            cY - 140,
            `\\begin{align*}
& \\theta_1 = \\min(\\theta_A,\\theta_B) = ${commonTheta.toFixed(2)} \\\\
& \\theta_2 = \\max(v_1,\\dots,v_k) = ${Math.max(...intersection.values).toFixed(2)} \\\\
& \\theta \\space  = \\theta_2 \\space (\\text{should save } \\theta \\space \\text{ for further operations})
\\end{align*}`,
            0
        );

        const timelineScene: TimelineSceneThree = {
            objects: [
                axisA.axisLine,
                ...dotsA.map((d) => d.dot),
                ...dotsA1.map((d) => d.dot),
                ...(numbersA.map((n) => n.number)),
                latexA.latex,
                axisB.axisLine,
                ...dotsB.map((d) => d.dot),
                ...dotsB1.map((d) => d.dot),
                ...(numbersB.map((n) => n.number)),
                latexB.latex,
                ...(numbersABUnion.map((n) => n.number)),
                axisC.axisLine,
                ...dotsC.map((d) => d.dot),
                ...numbersC.map((n) => n.number),
                latexIntersection.latex,
                latexLimit.latex,
            ],
            timeline: [
                at(NARRATION_START[2] ?? 2).animate(axisA.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsA.map((d) => at(NARRATION_START[2] ?? 2).animate(d.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                ...dotsA1.map((d) => at(NARRATION_START[2] ?? 2).animate(d.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                at(NARRATION_START[2] ?? 2).animate(latexA.latexId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...numbersA.map((n) => at(NARRATION_START[2] ?? 2).animate(n.numberId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),

                at(NARRATION_START[3] ?? 3).animate(axisB.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsB.map((d) => at(NARRATION_START[3] ?? 3).animate(d.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                ...dotsB1.map((d) => at(NARRATION_START[3] ?? 3).animate(d.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                at(NARRATION_START[3] ?? 3).animate(latexB.latexId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...numbersB.map((n) => at(NARRATION_START[3] ?? 3).animate(n.numberId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),

                at(NARRATION_START[4] ?? 4).animate(axisC.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsC.map((d) => at(NARRATION_START[3] ?? 3).animate(d.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                at(NARRATION_START[4] ?? 4).animate(latexIntersection.latexId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...numbersC.map((n) => at(NARRATION_START[4] ?? 4).animate(n.numberId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                ...numbersABUnion.map((n) => at(NARRATION_START[4] ?? 4).animate(n.numberId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                at(NARRATION_START[4] ?? 4).animate(latexLimit.latexId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),

                ...dotsA1.map((d) =>
                    at(NARRATION_START[5] ?? 5).animate(
                        d.dotId,
                        { position: { y: `-=${window.innerHeight / 12 * 4}` } },
                        { duration: 1 }
                    )
                ),
                ...dotsB1.map((d) =>
                    at(NARRATION_START[5] ?? 5).animate(
                        d.dotId,
                        { position: { y: `-=${window.innerHeight / 12 * 2}` } },
                        { duration: 1 }
                    )
                ),
                ...numbersABUnion.map((n) =>
                    at(NARRATION_START[5] ?? 5).animate(
                        n.numberId,
                        { scale: { x: 1, y: 1, z: 1 } },
                        { duration: 1 }
                    )
                ),
                ...dotsA1.map((d) =>
                    at(NARRATION_START[6] ?? 6).animate(
                        d.dotId,
                        { scale: { x: 0, y: 0, z: 0 } },
                        { duration: 1 }
                    )
                ),
                ...dotsB1.map((d) =>
                    at(NARRATION_START[6] ?? 6).animate(
                        d.dotId,
                        { scale: { x: 0, y: 0, z: 0 } },
                        { duration: 1 }
                    )
                ),
                ...dotsC.map((d) =>
                    at(NARRATION_START[6] ?? 6).animate(d.dotId, { scale: { x: 1, y: 1, z: 1 } }, { duration: 1 })
                ),
                ...numbersABUnion.map((n) =>
                    at(NARRATION_START[6] ?? 6).animate(
                        n.numberId,
                        { scale: { x: 0, y: 0, z: 0 } },
                        { duration: 1 }
                    )
                ),
                ...numbersC.map((n) =>
                    at(NARRATION_START[6] ?? 6).animate(
                        n.numberId,
                        { scale: { x: 1, y: 1, z: 1 } },
                        { duration: 1 }
                    )
                ),

                at(NARRATION_START[7] ?? 7).animate(
                    latexIntersection.latexId,
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
            <KmvSetOperationHeader title="KMV Intersection" description={OPENING_DESCRIPTION} />

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

