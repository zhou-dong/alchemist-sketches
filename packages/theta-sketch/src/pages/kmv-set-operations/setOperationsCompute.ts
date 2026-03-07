export interface SketchData {
    values: number[];
    theta: number;
}

export interface SketchOpResult extends SketchData {
    estimated: number;
}

// KMV Union: merge the two K-value sets, sort, take exactly K smallest; θ = K-th value
export function computeUnion(
    sketchA: SketchData,
    sketchB: SketchData,
    k: number
): SketchOpResult {
    const combined = [...new Set([...sketchA.values, ...sketchB.values])].sort((a, b) => a - b);
    const unionK = combined.slice(0, k);
    const theta = unionK.length >= k ? unionK[k - 1] : 1;
    const estimated = theta > 0 ? k / theta - 1 : 0;
    return { values: unionK, theta, estimated };
}

// KMV Intersection: θ = min(θ_A, θ_B); among the K values from each sketch, count those in both below θ
export function computeIntersection(
    sketchA: SketchData,
    sketchB: SketchData
): SketchOpResult {
    const theta = Math.min(sketchA.theta, sketchB.theta);
    const belowA = new Set(sketchA.values.filter((v) => v < theta));
    const belowB = sketchB.values.filter((v) => v < theta);
    const intersection = belowB.filter((v) => belowA.has(v));
    const estimated = theta > 0 ? intersection.length / theta : 0;
    return { values: intersection.sort((a, b) => a - b), theta, estimated };
}

// KMV Difference: θ = min(θ_A, θ_B); among the K values, count those in A but not in B below θ
export function computeDifference(
    sketchA: SketchData,
    sketchB: SketchData
): SketchOpResult {
    const theta = Math.min(sketchA.theta, sketchB.theta);
    const belowB = new Set(sketchB.values.filter((v) => v < theta));
    const belowA = sketchA.values.filter((v) => v < theta);
    const difference = belowA.filter((v) => !belowB.has(v));
    const estimated = theta > 0 ? difference.length / theta : 0;
    return { values: difference.sort((a, b) => a - b), theta, estimated };
}
