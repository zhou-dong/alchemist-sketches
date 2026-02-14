import React from 'react';
import * as THREE from 'three';
import { Container } from '@mui/material';
import gsap from 'gsap';
import { clearScene, createDualRenderer, createOrthographicCamera } from "../../utils/threeUtils";
import { at } from 'obelus';
import { axis, circle, DualScene, latex, line, render, text, type TimelineSceneThree } from 'obelus-three-render';
import { AnimationController } from "../../utils/animation-controller";
import { useThreeContainer } from "../../hooks/useThreeContainer";
import { buildAnimateTimeline } from 'obelus-gsap-animator';
import TimelinePlayer from '../../components/TimelinePlayer';
import { axisStyle, lineStyle, textStyle } from '../../theme/obelusTheme';
import { useThetaSketchProgress } from '../../contexts/ThetaSketchProgressContext';
import { slideUp, useSpeech } from '@alchemist/shared';
import SetOperationsIntroCard from './SetOperationsIntroCard';

const renderer = createDualRenderer();
const camera = createOrthographicCamera();
const scene = new DualScene();
const animationController = new AnimationController(renderer, scene, camera);

// Narration texts for each section
const NARRATIONS = {
    intro: `Let's explore the three fundamental set operations on KMV sketches: Union, Intersection, and Difference. Each operation leverages the probabilistic properties of hash values to estimate cardinality.`,
    union: `For Union, we combine both sketches and keep only the K smallest hash values. The new theta becomes the maximum of these K values. We then estimate the union size using K divided by theta minus one.`,
    intersection: `For Intersection, we use the smaller theta from both sketches as our threshold. We count elements that appear in both sets below this threshold, then divide by theta to get the estimated intersection size.`,
    difference: `For Difference, we again use the smaller theta. We count elements that appear in set A but not in set B, below the threshold. Dividing by theta gives us the estimated difference size.`,
};

const unionFormula = (k: number, theta: number) => {
    const estimated = (k / theta - 1).toFixed(2);
    return `
\\begin{align*} 
1. &\\quad H_{\\text{union}} = \\text{sort}(A \\cup B)[:k] \\\\ 
2. &\\quad \\theta = \\max(H_{\\text{union}}) \\\\ 
3. &\\quad \\hat{N} = \\frac{k}{\\theta} - 1 =  \\frac{${k}}{${theta}} - 1 = ${estimated}
\\end{align*}
`;
};

const intersectionFormula = (intersectionSize: number, theta: number) => {
    const result = (intersectionSize / theta).toFixed(2);
    return `
\\begin{align*}
1. & \\quad \\theta = \\min(\\theta_A, \\theta_B) \\\\ 
2. & \\quad h_1 = \\{v \\in A \\mid v < \\theta\\} \\\\ 
3. & \\quad h_2 = \\{v \\in B \\mid v < \\theta\\} \\\\ 
4. & \\quad \\hat{N} = \\frac{|h_1 \\cap h_2|}{\\theta}  = \\frac{${intersectionSize}}{${theta}} = ${result}
\\end{align*}
`;
};

const differenceFormula = (differenceSize: number, theta: number) => {
    const result = (differenceSize / theta).toFixed(2);
    return `
\\begin{align*}     
1. &\\quad \\theta = \\min(\\theta_A, \\theta_B) \\\\ 
2. &\\quad h_1 = \\{v \\in A \\mid v < \\theta\\} \\\\ 
3. &\\quad h_2 = \\{v \\in B \\mid v < \\theta\\} \\\\ 
4. &\\quad \\hat{N} = \\frac{|h_1 \\setminus h_2|}{\\theta}  = \\frac{${differenceSize}}{${theta}} = ${result}
\\end{align*}
`;
};

const buildAxis = (id: string, y: number, width: number) => {
    const leftX = -width / 2;
    const rightX = width / 2;
    return [
        axis(`${id}_axis`, { x: leftX, y }, { x: rightX, y }, { ...axisStyle, dotCount: 2 }),
        text(`${id}_start`, "0", { x: leftX, y: y - 15 }, textStyle),
        text(`${id}_end`, "1", { x: rightX, y: y - 15 }, textStyle),
    ];
};

