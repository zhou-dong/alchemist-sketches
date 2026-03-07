import { useEffect, useMemo } from 'react';
import * as THREE from "three";
import type { AxisProps } from 'obelus-three-render';
import { neoGlassColors, typography, useTheme } from '@alchemist/shared';

// =============================================================================
// THEME COLOR TOKENS (Default fallback)
// =============================================================================

/**
 * Default obelus theme colors (used when outside of theme context)
 */
export const obelusColors = {
    // Primary color for lines, axes
    primary: neoGlassColors.violet.main,
    // Secondary color for dots, circles, highlights
    secondary: neoGlassColors.teal.main,
    // Accent color for special elements
    accent: neoGlassColors.coral.main,
    // Text color
    text: neoGlassColors.teal.main,
} as const;

// =============================================================================
// THREE.JS MATERIAL FACTORIES
// =============================================================================

/**
 * Create a line material with the theme's primary color
 */
export const createLineMaterial = (color: string = obelusColors.primary) =>
    new THREE.LineBasicMaterial({ color });

/**
 * Create a mesh material with the theme's secondary color
 */
export const createMeshMaterial = (color: string = obelusColors.secondary) =>
    new THREE.MeshBasicMaterial({ color });

// =============================================================================
// PRE-CONFIGURED STYLES
// =============================================================================

export const lineStyle: THREE.LineBasicMaterial = createLineMaterial();

export const axisStyle: AxisProps = {
    dotCount: 3,
    lineWidth: 1.5,
    lineMaterial: createLineMaterial() as unknown as THREE.Material,
    dotMaterial: createMeshMaterial() as unknown as THREE.Material,
    dotRadius: 4
};

export const textStyle: Partial<CSSStyleDeclaration> = {
    color: obelusColors.text,
    fontSize: '16px',
    fontWeight: 'normal',
    fontFamily: typography.fontFamily.primary,
};

export const ringStyle: THREE.MeshBasicMaterial = createMeshMaterial();

export const circleStyle: THREE.MeshBasicMaterial = createMeshMaterial();

// =============================================================================
// OBELUS THEME FACTORY
// =============================================================================

export interface ObelusThemeConfig {
    primaryColor?: string;
    secondaryColor?: string;
    textColor?: string;
    fontFamily?: string;
}

/**
 * Create a customized obelus theme with specific colors
 */
export function createObelusTheme(config: ObelusThemeConfig = {}) {
    const {
        primaryColor = obelusColors.primary,
        secondaryColor = obelusColors.secondary,
        textColor = obelusColors.text,
        fontFamily = typography.fontFamily.primary,
    } = config;

    return {
        lineStyle: createLineMaterial(primaryColor),
        axisStyle: {
            dotCount: 3,
            lineWidth: 1.5,
            lineMaterial: createLineMaterial(primaryColor) as unknown as THREE.Material,
            dotMaterial: createMeshMaterial(secondaryColor) as unknown as THREE.Material,
            dotRadius: 4
        } as AxisProps,
        textStyle: {
            color: textColor,
            fontSize: '16px',
            fontWeight: 'normal',
            fontFamily,
        } as Partial<CSSStyleDeclaration>,
        ringStyle: createMeshMaterial(secondaryColor),
        circleStyle: createMeshMaterial(secondaryColor),
    };
}

// =============================================================================
// REACT HOOK FOR DYNAMIC THEME
// =============================================================================

export interface ObelusThemeStyles {
    lineStyle: THREE.LineBasicMaterial;
    axisStyle: AxisProps;
    textStyle: Partial<CSSStyleDeclaration>;
    ringStyle: THREE.MeshBasicMaterial;
    circleStyle: THREE.MeshBasicMaterial;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
    };
}

function resolveObelusColors(
    _currentTheme: ReturnType<typeof useTheme>['currentTheme'],
    mode: ReturnType<typeof useTheme>['mode']
) {
    const isDark = mode === 'dark';
    const mono = isDark ? '#FFFFFF' : '#000000';
    return {
        primary: mono,
        secondary: mono,
        accent: mono,
        text: mono,
    };
}

