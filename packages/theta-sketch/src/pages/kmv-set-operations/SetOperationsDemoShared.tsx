import { useMemo } from 'react';
import { computeDifference, computeIntersection, computeUnion } from './setOperationsCompute';
import { buildRandomSketchPair } from './setOperationsRandomData';

export function buildTwoSketches(k: number, streamASize: number, streamBSize: number, seed: number) {
    const { sketchA, sketchB } = buildRandomSketchPair(k, streamASize, streamBSize, seed);

    const union = computeUnion(sketchA, sketchB, k);
    const intersection = computeIntersection(sketchA, sketchB);
    const difference = computeDifference(sketchA, sketchB);

    return { sketchA, sketchB, union, intersection, difference };
}

export function useSetOperationsDemoData(k: number, streamASize: number, streamBSize: number, seed: number) {
    return useMemo(() => buildTwoSketches(k, streamASize, streamBSize, seed), [k, streamASize, streamBSize, seed]);
}
