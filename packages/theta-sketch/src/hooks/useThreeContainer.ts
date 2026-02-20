import { useEffect, useRef } from 'react';
import { DualRenderer } from 'obelus-three-render';

export function useThreeContainer(dualRenderer: DualRenderer) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const webglEl = dualRenderer.webglRenderer.domElement;
        const css3dEl = dualRenderer.css3dRenderer.domElement;

        container.appendChild(webglEl);
        container.appendChild(css3dEl);

        return () => {
            // Safe even if the elements were moved elsewhere.
            webglEl.remove();
            css3dEl.remove();
        };
    }, [dualRenderer]);

    return { containerRef };
};
