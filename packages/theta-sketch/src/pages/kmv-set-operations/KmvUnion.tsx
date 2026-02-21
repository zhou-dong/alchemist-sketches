import React from 'react';
import { type TimelineSceneThree, render, axis, text, circle } from 'obelus-three-render';
import { axisStyle, circleStyle, textStyle } from '@alchemist/theta-sketch/theme/obelusTheme';
import { useDualThreeStage } from '@alchemist/theta-sketch/hooks/useDualThreeStage';
import { buildAnimateTimeline } from 'obelus-gsap-animator';
import { useSetOperationsDemoData } from './SetOperationsDemoShared';
import { useOrthographicImmediateResize } from '@alchemist/theta-sketch/hooks/useOrthographicResize';
import * as THREE from 'three';
import { at } from 'obelus';
import { Container } from '@mui/material';
import { slideUp } from '@alchemist/shared';
import TimelinePlayer from '@alchemist/theta-sketch/components/TimelinePlayer';
import { clearScene, disposeDualSceneResources } from '@alchemist/theta-sketch/utils/threeUtils';
interface Position {
    x: number;
    y: number;
}

const buildAxis = (start: Position, end: Position) => {
    const randomId = Math.random().toString(36).substring(2, 15);

    const axisLineId = `axis_line_${randomId}`;
    const axisStartId = `axis_start_${randomId}`;
    const axisEndId = `axis_end_${randomId}`;

    const axisLine = axis(axisLineId, start, end, { ...axisStyle, dotCount: 2 });
    const axisStart = text(axisStartId, "0", { x: start.x, y: start.y - 15 }, textStyle);
    const axisEnd = text(axisEndId, "1", { x: end.x, y: end.y - 15 }, textStyle);

    return { axisLineId, axisStartId, axisEndId, axisLine, axisStart, axisEnd };
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
    const axis = buildAxis(start, end);
    const dots = values.map((value) => buildDot(name, start, end, value));
    return { axis, dots };
};

const buildTimelineSteps = (time: number, axisLineId: string, axisStartId: string, axisEndId: string, dotIds: string[]) => {
    const steps: any[] = [];
    const buildAndAddStep = (id: string) => {
        steps.push(
            at(time).animate(id, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 })
        );
    };

    buildAndAddStep(axisLineId);
    buildAndAddStep(axisStartId);
    buildAndAddStep(axisEndId);
    dotIds.forEach((dotId) => buildAndAddStep(dotId));
    return steps;
};

interface KmvUnionProps {
    sketchA: { values: number[] };
    sketchB: { values: number[] };
    k: number;
}

const Main = ({ sketchA, sketchB, k }: KmvUnionProps) => {

    // useSyncObelusTheme();
    const { animationController, containerRef, scene, renderer, camera } = useDualThreeStage();

    useOrthographicImmediateResize(
        renderer,
        camera as THREE.OrthographicCamera,
        {
            onResize: () => animationController?.renderAnimationOnce(),
        }
    );

    const [timeline, setTimeline] = React.useState<any>(null);

    React.useEffect(() => {
        if (!scene || !animationController) return;

        // Reset scene objects before (re)building.
        disposeDualSceneResources(scene);
        clearScene(scene);

        const startX = -window.innerWidth / 4;
        const endX = window.innerWidth / 4;

        const sketchCValues = [...sketchA.values, ...sketchB.values].sort((a, b) => a - b).slice(0, k);

        const { axis: axisA, dots: dotsA } = buildAxisAndDots(
            "a",
            { x: startX, y: window.innerHeight / 3 },
            { x: endX, y: window.innerHeight / 3 },
            sketchA.values
        );
        const { axis: axisB, dots: dotsB } = buildAxisAndDots(
            "b",
            { x: startX, y: window.innerHeight / 4 },
            { x: endX, y: window.innerHeight / 4 },
            sketchB.values
        );
        const { axis: axisC, dots: dotsC } = buildAxisAndDots(
            "c",
            { x: startX, y: window.innerHeight / 6 },
            { x: endX, y: window.innerHeight / 6 },
            sketchCValues
        );

        const timelineScene: TimelineSceneThree = {
            objects: [
                axisA.axisLine,
                axisA.axisStart,
                axisA.axisEnd,
                ...(dotsA.map((dot) => dot.dot)),
                axisB.axisLine,
                axisB.axisStart,
                axisB.axisEnd,
                ...(dotsB.map((dot) => dot.dot)),
                axisC.axisLine,
                axisC.axisStart,
                axisC.axisEnd,
                ...(dotsC.map((dot) => dot.dot)),
            ],
            timeline: [
                ...buildTimelineSteps(1, axisA.axisLineId, axisA.axisStartId, axisA.axisEndId, dotsA.map((dot) => dot.dotId)),
                ...buildTimelineSteps(2, axisB.axisLineId, axisB.axisStartId, axisB.axisEndId, dotsB.map((dot) => dot.dotId)),
                ...buildTimelineSteps(3, axisC.axisLineId, axisC.axisStartId, axisC.axisEndId, dotsC.map((dot) => dot.dotId)),
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

        setTimeline(nextTimeline);

        return () => {
            nextTimeline?.kill?.();
            disposeDualSceneResources(scene);
            clearScene(scene);
        };
    }, [animationController, k, scene, sketchA.values, sketchB.values]);

    return (
        <>
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

    const { sketchA, sketchB } = useSetOperationsDemoData(k, streamASize, streamBSize, 0);

    return (
        <Main sketchA={sketchA} sketchB={sketchB} k={k} />
    );
};
