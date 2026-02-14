import { useMemo } from 'react';
import { Box, Chip, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';

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

export const SKETCH_A_COLOR = '#4CAF50';
export const SKETCH_B_COLOR = '#2196F3';
export const RESULT_COLOR = '#FFB74D';

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

/** Step progress dots (1-based). */
export function StepDots({ current, total }: { current: number; total: number }) {
    const theme = useTheme();
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            {Array.from({ length: total }, (_, i) => (
                <Box
                    key={i}
                    sx={{
                        width: i === current ? 20 : 10,
                        height: 10,
                        borderRadius: 5,
                        bgcolor: i <= current ? theme.palette.primary.main : alpha(theme.palette.divider, 0.5),
                        transition: 'all 0.3s ease',
                    }}
                />
            ))}
        </Stack>
    );
}

/** Small count badge with label. */
export function CountBadge({ label, count, color }: { label: string; count: number; color: string }) {
    return (
        <Chip
            size="small"
            label={`${label} = ${count}`}
            sx={{
                bgcolor: alpha(color, 0.15),
                color,
                fontWeight: 600,
                border: `1px solid ${alpha(color, 0.4)}`,
            }}
        />
    );
}

/** Mini visual: θ_A, θ_B, min(θ_A, θ_B) with bars. */
export function ThetaCompareMini({
    thetaA,
    thetaB,
    colorA,
    colorB,
}: {
    thetaA: number;
    thetaB: number;
    colorA: string;
    colorB: string;
}) {
    const theme = useTheme();
    const minTheta = Math.min(thetaA, thetaB);
    const w = 120;
    const h = 28;

    return (
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: colorA, fontWeight: 600, minWidth: 32 }}>θ_A</Typography>
                <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
                    <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke={alpha(theme.palette.divider, 0.6)} strokeWidth={2} />
                    <line x1={(thetaA / 1) * w} y1={0} x2={(thetaA / 1) * w} y2={h} stroke={colorA} strokeWidth={2} strokeDasharray="3 2" />
                </svg>
                <Typography variant="caption" color="text.secondary">{thetaA.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: colorB, fontWeight: 600, minWidth: 32 }}>θ_B</Typography>
                <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
                    <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke={alpha(theme.palette.divider, 0.6)} strokeWidth={2} />
                    <line x1={(thetaB / 1) * w} y1={0} x2={(thetaB / 1) * w} y2={h} stroke={colorB} strokeWidth={2} strokeDasharray="3 2" />
                </svg>
                <Typography variant="caption" color="text.secondary">{thetaB.toFixed(2)}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>→ min(θ_A, θ_B) = {minTheta.toFixed(2)}</Typography>
        </Stack>
    );
}

/** Color legend for Sketch A, B, Result, Below θ. */
export function ColorLegend({ showBelowTheta = false }: { showBelowTheta?: boolean }) {
    return (
        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: SKETCH_A_COLOR }} />
                <Typography variant="caption" color="text.secondary">Sketch A</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: SKETCH_B_COLOR }} />
                <Typography variant="caption" color="text.secondary">Sketch B</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: RESULT_COLOR }} />
                <Typography variant="caption" color="text.secondary">Result</Typography>
            </Stack>
            {showBelowTheta && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: alpha(SKETCH_A_COLOR, 0.3), border: '1px dashed #999' }} />
                    <Typography variant="caption" color="text.secondary">Below θ (shaded)</Typography>
                </Stack>
            )}
        </Stack>
    );
}

/** Horizontal bar 0–1 with dots at values and a vertical line at θ. Optional highlight for "below θ". */
export function ThetaBar({
    values,
    theta,
    color,
    title,
    highlightBelowTheta = false,
    onlyBelowTheta = false,
    height = 44,
}: {
    values: number[];
    theta: number;
    color: string;
    title: string;
    highlightBelowTheta?: boolean;
    onlyBelowTheta?: boolean;
    height?: number;
}) {
    const theme = useTheme();
    const displayValues = onlyBelowTheta ? values.filter((v) => v < theta) : values;
    const padding = 8;
    const width = 400;

    return (
        <Box sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color, display: 'block', mb: 0.5 }}>
                {title}
            </Typography>
            <Box sx={{ position: 'relative', width: '100%', maxWidth: width, height: height + padding * 2 }}>
                <svg
                    width="100%"
                    height={height + padding * 2}
                    viewBox={`0 0 ${width} ${height + padding * 2}`}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ overflow: 'visible' }}
                >
                    {/* Background bar 0–1 */}
                    <line
                        x1={padding}
                        y1={padding + height / 2}
                        x2={width - padding}
                        y2={padding + height / 2}
                        stroke={alpha(theme.palette.divider, 0.6)}
                        strokeWidth={2}
                    />
                    {/* Below-θ region highlight */}
                    {highlightBelowTheta && theta > 0 && (
                        <rect
                            x={padding}
                            y={padding}
                            width={((theta || 0) / 1) * (width - padding * 2)}
                            height={height}
                            fill={alpha(color, 0.15)}
                            rx={2}
                        />
                    )}
                    {/* θ line */}
                    <line
                        x1={padding + (theta / 1) * (width - padding * 2)}
                        y1={padding}
                        x2={padding + (theta / 1) * (width - padding * 2)}
                        y2={padding + height}
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray="4 2"
                    />
                    {/* Dots at each value */}
                    {displayValues.map((v, i) => (
                        <circle
                            key={i}
                            cx={padding + (v / 1) * (width - padding * 2)}
                            cy={padding + height / 2}
                            r={5}
                            fill={color}
                            stroke={theme.palette.background.paper}
                            strokeWidth={1}
                        />
                    ))}
                </svg>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">0</Typography>
                    <Typography variant="caption" sx={{ color, fontWeight: 600 }}>θ = {theta.toFixed(2)}</Typography>
                    <Typography variant="caption" color="text.secondary">1</Typography>
                </Box>
            </Box>
        </Box>
    );
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
    return useMemo(
        () => buildTwoSketches(k, streamASize, streamBSize, seed),
        [k, streamASize, streamBSize, seed]
    );
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
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', mt: 0.5 }}>
                If KMV (no stored θ): inferred θ = max(result values) ={' '}
                <strong>{inferredTheta !== null ? inferredTheta.toFixed(3) : 'N/A'}</strong>
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
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>1. KMV does not store θ.</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        A KMV sketch only stores the K values. The threshold θ is never saved — we infer it as the max of those K values when we need it. So the “result” of intersection or difference, if we keep it as KMV, is just a set of values (often fewer than K). We have no place to store “θ = min(θ_A, θ_B)” in that result.
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>2. The result cannot do set operations again.</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        If we take that result and try to use it in another intersection or difference, we would have to guess θ from the result. The only thing we can get from the result’s values is <strong>max(result values)</strong>. That number is at most min(θ_A, θ_B), and in general it is <strong>smaller</strong> than min(θ_A, θ_B). So we lose the correct threshold. With the wrong θ, any further set operation would be wrong. That is the <strong>limit of KMV</strong>.
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>3. We should save θ — and that gives us Theta Sketch.</Typography>
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