/**
 * React hook that provides Three.js materials based on the current global theme.
 * Materials are recreated when the theme or mode changes.
 */
export function useObelusTheme(): ObelusThemeStyles {
    const { currentTheme, mode } = useTheme();

    return useMemo(() => {
        const colors = resolveObelusColors(currentTheme, mode);

        const fontFamily = currentTheme.typography.fontFamily.primary;

        return {
            lineStyle: createLineMaterial(colors.primary),
            axisStyle: {
                dotCount: 3,
                lineWidth: 1.5,
                lineMaterial: createLineMaterial(colors.primary) as unknown as THREE.Material,
                dotMaterial: createMeshMaterial(colors.secondary) as unknown as THREE.Material,
                dotRadius: 4
            } as AxisProps,
            textStyle: {
                color: colors.text,
                fontSize: '16px',
                fontWeight: 'normal',
                fontFamily,
            } as Partial<CSSStyleDeclaration>,
            ringStyle: createMeshMaterial(colors.secondary),
            circleStyle: createMeshMaterial(colors.secondary),
            colors,
        };
    }, [currentTheme, mode]);
}

/**
 * Hook that syncs module-level materials with the current theme.
 * Call this in your component to keep the static materials updated.
 */
export function useSyncObelusTheme(): void {
    const { currentTheme, mode } = useTheme();

    useEffect(() => {
        const colors = resolveObelusColors(currentTheme, mode);
        const primaryColor = colors.primary;
        const secondaryColor = colors.secondary;
        const textColor = colors.text;
        const fontFamily = currentTheme.typography.fontFamily.primary;

        // Update the module-level materials in place
        lineStyle.color.set(primaryColor);
        lineStyle.needsUpdate = true;

        // Update axis materials
        (axisStyle.lineMaterial as THREE.LineBasicMaterial).color.set(primaryColor);
        (axisStyle.lineMaterial as THREE.LineBasicMaterial).needsUpdate = true;
        (axisStyle.dotMaterial as THREE.MeshBasicMaterial).color.set(secondaryColor);
        (axisStyle.dotMaterial as THREE.MeshBasicMaterial).needsUpdate = true;

        // Update other materials
        ringStyle.color.set(secondaryColor);
        ringStyle.needsUpdate = true;
        circleStyle.color.set(secondaryColor);
        circleStyle.needsUpdate = true;

        // Update text style object (for future creations)
        textStyle.color = textColor;
        textStyle.fontFamily = fontFamily;

        // Update existing CSS3D text elements in the DOM
        // CSS3D renderer creates elements with transform-style: preserve-3d
        const timeoutId = setTimeout(() => {
            // Target CSS3D rendered elements (they have 3D transforms)
            const allElements = document.querySelectorAll('[style*="translate3d"], [style*="matrix3d"]');
            allElements.forEach(el => {
                const htmlEl = el as HTMLElement;
                // Update color if it's a text element
                if (htmlEl.style.color) {
                    htmlEl.style.color = textColor;
                }
                if (htmlEl.style.fontFamily) {
                    htmlEl.style.fontFamily = fontFamily;
                }
            });

            // Also update MathJax/KaTeX elements if present
            const mathElements = document.querySelectorAll('.MathJax, .katex, mjx-container');
            mathElements.forEach(el => {
                const htmlEl = el as HTMLElement;
                htmlEl.style.color = textColor;
            });
        }, 0); // Use setTimeout to ensure DOM is updated

        return () => {
            clearTimeout(timeoutId);
        };
    }, [currentTheme, mode]);
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export const obelusTheme = {
    colors: obelusColors,
    lineStyle,
    axisStyle,
    textStyle,
    ringStyle,
    circleStyle,
    // Factory for custom themes
    create: createObelusTheme,
    // React hooks for dynamic theming
    useObelusTheme,
    useSyncObelusTheme,
};
