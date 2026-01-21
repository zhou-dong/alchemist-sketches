import React, { useCallback, useRef, useEffect } from 'react';
import { at, type TimelineEvent } from 'obelus';
import { createDualRenderer, createOrthographicCamera } from "../../utils/threeUtils";
import { buildAnimateTimeline } from 'obelus-gsap-animator';
import { useThreeContainer } from "../../hooks/useThreeContainer";
import { DualScene, latex, type TimelineSceneThree, render, axis, text } from 'obelus-three-render';
import { AnimationController } from "../../utils/animation-controller";
import { ORDER_STATISTICS_TO_KMV_FORMULAS } from './order-statistics-to-kth-smallest-estimation-latex';
import StepTitle from '@alchemist/theta-sketch/components/StepTitle';
import { axisStyle, textStyle, useSyncObelusTheme } from '../../theme/obelusTheme';
import TimelinePlayer from '@alchemist/theta-sketch/components/TimelinePlayer';
import { Container, Box, Typography, Fade } from '@mui/material';
import { useTheme, useSpeech } from '@alchemist/shared';
import { useThetaSketchProgress } from '../../contexts/ThetaSketchProgressContext';
import { calculateStepTimings } from '../../utils/narration';
import StepProgressIndicator from '@alchemist/theta-sketch/components/StepProgressIndicator';
import { slideUp } from '@alchemist/shared';

// Narration for each timeline step
const STEP_NARRATIONS: Record<number, string> = {
    0: "Now let's see how to use order statistics to estimate the total number of nodes, which is called the k-th smallest estimation.",
    1: "Starting with the order statistics formula: the expected value of the k-th smallest node equals k over n plus 1.",
    2: "Let's use theta to represent the expected value of the k-th smallest node.",
    3: "So the formula becomes: theta equals k over n plus 1.",
    4: "We can rearrange the equation to solve for n. Let's start by multiplying both sides by n plus 1.",
    5: "This gives us: theta times n plus 1 equals k.",
    6: "Next, we can divide both sides by theta to isolate n.",
    7: "This gives us: n plus 1 equals k over theta.",
    8: "Finally, we can subtract 1 from both sides to solve for n.",
    9: "This gives us the formula: n equals k over theta, minus 1.",
    10: "And yes this is the formula we've been looking for!",
    11: "Let's see this in action with an axis from 0 to 1, with two nodes to split into three equal parts.",
    12: "For the first node, k equals 1.",
    13: "And theta equals one-third.",
    14: "Plugging into our formula: n equals 1 divided by one-third, minus 1, which equals 2.",
    15: "For the second node, k equals 2.",
    16: "And theta equals two-thirds.",
    17: "Using our formula: n equals 2 divided by two-thirds, minus 1, which also equals 2.",
    18: "As above, both estimates tell us there are 2 nodes, so we can use this formula to estimate the total number of nodes in a set.",
};

// Calculate step durations and cumulative start times
const { startTimes: STEP_START_TIMES } = calculateStepTimings(STEP_NARRATIONS);

const ANIMATION_DURATION = 0.8;

const latexes = ORDER_STATISTICS_TO_KMV_FORMULAS.map((formula, index) => {
    const top = window.innerHeight / 4 - window.innerHeight;
    const lineHeight: number = window.innerHeight / 2 / ORDER_STATISTICS_TO_KMV_FORMULAS.length;
    const y = top - (index * lineHeight);
    return latex(`formula_${index}`, formula, { y }, textStyle);
});

// Helper to get step start time
const t = (step: number) => STEP_START_TIMES[step] ?? 0;
const d = ANIMATION_DURATION;

const ONE_THIRD_N_LATEX = `
n = \\frac{k}{\\theta} - 1
= \\frac{1}{\\frac{1}{3}} - 1
= 1 \\times {\\frac{3}{1}} - 1
= 3 - 1
= 2
`;

const TWO_THIRDS_N_LATEX = `
n = \\frac{k}{\\theta} - 1
= \\frac{2}{\\frac{2}{3}} - 1
= 2 \\times {\\frac{3}{2}} - 1
= 3 - 1
= 2
`;

const buildAxis = () => {
    const halfWidth = Math.min(window.innerWidth / 4, 800);
    const y = window.innerHeight / 16 * 2 - window.innerHeight;
    const start = { x: -halfWidth, y: y, z: 0, };
    const end = { x: halfWidth, y: y, z: 0, };
    const axisLine = axis("axis", start, end, { ...axisStyle, dotCount: 4 });
    const axisStart = text("axis_start", "0", { ...start, y: y - 25 }, textStyle);
    const axisEnd = text("axis_end", "1", { ...end, y: y - 25 }, textStyle);

    const oneThird = latex("one_third", "\\frac{1}{3}", { ...start, x: -halfWidth / 3, y: y - 35 }, textStyle);
    const oneThirdK = latex("one_third_k", "k = 1", { ...start, x: -halfWidth / 3, y: y - 80 }, textStyle);
    const oneThirdTheta = latex("one_third_theta", "\\theta = \\frac{1}{3}", { ...start, x: -halfWidth / 3, y: y - 120 }, textStyle);
    const oneThirdN = latex("one_third_n", ONE_THIRD_N_LATEX, { ...start, x: 0, y: y - 200 }, textStyle);

    const twoThirds = latex("two_thirds", "\\frac{2}{3}", { ...start, x: halfWidth / 3, y: y - 35 }, textStyle);
    const twoThirdsK = latex("two_thirds_k", "k = 2", { ...start, x: halfWidth / 3, y: y - 80 }, textStyle);
    const twoThirdsTheta = latex("two_thirds_theta", "\\theta = \\frac{2}{3}", { ...start, x: halfWidth / 3, y: y - 120 }, textStyle);
    const twoThirdsN = latex("two_thirds_n", TWO_THIRDS_N_LATEX, { ...start, x: 0, y: y - 280 }, textStyle);
    return [axisLine, axisStart, axisEnd, oneThird, twoThirds, oneThirdK, oneThirdTheta, oneThirdN, twoThirdsK, twoThirdsTheta, twoThirdsN];
}