const buildBaseAxis = (
    id: string,
    y: number,
    width: number,
    {
        title,
        expected,
        k,
        theta,
        yOffset = 0,
    }: {
        title: string;
        expected: number;
        k: number;
        theta: number;
        yOffset?: number;
    }) => {
    const leftX = -width / 2;
    const rightX = width / 2;
    const adjustedY = y - yOffset;

    const estimated = (k / theta - 1).toFixed(2);

    const formula = `
    \\begin{align*}
    \\text{Expected} &= ${expected} \\\\
    \\text{Estimated} &= \\frac{k}{\\theta} - 1 = \\frac{${k}}{${theta}} - 1 = ${estimated}
    \\end{align*}
    `;

    return [
        axis(`${id}_axis`, { x: leftX, y: adjustedY }, { x: rightX, y: adjustedY }, { ...axisStyle, dotCount: 2 }),
        text(`${id}_start`, "0", { x: leftX, y: adjustedY - 15 }, textStyle),
        text(`${id}_end`, "1", { x: rightX, y: adjustedY - 15 }, textStyle),
        text(`${id}_title`, title, { x: -window.innerWidth / 8 * 3, y: adjustedY }, textStyle),
        latex(`${id}_formula`, formula, { x: window.innerWidth / 8 * 3, y: adjustedY }, textStyle),
    ];
};

