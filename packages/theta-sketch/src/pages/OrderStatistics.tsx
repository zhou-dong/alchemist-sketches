import React, { useCallback, useRef, useEffect } from 'react';
import { at } from 'obelus';
import { createDualRenderer, createOrthographicCamera } from "../utils/threeUtils";
import { buildAnimateTimeline } from 'obelus-gsap-animator';
import { useThreeContainer } from "../hooks/useThreeContainer";
import { render, axis, latex, ring, text, DualScene } from 'obelus-three-render';
import { type Animatable } from "obelus";
import { AnimationController } from "../utils/animation-controller";
import StepTitle from '../components/StepTitle';
import { axisStyle, textStyle, ringStyle, useSyncObelusTheme } from '../theme/obelusTheme';
import { useTheme, useSpeech } from '@alchemist/shared';
import { Container, Box, Typography, Fade } from '@mui/material';
import TimelinePlayer from '../components/TimelinePlayer';
import { Object3D } from 'three';
import { useThetaSketchProgress } from '../contexts/ThetaSketchProgressContext';
import { calculateStepTimings } from '../utils/narration';
import StepProgressIndicator from '../components/StepProgressIndicator';
import { slideUp } from '@alchemist/shared';

// Narration for each timeline step
const STEP_NARRATIONS: Record<number, string> = {
    0: "Let's start with a simple case: if we want to split a line into two equal parts, we can use one node to do it.",
    1: "The expected value of that node is one half.",
    2: "Similarly, if we want to split a line into three equal parts, we will need two nodes.",
    3: "The first node's value is one third.",
    4: "The second node's value is two thirds.",
    5: "We can rewrite the first node's value as 1 over 1 plus 1.",
    6: "Similarly, one-third can be rewritten as 1 over 2 plus 1.",
    7: "And two-thirds can be rewritten as 2 over 2 plus 1.",
    8: "What does this mean? In 1 over 1 plus 1, the total number of nodes is 1.",
    9: "And the index of the node is 1.",
    10: "In 1 over 2 plus 1, the total number of nodes is 2.",
    11: "And the index of the node is 1.",
    12: "In 2 over 2 plus 1, the total number of nodes is also 2.",
    13: "And the index of the node is 2.",
    14: "What does this mean? We can generalize the formula as k over n plus 1, which gives the expected value of the k-th node out of n nodes. This is called order statistics.",
    15: "This can be proven using the Beta distribution. However, the Beta distribution is beyond the scope of this sketch, so we'll skip the proof.",
    16: "On the next page, we'll see how to use order statistics to estimate the k-th smallest estimation.",
};

// Calculate step durations and cumulative start times
const { startTimes: STEP_START_TIMES } = calculateStepTimings(STEP_NARRATIONS);

// Animation duration is shorter than narration - animations complete while speaking continues
const ANIMATION_DURATION = 0.8;

const scaleYAdjector = -35;
const scaleNumeratorYAdjector = scaleYAdjector + 15;
const scaleDenominatorYAdjector = scaleYAdjector - 13;

const z = 0;
const height = window.innerHeight / 6;
const width = Math.min(window.innerWidth / 4, 800);
const scale0 = (y: number) => ({ x: -width, y, z });
const scale1 = (y: number) => ({ x: width, y, z });

function scaleK(dotCount: number, k: number) {
    const startX = 0 - width;
    const endX = width;

    const axisWidth = endX - startX;
    const step = axisWidth / (dotCount + 1);
    const x = startX + step * k;
    return x;
}

const OrderStatisticsExpression = `\\mathbb{E}[X_{(k)}] = \\frac{k}{n+1}`;
const BetaDistributionExpectedValueExpression = `
\\mathbb{E}[\\text{Beta}(\\alpha, \\beta)] = \\frac{\\alpha}{\\alpha + \\beta}

\\quad \\Rightarrow \\quad
\\mathbb{E}[X_{(k)}] = \\frac{k}{k + (n - k + 1)}

\\quad\\Rightarrow \\quad
\\mathbb{E}[X_{(k)}] = \\frac{k}{n + 1}
`;

const kTh = (k: number, n: string) => `\\frac{${k}}{\\text{${n}}}`;

