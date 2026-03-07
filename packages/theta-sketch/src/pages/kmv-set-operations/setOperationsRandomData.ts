import type { SketchData } from './setOperationsCompute';

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

function generateRandomUniqueValues(size: number, seed: number): number[] {
    const PRECISION = 2;
    const SCALE = 10 ** PRECISION;
    // With rounding, possible unique values are 0.01 .. 1.00 (inclusive) => SCALE.
    // (We intentionally exclude 0.00 so visuals never pin at the left boundary.)
    const MAX_UNIQUE = SCALE;

    const rng = mulberry32(seed);
    const values = new Set<number>();
    while (values.size < Math.min(size, 500, MAX_UNIQUE)) {
        const v = Math.round(rng() * SCALE) / SCALE;
        if (v === 0) continue;
        values.add(v);
    }
    return Array.from(values).sort((a, b) => a - b);
}

function buildSketchFromStream(sortedStreamValues: number[], k: number): SketchData {
    const sketchValues = sortedStreamValues.slice(0, k);
    const theta = sketchValues.length >= k ? sketchValues[k - 1] : 1;
    return { values: sketchValues, theta };
}

export function buildRandomSketchPair(
    k: number,
    streamASize: number,
    streamBSize: number,
    seed: number
): { sketchA: SketchData; sketchB: SketchData } {
    const sortedA = generateRandomUniqueValues(streamASize, seed * 1000 + 1);
    const sortedB = generateRandomUniqueValues(streamBSize, seed * 1000 + 2);
    const sketchA = buildSketchFromStream(sortedA, k);
    const sketchB = buildSketchFromStream(sortedB, k);
    return { sketchA, sketchB };
}
