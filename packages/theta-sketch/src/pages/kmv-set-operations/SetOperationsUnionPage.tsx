import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Fade, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';

import StepProgressIndicator from '../../components/StepProgressIndicator';
import {
    useSetOperationsDemoData,
} from './SetOperationsDemoShared';
import {
    ThetaBar,
    StepDots,
    ColorLegend,
    CountBadge,
    SKETCH_A_COLOR,
    SKETCH_B_COLOR,
    RESULT_COLOR,
} from '../../components/set-operations/SetOperationsVizShared';
import KmvUnion from './KmvUnion';

const UNION_VISUAL_STEPS = 5; // 0: intro, 1: sketch A, 2: sketch B, 3: merge+sort+take K, 4: union result

export default function SetOperationsUnionPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [k] = useState(12);
    const [streamASize] = useState(40);
    const [streamBSize] = useState(50);
    const [seed, setSeed] = useState(0);
    const [visualStep, setVisualStep] = useState(0);

    const { sketchA, sketchB, union } = useSetOperationsDemoData(k, streamASize, streamBSize, seed);
    const mergedSortedUnique = useMemo(() => {
        return [...new Set([...sketchA.values, ...sketchB.values])].sort((a, b) => a - b);
    }, [sketchA.values, sketchB.values]);
    const inferredThetaUnion = useMemo(() => (mergedSortedUnique.length >= k ? mergedSortedUnique[k - 1] : 1), [mergedSortedUnique, k]);

    const ValuesBox = ({ title, values, accentColor }: { title: string; values: number[]; accentColor: string }) => (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                borderRadius: 2,
                borderColor: alpha(theme.palette.divider, 0.5),
                borderLeft: `3px solid ${accentColor}`,
                background: alpha(theme.palette.background.paper, 0.25),
            }}
        >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
                {title}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {values.map((v, i) => (
                    <Box
                        key={i}
                        component="span"
                        sx={{
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            bgcolor: alpha(accentColor, 0.15),
                            border: `1px solid ${alpha(accentColor, 0.35)}`,
                            color: 'text.primary',
                        }}
                    >
                        {v.toFixed(3)}
                    </Box>
                ))}
            </Box>
        </Paper>
    );

    return (
        <>
            {/* <StepTitle title="KMV Set Operations: Union" /> */}
            <StepProgressIndicator currentStepId="set-operations" />

            <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
                <Stack spacing={3}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            borderColor: alpha(theme.palette.secondary.main, 0.3),
                            background: alpha(theme.palette.secondary.main, 0.02),
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                            KMV Set Operation: Union (A ∪ B)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                            Union is the easiest KMV set operation. We <strong>merge</strong> the values from two sketches, sort them, and keep the{' '}
                            <strong>K smallest</strong>. The result is still a valid KMV sketch because it again stores exactly K values.
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <ColorLegend />
                        </Box>
                        <Stack spacing={2}>
                            {/* Step-by-step explanation */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    borderColor: alpha(theme.palette.divider, 0.5),
                                    background: alpha(theme.palette.background.paper, 0.35),
                                }}
                            >
                                <Typography variant="overline" sx={{ letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                                    Step {visualStep + 1} of {UNION_VISUAL_STEPS}
                                </Typography>

                                {visualStep >= 0 && (
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                            This page demonstrates the KMV union operator
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                            We will build the union step by step: first show Sketch A, then Sketch B, then merge the stored values, and finally keep the{' '}
                                            K smallest values as the union sketch.
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                            Note: KMV stores only the <strong>K values</strong>. It does <strong>not</strong> store θ explicitly. If we show a cutoff line, it is{' '}
                                            <strong>inferred</strong> as the K-th smallest value of a list.
                                        </Typography>
                                    </Stack>
                                )}

                                {visualStep >= 1 && (
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                            Step 2: Sketch A (KMV)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                            Sketch A stores <strong>exactly K</strong> hash values (the K smallest from stream A). We do not need to talk about θ here — KMV keeps only values.
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            We will use these stored values as the input to the union operator.
                                        </Typography>
                                    </Stack>
                                )}

                                {visualStep >= 2 && (
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                            Step 3: Sketch B (KMV)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                            Sketch B also stores <strong>exactly K</strong> hash values (the K smallest from stream B). Again, KMV keeps only values.
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Next, we’ll merge the stored values from A and B.
                                        </Typography>
                                    </Stack>
                                )}

                                {visualStep >= 3 && (
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                            Step 4: Merge, unique, sort, take K smallest
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                            To compute union, we combine the stored values, remove duplicates, sort them, and keep the first K values.
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                            merged = sort(unique(valuesA ∪ valuesB))<br />
                                            union.values = merged[0..K-1]
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Merged unique count: {mergedSortedUnique.length}. The first K values are highlighted below.
                                        </Typography>
                                    </Stack>
                                )}

                                {visualStep >= 4 && (
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                            Step 5: Union result (still KMV)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                            The union sketch stores <strong>exactly K</strong> values again, so it is still a valid KMV sketch.
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                            If we display θ here, it is <strong>inferred</strong> as the K-th smallest value (the max of the stored K).
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                            inferred θ_union = {inferredThetaUnion.toFixed(3)} &nbsp;|&nbsp; N̂ = k/θ − 1 = {union.estimated.toFixed(2)}
                                        </Typography>
                                    </Stack>
                                )}
                            </Paper>

                            {/* Visuals for current step */}
                            {visualStep >= 1 && (
                                <Fade in={true}>
                                    <Box>
                                        <ThetaBar values={sketchA.values} theta={1} showTheta={false} color={SKETCH_A_COLOR} title="Sketch A (KMV) — stored K values" />
                                        <Typography variant="caption" color="text.secondary">
                                            KMV stores values only (no stored θ).
                                        </Typography>
                                        <Box sx={{ mt: 1.25 }}>
                                            <ValuesBox title={`Sketch A values (K = ${k})`} values={sketchA.values} accentColor={SKETCH_A_COLOR} />
                                        </Box>
                                    </Box>
                                </Fade>
                            )}

                            {visualStep >= 2 && (
                                <Fade in={true}>
                                    <Box>
                                        <ThetaBar values={sketchB.values} theta={1} showTheta={false} color={SKETCH_B_COLOR} title="Sketch B (KMV) — stored K values" />
                                        <Typography variant="caption" color="text.secondary">
                                            KMV stores values only (no stored θ).
                                        </Typography>
                                        <Box sx={{ mt: 1.25 }}>
                                            <ValuesBox title={`Sketch B values (K = ${k})`} values={sketchB.values} accentColor={SKETCH_B_COLOR} />
                                        </Box>
                                    </Box>
                                </Fade>
                            )}

                            {visualStep >= 3 && (
                                <Fade in={true}>
                                    <Box>
                                        <ThetaBar
                                            values={mergedSortedUnique}
                                            theta={inferredThetaUnion}
                                            showTheta
                                            highlightBelowTheta
                                            color={RESULT_COLOR}
                                            title="Merged values (unique + sorted) — keep the first K"
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            The cutoff line is the <strong>inferred</strong> K-th smallest of the merged list (not stored).
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                            {mergedSortedUnique.slice(0, 28).map((v, i) => {
                                                const isKept = i < k;
                                                return (
                                                    <Box
                                                        key={i}
                                                        component="span"
                                                        sx={{
                                                            px: 0.75,
                                                            py: 0.25,
                                                            borderRadius: 1,
                                                            fontSize: '0.75rem',
                                                            fontFamily: 'monospace',
                                                            bgcolor: isKept ? alpha(theme.palette.success.main, 0.18) : alpha(theme.palette.divider, 0.12),
                                                            border: `1px solid ${alpha(isKept ? theme.palette.success.main : theme.palette.divider, 0.35)}`,
                                                        }}
                                                    >
                                                        {v.toFixed(3)}
                                                    </Box>
                                                );
                                            })}
                                            {mergedSortedUnique.length > 28 && (
                                                <Typography variant="caption" color="text.secondary">
                                                    +{mergedSortedUnique.length - 28} more
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Fade>
                            )}

                            {visualStep >= 4 && (
                                <Fade in={true}>
                                    <Box>
                                        <ThetaBar
                                            values={union.values}
                                            theta={inferredThetaUnion}
                                            showTheta
                                            color={RESULT_COLOR}
                                            title="Union sketch (KMV) — exactly K values"
                                        />
                                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mt: 1 }}>
                                            <CountBadge label="|A|" count={sketchA.values.length} color={SKETCH_A_COLOR} />
                                            <CountBadge label="|B|" count={sketchB.values.length} color={SKETCH_B_COLOR} />
                                            <CountBadge label="|merged|" count={mergedSortedUnique.length} color={theme.palette.text.secondary} />
                                            <CountBadge label="|A ∪ B|" count={union.values.length} color={RESULT_COLOR} />
                                        </Stack>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                                            Union preserves KMV because the result stores exactly K values again.
                                        </Typography>
                                    </Box>
                                </Fade>
                            )}

                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <StepDots current={visualStep} total={UNION_VISUAL_STEPS} />
                                <Button size="small" variant="outlined" disabled={visualStep === 0} onClick={() => setVisualStep((s) => Math.max(0, s - 1))}>
                                    Previous step
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    disabled={visualStep >= UNION_VISUAL_STEPS - 1}
                                    onClick={() => setVisualStep((s) => Math.min(UNION_VISUAL_STEPS - 1, s + 1))}
                                >
                                    {visualStep >= UNION_VISUAL_STEPS - 1 ? 'Done' : 'Next step'}
                                </Button>
                                <Typography variant="caption" color="text.secondary">
                                    Step {visualStep + 1} of {UNION_VISUAL_STEPS}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button variant="outlined" onClick={() => setSeed((s) => s + 1)}>
                            New random example
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/set-operations-demo')}>
                            Back to Set Operations Demo
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/set-operations-demo/intersection')}>
                            Intersection
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/theta-sketch/set-operations-demo/difference')}>
                            Difference
                        </Button>
                        <Button variant="contained" onClick={() => navigate('/theta-sketch/theta-sketch')}>
                            Go to Theta Sketch
                        </Button>
                    </Box>
                </Stack>

              
            </Container>

            <KmvUnion />
        </>
    );
}

