import * as THREE from 'three';
import { CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";
import { DualRenderer, DualScene } from 'obelus-three-render';

export function createOrthographicCamera(
    width: number = window.innerWidth,
    height: number = window.innerHeight,
    {
        near = 0.1,
        far = 1000,
        z = 500,
        zoom = 1,
    } = {}
): THREE.OrthographicCamera {
    const left = -width / 2;
    const right = width / 2;
    const top = height / 2;
    const bottom = -height / 2;

    const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera.position.z = z;
    camera.zoom = zoom;
    camera.updateProjectionMatrix();

    return camera;
};

/**
 * Updates dual renderer size and orthographic camera bounds so the scene
 * stays centered when the viewport is resized. Call from a window resize listener.
 */
export function updateOrthographicResize(
    renderer: DualRenderer,
    camera: THREE.OrthographicCamera,
    width: number,
    height: number
): void {
    renderer.webglRenderer.setSize(width, height);
    renderer.webglRenderer.setPixelRatio(window.devicePixelRatio);
    renderer.css3dRenderer.setSize(width, height);

    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
}

function createWebglRenderer(
    width: number,
    height: number,
    {
        alpha = true,
        antialias = true,
    } = {}
): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ alpha, antialias });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    return renderer;
};

function createCss3dRenderer(
    width: number,
    height: number,
) {
    const renderer = new CSS3DRenderer();
    renderer.setSize(width, height);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.pointerEvents = 'none';
    return renderer;
};

export function createDualRenderer(
    width: number = window.innerWidth,
    height: number = window.innerHeight,
) {
    const webglRenderer = createWebglRenderer(width, height);
    const css3dRenderer = createCss3dRenderer(width, height);
    return new DualRenderer(webglRenderer as any, css3dRenderer as any);
};

export function useDualRenderer(
    width: number = window.innerWidth,
    height: number = window.innerHeight,
) {
    const renderer = createDualRenderer(width, height);
    const camera = createOrthographicCamera(width, height);
    return { renderer, camera };
};

export function clearScene(scene: DualScene) {
    // Remove all objects from Three.js scene
    while (scene.threeScene.children.length > 0) {
        scene.threeScene.remove(scene.threeScene.children[0]);
    }

    // Remove all objects from CSS3D scene
    while (scene.css3dScene.children.length > 0) {
        scene.css3dScene.remove(scene.css3dScene.children[0]);
    }
};