const axisStepIds = ["axis", "axis_start", "axis_end", "one_third", "two_thirds"];
const moveAxisSteps = (): TimelineEvent[] => {
    return axisStepIds.map((id) => at(t(latexes.length + 2)).animate(id, { position: { y: `+=${window.innerHeight}` } }, { duration: d }));
};

const moveMarks = (): TimelineEvent[] => {
    // Steps 13-18: Show k, theta, and n calculations
    const ids = ["one_third_k", "one_third_theta", "one_third_n", "two_thirds_k", "two_thirds_theta", "two_thirds_n"];
    return ids.map((id, index) => at(t(latexes.length + 3 + index)).animate(id, { position: { y: `+=${window.innerHeight}` } }, { duration: d }));
};

const displayLatexesSteps: TimelineEvent[] = latexes.map((_, index) => {
    return at(t(index + 1)).animate(`formula_${index}`, { position: { y: `+=${window.innerHeight}` } }, { duration: d });
});

const moveLatexesToLeftSteps: TimelineEvent[] = latexes.map((_, index) => {
    // const distance = window.innerWidth / 4;
    const distance = window.innerWidth;
    return at(t(latexes.length + 1)).animate(`formula_${index}`, { position: { x: `-=${distance}` } }, { duration: d });
});

const stepScene: TimelineSceneThree = {
    objects: [
        ...latexes,
        latex("kse_formula", "n = \\frac{k}{\\theta} - 1", { x: 0, y: window.innerHeight / 16 * 3 - window.innerHeight, z: 0 }, textStyle),
        ...buildAxis(),
    ],
    timeline: [
        ...displayLatexesSteps,
        ...moveLatexesToLeftSteps,
        at(t(latexes.length + 1)).animate(`kse_formula`, { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
        ...moveAxisSteps(),
        ...moveMarks(),
    ],
}

const renderer = createDualRenderer();
const camera = createOrthographicCamera();
const scene = new DualScene();
const animationController = new AnimationController(renderer, scene, camera);

const record = render(stepScene.objects, scene as any);
let timeline = buildAnimateTimeline(
    stepScene.timeline,
    record,
    animationController.startAnimation,
    animationController.stopAnimation
);

function KmvPageContent() {
    const { completeStep, isStepCompleted } = useThetaSketchProgress();
    const [currentNarration, setCurrentNarration] = React.useState<string>('');
    const { mode } = useTheme();
    const { getCurrentVoice } = useSpeech({ rate: 1.0 });

    const lastSpokenStepRef = useRef<number>(-1);

    // Sync Three.js materials with the current global theme
    useSyncObelusTheme();

    const { containerRef } = useThreeContainer(renderer);

    // Speak narration for a step
    const speakStep = useCallback((stepIndex: number) => {
        const narration = STEP_NARRATIONS[stepIndex];
        if (narration && stepIndex !== lastSpokenStepRef.current) {
            lastSpokenStepRef.current = stepIndex;
            setCurrentNarration(narration);

            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(narration);

            // Use getCurrentVoice() to always get the latest voice (safe for callbacks)
            const voice = getCurrentVoice();
            if (voice) {
                utterance.voice = voice;
            }

            utterance.rate = 1.0;
            utterance.onend = () => {
                setCurrentNarration('');
            };
            speechSynthesis.speak(utterance);
        }
    }, [getCurrentVoice]);

    // Add callbacks to timeline for each step
    useEffect(() => {
        if (!timeline) return;

        Object.keys(STEP_NARRATIONS).forEach((stepKey) => {
            const stepIndex = parseInt(stepKey);
            const startTime = STEP_START_TIMES[stepIndex] ?? 0;
            timeline.call(() => speakStep(stepIndex), [], startTime);
        });

        return () => {
            speechSynthesis.cancel();
        };
    }, [speakStep]);

    React.useEffect(() => {
        return () => {
            animationController.stopAnimation();
            speechSynthesis.cancel();
        };
    }, []);

    // Re-render the scene when mode changes to apply new colors
    React.useEffect(() => {
        animationController.renderAnimationOnce();
    }, [mode]);

    return (
        <>
            <StepTitle title="K-th Smallest Estimation" />
            <StepProgressIndicator currentStepId="kse" />

            {/* Subtitle Display */}
            <Fade in={!!currentNarration}>
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: window.innerHeight / 12 + 140,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        maxWidth: '80%',
                        zIndex: 1001,
                        textAlign: 'center',
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
                maxWidth="md"
                sx={{
                    position: 'fixed',
                    bottom: window.innerHeight / 12,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    animation: `${slideUp} 1s ease-out 0.25s both`,
                }}
            >
                <TimelinePlayer
                    timeline={timeline}
                    showNextButton={true}
                    nextPagePath="/theta-sketch/kmv"
                    nextPageTitle="Go to KMV Algorithm"
                    enableNextButton={isStepCompleted('kse')}
                    onStart={() => {
                        animationController.startAnimation();
                    }}
                    onPause={() => {
                        animationController.stopAnimation();
                        speechSynthesis.pause();
                    }}
                    onComplete={() => {
                        animationController.stopAnimation();
                        completeStep('kse');
                    }}
                />
            </Container>

            <div ref={containerRef} style={{ width: '100vw', height: '100vh', }} />
        </>
    );
}

export default KmvPageContent;
