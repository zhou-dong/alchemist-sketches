import { useMemo } from 'react';

// KMV Union: merge the two K-value sets, sort, take exactly K smallest; θ = K-th value
export function computeUnion(
    sketchA: { values: number[]; theta: number },
    sketchB: { values: number[]; theta: number },
    k: number
): { values: number[]; theta: number; estimated: number } {
    const combined = [...new Set([...sketchA.values, ...sketchB.values])].sort((a, b) => a - b);
    const unionK = combined.slice(0, k);
    const theta = unionK.length >= k ? unionK[k - 1] : 1;
    const estimated = theta > 0 ? k / theta - 1 : 0;
    return { values: unionK, theta, estimated };
}

// KMV Intersection: θ = min(θ_A, θ_B); among the K values from each sketch, count those in both below θ
export function computeIntersection(
    sketchA: { values: number[]; theta: number },
    sketchB: { values: number[]; theta: number }
): { values: number[]; theta: number; estimated: number } {
    const theta = Math.min(sketchA.theta, sketchB.theta);
    const belowA = new Set(sketchA.values.filter((v) => v < theta));
    const belowB = sketchB.values.filter((v) => v < theta);
    const intersection = belowB.filter((v) => belowA.has(v));
    const estimated = theta > 0 ? intersection.length / theta : 0;
    return { values: intersection.sort((a, b) => a - b), theta, estimated };
}

// KMV Difference: θ = min(θ_A, θ_B); among the K values, count those in A but not in B below θ
export function computeDifference(
    sketchA: { values: number[]; theta: number },
    sketchB: { values: number[]; theta: number }
): { values: number[]; theta: number; estimated: number } {
    const theta = Math.min(sketchA.theta, sketchB.theta);
    const belowB = new Set(sketchB.values.filter((v) => v < theta));
    const belowA = sketchA.values.filter((v) => v < theta);
    const difference = belowA.filter((v) => !belowB.has(v));
    const estimated = theta > 0 ? difference.length / theta : 0;
    return { values: difference.sort((a, b) => a - b), theta, estimated };
}

function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}


export function buildTwoSketches(k: number, streamASize: number, streamBSize: number, seed: number) {
    const PRECISION = 2;
    const SCALE = 10 ** PRECISION;
    // With rounding, possible unique values are 0.01 .. 1.00 (inclusive) => SCALE.
    // (We intentionally exclude 0.00 so visuals never pin at the left boundary.)
    const MAX_UNIQUE = SCALE;

    const rngA = mulberry32(seed * 1000 + 1);
    const hashesA = new Set<number>();
    while (hashesA.size < Math.min(streamASize, 500, MAX_UNIQUE)) {
        const v = Math.round(rngA() * SCALE) / SCALE;
        if (v === 0) continue;
        hashesA.add(v);
    }
    const sortedA = Array.from(hashesA).sort((a, b) => a - b);
    const valuesA = sortedA.slice(0, k);
    const thetaA = valuesA.length >= k ? valuesA[k - 1] : 1;
    const sketchA = { values: valuesA, theta: thetaA };

    const rngB = mulberry32(seed * 1000 + 2);
    const hashesB = new Set<number>();
    while (hashesB.size < Math.min(streamBSize, 500, MAX_UNIQUE)) {
        const v = Math.round(rngB() * SCALE) / SCALE;
        if (v === 0) continue;
        hashesB.add(v);
    }
    const sortedB = Array.from(hashesB).sort((a, b) => a - b);
    const valuesB = sortedB.slice(0, k);
    const thetaB = valuesB.length >= k ? valuesB[k - 1] : 1;
    const sketchB = { values: valuesB, theta: thetaB };

    const union = computeUnion(sketchA, sketchB, k);
    const intersection = computeIntersection(sketchA, sketchB);
    const difference = computeDifference(sketchA, sketchB);

    return { sketchA, sketchB, union, intersection, difference };
}

export function useSetOperationsDemoData(k: number, streamASize: number, streamBSize: number, seed: number) {
    return useMemo(() => buildTwoSketches(k, streamASize, streamBSize, seed), [k, streamASize, streamBSize, seed]);
}
