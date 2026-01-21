import React from 'react';
import gsap from 'gsap';
import { at } from 'obelus';
import { clearScene, createDualRenderer, createOrthographicCamera } from "../../utils/threeUtils";
import { buildAnimateTimeline } from 'obelus-gsap-animator';
import { useThreeContainer } from "../../hooks/useThreeContainer";
import { DualScene, type TimelineSceneThree, render, axis, text, circle, latex, line } from 'obelus-three-render';
import { AnimationController } from "../../utils/animation-controller";
import TimelinePlayer from '../../components/TimelinePlayer';
import { Container } from '@mui/material';
import KmvIntroCard from './KmvIntroCard';
import { axisStyle, textStyle, circleStyle, lineStyle, useSyncObelusTheme } from '../../theme/obelusTheme';
import { useThetaSketchProgress } from '../../contexts/ThetaSketchProgressContext';
import { useSpeech } from '@alchemist/shared';
import { slideUp } from '@alchemist/shared';

// Scene dimensions
const axisWidth = window.innerWidth / 2;
const xAlign = -axisWidth / 2;
const axisY = window.innerHeight / 10 - window.innerHeight;

// Build axis elements
const buildAxis = () => {
    const start = { x: -axisWidth / 2, y: axisY };
    const end = { x: axisWidth / 2, y: axisY };
    return [
        axis("axis", start, end, { ...axisStyle, dotCount: 2 }),
        text("axis_start", "0", { ...start, y: axisY - 15 }, textStyle),
        text("axis_end", "1", { ...end, y: axisY - 15 }, textStyle),
    ]
};

// Build dashboard elements
//    K = 5
//      θ
// ---- | ----
//     0.5
//   N = 100
// Estimated = (K / θ) - 1
const buildDashboard = (k: number) => {
    return [
        text("k_value", `K = ${k}`, { y: window.innerHeight / 10 * 2 - window.innerHeight, x: 0 }, textStyle),
        latex("theta_latex", "\\theta", { x: axisWidth + xAlign, y: axisY + 30 }, textStyle),
        line("theta_line", { x: axisWidth + xAlign, y: axisY + 15 }, { x: axisWidth + xAlign, y: axisY }, 2, lineStyle),
        text("theta_value", "1", { x: axisWidth + xAlign, y: axisY - 15 }, textStyle),
        text("n_value", `N(Expected) = 0`, { y: -window.innerHeight }, textStyle),
        text("estimated", "Estimated = (K / θ) - 1", { y: -window.innerHeight - 30 }, textStyle),
    ]
};

// Estimate speaking duration based on word count
// Average: ~150 words per minute at rate 1.0, adjusted for rate 1.1
const estimateNarrationDuration = (text: string, rate: number = 1.1): number => {
    const wordCount = text.split(/\s+/).length;
    const wordsPerSecond = (150 / 60) * rate;
    return wordCount / wordsPerSecond;
};

// Animation to display axis and dashboard
const displayAxisAndDashboard = (startTime: number = 0) => {
    const steps = ["axis", "axis_start", "axis_end", "theta_line", "theta_latex", "theta_value", "estimated", "k_value", "n_value"];
    return steps.map((id) => at(startTime).animate(id, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }));
}

interface TimelineEntry {
    id: string;
    k: number;
    theta: number;
    n: number;
    estimated: number;
    circle: any;
    updatedThetaX: number;
}

// Build timeline entries from hash values
const buildTimelineEntries = (size: number, k: number): TimelineEntry[] => {
    const radius = 3;

    // Build hash values and shuffle them randomly
    const buildHashValues = (size: number): number[] => {
        const set = new Set<number>();
        while (set.size < size) {
            const hash: number = Math.random();
            set.add(hash);
        }
        const shuffledArray = Array.from(set).sort(() => Math.random() - 0.5);
        return shuffledArray;
    }

    const hashValues = buildHashValues(size);

    let previousThetaX = axisWidth + xAlign;
    return hashValues.map((hash, index) => {
        const x = hash * axisWidth + xAlign;
        const id = "circle_" + index;
        const newCircle = circle(id, radius, { x, y: axisY }, circleStyle);
        const sortedHashes = hashValues.slice(0, index + 1).sort((a, b) => a - b);
        const n: number = index + 1;
        const theta: number = k > n ? 1 : sortedHashes[k - 1];
        const estimated: number = k > n ? n : (k / theta) - 1;

        const thetaX = theta * axisWidth + xAlign;
        let updatedThetaX = thetaX - previousThetaX;
        previousThetaX = thetaX;

        return { id, k, theta, n, estimated, updatedThetaX, circle: newCircle };
    });
}

