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
import { useThreeContainer } from './useThreeContainer';

type DualThreeStage = {
    renderer: DualRenderer;
    scene: DualSceneType;
    camera: THREE.Camera;
    animationController: AnimationController;
    containerRef: React.RefObject<HTMLDivElement | null>;
};

type UseDualThreeStageOptions = {
    createRenderer?: () => DualRenderer;
    createScene?: () => DualSceneType;
    createCamera?: () => THREE.Camera;
    /** Optional extra cleanup (runs before disposal/clear). */
    onCleanup?: (ctx: Omit<DualThreeStage, 'containerRef'>) => void;
};

export function useDualThreeStage(options?: UseDualThreeStageOptions): DualThreeStage {
    // Intentionally treat options as "init-only" so callers can pass inline lambdas
    // without re-creating the renderer/scene/camera on every render.
    const optionsRef = React.useRef(options);

    const { renderer, scene, camera, animationController } = React.useMemo(() => {
        const opts = optionsRef.current;
        const renderer = (opts?.createRenderer ?? createDualRenderer)();
        const camera = (opts?.createCamera ?? createOrthographicCamera)();
        const scene = (opts?.createScene ?? (() => new DualScene()))();

        const animationController = new AnimationController(renderer, scene, camera);
        return { renderer, scene, camera, animationController };
    }, []);

    const { containerRef } = useThreeContainer(renderer);

    React.useEffect(() => {
        return () => {
            optionsRef.current?.onCleanup?.({ renderer, scene, camera, animationController });
            animationController.stopAnimation();
            disposeDualSceneResources(scene);
            clearScene(scene);
            disposeDualRenderer(renderer);
        };
    }, [animationController, camera, renderer, scene]);

    return { renderer, scene, camera, animationController, containerRef };
}
