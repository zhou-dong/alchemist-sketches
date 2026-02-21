import * as React from 'react';
import { DualScene, type DualRenderer, type DualScene as DualSceneType } from 'obelus-three-render';
import * as THREE from 'three';
import { AnimationController } from '../utils/animation-controller';
import {
    clearScene,
    createDualRenderer,
    createOrthographicCamera,
    disposeDualRenderer,
    disposeDualSceneResources,
} from '../utils/threeUtils';

type DualThreeStage = {
    containerRef: React.RefObject<HTMLDivElement | null>;
    renderer: DualRenderer | null;
    scene: DualSceneType | null;
    camera: THREE.Camera | null;
    animationController: AnimationController | null;
};

type UseDualThreeStageOptions = {
    createRenderer?: () => DualRenderer;
    createScene?: () => DualSceneType;
    createCamera?: () => THREE.Camera;
    /** Optional extra cleanup (runs before disposal/clear). */
    onCleanup?: (ctx: {
        renderer: DualRenderer;
        scene: DualSceneType;
        camera: THREE.Camera;
        animationController: AnimationController;
    }) => void;
};

export function useDualThreeStage(options?: UseDualThreeStageOptions): DualThreeStage {
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    // Treat options as init-only so callers can pass inline lambdas without
    // re-creating the stage on every render.
    const optionsRef = React.useRef(options);

    const [stage, setStage] = React.useState<{
        renderer: DualRenderer;
        scene: DualSceneType;
        camera: THREE.Camera;
        animationController: AnimationController;
    } | null>(null);

    // Create and dispose the whole stage inside one effect.
    // This is StrictMode-safe in dev (setup → cleanup → setup).
    React.useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const opts = optionsRef.current;
        const renderer = (opts?.createRenderer ?? createDualRenderer)();
        const camera = (opts?.createCamera ?? createOrthographicCamera)();
        const scene = (opts?.createScene ?? (() => new DualScene()))();
        const animationController = new AnimationController(renderer, scene, camera);

        container.appendChild(renderer.webglRenderer.domElement);
        container.appendChild(renderer.css3dRenderer.domElement);

        const nextStage = { renderer, scene, camera, animationController };
        setStage(nextStage);

        return () => {
            // Make consumers stop using disposed instances.
            setStage(null);

            opts?.onCleanup?.(nextStage);

            animationController.stopAnimation();
            disposeDualSceneResources(scene);
            clearScene(scene);
            disposeDualRenderer(renderer);

            // Remove DOM elements (CSS3DRenderer is DOM-based; no .dispose()).
            renderer.webglRenderer.domElement.remove();
            renderer.css3dRenderer.domElement.remove();
        };
    }, []);

    return {
        containerRef,
        renderer: stage?.renderer ?? null,
        scene: stage?.scene ?? null,
        camera: stage?.camera ?? null,
        animationController: stage?.animationController ?? null,
    };
}
