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
import { buildAxis, buildDot, buildLatex } from './KmvSetOperationsSharedThree';
import { KmvSetOperationHeader } from './KmvSetOperationsSharedComponents';

const OPENING_DESCRIPTION = `
  Difference estimation works, but composition breaks: the operation uses shared θ = min(θ_A, θ_B), while the result may have fewer than K values, so inferred θ from the new sketch may not equal the operation θ.
  The fix is to store θ explicitly in the result; once we store values plus θ, it is no longer plain KMV, but a Theta Sketch.
`;

const OPENING_NARRATION_0 = `
  Difference estimation works, but composition breaks.
  In difference, theta is not inferred from result values; it is the shared threshold min(theta A, theta B).
  The difference result may have fewer than K values,
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
    4: `To compute difference, we set a common theta as min(theta A, theta B), and keep only values below that theta in each sketch.`,
    5: `Then we keep values that are in Sketch A but not in Sketch B.`,
    6: `Again, for difference, theta is not inferred from result values; it is min(theta A, theta B).`,
    7: `Without storing theta explicitly, a difference result is not composable for further set operations. Storing theta leads to Theta Sketch.`,
};

const { startTimes: NARRATION_START, durations: NARRATION_DUR } = calculateStepTimings(NARRATION, 1.0);

interface KmvDifferenceProps {
    sketchA: { values: number[]; theta: number };
    sketchB: { values: number[]; theta: number };
    difference: { values: number[]; theta: number; estimated: number };
    k: number;
}

const Main = ({ sketchA, sketchB, difference, k }: KmvDifferenceProps) => {
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

        const bY = window.innerHeight / 12 - window.innerHeight;
        const axisB = buildAxis({ x: startX, y: bY }, { x: endX, y: bY });
        const dotsB = sketchB.values.map((v) => buildDot({ x: startX, y: bY }, { x: endX, y: bY }, v, 1));
        const dotsB1 = sketchB.values.map((v) => buildDot({ x: startX, y: bY }, { x: endX, y: bY }, v, 1));

        const cY = -window.innerHeight / 12 - window.innerHeight;
        const axisC = buildAxis({ x: startX, y: cY }, { x: endX, y: cY });
        const dotsC = difference.values.map((v) => buildDot({ x: startX, y: cY }, { x: endX, y: cY }, v, 0));

        const commonTheta = Math.min(sketchA.theta, sketchB.theta);
        const m = difference.values.length;

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
        const latexD = buildLatex(
            cY,
            `\\begin{align*}
\\text{Difference (KMV)}\\quad |\\quad \\theta=\\min(\\theta_A,\\theta_B)=${commonTheta.toFixed(3)},\\; m=${m},\\; \\hat{N}=\\frac{m}{\\theta}=${difference.estimated.toFixed(3)}
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
        const inD = new Set(difference.values);

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
                latexD.latex,
                latexLimit.latex,
            ],
            timeline: [
                at(NARRATION_START[2] ?? 2).animate(axisA.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsA.map((d) => at(NARRATION_START[2] ?? 2).animate(d.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                ...dotsA1.map((d) => at(NARRATION_START[2] ?? 2).animate(d.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                at(NARRATION_START[2] ?? 2).animate(latexA.latexId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),

                at(NARRATION_START[3] ?? 3).animate(axisB.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsB.map((d) => at(NARRATION_START[3] ?? 3).animate(d.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                ...dotsB1.map((d) => at(NARRATION_START[3] ?? 3).animate(d.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                at(NARRATION_START[3] ?? 3).animate(latexB.latexId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),

                at(NARRATION_START[4] ?? 4).animate(axisC.axisLineId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
                ...dotsC.map((d) => at(NARRATION_START[4] ?? 4).animate(d.dotId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })),
                at(NARRATION_START[4] ?? 4).animate(latexD.latexId, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),

                // Step 3: apply common theta cutoff
                ...dotsA1.map((d) =>
                    at(NARRATION_START[4] ?? 4).animate(
                        d.dotId,
                        { scale: keepA.has(d.value) ? { x: 1, y: 1, z: 1 } : { x: 0, y: 0, z: 0 } },
                        { duration: 0.8 }
                    )
                ),
                ...dotsB1.map((d) =>
                    at(NARRATION_START[4] ?? 4).animate(
                        d.dotId,
                        { scale: keepB.has(d.value) ? { x: 1, y: 1, z: 1 } : { x: 0, y: 0, z: 0 } },
                        { duration: 0.8 }
                    )
                ),

                // Step 4: show difference result; keep only A-only values.
                ...dotsA1.map((d) =>
                    at(NARRATION_START[5] ?? 5).animate(
                        d.dotId,
                        { scale: inD.has(d.value) ? { x: 1, y: 1, z: 1 } : { x: 0, y: 0, z: 0 } },
                        { duration: 0.8 }
                    )
                ),
                ...dotsB1.map((d) =>
                    at(NARRATION_START[5] ?? 5).animate(d.dotId, { scale: { x: 0, y: 0, z: 0 } }, { duration: 0.8 })
                ),
                ...dotsC.map((d) =>
                    at(NARRATION_START[5] ?? 5).animate(d.dotId, { scale: { x: 1, y: 1, z: 1 } }, { duration: 0.8 })
                ),

                at(NARRATION_START[6] ?? 6).animate(latexLimit.latexId, { scale: { x: 1, y: 1, z: 1 } }, { duration: 0.9 }),
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
    }, [animationController, difference.estimated, difference.theta, difference.values, k, scene, sketchA.theta, sketchA.values, sketchB.theta, sketchB.values]);

    return (
        <>
            <KmvSetOperationHeader title="KMV Difference" description={OPENING_DESCRIPTION} />

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
                        nextButtonTooltip="Continue: Theta Sketch"
                        enableNextButton={true}
                        onNext={() => {
                            speechSynthesis.cancel();
                            setIsPlaying(false);
                            animationController.stopAnimation();
                            stop();
                            navigate('/theta-sketch/theta-sketch');
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

export default function KmvDifference() {
    const k = 10;
    const streamASize = 15;
    const streamBSize = 20;
    const { sketchA, sketchB, difference } = useSetOperationsDemoData(k, streamASize, streamBSize, 0);
    return <Main sketchA={sketchA} sketchB={sketchB} difference={difference} k={k} />;
}
