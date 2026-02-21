import React from 'react';
import { type TimelineSceneThree, render, axis, text, circle } from 'obelus-three-render';
import { axisStyle, circleStyle, textStyle } from '@alchemist/theta-sketch/theme/obelusTheme';
import { useDualThreeStage } from '@alchemist/theta-sketch/hooks/useDualThreeStage';
import { buildAnimateTimeline } from 'obelus-gsap-animator';
import { useSetOperationsDemoData } from './SetOperationsDemoShared';
import { useOrthographicImmediateResize } from '@alchemist/theta-sketch/hooks/useOrthographicResize';
import * as THREE from 'three';
import { at } from 'obelus';
import { Box, Container, Stack, Typography } from '@mui/material';
import { slideUp } from '@alchemist/shared';
import TimelinePlayer from '@alchemist/theta-sketch/components/TimelinePlayer';
import { clearScene, disposeDualSceneResources } from '@alchemist/theta-sketch/utils/threeUtils';
import { NewThetaLimitNote, SetCard } from './SetOperationsDemoShared';
interface Position {
    x: number;
    y: number;
}

function StepBlock({
    show,
    children,
    delayMs = 0,
}: {
    show: boolean;
    children: React.ReactNode;
    delayMs?: number;
}) {
    return (
        <Box
            sx={{
                opacity: show ? 1 : 0,
                transform: show ? 'translateX(0px)' : 'translateX(-12px)',
                transition: `opacity 320ms ease, transform 320ms ease`,
                transitionDelay: `${delayMs}ms`,
                pointerEvents: show ? 'auto' : 'none',
            }}
        >
            {children}
        </Box>
    );
}

const buildAxis = (start: Position, end: Position, title?: string) => {
    const randomId = Math.random().toString(36).substring(2, 15);

    const axisLineId = `axis_line_${randomId}`;
    const axisStartId = `axis_start_${randomId}`;
    const axisEndId = `axis_end_${randomId}`;
    const axisTitleId = `axis_title_${randomId}`;

    const axisLine = axis(axisLineId, start, end, { ...axisStyle, dotCount: 2 });
    const axisStart = text(axisStartId, "0", { x: start.x, y: start.y - 15 }, textStyle);
    const axisEnd = text(axisEndId, "1", { x: end.x, y: end.y - 15 }, textStyle);
    const axisTitle = title
        ? text(axisTitleId, title, { x: start.x, y: start.y + 18 }, { ...textStyle, fontSize: '18px' } as any)
        : null;

    return { axisLineId, axisStartId, axisEndId, axisTitleId, axisLine, axisStart, axisEnd, axisTitle };
};

const buildDot = (name: string, start: Position, end: Position, value: number) => {
    const radius = 3;
    const scale = end.x - start.x;
    const x = start.x + value * scale;
    const y = start.y;
    const dotId = `${name}_dot_${value}`;
    const dot = circle(dotId, radius, { x, y }, circleStyle);
    return { dotId, dot };
};

const buildAxisAndDots = (name: string, start: Position, end: Position, values: number[]) => {
    const axisTitle = name === 'a' ? 'Sketch A (KMV)' : name === 'b' ? 'Sketch B (KMV)' : 'Union sketch (KMV)';
    const axis = buildAxis(start, end, axisTitle);
    const dots = values.map((value) => buildDot(name, start, end, value));
    return { axis, dots };
};

const buildTimelineSteps = (
    time: number,
    axisLineId: string,
    axisStartId: string,
    axisEndId: string,
    dotIds: string[],
    extraIds: string[] = []
) => {
    const steps: any[] = [];
    const buildAndAddStep = (id: string) => {
        steps.push(
            at(time).animate(id, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })
        );
    };

    buildAndAddStep(axisLineId);
    buildAndAddStep(axisStartId);
    buildAndAddStep(axisEndId);
    extraIds.forEach((id) => buildAndAddStep(id));
    dotIds.forEach((dotId) => buildAndAddStep(dotId));
    return steps;
};

interface KmvUnionProps {
    sketchA: { values: number[]; theta: number };
    sketchB: { values: number[]; theta: number };
    union: { values: number[]; theta: number; estimated: number };
    k: number;
}