const moveAxis = (id: string, t: number) => {
    return [
        at(t).animate(`${id}_axis`, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
        at(t).animate(`${id}_start`, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
        at(t).animate(`${id}_end`, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
    ];
};

const buildThetaMarker = (id: string, x: number, y: number, value: number, yOffset: number = 0) => {
    const adjustedY = y - yOffset;
    return [
        line(`${id}_theta_line`, { x, y: adjustedY + 20 }, { x, y: adjustedY }, 2, lineStyle),
        text(`${id}_theta_sign`, 'θ', { x, y: adjustedY + 30 }, textStyle),
        text(`${id}_theta_value`, value.toFixed(2), { x, y: adjustedY - 25 }, textStyle),
    ];
};

const moveThetaMarkers = (id: string, t: number) => {
    return [
        at(t).animate(`${id}_theta_line`, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
        at(t).animate(`${id}_theta_sign`, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
        at(t).animate(`${id}_theta_value`, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }),
    ];
};

const green = '#4CAF50';
const yellow = '#FFEB3B';
const blue = '#2196F3';
const radius = 4;

const buildHashes = (size: number, max: number, align: number): { value: number, location: number }[] => {
    const hashesSize = Math.min(size, 200);
    const hashes = new Set<number>();
    while (hashes.size < hashesSize) {
        const random = Math.round(Math.random() * 200) / 200;
        hashes.add(random);
    }
    const sortedHashes = Array.from(hashes).sort((a, b) => a - b);
    const locations = sortedHashes.map((hash) => hash * max + align);

    const result = [];
    for (let i = 0; i < size; i++) {
        const value = sortedHashes[i];
        const location = locations[i];
        result.push({ value, location });
    }

    return result;
};

interface SetOperationsVisualizationProps {
    k: number;
    streamASize: number;
    streamBSize: number;
}

export default function SetOperationsVisualization({
    k,
    streamASize,
    streamBSize,
}: SetOperationsVisualizationProps) {
    const { completeStep } = useThetaSketchProgress();
    const { getCurrentVoice } = useSpeech({ rate: 1.0 });

    const [timeline, setTimeline] = React.useState<any>(null);
    const [showIntro, setShowIntro] = React.useState(true);
    const hasBuiltRef = React.useRef(false);

    const { containerRef } = useThreeContainer(renderer);

    // Speak narration text
    const speak = React.useCallback((text: string) => {
        if (!text) return;

        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;

        const voice = getCurrentVoice();
        if (voice) {
            utterance.voice = voice;
        }

        speechSynthesis.speak(utterance);
    }, [getCurrentVoice]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            animationController.stopAnimation();
            speechSynthesis.cancel();
        };
    }, []);

    React.useEffect(() => {
        if (!hasBuiltRef.current) {
            hasBuiltRef.current = true;
            buildAndSetTimeline();
        }
    }, [k, streamASize, streamBSize]);

    const buildScene = (): TimelineSceneThree => {
        animationController.stopAnimation();
        gsap.globalTimeline.clear();
        clearScene(scene);
        animationController.renderAnimationOnce();

        const axisWidth = window.innerWidth / 2;
        const height = window.innerHeight / 6;
        const offscreenOffset = window.innerHeight; // Start sketches off-screen

        const hashesA = buildHashes(streamASize, axisWidth, -axisWidth / 2);
        const hashesB = buildHashes(streamBSize, axisWidth, -axisWidth / 2);

        const kthHashA = hashesA[k - 1];
        const kthHashB = hashesB[k - 1];

        const smallKth = kthHashA.value < kthHashB.value ? kthHashA : kthHashB;

        // Sketch A and B circles - start off-screen (below viewport)
        const hashesACircles = hashesA.map((hash, idx) => {
            const { location } = hash;
            const style = new THREE.MeshBasicMaterial({ color: green });
            return circle(`a_circle_${idx}`, radius, { x: location, y: height * 2 - offscreenOffset, z: 1 }, style as any);
        });

        const hashesBCircles = hashesB.map((hash, idx) => {
            const { location } = hash;
            const style = new THREE.MeshBasicMaterial({ color: blue });
            return circle(`b_circle_${idx}`, radius, { x: location, y: height, z: 1 }, style as any);
        });

        const kthUnionHash = () => {
            const unionHashes = [...hashesA, ...hashesB];
            const set = new Set(unionHashes.map((hash) => hash.value));
            const array = Array.from(set).sort((a, b) => a - b);

            const kthValue = array[k - 1];
            const kthIndex = unionHashes.findIndex((hash) => hash.value === kthValue);
            return { value: kthValue, location: unionHashes[kthIndex].location };
        };

        const kthUnion = kthUnionHash();

        // Union circles
        const unionCirclesA = hashesA
            .filter((hash) => hash.value <= kthHashA.value)
            .map((hash, idx) => {
                const style = new THREE.MeshBasicMaterial({ color: green });
                return circle(`union_a_circle_${idx}`, radius, { x: hash.location, y: height * 2, z: 1 }, style as any);
            });

        const unionCirclesB = hashesB
            .filter((hash) => hash.value <= kthHashB.value)
            .map((hash, idx) => {
                const style = new THREE.MeshBasicMaterial({ color: blue });
                return circle(`union_b_circle_${idx}`, radius, { x: hash.location, y: height, z: 1 }, style as any);
            });

        // Intersection data
        const hashesAWithSmallerKth = hashesA.filter((hash) => hash.value <= smallKth.value);
        const hashesBWithSmallerKth = hashesB.filter((hash) => hash.value <= smallKth.value);
        const intersectionsSet = new Set(hashesAWithSmallerKth.map((hash) => hash.value));
        const intersections = hashesBWithSmallerKth.filter(item => intersectionsSet.has(item.value));

        // Intersection circles
        const intersectionCirclesA = hashesAWithSmallerKth.map((hash, idx) => {
            const style = new THREE.MeshBasicMaterial({ color: green });
            return circle(`intersection_a_circle_${idx}`, radius, { x: hash.location, y: height * 2, z: 1 }, style as any);
        });

        const intersectionCirclesB = hashesBWithSmallerKth.map((hash, idx) => {
            const style = new THREE.MeshBasicMaterial({ color: blue });
            return circle(`intersection_b_circle_${idx}`, radius, { x: hash.location, y: height, z: 1 }, style as any);
        });

        const intersectionResultCircles = intersections.map((hash, idx) => {
            const style = new THREE.MeshBasicMaterial({ color: yellow });
            return circle(`intersection_theta_${idx}`, radius, { x: hash.location, y: -height - window.innerHeight, z: 1 }, style as any);
        });

        // Difference data
        const differencesSet = new Set(hashesBWithSmallerKth.map((hash) => hash.value));
        const differences = hashesAWithSmallerKth.filter(item => !differencesSet.has(item.value));

        // Difference circles
        const differenceCirclesA = hashesAWithSmallerKth.map((hash, idx) => {
            const style = new THREE.MeshBasicMaterial({ color: green });
            return circle(`difference_a_circle_${idx}`, radius, { x: hash.location, y: height * 2, z: 1 }, style as any);
        });

        const differenceCirclesB = hashesBWithSmallerKth.map((hash, idx) => {
            const style = new THREE.MeshBasicMaterial({ color: blue });
            return circle(`difference_b_circle_${idx}`, radius, { x: hash.location, y: height, z: 1 }, style as any);
        });

        const differenceResultCircles = differences.map((hash, idx) => {
            const style = new THREE.MeshBasicMaterial({ color: yellow });
            return circle(`difference_theta_${idx}`, radius, { x: hash.location, y: -height * 2 - window.innerHeight, z: 1 }, style as any);
        });

        // Titles and formulas
        const unionTitle = text("union_title", "Union", { x: -window.innerWidth / 8 * 3, y: 0 - window.innerHeight }, textStyle);
        const intersectionTitle = text("intersection_title", "Intersection", { x: -window.innerWidth / 8 * 3, y: -height - window.innerHeight }, textStyle);
        const differenceTitle = text("difference_title", "Difference", { x: -window.innerWidth / 8 * 3, y: -height * 2 - window.innerHeight }, textStyle);
        const unionFormulaLatex = latex("union_formula", unionFormula(k, kthUnion.value), { x: window.innerWidth / 8 * 3, y: 0 - window.innerHeight }, textStyle);
        const intersectionFormulaLatex = latex("intersection_formula", intersectionFormula(intersections.length, smallKth.value), { x: window.innerWidth / 8 * 3, y: -height - window.innerHeight }, textStyle);
        const differenceFormulaLatex = latex("difference_formula", differenceFormula(differences.length, smallKth.value), { x: window.innerWidth / 8 * 3, y: -height * 2 - window.innerHeight }, textStyle);

        // Build timeline animations
        let t = 0;
        const timeline: any[] = [];

        // Union section (t = 0-5)
        timeline.push(at(t).animate("union_title", { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }));
        timeline.push(at(t).animate("union_formula", { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }));
        t += 1;

        timeline.push(...moveAxis("union", t));
        t += 1;

        // Move union circles
        hashesA.filter((hash) => hash.value <= kthHashA.value).forEach((_, idx) => {
            timeline.push(at(t).animate(`union_a_circle_${idx}`, { position: { y: `-=${height * 2}` } }, { duration: 1 }));
        });
        t += 1;

        hashesB.filter((hash) => hash.value <= kthHashB.value).forEach((_, idx) => {
            timeline.push(at(t).animate(`union_b_circle_${idx}`, { position: { y: `-=${height}` } }, { duration: 1 }));
        });
        t += 1;

        timeline.push(...moveThetaMarkers("union_theta", t));
        t += 2; // Extra pause before intersection

        // Intersection section (t = 6-12)
        timeline.push(at(t).animate("intersection_title", { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }));
        timeline.push(at(t).animate("intersection_formula", { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }));
        t += 1;

        timeline.push(...moveAxis("intersection", t));
        t += 1;

        timeline.push(...moveThetaMarkers("intersection_theta", t));
        t += 1;

        // Move intersection circles
        hashesAWithSmallerKth.forEach((_, idx) => {
            timeline.push(at(t).animate(`intersection_a_circle_${idx}`, { position: { y: `-=${height * 3 - 10}` } }, { duration: 1 }));
        });
        t += 1;

        hashesBWithSmallerKth.forEach((_, idx) => {
            timeline.push(at(t).animate(`intersection_b_circle_${idx}`, { position: { y: `-=${height * 2 + 10}` } }, { duration: 1 }));
        });
        t += 1;

        intersections.forEach((_, idx) => {
            timeline.push(at(t).animate(`intersection_theta_${idx}`, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }));
        });
        t += 2; // Extra pause before difference

        // Difference section (t = 14-20)
        timeline.push(at(t).animate("difference_title", { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }));
        timeline.push(at(t).animate("difference_formula", { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }));
        t += 1;

        timeline.push(...moveAxis("difference", t));
        t += 1;

        timeline.push(...moveThetaMarkers("difference_theta", t));
        t += 1;

        // Move difference circles
        hashesAWithSmallerKth.forEach((_, idx) => {
            timeline.push(at(t).animate(`difference_a_circle_${idx}`, { position: { y: `-=${height * 4 - 10}` } }, { duration: 1 }));
        });
        t += 1;

        hashesBWithSmallerKth.forEach((_, idx) => {
            timeline.push(at(t).animate(`difference_b_circle_${idx}`, { position: { y: `-=${height * 3 + 10}` } }, { duration: 1 }));
        });
        t += 1;

        differences.forEach((_, idx) => {
            timeline.push(at(t).animate(`difference_theta_${idx}`, { position: { y: `+=${window.innerHeight}` } }, { duration: 1 }));
        });

        return {
            objects: [
                ...buildBaseAxis("sketch_a", height * 2, axisWidth, { title: "Sketch A", expected: streamASize, k, theta: kthHashA.value }),
                ...buildBaseAxis("sketch_b", height, axisWidth, { title: "Sketch B", expected: streamBSize, k, theta: kthHashB.value }),
                ...buildAxis("union", 0 - window.innerHeight, axisWidth),
                ...buildAxis("intersection", -height - window.innerHeight, axisWidth),
                ...buildAxis("difference", -height * 2 - window.innerHeight, axisWidth),
                ...buildThetaMarker("hashes_a", kthHashA.location, height * 2, kthHashA.value),
                ...buildThetaMarker("hashes_b", kthHashB.location, height, kthHashB.value),
                ...hashesACircles,
                ...hashesBCircles,
                unionTitle,
                unionFormulaLatex,
                ...unionCirclesA,
                ...unionCirclesB,
                ...buildThetaMarker("union_theta", kthUnion.location, 0 - window.innerHeight, kthUnion.value),
                intersectionTitle,
                intersectionFormulaLatex,
                ...intersectionCirclesA,
                ...intersectionCirclesB,
                ...intersectionResultCircles,
                ...buildThetaMarker("intersection_theta", smallKth.location, 0 - window.innerHeight - height, smallKth.value),
                differenceTitle,
                differenceFormulaLatex,
                ...differenceCirclesA,
                ...differenceCirclesB,
                ...differenceResultCircles,
                ...buildThetaMarker("difference_theta", smallKth.location, 0 - window.innerHeight - height * 2, smallKth.value),
            ],
            timeline,
        };
    };

    const buildAndSetTimeline = () => {
        const { objects, timeline: timelineData } = buildScene();
        const record = render(objects, scene as any);
        const newTimeline = buildAnimateTimeline(
            timelineData,
            record,
            animationController.startAnimation,
            animationController.stopAnimation
        );

        // Add speech callbacks synced with animation sections
        // Intro narration at the start
        newTimeline.call(() => speak(NARRATIONS.intro), [], 0);

        // Union narration when union section starts (t ≈ 0)
        newTimeline.call(() => speak(NARRATIONS.union), [], 0.5);

        // Intersection narration when intersection section starts (t ≈ 6)
        newTimeline.call(() => speak(NARRATIONS.intersection), [], 6);

        // Difference narration when difference section starts (t ≈ 14)
        newTimeline.call(() => speak(NARRATIONS.difference), [], 14);

        setTimeline(newTimeline);
    };

    return (
        <>
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
                        showMuteButton={true}
                        nextPagePath="/theta-sketch/theta-sketch"
                        nextPageTitle="Go to Theta Sketch"
                        enableNextButton={true}
                        onStart={() => {
                            animationController.startAnimation();
                            speechSynthesis.resume();
                            setShowIntro(false);
                        }}
                        onPause={() => {
                            animationController.stopAnimation();
                            speechSynthesis.pause();
                        }}
                        onComplete={() => {
                            animationController.stopAnimation();
                            speechSynthesis.cancel();
                            completeStep('set-operations');
                        }}
                    />
                </Container>
            )}

            {showIntro && (
                <SetOperationsIntroCard visible={showIntro} />
            )}

            {/* Three.js Canvas Container */}
            <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />
        </>
    );
}