// Build GSAP timeline from entries
const buildTimeline = (entries: TimelineEntry[], startOffset: number = 0) => {
    const timeline: any[] = [];

    entries.forEach((entry, index) => {
        const { id, k, theta, n, estimated, updatedThetaX } = entry;
        const t = startOffset + index + 2; // Timeline position with offset
        timeline.push(
            at(t).animate(id, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })
        );
        timeline.push(
            at(t).animate("n_value", { element: { textContent: `N(Expected) = ${n}` } }, { duration: 0 })
        );
        timeline.push(
            at(t).animate("estimated", { element: { textContent: `Estimated = (K / θ) - 1 = (${k} / ${theta.toFixed(2)}) - 1 = ${estimated.toFixed(2)}` } }, { duration: 0 })
        );
        timeline.push(
            at(t).animate("theta_line", { position: { x: `+=${updatedThetaX}` } }, { duration: 1 })
        );
        timeline.push(
            at(t).animate("theta_latex", { position: { x: `+=${updatedThetaX}` } }, { duration: 1 })
        );
        timeline.push(
            at(t).animate("theta_value", { element: { textContent: `${theta.toFixed(2)}` } }, { duration: 0 })
        );
        timeline.push(
            at(t).animate("theta_value", { position: { x: `+=${updatedThetaX}` } }, { duration: 1 })
        );
    });

    return timeline;
}

// Module-level Three.js instances
const renderer = createDualRenderer();
const camera = createOrthographicCamera();
const scene = new DualScene();
const animationController = new AnimationController(renderer, scene, camera);

interface KmvVisualizationProps {
    k: number;
    streamSize: number;
    onBuildComplete?: () => void;
}

export default function KmvVisualization({
    k,
    streamSize,
    onBuildComplete,
}: KmvVisualizationProps) {
    const { completeStep } = useThetaSketchProgress();
    const { getCurrentVoice } = useSpeech({ rate: 1.0 });

    // Sync Three.js materials with the current global theme
    useSyncObelusTheme();

    const [timeline, setTimeline] = React.useState<any>(null);
    const [showIntro, setShowIntro] = React.useState(true);
    const hasBuiltRef = React.useRef(false);

    const { containerRef } = useThreeContainer(renderer);

    // Speak the intro narration
    const speakIntro = React.useCallback((text: string) => {
        if (!text) return;

        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;

        const voice = getCurrentVoice();
        if (voice) {
            utterance.voice = voice;
        }

        // Hide intro when speaking finishes
        utterance.onend = () => {
            setShowIntro(false);
        };

        speechSynthesis.speak(utterance);
        setShowIntro(true);
    }, [getCurrentVoice]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            animationController.stopAnimation();
            speechSynthesis.cancel();
        };
    }, []);

    // Build timeline when component mounts
    React.useEffect(() => {
        if (!hasBuiltRef.current) {
            hasBuiltRef.current = true;
            buildAndSetTimeline();
        }
    }, [k, streamSize]);

    const buildAndSetTimeline = () => {
        animationController.stopAnimation();
        gsap.globalTimeline.clear();
        clearScene(scene);
        animationController.renderAnimationOnce();

        // Calculate intro narration and its duration
        const introNarration = `Before we dive into the demo, let's review the KMV algorithm again. K Minimum Values, keeps only the K smallest hash values in memory, in this case K = ${k}. If the sketch is not full, we add the new hash. If full, we compare with theta: smaller values replace the largest, larger values are ignored. In the demo, N Expected shows the real unique count, while Estimated shows the value calculated from K divided by theta minus 1. Now let's see it in action.`;
        const narrationDuration = estimateNarrationDuration(introNarration, 1.1);
        const animationStartTime = narrationDuration - 2; // added 2 seconds to the narration duration to ensure animation starts after narration smoothly.

        const entries = buildTimelineEntries(streamSize, k);

        const stepScene: TimelineSceneThree = {
            objects: [
                ...buildDashboard(k),
                ...buildAxis(),
                ...entries.map(entry => entry.circle),
            ],
            timeline: [
                ...displayAxisAndDashboard(animationStartTime),
                ...buildTimeline(entries, animationStartTime),
            ],
        }

        const record = render(stepScene.objects, scene as any);
        const newTimeline = buildAnimateTimeline(
            stepScene.timeline,
            record,
            animationController.startAnimation,
            animationController.stopAnimation
        );

        // Brief introduction about KMV - starts immediately
        newTimeline.call(() => {
            speakIntro(introNarration);
        }, [], 0.5);

        setTimeline(newTimeline);
        onBuildComplete?.();
    }

    return (
        <>
            {/* Structured Intro Card */}
            <KmvIntroCard visible={showIntro} />

            {/* Timeline Player */}
            {timeline && (
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
                    <TimelinePlayer
                        timeline={timeline}
                        showNextButton={true}
                        showMuteButton={false}
                        nextPagePath="/theta-sketch/set-operations"
                        nextPageTitle="Go to Set Operations"
                        enableNextButton={true}
                        onStart={() => {
                            animationController.startAnimation();
                            speechSynthesis.resume();
                        }}
                        onPause={() => {
                            animationController.stopAnimation();
                            speechSynthesis.pause();
                        }}
                        onComplete={() => {
                            animationController.stopAnimation();
                            speechSynthesis.cancel();
                            setShowIntro(false);
                            completeStep('kmv');
                        }}
                    />
                </Container>
            )}

            {/* Three.js Canvas Container */}
            <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />
        </>
    );
}

// Export rebuild function for use in parent component
export { animationController };
