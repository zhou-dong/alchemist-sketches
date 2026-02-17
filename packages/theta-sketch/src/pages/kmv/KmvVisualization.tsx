import React from 'react';
import gsap from 'gsap';
import { at } from 'obelus';
import { clearScene, createDualRenderer, createOrthographicCamera } from "../../utils/threeUtils";
import { buildAnimateTimeline } from 'obelus-gsap-animator';
import { useThreeContainer } from "../../hooks/useThreeContainer";
import { DualScene, type TimelineSceneThree, render, axis, text, circle, latex, line } from 'obelus-three-render';
import { AnimationController } from "../../utils/animation-controller";
import TimelinePlayer from '../../components/TimelinePlayer';
import { Box, Container, Fade, Typography } from '@mui/material';
import { axisStyle, textStyle, circleStyle, lineStyle, useSyncObelusTheme } from '../../theme/obelusTheme';
import { useThetaSketchProgress } from '../../contexts/ThetaSketchProgressContext';
import { useSpeech } from '@alchemist/shared';
import { slideUp } from '@alchemist/shared';
import { useOrthographicImmediateResize } from '@alchemist/theta-sketch/hooks/useOrthographicResize';
import * as THREE from 'three';

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
    const [currentSubtitle, setCurrentSubtitle] = React.useState<string>('');
    const hasBuiltRef = React.useRef(false);

    const { containerRef } = useThreeContainer(renderer);

    // Subtitle progress tracking for the intro narration (best-effort timing).
    const subtitleIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
    const narrationStartTimeRef = React.useRef<number>(0);
    const narrationEstimatedDurationMsRef = React.useRef<number>(0);
    const narrationPauseStartedAtRef = React.useRef<number | null>(null);
    const sentenceDataRef = React.useRef<Array<{ text: string; start: number; end: number }> | null>(null);
    const sentenceRangesRef = React.useRef<Array<{ text: string; startIndex: number; endIndex: number }> | null>(null);
    const isNarratingRef = React.useRef(false);
    const boundaryDrivenRef = React.useRef(false);
    const boundaryEverFiredRef = React.useRef(false);

    const stopSubtitleTracking = React.useCallback(() => {
        if (subtitleIntervalRef.current) {
            clearInterval(subtitleIntervalRef.current);
            subtitleIntervalRef.current = null;
        }
    }, []);

    const startSubtitleTracking = React.useCallback(() => {
        stopSubtitleTracking();
        subtitleIntervalRef.current = setInterval(() => {
            if (!isNarratingRef.current) return;
            const duration = narrationEstimatedDurationMsRef.current;
            if (!duration) return;
            const elapsed = Date.now() - narrationStartTimeRef.current;
            const progress = Math.min(Math.max(elapsed / duration, 0), 1) * 100;
            const data = sentenceDataRef.current;
            if (!data || data.length === 0) return;

            const sentence = data.find((s) => progress >= s.start && progress < s.end) ?? data[data.length - 1];
            if (sentence?.text) setCurrentSubtitle(sentence.text);
        }, 100);
    }, [stopSubtitleTracking]);

    const pauseSubtitleTracking = React.useCallback(() => {
        if (!isNarratingRef.current) return;
        if (boundaryDrivenRef.current) return;
        narrationPauseStartedAtRef.current = Date.now();
        stopSubtitleTracking();
    }, [stopSubtitleTracking]);

    const resumeSubtitleTracking = React.useCallback(() => {
        if (!isNarratingRef.current) return;
        if (boundaryDrivenRef.current) return;
        const pausedAt = narrationPauseStartedAtRef.current;
        if (pausedAt) {
            narrationStartTimeRef.current += Date.now() - pausedAt;
            narrationPauseStartedAtRef.current = null;
        }
        startSubtitleTracking();
    }, [startSubtitleTracking]);

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

        boundaryDrivenRef.current = false;
        boundaryEverFiredRef.current = false;

        // Prepare sentence ranges for boundary-aligned subtitles.
        // We keep indices into the original text so `event.charIndex` maps correctly.
        const sentenceRegex = /[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g;
        const matches = Array.from(text.matchAll(sentenceRegex));
        const ranges = (matches.length > 0 ? matches : [{ 0: text, index: 0 } as any]).map((m: any) => {
            const raw = String(m[0] ?? '');
            const startIndex = Number(m.index ?? 0);
            const endIndex = startIndex + raw.length;
            const display = raw.replace(/\s+/g, ' ').trim();
            return { text: display, startIndex, endIndex };
        }).filter((s) => s.text.length > 0);
        sentenceRangesRef.current = ranges;

        // Fallback sentence list for time-based tracking (same display text).
        const sentenceList = ranges.length > 0 ? ranges.map((r) => r.text) : [text.replace(/\s+/g, ' ').trim()];
        const totalWords = text.split(/\s+/).filter(Boolean).length || 1;

        let cumulative = 0;
        const data = sentenceList.map((s) => {
            const wc = s.split(/\s+/).filter(Boolean).length || 1;
            const weight = wc / totalWords;
            const start = cumulative;
            cumulative += weight * 100;
            return { text: s, start, end: cumulative };
        });
        sentenceDataRef.current = data;

        // Estimate duration: conservative speaking speed so we don't jump early.
        const wordsPerSecond = 2.0 * utterance.rate; // ~120 wpm at rate=1
        const estimatedMs = (totalWords / wordsPerSecond) * 1000;
        narrationEstimatedDurationMsRef.current = Math.max(estimatedMs, 800);
        narrationStartTimeRef.current = Date.now();
        narrationPauseStartedAtRef.current = null;
        isNarratingRef.current = true;

        // Start at the first sentence.
        setCurrentSubtitle(data[0]?.text ?? '');
        startSubtitleTracking();

        // Prefer boundary-driven subtitle updates when available.
        utterance.onboundary = (event: SpeechSynthesisEvent) => {
            const charIndex = (event as any).charIndex as number | undefined;
            if (typeof charIndex !== 'number') return;
            boundaryEverFiredRef.current = true;
            boundaryDrivenRef.current = true;

            const rs = sentenceRangesRef.current;
            if (!rs || rs.length === 0) return;
            const current = rs.find((r) => charIndex >= r.startIndex && charIndex < r.endIndex) ?? rs[rs.length - 1];
            if (current?.text) setCurrentSubtitle(current.text);

            // Once boundaries are firing, stop the time-based tracker to avoid jitter.
            stopSubtitleTracking();
        };

        utterance.onend = () => {
            isNarratingRef.current = false;
            stopSubtitleTracking();
            setCurrentSubtitle('');
        };
        utterance.onerror = () => {
            isNarratingRef.current = false;
            stopSubtitleTracking();
            setCurrentSubtitle('');
        };

        speechSynthesis.speak(utterance);
    }, [getCurrentVoice, startSubtitleTracking, stopSubtitleTracking]);

    // Cleanup on unmount: stop animation + cancel any ongoing speech.
    // (Avoid setState in cleanup to prevent updates on unmounted component.)
    React.useEffect(() => {
        return () => {
            animationController.stopAnimation();
            speechSynthesis.cancel();
            isNarratingRef.current = false;
            stopSubtitleTracking();
        };
    }, [stopSubtitleTracking]);

    // Build timeline when component mounts
    React.useEffect(() => {
        if (!hasBuiltRef.current) {
            hasBuiltRef.current = true;
            buildAndSetTimeline();
        }
    }, [k, streamSize]);

    useOrthographicImmediateResize(renderer, camera as THREE.OrthographicCamera, {
        onResize: () => animationController.renderAnimationOnce(),
    });

    const buildAndSetTimeline = () => {
        animationController.stopAnimation();
        gsap.globalTimeline.clear();
        clearScene(scene);
        animationController.renderAnimationOnce();

        // Intro narration (explains what this page shows) — plays while the animation runs.
        // Includes the implementation rules from KmvIntroCard (but as audio only).
        const introNarration = `On this page, we simulate KMV on a stream.
Each dot is an item hashed into a value between 0 and 1 and placed on the number line.
KMV keeps only the K smallest hash values in memory, here K equals ${k}.
Theta is the current K-th smallest value, shown by the vertical line.

Implementation rules: if the sketch is not full yet, add the new hash. 
If the sketch is full, compare the new hash to theta; if it is smaller than theta, add it and remove the largest stored value; if it is larger than theta, ignore it.

As more items arrive, the estimate updates as N-hat equals K divided by theta, minus 1.`;
        const animationStartTime = 0;

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

        // Brief introduction about this page - starts at the beginning
        newTimeline.call(() => {
            speakIntro(introNarration);
        }, [], 0.5);

        setTimeline(newTimeline);
        onBuildComplete?.();
    }

    return (
        <>
            {/* Subtitle display for current narration */}
            <Fade in={!!currentSubtitle}>
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: window.innerHeight / 12 + 140,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'min(900px, calc(100vw - 32px))',
                        zIndex: 1001,
                        textAlign: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.primary',
                            px: 3,
                            py: 1.5,
                            lineHeight: 1.6,
                        }}
                    >
                        {currentSubtitle}
                    </Typography>
                </Box>
            </Fade>

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
                            resumeSubtitleTracking();
                        }}
                        onPause={() => {
                            animationController.stopAnimation();
                            speechSynthesis.pause();
                            pauseSubtitleTracking();
                        }}
                        onComplete={() => {
                            animationController.stopAnimation();
                            speechSynthesis.cancel();
                            isNarratingRef.current = false;
                            stopSubtitleTracking();
                            setCurrentSubtitle('');
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
