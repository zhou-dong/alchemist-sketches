import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Paper, Slider, Stack, Typography, alpha, useTheme } from '@mui/material';

import StepTitle from '../components/StepTitle';
import StepProgressIndicator from '../components/StepProgressIndicator';
import { useThetaSketchProgress } from '../contexts/ThetaSketchProgressContext';

import {
    ColorLegend,
    CountBadge,
    RESULT_COLOR,
    SKETCH_A_COLOR,
    SKETCH_B_COLOR,
    ThetaBar,
} from '../components/set-operations/SetOperationsVizShared';

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

function buildThetaSketchValues(streamSize: number, theta: number, seed: number) {
    const rng = mulberry32(seed);
    const hashes = new Set<number>();
    while (hashes.size < Math.min(streamSize, 800)) {
        // Use 3 decimals to keep visuals readable and duplicates plausible
        hashes.add(Math.round(rng() * 1000) / 1000);
    }
    const values = Array.from(hashes)
        .filter((v) => v < theta)
        .sort((a, b) => a - b);
    return values;
}

function setUnion(a: number[], b: number[]) {
    return Array.from(new Set([...a, ...b])).sort((x, y) => x - y);
}
function setIntersection(a: number[], b: number[]) {
    const sb = new Set(b);
    return a.filter((x) => sb.has(x)).sort((x, y) => x - y);
}
function setDifference(a: number[], b: number[]) {
    const sb = new Set(b);
    return a.filter((x) => !sb.has(x)).sort((x, y) => x - y);
}

export default function ThetaSketchSetOperationsPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { completeStep } = useThetaSketchProgress();

    const [seed, setSeed] = useState(1);
    const [streamASize, setStreamASize] = useState(80);
    const [streamBSize, setStreamBSize] = useState(110);
    const [thetaA, setThetaA] = useState(0.62);
    const [thetaB, setThetaB] = useState(0.45);

    const theta = Math.min(thetaA, thetaB);

    const { valuesA, valuesB, filteredA, filteredB, union, intersection, difference } = useMemo(() => {
        const valuesAAll = buildThetaSketchValues(streamASize, thetaA, seed * 1000 + 1);
        const valuesBAll = buildThetaSketchValues(streamBSize, thetaB, seed * 1000 + 2);

        // In Theta Sketch set ops, we must operate on a shared θ = min(θ_A, θ_B)
        const a = valuesAAll.filter((v) => v < theta);
        const b = valuesBAll.filter((v) => v < theta);

        const unionValues = setUnion(a, b);
        const intersectionValues = setIntersection(a, b);
        const differenceValues = setDifference(a, b);

        return {
            valuesA: valuesAAll,
            valuesB: valuesBAll,
            filteredA: a,
            filteredB: b,
            union: unionValues,
            intersection: intersectionValues,
            difference: differenceValues,
        };
    }, [seed, streamASize, streamBSize, thetaA, thetaB, theta]);

    const estimate = (count: number) => (theta > 0 ? count / theta : 0);

    return (
        <>
            <StepTitle title="Theta Sketch: set operations" />
            <StepProgressIndicator currentStepId="theta-sketch-set-ops" />

            <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
                <Stack spacing={3}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            borderColor: alpha(theme.palette.primary.main, 0.25),
                            background: alpha(theme.palette.primary.main, 0.03),
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                            The rule that makes everything composable
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            For any set operation between two Theta Sketches, first use a <strong>shared threshold</strong>:
                            <br />
                            <strong>θ = min(θ_A, θ_B)</strong>
                            <br />
                            Then filter both sketches to values below θ, perform the set op on those values, and estimate with:
                            <br />
                            <strong>N̂ = |retained| / θ</strong>
                        </Typography>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                            Controls
                        </Typography>
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    θ_A = {thetaA.toFixed(2)}
                                </Typography>
                                <Slider
                                    value={thetaA}
                                    min={0.05}
                                    max={0.95}
                                    step={0.01}
                                    onChange={(_, v) => setThetaA(v as number)}
                                />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    θ_B = {thetaB.toFixed(2)}
                                </Typography>
                                <Slider
                                    value={thetaB}
                                    min={0.05}
                                    max={0.95}
                                    step={0.01}
                                    onChange={(_, v) => setThetaB(v as number)}
                                />
                            </Box>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Stream A size: {streamASize}
                                    </Typography>
                                    <Slider
                                        value={streamASize}
                                        min={20}
                                        max={300}
                                        step={1}
                                        onChange={(_, v) => setStreamASize(v as number)}
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Stream B size: {streamBSize}
                                    </Typography>
                                    <Slider
                                        value={streamBSize}
                                        min={20}
                                        max={300}
                                        step={1}
                                        onChange={(_, v) => setStreamBSize(v as number)}
                                    />
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
                                <Button variant="outlined" onClick={() => setSeed((s) => s + 1)}>
                                    New random example
                                </Button>
                                <Button variant="outlined" onClick={() => navigate('/theta-sketch/theta-sketch')}>
                                    Back to Theta sketch intro
                                </Button>
                                <Button variant="outlined" onClick={() => navigate('/theta-sketch/set-operations-demo')}>
                                    Contrast: KMV set-ops demos
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                            Visual: filter to shared θ, then operate
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <ColorLegend showBelowTheta />
                        </Box>

                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                θ = min(θ_A, θ_B) = <strong>{theta.toFixed(3)}</strong>
                            </Typography>

                            <ThetaBar
                                values={valuesA}
                                theta={thetaA}
                                color={SKETCH_A_COLOR}
                                title={`Theta Sketch A — θ_A = ${thetaA.toFixed(2)}`}
                                highlightBelowTheta
                            />
                            <ThetaBar
                                values={valuesB}
                                theta={thetaB}
                                color={SKETCH_B_COLOR}
                                title={`Theta Sketch B — θ_B = ${thetaB.toFixed(2)}`}
                                highlightBelowTheta
                            />

                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                <CountBadge label="|A < θ|" count={filteredA.length} color={SKETCH_A_COLOR} />
                                <CountBadge label="|B < θ|" count={filteredB.length} color={SKETCH_B_COLOR} />
                                <CountBadge label="|A ∪ B|" count={union.length} color={RESULT_COLOR} />
                                <CountBadge label="|A ∩ B|" count={intersection.length} color={RESULT_COLOR} />
                                <CountBadge label="|A ∖ B|" count={difference.length} color={RESULT_COLOR} />
                            </Stack>
                        </Stack>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                            Results (retained values and estimates)
                        </Typography>
                        <Stack spacing={2}>
                            <Paper
                                variant="outlined"
                                sx={{ p: 2, borderColor: alpha(theme.palette.divider, 0.6) }}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                    Union (A ∪ B)
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                    N̂ ≈ |A ∪ B| / θ = {union.length} / {theta.toFixed(3)} ={' '}
                                    <strong>{estimate(union.length).toFixed(2)}</strong>
                                </Typography>
                            </Paper>

                            <Paper
                                variant="outlined"
                                sx={{ p: 2, borderColor: alpha(theme.palette.divider, 0.6) }}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                    Intersection (A ∩ B)
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                    N̂ ≈ |A ∩ B| / θ = {intersection.length} / {theta.toFixed(3)} ={' '}
                                    <strong>{estimate(intersection.length).toFixed(2)}</strong>
                                </Typography>
                            </Paper>

                            <Paper
                                variant="outlined"
                                sx={{ p: 2, borderColor: alpha(theme.palette.divider, 0.6) }}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                    Difference (A ∖ B)
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                    N̂ ≈ |A ∖ B| / θ = {difference.length} / {theta.toFixed(3)} ={' '}
                                    <strong>{estimate(difference.length).toFixed(2)}</strong>
                                </Typography>
                            </Paper>

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    onClick={() => completeStep('theta-sketch-set-ops')}
                                >
                                    Mark step complete
                                </Button>
                                <Button variant="outlined" onClick={() => navigate('/sketches')}>
                                    Back to Sketches
                                </Button>
                            </Box>
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </>
    );
}

