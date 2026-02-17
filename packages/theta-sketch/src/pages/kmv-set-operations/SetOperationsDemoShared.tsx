import { useMemo } from 'react';
import { Box, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';

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
    const rngA = mulberry32(seed * 1000 + 1);
    const hashesA = new Set<number>();
    while (hashesA.size < Math.min(streamASize, 500)) {
        hashesA.add(Math.round(rngA() * 1000) / 1000);
    }
    const sortedA = Array.from(hashesA).sort((a, b) => a - b);
    const valuesA = sortedA.slice(0, k);
    const thetaA = valuesA.length >= k ? valuesA[k - 1] : 1;
    const sketchA = { values: valuesA, theta: thetaA };

    const rngB = mulberry32(seed * 1000 + 2);
    const hashesB = new Set<number>();
    while (hashesB.size < Math.min(streamBSize, 500)) {
        hashesB.add(Math.round(rngB() * 1000) / 1000);
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

export function SetCard({
    title,
    values,
    theta,
    estimated,
    formula,
    color,
    subtitle,
}: {
    title: string;
    values: number[];
    theta: number;
    estimated: number;
    formula: string;
    color: string;
    subtitle?: string;
}) {
    const theme = useTheme();
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderColor: alpha(theme.palette.divider, 0.5),
                borderLeft: `4px solid ${color}`,
            }}
        >
            <Typography variant="subtitle1" fontWeight={600} sx={{ color, mb: 0.5 }}>
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {subtitle}
                </Typography>
            )}
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                θ = {theta.toFixed(3)} &nbsp;|&nbsp; N̂ = {estimated.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                {formula}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {values.slice(0, 24).map((v, i) => (
                    <Box
                        key={i}
                        component="span"
                        sx={{
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: alpha(color, 0.15),
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                        }}
                    >
                        {v.toFixed(3)}
                    </Box>
                ))}
                {values.length > 24 && (
                    <Typography variant="caption" color="text.secondary">
                        +{values.length - 24} more
                    </Typography>
                )}
            </Box>
        </Paper>
    );
}

export function NewThetaLimitNote({
    correctTheta,
    resultValues,
    operationLabel,
}: {
    correctTheta: number;
    resultValues: number[];
    operationLabel: string;
}) {
    const theme = useTheme();
    const inferredTheta = resultValues.length > 0 ? Math.max(...resultValues) : null;
    const showLimit = inferredTheta !== null && inferredTheta < correctTheta;

    return (
        <Box
            sx={{
                p: 1.5,
                pl: 2,
                borderRadius: 1,
                borderLeft: `3px solid ${alpha(theme.palette.warning.main, 0.7)}`,
                backgroundColor: alpha(theme.palette.warning.main, 0.06),
            }}
        >
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', display: 'block', mb: 0.5 }}>
                New θ after {operationLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                Correct θ (for further set ops) = min(θ_A, θ_B) = <strong>{correctTheta.toFixed(3)}</strong>
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: 'monospace', fontSize: '0.85rem', mt: 0.5 }}
            >
                If KMV (no stored θ): inferred θ = max(result values) = <strong>{inferredTheta !== null ? inferredTheta.toFixed(3) : 'N/A'}</strong>
            </Typography>
            {showLimit ? (
                <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5, fontWeight: 500 }}>
                    Inferred θ &lt; correct θ → we lose the threshold. Must save θ (Theta Sketch) to do further set ops.
                </Typography>
            ) : inferredTheta !== null ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Inferred θ = correct θ here; in general inferred ≤ correct. Must save θ for further set ops.
                </Typography>
            ) : null}
        </Box>
    );
}

export function LimitSection() {
    const theme = useTheme();
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 3,
                borderColor: alpha(theme.palette.primary.main, 0.2),
                background: alpha(theme.palette.primary.main, 0.02),
            }}
        >
            <Typography
                variant="subtitle1"
                sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    fontSize: '0.95rem',
                }}
            >
                The limit of KMV intersection and difference
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                We used θ = min(θ_A, θ_B) to compute this result. But here is the problem.
            </Typography>

            <Stack spacing={2}>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        1. KMV does not store θ.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        A KMV sketch only stores the K values. The threshold θ is never saved — we infer it as the max of those K values when we need it. So the “result” of intersection or difference, if we keep it as KMV, is just a set of values (often fewer than K). We have no place to store “θ = min(θ_A, θ_B)” in that result.
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        2. The result cannot do set operations again.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        If we take that result and try to use it in another intersection or difference, we would have to guess θ from the result. The only thing we can get from the result’s values is <strong>max(result values)</strong>. That number is at most min(θ_A, θ_B), and in general it is <strong>smaller</strong> than min(θ_A, θ_B). So we lose the correct threshold. With the wrong θ, any further set operation would be wrong. That is the <strong>limit of KMV</strong>.
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        3. We should save θ — and that gives us Theta Sketch.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        To fix this we need to <strong>save θ</strong> in the result. The correct θ for the result is min(θ_A, θ_B). Once we save θ explicitly together with the values below it, the result is no longer “just KMV” — it becomes a <strong>Theta Sketch</strong>. So saving θ is the natural fix for composable set operations, and that step is exactly what turns KMV into Theta Sketch.
                    </Typography>
                </Box>
            </Stack>
            <Box
                sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                }}
            >
                <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.9rem' }}>
                    <strong>Summary:</strong> KMV intersection and difference hit a limit — the result cannot be used in further set operations because θ is not stored. Saving θ in the result fixes that and naturally leads to Theta Sketch.
                </Typography>
            </Box>
        </Paper>
    );
}

