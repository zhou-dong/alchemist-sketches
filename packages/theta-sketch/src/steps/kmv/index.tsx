import React from 'react';
import gsap from 'gsap';
import { at } from 'obelus';
import { clearScene, createDualRenderer, createOrthographicCamera } from "../../utils/threeUtils";
import { buildAnimateTimeline } from 'obelus-gsap-animator';
import { useThreeContainer } from "../../hooks/useThreeContainer";
import { useThreeAutoResize } from "../../hooks/useThreeAutoResize";
import { DualScene, type TimelineSceneThree, render, axis, text, circle, latex, line } from 'obelus-three-render';
import { AnimationController } from "../../utils/animation-controller";
import KseToKmv from './KseToKmv';
import TimelinePlayer from '../../components/TimelinePlayer';
import { Container, Tooltip, Fab } from '@mui/material';
import KmvConfigDialog from './KmvConfigDialog';

import * as Settings from '@mui/icons-material/Settings';
import * as TipsAndUpdates from '@mui/icons-material/TipsAndUpdates';
import * as SportsEsports from '@mui/icons-material/SportsEsports';
import NextPageButton from '../../components/NextPageButton';
import StepTitle from '@alchemist/theta-sketch/components/StepTitle';
import { axisStyle, textStyle, circleStyle, lineStyle, useSyncObelusTheme } from '../../theme/obelusTheme';
import { useThetaSketchProgress } from '../../contexts/ThetaSketchProgressContext';

const SettingsIcon = Settings.default as unknown as React.ElementType;
const TipsAndUpdatesIcon = TipsAndUpdates.default as unknown as React.ElementType;
const SportsEsportsIcon = SportsEsports.default as unknown as React.ElementType;

const axisWidth = window.innerWidth / 2;
const xAlign = -axisWidth / 2;

const axisY = window.innerHeight / 10 - window.innerHeight;

const buildAxis = () => {
    const start = { x: -axisWidth / 2, y: axisY };
    const end = { x: axisWidth / 2, y: axisY };
    return [
        axis("axis", start, end, { ...axisStyle, dotCount: 2 }),
        text("axis_start", "0", { ...start, y: axisY - 15 }, textStyle),
        text("axis_end", "1", { ...end, y: axisY - 15 }, textStyle),
    ]
};

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

const displayAxisAndDashboard = () => {
    const steps = ["axis", "axis_start", "axis_end", "theta_line", "theta_latex", "theta_value", "estimated", "k_value", "n_value"];
    return steps.map((id) => at(0).animate(id, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }));
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

const buildTimelineEntries = (size: number, k: number): TimelineEntry[] => {
    const radius = 3;

    // build hash values and sort them randomly
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

const buildTimeline = (entries: TimelineEntry[]) => {
    const timeline: any[] = [];

    entries.forEach((entry, index) => {
        const { id, k, theta, n, estimated, updatedThetaX } = entry;
        timeline.push(
            at(index + 2).animate(id, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })
        );
        timeline.push(
            at(index + 2).animate("n_value", { element: { textContent: `N(Expected) = ${n}` } }, { duration: 0 })
        );
        timeline.push(
            at(index + 2).animate("estimated", { element: { textContent: `Estimated = (K / θ) - 1 = (${k} / ${theta.toFixed(2)}) - 1 = ${estimated.toFixed(2)}` } }, { duration: 0 })
        );
        timeline.push(
            at(index + 2).animate("theta_line", { position: { x: `+=${updatedThetaX}` } }, { duration: 1 })
        );
        timeline.push(
            at(index + 2).animate("theta_latex", { position: { x: `+=${updatedThetaX}` } }, { duration: 1 })
        );
        timeline.push(
            at(index + 2).animate("theta_value", { element: { textContent: `${theta.toFixed(2)}` } }, { duration: 0 })
        );
        timeline.push(
            at(index + 2).animate("theta_value", { position: { x: `+=${updatedThetaX}` } }, { duration: 1 })
        );
    });

    return timeline;
}

const renderer = createDualRenderer();
const camera = createOrthographicCamera();
const scene = new DualScene();
const animationController = new AnimationController(renderer, scene, camera);

let componentLevelShowNextPageButton: boolean = false;