const stepSceneObjects: Animatable<Object3D>[] = [
    latex("order_statistics_expression", OrderStatisticsExpression, { x: scaleK(1, 1), y: height + height / 2 - window.innerHeight, z }, { ...textStyle, fontSize: "20px" }),

    axis("axis_1", { x: -width, y: height - window.innerHeight, z }, { x: width, y: height - window.innerHeight, z }, { ...axisStyle, dotCount: 3 }),
    text("axis_1_start", "0", scale0(height + scaleYAdjector - window.innerHeight), textStyle),
    text("axis_1_end", "1", scale1(height + scaleYAdjector - window.innerHeight), textStyle),
    latex("axis_1_k_1", "\\frac{1}{2}", { x: scaleK(1, 1), y: height + scaleYAdjector - window.innerHeight, z }, textStyle),

    axis("axis_2", { x: -width, y: 0 - window.innerHeight, z }, { x: width, y: 0 - window.innerHeight, z }, { ...axisStyle, dotCount: 4 }),
    text("axis_2_start", "0", scale0(0 + scaleYAdjector - window.innerHeight), textStyle),
    text("axis_2_end", "1", scale1(0 + scaleYAdjector - window.innerHeight), textStyle),
    latex("axis_2_k_1", "\\frac{1}{3}", { x: scaleK(2, 1), y: 0 + scaleYAdjector - window.innerHeight, z }, textStyle),
    latex("axis_2_k_2", "\\frac{2}{3}", { x: scaleK(2, 2), y: 0 + scaleYAdjector - window.innerHeight, z }, textStyle),

    // expression
    latex("axis_1_k_1_expression_1", `= ${kTh(1, '1 + 1')}`, { x: scaleK(1, 1) + 50, y: height + scaleYAdjector - window.innerHeight, z }, textStyle),
    latex("axis_2_k_1_expression_1", `= ${kTh(1, '2 + 1')}`, { x: scaleK(2, 1) + 50, y: 0 + scaleYAdjector - window.innerHeight, z }, textStyle),
    latex("axis_2_k_2_expression_1", `= ${kTh(2, '2 + 1')}`, { x: scaleK(2, 2) + 50, y: 0 + scaleYAdjector - window.innerHeight, z }, textStyle),

    // rings
    ring("axis_1_k_1_ring_1", 10, 1.5, { x: scaleK(1, 1) + 43, y: height + scaleDenominatorYAdjector - window.innerHeight, z }, ringStyle),
    latex("axis_1_k_1_ring_1_k", "n = 1", { x: scaleK(1, 1) + 115, y: height + scaleDenominatorYAdjector - window.innerHeight, z }, textStyle),
    ring("axis_1_k_1_ring_2", 10, 1.5, { x: scaleK(1, 1) + 60, y: height + scaleNumeratorYAdjector - window.innerHeight, z }, ringStyle),
    latex("axis_1_k_1_ring_2_k", "k = 1", { x: scaleK(1, 1) + 115, y: height + scaleNumeratorYAdjector - 5 - window.innerHeight, z }, textStyle),

    ring("axis_2_k_1_ring_1", 10, 1, { x: scaleK(2, 1) + 43, y: 0 + scaleDenominatorYAdjector - window.innerHeight, z }, ringStyle),
    latex("axis_2_k_1_ring_1_k", "n = 2", { x: scaleK(2, 1) + 115, y: 0 + scaleDenominatorYAdjector - window.innerHeight, z }, textStyle),
    ring("axis_2_k_1_ring_2", 10, 1, { x: scaleK(2, 1) + 60, y: 0 + scaleNumeratorYAdjector - window.innerHeight, z }, ringStyle),
    latex("axis_2_k_1_ring_2_k", "k = 1", { x: scaleK(2, 1) + 115, y: 0 + scaleNumeratorYAdjector - 5 - window.innerHeight, z }, textStyle),
    ring("axis_2_k_2_ring_1", 10, 1, { x: scaleK(2, 2) + 43, y: 0 + scaleDenominatorYAdjector - window.innerHeight, z }, ringStyle),
    latex("axis_2_k_2_ring_1_k", "n = 2", { x: scaleK(2, 2) + 115, y: 0 + scaleDenominatorYAdjector - window.innerHeight, z }, textStyle),
    ring("axis_2_k_2_ring_2", 10, 1, { x: scaleK(2, 2) + 60, y: 0 + scaleNumeratorYAdjector - window.innerHeight, z }, ringStyle),
    latex("axis_2_k_2_ring_2_k", "k = 2", { x: scaleK(2, 2) + 115, y: 0 + scaleNumeratorYAdjector - 5 - window.innerHeight, z }, textStyle),

    latex("beta_distribution_expected_value_expression", BetaDistributionExpectedValueExpression, { x: scaleK(1, 1), y: 0 - height - window.innerHeight, z }, { ...textStyle })
];

