import { Box, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';

export const SKETCH_A_COLOR = '#4CAF50';
export const SKETCH_B_COLOR = '#2196F3';
export const RESULT_COLOR = '#FFB74D';

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
                <Typography variant="caption" sx={{ color: colorA, fontWeight: 600, minWidth: 32 }}>
                    θ_A
                </Typography>
                <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
                    <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke={alpha(theme.palette.divider, 0.6)} strokeWidth={2} />
                    <line
                        x1={(thetaA / 1) * w}
                        y1={0}
                        x2={(thetaA / 1) * w}
                        y2={h}
                        stroke={colorA}
                        strokeWidth={2}
                        strokeDasharray="3 2"
                    />
                </svg>
                <Typography variant="caption" color="text.secondary">
                    {thetaA.toFixed(2)}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: colorB, fontWeight: 600, minWidth: 32 }}>
                    θ_B
                </Typography>
                <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
                    <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke={alpha(theme.palette.divider, 0.6)} strokeWidth={2} />
                    <line
                        x1={(thetaB / 1) * w}
                        y1={0}
                        x2={(thetaB / 1) * w}
                        y2={h}
                        stroke={colorB}
                        strokeWidth={2}
                        strokeDasharray="3 2"
                    />
                </svg>
                <Typography variant="caption" color="text.secondary">
                    {thetaB.toFixed(2)}
                </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                → min(θ_A, θ_B) = {minTheta.toFixed(2)}
            </Typography>
        </Stack>
    );
}

/** Color legend for Sketch A, B, Result, Below θ. */
export function ColorLegend({ showBelowTheta = false }: { showBelowTheta?: boolean }) {
    return (
        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: SKETCH_A_COLOR }} />
                <Typography variant="caption" color="text.secondary">
                    Sketch A
                </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: SKETCH_B_COLOR }} />
                <Typography variant="caption" color="text.secondary">
                    Sketch B
                </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: RESULT_COLOR }} />
                <Typography variant="caption" color="text.secondary">
                    Result
                </Typography>
            </Stack>
            {showBelowTheta && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: 1,
                            bgcolor: alpha(SKETCH_A_COLOR, 0.3),
                            border: '1px dashed #999',
                        }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        Below θ (shaded)
                    </Typography>
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
    showTheta = true,
    highlightBelowTheta = false,
    onlyBelowTheta = false,
    height = 44,
}: {
    values: number[];
    theta: number;
    color: string;
    title: string;
    showTheta?: boolean;
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
                    <line
                        x1={padding}
                        y1={padding + height / 2}
                        x2={width - padding}
                        y2={padding + height / 2}
                        stroke={alpha(theme.palette.divider, 0.6)}
                        strokeWidth={2}
                    />
                    {showTheta && highlightBelowTheta && theta > 0 && (
                        <rect
                            x={padding}
                            y={padding}
                            width={((theta || 0) / 1) * (width - padding * 2)}
                            height={height}
                            fill={alpha(color, 0.15)}
                            rx={2}
                        />
                    )}
                    {showTheta && (
                        <line
                            x1={padding + (theta / 1) * (width - padding * 2)}
                            y1={padding}
                            x2={padding + (theta / 1) * (width - padding * 2)}
                            y2={padding + height}
                            stroke={color}
                            strokeWidth={2}
                            strokeDasharray="4 2"
                        />
                    )}
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
                    <Typography variant="caption" color="text.secondary">
                        0
                    </Typography>
                    <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
                        {showTheta ? `θ = ${theta.toFixed(2)}` : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        1
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

