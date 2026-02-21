import * as React from 'react';
import * as THREE from 'three';
import type { DualRenderer } from 'obelus-three-render';
import { updateOrthographicResize } from '../utils/threeUtils';

const DEFAULT_DEBOUNCE_MS = 150;

/**
 * Subscribes to window resize and keeps the orthographic Three.js scene centered
 * by updating renderer size and camera bounds. Optionally calls a callback after
 * each resize (e.g. to redraw the scene). Reusable across pages that use
 * DualRenderer + OrthographicCamera.
 */
export function useOrthographicDebouncedResize(
    renderer: DualRenderer | null | undefined,
    camera: THREE.OrthographicCamera | null | undefined,
    options?: {
        /** Called after camera/renderer are updated (e.g. renderAnimationOnce). */
        onResize?: () => void;
        /** Debounce delay in ms. Default 150. */
        debounceMs?: number;
    }
): void {
    const { onResize, debounceMs = DEFAULT_DEBOUNCE_MS } = options ?? {};
    const onResizeRef = React.useRef(onResize);
    onResizeRef.current = onResize;

    React.useEffect(() => {
        if (!renderer || !camera) return;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const handleResize = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                timeoutId = null;
                const width = window.innerWidth;
                const height = window.innerHeight;
                updateOrthographicResize(renderer, camera, width, height);
                onResizeRef.current?.();
            }, debounceMs);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [renderer, camera, debounceMs]);
}

/**
 * Same as useOrthographicResize but runs on every resize event (no debounce).
 * Use when the scene is light and you want the view to update immediately.
 */
export function useOrthographicImmediateResize(
    renderer: DualRenderer | null | undefined,
    camera: THREE.OrthographicCamera | null | undefined,
    options?: {
        /** Called after camera/renderer are updated (e.g. renderAnimationOnce). */
        onResize?: () => void;
    }
): void {
    const { onResize } = options ?? {};
    const onResizeRef = React.useRef(onResize);
    onResizeRef.current = onResize;

    React.useEffect(() => {
        if (!renderer || !camera) return;
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            updateOrthographicResize(renderer, camera, width, height);
            onResizeRef.current?.();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [renderer, camera]);
}