function ThetaSketchPageContent() {
    const { completeStep } = useThetaSketchProgress();
    // Sync Three.js materials with the current global theme
    useSyncObelusTheme();

    const defaultK = 10;
    const defaultStreamSize = 50;
    const [k, setK] = React.useState(defaultK);
    const [streamSize, setStreamSize] = React.useState(defaultStreamSize);

    const [displayIntroduction, setDisplayIntroduction] = React.useState(true);
    const [openKmvConfigDialog, setOpenKmvConfigDialog] = React.useState(false);
    const [showTimelinePlayer, setShowTimelinePlayer] = React.useState(false);
    const [showNextPageButton, setShowNextPageButton] = React.useState(false);
    
    // Progressive flow step: 'start' | 'intro' | 'config' | 'demo' | 'complete'
    const [flowStep, setFlowStep] = React.useState<'start' | 'intro' | 'config' | 'demo' | 'complete'>('start');

    const [timeline, setTimeline] = React.useState<any>(null);

    const { containerRef } = useThreeContainer(renderer);
    useThreeAutoResize(containerRef, renderer, scene, camera);

    React.useEffect(() => {
        setShowNextPageButton(componentLevelShowNextPageButton);
        return () => {
            animationController.stopAnimation();
        };
    }, []);

    const handleBuildTimeline = () => {
        animationController.stopAnimation();
        gsap.globalTimeline.clear();
        clearScene(scene);
        animationController.renderAnimationOnce();

        const entries = buildTimelineEntries(streamSize, k);

        const stepScene: TimelineSceneThree = {
            objects: [
                ...buildDashboard(k),
                ...buildAxis(),
                ...entries.map(entry => entry.circle),
            ],
            timeline: [
                ...displayAxisAndDashboard(),
                ...buildTimeline(entries),
            ],
        }

        const record = render(stepScene.objects, scene as any);
        let timeline = buildAnimateTimeline(
            stepScene.timeline,
            record,
            animationController.startAnimation,
            animationController.stopAnimation
        );
        setTimeline(timeline);
    }

    const IntroductionToggle = () => (
        <Tooltip title={displayIntroduction ? 'Hide Introduction' : 'Show Introduction'} placement="left">
            <Fab
                onClick={() => setDisplayIntroduction(!displayIntroduction)}
                sx={{
                    position: 'fixed',
                    bottom: 312,
                    right: 24,
                    zIndex: 1000
                }}
            >
                <TipsAndUpdatesIcon />
            </Fab>
        </Tooltip>
    );

    const KmvSettingsToggle = () => (
        <Tooltip title={openKmvConfigDialog ? 'Close Config' : 'KMV Config'} placement="left">
            <Fab
                onClick={() => setOpenKmvConfigDialog(!openKmvConfigDialog)}
                sx={{
                    position: 'fixed',
                    bottom: 240,
                    right: 24,
                    zIndex: 1000
                }}
            >
                <SettingsIcon />
            </Fab>
        </Tooltip>
    );

    const TimelinePlayerToggle = () => (
        <Tooltip title={showTimelinePlayer ? 'Hide Timeline' : 'Show Timeline'} placement="left">
            <Fab
                onClick={() => setShowTimelinePlayer(!showTimelinePlayer)}
                sx={{
                    position: 'fixed',
                    bottom: 168,
                    right: 24,
                    zIndex: 1000
                }}
            >
                < SportsEsportsIcon sx={{ fontSize: 28 }} />
            </Fab>
        </Tooltip>
    );

    const TimelinePlayerContainer = () => (
        <Container
            maxWidth="sm"
            sx={{
                position: 'fixed',
                bottom: 100,
                left: 0,
                right: 0,
                zIndex: 1000,
            }}
        >
            <TimelinePlayer
                timeline={timeline}
                showNextButton={true}
                nextPagePath="/theta-sketch/roadmap"
                nextPageTitle="Go to Roadmap"
                enableNextButton={flowStep === 'complete'}
                onStart={() => {
                    animationController.startAnimation();
                }}
                onPause={() => {
                    animationController.stopAnimation();
                }}
                onComplete={handleDemoComplete}
            />
        </Container>
    );

    // Progressive flow handlers
    const handleStart = () => {
        setFlowStep('intro');
        setDisplayIntroduction(true);
    };

    const handleIntroComplete = () => {
        setFlowStep('config');
        setDisplayIntroduction(false);
        setOpenKmvConfigDialog(true);
    };

    const handleConfigComplete = () => {
        setFlowStep('demo');
        setOpenKmvConfigDialog(false);
        setShowTimelinePlayer(true);
        handleBuildTimeline();
    };

    const handleDemoComplete = () => {
        setFlowStep('complete');
        setShowNextPageButton(true);
        componentLevelShowNextPageButton = true;
        animationController.stopAnimation();
        completeStep('kmv');
    };

    return (
        <>
            <StepTitle title="K Minimum Value (KMV)" />
            {displayIntroduction && <KseToKmv onClose={handleIntroComplete} />}
            {showTimelinePlayer && <TimelinePlayerContainer />}
            <KmvSettingsToggle />
            <TimelinePlayerToggle />
            <IntroductionToggle />

            <Container maxWidth="xs">
                <KmvConfigDialog
                    open={openKmvConfigDialog}
                    onClose={() => {
                        setOpenKmvConfigDialog(false);
                    }}
                    onStart={handleConfigComplete}
                    k={k}
                    streamSize={streamSize}
                    setK={setK}
                    setStreamSize={setStreamSize}
                    defaultK={defaultK}
                    defaultStreamSize={defaultStreamSize}
                />
            </Container>

            {showNextPageButton && <NextPageButton nextPagePath="/theta-sketch/roadmap" title="Go to Roadmap" />}

            <div ref={containerRef} style={{ width: '100vw', height: '100vh', }} />
        </>
    );
}

export default ThetaSketchPageContent;