const Main = ({ sketchA, sketchB, union, k }: KmvUnionProps) => {

    // useSyncObelusTheme();
    const { animationController, containerRef, scene, renderer, camera } = useDualThreeStage();

    useOrthographicImmediateResize(
        renderer,
        camera as THREE.OrthographicCamera,
        { onResize: () => animationController?.renderAnimationOnce?.() }
    );

    const [timeline, setTimeline] = React.useState<any>(null);
    const [uiStep, setUiStep] = React.useState<number>(0);

    React.useEffect(() => {
        if (!scene || !animationController) return;

        setUiStep(0);

        // Reset scene objects before (re)building.
        disposeDualSceneResources(scene);
        clearScene(scene);

        const startX = -window.innerWidth / 4;
        const endX = window.innerWidth / 4;

        const sketchCValues = union.values;

        const { axis: axisA, dots: dotsA } = buildAxisAndDots(
            "a",
            { x: startX, y: window.innerHeight / 12 * 3 - window.innerHeight },
            { x: endX, y: window.innerHeight / 12 * 3 - window.innerHeight },
            sketchA.values
        );
        const { axis: axisB, dots: dotsB } = buildAxisAndDots(
            "b",
            { x: startX, y: window.innerHeight / 12 - window.innerHeight },
            { x: endX, y: window.innerHeight / 12 - window.innerHeight },
            sketchB.values
        );
        const { axis: axisC, dots: dotsC } = buildAxisAndDots(
            "c",
            { x: startX, y: -window.innerHeight / 12 - window.innerHeight },
            { x: endX, y: -window.innerHeight / 12 - window.innerHeight },
            sketchCValues
        );

        const timelineScene: TimelineSceneThree = {
            objects: [
                axisA.axisLine,
                axisA.axisStart,
                axisA.axisEnd,
                ...(axisA.axisTitle ? [axisA.axisTitle] : []),
                ...(dotsA.map((dot) => dot.dot)),
                axisB.axisLine,
                axisB.axisStart,
                axisB.axisEnd,
                ...(axisB.axisTitle ? [axisB.axisTitle] : []),
                ...(dotsB.map((dot) => dot.dot)),
                axisC.axisLine,
                axisC.axisStart,
                axisC.axisEnd,
                ...(axisC.axisTitle ? [axisC.axisTitle] : []),
                ...(dotsC.map((dot) => dot.dot)),
            ],
            timeline: [
                ...buildTimelineSteps(
                    1,
                    axisA.axisLineId,
                    axisA.axisStartId,
                    axisA.axisEndId,
                    dotsA.map((dot) => dot.dotId),
                    axisA.axisTitle ? [axisA.axisTitleId] : []
                ),
                ...buildTimelineSteps(
                    2,
                    axisB.axisLineId,
                    axisB.axisStartId,
                    axisB.axisEndId,
                    dotsB.map((dot) => dot.dotId),
                    axisB.axisTitle ? [axisB.axisTitleId] : []
                ),
                ...buildTimelineSteps(
                    3,
                    axisC.axisLineId,
                    axisC.axisStartId,
                    axisC.axisEndId,
                    dotsC.map((dot) => dot.dotId),
                    axisC.axisTitle ? [axisC.axisTitleId] : []
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

        // Keep the overlay UI in sync with the timeline (seek/restart safe).
        // These match the axis reveal times (1, 2, 3).
        nextTimeline.call(() => setUiStep(0), [], 0);
        nextTimeline.call(() => setUiStep(1), [], 0.95);
        nextTimeline.call(() => setUiStep(2), [], 1.95);
        nextTimeline.call(() => setUiStep(3), [], 2.95);
        nextTimeline.call(() => setUiStep(4), [], 3.35);

        setTimeline(nextTimeline);

        return () => {
            nextTimeline?.kill?.();
            disposeDualSceneResources(scene);
            clearScene(scene);
        };
    }, [animationController, k, scene, sketchA.values, sketchB.values, union.values]);

    return (
        <>
            <Box
                sx={{
                    position: 'fixed',
                    top: window.innerHeight / 18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    width: { xs: '92%', md: 920 },
                    pointerEvents: 'none',
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 800,
                        letterSpacing: -0.5,
                        mb: 1,
                    }}
                >
                    KMV Union (Three Sketches)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    KMV stores only the K smallest hash values; θ is inferred as the K-th value.
                </Typography>
            </Box>

            <Box
                sx={{
                    position: 'fixed',
                    top: window.innerHeight / 6,
                    left: 16,
                    zIndex: 1000,
                    width: { xs: 'calc(100% - 32px)', md: 420 },
                    pointerEvents: 'auto',
                }}
            >
                <Stack spacing={1.25}>
                    <StepBlock show={uiStep >= 1}>
                        <SetCard
                            title="Sketch A"
                            subtitle={`K = ${k}`}
                            values={sketchA.values}
                            theta={sketchA.theta}
                            estimated={sketchA.theta > 0 ? k / sketchA.theta - 1 : 0}
                            formula="θ = v_k,  N̂ = k/θ − 1"
                            color="#3b82f6"
                        />
                    </StepBlock>

                    <StepBlock show={uiStep >= 2} delayMs={40}>
                        <SetCard
                            title="Sketch B"
                            subtitle={`K = ${k}`}
                            values={sketchB.values}
                            theta={sketchB.theta}
                            estimated={sketchB.theta > 0 ? k / sketchB.theta - 1 : 0}
                            formula="θ = v_k,  N̂ = k/θ − 1"
                            color="#a855f7"
                        />
                    </StepBlock>

                    <StepBlock show={uiStep >= 3} delayMs={60}>
                        <SetCard
                            title="Union (KMV)"
                            subtitle="Merge unique values → keep K smallest"
                            values={union.values}
                            theta={union.theta}
                            estimated={union.estimated}
                            formula="UnionK = sort(A∪B)[:K],  θ = max(UnionK),  N̂ = k/θ − 1"
                            color="#22c55e"
                        />
                    </StepBlock>

                    <StepBlock show={uiStep >= 4} delayMs={80}>
                        <NewThetaLimitNote
                            correctTheta={Math.min(sketchA.theta, sketchB.theta)}
                            resultValues={union.values}
                            operationLabel="Union"
                        />
                    </StepBlock>
                </Stack>
            </Box>

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