// Helper to get step start time
const t = (step: number) => STEP_START_TIMES[step] ?? 0;
const d = ANIMATION_DURATION;

const timelineSteps = [
    at(t(0)).animate("axis_1", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    at(t(0)).animate("axis_1_start", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    at(t(0)).animate("axis_1_end", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),

    at(t(1)).animate("axis_1_k_1", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),

    at(t(2)).animate("axis_2", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    at(t(2)).animate("axis_2_start", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    at(t(2)).animate("axis_2_end", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),

    at(t(3)).animate("axis_2_k_1", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    at(t(4)).animate("axis_2_k_2", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    // expression
    at(t(5)).animate("axis_1_k_1_expression_1", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    at(t(6)).animate("axis_2_k_1_expression_1", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    at(t(7)).animate("axis_2_k_2_expression_1", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),

    // rings axis_1
    at(t(8)).animate("axis_1_k_1_ring_1", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    at(t(8)).animate("axis_1_k_1_ring_1_k", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),

    at(t(9)).animate("axis_1_k_1_ring_2", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    at(t(9)).animate("axis_1_k_1_ring_2_k", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),

    // rings axis_2
    at(t(10)).animate("axis_2_k_1_ring_1", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    at(t(10)).animate("axis_2_k_1_ring_1_k", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),

    at(t(11)).animate("axis_2_k_1_ring_2", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    at(t(11)).animate("axis_2_k_1_ring_2_k", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),

    at(t(12)).animate("axis_2_k_2_ring_1", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    at(t(12)).animate("axis_2_k_2_ring_1_k", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),

    at(t(13)).animate("axis_2_k_2_ring_2", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    at(t(13)).animate("axis_2_k_2_ring_2_k", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),

    // equations
    at(t(14)).animate("order_statistics_expression", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
    at(t(15)).animate("beta_distribution_expected_value_expression", { position: { y: `+=${window.innerHeight}` } }, { duration: d }),
];

const renderer = createDualRenderer();
const scene = new DualScene();
const camera = createOrthographicCamera();
const animationController = new AnimationController(renderer, scene, camera);

const records = render(stepSceneObjects, scene as any);
let timelinePlayer = buildAnimateTimeline(
    timelineSteps,
    records,
    animationController.startAnimation,
    animationController.stopAnimation
);

function OrderStatisticsPageContent() {
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

            // Use Web Speech API directly for better control
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
        if (!timelinePlayer) return;

        // Add labels and callbacks for each step at their calculated start times
        Object.keys(STEP_NARRATIONS).forEach((stepKey) => {
            const stepIndex = parseInt(stepKey);
            const startTime = STEP_START_TIMES[stepIndex] ?? 0;
            timelinePlayer.call(() => speakStep(stepIndex), [], startTime);
        });

        return () => {
            speechSynthesis.cancel();
        };
    }, [speakStep]);

    // Re-render the scene when mode changes to apply new colors
    React.useEffect(() => {
        animationController.renderAnimationOnce();
    }, [mode]);

    React.useEffect(() => {
        return () => {
            animationController.stopAnimation();
            speechSynthesis.cancel();
        };
    }, []);

    return (
        <>
            <StepTitle title="Order Statistics" />
            <StepProgressIndicator currentStepId="order-statistics" />

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
                    timeline={timelinePlayer}
                    showNextButton={true}
                    nextPagePath="/theta-sketch/kse"
                    nextPageTitle="Go to K-th Smallest Estimation"
                    enableNextButton={isStepCompleted('order-statistics')}
                    onStart={() => {
                        animationController.startAnimation();
                    }}
                    onPause={() => {
                        animationController.stopAnimation();
                        speechSynthesis.pause();
                    }}
                    onComplete={() => {
                        animationController.stopAnimation();
                        completeStep('order-statistics');
                    }}
                />
            </Container>

            <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />
        </>
    );
}

export default OrderStatisticsPageContent
